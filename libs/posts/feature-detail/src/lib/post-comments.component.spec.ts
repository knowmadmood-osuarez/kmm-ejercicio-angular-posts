import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { signal } from '@angular/core';

import type { User } from '@app/core';
import { AuthService, ToastService } from '@app/core';
import type { Comment } from '@app/posts/data-access';
import { CommentsService, PostsService } from '@app/posts/data-access';

import { PostCommentsComponent } from './post-comments.component';

const mockUser: User = {
  id: '1',
  name: 'alice',
  password: 'alice123',
  email: 'alice@test.com',
  avatar: '',
};

const mockComment: Comment = {
  id: '1',
  postId: '10',
  userId: '1',
  body: 'Great post!',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup() {
  TestBed.configureTestingModule({
    imports: [PostCommentsComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([], withComponentInputBinding()),
      translocoProviders,
    ],
  });

  const fixture: ComponentFixture<PostCommentsComponent> =
    TestBed.createComponent(PostCommentsComponent);
  fixture.componentRef.setInput('postId', '10');
  fixture.detectChanges();

  return {
    fixture,
    component: fixture.componentInstance,
    commentsService: TestBed.inject(CommentsService),
    authService: TestBed.inject(AuthService),
    toast: TestBed.inject(ToastService),
  };
}

describe('PostCommentsComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('getAuthor returns the matching user', () => {
    const { component } = setup();
    const postsService = TestBed.inject(PostsService);
    vi.spyOn(postsService, 'users').mockReturnValue([mockUser]);
    expect(component.getAuthor('1')).toEqual(mockUser);
  });

  it('getAuthor returns undefined for unknown userId', () => {
    const { component } = setup();
    const postsService = TestBed.inject(PostsService);
    vi.spyOn(postsService, 'users').mockReturnValue([mockUser]);
    expect(component.getAuthor('999')).toBeUndefined();
  });

  it('isCommentOwner returns true when matching currentUser', () => {
    const { component } = setup();
    Object.defineProperty(component, 'currentUser', { value: signal(mockUser) });
    expect(component.isCommentOwner('1')).toBe(true);
  });

  it('isCommentOwner returns false when not matching', () => {
    const { component } = setup();
    expect(component.isCommentOwner('999')).toBe(false);
  });

  it('onEditComment sets editingComment', () => {
    const { component } = setup();
    component.onEditComment(mockComment);
    expect(component.editingComment()).toEqual(mockComment);
  });

  it('onCancelEdit resets editingComment to null', () => {
    const { component } = setup();
    component.onEditComment(mockComment);
    component.onCancelEdit();
    expect(component.editingComment()).toBeNull();
  });

  it('onDeleteRequest sets confirmDeleteId', () => {
    const { component } = setup();
    component.onDeleteRequest('5');
    expect(component.confirmDeleteId()).toBe('5');
  });

  it('onDeleteCancelled resets confirmDeleteId', () => {
    const { component } = setup();
    component.onDeleteRequest('5');
    component.onDeleteCancelled();
    expect(component.confirmDeleteId()).toBeNull();
  });

  it('onAddComment does nothing if no user', async () => {
    const { component, commentsService } = setup();
    const spy = vi.spyOn(commentsService, 'createComment');
    await component.onAddComment('test');
    expect(spy).not.toHaveBeenCalled();
  });

  it('onAddComment creates comment and shows toast', async () => {
    const { component, commentsService, toast } = setup();
    Object.defineProperty(component, 'currentUser', { value: signal(mockUser) });
    vi.spyOn(commentsService, 'createComment').mockResolvedValue(mockComment);
    const toastSpy = vi.spyOn(toast, 'success');

    await component.onAddComment('new comment');

    expect(commentsService.createComment).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('toast.commentCreated');
    expect(component.isSubmitting()).toBe(false);
  });

  it('onUpdateComment does nothing if no editing comment', async () => {
    const { component, commentsService } = setup();
    const spy = vi.spyOn(commentsService, 'updateComment');
    await component.onUpdateComment('text');
    expect(spy).not.toHaveBeenCalled();
  });

  it('onUpdateComment updates and reloads', async () => {
    const { component, commentsService, toast } = setup();
    component.onEditComment(mockComment);
    vi.spyOn(commentsService, 'updateComment').mockResolvedValue(mockComment);
    vi.spyOn(commentsService.commentsResource, 'reload');
    const toastSpy = vi.spyOn(toast, 'success');

    await component.onUpdateComment('updated body');

    expect(commentsService.updateComment).toHaveBeenCalledWith('1', { body: 'updated body' });
    expect(component.editingComment()).toBeNull();
    expect(toastSpy).toHaveBeenCalledWith('toast.commentUpdated');
  });

  it('onDeleteConfirmed does nothing if no confirmDeleteId', async () => {
    const { component, commentsService } = setup();
    const spy = vi.spyOn(commentsService, 'deleteComment');
    await component.onDeleteConfirmed();
    expect(spy).not.toHaveBeenCalled();
  });

  it('onDeleteConfirmed deletes and reloads', async () => {
    const { component, commentsService, toast } = setup();
    component.onDeleteRequest('1');
    vi.spyOn(commentsService, 'deleteComment').mockResolvedValue();
    vi.spyOn(commentsService.commentsResource, 'reload');
    const toastSpy = vi.spyOn(toast, 'success');

    await component.onDeleteConfirmed();

    expect(commentsService.deleteComment).toHaveBeenCalledWith('1');
    expect(component.confirmDeleteId()).toBeNull();
    expect(toastSpy).toHaveBeenCalledWith('toast.commentDeleted');
  });

  it('onRetry reloads the commentsResource', () => {
    const { component, commentsService } = setup();
    const spy = vi.spyOn(commentsService.commentsResource, 'reload');
    component.onRetry();
    expect(spy).toHaveBeenCalled();
  });

  it('renders comment list when comments are loaded', () => {
    const mockCommentsService = {
      commentsResource: {
        value: signal<Comment[]>([mockComment]),
        isLoading: signal(false),
        error: signal(undefined),
        reload: vi.fn(),
      },
      optimistic: signal<Comment[]>([]),
      loadForPost: vi.fn(),
      createComment: vi.fn(),
      updateComment: vi.fn(),
      deleteComment: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [PostCommentsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([], withComponentInputBinding()),
        translocoProviders,
        { provide: CommentsService, useValue: mockCommentsService },
      ],
    });

    const fixture = TestBed.createComponent(PostCommentsComponent);
    fixture.componentRef.setInput('postId', '10');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(1);
  });
});
