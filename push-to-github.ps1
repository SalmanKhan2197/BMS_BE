# PowerShell Script to Push BMS Backend to GitHub
# Run this script from the project root directory: F:\Salu\BMS

Write-Host "=== BMS Backend - Git Push Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Or run: winget install Git.Git" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "✗ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Project directory confirmed" -ForegroundColor Green
Write-Host ""

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
}

# Add remote repository
Write-Host ""
Write-Host "Setting up remote repository..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/salmanbadushapeak-dot/BMS_BE.git"

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote 'origin' already exists. Updating URL..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
} else {
    git remote add origin $remoteUrl
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to add remote repository" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Remote repository configured: $remoteUrl" -ForegroundColor Green

# Check git status
Write-Host ""
Write-Host "Checking git status..." -ForegroundColor Yellow
git status

# Add all files
Write-Host ""
Write-Host "Adding all files to staging..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to add files" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Files added to staging" -ForegroundColor Green

# Commit changes
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = "Initial commit: BMS Backend API with authentication and enrollment features"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to commit changes" -ForegroundColor Red
    Write-Host "Note: If you see 'nothing to commit', all changes are already committed." -ForegroundColor Yellow
} else {
    Write-Host "✓ Changes committed" -ForegroundColor Green
}

# Set default branch to main
Write-Host ""
Write-Host "Setting default branch to 'main'..." -ForegroundColor Yellow
git branch -M main 2>$null
Write-Host "✓ Branch set to 'main'" -ForegroundColor Green

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may be prompted for GitHub credentials." -ForegroundColor Cyan
Write-Host "Use your GitHub username and Personal Access Token (not password)." -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: $remoteUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Failed to push to GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Authentication failed - Use Personal Access Token instead of password" -ForegroundColor Yellow
    Write-Host "2. Repository doesn't exist - Create it on GitHub first" -ForegroundColor Yellow
    Write-Host "3. Network issues - Check your internet connection" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create a Personal Access Token:" -ForegroundColor Cyan
    Write-Host "  GitHub → Settings → Developer settings → Personal access tokens" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan

