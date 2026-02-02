import requests
import logging
from typing import Dict, List, Optional
from collections import Counter
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class GitHubAnalyzer:
    """Analyze GitHub profiles to extract skills and technologies"""
    
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'OrbitDev-AI-Service'
        })
    
    def analyze_user(self, username: str, access_token: Optional[str] = None) -> Dict:
        """
        Analyze a GitHub user's profile and repositories
        
        Args:
            username: GitHub username
            access_token: Optional GitHub access token for higher rate limits
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            if access_token:
                self.session.headers['Authorization'] = f'token {access_token}'
            
            # Fetch user profile
            profile = self._fetch_user_profile(username)
            
            # Fetch repositories
            repos = self._fetch_user_repos(username)
            
            # Analyze languages
            languages = self._analyze_languages(repos)
            
            # Extract skills from repos
            skills = self._extract_skills(repos, languages)
            
            return {
                'username': username,
                'profile': profile,
                'repo_count': len(repos),
                'languages': languages,
                'skills': skills,
                'analysis_complete': True
            }
        except Exception as e:
            logger.error(f"Error analyzing user {username}: {e}")
            raise
    
    def _fetch_user_profile(self, username: str) -> Dict:
        """Fetch user profile information"""
        try:
            response = self.session.get(f"{self.base_url}/users/{username}")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching profile for {username}: {e}")
            raise
    
    def _fetch_user_repos(self, username: str, max_repos: int = 100) -> List[Dict]:
        """Fetch user's public repositories"""
        try:
            repos = []
            page = 1
            
            while len(repos) < max_repos:
                response = self.session.get(
                    f"{self.base_url}/users/{username}/repos",
                    params={'sort': 'updated', 'per_page': 100, 'page': page}
                )
                response.raise_for_status()
                
                page_repos = response.json()
                if not page_repos:
                    break
                
                repos.extend(page_repos)
                page += 1
            
            return repos[:max_repos]
        except requests.RequestException as e:
            logger.error(f"Error fetching repos for {username}: {e}")
            return []
    
    def _analyze_languages(self, repos: List[Dict]) -> List[Dict]:
        """
        Analyze programming languages with TRUTH ENGINE logic.
        1. Ignores Forks (Strictly).
        2. Applies Time Decay (Code > 1 year old is worth 10%).
        """
        language_map = {}
        now = datetime.now(timezone.utc)
        
        for repo in repos:
            # RULE 1: STRICT TRUTH - Ignore Forks completely
            if repo.get('fork', False):
                continue
            
            # RULE 2: TIME DECAY - Calculate "Freshness"
            pushed_at_str = repo.get('pushed_at')
            if not pushed_at_str:
                continue
                
            try:
                # Handle GitHub's ISO format
                pushed_at = datetime.fromisoformat(pushed_at_str.replace('Z', '+00:00'))
            except ValueError:
                continue

            days_since_push = (now - pushed_at).days
            
            # THE FORMULA: 
            # If code was pushed today, multiplier is 1.0
            # If code was pushed 1 year ago, multiplier is 0.1 (Floor)
            recency_multiplier = max(0.1, 1.0 - (days_since_push / 365))

            lang = repo.get('language')
            if lang:
                # Instead of adding +1, we add the "Freshness Score"
                # Example: Python used today = +1.0 point
                # Example: Python used 2 years ago = +0.1 point
                language_map[lang] = language_map.get(lang, 0) + recency_multiplier
        
        # Recalculate totals based on Weighted Score, not just count
        total_score = sum(language_map.values())
        
        # Sort by Score (High Gravity first)
        sorted_langs = sorted(language_map.items(), key=lambda item: item[1], reverse=True)[:10]

        languages = [
            {
                'language': lang,
                'count': round(score, 2), # We return the score as "count" to keep frontend compatible
                'percentage': round((score / total_score) * 100, 2) if total_score > 0 else 0
            }
            for lang, score in sorted_langs
        ]
        
        return languages
    
    def _extract_skills(self, repos: List[Dict], languages: List[Dict]) -> List[str]:
        """Extract skills from repository data"""
        skills = set()
        
        # Add programming languages as skills
        for lang_data in languages:
            if lang_data['percentage'] > 5:  # Only significant languages
                skills.add(lang_data['language'].lower())
        
        # Extract skills from repository topics
        for repo in repos:
            if not repo.get('fork'):
                topics = repo.get('topics', [])
                skills.update(topics)
        
        # Extract common framework indicators from repo names and descriptions
        framework_keywords = {
            'react', 'vue', 'angular', 'django', 'flask', 'express',
            'spring', 'rails', 'laravel', 'nextjs', 'nuxt', 'gatsby',
            'tensorflow', 'pytorch', 'keras', 'scikit-learn',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp',
            'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'
        }
        
        for repo in repos:
            repo_text = f"{repo.get('name', '')} {repo.get('description', '')}".lower()
            for keyword in framework_keywords:
                if keyword in repo_text:
                    skills.add(keyword)
        
        return sorted(list(skills))
