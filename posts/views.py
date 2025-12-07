from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Post
from .serializers import PostSerializer, CreatePostSerializer
from jobs.models import JobPosting
from jobs.serializers import JobPostingSerializer


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_class(self):
        if self.action == 'create':
            return CreatePostSerializer
        return PostSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(user=request.user)
        output_serializer = PostSerializer(post, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        posts = Post.objects.all()
        jobs = JobPosting.objects.filter(status='active')

        feed_items = []

        for post in posts:
            post_data = PostSerializer(post, context={'request': request}).data
            post_data['item_type'] = 'post'
            feed_items.append(post_data)

        for job in jobs:
            job_data = JobPostingSerializer(job, context={'request': request}).data
            job_data['item_type'] = 'job'
            job_data['user'] = job.company.user.id
            job_data['user_name'] = f"{job.company.user.first_name} {job.company.user.last_name}"
            job_data['user_type'] = job.company.user.user_type
            job_data['user_profile_picture_url'] = None
            if job.company.profile_picture:
                job_data['user_profile_picture_url'] = request.build_absolute_uri(job.company.profile_picture.url)
            feed_items.append(job_data)

        feed_items.sort(key=lambda x: x['created_at'], reverse=True)

        return Response(feed_items)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.user != request.user:
            return Response({'detail': 'You do not have permission to delete this post.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
