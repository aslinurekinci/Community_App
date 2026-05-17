export type PostReactions = {
  likes: number;
  dislikes: number;
};

export type Post = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: PostReactions;
  views: number;
  userId: number;
  commentsCount?: number;
};

export type PostUser = {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
  username: string;
  city?: string;
};

export type EnrichedPost = Post & {
  authorName: string;
  authorImage?: string;
  authorInitials: string;
};

export type CommentUser = {
  id: number;
  username?: string;
  fullName: string;
};

export type Comment = {
  id: number | string;
  body: string;
  postId: number;
  likes?: number;
  user: CommentUser;
};

export type NotificationItem = {
  id: string;
  type: 'like' | 'comment' | 'post' | 'bookmark';
  text: string;
  read: boolean;
  timestamp: number;
};

export type NotificationType = NotificationItem['type'];
