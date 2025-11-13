from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny 
from .models import User
from .serializers import UserRegistrationSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegistrationViewSet(mixins.CreateModelMixin,
                              viewsets.GenericViewSet):
   
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    
    
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        
        
        return Response(
            {"message": f"User '{user.username}' created successfully."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    




