
from rest_framework import serializers
from .models import User  

class UserRegistrationSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        
        
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'email': {'required': True}
        }

    def create(self, validated_data):
        
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'user') 
        )
        return user