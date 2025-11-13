from rest_framework import viewsets, status , permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import serializers

from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet ที่จัดการ Ticket
    """
    serializer_class = TicketSerializer
    
    def get_permissions(self):
        """
        กำหนดสิทธิ์: 'destroy' (ลบ) ต้องเป็น Admin/Staff เท่านั้น
        """
        if self.action == 'destroy':
            return [permissions.IsAdminUser()]
        
       
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        กรองข้อมูล: Agent เห็นทั้งหมด, User เห็นแค่ของตัวเอง
        """
        user = self.request.user
        
        
        if user.role == 'agent' or user.role == 'admin' or user.is_superuser:
           
            return Ticket.objects.all().order_by('-created_at')
        else:
            
            return Ticket.objects.filter(created_by=user).order_by('-created_at')

    def perform_create(self, serializer):
    
        serializer.save(created_by=self.request.user)


class CommentViewSet(viewsets.ModelViewSet):
 
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
     
        user = self.request.user
        
        
        ticket_id = self.request.query_params.get('ticket') 

        if not ticket_id:
            
            return Comment.objects.none() 

      
        if user.role == 'agent' or user.role == 'admin' or user.is_superuser:
           
            return Comment.objects.filter(ticket=ticket_id).order_by('created_at')
        else:
           
            return Comment.objects.filter(ticket=ticket_id, ticket__created_by=user).order_by('created_at')

    def perform_create(self, serializer):
       
        serializer.save(user=self.request.user)