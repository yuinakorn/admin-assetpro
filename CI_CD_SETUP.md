# CI/CD Setup Guide

คู่มือการตั้งค่า Continuous Integration/Continuous Deployment สำหรับโปรเจค React Admin AssetPro

## 📋 สิ่งที่ต้องเตรียม

### 1. GitHub Repository
- โปรเจคต้องอยู่ใน GitHub repository
- ต้องมี branch `main` และ `develop` (optional)

### 2. Docker Hub Account
- สร้าง account ที่ [Docker Hub](https://hub.docker.com)
- สร้าง repository ชื่อ `re-admin-assetpro`

### 3. VPS/Server สำหรับ Deploy
- Server ที่มี Docker และ Docker Compose ติดตั้ง
- SSH access
- Public IP address

## 🔧 การตั้งค่า GitHub Secrets

ไปที่ GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### Required Secrets:

#### Supabase Configuration
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Docker Hub Credentials
```
DOCKER_USERNAME=your_docker_hub_username
DOCKER_PASSWORD=your_docker_hub_password_or_access_token
```

#### Production Server
```
SERVER_HOST=your_server_ip_or_domain
SERVER_USERNAME=your_server_username
SERVER_SSH_KEY=your_private_ssh_key
SERVER_PORT=22
```

#### Staging Server (Optional)
```
STAGING_SERVER_HOST=your_staging_server_ip
STAGING_SERVER_USERNAME=your_staging_server_username
STAGING_SERVER_SSH_KEY=your_staging_private_ssh_key
STAGING_SERVER_PORT=22
```

## 🚀 การทำงานของ CI/CD Pipeline

### 1. Continuous Integration (CI)
เมื่อมีการ push code หรือ create pull request:
- ✅ Checkout code
- ✅ Setup Node.js และ Bun
- ✅ Install dependencies
- ✅ Run linting
- ✅ Build application
- ✅ Upload build artifacts

### 2. Continuous Deployment (CD)
เมื่อมีการ push ไปยัง `main` branch:
- ✅ Download build artifacts
- ✅ Build Docker image
- ✅ Push image ไปยัง Docker Hub
- ✅ Deploy ไปยัง production server

### 3. Staging Deployment (Optional)
เมื่อมีการ push ไปยัง `develop` branch:
- ✅ Deploy ไปยัง staging server

## 📁 โครงสร้างไฟล์

```
.github/
└── workflows/
    └── ci-cd.yml          # GitHub Actions workflow
```

## 🔄 การใช้งาน

### การ Deploy อัตโนมัติ
1. Push code ไปยัง `main` branch → Deploy ไปยัง production
2. Push code ไปยัง `develop` branch → Deploy ไปยัง staging

### การ Deploy แบบ Manual
```bash
# Deploy ไปยัง production
git push origin main

# Deploy ไปยัง staging
git push origin develop
```

## 🛠️ การตั้งค่า Server

### 1. ติดตั้ง Docker บน Server
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. สร้าง SSH Key Pair
```bash
# สร้าง SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key ไปยัง server
ssh-copy-id username@server_ip

# Copy private key ไปยัง GitHub Secrets
cat ~/.ssh/id_rsa
```

### 3. ตั้งค่า Firewall
```bash
# เปิด port สำหรับ application
sudo ufw allow 8088  # Production
sudo ufw allow 8089  # Staging (optional)
sudo ufw allow 22    # SSH
```

## 🔍 การตรวจสอบ Deployment

### 1. ตรวจสอบ GitHub Actions
- ไปที่ repository → Actions tab
- ดู status ของ workflow

### 2. ตรวจสอบ Server
```bash
# ตรวจสอบ Docker containers
docker ps

# ดู logs
docker logs re-admin-assetpro-app

# ตรวจสอบ port
netstat -tlnp | grep 8088
```

### 3. ตรวจสอบ Application
- Production: `http://your_server_ip:8088`
- Staging: `http://your_staging_server_ip:8089`

## 🚨 การแก้ไขปัญหา

### 1. Build Failed
- ตรวจสอบ linting errors
- ตรวจสอบ environment variables
- ดู logs ใน GitHub Actions

### 2. Deploy Failed
- ตรวจสอบ SSH connection
- ตรวจสอบ Docker Hub credentials
- ตรวจสอบ server resources

### 3. Application Not Working
- ตรวจสอบ Docker container status
- ตรวจสอบ application logs
- ตรวจสอบ environment variables

## 📞 การขอความช่วยเหลือ

หากมีปัญหาในการตั้งค่า:
1. ตรวจสอบ GitHub Actions logs
2. ตรวจสอบ server logs
3. ตรวจสอบ Docker logs
4. ตรวจสอบ network connectivity

## 🔄 การอัพเดท

เมื่อต้องการอัพเดท CI/CD pipeline:
1. แก้ไขไฟล์ `.github/workflows/ci-cd.yml`
2. Commit และ push changes
3. ตรวจสอบการทำงานของ workflow ใหม่ 