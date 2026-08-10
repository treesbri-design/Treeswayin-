#!/usr/bin/env python3
"""
OpenAI + GitHub Integration Script
Integrates ChatGPT with your GitHub repository for automated tasks.
"""

import os
import json
import sys
from typing import Optional
import requests
from openai import OpenAI

# Initialize clients
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_PAT") or os.getenv("GITHUB_TOKEN")
GITHUB_REPO = "treesbri-design/Treeswayin-"

if not OPENAI_API_KEY:
    print("❌ Error: OPENAI_API_KEY not found. Set it as an environment variable.")
    sys.exit(1)

if not GITHUB_TOKEN:
    print("❌ Error: GITHUB_PAT or GITHUB_TOKEN not found. Set it as an environment variable.")
    sys.exit(1)

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# GitHub API headers
GITHUB_HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}

def get_github_issue(issue_number: int) -> dict:
    """Fetch a GitHub issue by number."""
    url = f"https://api.github.com/repos/{GITHUB_REPO}/issues/{issue_number}"
    response = requests.get(url, headers=GITHUB_HEADERS)
    response.raise_for_status()
    return response.json()

def get_github_pull_request(pr_number: int) -> dict:
    """Fetch a GitHub pull request by number."""
    url = f"https://api.github.com/repos/{GITHUB_REPO}/pulls/{pr_number}"
    response = requests.get(url, headers=GITHUB_HEADERS)
    response.raise_for_status()
    return response.json()

def post_github_comment(issue_number: int, comment: str, is_pr: bool = False) -> dict:
    """Post a comment on a GitHub issue or PR."""
    url = f"https://api.github.com/repos/{GITHUB_REPO}/issues/{issue_number}/comments"
    payload = {"body": comment}
    response = requests.post(url, headers=GITHUB_HEADERS, json=payload)
    response.raise_for_status()
    return response.json()

def analyze_code_with_chatgpt(code_content: str, prompt: str) -> str:
    """Send code to ChatGPT for analysis."""
    system_message = """You are an expert code reviewer and developer. 
    Provide constructive feedback, suggestions for improvement, and identify potential issues.
    Be concise and professional in your responses."""
    
    user_message = f"{prompt}\n\nCode to review:\n```\n{code_content}\n```"
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
        max_tokens=1000,
    )
    
    return response.choices[0].message.content

def review_pull_request(pr_number: int) -> None:
    """Review a pull request using ChatGPT."""
    print(f"📝 Reviewing PR #{pr_number}...")
    
    try:
        pr_data = get_github_pull_request(pr_number)
        title = pr_data.get("title")
        description = pr_data.get("body", "")
        
        prompt = f"""Review this pull request:
        Title: {title}
        Description: {description}
        
        Provide a brief code review with suggestions for improvement."""
        
        review = analyze_code_with_chatgpt("", prompt)
        
        comment = f"""## 🤖 ChatGPT Code Review\n\n{review}"""
        post_github_comment(pr_number, comment, is_pr=True)
        print(f"✅ Review posted on PR #{pr_number}")
        
    except Exception as e:
        print(f"❌ Error reviewing PR: {str(e)}")
        sys.exit(1)

def analyze_issue(issue_number: int) -> None:
    """Analyze a GitHub issue using ChatGPT."""
    print(f"🔍 Analyzing issue #{issue_number}...")
    
    try:
        issue_data = get_github_issue(issue_number)
        title = issue_data.get("title")
        body = issue_data.get("body", "")
        
        prompt = f"""Analyze this GitHub issue and provide:
        1. A brief summary
        2. Potential solutions
        3. Suggested next steps
        
        Issue Title: {title}
        Issue Description: {body}"""
        
        analysis = analyze_code_with_chatgpt("", prompt)
        
        comment = f"""## 🤖 ChatGPT Analysis\n\n{analysis}"""
        post_github_comment(issue_number, comment)
        print(f"✅ Analysis posted on issue #{issue_number}")
        
    except Exception as e:
        print(f"❌ Error analyzing issue: {str(e)}")
        sys.exit(1)

def generate_commit_message(code_diff: str) -> str:
    """Generate a commit message from code changes."""
    prompt = """Generate a concise, professional commit message (one line, max 72 characters) 
    for the following code changes. Follow conventional commits format (feat:, fix:, docs:, etc.)"""
    
    message = analyze_code_with_chatgpt(code_diff, prompt)
    return message.strip()

def main():
    """Main function with example usage."""
    print("🚀 OpenAI + GitHub Integration Script")
    print(f"Repository: {GITHUB_REPO}")
    print(f"OpenAI Model: GPT-4")
    print("-" * 50)
    
    # Example usage (uncomment to use):
    # review_pull_request(1)
    # analyze_issue(1)
    
    print("✅ Integration script is ready!")
    print("\nAvailable functions:")
    print("  - review_pull_request(pr_number)")
    print("  - analyze_issue(issue_number)")
    print("  - analyze_code_with_chatgpt(code, prompt)")
    print("  - generate_commit_message(diff)")

if __name__ == "__main__":
    main()
