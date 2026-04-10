export interface Comment {
  id: number;
  postId: number;
  userId: number;
  body: string;
  createdAt: string;
}

export type CommentCreate = Omit<Comment, 'id'>;
export type CommentUpdate = Pick<Comment, 'body'>;
