# tickets/views.py
from rest_framework import viewsets, status
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

    