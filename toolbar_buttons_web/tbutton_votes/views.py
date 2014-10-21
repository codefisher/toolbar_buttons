from django.shortcuts import render

from toolbar_buttons.toolbar_buttons_web.tbutton_votes.models import TbuttonRequest, TbuttonRequestComment

from upvotes.views import MakeRequest, RequestList, RequestView, RequestVote, RequestVoteAjax, RequestFollow
from upvotes.forms import get_request_form, get_anon_request_form, get_request_comment_form, get_anon_request_comment_form

TbuttonRequestForm = get_request_form(TbuttonRequest, ('application', ))
TbuttonRequestAnonymousForm = get_anon_request_form(TbuttonRequest, ('application', ))
TbuttonRequestCommentForm = get_request_comment_form(TbuttonRequestComment)
TbuttonRequestCommentAnonymousForm = get_anon_request_comment_form(TbuttonRequestComment)

class MakeTbuttonRequet(MakeRequest):
    template = 'tbutton_votes/make.html'
    title = "Make a Toolbar Button Request"
    request_url = 'tbutton-request'
    spam_url = 'tbutton-request-spam'
    request_form = TbuttonRequestForm
    request_anonymous_form = TbuttonRequestAnonymousForm
    
class TbuttonRequestView(RequestView):
    template = 'tbutton_votes/request.html'
    request_class = TbuttonRequest
    spam_url = 'tbutton-comment-spam'
    request_url = 'tbutton-request'
    comment_form = TbuttonRequestCommentForm
    comment_anonymous_form = TbuttonRequestCommentAnonymousForm

class TbuttonVote(object):
    request_class = TbuttonRequest
    session_id = 'tbutton-voted-%s'
    request_url = 'tbutton-request'
    duplicate_vote_message = "You can not up vote a button request multiple times."
    
class TbuttonRequestVote(TbuttonVote, RequestVote):
    pass

class TbuttonRequestVoteAjax(TbuttonVote, RequestVoteAjax):
    pass

class TbuttonRequestFollow(RequestFollow):
    request_class = TbuttonRequest
    request_url = 'tbutton-request'

    def get_subscriptions(self, request):
        return request.user.tbutton_request_subscriptions

class RequestTbuttonList(RequestList):
    template = 'tbutton_votes/index.html'
    title = "Toolbar Button Requests"
    request_class = TbuttonRequest