# Git Push Guide - Push to GitHub Repository

This guide will help you push your local code to the GitHub repository: https://github.com/salmanbadushapeak-dot/BMS_BE.git

## Prerequisites

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - Or use: `winget install Git.Git` (Windows Package Manager)

2. **Verify Git Installation**:
   ```bash
   git --version
   ```

3. **Configure Git** (if first time):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## Steps to Push Code

### Step 1: Initialize Git Repository (if not already initialized)

Open PowerShell or Command Prompt in the project directory (`F:\Salu\BMS`) and run:

```bash
git init
```

### Step 2: Add Remote Repository

```bash
git remote add origin https://github.com/salmanbadushapeak-dot/BMS_BE.git
```

If the remote already exists, update it:
```bash
git remote set-url origin https://github.com/salmanbadushapeak-dot/BMS_BE.git
```

### Step 3: Check Current Status

```bash
git status
```

### Step 4: Add All Files

```bash
git add .
```

### Step 5: Commit Changes

```bash
git commit -m "Initial commit: BMS Backend API with authentication and enrollment features"
```

Or use a more descriptive message:
```bash
git commit -m "Add BMS Backend API

- User authentication with JWT
- Student and Teacher enrollment APIs
- Automatic credential generation
- Email notifications
- MySQL database integration
- Password hashing with bcrypt
- Input validation
- Error handling middleware"
```

### Step 6: Set Default Branch (if needed)

```bash
git branch -M main
```

### Step 7: Push to GitHub

**First time push:**
```bash
git push -u origin main
```

**Subsequent pushes:**
```bash
git push
```

If you encounter authentication issues, you may need to:
- Use a Personal Access Token instead of password
- Or use SSH authentication

## Authentication Options

### Option 1: Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Use the token as password when prompted

### Option 2: GitHub CLI

```bash
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login

# Then push
git push -u origin main
```

## Quick Command Summary

Run these commands in sequence:

```bash
# Navigate to project directory
cd F:\Salu\BMS

# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/salmanbadushapeak-dot/BMS_BE.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: BMS Backend API"

# Push
git push -u origin main
```

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/salmanbadushapeak-dot/BMS_BE.git
```

### Error: "failed to push some refs"
```bash
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: Authentication failed
- Use Personal Access Token instead of password
- Or set up SSH keys

### Files not being tracked
Check `.gitignore` file - make sure important files are not ignored.

## Files Included in Repository

The following files will be pushed:
- ✅ All source code files
- ✅ Configuration files
- ✅ Documentation (README.md, API_CURL_COMMANDS.md)
- ✅ package.json and package-lock.json
- ✅ .gitignore

The following files are excluded (via .gitignore):
- ❌ node_modules/
- ❌ .env (environment variables)
- ❌ Log files
- ❌ IDE settings

## Next Steps After Push

1. Verify files on GitHub repository
2. Set up branch protection rules (if needed)
3. Add collaborators (if needed)
4. Set up GitHub Actions for CI/CD (optional)

