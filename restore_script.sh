#!/bin/bash

# Restore Script for Supabase Database
# ใช้สำหรับ restore ข้อมูลจาก backup file

# ตรวจสอบ argument
if [ $# -eq 0 ]; then
    echo "❌ กรุณาระบุไฟล์ backup ที่ต้องการ restore"
    echo "Usage: $0 <backup_file.sql>"
    echo ""
    echo "ตัวอย่าง:"
    echo "  $0 backups/backup_full_20250806_010031.sql"
    echo "  $0 backups/backup_data_20250806_010031.sql"
    exit 1
fi

BACKUP_FILE="$1"

# ตรวจสอบว่าไฟล์ backup มีอยู่จริง
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ ไม่พบไฟล์ backup: $BACKUP_FILE"
    exit 1
fi

echo "🔄 เริ่มต้น restore ข้อมูล..."
echo "Backup file: $BACKUP_FILE"
echo ""

# ยืนยันการ restore
read -p "⚠️  การ restore จะลบข้อมูลปัจจุบันทั้งหมดและแทนที่ด้วยข้อมูลจาก backup. ต้องการดำเนินการต่อหรือไม่? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ ยกเลิกการ restore"
    exit 1
fi

echo ""
echo "🔄 กำลัง restore ข้อมูล..."

# ทำ restore
npx supabase db reset --linked

if [ $? -eq 0 ]; then
    echo "✅ Reset database สำเร็จ"
else
    echo "❌ Reset database ล้มเหลว"
    exit 1
fi

# Restore จาก backup file
psql postgresql://postgres:postgres@localhost:54322/postgres -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Restore สำเร็จ!"
    echo "ข้อมูลจาก $BACKUP_FILE ถูก restore แล้ว"
else
    echo "❌ Restore ล้มเหลว"
    exit 1
fi

echo ""
echo "🎉 Restore เสร็จสิ้น!"
echo "คุณสามารถเริ่มต้น Supabase ได้ด้วยคำสั่ง: npx supabase start" 