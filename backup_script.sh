#!/bin/bash

# Backup Script for Supabase Database
# ใช้สำหรับทำ backup ข้อมูลจาก Supabase local database

# สร้างโฟลเดอร์สำหรับเก็บ backup
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# สร้างชื่อไฟล์ backup ด้วย timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_full_$TIMESTAMP.sql"
BACKUP_DATA_FILE="$BACKUP_DIR/backup_data_$TIMESTAMP.sql"

echo "เริ่มต้นทำ backup ข้อมูล..."
echo "Timestamp: $TIMESTAMP"
echo "Backup file: $BACKUP_FILE"

# ทำ full backup (รวม schema และ data)
echo "กำลังทำ full backup..."
npx supabase db dump --file "$BACKUP_FILE" --local

if [ $? -eq 0 ]; then
    echo "✅ Full backup สำเร็จ: $BACKUP_FILE"
else
    echo "❌ Full backup ล้มเหลว"
    exit 1
fi

# ทำ data-only backup
echo "กำลังทำ data-only backup..."
npx supabase db dump --data-only --file "$BACKUP_DATA_FILE" --local

if [ $? -eq 0 ]; then
    echo "✅ Data-only backup สำเร็จ: $BACKUP_DATA_FILE"
else
    echo "❌ Data-only backup ล้มเหลว"
fi

# แสดงขนาดไฟล์
echo ""
echo "ขนาดไฟล์ backup:"
ls -lh "$BACKUP_FILE"
ls -lh "$BACKUP_DATA_FILE"

# ลบไฟล์ backup เก่าที่มีอายุมากกว่า 30 วัน
echo ""
echo "กำลังลบไฟล์ backup เก่าที่มีอายุมากกว่า 30 วัน..."
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

echo ""
echo "🎉 Backup เสร็จสิ้น!"
echo "ไฟล์ backup ถูกเก็บไว้ในโฟลเดอร์: $BACKUP_DIR" 