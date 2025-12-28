# ===== ai-service/app.py =====
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import logging
import time
import sys
from contextlib import asynccontextmanager

from modules.embedding_generator import EmbeddingGenerator
from modules.github_analysis import GitHubAnalyzer
import numpy as np

# ===== LOGGING CONFIGURATION =====
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('logs/ai_service.log')
    ]
)
logger = logging.getLogger(__name__)

# ===== GLOBAL STATE =====
embedding_generator = None
github_analyzer = None
request_count = 0
error_count = 0
start_time = time.time()

# ===== LIFESPAN MANAGEMENT =====
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown"""
    global embedding_generator, github_analyzer, start_time
    
    # Startup
    try:
        logger.info("Starting AI service...")
        start_time = time.time()
        
        # Initialize services
        embedding_generator = EmbeddingGenerator()
        embedding_generator.load_model()
        
        github_analyzer = GitHubAnalyzer()
        
        logger.info("AI service started successfully")
        yield
        
    except Exception as e:
        logger.error(f"Failed to start AI service: {e}")
        raise
    finally:
        # Shutdown
        logger.info("Shutting down AI service...")
        # Cleanup resources if needed

# ===== FASTAPI APP INITIALIZATION =====
app = FastAPI(
    title="CodeMentor AI Service",
    description="AI-powered skill analysis and matching service with enhanced security",
    version="1.1.0",
    lifespan=lifespan,
    docs_url="/docs" if not sys.argv[0].endswith("production") else None,
    redoc_url="/redoc" if not sys.argv[0].endswith("production") else None
)

# ===== MIDDLEWARE =====

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on environment
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600
)

# GZIP Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and track metrics"""
    global request_count, error_count
    
    request_count += 1
    start = time.time()
    
    try:
        response = await call_next(request)
        duration = time.time() - start
        
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {duration:.3f}s"
        )
        
        # Add custom headers
        response.headers["X-Process-Time"] = str(duration)
        response.headers["X-Request-ID"] = str(request_count)
        
        return response
        
    except Exception as e:
        error_count += 1
        logger.error(f"Request failed: {str(e)}")
        raise

# ===== PYDANTIC MODELS WITH VALIDATION =====

class SkillEmbeddingRequest(BaseModel):
    skills: List[str] = Field(..., min_items=1, max_items=100)
    
    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        if not v:
            raise ValueError('Skills list cannot be empty')
        # Sanitize and validate each skill
        sanitized = []
        for skill in v:
            if not isinstance(skill, str):
                continue
            skill = skill.strip()
            if len(skill) > 0 and len(skill) <= 100:
                sanitized.append(skill[:100])  # Truncate if needed
        
        if not sanitized:
            raise ValueError('No valid skills provided')
        return sanitized

class SkillEmbeddingResponse(BaseModel):
    embedding: List[float]
    dimension: int
    processing_time: float

class SimilarityRequest(BaseModel):
    skills1: List[str] = Field(..., min_items=1, max_items=100)
    skills2: List[str] = Field(..., min_items=1, max_items=100)
    
    @field_validator('skills1', 'skills2')
    @classmethod
    def validate_skills(cls, v):
        if not v:
            raise ValueError('Skills list cannot be empty')
        sanitized = [s.strip()[:100] for s in v if isinstance(s, str) and s.strip()]
        if not sanitized:
            raise ValueError('No valid skills provided')
        return sanitized

class SimilarityResponse(BaseModel):
    similarity: float = Field(..., ge=0.0, le=1.0)
    method: str
    processing_time: float

class RecommendationRequest(BaseModel):
    skills: List[str] = Field(..., min_items=1, max_items=50)
    num_recommendations: Optional[int] = Field(default=5, ge=1, le=20)
    
    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        sanitized = [s.strip()[:100] for s in v if isinstance(s, str) and s.strip()]
        if not sanitized:
            raise ValueError('No valid skills provided')
        return sanitized

class RecommendationResponse(BaseModel):
    recommendations: List[str]
    count: int
    processing_time: float

class GitHubAnalysisRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=39, pattern='^[a-zA-Z0-9-]+$')
    access_token: Optional[str] = None
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Username cannot be empty')
        return v

class SkillData(BaseModel):
    name: str
    level: str
    gravityScore: float = Field(default=0.0, ge=0.0)

class TrajectoryRequest(BaseModel):
    skills: List[SkillData]
    target_role: Optional[str] = Field(default="Senior Full Stack Engineer")

class TrajectoryResponse(BaseModel):
    status: str
    trajectory: str
    drift_warnings: List[str]
    ai_analysis: str
    gravity_index: float
    processing_time: float

class HealthResponse(BaseModel):
    status: str
    is_model_loaded: bool
    version: str
    uptime: float
    requests_processed: int
    error_count: int

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: float

# ===== EXCEPTION HANDLERS =====

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "timestamp": time.time()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if not sys.argv[0].endswith("production") else None,
            "timestamp": time.time()
        }
    )

# ===== API ENDPOINTS =====

@app.get("/", response_model=dict)
async def root():
    """Root endpoint with service information"""
    return {
        "message": "CodeMentor AI Service",
        "version": "1.1.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "metrics": "/metrics",
            "embed": "/embed",
            "similarity": "/similarity",
            "recommend": "/recommend",
            "analyze_github": "/analyze_github"
        },
        "documentation": "/docs"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Comprehensive health check endpoint
    Returns service status and metrics
    """
    try:
        is_model_loaded = embedding_generator is not None and embedding_generator.model is not None
        uptime = time.time() - start_time
        
        return HealthResponse(
            status="healthy" if is_model_loaded else "degraded",
            is_model_loaded=is_model_loaded,
            version="1.1.0",
            uptime=uptime,
            requests_processed=request_count,
            error_count=error_count
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

@app.get("/metrics")
async def metrics():
    """Get service metrics"""
    uptime = time.time() - start_time
    
    return {
        "uptime_seconds": uptime,
        "requests_total": request_count,
        "errors_total": error_count,
        "error_rate": error_count / max(request_count, 1),
        "is_model_loaded": embedding_generator is not None and embedding_generator.model is not None,
        "timestamp": time.time()
    }

@app.post("/embed", response_model=SkillEmbeddingResponse)
async def generate_embedding(request: SkillEmbeddingRequest):
    """
    Generate embedding vector for a list of skills
    Security: Input validation via Pydantic
    Performance: Optimized batch processing
    """
    start = time.time()
    
    try:
        if embedding_generator is None or embedding_generator.model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Embedding model not loaded"
            )
        
        logger.info(f"Generating embedding for {len(request.skills)} skills")
        
        # Concatenate skills into a single text
        skills_text = " ".join(request.skills)
        
        # Generate embedding with timeout protection
        try:
            embedding = embedding_generator.generate_embedding(skills_text)
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate embedding"
            )
        
        processing_time = time.time() - start
        
        return SkillEmbeddingResponse(
            embedding=embedding.tolist(),
            dimension=len(embedding),
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_embedding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate embedding"
        )

@app.post("/similarity", response_model=SimilarityResponse)
async def calculate_similarity(request: SimilarityRequest):
    """
    Calculate similarity between two skill sets
    Security: Input validation and sanitization
    """
    start = time.time()
    
    try:
        if embedding_generator is None or embedding_generator.model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Embedding model not loaded"
            )
        
        logger.info("Calculating similarity between skill sets")
        
        # Generate embeddings
        text1 = " ".join(request.skills1)
        text2 = " ".join(request.skills2)
        
        embedding1 = embedding_generator.generate_embedding(text1)
        embedding2 = embedding_generator.generate_embedding(text2)
        
        # Calculate cosine similarity
        similarity = float(
            np.dot(embedding1, embedding2) / 
            (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
        )
        
        # Clamp to [0, 1]
        similarity = max(0.0, min(1.0, similarity))
        
        processing_time = time.time() - start
        
        return SimilarityResponse(
            similarity=similarity,
            method="cosine",
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating similarity: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate similarity"
        )

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_skills(request: RecommendationRequest):
    """
    Recommend related skills based on current skills
    Enhanced with more comprehensive skill relationships
    """
    start = time.time()
    
    try:
        logger.info(f"Generating recommendations for {len(request.skills)} skills")
        
        # Enhanced skill relationships database
        skill_relationships = {
            "javascript": ["typescript", "react", "nodejs", "vue", "angular", "nextjs", "webpack"],
            "typescript": ["javascript", "angular", "react", "nodejs", "deno", "nest"],
            "python": ["django", "flask", "fastapi", "pandas", "numpy", "machine-learning", "pytorch"],
            "react": ["redux", "nextjs", "typescript", "graphql", "webpack", "jest", "react-native"],
            "nodejs": ["express", "nestjs", "mongodb", "postgresql", "redis", "graphql", "typescript"],
            "java": ["spring", "kotlin", "maven", "gradle", "junit", "hibernate", "microservices"],
            "go": ["kubernetes", "docker", "microservices", "grpc", "postgresql", "redis"],
            "rust": ["webassembly", "systems-programming", "tokio", "actix", "performance"],
            "docker": ["kubernetes", "docker-compose", "ci-cd", "devops", "containerization"],
            "kubernetes": ["docker", "helm", "terraform", "istio", "prometheus", "grafana"],
            "aws": ["cloud", "terraform", "lambda", "s3", "ec2", "dynamodb", "cloudformation"],
            "azure": ["cloud", "arm-templates", "azure-functions", "cosmos-db"],
            "gcp": ["cloud", "terraform", "cloud-functions", "bigquery", "kubernetes"],
            "machine-learning": ["python", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy"],
            "tensorflow": ["python", "keras", "machine-learning", "deep-learning", "computer-vision"],
            "pytorch": ["python", "machine-learning", "deep-learning", "transformers", "nlp"],
            "mongodb": ["nodejs", "mongoose", "express", "database", "nosql"],
            "postgresql": ["sql", "database", "sequelize", "prisma", "backend"],
            "redis": ["caching", "nodejs", "python", "database", "session-management"],
            "graphql": ["apollo", "relay", "react", "nodejs", "api-design"],
            "rest": ["api-design", "nodejs", "express", "swagger", "postman"],
            "ci-cd": ["jenkins", "github-actions", "gitlab-ci", "docker", "kubernetes"],
            "testing": ["jest", "mocha", "pytest", "cypress", "selenium"],
        }
        
        recommendations = set()
        current_skills_lower = [skill.lower() for skill in request.skills]
        
        # Find related skills
        for skill in current_skills_lower:
            if skill in skill_relationships:
                for related_skill in skill_relationships[skill]:
                    if related_skill not in current_skills_lower:
                        recommendations.add(related_skill)
        
        # Convert to list and limit
        recommended_list = list(recommendations)[:request.num_recommendations]
        
        # If no recommendations found, return popular complementary skills
        if not recommended_list:
            popular_skills = [
                "docker", "kubernetes", "typescript", "graphql", "ci-cd",
                "testing", "microservices", "cloud", "api-design", "devops"
            ]
            recommended_list = [
                s for s in popular_skills 
                if s not in current_skills_lower
            ][:request.num_recommendations]
        
        processing_time = time.time() - start
        
        return RecommendationResponse(
            recommendations=recommended_list,
            count=len(recommended_list),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )

@app.post("/analyze_github")
async def analyze_github_profile(request: GitHubAnalysisRequest):
    """
    Analyze GitHub profile and extract skills
    Security: Username validation via Pydantic regex
    """
    start = time.time()
    
    try:
        logger.info(f"Analyzing GitHub profile: {request.username}")
        
        if github_analyzer is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="GitHub analyzer not initialized"
            )
        
        # Analyze with timeout (30 seconds)
        try:
            analysis = github_analyzer.analyze_user(
                request.username, 
                request.access_token
            )
        except Exception as e:
            logger.error(f"GitHub analysis failed for {request.username}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to analyze GitHub profile: {str(e)}"
            )
        
        processing_time = time.time() - start
        
        return {
            "username": request.username,
            "skills_identified": analysis.get("skills", []),
            "top_languages": analysis.get("languages", []),
            "repositories_analyzed": analysis.get("repo_count", 0),
            "analysis_complete": True,
            "processing_time": processing_time
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_github_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze GitHub profile"
        )
    
@app.post("/analyze-trajectory", response_model=TrajectoryResponse)
async def analyze_trajectory(request: TrajectoryRequest):
    """
    Analyze career trajectory based on skill gravity and decay.
    Distinguishes between 'active experts' and 'decaying experts'.
    """
    start = time.time()
    try:
        logger.info(f"Analyzing trajectory for {len(request.skills)} skills")
        
        drift_warnings = []
        trajectory_status = "stable"
        total_gravity = 0
        
        # 1. Analyze Physics of each skill
        for skill in request.skills:
            # Map text levels to numbers for comparison
            level_map = {"beginner": 0.3, "intermediate": 0.6, "advanced": 0.85, "expert": 1.0}
            # Handle case-insensitive matching
            proficiency = level_map.get(skill.level.lower(), 0.1)
            
            # Accumulate system gravity
            total_gravity += skill.gravityScore
            
            # CRITICAL LOGIC: Detect Decay
            # If proficiency is high (Expert) but gravity is low (Inactive), that is a Drift.
            if proficiency >= 0.8 and skill.gravityScore < 0.6:
                drift_warnings.append(
                    f"⚠️ High Decay in {skill.name}: You are an {skill.level}, but your activity is low."
                )
                trajectory_status = "drifting"

        # 2. Generate Insight
        if trajectory_status == "drifting":
            analysis = (
                f"Drift Detected. {len(drift_warnings)} core skills are decaying. "
                "Your expertise is becoming theoretical. Recommended: Build a small project this weekend."
            )
        elif total_gravity > (len(request.skills) * 0.7):
            analysis = "Excellent Momentum. Your gravity is high, indicating consistent daily learning."
            trajectory_status = "accelerating"
        else:
            analysis = "Stable but static. To reach Senior level, increase daily commit frequency."

        processing_time = time.time() - start

        return TrajectoryResponse(
            status="success",
            trajectory=trajectory_status,
            drift_warnings=drift_warnings,
            ai_analysis=analysis,
            gravity_index=round(total_gravity / max(len(request.skills), 1), 2),
            processing_time=processing_time
        )

    except Exception as e:
        logger.error(f"Trajectory analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trajectory analysis failed: {str(e)}"
        )

# ===== MAIN ENTRY POINT =====
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=True,
        use_colors=True
    )