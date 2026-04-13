import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_URL } from '@app/core';
import { PostDetailService } from './post-detail.service';
import type { Post } from '../models/post.model';

const mockPost: Post = {
  id: '1',
  userId: '1',
  title: 'Test Post',
  body: 'Test body content',
  tags: ['angular', 'testing'],
  createdAt: '2024-01-01T00:00:00.000Z',
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

  return {
    service: TestBed.inject(PostDetailService),
    httpTesting: TestBed.inject(HttpTestingController),
    appRef: TestBed.inject(ApplicationRef),
  };
}

describe('PostDetailService', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
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

    it('clears prefetch cache on error so ID can be retried', async () => {
      const { service, httpTesting, appRef } = setupTestBed();
      service.prefetch('5');
      httpTesting
        .expectOne('http://localhost:3000/posts/5')
        .flush('err', { status: 500, statusText: 'Error' });
      await appRef.whenStable();
      service.prefetch('5');
      const req = httpTesting.expectOne('http://localhost:3000/posts/5');
      req.flush(mockPost);
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
});
