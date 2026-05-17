import { Comment } from '../types';
import { apiRequest } from './api';

type CommentsResponse = {
  comments: ApiComment[];
  total: number;
};

type ApiComment = {
  id: number;
  body: string;
  postId: number;
  likes?: number;
  user: {
    id: number;
    username?: string;
    fullName: string;
  };
};

type CreateCommentResponse = ApiComment;

export const DEMO_USER_ID = 1;

function mapComment(raw: ApiComment): Comment {
  return {
    id: raw.id,
    body: raw.body,
    postId: raw.postId,
    likes: raw.likes ?? 0,
    user: raw.user,
  };
}

export async function fetchPostComments(postId: number): Promise<Comment[]> {
  const data = await apiRequest<CommentsResponse>(
    `/posts/${postId}/comments?limit=30`,
  );
  return data.comments.map(mapComment);
}

export async function createComment(
  postId: number,
  body: string,
  userId = DEMO_USER_ID,
): Promise<Comment> {
  const raw = await apiRequest<CreateCommentResponse>('/comments/add', {
    method: 'POST',
    body: { body, postId, userId },
  });
  return mapComment(raw);
}
