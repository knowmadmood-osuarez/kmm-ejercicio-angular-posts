import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { API_URL } from '@app/core';
import { postOwnerGuard } from './post-owner.guard';
import type { Post } from '../models/post.model';
import type { User } from '@app/core';

const mockUser: User = {
  id: 1,
  name: 'alice',
  password: 'alice123',
  email: 'alice@example.com',
  avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=alice',
};

const mockPost: Post = {
  id: 42,
  userId: 1,
  title: 'Alice Post',
  body: 'Body text',
  tags: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

function buildRoute(id: string): ActivatedRouteSnapshot {
  const snapshot = new ActivatedRouteSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (snapshot as any).params = { id };
  return snapshot;
}

const dummyState = {} as RouterStateSnapshot;

describe('postOwnerGuard', () => {
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    httpTesting?.verify();
  });

  function setup(opts: { authenticated?: boolean } = {}) {
    if (opts.authenticated) {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'test-token');
    }

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  it('allows access when current user owns the post', async () => {
    setup({ authenticated: true });
    const route = buildRoute('42');

    const promise = TestBed.runInInjectionContext(() => postOwnerGuard(route, dummyState));

    httpTesting.expectOne('http://localhost:3000/posts/42').flush(mockPost);

    expect(await promise).toBe(true);
  });

  it('redirects to /posts/:id when user is NOT the owner', async () => {
    setup({ authenticated: true });
    const route = buildRoute('42');
    const spy = vi.spyOn(router, 'createUrlTree');

    const otherPost = { ...mockPost, userId: 99 };
    const promise = TestBed.runInInjectionContext(() => postOwnerGuard(route, dummyState));

    httpTesting.expectOne('http://localhost:3000/posts/42').flush(otherPost);

    await promise;
    expect(spy).toHaveBeenCalledWith(['/posts', '42']);
  });

  it('redirects to /posts when not authenticated', async () => {
    setup({ authenticated: false });
    const route = buildRoute('42');
    const spy = vi.spyOn(router, 'createUrlTree');

    const result = await TestBed.runInInjectionContext(() => postOwnerGuard(route, dummyState));

    httpTesting.expectNone('http://localhost:3000/posts/42');
    expect(spy).toHaveBeenCalledWith(['/posts']);
    expect(result).toEqual(router.createUrlTree(['/posts']));
  });

  it('redirects to /posts on HTTP error', async () => {
    setup({ authenticated: true });
    const route = buildRoute('42');
    const spy = vi.spyOn(router, 'createUrlTree');

    const promise = TestBed.runInInjectionContext(() => postOwnerGuard(route, dummyState));

    httpTesting
      .expectOne('http://localhost:3000/posts/42')
      .flush('Not found', { status: 404, statusText: 'Not Found' });

    await promise;
    expect(spy).toHaveBeenCalledWith(['/posts']);
  });
});
