import { Routes } from '@angular/router';

import { postOwnerGuard } from '@app/posts/data-access';
import { PostFormPageComponent } from './post-form-page.component';

export const FORM_ROUTES: Routes = [{ path: '', component: PostFormPageComponent }];

export const EDIT_FORM_ROUTES: Routes = [
  { path: '', component: PostFormPageComponent, canActivate: [postOwnerGuard] },
];
