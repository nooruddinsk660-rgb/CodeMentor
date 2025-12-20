import numpy as np
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Calculate cosine similarity between two vectors
    
    Args:
        vec1: First vector
        vec2: Second vector
        
    Returns:
        Similarity score between -1 and 1
    """
    try:
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        return float(similarity)
    except Exception as e:
        logger.error(f"Error calculating cosine similarity: {e}")
        return 0.0

def euclidean_distance(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculate Euclidean distance between two vectors"""
    try:
        return float(np.linalg.norm(vec1 - vec2))
    except Exception as e:
        logger.error(f"Error calculating Euclidean distance: {e}")
        return float('inf')

def normalize_vector(vec: np.ndarray) -> np.ndarray:
    """Normalize a vector to unit length"""
    try:
        norm = np.linalg.norm(vec)
        if norm == 0:
            return vec
        return vec / norm
    except Exception as e:
        logger.error(f"Error normalizing vector: {e}")
        return vec

def batch_cosine_similarity(embeddings1: np.ndarray, embeddings2: np.ndarray) -> np.ndarray:
    """
    Calculate cosine similarity between two batches of embeddings
    
    Args:
        embeddings1: First batch of embeddings (N x D)
        embeddings2: Second batch of embeddings (M x D)
        
    Returns:
        Similarity matrix (N x M)
    """
    try:
        # Normalize embeddings
        norms1 = np.linalg.norm(embeddings1, axis=1, keepdims=True)
        norms2 = np.linalg.norm(embeddings2, axis=1, keepdims=True)
        
        normalized1 = embeddings1 / np.maximum(norms1, 1e-10)
        normalized2 = embeddings2 / np.maximum(norms2, 1e-10)
        
        # Calculate dot product
        similarities = np.dot(normalized1, normalized2.T)
        
        return similarities
    except Exception as e:
        logger.error(f"Error in batch similarity calculation: {e}")
        return np.zeros((embeddings1.shape[0], embeddings2.shape[0]))