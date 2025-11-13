
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
    
# users/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom Serializer สำหรับเพิ่มข้อมูลอื่นๆ เข้าไปใน JWT Payload
    เราจะเพิ่ม is_staff เข้าไปใน "access" token
    """
    @classmethod
    def get_token(cls, user):
        # 1. ดึง Token เดิม
        token = super().get_token(user)

        # 2. ‼️ (สำคัญ) เพิ่ม Custom Claims ของเรา
        token['is_staff'] = user.is_staff
        token['username'] = user.username # (แถม username ให้ด้วยเลย)
        
        return token