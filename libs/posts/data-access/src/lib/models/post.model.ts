export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

/** Paginated response shape returned by json-server v1 with `_page` param. */
export interface PaginatedPosts {
  data: Post[];
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
}
