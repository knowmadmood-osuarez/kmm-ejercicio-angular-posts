import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';

import { CommentCardComponent } from './comment-card.component';
import type { Comment } from '@app/posts/data-access';
import type { SafeUser } from '@app/core';

const mockComment: Comment = {
  id: '1',
  postId: '10',
  userId: '1',
  body: 'Great post!',
  createdAt: new Date().toISOString(),
};

const mockAuthor: SafeUser = {
  id: '1',
  name: 'alice',
  email: 'alice@test.com',
  avatar: 'https://example.com/avatar.png',
};

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup(overrides: { author?: SafeUser; isOwner?: boolean; lang?: string } = {}) {
  TestBed.configureTestingModule({
    imports: [CommentCardComponent],
    providers: [translocoProviders],
  });

  const fixture: ComponentFixture<CommentCardComponent> =
    TestBed.createComponent(CommentCardComponent);

  fixture.componentRef.setInput('comment', mockComment);
  if (overrides.author !== undefined) fixture.componentRef.setInput('author', overrides.author);
  if (overrides.isOwner !== undefined) fixture.componentRef.setInput('isOwner', overrides.isOwner);
  if (overrides.lang) fixture.componentRef.setInput('lang', overrides.lang);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('CommentCardComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should compute authorName from author input', () => {
    const { component } = setup({ author: mockAuthor });
    expect(component.authorName()).toBe('Alice');
  });

  it('should default authorName to Unknown when no author', () => {
    const { component } = setup();
    expect(component.authorName()).toBe('Unknown');
  });

  it('should compute relativeDate from comment createdAt', () => {
    const { component } = setup();
    expect(typeof component.relativeDate()).toBe('string');
    expect(component.relativeDate().length).toBeGreaterThan(0);
  });

  it('should compute relativeDate for old dates (> 7 days)', () => {
    const oldDate = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const oldComment = { ...mockComment, createdAt: oldDate };

    TestBed.configureTestingModule({
      imports: [CommentCardComponent],
      providers: [translocoProviders],
    });
    const fixture = TestBed.createComponent(CommentCardComponent);
    fixture.componentRef.setInput('comment', oldComment);
    fixture.detectChanges();

    expect(fixture.componentInstance.relativeDate()).toBeTruthy();
  });

  it('should compute relativeDate for minutes-old dates', () => {
    const minutesAgo = new Date(Date.now() - 30 * 60_000).toISOString();
    const recentComment = { ...mockComment, createdAt: minutesAgo };

    TestBed.configureTestingModule({
      imports: [CommentCardComponent],
      providers: [translocoProviders],
    });
    const fixture = TestBed.createComponent(CommentCardComponent);
    fixture.componentRef.setInput('comment', recentComment);
    fixture.detectChanges();

    expect(fixture.componentInstance.relativeDate()).toBeTruthy();
  });

  it('should compute relativeDate for hours-old dates', () => {
    const hoursAgo = new Date(Date.now() - 5 * 3_600_000).toISOString();
    const hourComment = { ...mockComment, createdAt: hoursAgo };

    TestBed.configureTestingModule({
      imports: [CommentCardComponent],
      providers: [translocoProviders],
    });
    const fixture = TestBed.createComponent(CommentCardComponent);
    fixture.componentRef.setInput('comment', hourComment);
    fixture.detectChanges();

    expect(fixture.componentInstance.relativeDate()).toBeTruthy();
  });

  it('should compute relativeDate for days-old dates (< 7)', () => {
    const daysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
    const dayComment = { ...mockComment, createdAt: daysAgo };

    TestBed.configureTestingModule({
      imports: [CommentCardComponent],
      providers: [translocoProviders],
    });
    const fixture = TestBed.createComponent(CommentCardComponent);
    fixture.componentRef.setInput('comment', dayComment);
    fixture.detectChanges();

    expect(fixture.componentInstance.relativeDate()).toBeTruthy();
  });

  it('should have editClicked and deleteClicked outputs', () => {
    const { component } = setup({ isOwner: true });
    expect(component.editClicked).toBeDefined();
    expect(component.deleteClicked).toBeDefined();
  });
});
