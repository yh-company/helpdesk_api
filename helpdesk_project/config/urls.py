# config/urls.py (ฉบับแก้ไข)

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from users.serializers import MyTokenObtainPairSerializer # ✅ (ตัวสร้าง Token Agent)


urlpatterns = [
    # 1. Django Admin
    path('admin/', admin.site.urls),

    # 2. JWT Authentication (ใช้ Serializer ที่ฝัง is_staff)
    # ‼️ (เหลือไว้แค่บรรทัดที่ใช้ MyTokenObtainPairSerializer) ‼️
    path('api/token/', 
         TokenObtainPairView.as_view(serializer_class=MyTokenObtainPairSerializer), 
         name='token_obtain_pair'),
         
    # 3. JWT Refresh (ใช้สำหรับต่ออายุ Token)
    # ‼️ (เหลือไว้แค่บรรทัดเดียว) ‼️
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 4. API Documentation (Swagger/Redoc)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # 5. Application URLs
    path('api/', include('tickets.urls')),
    path('api/', include('users.urls')), # ‼️ (สำคัญ) ตรวจสอบว่า Endpoints Register ของคุณอยู่ใน 'users.urls' หรือไม่
]