# 🚀 Smart Attendance System - Setup & Deployment Guide

## 📋 Complete Setup Instructions

### Step 1: Prerequisites Check

```bash
# Verify Node.js version (need 18+)
node --version

# Verify npm
npm --version

# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Windows: Download from postgresql.org
# Linux: sudo apt-get install postgresql postgresql-contrib
```

### Step 2: Clone & Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd smart_attendance_new

# Install all dependencies
npm install

# Verify face-api models folder exists
mkdir -p public/models
# Download face-api.js models from: https://github.com/vladmandic/face-api
# And place them in public/models/
```

### Step 3: Database Setup

```bash
# Start PostgreSQL service
# macOS: brew services start postgresql
# Windows: pgAdmin or Services
# Linux: sudo systemctl start postgresql

# Create database user and database
psql postgres -c "CREATE USER sa_user WITH PASSWORD 'sa_password';"
psql postgres -c "CREATE DATABASE smart_attendance OWNER sa_user;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE smart_attendance TO sa_user;"

# Or use GUI tool like pgAdmin
```

### Step 4: Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your favorite editor
```

**`.env.local` Template:**
```env
# Database Connection
DATABASE_URL="postgresql://sa_user:sa_password@localhost:5432/smart_attendance"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generated-below

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_IMAGE_UPLOAD_LIMIT=5242880

# Optional: Email Service (for notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password

# Optional: Face Recognition API (cloud-based)
# FACE_RECOGNITION_API_KEY=your-api-key
# FACE_RECOGNITION_API_URL=https://api.deepstack.cc/vision/face
```

**Generate NEXTAUTH_SECRET:**
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# Add the generated value to .env.local as NEXTAUTH_SECRET
```

### Step 5: Database Migration & Seeding

```bash
# Run Prisma migrations
npx prisma db push

# Seed the database with demo data
npx prisma db seed

# Optional: Open Prisma Studio to view/edit data
npx prisma studio
```

### Step 6: Download Face-API Models

```bash
# Create models directory
mkdir -p public/models

# Download models (about 350MB total)
cd public/models

# Download face detection model
wget https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json
wget https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights.bin

# Download other models
wget https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights_manifest.json
wget https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights.bin

wget https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights_manifest.json
wget https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_recognition_model-weights.bin

# Return to root
cd ../../
```

### Step 7: Run Development Server

```bash
# Start the development server
npm run dev

# Server runs on http://localhost:3000
# Open in browser and login with demo credentials
```

---

## 🔑 Demo Login Credentials

Create these accounts or use seeded demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@demo | Demo@123 |
| **HOD** | hod@demo | Demo@123 |
| **Teacher** | teacher@demo | Demo@123 |
| **Student** | student1@demo | Demo@123 |

---

## 🧪 First Time Testing

### 1. Admin Dashboard
- Login as `admin@demo`
- See system-wide statistics
- Navigate to different sections

### 2. Teacher Workflow
- Login as `teacher@demo`
- Go to Dashboard → Classes
- Click "Start Attendance"
- Camera should activate
- Show your face to mark attendance

### 3. Student View
- Login as `student1@demo`
- View your classes & attendance percentage
- Go to "Request Leave" to submit leave
- See attendance analytics with charts

---

## 🌐 Deployment Options

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Configure environment variables in Vercel dashboard
# Set DATABASE_URL, NEXTAUTH_SECRET, etc.

# Redeploy after env vars are set
vercel --prod
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create Heroku app
heroku create smart-attendance

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NEXTAUTH_SECRET=your-secret-key
heroku config:set NEXTAUTH_URL=https://your-app.herokuapp.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to AWS (EC2)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# Install PostgreSQL
sudo yum install postgresql postgresql-server

# Clone repository
git clone <repo-url>
cd smart_attendance_new

# Install dependencies & build
npm install
npm run build

# Start with PM2
npm install -g pm2
pm2 start "npm run start" --name smart-attendance
pm2 startup
pm2 save

# Setup Nginx reverse proxy (optional)
sudo amazon-linux-extras install nginx
# Configure nginx.conf...
```

### Deploy with Docker

```bash
# Create Dockerfile in root
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Build image
docker build -t smart-attendance:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="your-secret" \
  smart-attendance:latest
```

---

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` or `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | JWT signing secret | Generated with `openssl rand -base64 32` |
| `NEXT_PUBLIC_API_URL` | API base URL (public) | `http://localhost:3000/api` |
| `NEXT_PUBLIC_IMAGE_UPLOAD_LIMIT` | Max image size in bytes | `5242880` (5MB) |

---

## 🔍 Troubleshooting

### Issue: "Cannot find module 'face-api.js'"
```bash
# Solution: Install face-api.js
npm install face-api.js @tensorflow/tfjs @tensorflow-models/face-detection

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Database connection refused"
```bash
# Check if PostgreSQL is running
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Verify connection string format
# postgresql://username:password@localhost:5432/dbname
# Special characters in password must be URL-encoded
```

### Issue: "Prisma migration fails"
```bash
# Reset database (warning: deletes all data)
npx prisma migrate reset

# Or manually:
dropdb smart_attendance
createdb smart_attendance
npx prisma db push
npx prisma db seed
```

### Issue: "Port 3000 already in use"
```bash
# Kill process using port 3000
# macOS/Linux:
lsof -i :3000
kill -9 <PID>

# Or run on different port:
PORT=3001 npm run dev
```

### Issue: "Face detection not working"
```bash
# Check if models loaded
# 1. Open DevTools (F12)
# 2. Check Network tab for model files
# 3. Ensure models are in public/models/
# 4. Check Console for errors

# For production (https required):
# Make sure public/models are served over https
```

---

## 📦 Production Checklist

- [ ] Database backed up
- [ ] Environment variables configured
- [ ] NEXTAUTH_SECRET is strong (32+ chars)
- [ ] Database URL uses SSL (sslmode=require)
- [ ] API calls use HTTPS
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] File upload limits set
- [ ] Static assets cached
- [ ] Error logging configured
- [ ] Monitoring/alerting setup
- [ ] Regular backups scheduled

---

## 🚀 Performance Optimization

### Database
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_leave_student_status ON leaves(student_id, status);
CREATE INDEX idx_user_email ON users(email);
```

### Application
```javascript
// Next.js config optimizations
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
};
```

### Caching
```javascript
// Cache user sessions with Redis
// next.auth.js
export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

---

## 📊 Monitoring & Analytics

### Setup Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
```

### Setup Analytics
```bash
# Google Analytics
npm install next-ga

# Verify deployment metrics
npx next telemetry
```

---

## 🤝 Support Resources

- **Documentation**: See [README.md](./README.md)
- **API Docs**: Check [API.md](./docs/API.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/smart-attendance/issues)
- **Discussions**: GitHub Discussions

---

## 📅 Maintenance Schedule

- **Weekly**: Check error logs, monitor performance
- **Monthly**: Backup database, review security logs
- **Quarterly**: Update dependencies, penetration testing
- **Annually**: Full system audit, compliance review

---

**Happy deploying! 🚀**
