import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';

import type { Post } from '@app/posts/data-access';
import type { User } from '@app/core';

import { PostCardComponent } from './post-card.component';

const mockPost: Post = {
  id: '1',
  userId: '1',
  title: 'Test Post Title',
  body: 'A short body for testing.',
  tags: ['angular', 'testing'],
  createdAt: '2024-06-15T10:00:00.000Z',
};

const longBody =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.';

const mockAuthor: User = {
  id: '1',
  name: 'alice',
  password: 'alice123',
  email: 'alice@test.com',
  avatar: 'https://example.com/avatar.png',
};

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup(
  overrides: { post?: Post; author?: User; isCurrentUser?: boolean; lang?: string } = {},
) {
  TestBed.configureTestingModule({
    imports: [PostCardComponent],
    providers: [provideRouter([]), translocoProviders],
  });

  const fixture: ComponentFixture<PostCardComponent> = TestBed.createComponent(PostCardComponent);

  fixture.componentRef.setInput('post', overrides.post ?? mockPost);
  if (overrides.author !== undefined) fixture.componentRef.setInput('author', overrides.author);
  if (overrides.isCurrentUser !== undefined)
    fixture.componentRef.setInput('isCurrentUser', overrides.isCurrentUser);
  if (overrides.lang !== undefined) fixture.componentRef.setInput('lang', overrides.lang);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('PostCardComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('bodyExcerpt returns full text when body <= 130 chars', () => {
    const { component } = setup();
    expect(component.bodyExcerpt()).toBe(mockPost.body);
  });

  it('bodyExcerpt truncates text longer than 130 chars', () => {
    const { component } = setup({ post: { ...mockPost, body: longBody } });
    expect(component.bodyExcerpt().length).toBeLessThanOrEqual(131);
    expect(component.bodyExcerpt()).toContain('…');
  });

  it('formattedDate formats the createdAt ISO string', () => {
    const { component } = setup({ lang: 'en' });
    const formatted = component.formattedDate();
    expect(formatted).toBeTruthy();
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('authorName capitalizes the author name', () => {
    const { component } = setup({ author: mockAuthor });
    expect(component.authorName()).toBe('Alice');
  });

  it('authorName returns empty string when no author', () => {
    const { component } = setup();
    expect(component.authorName()).toBe('');
  });

  it('authorAvatar returns avatar URL from author', () => {
    const { component } = setup({ author: mockAuthor });
    expect(component.authorAvatar()).toBe('https://example.com/avatar.png');
  });

  it('authorAvatar returns empty string when no author', () => {
    const { component } = setup();
    expect(component.authorAvatar()).toBe('');
  });

  it('emits hovered output on mouseenter', () => {
    const { fixture, component } = setup();
    const spy = vi.fn();
    component.hovered.subscribe(spy);

    const link = fixture.nativeElement.querySelector('a');
    link.dispatchEvent(new MouseEvent('mouseenter'));

    expect(spy).toHaveBeenCalledWith('1');
  });

  it('renders post tags as badges', () => {
    const { fixture } = setup();
    const badges = fixture.nativeElement.querySelectorAll('app-badge');
    expect(badges.length).toBe(2);
  });

  it('does not render tags section when post has no tags', () => {
    const { fixture } = setup({ post: { ...mockPost, tags: [] } });
    const badges = fixture.nativeElement.querySelectorAll('app-badge');
    expect(badges.length).toBe(0);
  });

  it('accepts tonal variant input', () => {
    const { fixture, component } = setup();
    fixture.componentRef.setInput('variant', 'tonal');
    expect(component.variant()).toBe('tonal');
  });
});
