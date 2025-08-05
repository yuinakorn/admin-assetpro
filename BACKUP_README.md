# Database Backup Guide

คู่มือการทำ backup และ restore ข้อมูลจาก Supabase Database

## 📁 โครงสร้างไฟล์

```
re_admin_assetpro/
├── backup_script.sh          # Script สำหรับทำ backup
├── restore_script.sh         # Script สำหรับ restore
├── backups/                  # โฟลเดอร์เก็บไฟล์ backup
│   ├── backup_full_*.sql     # Full backup (schema + data)
│   └── backup_data_*.sql     # Data-only backup
└── BACKUP_README.md          # คู่มือนี้
```

## 🔄 การทำ Backup

### วิธีที่ 1: ใช้ Script อัตโนมัติ (แนะนำ)

```bash
# ทำ backup ทั้ง schema และ data
./backup_script.sh
```

Script นี้จะ:
- สร้างโฟลเดอร์ `backups/` (ถ้ายังไม่มี)
- ทำ full backup และ data-only backup
- ตั้งชื่อไฟล์ด้วย timestamp
- ลบไฟล์ backup เก่าที่มีอายุมากกว่า 30 วัน

### วิธีที่ 2: ใช้คำสั่ง Supabase CLI โดยตรง

```bash
# Full backup (schema + data)
npx supabase db dump --file backup_full_$(date +%Y%m%d_%H%M%S).sql --local

# Data-only backup
npx supabase db dump --data-only --file backup_data_$(date +%Y%m%d_%H%M%S).sql --local
```

## 🔄 การ Restore

### ใช้ Script อัตโนมัติ

```bash
# Restore จาก full backup
./restore_script.sh backups/backup_full_20250806_010031.sql

# Restore จาก data-only backup
./restore_script.sh backups/backup_data_20250806_010031.sql
```

### ใช้คำสั่งโดยตรง

```bash
# Reset database ก่อน
npx supabase db reset --linked

# Restore จาก backup file
psql postgresql://postgres:postgres@localhost:54322/postgres -f backup_file.sql
```

## ⚠️ ข้อควรระวัง

1. **ก่อนทำ restore**: ตรวจสอบให้แน่ใจว่าไม่มีแอปพลิเคชันที่ใช้งาน database อยู่
2. **Full backup**: ใช้สำหรับ restore ทั้ง schema และ data
3. **Data-only backup**: ใช้สำหรับ restore เฉพาะข้อมูล (ต้องมี schema อยู่แล้ว)
4. **Circular foreign keys**: อาจมีปัญหาในการ restore data-only backup

## 📅 การตั้งค่า Backup อัตโนมัติ

### ใช้ cron job (macOS/Linux)

```bash
# เปิด crontab editor
crontab -e

# เพิ่มบรรทัดนี้เพื่อทำ backup ทุกวันเวลา 02:00
0 2 * * * cd /path/to/re_admin_assetpro && ./backup_script.sh >> backup.log 2>&1
```

### ใช้ Automator (macOS)

1. เปิด Automator
2. สร้าง Calendar Event
3. เพิ่ม "Run Shell Script" action
4. ใส่คำสั่ง: `cd /path/to/re_admin_assetpro && ./backup_script.sh`

## 🔍 การตรวจสอบ Backup

```bash
# ดูรายการไฟล์ backup
ls -la backups/

# ดูขนาดไฟล์
du -h backups/*.sql

# ตรวจสอบเนื้อหาของ backup file
head -20 backups/backup_full_*.sql
```

## 🚨 กรณีฉุกเฉิน

หากเกิดปัญหาและต้องการ restore ข้อมูล:

1. หยุด Supabase: `npx supabase stop`
2. Restore ข้อมูล: `./restore_script.sh backups/backup_full_YYYYMMDD_HHMMSS.sql`
3. เริ่มต้น Supabase: `npx supabase start`
4. ตรวจสอบข้อมูลในแอปพลิเคชัน

## 📞 การติดต่อ

หากมีปัญหาหรือคำถามเกี่ยวกับ backup/restore กรุณาติดต่อทีมพัฒนา 