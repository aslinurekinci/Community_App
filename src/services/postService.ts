import { POSTS_PAGE_SIZE } from '../constants/api';
import { Post, PostUser } from '../types';
import { apiRequest } from './api';

type PostsResponse = {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
};

type SearchResponse = PostsResponse;

type CommentsMetaResponse = {
  total: number;
};

export async function fetchPosts(
  skip: number,
  limit = POSTS_PAGE_SIZE,
): Promise<PostsResponse> {
  return apiRequest<PostsResponse>(`/posts?limit=${limit}&skip=${skip}`);
}

export async function searchPosts(query: string): Promise<SearchResponse> {
  const encoded = encodeURIComponent(query.trim());
  return apiRequest<SearchResponse>(`/posts/search?q=${encoded}`);
}

export async function fetchPostsByTag(
  tag: string,
  skip: number,
  limit = POSTS_PAGE_SIZE,
): Promise<PostsResponse> {
  const encodedTag = encodeURIComponent(tag);
  return apiRequest<PostsResponse>(
    `/posts/tag/${encodedTag}?limit=${limit}&skip=${skip}`,
  );
}

export async function fetchPostCommentsCount(postId: number): Promise<number> {
  const data = await apiRequest<CommentsMetaResponse>(
    `/posts/${postId}/comments?limit=1`,
  );
  return data.total;
}

export async function fetchUser(userId: number): Promise<PostUser> {
  return apiRequest<PostUser>(`/users/${userId}`);
}

export async function fetchUsersByIds(
  userIds: number[],
): Promise<Map<number, PostUser>> {
  const uniqueIds = [...new Set(userIds)];
  const users = await Promise.all(uniqueIds.map(id => fetchUser(id)));
  return new Map(users.map(user => [user.id, user]));
}

export async function fetchPostsByUser(
  userId: number,
  limit = POSTS_PAGE_SIZE,
): Promise<PostsResponse> {
  return apiRequest<PostsResponse>(`/posts/user/${userId}?limit=${limit}`);
}
