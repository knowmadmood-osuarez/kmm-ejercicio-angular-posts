// Models
export type { Post, PostCreate, PostUpdate } from './lib/models/post.model';
export type { Comment } from './lib/models/comment.model';

// Services
export { PostsService } from './lib/services/posts.service';
export type { PostFilters } from './lib/services/post-filters.utils';
export { PostDetailService } from './lib/services/post-detail.service';
export { CommentsService, sortByNewest } from './lib/services/comments.service';

// Facades
export { PostsFacade, type PaginationState } from './lib/facades/posts.facade';
export { CommentsFacade } from './lib/facades/comments.facade';

// Guards
export { postOwnerGuard } from './lib/guards/post-owner.guard';
