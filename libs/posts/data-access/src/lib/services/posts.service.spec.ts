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

  describe('fetchPage error handling', () => {
    it('sets error signal when fetchPage fails', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      // Trigger a reload which does resetAndLoad → fetchPage
      service.reload();
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_page'),
      );
      req.flush('error', { status: 500, statusText: 'Error' });
      await appRef.whenStable();

      expect(service.error()).toBeTruthy();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('text search (q filter - client side)', () => {
    it('filters posts by title/body text client-side', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.filters.set({ q: 'test', author: '', tag: '' });
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) =>
          r.url === 'http://localhost:3000/posts' &&
          r.params.has('_sort') &&
          !r.params.has('_page'),
      );
      req.flush([
        mockPost,
        { ...mockPost, id: '2', title: 'Other', body: 'no match here' },
        { ...mockPost, id: '3', title: 'Another Test', body: 'content' },
      ]);
      await appRef.whenStable();

      // 'test' matches mockPost (title) and id '3' (title)
      expect(service.totalItems()).toBe(2);
    });
  });

  describe('client filter with author', () => {
    it('includes userId param when author filter is set with tag', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.filters.set({ q: '', author: '2', tag: 'angular' });
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) =>
          r.url === 'http://localhost:3000/posts' &&
          r.params.has('_sort') &&
          r.params.get('userId') === '2',
      );
      req.flush([mockPost]);
      await appRef.whenStable();

      expect(service.totalItems()).toBe(1);
    });
  });

  describe('fetchAllWithClientFilter error', () => {
    it('sets error when client filter fetch fails', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.filters.set({ q: 'search', author: '', tag: '' });
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_sort'),
      );
      req.flush('error', { status: 500, statusText: 'Error' });
      await appRef.whenStable();

      expect(service.error()).toBeTruthy();
    });
  });

  describe('loadNextPage client mode', () => {
    it('increases display limit in client filter mode', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      // Set tag filter to enable client mode
      service.filters.set({ q: '', author: '', tag: 'angular' });
      TestBed.tick();

      // Generate enough posts to have "more" (> PAGE_SIZE = 12)
      const manyPosts = Array.from({ length: 15 }, (_, i) => ({
        ...mockPost,
        id: String(i),
        tags: ['angular'],
      }));

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_sort'),
      );
      req.flush(manyPosts);
      await appRef.whenStable();

      expect(service.hasMore()).toBe(true);
      expect(service.visiblePosts().length).toBe(12);

      service.loadNextPage();
      expect(service.visiblePosts().length).toBe(15);
      expect(service.hasMore()).toBe(false);
    });
  });

  describe('loadNextPage guards', () => {
    it('does not load if isLoading is true', async () => {
      const { service, httpTesting } = setupTestBed();
      // isLoading is false after initial load, but set it true manually
      service.isLoading.set(true);
      service.loadNextPage();
      // No additional page request should be made
      httpTesting.expectNone(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.get('_page') === '2',
      );
    });

    it('does not load if isLoadingMore is true', async () => {
      const { service, httpTesting } = setupTestBed();
      service.isLoadingMore.set(true);
      service.loadNextPage();
      httpTesting.expectNone(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.get('_page') === '2',
      );
    });

    it('does not load if hasMore is false', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();
      // First page was next: 2, so hasMore is true. Load second page to exhaust.
      service.loadNextPage();
      httpTesting
        .expectOne((r) => r.url === 'http://localhost:3000/posts' && r.params.get('_page') === '2')
        .flush({ ...mockPaginatedPage1, next: null });
      await appRef.whenStable();

      expect(service.hasMore()).toBe(false);
      service.loadNextPage();
      httpTesting.expectNone(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.get('_page') === '3',
      );
    });
  });

  describe('fetchPage second page (isFirst=false)', () => {
    it('appends posts and sets isLoadingMore', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      const secondPost = { ...mockPost, id: '2', title: 'Second' };
      service.loadNextPage();

      expect(service.isLoadingMore()).toBe(true);

      httpTesting
        .expectOne((r) => r.url === 'http://localhost:3000/posts' && r.params.get('_page') === '2')
        .flush({ ...mockPaginatedPage1, data: [secondPost], next: null });
      await appRef.whenStable();

      expect(service.isLoadingMore()).toBe(false);
      // Posts should be appended, not replaced
      expect(service.visiblePosts().length).toBe(2);
      expect(service.visiblePosts()[1].id).toBe('2');
    });
  });

  describe('stale filter guards', () => {
    it('discards fetchPage response when filters changed during request', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      // Trigger reload
      service.reload();
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_page'),
      );

      // Change filters before flushing → stale response
      service.filters.set({ q: '', author: '99', tag: '' });
      TestBed.tick();

      // Flush original request — should be discarded
      req.flush(mockPaginatedPage1);

      // Flush the new request triggered by filter change
      httpTesting
        .expectOne(
          (r) =>
            r.url === 'http://localhost:3000/posts' &&
            r.params.has('_page') &&
            r.params.get('userId') === '99',
        )
        .flush({ ...mockPaginatedPage1, items: 0, data: [] });
      await appRef.whenStable();

      expect(service.totalItems()).toBe(0);
    });

    it('discards fetchAllWithClientFilter response when filters changed during request', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      // Set tag filter to enter client filter mode
      service.filters.set({ q: '', author: '', tag: 'angular' });
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_sort'),
      );

      // Change filters before flushing → stale response
      service.filters.set({ q: '', author: '', tag: 'signals' });
      TestBed.tick();

      // Flush original request — should be discarded
      req.flush([mockPost]);

      // Flush the new request triggered by the second filter change
      httpTesting
        .expectOne((r) => r.url === 'http://localhost:3000/posts' && r.params.has('_sort'))
        .flush([]);
      await appRef.whenStable();

      expect(service.totalItems()).toBe(0);
    });

    it('discards fetchPage error when filters changed during request', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.reload();
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_page'),
      );

      service.filters.set({ q: 'changed', author: '', tag: '' });
      TestBed.tick();

      // Flush original request with error — should be discarded
      req.flush('error', { status: 500, statusText: 'Error' });

      // Flush the new client-filter request
      httpTesting
        .expectOne((r) => r.url === 'http://localhost:3000/posts' && r.params.has('_sort'))
        .flush([]);
      await appRef.whenStable();

      expect(service.error()).toBeNull();
    });

    it('discards fetchAllWithClientFilter error when filters changed during request', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.filters.set({ q: 'test', author: '', tag: '' });
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_sort'),
      );

      // Change filters before flushing
      service.filters.set({ q: '', author: '1', tag: '' });
      TestBed.tick();

      // Flush original with error — should be discarded
      req.flush('error', { status: 500, statusText: 'Error' });

      // Flush the new paginated request
      httpTesting
        .expectOne((r) => r.url === 'http://localhost:3000/posts' && r.params.has('_page'))
        .flush(mockPaginatedPage1);
      await appRef.whenStable();

      expect(service.error()).toBeNull();
    });
  });

  describe('combined q and tag filter', () => {
    it('applies both q and tag filters simultaneously', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.filters.set({ q: 'test', author: '', tag: 'angular' });
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/posts' && r.params.has('_sort'),
      );
      req.flush([
        mockPost, // tags: ['angular', 'testing'], title: 'Test Post' — matches both
        { ...mockPost, id: '2', title: 'Other', body: 'no match', tags: ['angular'] }, // tag matches, q doesn't
        { ...mockPost, id: '3', title: 'Test Thing', body: 'c', tags: ['signals'] }, // q matches, tag doesn't
      ]);
      await appRef.whenStable();

      expect(service.totalItems()).toBe(1); // Only mockPost matches both
    });
  });

  describe('author param in fetchPage', () => {
    it('includes userId param when author filter is set without tag/q', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      await appRef.whenStable();

      service.filters.set({ q: '', author: '3', tag: '' });
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) =>
          r.url === 'http://localhost:3000/posts' &&
          r.params.has('_page') &&
          r.params.get('userId') === '3',
      );
      req.flush(mockPaginatedPage1);
      await appRef.whenStable();
      expect(service.visiblePosts().length).toBe(1);
    });
  });
});
