from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from presentation.models import *
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from presentation.Serializers import *
from django.db.models import Q
from urllib.parse import urlparse
from .Viewsets import urlutil
from rest_framework.decorators import permission_classes

# reference: https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a


@api_view(['GET'])
def currentUser(request):
    """
    Determine the current user by their token, and return their data
    """

    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def getAuthorForUser(request):
    try:
        who = ""
        if request.method == 'GET':
            who = request.user.username
            author = Author.objects.get(user=request.user.pk)
            serializer = AuthorSerializer(author)
            return Response(serializer.data, 200)
        elif request.method == 'POST':
            user = request.data.get('username', None)
            if user:
                who = user
                author = Author.objects.get(
                    user=User.objects.get(username=user).pk)
                serializer = AuthorSerializer(author)
                return Response(serializer.data, 200)
            else:
                raise KeyError("Incorrect post request.")
    except KeyError as e:
        return Response({"msg": e.args}, 200)
    except Author.DoesNotExist:
        return Response({"msg": "Cannot find corresponding author for " + str(who) + "."}, 200)
    except User.DoesNotExist:
        return Response({"msg": "Cannot find corresponding author for " + str(who) + "."}, 200)
    except:
        return Response({"msg": "Internal server error."}, 500)


class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """

    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes((permissions.AllowAny, ))
def getUserMod(request, username):
    try:
        usermod = Usermod.objects.get(
            user=User.objects.get(username=username).pk)
        serializer = UsermodSerializer(usermod)
        return Response(serializer.data, 200)
    except User.DoesNotExist:
        return Response({"allowLogin": False, "msg": f"{username} does not exist."}, 200)
    except Usermod.DoesNotExist:
        return Response({"allowLogin": False, "msg": "Usermod info missing, please contact administrator."}, 200)
    except:
        return Response({"allowLogin": False, "msg": "Internal server error."}, 500)


@api_view(['GET'])
def getAllPublicPosts(request):
    queryset = Post.objects.filter(visibility='PUBLIC', unlisted=False)
    return Response(PostSerializer(queryset, many=True).data)


@api_view(['GET'])
def getFriendsList(request, author_id):
    host = urlutil.getSafeURL(request.build_absolute_uri())
    au_id = f"{host}/author/{author_id}"
    return_list = []
    # author = Author.objects.get(id=au_id)
    follower = Follower.objects.get(owner=au_id)
    for each_f in follower.items:
        # each_au = Author.objects.get(id=each_f)
        each_au_f = Follower.objects.filter(owner=each_f)
        if each_au_f.exists():
            each_au_f = Follower.objects.get(owner=each_f)
            if au_id in each_au_f.items:
                # AuthorSerializer(each_f, many=False).data -> each-f
                return_list.append(each_f)
    return Response(return_list)


@api_view(['GET'])
def getInboxPost(request, author_id):

    host = urlutil.getSafeURL(request.build_absolute_uri())
    au_id = f"{host}/author/{author_id}"
    inbox = Inbox.objects.get(author=au_id)
    post_list = []
    for each in inbox.items:
        if each["type"] == "post":
            post_list.append(each)
    return Response(post_list)


@api_view(['GET'])
def getInboxRequest(request, author_id):
    host = urlutil.getSafeURL(request.build_absolute_uri())
    au_id = f"{host}/author/{author_id}"
    inbox = Inbox.objects.get(author=au_id)
    request_list = []
    for each in inbox.items:
        if each["type"] == "follow":
            request_list.append(each)
    return Response(request_list)


@api_view(['GET'])
def getInboxLike(request, author_id):
    host = urlutil.getSafeURL(request.build_absolute_uri())
    au_id = f"{host}/author/{author_id}"
    inbox = Inbox.objects.get(author=au_id)
    like_list = []
    for each in inbox.items:
        if each["type"] == "Like":
            like_list.append(each)
    return Response(like_list)


@api_view(['GET'])
def getAllAuthors(request):
    queryset = Author.objects.all()
    return Response(AuthorSerializer(queryset, many=True).data)
