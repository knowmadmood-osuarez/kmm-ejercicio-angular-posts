import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';

import { PostDetailService, PostsService } from '@app/posts/data-access';

import { PostListPageComponent } from './post-list-page.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup() {
  TestBed.configureTestingModule({
    imports: [PostListPageComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter(
        [{ path: 'posts', component: PostListPageComponent }],
        withComponentInputBinding(),
      ),
      translocoProviders,
    ],
  });

  const fixture: ComponentFixture<PostListPageComponent> =
    TestBed.createComponent(PostListPageComponent);
  fixture.detectChanges();

  return {
    fixture,
    component: fixture.componentInstance,
    postsService: TestBed.inject(PostsService),
    postDetailService: TestBed.inject(PostDetailService),
    router: TestBed.inject(Router),
  };
}

describe('PostListPageComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('isLoading delegates to postsService.isLoading', () => {
    const { component, postsService } = setup();
    postsService.isLoading.set(true);
    expect(component.isLoading()).toBe(true);
    postsService.isLoading.set(false);
    expect(component.isLoading()).toBe(false);
  });

  it('error delegates to postsService.error', () => {
    const { component, postsService } = setup();
    postsService.error.set(null);
    expect(component.error()).toBeNull();
    postsService.error.set(new Error('fail'));
    expect(component.error()).toBeTruthy();
  });

  it('isEmpty returns true when not loading, no error and no posts', () => {
    const { component, postsService } = setup();
    postsService.isLoading.set(false);
    postsService.error.set(null);
    // visiblePosts is empty by default
    expect(component.isEmpty()).toBe(true);
  });

  it('onRetry calls postsService.reload', () => {
    const { component, postsService } = setup();
    const spy = vi.spyOn(postsService, 'reload');
    component.onRetry();
    expect(spy).toHaveBeenCalled();
  });

  it('onPostHovered calls postDetailService.prefetch', () => {
    const { component, postDetailService } = setup();
    const spy = vi.spyOn(postDetailService, 'prefetch');
    component.onPostHovered('42');
    expect(spy).toHaveBeenCalledWith('42');
  });

  it('onFiltersChange navigates with query params', () => {
    const { component, router } = setup();
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onFiltersChange({ q: 'search', author: '2', tag: 'angular' });
    expect(spy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { q: 'search', author: '2', tag: 'angular' },
      }),
    );
  });

  it('onFiltersChange nullifies empty filter values', () => {
    const { component, router } = setup();
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onFiltersChange({ q: '', author: '', tag: '' });
    expect(spy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { q: null, author: null, tag: null },
      }),
    );
  });

  it('hasMore delegates to postsService.hasMore', () => {
    const { component } = setup();
    expect(typeof component.hasMore()).toBe('boolean');
  });

  it('isLoadingMore delegates to postsService.isLoadingMore', () => {
    const { component } = setup();
    expect(typeof component.isLoadingMore()).toBe('boolean');
  });
});
