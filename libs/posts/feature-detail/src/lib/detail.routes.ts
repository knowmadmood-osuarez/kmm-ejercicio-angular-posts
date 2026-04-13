import { Routes } from '@angular/router';

import { CommentsService, CommentsFacade } from '@app/posts/data-access';
import { PostDetailPageComponent } from './post-detail-page.component';

export const DETAIL_ROUTES: Routes = [
  {
    path: '',
    component: PostDetailPageComponent,
    providers: [CommentsService, CommentsFacade],
  },
];
