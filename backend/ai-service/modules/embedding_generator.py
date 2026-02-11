import logging
import os
import time
import google.generativeai as genai
import numpy as np
from typing import List, Union
from google.api_core import exceptions as google_exceptions

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    Robust Token Bucket-style Rate Limiter for Gemini Free Tier.
    Limits: 15 Requests Per Minute (RPM) -> 1 req / 4 seconds.
    """
    def __init__(self, requests_per_minute=10): # Safe buffer (10 < 15)
        self.period = 60.0 / requests_per_minute
        self.last_request_time = 0

    def wait_for_token(self):
        """Blocks until a token is available to ensure we don't hit 429s."""
        now = time.time()
        time_since_last = now - self.last_request_time
        
        if time_since_last < self.period:
            sleep_time = self.period - time_since_last
            logger.info(f"Rate Limiter: Throttling for {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()

class EmbeddingGenerator:
    """Generate embeddings using Google Gemini API with robust error handling"""
    
    def __init__(self, model_name: str = 'models/text-embedding-004'):
        self.model_name = model_name
        self.api_key = os.getenv("GEMINI_API_KEY")
        # Initialize Rate Limiter with strict safety margin
        self.rate_limiter = RateLimiter(requests_per_minute=10)
        
        if not self.api_key:
            logger.error("CRITICAL: GEMINI_API_KEY not found! AI features will be disabled.")
        else:
            genai.configure(api_key=self.api_key)

    def load_model(self):
        """Compatibility method - checks connection."""
        if not self.api_key:
            return
        logger.info(f"Gemini API Configured. Model: {self.model_name}")

    def _normalize(self, embedding: np.ndarray) -> np.ndarray:
        """
        L2 Normalization - Essential for Cosine Similarity.
        Restores 'Logic' from previous SentenceTransformer implementation.
        """
        if len(embedding.shape) == 1:
            norm = np.linalg.norm(embedding)
            if norm > 0:
                return embedding / norm
        else:
            # Batch normalization
            norms = np.linalg.norm(embedding, axis=1, keepdims=True)
            return embedding / np.maximum(norms, 1e-10)
        return embedding

    def generate_embedding(self, text: Union[str, List[str]], retries=3) -> np.ndarray:
        """
        Generate embedding with Rate Limiting, Retries, and Normalization.
        """
        if not self.api_key:
            logger.warning("No API Key - Using Mock Embeddings")
            return self._get_mock_embedding(len(text) if isinstance(text, list) else 1)

        for attempt in range(retries):
            try:
                self.rate_limiter.wait_for_token()
                
                # Call Google Gemini API
                result = genai.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="semantic_similarity"
                )
                
                # Extract and Normalize
                raw_embedding = np.array(result['embedding'])
                return self._normalize(raw_embedding)

            except google_exceptions.ResourceExhausted:
                wait_time = (attempt + 1) * 5 # Exponential backoff: 5s, 10s, 15s
                logger.warning(f"Quota Exceeded (429). Retrying in {wait_time}s...")
                time.sleep(wait_time)
            except Exception as e:
                logger.error(f"Gemini API Error (Attempt {attempt+1}/{retries}): {e}")
                if attempt == retries - 1:
                    break # Give up after retries
        
        # Fallback if all retries fail
        logger.error("All retries failed. Returning MOCK embedding to keep service alive.")
        return self._get_mock_embedding(len(text) if isinstance(text, list) else 1)

    def batch_generate_embeddings(self, texts: List[str], batch_size: int = 10) -> np.ndarray:
        """Batch generation wrapper (Gemini handles batching natively to some extent)"""
        # We pass directly to generate_embedding which handles lists
        return self.generate_embedding(texts)

    def calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Cosine similarity"""
        try:
            return float(np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2)))
        except Exception:
            return 0.0

    def _get_mock_embedding(self, count=1):
        # Gemini embeddings are 768 dim usually
        dim = 768
        if count == 1:
            return np.random.rand(dim)
        return np.random.rand(count, dim)
