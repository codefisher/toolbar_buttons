import datetime
from django.db import models

# Create your models here.

class DownloadSession(models.Model):
    time = models.DateTimeField(default=datetime.datetime.now)
    query_string = models.TextField()

    def save(self, *args, **kwargs):
        super(DownloadSession, self).save(*args, **kwargs)

class Application(models.Model):
    session = models.ForeignKey(DownloadSession, related_name="applications")
    name = models.CharField(max_length=50)

class Button(models.Model):
    session = models.ForeignKey(DownloadSession, related_name="buttons")
    name = models.CharField(max_length=50)