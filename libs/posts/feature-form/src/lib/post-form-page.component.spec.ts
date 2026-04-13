import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { signal } from '@angular/core';

import { AuthService, ToastService } from '@app/core';
import { PostDetailService, PostsService } from '@app/posts/data-access';

import { PostFormPageComponent } from './post-form-page.component';
import type { PostFormData } from './post-form.component';

const MOCK_POST = {
  id: '1',
  userId: '1',
  title: 'Existing Post',
  body: 'This is the existing body content for testing.',
  tags: ['angular', 'testing'],
  createdAt: new Date().toISOString(),
};

const MOCK_USER = { id: '1', name: 'alice', email: 'a@b.com', avatar: '' };

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup(postId?: string) {
  TestBed.configureTestingModule({
    imports: [PostFormPageComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter(
        [{ path: 'posts', component: PostFormPageComponent }],
        withComponentInputBinding(),
      ),
      translocoProviders,
    ],
  });

  const fixture: ComponentFixture<PostFormPageComponent> =
    TestBed.createComponent(PostFormPageComponent);

  if (postId) {
    fixture.componentRef.setInput('id', postId);
  }
  fixture.detectChanges();

  return {
    fixture,
    component: fixture.componentInstance,
    postsService: TestBed.inject(PostsService),
    postDetailService: TestBed.inject(PostDetailService),
    authService: TestBed.inject(AuthService),
    router: TestBed.inject(Router),
    toast: TestBed.inject(ToastService),
  };
}

describe('PostFormPageComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should detect new mode when no id input', () => {
    const { component } = setup();
    expect(component.isEditMode()).toBe(false);
    expect(component.pageTitle()).toBe('posts.form.titleNew');
  });

  it('should detect edit mode when id input is set', () => {
    const { component } = setup('5');
    expect(component.isEditMode()).toBe(true);
    expect(component.pageTitle()).toBe('posts.form.titleEdit');
  });

  it('should call loadDetail when in edit mode', () => {
    TestBed.configureTestingModule({
      imports: [PostFormPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(
          [{ path: 'posts', component: PostFormPageComponent }],
          withComponentInputBinding(),
        ),
        translocoProviders,
      ],
    });

    const postsService = TestBed.inject(PostDetailService);
    const spy = vi.spyOn(postsService, 'loadDetail');

    const fixture = TestBed.createComponent(PostFormPageComponent);
    fixture.componentRef.setInput('id', '7');
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(spy).toHaveBeenCalledWith('7');
  });

  it('should navigate to /posts on cancel in new mode', () => {
    const { component, router } = setup();
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onCancel();
    expect(spy).toHaveBeenCalledWith(['/posts']);
  });

  it('should navigate to /posts/:id on cancel in edit mode', () => {
    const { component, router } = setup('3');
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onCancel();
    expect(spy).toHaveBeenCalledWith(['/posts', '3']);
  });

  it('should reload resource on retry', () => {
    const { component, postDetailService } = setup('1');
    const spy = vi.spyOn(postDetailService.postDetailResource, 'reload');
    component.onRetry();
    expect(spy).toHaveBeenCalled();
  });

  it('onSubmit does nothing if no currentUser', async () => {
    const { component, postDetailService } = setup();
    const spy = vi.spyOn(postDetailService, 'createPost');
    await component.onSubmit({ title: 'T', body: 'B', tags: [] });
    expect(spy).not.toHaveBeenCalled();
  });

  it('onSubmit in new mode calls createPost', async () => {
    const { component, postDetailService, postsService, authService, router, toast } = setup();
    Object.defineProperty(authService, 'currentUser', { value: signal(MOCK_USER) });
    vi.spyOn(postDetailService, 'createPost').mockResolvedValue(MOCK_POST as never);
    vi.spyOn(postsService, 'reload');
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const toastSpy = vi.spyOn(toast, 'success');

    const data: PostFormData = { title: 'New', body: 'Body', tags: ['a'] };
    await component.onSubmit(data);

    expect(postDetailService.createPost).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('toast.postCreated');
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    expect(component.isSaving()).toBe(false);
  });

  it('onSubmit in edit mode calls updatePost', async () => {
    const { component, postDetailService, postsService, authService, router, toast } = setup('1');
    Object.defineProperty(authService, 'currentUser', { value: signal(MOCK_USER) });
    vi.spyOn(postDetailService, 'updatePost').mockResolvedValue(MOCK_POST as never);
    vi.spyOn(postsService, 'reload');
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const toastSpy = vi.spyOn(toast, 'success');

    const data: PostFormData = { title: 'Updated', body: 'Body', tags: [] };
    await component.onSubmit(data);

    expect(postDetailService.updatePost).toHaveBeenCalledWith('1', {
      title: 'Updated',
      body: 'Body',
      tags: [],
    });
    expect(toastSpy).toHaveBeenCalledWith('toast.postUpdated');
  });

  it('onSubmit sets saveError on failure', async () => {
    const { component, postDetailService, authService, toast } = setup();
    Object.defineProperty(authService, 'currentUser', { value: signal(MOCK_USER) });
    vi.spyOn(postDetailService, 'createPost').mockRejectedValue(new Error('fail'));
    const errorSpy = vi.spyOn(toast, 'error');

    await component.onSubmit({ title: 'T', body: 'B', tags: [] });

    expect(component.saveError()).toBe('shared.error');
    expect(errorSpy).toHaveBeenCalledWith('shared.error');
    expect(component.isSaving()).toBe(false);
  });
});
