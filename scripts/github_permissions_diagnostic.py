#!/usr/bin/env python3
"""
GitHub Integration Permissions Diagnostic
Analyzes 403 errors and identifies permission gaps.
"""

import os
import sys
import json
import requests
from typing import Optional, Dict

class GitHubPermissionsDiagnostic:
    """Diagnose GitHub integration permission issues."""
    
    def __init__(self, token: Optional[str] = None, repo: Optional[str] = None):
        """Initialize diagnostic tool."""
        self.token = token or os.getenv("GITHUB_PAT") or os.getenv("GITHUB_TOKEN")
        self.repo = repo or os.getenv("GITHUB_REPO") or "treesbri-design/Treeswayin-"
        self.base_url = "https://api.github.com"
        self.session = None
        
        if not self.token:
            raise ValueError("❌ GitHub token not found.")
        
        self._initialize_session()
    
    def _initialize_session(self) -> None:
        """Initialize requests session."""
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        })
    
    def get_token_permissions(self) -> Dict:
        """Get token permissions from GitHub API."""
        try:
            print("\n🔐 Analyzing Token Permissions...")
            response = self.session.get(f"{self.base_url}/user")
            
            if response.status_code == 200:
                headers = response.headers
                print(f"✅ Token is valid")
                print(f"   User: {response.json()['login']}")
                print(f"   Scopes: {headers.get('X-OAuth-Scopes', 'N/A')}")
                
                # Check specific scopes
                scopes = headers.get('X-OAuth-Scopes', '').split(', ')
                required_scopes = ['repo', 'workflow']
                missing = [s for s in required_scopes if s not in scopes]
                
                if missing:
                    print(f"   ❌ Missing scopes: {missing}")
                else:
                    print(f"   ✅ All required scopes present")
                
                return {"valid": True, "scopes": scopes}
            else:
                print(f"❌ Token invalid: {response.status_code}")
                return {"valid": False}
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"valid": False}
    
    def check_repo_access(self) -> Dict:
        """Check repository access permissions."""
        try:
            print("\n🏢 Checking Repository Access...")
            url = f"{self.base_url}/repos/{self.repo}"
            response = self.session.get(url)
            
            if response.status_code == 200:
                repo_data = response.json()
                perms = repo_data.get("permissions", {})
                
                print(f"✅ Repository accessible: {repo_data['full_name']}")
                print(f"   Admin: {perms.get('admin', False)}")
                print(f"   Push (Write): {perms.get('push', False)}")
                print(f"   Pull: {perms.get('pull', False)}")
                
                if not perms.get('push'):
                    print(f"   ❌ ISSUE: Push permission required for write operations")
                
                return {"accessible": True, "permissions": perms}
            else:
                print(f"❌ Repository not accessible: {response.status_code}")
                return {"accessible": False}
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"accessible": False}
    
    def check_branch_protection(self, branch: str) -> Dict:
        """Check if branch has protection rules blocking writes."""
        try:
            print(f"\n🔒 Checking Branch Protection: '{branch}'...")
            url = f"{self.base_url}/repos/{self.repo}/branches/{branch}/protection"
            response = self.session.get(url)
            
            if response.status_code == 200:
                protection = response.json()
                print(f"✅ Branch '{branch}' is PROTECTED")
                
                # Check restrictions
                if protection.get('enforce_admins', {}).get('enabled'):
                    print(f"   ❌ Enforce admin restrictions: ENABLED (blocks integration commits)")
                
                if protection.get('required_pull_request_reviews'):
                    print(f"   ✅ Requires PR reviews: YES (allows via PR)")
                
                if protection.get('required_status_checks'):
                    print(f"   ⚠️  Requires status checks: YES")
                
                if protection.get('restrictions'):
                    print(f"   ❌ Write restrictions: {protection['restrictions']}")
                
                return {"protected": True, "rules": protection}
            elif response.status_code == 404:
                print(f"✅ Branch '{branch}' is NOT PROTECTED (direct writes allowed)")
                return {"protected": False}
            else:
                print(f"⚠️  Could not determine protection: {response.status_code}")
                return {"protected": None}
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"protected": None}
    
    def check_branch_exists(self, branch: str) -> bool:
        """Check if branch exists."""
        try:
            url = f"{self.base_url}/repos/{self.repo}/branches/{branch}"
            response = self.session.get(url)
            exists = response.status_code == 200
            
            if exists:
                print(f"✅ Branch '{branch}' exists")
            else:
                print(f"❌ Branch '{branch}' does not exist")
            
            return exists
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return False
    
    def diagnose_403_error(self, branch: str) -> None:
        """Diagnose why 403 errors occur."""
        try:
            print("\n📊 Diagnosing 403 Forbidden Error...")
            print("="*60)
            
            # Check token
            token_perms = self.get_token_permissions()
            if not token_perms.get("valid"):
                print("\n❌ ROOT CAUSE: Token is invalid or expired")
                return
            
            # Check repo access
            repo_access = self.check_repo_access()
            if not repo_access.get("accessible"):
                print("\n❌ ROOT CAUSE: Repository not accessible")
                return
            
            if not repo_access.get("permissions", {}).get("push"):
                print("\n❌ ROOT CAUSE: Push permission missing from token")
                print("   ACTION: Regenerate PAT with 'repo' scope")
                return
            
            # Check branch existence
            if not self.check_branch_exists(branch):
                print(f"\n❌ ROOT CAUSE: Branch '{branch}' does not exist")
                print(f"   ACTION: Create branch first via web UI or git")
                return
            
            # Check branch protection
            protection = self.check_branch_protection(branch)
            
            if protection.get("protected"):
                rules = protection.get("rules", {})
                
                if rules.get("enforce_admins", {}).get("enabled"):
                    print("\n❌ ROOT CAUSE: 'Enforce admin restrictions' is ENABLED")
                    print("   This blocks integration from writing even with admin token")
                    print("   ACTION: Disable in branch protection settings")
                    return
                
                if rules.get("restrictions"):
                    restrictions = rules["restrictions"]
                    if "users" in restrictions or "teams" in restrictions:
                        print("\n❌ ROOT CAUSE: Write restrictions limit who can push")
                        print("   ACTION: Add integration/bot account to allowed list")
                        return
            
            print("\n⚠️  Could not identify specific cause")
            print("   Recommendation: Check GitHub UI for detailed error message")
        except Exception as e:
            print(f"\n❌ Diagnostic error: {str(e)}")
    
    def full_diagnostic(self, branch: str) -> None:
        """Run full diagnostic."""
        print("\n" + "="*60)
        print("🔍 GitHub Integration Permission Diagnostic")
        print("="*60)
        
        self.diagnose_403_error(branch)
        
        print("\n" + "="*60)
        print("Recommended Actions:")
        print("="*60)
        print("1. Verify token scopes: repo, workflow")
        print("2. Check branch protection settings:")
        print(f"   https://github.com/treesbri-design/Treeswayin-/settings/branches/{branch}")
        print("3. Disable 'Enforce admin restrictions' if not needed")
        print("4. Add integration/bot to allowed write users")
        print("5. Ensure branch exists and is accessible")

def main():
    """Run diagnostic."""
    try:
        diagnostic = GitHubPermissionsDiagnostic()
        
        # Diagnose the specific branch
        branch = os.getenv("BRANCH", "faithpathai-production")
        diagnostic.full_diagnostic(branch)
        
    except ValueError as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
