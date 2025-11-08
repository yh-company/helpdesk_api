from rest_framework import serializers
from .models import Ticket, Comment


class CommentSerializer(serializers.ModelSerializer):
    
    user = serializers.StringRelatedField(read_only=True) 

    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'user', 'body', 'created_at']
        read_only_fields = ['user']

class TicketSerializer(serializers.ModelSerializer):
    
    created_by = serializers.StringRelatedField(read_only=True)
    assigned_to = serializers.StringRelatedField(read_only=True, allow_null=True) 
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 
            'created_by', 'assigned_to', 
            'status', 'priority', 'created_at', 'updated_at', 
            'comments'
        ]
        
        
        read_only_fields = [
            'created_at', 'updated_at', 
            'created_by', 'assigned_to', 'comments'
        ]