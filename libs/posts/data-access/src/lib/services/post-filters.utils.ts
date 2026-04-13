import { Post } from '../models/post.model';

export interface PostFilters {
  q: string;
  author: string;
  tag: string;
}

export const PAGE_SIZE = 12;

export function filtersEqual(a: PostFilters, b: PostFilters): boolean {
  return a.q === b.q && a.author === b.author && a.tag === b.tag;
}

export function applyClientFilters(posts: Post[], filters: PostFilters): Post[] {
  let result = posts;
  if (filters.tag) {
    result = result.filter((p) => p.tags.includes(filters.tag));
  }
  if (filters.q) {
    const query = filters.q.toLowerCase();
    result = result.filter(
      (p) => p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query),
    );
  }
  return result;
}
