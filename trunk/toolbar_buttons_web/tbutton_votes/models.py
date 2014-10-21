from django.db import models
from django.contrib.auth.models import User
from upvotes.models import AbstractRequest, AbstractRequestComment
from djangopress.core.format import format_markdown

class TbuttonRequest(AbstractRequest):
    
    APPLICATIONS = (
        ('FX', 'Firefox'),
        ('TB', 'Thunderbird'),
        ('OT', 'Other'),
    )
    
    application = models.CharField(choices=APPLICATIONS, max_length=2)
    subscriptions = models.ManyToManyField(User, null=True, blank=True, related_name='tbutton_request_subscriptions')
      
    def get_message(self):
        return format_markdown(self.message)
    
    def get_absolute_url(self, page=None):
        if page == None:
            page = TbuttonRequest.objects.filter(is_spam=False, is_public=True, posted__lt=self.posted).order_by('-votes', '-posted').count()/10 + 1
        if page == 1:
            return reverse("tbutton-request")
        return reverse("tbutton-request", kwargs={'page': page})
    
    def get_comments(self):
        return TbuttonRequestComment.objects.filter(request=self, is_public=True, is_spam=False)
       
class TbuttonRequestComment(AbstractRequestComment):
    request = models.ForeignKey(TbuttonRequest, related_name='comments')