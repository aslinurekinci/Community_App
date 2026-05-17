export type FeedCategory = {
  id: string;
  label: string;
  /** DummyJSON tag slug — `GET /posts/tag/{tag}` */
  apiTag?: string;
};

export const FEED_CATEGORIES: FeedCategory[] = [
  { id: 'all', label: 'Hepsi' },
  { id: 'tech', label: 'Teknoloji', apiTag: 'engineering' },
  { id: 'life', label: 'Yaşam', apiTag: 'life' },
  { id: 'art', label: 'Sanat', apiTag: 'art' },
  { id: 'travel', label: 'Gezi', apiTag: 'adventure' },
];

export function getCategoryApiTag(categoryId: string): string | null {
  const category = FEED_CATEGORIES.find(c => c.id === categoryId);
  return category?.apiTag ?? null;
}
