# في ملف store/middleware.py

from django.core.cache import cache
from django.utils import timezone

class ActiveUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # لا تسجل نشاط الأدمن
        if request.path.startswith('/admin/'):
            return response

        # استخدم session key كمعرف فريد للزائر
        session_key = request.session.session_key
        if not session_key:
            request.session.save()
            session_key = request.session.session_key

        # قائمة الزوار النشطين يتم تخزينها في الذاكرة المؤقتة
        active_users = cache.get('active_users', {})

        # يتم تسجيل وقت آخر نشاط للزائر
        active_users[session_key] = timezone.now()

        cache.set('active_users', active_users)

        return response