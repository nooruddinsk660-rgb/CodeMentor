import requests
import logging
from typing import Dict, List, Optional
from collections import Counter

logger = logging.getLogger(__name__)

class GitHubAnalyzer:
    """Analyze GitHub profiles to extract skills and technologies"""
    
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CodeMentor-AI-Service'
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
        """Analyze programming languages used across repositories"""
        language_counter = Counter()
        
        for repo in repos:
            if not repo.get('fork') and repo.get('language'):
                language_counter[repo['language']] += 1
        
        total = sum(language_counter.values())
        
        languages = [
            {
                'language': lang,
                'count': count,
                'percentage': round((count / total) * 100, 2) if total > 0 else 0
            }
            for lang, count in language_counter.most_common(10)
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
