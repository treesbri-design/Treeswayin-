#!/usr/bin/env python3
"""
GitHub Branch Protection Handler
Manages branch operations respecting protection rules and creating PRs when needed.
"""

import os
import sys
import json
import requests
from typing import Optional, Tuple
from datetime import datetime

class GitHubBranchHandler:
    """Handles branch operations with protection rule awareness."""
    
    def __init__(self, token: Optional[str] = None, repo: Optional[str] = None):
        """
        Initialize GitHub branch handler.
        
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
        """Initialize requests session with proper headers."""
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28"
        })
    
    def check_branch_protection(self, branch: str = "main") -> dict:
        """Check if branch has protection rules."""
        try:
            print(f"\n🔍 Checking branch protection for '{branch}'...")
            url = f"{self.base_url}/repos/{self.repo}/branches/{branch}/protection"
            response = self.session.get(url)
            
            if response.status_code == 200:
                protection = response.json()
                print(f"✅ Branch '{branch}' is PROTECTED")
                print(f"   Enforce admins: {protection.get('enforce_admins', {}).get('enabled', False)}")
                print(f"   Require PR reviews: {protection.get('required_pull_request_reviews') is not None}")
                print(f"   Require status checks: {protection.get('required_status_checks') is not None}")
                return {"protected": True, "rules": protection}
            elif response.status_code == 404:
                print(f"✅ Branch '{branch}' is NOT PROTECTED")
                return {"protected": False, "rules": None}
            else:
                print(f"⚠️  Could not determine protection status: {response.status_code}")
                return {"protected": False, "rules": None}
        except Exception as e:
            print(f"❌ Error checking branch protection: {str(e)}")
            return {"protected": False, "rules": None}
    
    def create_feature_branch(self, branch_name: str, from_branch: str = "main") -> bool:
        """Create a feature branch from protected branch."""
        try:
            print(f"\n🌿 Creating feature branch '{branch_name}' from '{from_branch}'...")
            
            # Get the latest commit of the source branch
            url = f"{self.base_url}/repos/{self.repo}/git/refs/heads/{from_branch}"
            response = self.session.get(url)
            
            if response.status_code != 200:
                print(f"❌ Could not get branch '{from_branch}': {response.status_code}")
                return False
            
            sha = response.json()["object"]["sha"]
            
            # Create new branch
            create_url = f"{self.base_url}/repos/{self.repo}/git/refs"
            payload = {
                "ref": f"refs/heads/{branch_name}",
                "sha": sha
            }
            
            create_response = self.session.post(create_url, json=payload)
            
            if create_response.status_code in [200, 201]:
                print(f"✅ Feature branch created: {branch_name}")
                print(f"   Base commit: {sha[:8]}")
                return True
            else:
                print(f"❌ Failed to create branch: {create_response.status_code}")
                print(f"   Response: {create_response.text}")
                return False
        except Exception as e:
            print(f"❌ Error creating feature branch: {str(e)}")
            return False
    
    def branch_exists(self, branch_name: str) -> bool:
        """Check if a branch exists."""
        try:
            url = f"{self.base_url}/repos/{self.repo}/branches/{branch_name}"
            response = self.session.get(url)
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Error checking branch existence: {str(e)}")
            return False
    
    def create_pull_request(self, title: str, body: str, from_branch: str, to_branch: str = "main") -> Optional[dict]:
        """Create a pull request."""
        try:
            print(f"\n📝 Creating pull request from '{from_branch}' to '{to_branch}'...")
            
            url = f"{self.base_url}/repos/{self.repo}/pulls"
            payload = {
                "title": title,
                "body": body,
                "head": from_branch,
                "base": to_branch,
                "draft": False
            }
            
            response = self.session.post(url, json=payload)
            
            if response.status_code in [200, 201]:
                pr_data = response.json()
                print(f"✅ Pull request created successfully!")
                print(f"   PR #: {pr_data['number']}")
                print(f"   URL: {pr_data['html_url']}")
                return pr_data
            else:
                print(f"❌ Failed to create PR: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error creating pull request: {str(e)}")
            return None
    
    def commit_to_branch(self, branch: str, file_path: str, content: str, message: str) -> bool:
        """Commit changes to a specific branch."""
        try:
            import base64
            
            print(f"\n💾 Committing to branch '{branch}'...")
            
            # Encode content
            encoded_content = base64.b64encode(content.encode()).decode()
            
            # Get the file if it exists
            url = f"{self.base_url}/repos/{self.repo}/contents/{file_path}"
            get_response = self.session.get(url, params={"ref": branch})
            
            payload = {
                "message": message,
                "content": encoded_content,
                "branch": branch
            }
            
            # If file exists, include SHA
            if get_response.status_code == 200:
                payload["sha"] = get_response.json()["sha"]
                print(f"   📝 Updating existing file: {file_path}")
            else:
                print(f"   📝 Creating new file: {file_path}")
            
            # Commit
            put_response = self.session.put(url, json=payload)
            
            if put_response.status_code in [200, 201]:
                print(f"✅ Committed successfully to '{branch}'")
                return True
            else:
                print(f"❌ Commit failed: {put_response.status_code}")
                print(f"   Response: {put_response.text}")
                return False
        except Exception as e:
            print(f"❌ Error committing: {str(e)}")
            return False
    
    def safe_commit_with_pr(self, file_path: str, content: str, commit_message: str, 
                           protected_branch: str = "main") -> Tuple[bool, Optional[dict]]:
        """
        Safely commit to a protected branch by creating a feature branch and PR.
        
        Returns:
            Tuple of (success: bool, pr_data: Optional[dict])
        """
        try:
            print("\n" + "="*60)
            print("🚀 Safe Commit Workflow (Protected Branch)")
            print("="*60)
            
            # Step 1: Check branch protection
            protection = self.check_branch_protection(protected_branch)
            
            if not protection["protected"]:
                print(f"\n✅ Branch '{protected_branch}' is not protected. Direct commit possible.")
                success = self.commit_to_branch(protected_branch, file_path, content, commit_message)
                return (success, None)
            
            # Step 2: Create feature branch
            timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
            feature_branch = f"ai-update-{timestamp}"
            
            if not self.create_feature_branch(feature_branch, protected_branch):
                print("❌ Failed to create feature branch")
                return (False, None)
            
            # Step 3: Commit to feature branch
            if not self.commit_to_branch(feature_branch, file_path, content, commit_message):
                print("❌ Failed to commit to feature branch")
                return (False, None)
            
            # Step 4: Create pull request
            pr_title = f"🤖 AI Update: {commit_message.split(chr(10))[0]}"
            pr_body = f"""## Automated Update from OpenAI Integration

**Commit Message:**
{commit_message}

**File Changed:**
- {file_path}

**Branch:** {feature_branch}

This PR was automatically generated by the OpenAI integration workflow.
Please review the changes before merging.

---
*Generated at: {datetime.utcnow().isoformat()}Z*
"""
            
            pr_data = self.create_pull_request(pr_title, pr_body, feature_branch, protected_branch)
            
            if pr_data:
                print("\n" + "="*60)
                print("✅ Safe commit workflow completed!")
                print("="*60)
                return (True, pr_data)
            else:
                print("\n" + "="*60)
                print("❌ Failed to create pull request")
                print("="*60)
                return (False, None)
        except Exception as e:
            print(f"\n❌ Error in safe commit workflow: {str(e)}")
            return (False, None)

def main():
    """Main function with examples."""
    try:
        handler = GitHubBranchHandler()
        
        print("\n" + "="*60)
        print("GitHub Branch Protection Handler")
        print("="*60)
        
        # Check main branch protection
        handler.check_branch_protection("main")
        
        print("\n📋 Available methods:")
        print("  - check_branch_protection(branch)")
        print("  - create_feature_branch(branch_name, from_branch)")
        print("  - branch_exists(branch_name)")
        print("  - create_pull_request(title, body, from_branch, to_branch)")
        print("  - commit_to_branch(branch, file_path, content, message)")
        print("  - safe_commit_with_pr(file_path, content, message, protected_branch)")
        
        print("\n✅ Branch handler initialized and ready!")
        
    except ValueError as e:
        print(f"\n❌ Configuration Error: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
