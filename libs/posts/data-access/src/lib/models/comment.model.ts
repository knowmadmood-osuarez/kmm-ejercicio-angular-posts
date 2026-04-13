export interface Comment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface PaginatedComments {
  data: Comment[];
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
}

export type CommentCreate = Omit<Comment, 'id'>;
export type CommentUpdate = Pick<Comment, 'body'>;
