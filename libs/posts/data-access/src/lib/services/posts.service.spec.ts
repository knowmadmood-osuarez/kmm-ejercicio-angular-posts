import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_URL } from '@app/core';
import { PostsService } from './posts.service';
import type { Post, PaginatedPosts } from '../models/post.model';

const mockPost: Post = {
  id: 1,
  userId: 1,
  title: 'Test Post',
  body: 'Test body content',
  tags: ['angular', 'testing'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockPaginated: PaginatedPosts = {
  data: [mockPost],
  first: 1,
  prev: null,
  next: null,
  last: 1,
  pages: 1,
  items: 1,
};

describe('PostsService', () => {
  let service: PostsService;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    });

    service = TestBed.inject(PostsService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);

    // httpResource fires GET /posts and GET /users automatically on creation
    appRef.tick();
    httpTesting.expectOne((r) => r.url === 'http://localhost:3000/posts').flush(mockPaginated);
    httpTesting.expectOne('http://localhost:3000/users').flush([]);
  });

  afterEach(() => httpTesting.verify());

  describe('filters signal', () => {
    it('initializes with default values', () => {
      expect(service.filters()).toEqual({ page: 1, q: '', author: '', tag: '' });
    });

    it('can be updated', () => {
      service.filters.set({ page: 2, q: 'angular', author: '1', tag: 'ts' });
      appRef.tick();
      // filters change triggers a new postsResource request
      httpTesting.expectOne((r) => r.url === 'http://localhost:3000/posts').flush(mockPaginated);
      expect(service.filters()).toEqual({ page: 2, q: 'angular', author: '1', tag: 'ts' });
    });
  });

  describe('createPost', () => {
    it('sends POST request and returns created post', async () => {
      const newPost = { userId: 1, title: 'New', body: 'Body', tags: [], createdAt: '' };

      const promise = service.createPost(newPost);
      appRef.tick();

      const req = httpTesting.expectOne('http://localhost:3000/posts');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPost);
      req.flush(mockPost);

      expect(await promise).toEqual(mockPost);
    });
  });

  describe('updatePost', () => {
    it('sends PATCH request with changes', async () => {
      const changes = { title: 'Updated Title' };

      const promise = service.updatePost(1, changes);
      appRef.tick();

      const req = httpTesting.expectOne('http://localhost:3000/posts/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(changes);
      req.flush({ ...mockPost, ...changes });

      const result = await promise;
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('deletePost', () => {
    it('sends DELETE request', async () => {
      const promise = service.deletePost(1);
      appRef.tick();

      const req = httpTesting.expectOne('http://localhost:3000/posts/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('loadDetail', () => {
    it('fires GET /posts/:id when detail ID is set', () => {
      service.loadDetail(42);
      appRef.tick();
      const req = httpTesting.expectOne('http://localhost:3000/posts/42');
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });
  });

  describe('prefetch', () => {
    it('fires a GET request for a new post ID', () => {
      service.prefetch(5);
      const req = httpTesting.expectOne('http://localhost:3000/posts/5');
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });

    it('does not fire a second request for an already prefetched ID', () => {
      service.prefetch(5);
      httpTesting.expectOne('http://localhost:3000/posts/5').flush(mockPost);
      service.prefetch(5);
      httpTesting.expectNone('http://localhost:3000/posts/5');
    });
  });
});
