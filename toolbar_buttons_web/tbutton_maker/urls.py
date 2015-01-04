from django.conf.urls import patterns, url, include
from toolbar_buttons.toolbar_buttons_web.tbutton_maker import views, link_button

urlpatterns = patterns('',
    url(r'^$', views.homepage, name='tbutton-homepage'),
    url(r'^custom/create-addon/$', views.create, name='tbutton-create'),
    url(r'^statistics/', views.statistics, name='tbutton-statistics'),
    url(r'^toolbar_button_maker/$', views.index, name='tbutton-custom'),
    url(r'^toolbar_button_maker/(?P<locale_name>[a-z]{2}(-[A-Z]{2})?)/$',
        views.index, name='tbutton-custom'),
    url(r'^toolbar_button_maker/(?P<locale_name>[a-z]{2}(-[A-Z]{2})?)/(?P<applications>[\w-]+)/$',
        views.index, name='tbutton-custom'),
     url(r'^suggestions/$',
        views.suggestions, name='tbutton-suggestions'),                      
    url(r'^button_list/$',
        views.list_buttons, name='tbutton-list'),
    url(r'^button_list/(?P<locale_name>[a-z]{2}(-[A-Z]{2})?)/$',
        views.list_buttons, name='tbutton-list'),
    url(r'^button_list/(?P<locale_name>[a-z]{2}(-[A-Z]{2})?)/(?P<applications>[\w,]+)/$',
        views.list_buttons, name='tbutton-list'),
    url(r'^custom_update', views.old_update),
    url(r'^static_update.rdf', views.update_static),
    url(r'^update.rdf', views.update, name='tbutton-update'),
    url(r'^make_button/', views.make, name='tbutton-make-button'),
    
    url(r'^(?P<mode>updated|installed|version)/(?P<version>[\w\.]+)/?', views.installed, name='tbutton-installed'),

    url(r'^link-button-maker/', link_button.index, name='lbutton-custom'),
    url(r'^link-button-create/', link_button.create, name='lbutton-create'),
    url(r'^link-button-make/', link_button.make, name='lbutton-make'),
    url(r'^link-button-update.rdf', link_button.update, name='lbutton-update'),
    url(r'^update-clb', link_button.update_legacy, name='lbutton-update-legacy'),
    url(r'^get_icons/', link_button.favicons, name='lbutton-custom-favicons'),

    url(r'^(?P<app_name>[\w]+)/', views.list_app_buttons, name='tbutton-make-button'),
)
