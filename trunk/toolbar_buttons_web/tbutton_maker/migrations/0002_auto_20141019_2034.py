# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tbutton_maker', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TbuttonRequest',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('message', models.TextField()),
                ('posted', models.DateTimeField(auto_now_add=True)),
                ('votes', models.IntegerField(default=1)),
                ('poster_name', models.CharField(max_length=50, null=True, blank=True)),
                ('poster_email', models.EmailField(max_length=75, null=True, blank=True)),
                ('ip', models.GenericIPAddressField()),
                ('closed', models.BooleanField(default=False)),
                ('close_reason', models.CharField(max_length=200, null=True, blank=True)),
                ('is_public', models.BooleanField(default=True, help_text=b'Uncheck this box to make the post effectively disappear from the site.', verbose_name=b'is public')),
                ('is_spam', models.BooleanField(default=False, help_text=b'Check this box to flag as spam.', verbose_name=b'is spam')),
                ('application', models.CharField(max_length=2, choices=[(b'FX', b'Firefox'), (b'TB', b'Thunderbird'), (b'OT', b'Other')])),
                ('poster', models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('subscriptions', models.ManyToManyField(related_name=b'tbutton_request_subscriptions', null=True, to=settings.AUTH_USER_MODEL, blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TbuttonRequestComment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('message', models.TextField()),
                ('posted', models.DateTimeField(auto_now_add=True)),
                ('poster_name', models.CharField(max_length=50, null=True, blank=True)),
                ('poster_email', models.EmailField(max_length=75, null=True, blank=True)),
                ('ip', models.GenericIPAddressField()),
                ('is_public', models.BooleanField(default=True, help_text=b'Uncheck this box to make the post effectively disappear from the site.', verbose_name=b'is public')),
                ('is_spam', models.BooleanField(default=False, help_text=b'Check this box to flag as spam.', verbose_name=b'is spam')),
                ('poster', models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('request', models.ForeignKey(related_name=b'comments', to='tbutton_maker.TbuttonRequest')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='downloadsession',
            name='time',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
