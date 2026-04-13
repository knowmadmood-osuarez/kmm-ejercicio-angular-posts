import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_URL } from '@app/core';
import { CommentsService, sortByNewest } from './comments.service';
import type { Comment } from '../models/comment.model';

const mockComment: Comment = {
  id: '1',
  postId: '10',
  userId: '1',
  body: 'Great post!',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('sortByNewest', () => {
  it('sorts comments newest-first by createdAt', () => {
    const older: Comment = { ...mockComment, id: '1', createdAt: '2024-01-01T00:00:00.000Z' };
    const newer: Comment = { ...mockComment, id: '2', createdAt: '2024-06-01T00:00:00.000Z' };
    const result = sortByNewest([older, newer]);
    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('1');
  });

  it('returns a new array without mutating the original', () => {
    const comments = [mockComment];
    const result = sortByNewest(comments);
    expect(result).not.toBe(comments);
  });
});

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
        CommentsService,
      ],
    });

    service = TestBed.inject(CommentsService);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
    // commentsResource returns undefined until _postId is set — no initial requests
  });

  afterEach(() => httpTesting.verify());

  /** Helper: call loadForPost, tick to trigger httpResource, then flush the request. */
  function loadAndFlush(postId: string, response: Comment[] = [mockComment]): void {
    service.loadForPost(postId);
    TestBed.tick();
    httpTesting
      .expectOne(
        (r) => r.url === 'http://localhost:3000/comments' && r.params.get('postId') === postId,
      )
      .flush(response);
  }

  describe('loadForPost', () => {
    it('triggers a GET /comments?postId=N request', async () => {
      service.loadForPost('10');
      TestBed.tick();

      const req = httpTesting.expectOne(
        (r) => r.url === 'http://localhost:3000/comments' && r.params.get('postId') === '10',
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockComment]);
      await appRef.whenStable();
    });

    it('changes the postId to fetch a different post and clears optimistic', async () => {
      loadAndFlush('10');

      service.loadForPost('20');
      TestBed.tick();
      const req = httpTesting.expectOne((r) => r.params.get('postId') === '20');
      req.flush([]);
      expect(service.optimistic()).toEqual([]);
      await appRef.whenStable();
    });
  });

  describe('createComment (optimistic)', () => {
    it('adds an optimistic comment immediately before server responds', async () => {
      const newComment = {
        postId: '10',
        userId: '1',
        body: 'New comment',
        createdAt: '2024-06-01T00:00:00.000Z',
      };

      const promise = service.createComment(newComment);

      // Optimistic comment should appear instantly
      expect(service.optimistic().length).toBe(1);
      expect(service.optimistic()[0].body).toBe('New comment');
      expect(service.optimistic()[0].id).toContain('__temp_');

      // Flush the POST
      const postReq = httpTesting.expectOne('http://localhost:3000/comments');
      expect(postReq.request.method).toBe('POST');
      postReq.flush({ ...newComment, id: '99' });

      await promise;

      // After server confirms, optimistic is cleared
      expect(service.optimistic()).toEqual([]);
    });

    it('removes optimistic comment on server error', async () => {
      const newComment = { postId: '10', userId: '1', body: 'Fail', createdAt: '' };

      const promise = service.createComment(newComment).catch(() => undefined);

      expect(service.optimistic().length).toBe(1);

      httpTesting
        .expectOne('http://localhost:3000/comments')
        .flush('error', { status: 500, statusText: 'Error' });

      await promise;
      expect(service.optimistic()).toEqual([]);
    });
  });

  describe('updateComment', () => {
    it('sends PATCH request with body changes', async () => {
      const changes = { body: 'Updated body' };

      const promise = service.updateComment('1', changes);

      const req = httpTesting.expectOne('http://localhost:3000/comments/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(changes);
      req.flush({ ...mockComment, ...changes });

      expect((await promise).body).toBe('Updated body');
    });
  });

  describe('deleteComment', () => {
    it('sends DELETE request', async () => {
      const promise = service.deleteComment('1');

      const req = httpTesting.expectOne('http://localhost:3000/comments/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await expect(promise).resolves.toBeUndefined();
    });
  });
});
