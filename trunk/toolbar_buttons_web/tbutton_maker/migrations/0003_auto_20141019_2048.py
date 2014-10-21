# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tbutton_maker', '0002_auto_20141019_2034'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tbuttonrequest',
            name='poster',
        ),
        migrations.RemoveField(
            model_name='tbuttonrequest',
            name='subscriptions',
        ),
        migrations.RemoveField(
            model_name='tbuttonrequestcomment',
            name='poster',
        ),
        migrations.RemoveField(
            model_name='tbuttonrequestcomment',
            name='request',
        ),
        migrations.DeleteModel(
            name='TbuttonRequest',
        ),
        migrations.DeleteModel(
            name='TbuttonRequestComment',
        ),
    ]
