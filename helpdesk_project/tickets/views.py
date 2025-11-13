from rest_framework import viewsets, status , permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import serializers

from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer

class TicketViewSet(viewsets.ModelViewSet):
   
    serializer_class = TicketSerializer
   
    def get_permissions(self):
       
        if self.action == 'destroy':
           
            return [permissions.IsAdminUser()]
        
        
        return [permissions.IsAuthenticated()]

    
   
    
    def get_queryset(self):
        user = self.request.user
        
        
        if user.role == 'agent' or user.role == 'admin' or user.is_superuser:
            return Ticket.objects.all().order_by('-created_at')
        else:
            return Ticket.objects.filter(created_by=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

