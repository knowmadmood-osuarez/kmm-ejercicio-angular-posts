import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_URL, AuthService } from '@app/core';
import { Post } from '../models/post.model';

/**
 * Functional guard that verifies the current user owns the post being edited.
 * Used on `/posts/:id/edit` route.
 * Redirects to `/posts/:id` if the user is not the owner.
 */
export const postOwnerGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const http = inject(HttpClient);
  const apiUrl = inject(API_URL);
  const router = inject(Router);

  const postId = route.paramMap.get('id');
  const currentUser = authService.currentUser();

  if (!postId || !currentUser) {
    return router.createUrlTree(['/posts']);
  }

  try {
    const post = await firstValueFrom(http.get<Post>(`${apiUrl}/posts/${postId}`));

    if (String(post.userId) === String(currentUser.id)) {
      return true;
    }

    // Not the owner → redirect to detail (could show forbidden)
    return router.createUrlTree(['/posts', postId]);
  } catch {
    return router.createUrlTree(['/posts']);
  }
};
