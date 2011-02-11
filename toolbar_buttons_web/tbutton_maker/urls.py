from django.conf.urls.defaults import *

urlpatterns = patterns('toolbar_buttons.toolbar_buttons_web.tbutton_maker',
    url(r'^custom/create-addon/$', 'views.create', name='tbutton-create'),
    url(r'^custom/$',
        'views.index', name='tbutton-custom'),
    url(r'^custom/(?P<locale_name>[a-z]{2}(-[A-Z]{2})?)/$',
        'views.index', name='tbutton-custom'),
    url(r'^custom/(?P<locale_name>[a-z]{2}(-[A-Z]{2})?)/(?P<applications>[a-zA-Z,]+)/$',
        'views.index', name='tbutton-custom'),
)
