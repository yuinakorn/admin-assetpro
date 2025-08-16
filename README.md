# 🏢 ระบบจัดการครุภัณฑ์ (Asset Management System)

<div align="center"> 
  <img src="/public/images/assetpro_login.png" alt="AssetPro 404 Page" width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
  
  *หน้า Login ที่ออกแบบด้วย Glassmorphism และ Modern UI*
</div> 
 

## 📋 ภาพรวมโปรเจค

**AssetPro** เป็นระบบจัดการครุภัณฑ์คอมพิวเตอร์ที่พัฒนาด้วยเทคโนโลยีสมัยใหม่ ถูกออกแบบมาเพื่อให้การจัดการครุภัณฑ์เป็นไปอย่างมีประสิทธิภาพ ใช้งานง่าย และปลอดภัย

### ✨ คุณสมบัติหลัก
- 🔐 **ระบบ Authentication** ที่ปลอดภัย
- 📊 **Dashboard** แสดงข้อมูลสถิติแบบ Real-time
- 🖥️ **จัดการครุภัณฑ์** คอมพิวเตอร์ครบครัน
- 👥 **ระบบผู้ใช้งาน** แบบ Role-based Access Control
- 📱 **Responsive Design** รองรับทุกอุปกรณ์
- 🎨 **Modern UI/UX** ด้วย Glassmorphism Design
        
## 🚀 เทคโนโลยีที่ใช้

<div align="center">

| Frontend | Backend | Database | Styling | Deployment |
|----------|---------|----------|---------|------------|
| ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&style=for-the-badge) | ![Supabase](https://img.shields.io/badge/Supabase-2024-3ECF8E?logo=supabase&style=for-the-badge) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&style=for-the-badge) | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?logo=tailwind-css&style=for-the-badge) | ![Docker](https://img.shields.io/badge/Docker-24.0.0-2496ED?logo=docker&style=for-the-badge) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-3178C6?logo=typescript&style=for-the-badge) | ![Node.js](https://img.shields.io/badge/Node.js-18.17.0-339933?logo=node.js&style=for-the-badge) | ![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?logo=redis&style=for-the-badge) | ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.0.1-000000?logo=shadcn&style=for-the-badge) | ![Nginx](https://img.shields.io/badge/Nginx-1.24.0-009639?logo=nginx&style=for-the-badge) |

</div>

## 🎯 ฟีเจอร์หลัก

### 🔐 ระบบความปลอดภัย
- **Username/Password Authentication**
- **Role-based Access Control (RBAC)**
- **Protected Routes**
- **Session Management**

### 📊 Dashboard & Analytics
- **Real-time Statistics**
- **Equipment Charts**
- **Department Overview**
- **Recent Activity Feed**

### 🖥️ จัดการครุภัณฑ์
- **เพิ่ม/แก้ไข/ลบครุภัณฑ์**
- **QR Code Scanner**
- **Equipment History**
- **Category Management**

### 👥 จัดการผู้ใช้งาน
- **User Registration**
- **Role Assignment**
- **Permission Management**
- **Profile Management**

## 🎨 การออกแบบ UI/UX

### ✨ Glassmorphism Design
- **Backdrop Blur Effects**
- **Semi-transparent Elements**
- **Modern Gradients**
- **Smooth Animations**

### 🌈 Color Scheme
- **Primary**: Blue (#2563EB)
- **Secondary**: Purple (#7C3AED)
- **Accent**: Pink (#EC4899)
- **Background**: Soft Pastels

### 📱 Responsive Design
- **Mobile-First Approach**
- **Flexible Layouts**
- **Touch-Friendly Interfaces**
- **Cross-Device Compatibility**

## 🚀 การติดตั้งและใช้งาน

### 📋 ความต้องการของระบบ
- Node.js 18.17.0+
- npm 9.6.0+
- Docker (สำหรับ deployment)
- Supabase Account

### 🔧 การติดตั้ง

```bash
# 1. Clone repository
git clone https://github.com/your-username/re_admin_assetpro.git
cd re_admin_assetpro

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า environment variables
cp env.example .env.local

# 4. รัน development server
npm run dev
```

### ⚙️ Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🐳 การ Deploy ด้วย Docker

```bash
# Build Docker image
docker build \
  --build-arg VITE_SUPABASE_URL="YOUR_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" \
  -t re-admin-assetpro .

# Run with Docker Compose
docker-compose up --build
```

## 📁 โครงสร้างโปรเจค

```
re_admin_assetpro/
├── src/
│   ├── components/          # UI Components
│   ├── pages/              # Page Components
│   ├── contexts/           # React Contexts
│   ├── hooks/              # Custom Hooks
│   ├── services/           # API Services
│   ├── types/              # TypeScript Types
│   └── lib/                # Utility Functions
├── supabase/               # Database & Auth
├── public/                 # Static Assets
├── docs/                   # Documentation
└── nginx/                  # Web Server Config
```

## 🔧 การพัฒนา

### 📝 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint checking
npm run type-check   # TypeScript checking
```

### 🎨 การปรับแต่ง UI

ระบบใช้ **shadcn/ui** และ **Tailwind CSS** สำหรับการออกแบบ:

```tsx
// ตัวอย่างการใช้งาน Glassmorphism
<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
  {/* Content */}
</div>
```

## 📊 ฐานข้อมูล

### 🗄️ Database Schema
- **Users**: ผู้ใช้งานระบบ
- **Equipment**: ครุภัณฑ์คอมพิวเตอร์
- **Departments**: แผนก/หน่วยงาน
- **Categories**: ประเภทครุภัณฑ์
- **History**: ประวัติการใช้งาน

### 🔐 Authentication
- **Supabase Auth**
- **Row Level Security (RLS)**
- **JWT Tokens**
- **Session Management**

## 🚀 การ Deploy

### 🌐 Production Deployment
1. **Build Application**: `npm run build`
2. **Docker Build**: `docker build -t assetpro .`
3. **Deploy**: `docker-compose up -d`

### 📱 CI/CD Pipeline
- **Automatic Builds** เมื่อ push code
- **Docker Image Creation**
- **Automatic Deployment**
- **Health Checks**


### 💡 การเสนอ Feature

 
<div align="center">
  <img src="/public/images/assetpro_dashboard.png"  width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
</div>  

<div align="center">
  <img src="/public/images/assetpro_department_dashboard.png" width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
</div>  

<div align="center">
  <img src="/public/images/assetpro_department.png" width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
</div>  
 
<div align="center">
  <img src="/public/images/assetpro_added.png" width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
</div>  

<div align="center">
  <img src="/public/images/assetpro_upload_img.png" width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
</div>  
  
<div align="center">
  <img src="/public/images/assetpro_qr_scan.png" width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
</div>  

<div align="center">
  <img src="/public/images/assetpro_404page.png" alt="AssetPro 404 Page" width="600" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
</div>  

## 📄 License

โปรเจคนี้อยู่ภายใต้ **MIT License** - ดูรายละเอียดใน [LICENSE](LICENSE) file

*Built with ❤️ using modern web technologies*

</div>