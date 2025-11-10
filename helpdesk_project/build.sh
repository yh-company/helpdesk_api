#!/usr/bin/env bash
# build.sh

# 1. หยุดถ้ามีคำสั่งไหนพลาด
set -o errexit

# 2. (นี่คือบรรทัดที่ขาดไป) ติดตั้ง Library ทั้งหมดจาก requirements.txt
pip install -r requirements.txt

# 3. รวบรวมไฟล์ Static
python manage.py collectstatic --noinput

# 4. รัน Migrate
python manage.py migrate