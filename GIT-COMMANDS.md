# 🚀 Quick Git Push Commands

## ⚡ Fast Track: Push to GitHub

Copy and paste these commands in PowerShell:

```powershell
# Navigate to project root
cd "D:\New folder (2)\campus-events"

# Initialize Git (if not already done)
git init

# Add all files
git add .

# CRITICAL: Verify .env is NOT being added
git status
# You should see "backend/.env.example" but NOT "backend/.env"
# If you see .env, STOP and check .gitignore

# Commit
git commit -m "feat: Complete Campus Event Management System

Multi-role event platform with:
- Student, Faculty, Dean, Coordinator dashboards
- Live event registration with capacity tracking
- Profile management with DB persistence
- Role-based security with auto-redirects
- Neon PostgreSQL with SSL
- Centralized API with JWT authentication
- Transaction-based duplicate prevention"

# Add remote (REPLACE with your GitHub repo URL)
git remote add origin https://github.com/Tejal-Stac/campus-events.git

# Push to GitHub
git push -u origin main
```

---

## 🔒 Security Verification Before Push

Run this verification script:

```powershell
# PowerShell Security Check
Write-Host "🔍 Security Verification..." -ForegroundColor Cyan
Write-Host ""

# Check 1: .env should be in .gitignore
Write-Host "✓ Check 1: .gitignore validation" -ForegroundColor Yellow
if (Select-String -Path ".gitignore" -Pattern "\.env") {
    Write-Host "  ✅ .env is in .gitignore" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: .env NOT in .gitignore" -ForegroundColor Red
    exit 1
}

# Check 2: .env should NOT be tracked by git
Write-Host ""
Write-Host "✓ Check 2: Git tracking verification" -ForegroundColor Yellow
$trackedEnv = git ls-files | Select-String "\.env$" | Where-Object { $_ -notmatch "\.env\.example" }
if (-not $trackedEnv) {
    Write-Host "  ✅ .env is NOT tracked by Git" -ForegroundColor Green
} else {
    Write-Host "  ❌ ERROR: .env is being tracked!" -ForegroundColor Red
    Write-Host "  Run: git rm --cached backend/.env" -ForegroundColor Yellow
    exit 1
}

# Check 3: .env.example should exist
Write-Host ""
Write-Host "✓ Check 3: .env.example exists" -ForegroundColor Yellow
if (Test-Path "backend\.env.example") {
    Write-Host "  ✅ .env.example found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  WARNING: .env.example not found" -ForegroundColor Yellow
}

# Check 4: Verify no secrets in staged files
Write-Host ""
Write-Host "✓ Check 4: Staged files scan" -ForegroundColor Yellow
$staged = git diff --staged --name-only
if ($staged) {
    $secretMatches = $staged | Select-String -Pattern "\.env$|password|secret|key" | Where-Object { $_ -notmatch "\.example|README|DEPLOYMENT" }
    if ($secretMatches) {
        Write-Host "  ⚠️  WARNING: Potential secrets detected in staged files" -ForegroundColor Yellow
        $secretMatches
    } else {
        Write-Host "  ✅ No secrets detected in staged files" -ForegroundColor Green
    }
} else {
    Write-Host "  ℹ️  No files staged" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Security checks complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
```

Save as `verify-security.ps1` and run:
```powershell
powershell -ExecutionPolicy Bypass -File verify-security.ps1
```

---

## 🔧 If You Need to Fix Issues

### Already committed .env accidentally?

```powershell
# Remove from Git tracking (keeps local file)
git rm --cached backend/.env

# Verify it's in .gitignore
echo "" >> .gitignore
echo "# Environment variables" >> .gitignore
echo ".env" >> .gitignore
echo "backend/.env" >> .gitignore

# Commit the fix
git add .gitignore
git commit -m "fix: Remove .env from version control"

# Push
git push origin main

# IMPORTANT: Rotate all secrets in .env
# Anyone who cloned might have seen them!
```

### Need to rename default branch to main?

```powershell
# Rename branch
git branch -M main

# Set upstream
git push -u origin main
```

### Remote already exists error?

```powershell
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/YOUR-USERNAME/campus-events.git

# Push
git push -u origin main
```

---

## 📋 Pre-Push Checklist

Before running `git push`, verify:

- [ ] Environment variables secured
  ```powershell
  git check-ignore backend/.env
  # Should output: backend/.env
  ```

- [ ] No node_modules in commit
  ```powershell
  git status | Select-String "node_modules"
  # Should return nothing
  ```

- [ ] No build artifacts
  ```powershell
  git status | Select-String "dist|build"
  # Should return nothing
  ```

- [ ] .env.example exists
  ```powershell
  Test-Path backend\.env.example
  # Should return: True
  ```

- [ ] README.md is comprehensive
  ```powershell
  Get-Content README.md | Measure-Object -Line
  # Should show 500+ lines
  ```

---

## 🎯 After Successful Push

### Verify on GitHub

1. Go to your GitHub repository
2. Check "Code" tab - should see all files except .env
3. Verify README.md displays correctly
4. Check .gitignore includes .env

### Set Up Repository

1. Add repository description: "Multi-role Campus Event Management System with React, Node.js, and PostgreSQL"
2. Add topics: `react`, `nodejs`, `postgresql`, `event-management`, `vite`, `express`, `jwt-auth`
3. Enable Discussions (optional)
4. Add LICENSE file (MIT recommended)

### Create Releases

```powershell
# Tag current version
git tag -a v1.0.0 -m "Release v1.0.0: Initial production release"
git push origin v1.0.0

# Create release on GitHub with release notes
```

---

## 🌐 Connect to Deployment Platforms

### Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable: `VITE_API_URL`
6. Deploy

### Railway (Backend)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - Root Directory: `/backend`
   - Start Command: `npm start`
5. Add all environment variables from .env.example
6. Deploy

---

## 📊 Repository Statistics

After pushing, your repo should have:

- **Languages**: JavaScript (95%), CSS (3%), HTML (2%)
- **Files**: ~25-30 files
- **Lines of Code**: ~3,500-4,000 lines
- **Size**: ~500 KB (excluding node_modules)

---

## 🎉 Success! What's Next?

1. ✅ Code pushed to GitHub
2. ✅ README visible and formatted
3. ✅ Environment variables secured
4. ✅ Ready for deployment

### Deploy to Production

Follow the steps in [DEPLOYMENT.md](./DEPLOYMENT.md) to:
- Deploy frontend to Vercel
- Deploy backend to Railway
- Connect to Neon PostgreSQL
- Configure CORS for production

---

## 🆘 Troubleshooting

### "Failed to push"

Check remote URL:
```powershell
git remote -v
```

Should show:
```
origin  https://github.com/Tejal-Stac/campus-events.git (fetch)
origin  https://github.com/Tejal-Stac/campus-events.git (push)
```

### "Permission denied"

Configure Git credentials:
```powershell
# Cache credentials for 1 hour
git config --global credential.helper cache

# Or use GitHub CLI
gh auth login
```

### "Large files" error

Check for accidental large files:
```powershell
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 50MB } | Select-Object FullName, @{Name="SizeMB";Expression={[math]::Round($_.Length / 1MB, 2)}}
```

Remove and re-add to .gitignore if needed.

---

**🚀 Ready to push? Run the commands at the top of this file!**
