from django.conf.urls import patterns, url, include

from toolbar_buttons.toolbar_buttons_web.tbutton_votes import views
from upvotes import views as upvotes_views

urlpatterns = patterns('', 
    url(r'^$', views.RequestTbuttonList.as_view(), name='tbutton-request'),
    url(r'^page/(?P<page>\d+)/$', views.RequestTbuttonList.as_view(), name='tbutton-request'),
    url(r'^(?P<request_id>\d+)/$', views.TbuttonRequestView.as_view(), name='tbutton-request'),
    url(r'^follow/$', views.TbuttonRequestFollow.as_view(), name='tbutton-request-follow'),
    url(r'^make/$', views.MakeTbuttonRequet.as_view(), name='tbutton-request-make'),
    url(r'^spam/$', upvotes_views.request_spam, name='tbutton-request-spam'),
    url(r'^comment/spam/$', upvotes_views.comment_spam, name='tbutton-request-comment-spam'),
    url(r'^vote/$', views.TbuttonRequestVote.as_view(), name='tbutton-request-vote'),
)