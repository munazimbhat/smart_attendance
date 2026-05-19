# 🚀 Complete Setup Guide - Smart Attendance System

## ✅ Dependencies Installed

npm install has completed successfully! All 651 packages are installed and ready to use.

---

## 📋 Prerequisites

Before proceeding, you need:
- **PostgreSQL 14+** installed and running
- A database created named `smart_attendance`
- Connection credentials (username, password, host, port)

---

## 🗄️ Option 1: PostgreSQL via Docker (Recommended for Quick Setup)

### Step 1: Start PostgreSQL with Docker

```bash
# Pull and run PostgreSQL container
docker run -d \
  --name smart-attendance-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smart_attendance \
  -p 5432:5432 \
  postgres:15

# Verify it's running
docker ps | grep smart-attendance-db
```

This creates:
- **Username**: postgres
- **Password**: postgres
- **Database**: smart_attendance
- **Host**: localhost
- **Port**: 5432

### Step 2: Verify Connection

```bash
# Test the connection
psql -h localhost -U postgres -d smart_attendance -c "SELECT version();"

# If prompted for password, enter: postgres
```

---

## 🗄️ Option 2: Local PostgreSQL Installation

### macOS (Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb -U postgres smart_attendance

# Verify
psql -U postgres -d smart_attendance -c "SELECT version();"
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb smart_attendance

# Create user (optional)
sudo -u postgres psql -c "CREATE USER attendance WITH PASSWORD 'password';"
sudo -u postgres psql -c "ALTER ROLE attendance SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE attendance SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE attendance SET default_transaction_deferrable TO on;"
sudo -u postgres psql -c "ALTER ROLE attendance SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smart_attendance TO attendance;"
```

### Windows (PostgreSQL Installer)

1. Download from https://www.postgresql.org/download/windows/
2. Run installer, choose:
   - Port: 5432
   - Username: postgres
   - Password: (choose your own)
3. Create database using pgAdmin or:
   ```cmd
   createdb -U postgres smart_attendance
   ```

---

## 🔧 Configure Your Environment

### Step 1: Update `.env.local`

Edit `/Users/munazimashrafbhat/Downloads/smart_attendance_new/.env.local`:

```bash
# For Docker PostgreSQL (default):
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_attendance"

# For local PostgreSQL (macOS/Linux):
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/smart_attendance"

# For PostgreSQL with custom user:
DATABASE_URL="postgresql://attendance:password@localhost:5432/smart_attendance"
```

### Step 2: Keep Other Settings

Leave these as-is:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="dev-secret-57a8f3b9c2e5d1a4f6g9h2j5k8l1m4n7-change-in-production"
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_IMAGE_UPLOAD_LIMIT=5242880
```

---

## 📊 Initialize Database

### Step 1: Push Schema to Database

```bash
cd /Users/munazimashrafbhat/Downloads/smart_attendance_new

# This creates all tables defined in prisma/schema.prisma
npx prisma db push
```

Expected output:
```
Prisma schema loaded from prisma/schema.prisma
✔ Agree to schema changes

✔ Database synchronized with schema
```

### Step 2: Seed Demo Data

```bash
# This populates the database with demo users, classes, and attendance records
npx prisma db seed
```

Expected output:
```
Running seed command `ts-node prisma/seed.ts` ...
✔ Demo data seeded successfully
```

### Demo Accounts Created

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo | Demo@123 |
| HOD | hod@demo | Demo@123 |
| Teacher | teacher@demo | Demo@123 |
| Student 1 | student1@demo | Demo@123 |
| Student 2 | student2@demo | Demo@123 |
| Student 3 | student3@demo | Demo@123 |

---

## 🎨 Download Face-API Models

The facial recognition system needs ML models (uploaded automatically to `/public/models/`).

### Automatic Setup (Recommended)

The models will be downloaded automatically when you first load the face detection page.

### Manual Setup (Optional)

If you want to pre-download them:

```bash
mkdir -p /Users/munazimashrafbhat/Downloads/smart_attendance_new/public/models

# Download models (run from project directory)
npx @vladmandic/face-api-models

# Or download from CDN directly:
# https://cdn.jsdelivr.net/npm/@vladmandic/face-api-models@1.0/model/
```

---

## ▶️ Run Development Server

```bash
cd /Users/munazimashrafbhat/Downloads/smart_attendance_new

# Start the Next.js development server
npm run dev

# Server will start on http://localhost:3000
```

Expected output:
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✔ Ready in 1234ms
```

---

## 🌐 Open in Browser

1. Open http://localhost:3000
2. Click "Login" or go directly to http://localhost:3000/login
3. Login with demo credentials:
   - **Email**: admin@demo
   - **Password**: Demo@123

---

## ✨ Test the Application

### As Admin
- Dashboard shows system stats
- Navigate to "Users" to see all users
- Check "Security" for alerts

### As Teacher
- Dashboard shows upcoming classes
- Click "Start Attendance"
- Face detection camera should activate
- Show your face to the camera to mark attendance

### As Student
- View your attendance percentage
- See your enrolled classes
- Check leave balance (12/15 leaves remaining)
- Request new leave

---

## 🔧 Troubleshooting

### Issue: "Connection refused" error

**Solution**: Ensure PostgreSQL is running
```bash
# Docker
docker ps | grep smart-attendance-db
docker start smart-attendance-db

# macOS
brew services list
brew services start postgresql@15

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Issue: "Database does not exist" error

**Solution**: Create the database
```bash
# Docker PostgreSQL
docker exec smart-attendance-db psql -U postgres -c "CREATE DATABASE smart_attendance;"

# Local PostgreSQL
createdb -U postgres smart_attendance
```

### Issue: "No face detected" in camera

**Solution**: Check camera permissions
1. Go to System Preferences → Security & Privacy → Camera
2. Allow browser/terminal access
3. Refresh the page
4. Allow camera when prompted

### Issue: "Module not found" errors

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: Prisma schema validation errors

**Solution**: Ensure you have Prisma 5.7.0
```bash
npx prisma --version
# Should show: prisma : 5.7.0

# If not, reinstall:
npm install --save-dev prisma@5.7.0
npm install @prisma/client@5.7.0
```

---

## 📚 Next Steps

1. **Read the Feature Documentation**
   ```bash
   cat /Users/munazimashrafbhat/Downloads/smart_attendance_new/README.md
   ```

2. **Quick Feature Tour** (5 minutes)
   ```bash
   cat /Users/munazimashrafbhat/Downloads/smart_attendance_new/QUICKSTART.md
   ```

3. **Demo Script for Hackathon**
   ```bash
   cat /Users/munazimashrafbhat/Downloads/smart_attendance_new/HACKATHON_CHECKLIST.md
   ```

4. **Explore the Code**
   - Components: `src/components/`
   - Pages: `src/app/`
   - API: `src/app/api/`
   - Database: `prisma/schema.prisma`

---

## 🚀 Deploy to Production

When ready to deploy:

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

See `DEPLOYMENT.md` for full instructions on:
- Vercel deployment
- Heroku deployment
- AWS deployment
- Docker deployment

---

## 📞 Common Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Check database schema
npx prisma db execute --stdin < prisma/schema.prisma

# Create a new migration
npx prisma migrate dev --name add_new_field

# Reset database (DANGER - deletes all data)
npx prisma migrate reset

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## ✅ Verification Checklist

- [ ] PostgreSQL is installed and running
- [ ] Database `smart_attendance` exists
- [ ] `.env.local` has correct `DATABASE_URL`
- [ ] `npx prisma db push` succeeded
- [ ] `npx prisma db seed` succeeded
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads in browser
- [ ] Login with demo credentials works
- [ ] Face detection camera activates (with permission)
- [ ] Attendance can be marked with face

---

## 🎉 Ready to Go!

Once all steps are complete, you have a fully functional Smart Attendance System with:
- ✅ Real-time face recognition
- ✅ Multi-role access control
- ✅ Advanced attendance reports
- ✅ Leave management
- ✅ Beautiful, responsive UI
- ✅ Production-ready code

**Start with**: `npm run dev`

Good luck! 🚀
