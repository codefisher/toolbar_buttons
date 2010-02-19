# Create your views here.

from django.http import HttpResponse

def index(request, locale=None, applcation=None):
    return HttpResponse("Locale is %s, application is %s" % (locale, applcation))

