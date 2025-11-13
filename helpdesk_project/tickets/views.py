# tickets/views.py
# ‼️ (เวอร์ชันแก้ไขสมบูรณ์: 1. แก้ไข CommentViewSet ให้ "กรอง" 
#                       2. ลบ TicketViewSet ที่ซ้ำซ้อน) ‼️

from rest_framework import viewsets, status , permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers # (เผื่อไว้)

from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer

# --- (ViewSet ที่ 1: TicketViewSet) ---
class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet ที่จัดการ Ticket
    (ผมจะยึดตามโลจิก "user.role" ที่คุณเขียนไว้นะครับ)
    """
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated] 

    # (ลบ 'queryset = ...' บรรทัดบนทิ้ง 
    #  เพราะ def get_queryset(self) จะทำงานแทน)
    
    def get_queryset(self):
        """
        ฟังก์ชันนี้จะทำงาน "ก่อน" ที่จะส่งข้อมูลกลับไป
        เพื่อ "กรอง" ว่าใครควรเห็นอะไร
        """
        user = self.request.user
        
        # (ใช้โลจิก "user.role" ของคุณ 
        #  ถ้า Model User ของคุณมี Field 'role' ที่ตั้งไว้ว่า 'agent')
        if user.role == 'agent' or user.role == 'admin' or user.is_superuser:
            # Agent/Admin เห็นทั้งหมด
            return Ticket.objects.all().order_by('-created_at')
        else:
            # User ธรรมดา เห็นเฉพาะของตัวเอง
            return Ticket.objects.filter(created_by=user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        (อันนี้เหมือนเดิม) ตอนสร้าง Ticket ให้บันทึก User อัตโนมัติ
        """
        serializer.save(created_by=self.request.user)


# --- (ViewSet ที่ 2: CommentViewSet) ---
# ‼️ (นี่คือส่วนที่แก้ไขปัญหา "Comment ปนกัน") ‼️
class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet ที่จัดการ /api/comments/
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    # ❌ (ลบบรรทัด 'queryset = ...' นี้ทิ้ง)
    # queryset = Comment.objects.all().order_by('created_at') 

    # ✅ (เพิ่มฟังก์ชัน 'get_queryset' นี้แทน)
    def get_queryset(self):
        """
        ฟังก์ชันนี้จะทำงาน "ทุกครั้ง" ที่มีการ GET
        และจะ "อ่าน" ตัวกรอง (Filter) จาก URL
        """
        user = self.request.user
        
        # 1. ‼️ (สำคัญ) ดึง "filter" จาก URL
        #    (นี่คือ ?ticket=... ที่ JS ส่งมา)
        ticket_id = self.request.query_params.get('ticket') 

        if not ticket_id:
            # ถ้า JS ลืมส่ง ?ticket= มา... ให้ส่ง "ว่างเปล่า" กลับไป
            return Comment.objects.none() 

        # (ตอนนี้เรารู้แล้วว่าเขาขอ Ticket ID ไหน)

        if user.role == 'agent' or user.role == 'admin' or user.is_superuser:
            # 2. ถ้าเป็น Agent: 
            #    ให้เห็นทุก Comment (ที่กรองตาม Ticket ที่ขอ)
            return Comment.objects.filter(ticket=ticket_id).order_by('created_at')
        else:
            # 3. ถ้าเป็น User ธรรมดา:
            #    (ป้องกัน User แอบดู Comment ของ Ticket ID คนอื่น)
            return Comment.objects.filter(ticket=ticket_id, ticket__created_by=user).order_by('created_at')

    def perform_create(self, serializer):
        """
        (อันนี้เหมือนเดิม) ตอนสร้าง Comment ให้บันทึก User อัตโนมัติ
        """
        serializer.save(user=self.request.user)

#
# (ลบ class TicketViewSet ที่ซ้ำซ้อนข้างล่างทิ้งให้หมด)
#