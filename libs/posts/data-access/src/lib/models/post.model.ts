export interface Post {
  id: string;
  userId: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

// ...existing code...
export interface PaginatedPosts {
  data: Post[];
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
}

export type PostCreate = Omit<Post, 'id'>;
export type PostUpdate = Partial<Omit<Post, 'id' | 'userId' | 'createdAt'>>;
