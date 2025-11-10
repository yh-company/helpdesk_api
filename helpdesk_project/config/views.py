from django.contrib import admin
from django.urls import path, include
from . import views  

urlpatterns = [
    
    path('', views.homepage_view, name='homepage'), 

    path('admin/', admin.site.urls),
    path('tickets/', include('tickets.urls')),
    path('users/', include('users.urls')),
]