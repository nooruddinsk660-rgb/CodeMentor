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
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env
# app.py is in backend/ai-service/, so .env is in ../
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from dotenv import load_dotenv

# Load environment variables from backend/.env
# app.py is in backend/ai-service/, so .env is in ../
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


# ===== LOGGING CONFIGURATION =====
# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

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
    title="OrbitDev AI Service",
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
    roadmap: List[str]
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
        "message": "OrbitDev AI Service",
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
        logger.info(f"Analyzing trajectory for {len(request.skills)} skills towards {request.target_role}")
        
        drift_warnings = []
        trajectory_status = "stable"
        total_gravity = 0
        current_skills_map = {} # Normalize input skills

        # 1. Analyze Physics & Detect Drift
        for skill in request.skills:
            # Normalize level
            level_map = {"beginner": 0.3, "intermediate": 0.6, "advanced": 0.85, "expert": 1.0}
            proficiency = level_map.get(skill.level.lower(), 0.1)
            
            # Map for later comparison
            current_skills_map[skill.name.lower()] = proficiency
            
            # Accumulate gravity
            total_gravity += skill.gravityScore
            
            # Decay Logic
            if proficiency >= 0.8 and skill.gravityScore < 0.3:
                drift_warnings.append(
                    f"⚠️ High Decay in {skill.name}: You are an {skill.level}, but your activity is low."
                )
                trajectory_status = "drifting"

        # 2. Define Role Requirements (The "Galaxy Map")
        role_galaxy = {
            "Senior Full Stack Engineer": {
                "required": ["javascript", "react", "nodejs", "typescript", "system-design", "docker", "testing"],
                "optional": ["graphql", "aws", "nextjs"]
            },
            "AI & Machine Learning Engineer": {
                "required": ["python", "pytorch", "tensorflow", "mathematics", "pandas", "data-structures"],
                "optional": ["nlp", "computer-vision", "mlops", "docker"]
            },
            "DevOps & Cloud Architect": {
                "required": ["docker", "kubernetes", "aws", "terraform", "ci-cd", "linux", "networking"],
                "optional": ["go", "python", "monitoring", "security"]
            },
            "Blockchain Developer": {
                "required": ["solidity", "ethereum", "javascript", "cryptography", "smart-contracts", "web3"],
                "optional": ["rust", "go", "defi"]
            },
            "Frontend Architect": {
                "required": ["javascript", "react", "css-architecture", "performance", "accessibility", "typescript"],
                "optional": ["web-components", "design-systems", "figma"]
            },
            "Backend Systems Engineer": {
                "required": ["java", "go", "database-design", "microservices", "redis", "kafka", "system-design"],
                "optional": ["nodejs", "rust", "grpc"]
            },
            "Data Scientist": {
                "required": ["python", "sql", "statistics", "pandas", "visualization", "machine-learning"],
                "optional": ["r", "big-data", "spark"]
            }
        }

        # 3. Generate Roadmap
        target_role_key = request.target_role or "Senior Full Stack Engineer"
        # Fuzzy match or default
        target_role_data = role_galaxy.get(target_role_key, role_galaxy["Senior Full Stack Engineer"])
        
        roadmap_steps = []
        
        # Check Required Skills
        for req_skill in target_role_data["required"]:
            user_proficiency = current_skills_map.get(req_skill, 0)
            if user_proficiency < 0.6: # Less than intermediate
                step_type = "Learn" if user_proficiency == 0 else "Improve"
                roadmap_steps.append(f"{step_type} {req_skill.title()} to build a strong foundation.")
        
        # Check Optional/Advanced
        if len(roadmap_steps) < 3: # If core is good, suggest advanced
            for opt_skill in target_role_data["optional"]:
                if opt_skill not in current_skills_map:
                    roadmap_steps.append(f"Expand into {opt_skill.title()} to increase seniority.")

        # Cap roadmap
        roadmap_steps = roadmap_steps[:5] 
        if not roadmap_steps:
             roadmap_steps.append("You are fully qualified! Focus on leadership and mentoring.")

        # 4. Generate Insight
        if trajectory_status == "drifting":
            analysis = f"Drift Detected. {len(drift_warnings)} skills are decaying. Stabilize your core before expanding."
        elif not roadmap_steps or roadmap_steps[0].startswith("You are full"):
             analysis = "Orbit Achieved. You match the profile for this role."
             trajectory_status = "stable"
        else:
             analysis = f"Gap Analysis Complete. {len(roadmap_steps)} key milestones identified for {target_role_key}."
             if total_gravity > (len(request.skills) * 0.5):
                 trajectory_status = "accelerating"

        processing_time = time.time() - start

        return TrajectoryResponse(
            status="success",
            trajectory=trajectory_status,
            drift_warnings=drift_warnings,
            roadmap=roadmap_steps, # NEW FIELD
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

# ... (Existing imports)
import ast
import json
import uuid

# ===== INTERVIEW MODULE =====

class InterviewManager:
    def __init__(self):
        self.question_bank = {
            "easy": [
                {"id": "e1", "title": "Reverse String", "description": "Write a function to reverse a string.", "template": "def reverse_string(s):\n    pass", "test_case": "reverse_string('hello') == 'olleh'"},
                {"id": "e2", "title": "FizzBuzz", "description": "Print numbers 1 to n. Print 'Fizz' for multiples of 3, 'Buzz' for 5.", "template": "def fizzbuzz(n):\n    pass", "test_case": "True"}
            ],
            "medium": [
                {"id": "m1", "title": "Reverse Linked List", "description": "Reverse a singly linked list.", "template": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    pass", "test_case": "pass"},
                {"id": "m2", "title": "Two Sum", "description": "Find indices of two numbers that add up to target.", "template": "def two_sum(nums, target):\n    pass", "test_case": "pass"}
            ],
            "hard": [
                {"id": "h1", "title": "Merge k Sorted Lists", "description": "Merge k linked lists into one sorted list.", "template": "def merge_k_lists(lists):\n    pass", "test_case": "pass"},
                {"id": "h2", "title": "Trapping Rain Water", "description": "Compute how much water it can trap after raining.", "template": "def trap(height):\n    pass", "test_case": "pass"}
            ],
            # Expanded Fallback Pool
            "medium": [
                {"id": "m1", "title": "Reverse Linked List", "description": "Reverse a singly linked list.", "template": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    pass", "test_case": "pass"},
                {"id": "m2", "title": "Two Sum", "description": "Find indices of two numbers that add up to target.", "template": "def two_sum(nums, target):\n    pass", "test_case": "pass"},
                {"id": "m3", "title": "Longest Substring Without Repeating Characters", "description": "Find string length.", "template": "def length_of_longest_substring(s):\n    pass", "test_case": "pass"},
                {"id": "m4", "title": "Container With Most Water", "description": "Find max area.", "template": "def max_area(height):\n    pass", "test_case": "pass"}
            ]
        }

    def generate_ai_question(self, difficulty="medium", topic="dsa", model=None):
        if not model:
            return None
            
        try:
            import re
            prompt = (
                f"Generate a unique {difficulty} difficulty coding interview question about {topic}. "
                f"Output strictly valid JSON. "
                f"Format: {{'title': '...', 'description': '...', 'template': 'python code template...', 'test_case': 'assertion code'}}"
            )
            response = model.generate_content(prompt)
            text = response.text
            # Robust JSON extraction using regex
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                text = match.group(0)
            
            data = json.loads(text)
            data['id'] = str(uuid.uuid4())
            return data
        except Exception as e:
            logger.error(f"AI Question Gen Failed: {e}")
            return None

    def get_question(self, difficulty="medium", topic="dsa"):
        import random
        
        # Try AI Generation first if available
        # We access the global persona manager to see if LLM is active
        try:
            from __main__ import persona
            if hasattr(persona, 'use_llm') and persona.use_llm:
                 q = self.generate_ai_question(difficulty, topic, persona.model)
                 if q:
                     return q
        except ImportError:
            # Fallback if circular import or context issue
            pass

        # Fallback to static bank
        pool = self.question_bank.get(difficulty.lower(), self.question_bank["medium"])
        question = random.choice(pool)
        return question

    def evaluate_submission(self, code, language="python"):
        """
        Performs static analysis on the code.
        """
        try:
            tree = ast.parse(code)
            
            # Simple Heuristics
            has_loop = any(isinstance(node, (ast.For, ast.While)) for node in ast.walk(tree))
            
            analysis = "Syntax is valid. "
            if has_loop:
                analysis += "Iterative approach detected. Good for memory efficiency. "
            else:
                analysis += "No explicit loops found. "
            
            return {
                "status": "accepted",
                "feedback": analysis + "Code structure looks solid based on static analysis.",
                "xp": 0 # XP is assigned by the Controller based on difficulty now
            }
        except SyntaxError as e:
            return {
                "status": "error",
                "feedback": f"Syntax Error on line {e.lineno}: {e.msg}",
                "xp": 0
            }
        except Exception as e:
             return {
                "status": "error",
                "feedback": f"Analysis Failed: {str(e)}",
                "xp": 0
            }

interview_manager = InterviewManager()

class InterviewRequest(BaseModel):
    difficulty: str = "medium"
    topic: str = "dsa"

class EvaluationRequest(BaseModel):
    code: str
    language: str = "python"
    questionId: str

@app.post("/interview/generate")
async def generate_interview_question(request: InterviewRequest):
    q = interview_manager.get_question(request.difficulty, request.topic)
    return {
        "question": q,
        "message": f"I have retrieved a {request.difficulty} problem from the archives. {q['title']}. {q['description']}"
    }

@app.post("/interview/evaluate")
async def evaluate_interview_submission(request: EvaluationRequest):
    result = interview_manager.evaluate_submission(request.code, request.language)
    return result

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

# ===== PERSONA LOGIC =====

class PersonaManager:
    def __init__(self):
        self.name = "Noor"
        self.role = "AI Sentinel & Mentor"
        self.use_llm = False
        
        # Configure Gemini if key exists
        api_key = os.getenv("GEMINI_API_KEY")
        self.last_error_time = 0
        self.COOLDOWN_SECONDS = 300  # 5 Minutes Cooldown on Error
        
        if api_key:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                self.use_llm = True
                logger.info("✅ Gemini AI Integration Active (strict free-tier mode)")
            except Exception as e:
                logger.error(f"Gemini Config Error: {e}")
        else:
            logger.warning("⚠️ No GEMINI_API_KEY found. Falling back to Rule-Based Persona.")

    def process_message(self, message: str, context: Optional[str] = None) -> str:
        msg = message.lower().strip()
        
        # 0. LLM Path (Real AI) - WITH STRICT CIRCUIT BREAKER
        # If we hit a limit recently, enforce a strict cooldown to prevent any "extra extraction"
        if self.use_llm:
            time_since_error = time.time() - self.last_error_time
            if time_since_error < self.COOLDOWN_SECONDS:
                 logger.warning(f"❄️ Circuit Breaker Active. Skipping LLM for {int(self.COOLDOWN_SECONDS - time_since_error)}s.")
                 # Fall through to Rule-Based Logic below automatically
            else:
                try:
                    system_prompt = (
                        f"You are Noor, an advanced AI Sentinel and Coding Mentor. "
                        f"Your Tone: Futuristic, Professional, Encouraging, slightly Sci-Fi (Cyberpunk). "
                        f"Context: The user is in an Interview Arena solving: '{context or 'a coding problem'}'. "
                        f"Rules: "
                        f"1. NEVER write the full solution code. "
                        f"2. Guide them with logic, pseudocode, or hints. "
                        f"3. Be concise. "
                        f"4. If the user says 'yes' or 'ready' to a success message, congratulate them and tell them to click the 'Next Challenge' button. "
                        f"5. If they ask 'how to do task', explain the algorithmic approach to '{context}' without giving code. "
                        f"6. If they ask to solve it, refuse politely citing 'Protocol Violation' and give a hint instead. "
                        f"User Message: {message}"
                    )
                    response = self.model.generate_content(system_prompt)
                    return response.text
                    
                except ResourceExhausted:
                    logger.warning("⚠️ Gemini Free Tier Limit Hit. Engaging 5-minute Circuit Breaker.")
                    self.last_error_time = time.time() # STOP requests for 5 minutes
                    # Fallback to rule-based logic
                    
                except Exception as e:
                    logger.error(f"Gemini Gen Error: {e}")
                    # Fallthrough to rule-based on error
        
        # 1. Direct Solution Requests (Cheating Prevention)
        if any(w in msg for w in ["solve", "answer", "code for me", "give me the code", "do it"]):
            return (
                f"⚠️ **PROTOCOL VIOLATION**: I cannot write the solution for you.\n\n"
                f"However, I can guide you. Break the problem '{context or 'current task'}' into smaller steps.\n"
                f"Try writing the pseudocode first. I am watching."
            )

        # 2. Greetings & Status
        if any(w in msg for w in ["hi", "hello", "hey", "start", "ready", "yes", "next"]):
            return (
                f"🔵 **ACKNOWLEDGMENT RECEIVED**.\n"
                f"If you have completed the objective, click **NEXT CHALLENGE** to proceed.\n"
                f"If you require assistance with '{context or 'the current protocol'}', ask for a **HINT**."
            )

        # 3. Help & Hints
        if any(w in msg for w in ["help", "hint", "stuck", "clue", "guide", "how"]):
            return (
                f"💡 **GUIDANCE PROTOCOL**.\n"
                f"To solve '{context or 'this problem'}':\n"
                f"1. Analyze the inputs and expected outputs.\n"
                f"2. Break it down. Do you need a loop? A hash map?\n"
                f"3. Write pseudocode in comments before coding."
            )
            
        # 4. Gratitude
        if any(w in msg for w in ["thank", "thanks", "good"]):
            return "✅ **AFFIRMATIVE**.\nProceed with your implementation."

        # 5. Frustration/Confusion
        if any(w in msg for w in ["hard", "difficult", "fail", "error", "why"]):
            return (
                f"⚖️ **DIAGNOSTIC**.\n"
                f"Frustration is part of the learning algorithm. \n"
                f"Take a breath. Read the error message carefully. What is the compiler telling you?"
            )

        # Default Fallback (Sci-Fi Flavor)
        return (
            f"📨 **INPUT RECEIVED**: '{message}'\n"
            f"I am standing by. Request a **HINT** if you are stuck, or **EXECUTE** your code to verify."
        )

persona = PersonaManager()

@app.post("/interview/chat")
# force reload
async def chat_with_interviewer(request: ChatRequest):
    """
    Enhanced chat with Hybrid Logic (Gemini LLM + Rule-Based Fallback)
    """
    try:
        reply = persona.process_message(request.message, request.context)
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"reply": "⚠️ **SYSTEM ERROR**: Neural Link Unstable. Please retry."}

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