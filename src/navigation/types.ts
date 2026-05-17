import { EnrichedPost } from '../types';

export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { post: EnrichedPost };
  UserProfile: { userId: number };
};

export type RootStackParamList = {
  Main: undefined;
};
