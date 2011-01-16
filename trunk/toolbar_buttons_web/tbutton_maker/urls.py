from django.conf.urls.defaults import *

urlpatterns = patterns('toolbar_buttons_web.tbutton_maker',
    (r'^custom/create-addon/$', 'views.create'),
    (r'^custom/((?P<locale_name>[a-z]{2}(-[A-Z]{2})?)/)?((?P<applications>[a-z]+)/)?$',
        'views.index'),
)