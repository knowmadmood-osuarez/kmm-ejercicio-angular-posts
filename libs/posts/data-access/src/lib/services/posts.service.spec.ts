import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_URL } from '@app/core';
import { PostsService } from './posts.service';
import type { PaginatedPosts, Post } from '../models/post.model';

const mockPost: Post = {
  id: '1',
  userId: '1',
  title: 'Test Post',
  body: 'Test body content',
  tags: ['angular', 'testing'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockPaginatedPage1: PaginatedPosts = {
  data: [mockPost],
  first: 1,
  prev: null,
  next: 2,
  last: 2,
  pages: 2,
  items: 2,
};

function setupTestBed() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: API_URL, useValue: 'http://localhost:3000' },
    ],
  });

  const service = TestBed.inject(PostsService);
  const httpTesting = TestBed.inject(HttpTestingController);
  const appRef = TestBed.inject(ApplicationRef);

  TestBed.tick();

  // Flush initial paginated request (has _page param from resetAndLoad)
  httpTesting
    .expectOne((r) => r.url === 'http://localhost:3000/posts' && r.params.has('_page'))
    .flush(mockPaginatedPage1);
  // Flush all-posts-for-tags request (no _page, no _sort)
  httpTesting
    .expectOne(
      (r) =>
        r.url === 'http://localhost:3000/posts' && !r.params.has('_page') && !r.params.has('_sort'),
    )
    .flush([mockPost]);
  httpTesting.expectOne('http://localhost:3000/users').flush([]);

  return { service, httpTesting, appRef };
}

describe('PostsService', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  describe('filters signal', () => {
    it('initializes with default values', () => {
      const { service } = setupTestBed();
      expect(service.filters()).toEqual({ q: '', author: '', tag: '' });
    });

    it('triggers a new request when filters change', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      service.filters.set({ q: '', author: '1', tag: '' });
      TestBed.tick();
      httpTesting
        .expectOne((r) => r.url === 'http://localhost:3000/posts' && r.params.has('_page'))
        .flush(mockPaginatedPage1);
      await appRef.whenStable();
      expect(service.filters()).toEqual({ q: '', author: '1', tag: '' });
    });
  });

  describe('uniqueTags', () => {
    it('derives tags from allPostsForTags resource', async () => {
      const { service, appRef } = setupTestBed();
      await appRef.whenStable();
      expect(service.uniqueTags()).toEqual(['angular', 'testing']);
    });
  });

  describe('loadNextPage (server pagination)', () => {
    it('increments page and fetches next page', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.loadNextPage();
      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.get('_page') === '2',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ ...mockPaginatedPage1, next: null });
      await appRef.whenStable();
      expect(service.hasMore()).toBe(false);
    });
  });

  describe('tag filter mode (client-side)', () => {
    it('fetches all posts and filters by tag client-side', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.filters.set({ q: '', author: '', tag: 'angular' });
      TestBed.tick();

      // Should fetch ALL posts (no _page) with _sort
      const req = httpTesting.expectOne(
        (r) =>
          r.url === 'http://localhost:3000/posts' &&
          r.params.has('_sort') &&
          !r.params.has('_page'),
      );
      req.flush([
        mockPost,
        { ...mockPost, id: '2', tags: ['signals'] },
        { ...mockPost, id: '3', tags: ['angular'] },
      ]);
      await appRef.whenStable();

      expect(service.totalItems()).toBe(2);
      expect(service.visiblePosts().length).toBe(2);
    });
  });

  describe('createPost', () => {
    it('sends POST request and returns created post', async () => {
      const { service, httpTesting } = setupTestBed();
      const newPost = {
        userId: '1',
        title: 'New',
        body: 'Body',
        tags: [] as string[],
        createdAt: '',
      };

      const promise = service.createPost(newPost);

      const req = httpTesting.expectOne('http://localhost:3000/posts');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ...newPost, userId: 1 });
      req.flush(mockPost);

      expect(await promise).toEqual(mockPost);
    });
  });

  describe('updatePost', () => {
    it('sends PATCH request with changes', async () => {
      const { service, httpTesting } = setupTestBed();
      const changes = { title: 'Updated Title' };

      const promise = service.updatePost('1', changes);

      const req = httpTesting.expectOne('http://localhost:3000/posts/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(changes);
      req.flush({ ...mockPost, ...changes });

      expect((await promise).title).toBe('Updated Title');
    });
  });

  describe('deletePost', () => {
    it('sends DELETE request', async () => {
      const { service, httpTesting } = setupTestBed();
      const promise = service.deletePost('1');

      const req = httpTesting.expectOne('http://localhost:3000/posts/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('loadDetail', () => {
    it('fires GET /posts/:id when detail ID is set', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      service.loadDetail('42');
      TestBed.tick();
      const req = httpTesting.expectOne('http://localhost:3000/posts/42');
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
      await appRef.whenStable();
    });
  });

  describe('prefetch', () => {
    it('fires a GET request for a new post ID', () => {
      const { service, httpTesting } = setupTestBed();
      service.prefetch('5');
      const req = httpTesting.expectOne('http://localhost:3000/posts/5');
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });

    it('does not fire a second request for an already prefetched ID', () => {
      const { service, httpTesting } = setupTestBed();
      service.prefetch('5');
      httpTesting.expectOne('http://localhost:3000/posts/5').flush(mockPost);
      service.prefetch('5');
      httpTesting.expectNone('http://localhost:3000/posts/5');
    });
  });
});
