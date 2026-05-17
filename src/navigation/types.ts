import { EnrichedPost } from '../types';

export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { post: EnrichedPost };
  UserProfile: { userId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  PostDetail: { post: EnrichedPost };
  UserProfile: { userId: number };
};

export type MainTabParamList = {
  FeedTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Main: undefined;
};
