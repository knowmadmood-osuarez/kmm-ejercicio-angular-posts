// Models
export type { Post, PaginatedPosts } from './lib/models/post.model';
export type { Comment } from './lib/models/comment.model';

// Services
export { PostsService, type PostFilters } from './lib/services/posts.service';
export { CommentsService } from './lib/services/comments.service';

// Guards
export { postOwnerGuard } from './lib/guards/post-owner.guard';
