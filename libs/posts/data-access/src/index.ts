// Models
export type { Post, PaginatedPosts, PostCreate, PostUpdate } from './lib/models/post.model';
export type {
  Comment,
  PaginatedComments,
  CommentCreate,
  CommentUpdate,
} from './lib/models/comment.model';

// Services
export { PostsService, type PostFilters } from './lib/services/posts.service';
export { CommentsService, sortByNewest } from './lib/services/comments.service';

// Guards
export { postOwnerGuard } from './lib/guards/post-owner.guard';
