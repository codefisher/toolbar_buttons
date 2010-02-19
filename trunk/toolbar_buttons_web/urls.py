from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^toolbar_buttons_web/', include('toolbar_buttons_web.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # (r'^admin/', include(admin.site.urls)),
    (r'^custom/((?P<locale>[a-z]{2}(-[A-Z]{2}))/)?((?P<applcation>[a-z]+)/)?$',
        'toolbar_buttons_web.custom_maker.views.index')
)
