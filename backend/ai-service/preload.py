import os
from sentence_transformers import SentenceTransformer

def preload_model():
    print("Preloading sentence-transformers model...")
    # Use the same model name as in EmbeddingGenerator
    model_name = 'all-MiniLM-L6-v2'
    
    # This will download and cache the model
    model = SentenceTransformer(model_name)
    print(f"Successfully loaded {model_name}")

if __name__ == "__main__":
    preload_model()
