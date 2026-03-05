# 🚀 Deployment Guide - Campus Event Management System

## Quick Git Push Commands

### First-Time Repository Setup

```bash
# Check you're in the project root
cd campus-events

# Initialize Git repository (if not done)
git init

# Add all files (respecting .gitignore)
git add .

# IMPORTANT: Verify .env is NOT being tracked
git status
# You should NOT see backend/.env in the list
# If you see it, add it to .gitignore immediately

# Commit with descriptive message
git commit -m "feat: Initial commit - Campus Event Management System

Features:
- Multi-role authentication (Student, Faculty, Dean, Coordinator)
- Live event dashboard with real-time registration
- Profile management with database persistence
- Role-based dashboards with security protection
- Neon PostgreSQL integration with SSL
- Centralized API configuration with JWT interceptors
- Transaction-based event registration"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/Tejal-Stac/campus-events.git

# Push to main branch
git push -u origin main
```

### ⚠️ Pre-Push Security Checklist

Run these commands BEFORE pushing:

```bash
# 1. Verify .env is ignored
git check-ignore backend/.env
# Should output: backend/.env

# 2. Check no sensitive files are staged
git status | grep -E "\\.env$|password|secret"
# Should return nothing

# 3. List all files being tracked
git ls-files | grep -E "\\.env$|password"
# Should return nothing (except .env.example)

# 4. Verify .gitignore is working
cat .gitignore
# Should include .env, node_modules, dist, etc.
```

### If You Accidentally Committed .env

```bash
# Remove .env from Git tracking (keeps local file)
git rm --cached backend/.env

# Add .env to .gitignore
echo "backend/.env" >> .gitignore
echo ".env" >> .gitignore

# Commit the fix
git add .gitignore
git commit -m "fix: Remove .env from version control"

# Force push to update remote (use with caution)
git push origin main --force

# IMPORTANT: Change all secrets in .env
# Anyone who cloned the repo may have seen the old secrets
```

---

## 📦 Environment Variables Setup

### Backend (.env)

Location: `backend/.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Neon Cloud)
DB_HOST=ep-xxx-yyy-zzz.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=your_neon_password_here

# JWT Secret (MUST be changed in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_characters
```

### Frontend (.env - Optional)

Location: `/.env` (project root)

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api
```

**In production (Vercel/Netlify):**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## 🌐 Deployment to Vercel (Frontend)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tejal-Stac/campus-events)

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# During deployment, add environment variables when prompted:
# VITE_API_URL = https://your-backend-url.com/api
```

### Vercel Dashboard Configuration

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add:
   - `VITE_API_URL` = `https://your-backend-url.com/api`
4. Redeploy

---

## 🚂 Deployment to Railway (Backend)

### Method 1: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project (if you created one on dashboard)
railway link

# Deploy
railway up

# Add environment variables
railway variables set DB_HOST=your_neon_host
railway variables set DB_PORT=5432
railway variables set DB_NAME=neondb
railway variables set DB_USER=neondb_owner
railway variables set DB_PASSWORD=your_password
railway variables set JWT_SECRET=your_secret_key
railway variables set PORT=5000
```

### Method 2: Railway Dashboard (Easier)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `campus-events` repository
4. Select root directory: `/backend`
5. Add environment variables in "Variables" tab
6. Railway will auto-detect Node.js and deploy

---

## 🎯 Deployment to Render (Backend Alternative)

### Via Dashboard

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: campus-events-api
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as above)
6. Click "Create Web Service"

---

## 🗄️ Database: Neon PostgreSQL

### Already Set Up?
If you used Neon during development, just use the same credentials in production.

### New Neon Project

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection details
4. Run `backend/schema.sql` in Neon SQL Editor
5. Update production environment variables

### Connection Pooling (Production)

```javascript
// backend/config/db.js already handles this
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🔄 Complete Deployment Workflow

### Step 1: Prepare Code

```bash
# Ensure all changes are committed
git add .
git commit -m "chore: Prepare for production deployment"
git push origin main
```

### Step 2: Deploy Backend (Railway)

```bash
# From project root
cd backend
railway init
railway up

# Add all environment variables
railway variables set DB_HOST=...
railway variables set JWT_SECRET=...
# etc.

# Get your backend URL
railway open
# Copy the URL (e.g., https://campus-events-backend.railway.app)
```

### Step 3: Deploy Frontend (Vercel)

```bash
# From project root
cd ..
vercel --prod

# When prompted for environment variables:
# VITE_API_URL = https://campus-events-backend.railway.app/api

# Get your frontend URL
# (e.g., https://campus-events.vercel.app)
```

### Step 4: Update CORS (Backend)

Update `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173', // Development
    'https://campus-events.vercel.app', // Production
  ],
  credentials: true
}));
```

Commit and push:
```bash
git add backend/server.js
git commit -m "feat: Update CORS for production"
git push origin main
railway up # Redeploy backend
```

### Step 5: Test Production

1. Visit your Vercel URL
2. Try logging in with sample account
3. Test event registration
4. Test profile updates
5. Verify role-based redirects work

---

## 🐛 Troubleshooting Deployment

### Issue: "Cannot connect to database"

**Solution:**
- Verify all `DB_*` environment variables are set correctly
- Ensure `ssl: { rejectUnauthorized: false }` is in db.js
- Check Neon project is active (not sleeping)

### Issue: "401 Unauthorized" on API calls

**Solution:**
- Verify `VITE_API_URL` is set correctly in frontend
- Check JWT_SECRET matches between environments
- Clear localStorage and login again

### Issue: "CORS Policy Error"

**Solution:**
- Update CORS origin in `backend/server.js`
- Include your Vercel domain
- Redeploy backend after changes

### Issue: Frontend shows "undefined" for API URL

**Solution:**
```bash
# Verify environment variable is loaded
echo $VITE_API_URL

# In Vercel dashboard, check "Environment Variables"
# Variable name must start with VITE_ for Vite to expose it
```

### Issue: Database connection timeout

**Solution:**
- Increase connection timeout in db.js
- Check Neon project region (use nearest region)
- Verify firewall rules allow connections

---

## 📊 Monitoring & Logs

### Railway Logs

```bash
# View real-time logs
railway logs

# Filter by service
railway logs --service backend
```

### Vercel Logs

```bash
# View deployment logs
vercel logs

# View specific deployment
vercel logs [deployment-url]
```

### Database Monitoring

- **Neon Dashboard**: View query performance, connection stats
- **PostgreSQL Logs**: Check slow queries, errors

---

## 🔐 Production Security Checklist

### Before Going Live

- [ ] Change all default passwords and secrets
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS on all endpoints
- [ ] Restrict CORS to known origins
- [ ] Add rate limiting to API (express-rate-limit)
- [ ] Implement input validation on all endpoints
- [ ] Add request logging (morgan)
- [ ] Set up error monitoring (Sentry)
- [ ] Enable database backups (Neon automatic backups)
- [ ] Review and remove console.log statements
- [ ] Add Content Security Policy headers
- [ ] Test all role-based access controls

### Environment Variables

- [ ] Never commit .env files
- [ ] Rotate secrets regularly
- [ ] Use separate databases for dev/staging/prod
- [ ] Store secrets in platform's secret manager
- [ ] Document all required environment variables

---

## 📈 Scaling Considerations

### Database

- **Connection Pooling**: Already configured in db.js
- **Indexes**: Schema includes indexes on frequently queried columns
- **Read Replicas**: Consider for high read traffic

### Backend

- **Horizontal Scaling**: Railway/Render support auto-scaling
- **Caching**: Add Redis for session storage
- **Load Balancing**: Automatic with Railway/Render

### Frontend

- **CDN**: Vercel provides global CDN automatically
- **Code Splitting**: Vite handles this by default
- **Image Optimization**: Consider Cloudinary for event images

---

## 🎉 Post-Deployment

### Share Your Project

1. Update GitHub README with live links
2. Add screenshots of working application
3. Document API with Postman/Swagger
4. Create demo video

### Maintenance

```bash
# Regular updates
git pull origin main
npm install # Update dependencies
npm audit fix # Fix security vulnerabilities
git push origin main
# Platforms will auto-deploy
```

---

## 📞 Support

If you encounter deployment issues:
- Check Railway/Vercel status pages
- Review platform-specific documentation
- Check GitHub Issues for similar problems
- Contact platform support

---

**✅ Deployment Complete! Your Campus Event Management System is now live!**
