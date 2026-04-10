import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_URL } from '@app/core';
import { CommentsService } from './comments.service';
import type { Comment } from '../models/comment.model';

const mockComment: Comment = {
  id: 1,
  postId: 10,
  userId: 1,
  body: 'Great post!',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('CommentsService', () => {
  let service: CommentsService;
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

    service = TestBed.inject(CommentsService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
    // commentsResource returns undefined until _postId is set — no initial requests
  });

  afterEach(() => httpTesting.verify());

  /** Helper: call loadForPost, tick to trigger httpResource, then flush the request. */
  function loadAndFlush(postId: number, response: Comment[] = [mockComment]): void {
    service.loadForPost(postId);
    TestBed.tick();
    httpTesting
      .expectOne(
        (r) =>
          r.url === 'http://localhost:3000/comments' && r.params.get('postId') === String(postId),
      )
      .flush(response);
  }

  describe('loadForPost', () => {
    it('triggers a GET /comments?postId=N request', async () => {
      service.loadForPost(10);
      // Signal change → TestBed.tick() triggers the httpResource reactive effect
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/comments' && r.params.get('postId') === '10',
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockComment]);
      await appRef.whenStable();
    });

    it('resets page to 1 when loading a new post', async () => {
      // Load post 10 page 1
      loadAndFlush(10);

      // Go to page 2
      service.loadNextPage();
      TestBed.tick();
      httpTesting.expectOne((r) => r.params.get('_page') === '2').flush([mockComment]);

      // Load a different post → page must reset to 1
      service.loadForPost(20);
      TestBed.tick();
      const req = httpTesting.expectOne((r) => r.params.get('postId') === '20');
      expect(req.request.params.get('_page')).toBe('1');
      req.flush([]);
      await appRef.whenStable();
    });
  });

  describe('loadNextPage', () => {
    it('increments the page param', async () => {
      loadAndFlush(10);

      service.loadNextPage();
      TestBed.tick();
      const req = httpTesting.expectOne((r) => r.params.get('_page') === '2');
      expect(req.request.params.get('_page')).toBe('2');
      req.flush([]);
      await appRef.whenStable();
    });
  });

  describe('createComment', () => {
    it('sends POST request and returns created comment', async () => {
      // Mutation uses HttpClient directly — no tick needed
      const newComment = { postId: 10, userId: 1, body: 'New comment', createdAt: '' };

      const promise = service.createComment(newComment);

      const req = httpTesting.expectOne('http://localhost:3000/comments');
      expect(req.request.method).toBe('POST');
      req.flush(mockComment);

      expect(await promise).toEqual(mockComment);
    });
  });

  describe('updateComment', () => {
    it('sends PATCH request with body changes', async () => {
      const changes = { body: 'Updated body' };

      const promise = service.updateComment(1, changes);

      const req = httpTesting.expectOne('http://localhost:3000/comments/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(changes);
      req.flush({ ...mockComment, ...changes });

      expect((await promise).body).toBe('Updated body');
    });
  });

  describe('deleteComment', () => {
    it('sends DELETE request', async () => {
      const promise = service.deleteComment(1);

      const req = httpTesting.expectOne('http://localhost:3000/comments/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await expect(promise).resolves.toBeUndefined();
    });
  });
});
