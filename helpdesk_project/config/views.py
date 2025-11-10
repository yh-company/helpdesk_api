# ลบ 'from django.shortcuts import render'
from django.http import HttpResponse # 👈 1. Import ตัวนี้แทน

def homepage_view(request):
    # 2. ให้มัน return ข้อความธรรมดาๆ แบบนี้
    return HttpResponse("Test OK: Homepage view is working!")