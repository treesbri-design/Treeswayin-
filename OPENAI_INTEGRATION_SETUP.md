# OpenAI + GitHub Integration Setup Guide

## Overview
This integration connects OpenAI's ChatGPT with your GitHub repository for automated code reviews, issue analysis, and commit message generation.

## Prerequisites
- GitHub Personal Access Token (PAT) with admin scopes
- OpenAI API key
- Python 3.8+

## Setup Instructions

### 1. Create GitHub Personal Access Token (PAT)

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Configure:
   - **Name:** `OpenAI-Integration-Admin`
   - **Expiration:** 90 days
   - **Scopes to select:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Full control of workflows)
     - ✅ `admin:repo_hook` (Full control of repository hooks)
     - ✅ `gist` (Create gists)
4. Copy the token (you won't see it again)

### 2. Set GitHub Repository Secrets

Add your credentials to your repository:

1. Go to: https://github.com/treesbri-design/Treeswayin-/settings/secrets/actions
2. Click **New repository secret** and add:
   - **Name:** `OPENAI_API_KEY` | **Value:** Your OpenAI API key
   - **Name:** `GITHUB_PAT` | **Value:** Your GitHub PAT token

### 3. Install Dependencies

```bash
pip install -r requirements-openai.txt
```

### 4. Set Environment Variables (Local Development)

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
GITHUB_PAT=ghp_your-github-pat-token-here
```

**⚠️ Never commit the `.env` file to GitHub!**

### 5. Run the Integration Script

```bash
# Review a specific pull request
python scripts/openai_github_integration.py review_pr 1

# Analyze an issue
python scripts/openai_github_integration.py analyze_issue 1

# Generate a commit message
python scripts/openai_github_integration.py commit_message "your code diff here"
```

## Available Functions

### Code Review
```python
from scripts.openai_github_integration import review_pull_request
review_pull_request(pr_number=1)
```

### Issue Analysis
```python
from scripts.openai_github_integration import analyze_issue
analyze_issue(issue_number=1)
```

### Commit Message Generation
```python
from scripts.openai_github_integration import generate_commit_message
message = generate_commit_message(code_diff="your diff here")
```

## GitHub Actions Workflow

The workflow file `.github/workflows/openai-integration.yml` is configured to:
- Trigger on pull requests, issues, and pushes
- Verify OpenAI API credentials
- Confirm admin access to the repository
- Run on every PR, issue, and push event

To enable automated reviews:

1. Edit `.github/workflows/openai-integration.yml`
2. Uncomment the function calls in the workflow
3. Push to trigger the workflow

## Security Best Practices

✅ **Do:**
- Rotate tokens every 90 days
- Use separate tokens for different integrations
- Store secrets in GitHub Secrets, not in code
- Review GitHub Action logs regularly

❌ **Don't:**
- Commit `.env` files to the repository
- Share tokens via email or chat
- Use the same token for multiple services
- Grant unnecessary scopes

## Troubleshooting

### "OPENAI_API_KEY not found"
- Verify the secret is added to GitHub Secrets
- Check the secret name is exactly `OPENAI_API_KEY`
- Ensure the workflow has permission to access secrets

### "GITHUB_PAT not found"
- Add `GITHUB_PAT` or `GITHUB_TOKEN` to GitHub Secrets
- Verify the PAT hasn't expired
- Confirm the PAT has the required scopes

### OpenAI API Errors
- Check your OpenAI account has credits
- Verify API key is valid and not expired
- Check rate limits at https://platform.openai.com/account/rate-limits

### GitHub API Errors
- Verify PAT scopes include `repo` and `admin:repo_hook`
- Check repository permissions
- Ensure PAT hasn't expired

## Support

For issues with:
- **OpenAI API:** https://platform.openai.com/docs
- **GitHub API:** https://docs.github.com/rest
- **GitHub Actions:** https://docs.github.com/actions

## License

This integration is part of the Treeswayin- project.