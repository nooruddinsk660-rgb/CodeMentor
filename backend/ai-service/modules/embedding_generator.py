import numpy as np
from sentence_transformers import SentenceTransformer
import logging
from typing import List, Union

logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    """Generate embeddings for skills using sentence transformers"""
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize the embedding generator
        
        Args:
            model_name: Name of the sentence transformer model to use
        """
        self.model_name = model_name
        self._model = None   # ✅ renamed to avoid reserved prefix conflict
        
    def load_model(self):
        """Load the sentence transformer model"""
        try:
            logger.info(f"Loading model: {self.model_name}")
            self._model = SentenceTransformer(self.model_name)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def generate_embedding(self, text: Union[str, List[str]]) -> np.ndarray:
        """
        Generate embedding vector for text
        
        Args:
            text: Input text or list of texts
            
        Returns:
            numpy array of embedding vectors
        """
        if self._model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Generate embedding
            embedding = self._model.encode(text, convert_to_numpy=True)
            
            # Normalize the embedding
            if len(embedding.shape) == 1:
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding = embedding / norm
            else:
                norms = np.linalg.norm(embedding, axis=1, keepdims=True)
                embedding = embedding / np.maximum(norms, 1e-10)
            
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def batch_generate_embeddings(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """
        Generate embeddings for multiple texts in batches
        
        Args:
            texts: List of input texts
            batch_size: Batch size for processing
            
        Returns:
            numpy array of embedding vectors
        """
        if self._model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            embeddings = self._model.encode(
                texts,
                batch_size=batch_size,
                convert_to_numpy=True,
                show_progress_bar=False
            )
            
            # Normalize embeddings
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            embeddings = embeddings / np.maximum(norms, 1e-10)
            
            return embeddings
        except Exception as e:
            logger.error(f"Error in batch embedding generation: {e}")
            raise
    
    def calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            similarity = np.dot(embedding1, embedding2) / (
                np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
            )
            return float(max(0.0, min(1.0, similarity)))
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0
