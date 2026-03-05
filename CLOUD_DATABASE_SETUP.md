# Cloud PostgreSQL Setup Guide
## Neon / Supabase / AWS RDS Configuration

---

## ✅ Updates Applied

The database configuration has been updated to support Cloud PostgreSQL providers:

**File Updated:** [backend/config/db.js](backend/config/db.js)

### Changes Made:
1. ✅ Added SSL configuration with `rejectUnauthorized: false`
2. ✅ Improved connection testing with `SELECT NOW()` query
3. ✅ Enhanced error messages for debugging
4. ✅ Created `.env.example` with cloud provider examples

---

## 🚀 Quick Setup

### Option 1: Neon (Recommended - Free Tier Available)

1. **Sign up at:** https://neon.tech
2. **Create a new project**
3. **Copy your connection details** from the dashboard
4. **Update your `backend/.env`:**

```env
DB_HOST=ep-cool-darkness-123456.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456

JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

### Option 2: Supabase (Free Tier Available)

1. **Sign up at:** https://supabase.com
2. **Create a new project**
3. **Go to:** Settings → Database → Connection String
4. **Update your `backend/.env`:**

```env
DB_HOST=db.abcdefghijklmnop.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.abcdefghijklmnop
DB_PASSWORD=your_supabase_password

JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

### Option 3: AWS RDS PostgreSQL

1. **Create RDS instance** in AWS Console
2. **Configure security group** to allow your IP
3. **Get endpoint** from RDS dashboard
4. **Update your `backend/.env`:**

```env
DB_HOST=your-instance.abc123.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=campus_events
DB_USER=postgres
DB_PASSWORD=your_rds_password

JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

---

## 📊 Create Database Schema

After setting up your cloud database, run the schema:

### Method 1: Using psql CLI
```bash
# Install psql if not already installed
# Windows: Download from https://www.postgresql.org/download/windows/

# Connect to Neon/Supabase
psql "postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

# Then run:
\i backend/schema.sql
```

### Method 2: Using SQL Editor (Neon/Supabase Dashboard)

1. Open your database dashboard
2. Navigate to SQL Editor
3. Copy contents of `backend/schema.sql`
4. Paste and execute

### Method 3: Using DBeaver / pgAdmin

1. Connect to your cloud database
2. Open SQL Editor
3. Load and execute `backend/schema.sql`

---

## 🧪 Test Connection

```bash
cd backend
npm install
npm run dev
```

**Expected Output:**
```
✅ Successfully connected to the Neon Cloud Database.
Timestamp: 2026-03-05T12:34:56.789Z
Server running on port 5000
```

**If you see errors:**
```
Database connection error: getaddrinfo ENOTFOUND
```
→ Check DB_HOST in .env

```
Database connection error: password authentication failed
```
→ Check DB_USER and DB_PASSWORD in .env

```
Database connection error: no pg_hba.conf entry for host
```
→ This is fixed by SSL configuration (already added)

---

## 🔒 Security Best Practices

### 1. Use Strong JWT Secret
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Whitelist IPs (Production)
For production, configure your cloud provider to only allow specific IPs:
- **Neon:** Project Settings → IP Allow
- **Supabase:** Database Settings → Connection Pooling
- **AWS RDS:** Security Groups

### 3. Environment Variables
Never commit `.env` files to git:
```bash
# .gitignore already has:
.env
.env.local
```

---

## 🌐 Connection String Format

If your provider gives you a full connection string like:
```
postgresql://user:password@host:5432/database?sslmode=require
```

Parse it into individual variables:
- `user` → DB_USER
- `password` → DB_PASSWORD
- `host` → DB_HOST
- `5432` → DB_PORT
- `database` → DB_NAME

---

## 📝 Neon-Specific Features

### Serverless Driver (Optional Alternative)
Neon also provides a serverless driver for edge deployments:

```javascript
// Alternative for Edge/Serverless
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const result = await sql`SELECT NOW()`;
```

But for this project, we're using the standard `pg` driver which works everywhere.

---

## 🔄 Migration from Local to Cloud

### 1. Export Local Data (if any)
```bash
pg_dump -U postgres campus_events > backup.sql
```

### 2. Import to Cloud
```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" < backup.sql
```

### 3. Update .env
Switch from localhost to cloud host

### 4. Restart Backend
```bash
npm run dev
```

---

## 📊 Monitor Connection Pool

The current configuration uses default pool settings:
- Max connections: 10
- Idle timeout: 10s

For production, you can customize:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  // ... other config
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🎯 Next Steps

1. ✅ Update `backend/.env` with your cloud database credentials
2. ✅ Run `backend/schema.sql` in your cloud database
3. ✅ Start backend: `npm run dev`
4. ✅ Test API endpoints
5. ✅ Deploy to Vercel/Railway/Render

---

## 📞 Common Issues

### Issue: "Connection terminated unexpectedly"
**Solution:** This is normal on free tiers with auto-sleep. The connection will retry automatically.

### Issue: "Too many connections"
**Solution:** Check your cloud provider's connection limit on free tier.

### Issue: "SSL SYSCALL error"
**Solution:** Already fixed with `rejectUnauthorized: false`

---

## ✨ Benefits of Cloud PostgreSQL

✅ **No local PostgreSQL installation needed**
✅ **Automatic backups** (Neon/Supabase)
✅ **Free tier available** (Neon: 512MB, Supabase: 500MB)
✅ **Global CDN** for faster queries
✅ **Auto-scaling** on higher tiers
✅ **Built-in monitoring** and logs

---

## 🔗 Useful Links

- **Neon Docs:** https://neon.tech/docs/introduction
- **Supabase Docs:** https://supabase.com/docs/guides/database
- **PostgreSQL SSL:** https://www.postgresql.org/docs/current/libpq-ssl.html
- **Node.js pg Library:** https://node-postgres.com/

---

**Status:** ✅ Ready for Cloud Deployment
**Last Updated:** March 5, 2026
