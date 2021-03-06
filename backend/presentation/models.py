from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
import uuid
from django.utils import timezone

VISIBILILTY_CHOICES = [
    ('PUBLIC', 'PUBLIC'),
    ('FRIENDS', 'FRIENDS'),
]

MAX_LENGTH = 200
MIN_LENGTH = 50


def default_list():
    return []


class Author(models.Model):
    type = "author"
    id = models.CharField(primary_key=True, max_length=MAX_LENGTH)
    host = models.CharField(max_length=MAX_LENGTH)
    displayName = models.CharField(max_length=MIN_LENGTH)
    url = models.CharField(max_length=MAX_LENGTH)  # url to the authors profile
    # HATEOS url for Github API
    github = models.CharField(max_length=MAX_LENGTH)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE)


class Follower(models.Model):
    type = "followers"
    owner = models.CharField(max_length=MAX_LENGTH)
    items = models.JSONField(default=default_list)


class Post(models.Model):
    type = "post"
    title = models.CharField(max_length=MAX_LENGTH, blank=True)
    id = models.CharField(primary_key=True, max_length=MAX_LENGTH, unique=True)
    source = models.CharField(max_length=MAX_LENGTH)
    origin = models.CharField(max_length=MAX_LENGTH)
    description = models.CharField(
        max_length=MAX_LENGTH, blank=True, null=True)
    contentType = models.CharField(max_length=MIN_LENGTH)
    content = models.TextField(blank=True)
    author = models.CharField(max_length=MAX_LENGTH)
    categories = models.JSONField(
        default=default_list, null=True)  # a list of string
    count = models.IntegerField()
    size = models.IntegerField()
    # the first page of comments
    comments = models.CharField(max_length=MAX_LENGTH)
    published = models.DateTimeField(
        default=timezone.now)  # ISO 8601 TIMESTAMP
    visibility = models.CharField(
        max_length=MIN_LENGTH, choices=VISIBILILTY_CHOICES, default='PUBLIC')
    # unlisted means it is public if you know the post name -- use this for images, it's so images don't show up in timelines
    unlisted = models.BooleanField()

    # https://stackoverflow.com/questions/62588857/how-can-i-create-custom-id-in-django/62588993#62588993
    # def save(self, *args, **kwargs):
    #    puuid = str(uuid.uuid4().hex)
    #    self.id = f"{self.author.id}/posts/{puuid}"
    #    super().save(*args, **kwargs)
    class Meta:
        ordering = ['-published']


class Comment(models.Model):
    type = "comment"
    author = models.CharField(max_length=MAX_LENGTH)
    post = models.CharField(max_length=MAX_LENGTH)
    comment = models.TextField()
    contentType = models.CharField(max_length=MIN_LENGTH)
    published = models.DateTimeField(default=timezone.now)
    id = models.CharField(primary_key=True, max_length=MAX_LENGTH, unique=True)

    class Meta:
        ordering = ['-published']


class Request(models.Model):
    type = "follow"
    summary = models.CharField(max_length=MIN_LENGTH)
    # send request
    actor = models.CharField(max_length=MAX_LENGTH)
    # recieve request
    object = models.CharField(max_length=MAX_LENGTH)


'''
The inbox is all the new posts from who you follow
'''


class Inbox(models.Model):
    type = "inbox"
    author = models.CharField(max_length=MAX_LENGTH)
    items = models.JSONField(default=default_list)  # contain Post objects


class Likes(models.Model):
    type = "Like"
    context = models.CharField(max_length=MAX_LENGTH)  # @context?
    summary = models.CharField(max_length=MIN_LENGTH)
    author = models.CharField(max_length=MAX_LENGTH)
    post_object = models.CharField(max_length=MAX_LENGTH, null=True)
    comment_object = models.CharField(max_length=MAX_LENGTH, null=True)


class Liked(models.Model):
    type = "liked"
    author = models.CharField(max_length=MAX_LENGTH)
    items = models.JSONField(default=default_list)  # contain Likes Objects


class Usermod(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # an user that only meant to be used to authenticate by external nodes
    allowLogin = models.BooleanField(default=False)


class Friend(models.Model):
    type = "friend"
    owner = models.CharField(max_length=MAX_LENGTH)
    items = models.JSONField(default=default_list)
