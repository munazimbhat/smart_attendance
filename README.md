# 🎓 Smart Attendance & Leave Management System

**An Advanced AI-Powered Facial Recognition Attendance System for Educational Institutions**

![Tech Stack](https://img.shields.io/badge/Next.js-15.0-blue?logo=nextdotjs) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css) ![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?logo=prisma) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)

---

## 🌟 Overview

**Smart Attendance** is a production-grade attendance management system that leverages **facial recognition technology** for seamless, secure, and efficient attendance tracking across educational institutions. Built with cutting-edge web technologies, it features intelligent class recommendations, comprehensive leave management, advanced analytics, and real-time security monitoring.

### Key Highlights
✅ **Real-time Facial Recognition** - Browser-based face detection & matching using face-api.js  
✅ **Intelligent Class Recommendation** - Auto-detects current class based on timetable  
✅ **Smart Leave Management** - Auto-rejects leaves after 15 limit, maintains history  
✅ **Advanced Reports** - Shortage lists, attendance analytics, PDF/Excel export  
✅ **Multi-Role Support** - Admin, HOD, Teacher, Student with granular permissions  
✅ **Beautiful UI** - Modern responsive design with dark/light mode, Framer Motion animations  
✅ **Real-time Updates** - WebSocket support for live attendance updates  
✅ **Security Features** - Anti-spoofing detection, role-based access control  

---

## 📋 Core Features

### 1. **Facial Recognition Attendance**
- Real-time face detection from webcam
- Multi-sample face registration for accuracy
- Confidence scoring & quality validation
- Anti-spoof detection (photo/video spoofing detection)
- Automatic presence marking with one confirmed face

### 2. **Intelligent Class Scheduling**
- Teachers see recommended current class/section/subject
- System recommends class based on timetable
- Manual class override option
- Timetable management interface (JSON + calendar view)

### 3. **Leave Management System**
- Students request leaves with reason & documents
- Teachers approve/reject with feedback
- Auto-limit: Max 15 leaves per semester
- System blocks further requests after limit reached
- Leave history with full tracking

### 4. **Comprehensive Reports & Analytics**
- **Shortage List**: Students < 75% attendance (Red highlight)
- **Attendance Analytics**: Charts, trends, monthly/weekly breakdown
- **PDF Export**: Beautifully formatted reports
- **Excel Export**: Data analysis ready
- Department-wise & subject-wise breakdowns

### 5. **Role-Based Dashboard**
- **Admin**: System-wide analytics, user management, security events
- **HOD**: Department overview, teacher management, approval requests
- **Teacher**: Class attendance, student management, leave approvals, reports
- **Student**: My attendance, leave requests, class schedule, profile

### 6. **Advanced UI/UX**
- Responsive design (Mobile, Tablet, Desktop)
- Dark/Light mode toggle
- Smooth animations (Framer Motion)
- Accessibility-first design
- Real-time notifications

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 3.3, shadcn/ui components |
| **Animation** | Framer Motion 10 |
| **Face Recognition** | face-api.js + TensorFlow.js |
| **Backend** | Next.js API Routes (or NestJS for scale) |
| **Database** | PostgreSQL 15 + Prisma 5.7 |
| **Auth** | NextAuth.js 4.24 with JWT |
| **Reports** | jsPDF, html2canvas, exceljs |
| **Charts** | Recharts 2.10 |
| **State** | Zustand 4.4 (optional), React Context |
| **HTTP** | Axios 1.6 |

---

## 📁 Project Structure

```
smart_attendance_new/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home redirect
│   │   ├── login/
│   │   │   └── page.tsx                  # Login page
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # Dashboard router
│   │   │   ├── admin-dashboard.tsx       # Admin view
│   │   │   ├── teacher-dashboard.tsx     # Teacher view
│   │   │   ├── student-dashboard.tsx     # Student view
│   │   │   └── hod-dashboard.tsx         # HOD view
│   │   ├── teacher/
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx              # Face recognition attendance
│   │   │   ├── classes/
│   │   │   ├── students/
│   │   │   ├── leaves/
│   │   │   └── reports/
│   │   │       └── page.tsx              # Reports & shortage list
│   │   ├── student/
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx              # Attendance stats
│   │   │   ├── leave/
│   │   │   │   └── page.tsx              # Leave request form
│   │   │   ├── classes/
│   │   │   └── profile/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts        # Login endpoint
│   │   │   │   ├── register/route.ts     # Registration endpoint
│   │   │   │   └── profile/route.ts      # Profile endpoint
│   │   │   ├── attendance/
│   │   │   ├── leave/
│   │   │   ├── face/
│   │   │   ├── classes/
│   │   │   ├── reports/
│   │   │   └── timetable/
│   │   └── auth.ts                       # NextAuth config
│   ├── components/
│   │   ├── layout/
│   │   │   └── dashboard-layout.tsx      # Main layout with sidebar
│   │   ├── providers/
│   │   │   ├── auth-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── face-attendance.tsx           # Face detection component
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts                       # Auth configuration
│   │   ├── prisma.ts                     # Prisma client
│   │   ├── api.ts                        # API client functions
│   │   ├── face-recognition.ts           # Face detection utilities
│   │   └── formatting.ts                 # Display formatting
│   ├── hooks/
│   │   └── useAttendance.ts              # Custom React hooks
│   └── styles/
│       └── globals.css                   # Global styles & theme variables
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── seed.ts                           # Database seeding
├── public/
│   ├── models/                           # Face-API model files
│   └── ...
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.example
└── README.md
```

---

## 📊 Database Schema (Prisma)

### Core Models
- **User**: Manages all users (Admin, HOD, Teacher, Student)
- **FaceRegistration**: Stores face embeddings for recognition
- **Class**: Classes/sections with teacher assignments
- **StudentClass**: Many-to-many mapping (Student ↔ Class)
- **Attendance**: Attendance records per student per class
- **Leave**: Leave requests with approval workflow
- **Timetable**: Weekly class schedule
- **SecurityAlert**: Logs spoofing & security events
- **Notification**: In-app notifications system
- **AttendanceStats**: Monthly attendance statistics

[Full schema in `prisma/schema.prisma`](prisma/schema.prisma)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **PostgreSQL 14+**
- **npm or yarn**

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/smart-attendance.git
cd smart_attendance_new

# Install dependencies
npm install
# or
yarn install
```

### 2. Setup Database

```bash
# Copy environment template
cp .env.example .env.local

# Update .env.local with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/smart_attendance"

# Run migrations
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### 3. Generate NextAuth Secret

```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=your_generated_secret_here
```

### 4. Environment Configuration

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_attendance"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# File Upload
NEXT_PUBLIC_IMAGE_UPLOAD_LIMIT=5242880
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) and login with demo credentials.

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo | Demo@123 |
| HOD | hod@demo | Demo@123 |
| Teacher | teacher@demo | Demo@123 |
| Student | student@demo | Demo@123 |

---

## 🎯 Feature Walkthrough

### For Teachers
1. **Dashboard** → See upcoming classes for today
2. **Start Attendance** → Click class → Face recognition camera starts
3. **Students Mark Faces** → Real-time detection, confidence scoring
4. **View Reports** → Shortage list (< 75% attendance in red), analytics with charts
5. **Approve Leaves** → Review student leave requests, approve/reject

### For Students
1. **Dashboard** → View your classes, current attendance %
2. **Mark Attendance** → Show face to camera during class
3. **Request Leave** → Fill form, upload medical cert (if needed)
4. **View Stats** → Attendance charts, monthly breakdown, alerts for low attendance

### For Admin/HOD
1. **Overview Dashboard** → System-wide stats, user count, security events
2. **Manage Users** → Add teachers/students, assign departments
3. **Manage Timetable** → Upload/edit class schedule
4. **Security Events** → Monitor spoofing attempts, system alerts

---

## 📈 Hackathon Demo Script (5 Minutes)

### Slide 1: Problem Statement
*"Manual attendance is slow, error-prone, and doesn't scale for 1000+ students across departments."*

### Slide 2: Solution Overview
*"Facial recognition attendance in real-time with ML confidence scoring."*

### Live Demo
1. **Login** as Teacher (30 sec)
2. **Show Dashboard** → Classes list (15 sec)
3. **Start Attendance** → Open face camera (45 sec)
   - Show student's face being detected ✓
   - Explain confidence scoring
   - Student marked automatically
4. **Show Reports** → Shortage list with red highlighting (45 sec)
   - Explain shortage detection
   - Show PDF export
5. **Switch to Student** → Show attendance stats (30 sec)
   - Show low attendance warning
   - Explain leave request flow

### Key Talking Points
- ✅ Real-time face detection (face-api.js)
- ✅ Confidence-based matching (0-100%)
- ✅ Anti-spoof detection (printed photo rejection)
- ✅ Automatic shortage alerts (< 75%)
- ✅ Beautiful dashboard UI
- ✅ Multi-role access control

---

## 🔧 Advanced Setup (Production)

### Database Setup

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE smart_attendance;
CREATE USER sa_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE smart_attendance TO sa_user;
\q

# Run migrations
DATABASE_URL="postgresql://sa_user:secure_password@localhost:5432/smart_attendance" \
npx prisma db push
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel deploy
```

### Using Docker (Optional)

```bash
# Build Docker image
docker build -t smart-attendance .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." smart-attendance
```

---

## 🎨 Customization Guide

### Change Brand Colors

Edit `src/styles/globals.css` CSS variables:

```css
--primary: 221.2 83.2% 53.3%;    /* Blue */
--secondary: 217.2 91.2% 59.8%;  /* Teal */
```

### Add New Role

1. Update `Role` enum in `prisma/schema.prisma`
2. Add dashboard in `src/app/dashboard/`
3. Create role-specific navigation

### Integrate Real Face Recognition API

Replace `face-api.js` with Deepstack/Roboflow:

```typescript
// src/lib/face-recognition.ts
const response = await fetch('http://deepstack-api:5000/vision/face/recognize', {
  method: 'POST',
  body: formData
});
```

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration
- `GET /api/auth/profile` - Get current user

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/class/:classId` - Get class attendance
- `GET /api/attendance/stats/:studentId` - Get student stats

### Leave
- `POST /api/leave` - Create leave request
- `GET /api/leave?status=PENDING` - Get leaves by status
- `PATCH /api/leave/:id/approve` - Approve leave

### Reports
- `GET /api/reports/shortage` - Shortage list
- `GET /api/reports/attendance/:classId` - Attendance report
- `POST /api/reports/export/pdf` - Export PDF
- `POST /api/reports/export/excel` - Export Excel

---

## 🐛 Troubleshooting

### Face Detection Not Working
```bash
# Check if models loaded
# Browser DevTools → Network tab → Check for model files
# Ensure https:// for production
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres

# Check DATABASE_URL format
# postgresql://user:password@host:port/dbname
```

### Port Already in Use
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

---

## 🚀 Performance Optimization

- **Image Compression**: Compress attendance snapshots
- **Database Indexing**: Add indexes on frequently queried columns
- **CDN**: Serve static assets from CDN
- **Caching**: Redis for session management
- **API Pagination**: Paginate large result sets

---

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./prisma/schema.prisma)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guidelines](./docs/SECURITY.md)

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🎓 Credits

- **Face Detection**: face-api.js, TensorFlow.js
- **UI Components**: shadcn/ui, Lucide icons
- **Design Inspiration**: Modern education platforms
- **Backend**: Next.js, Prisma, PostgreSQL

---

## 📞 Support

- 📧 Email: munazimashraf@gmail.com

- 🐛 Issues: [GitHub Issues](https://github.com/munazimbhat/smart-attendance/issues)

---

**Built with ❤️ for the future of education technology**

⭐ If you find this project helpful, please give it a star!
