import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';

import { PostsService } from '@app/posts/data-access';

import { PostFormPageComponent } from './post-form-page.component';

const MOCK_POST = {
  id: '1',
  userId: '1',
  title: 'Existing Post',
  body: 'This is the existing body content for testing.',
  tags: ['angular', 'testing'],
  createdAt: new Date().toISOString(),
};

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
    router: TestBed.inject(Router),
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

    const postsService = TestBed.inject(PostsService);
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
    const { component, postsService } = setup('1');
    const spy = vi.spyOn(postsService.postDetailResource, 'reload');
    component.onRetry();
    expect(spy).toHaveBeenCalled();
  });
});
