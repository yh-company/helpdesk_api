# tickets/views.py
from rest_framework import viewsets, status , permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers # (เผื่อไว้)

from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
       
        user = self.request.user
        
        if user.role == 'agent' or user.role == 'admin' or user.is_superuser:
            # Agent/Admin เห็นทั้งหมด
            return Ticket.objects.all().order_by('-created_at')
        else:
            # User ธรรมดา เห็นเฉพาะของตัวเอง
            return Ticket.objects.filter(created_by=user).order_by('-created_at')

    def perform_create(self, serializer):
       
        serializer.save(created_by=self.request.user)



class CommentViewSet(viewsets.ModelViewSet):
   
    queryset = Comment.objects.all().order_by('created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        
        serializer.save(user=self.request.user)

class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet ที่จัดการ Ticket ทั้งหมด
    มันจะ "ฉลาด" พอที่จะรู้ว่าใครเป็น Agent หรือ User
    """
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated] # 1. (บังคับ) ทุกคนต้องล็อกอินก่อน

    def get_queryset(self):
        """
        ‼️ นี่คือ "หัวใจ" ของ Agent ‼️
        ฟังก์ชันนี้จะทำงาน "ก่อน" ที่จะส่งข้อมูลกลับไป
        """
        user = self.request.user

        if user.is_staff:
            # 2. ถ้าเป็น Agent (is_staff=True)
            # ให้ "เห็น Ticket ทั้งหมด" (เช่น จากหน้า Agent Dashboard)
            return Ticket.objects.all().order_by('-updated_at')
        else:
            # 3. ถ้าเป็น User ธรรมดา (is_staff=False)
            # ให้ "เห็นเฉพาะ Ticket ของตัวเอง" (เช่น จากหน้า My Tickets)
            return Ticket.objects.filter(created_by=user).order_by('-updated_at')

    def perform_create(self, serializer):
        """
        (อันนี้เหมือนเดิม) ตอนสร้าง Ticket ให้บันทึก User อัตโนมัติ
        """
        serializer.save(created_by=self.request.user)

    