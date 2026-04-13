export interface Comment {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export type CommentCreate = Omit<Comment, 'id'>;
export type CommentUpdate = Pick<Comment, 'body'>;
