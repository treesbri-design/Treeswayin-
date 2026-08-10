#!/usr/bin/env python3
"""
GitHub Contents API Connection Manager
Handles authentication refresh and reconnection with proper permissions.
"""

import os
import sys
import json
import requests
from typing import Optional, Dict
from datetime import datetime

class GitHubContentsAPI:
    """Manages GitHub Contents API connections with write permissions."""
    
    def __init__(self, token: Optional[str] = None, repo: Optional[str] = None):
        """
        Initialize GitHub Contents API connection.
        
        Args:
            token: GitHub Personal Access Token (PAT)
            repo: Repository in format 'owner/repo'
        """
        self.token = token or os.getenv("GITHUB_PAT") or os.getenv("GITHUB_TOKEN")
        self.repo = repo or os.getenv("GITHUB_REPO") or "treesbri-design/Treeswayin-"
        self.base_url = "https://api.github.com"
        self.session = None
        
        if not self.token:
            raise ValueError("❌ GitHub token not found. Set GITHUB_PAT or GITHUB_TOKEN environment variable.")
        
        self._initialize_session()
    
    def _initialize_session(self) -> None:
        """Initialize and configure requests session with proper headers."""
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28"
        })
        print(f"✅ Session initialized for repository: {self.repo}")
    
    def verify_connection(self) -> bool:
        """Verify GitHub API connection and token validity."""
        try:
            print("\n🔍 Verifying GitHub API connection...")
            response = self.session.get(f"{self.base_url}/user")
            
            if response.status_code == 200:
                user_data = response.json()
                print(f"✅ Connected as: {user_data['login']}")
                print(f"   Name: {user_data.get('name', 'N/A')}")
                print(f"   Email: {user_data.get('email', 'N/A')}")
                return True
            else:
                print(f"❌ Connection failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error verifying connection: {str(e)}")
            return False
    
    def verify_permissions(self) -> Dict[str, bool]:
        """Verify repository write and Contents API permissions."""
        try:
            print("\n🔐 Verifying repository permissions...")
            response = self.session.get(f"{self.base_url}/repos/{self.repo}")
            
            if response.status_code != 200:
                print(f"❌ Repository access failed: {response.status_code}")
                return {"repo_access": False}
            
            repo_data = response.json()
            permissions = repo_data.get("permissions", {})
            
            permissions_status = {
                "repo_access": True,
                "push": permissions.get("push", False),
                "admin": permissions.get("admin", False),
                "maintain": permissions.get("maintain", False),
                "pull": permissions.get("pull", False),
                "triage": permissions.get("triage", False),
                "contents_api": permissions.get("push", False),  # Push permission enables Contents API write
            }
            
            print(f"✅ Repository: {repo_data['full_name']}")
            print(f"   Push Permission: {'✅' if permissions_status['push'] else '❌'}")
            print(f"   Admin Permission: {'✅' if permissions_status['admin'] else '❌'}")
            print(f"   Contents API Write: {'✅' if permissions_status['contents_api'] else '❌'}")
            
            return permissions_status
        except Exception as e:
            print(f"❌ Error verifying permissions: {str(e)}")
            return {"error": str(e)}
    
    def refresh_connection(self) -> bool:
        """Refresh and reconnect to GitHub API."""
        try:
            print("\n🔄 Refreshing GitHub API connection...")
            
            # Clear existing session
            if self.session:
                self.session.close()
            
            # Reinitialize session
            self._initialize_session()
            
            # Verify new connection
            if not self.verify_connection():
                return False
            
            # Verify permissions
            perms = self.verify_permissions()
            
            if not perms.get("push"):
                print("⚠️  Warning: Push permission not detected. Contents API write may be limited.")
            
            print("✅ Connection refreshed successfully!")
            return True
        except Exception as e:
            print(f"❌ Error refreshing connection: {str(e)}")
            return False
    
    def test_contents_api_write(self, test_file: str = "test-contents-api.txt") -> bool:
        """Test Contents API write permission by creating/updating a test file."""
        try:
            print(f"\n📝 Testing Contents API write permission...")
            
            import base64
            
            content = f"Contents API write test - {datetime.utcnow().isoformat()}\n"
            encoded_content = base64.b64encode(content.encode()).decode()
            
            url = f"{self.base_url}/repos/{self.repo}/contents/{test_file}"
            
            # Try to get existing file
            get_response = self.session.get(url)
            
            payload = {
                "message": f"test: Contents API write verification - {datetime.utcnow().isoformat()}",
                "content": encoded_content,
                "branch": "main"
            }
            
            # If file exists, include SHA
            if get_response.status_code == 200:
                payload["sha"] = get_response.json()["sha"]
                print(f"   📝 Updating existing test file...")
            else:
                print(f"   📝 Creating new test file...")
            
            # Create/update file
            put_response = self.session.put(url, json=payload)
            
            if put_response.status_code in [200, 201]:
                print(f"✅ Contents API write test successful!")
                print(f"   File: {test_file}")
                print(f"   URL: https://github.com/{self.repo}/blob/main/{test_file}")
                return True
            else:
                print(f"❌ Contents API write failed: {put_response.status_code}")
                print(f"   Response: {put_response.text}")
                return False
        except Exception as e:
            print(f"❌ Error testing Contents API: {str(e)}")
            return False
    
    def get_rate_limit(self) -> Dict:
        """Check GitHub API rate limit status."""
        try:
            print("\n📊 Checking API rate limits...")
            response = self.session.get(f"{self.base_url}/rate_limit")
            
            if response.status_code == 200:
                data = response.json()
                core = data["resources"]["core"]
                print(f"   Remaining: {core['remaining']} / {core['limit']}")
                print(f"   Reset: {datetime.fromtimestamp(core['reset']).strftime('%Y-%m-%d %H:%M:%S')} UTC")
                return core
            else:
                print(f"❌ Could not fetch rate limits: {response.status_code}")
                return {}
        except Exception as e:
            print(f"❌ Error checking rate limits: {str(e)}")
            return {}
    
    def full_health_check(self) -> bool:
        """Perform comprehensive health check of GitHub connection."""
        try:
            print("\n" + "="*50)
            print("🏥 GitHub Connection Health Check")
            print("="*50)
            
            # 1. Verify connection
            if not self.verify_connection():
                print("\n❌ Connection check failed!")
                return False
            
            # 2. Verify permissions
            perms = self.verify_permissions()
            if not perms.get("push"):
                print("\n❌ Push permission required for Contents API write!")
                return False
            
            # 3. Test rate limits
            self.get_rate_limit()
            
            # 4. Test Contents API write
            if not self.test_contents_api_write():
                print("\n❌ Contents API write test failed!")
                return False
            
            print("\n" + "="*50)
            print("✅ All checks passed! Connection is ready.")
            print("="*50)
            return True
        except Exception as e:
            print(f"\n❌ Health check failed: {str(e)}")
            return False

def main():
    """Main function with connection management examples."""
    try:
        # Initialize connection
        api = GitHubContentsAPI()
        
        # Perform full health check
        if not api.full_health_check():
            print("\n⚠️  Connection issues detected. Please check your GitHub token and permissions.")
            sys.exit(1)
        
        print("\n✅ GitHub Contents API connection is fully functional!")
        print("\nAvailable methods:")
        print("  - verify_connection()")
        print("  - verify_permissions()")
        print("  - refresh_connection()")
        print("  - test_contents_api_write()")
        print("  - get_rate_limit()")
        print("  - full_health_check()")
        
    except ValueError as e:
        print(f"\n❌ Configuration Error: {str(e)}")
        print("\nPlease set the following environment variables:")
        print("  - GITHUB_PAT (or GITHUB_TOKEN)")
        print("  - GITHUB_REPO (optional, defaults to treesbri-design/Treeswayin-)")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
