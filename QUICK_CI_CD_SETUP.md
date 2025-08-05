# 🚀 Quick CI/CD Setup Guide

คู่มือการตั้งค่า CI/CD แบบง่ายสำหรับผู้เริ่มต้น

## 📋 ขั้นตอนที่ 1: เตรียม Docker Hub

1. **สร้าง Docker Hub Account**
   - ไปที่ [Docker Hub](https://hub.docker.com)
   - สมัครสมาชิกใหม่
   - สร้าง repository ชื่อ `re-admin-assetpro`

2. **สร้าง Access Token**
   - ไปที่ Account Settings → Security
   - สร้าง New Access Token
   - เก็บ token ไว้ใช้ในขั้นตอนต่อไป
 
## 📋 ขั้นตอนที่ 2: เตรียม Server

1. **เช่า VPS** (แนะนำ: DigitalOcean, Linode, Vultr)
   - Ubuntu 20.04 หรือใหม่กว่า
   - RAM อย่างน้อย 1GB
   - Storage อย่างน้อย 20GB

2. **ติดตั้ง Docker บน Server**
   ```bash
   # เชื่อมต่อ SSH ไปยัง server
   ssh root@your_server_ip
   
   # ติดตั้ง Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # เริ่มต้น Docker service
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **สร้าง SSH Key**
   ```bash
   # บนเครื่อง local
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   
   # Copy public key ไปยัง server
   ssh-copy-id root@your_server_ip
   
   # ดู private key (จะใช้ใน GitHub Secrets)
   cat ~/.ssh/id_rsa
   ```

## 📋 ขั้นตอนที่ 3: ตั้งค่า GitHub Secrets

1. **ไปที่ GitHub Repository**
   - ไปที่ repository ของคุณ
   - คลิก Settings → Secrets and variables → Actions

2. **เพิ่ม Secrets ต่อไปนี้:**

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   DOCKER_USERNAME=your_docker_hub_username
   DOCKER_PASSWORD=your_docker_hub_access_token
   
   SERVER_HOST=your_server_ip
   SERVER_USERNAME=root
   SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
   your_private_key_content_here
   -----END OPENSSH PRIVATE KEY-----
   SERVER_PORT=22
   ```

## 📋 ขั้นตอนที่ 4: ทดสอบ CI/CD

1. **Push Code ไปยัง main branch**
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

2. **ตรวจสอบ GitHub Actions**
   - ไปที่ repository → Actions tab
   - ดูการทำงานของ workflow

3. **ตรวจสอบ Application**
   - เปิด browser ไปที่ `http://your_server_ip:8088`
   - ควรเห็น application ทำงาน

## 🔧 การแก้ไขปัญหาเบื้องต้น

### ❌ Build Failed
- ตรวจสอบ Supabase URL และ Key
- ตรวจสอบ linting errors ใน code

### ❌ Deploy Failed
- ตรวจสอบ Docker Hub credentials
- ตรวจสอบ SSH connection
- ตรวจสอบ server resources

### ❌ Application ไม่ทำงาน
- ตรวจสอบ Docker container: `docker ps`
- ดู logs: `docker logs re-admin-assetpro-app`
- ตรวจสอบ port: `netstat -tlnp | grep 8088`

## 🎯 การใช้งานต่อจากนี้

### การ Deploy อัตโนมัติ
- Push ไปยัง `main` branch → Deploy ไปยัง production
- Push ไปยัง `develop` branch → Deploy ไปยัง staging (ถ้ามี)

### การ Deploy แบบ Manual
```bash
# ใช้ script ที่สร้างไว้
./deploy.sh production
./deploy.sh staging
```

## 📞 ข้อมูลเพิ่มเติม

- **CI/CD Pipeline**: `.github/workflows/ci-cd.yml`
- **คู่มือเต็ม**: `CI_CD_SETUP.md`
- **Environment Template**: `env.example`
- **Deploy Script**: `deploy.sh`

## 🎉 เสร็จแล้ว!

ตอนนี้คุณมี CI/CD pipeline ที่จะ:
- ✅ Build และ test code อัตโนมัติ
- ✅ Deploy ไปยัง server เมื่อ push ไปยัง main branch
- ✅ ใช้ Docker สำหรับ containerization
- ✅ มี backup และ rollback capability

**ข้อแนะนำ**: เริ่มต้นด้วยการทดสอบบน staging environment ก่อน deploy ไปยัง production 