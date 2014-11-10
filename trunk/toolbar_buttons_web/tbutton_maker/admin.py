from django.contrib import admin
from toolbar_buttons.toolbar_buttons_web.tbutton_maker.models import Application, Button, DownloadSession

class DownloadSessionAdmin(admin.ModelAdmin):
    list_display = ['time', 'query_string']
admin.site.register(DownloadSession, DownloadSessionAdmin)