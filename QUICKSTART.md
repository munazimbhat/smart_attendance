# ⚡ Quick Start Guide

## 2-Minute Setup

```bash
# 1. Clone & Install
git clone <repo> && cd smart_attendance_new && npm install

# 2. Setup .env.local
cp .env.example .env.local
# Edit with your PostgreSQL URL:
# DATABASE_URL="postgresql://user:pass@localhost:5432/smart_attendance"
# NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 3. Database Setup
npx prisma db push && npx prisma db seed

# 4. Download Face Models
mkdir -p public/models
# Download from: https://github.com/vladmandic/face-api

# 5. Run!
npm run dev
```

**Login at http://localhost:3000** with:
- Email: `admin@demo`
- Password: `Demo@123`

---

## 🎯 5-Minute Feature Tour

### 1. **Admin Dashboard** (30 sec)
- Overview of system stats
- User management
- Security events monitoring

### 2. **Teacher Attendance** (1 min)
- See recommended class
- Start face recognition camera
- Real-time student detection
- Confidence scoring visualization

### 3. **Student Dashboard** (1 min)
- View attendance percentage
- See low attendance alerts
- Request leaves with documents
- View attendance trends (charts)

### 4. **Reports & Analytics** (1:30 min)
- Shortage list (students < 75%)
- Export as PDF/Excel
- Weekly attendance trends
- Department-wise analytics

---

## 🔑 Key Features

| Feature | Location | Demo Time |
|---------|----------|-----------|
| **Face Recognition** | Teacher → Attendance | 45 sec |
| **Shortage List** | Teacher → Reports | 30 sec |
| **Student Attendance** | Student → Attendance | 45 sec |
| **Leave Request** | Student → Leave | 30 sec |
| **Analytics Charts** | Teacher → Reports | 45 sec |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboards
│   ├── teacher/           # Teacher features
│   ├── student/           # Student features
│   ├── api/               # Backend APIs
│   └── login/             # Login page
├── components/
│   ├── face-attendance.tsx # Face detection component ⭐
│   └── layout/            # Layouts & navigation
├── lib/
│   ├── face-recognition.ts # Face detection utilities
│   ├── api.ts             # API client
│   └── formatting.ts      # Display formatting
└── styles/
    └── globals.css        # Theme & styling
```

---

## 🚀 Hackathon Demo Flow

**Duration: 5 minutes**

1. **Intro** (30 sec)
   - "Manual attendance is slow and error-prone"
   - "We built AI-powered facial recognition"

2. **Live Demo** (3 min)
   - Login as teacher (15 sec)
   - Show dashboard with classes (15 sec)
   - Start attendance camera (60 sec)
     - Show face detection
     - Show confidence scoring
     - Auto-mark attendance ✓
   - Switch to student view (30 sec)
   - Show attendance analytics (45 sec)

3. **Key Achievements** (1 min)
   - Real-time face detection
   - Automatic shortage alerts
   - Beautiful, responsive UI
   - Multi-role access control
   - Production-ready code

4. **Q&A** (30 sec)

---

## 🎨 UI Highlights

- **Modern Design**: Gradient backgrounds, smooth animations
- **Dark Mode**: Toggle between light/dark themes
- **Responsive**: Works on mobile, tablet, desktop
- **Accessible**: WCAG compliant color contrasts
- **Fast**: Optimized images, code splitting, lazy loading

---

## 📱 Mobile Testing

```bash
# Test on mobile device
# 1. Get your machine IP: ipconfig getifaddr en0
# 2. Visit: http://YOUR_IP:3000
# 3. Test face recognition on phone camera
```

---

## 🐛 Quick Fixes

**"Cannot find models"**
```bash
mkdir public/models
# Download face-api models there
```

**"Database connection error"**
```bash
# Start PostgreSQL
brew services start postgresql

# Check connection string in .env.local
```

**"Port 3000 in use"**
```bash
npm run dev -- -p 3001
```

---

## 💡 Pro Tips for Judges

1. **Mention the tech stack**: Next.js, TypeScript, Tailwind, Prisma
2. **Highlight the AI aspect**: Face-api.js with TensorFlow.js
3. **Show the shortage list**: Red highlighting is impressive
4. **Mention auto-limits**: Leave system blocks after 15
5. **Talk about scalability**: Database design supports 10k+ students
6. **Emphasize UX**: Smooth animations, dark mode, responsive

---

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Reference](./docs/API.md)
- [Database Schema](./prisma/schema.prisma)

---

**Ready to demo! 🚀**
