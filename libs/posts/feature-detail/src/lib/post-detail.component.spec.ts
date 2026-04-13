import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';

import { PostDetailComponent } from './post-detail.component';
import type { Post } from '@app/posts/data-access';
import type { SafeUser } from '@app/core';

const mockPost: Post = {
  id: '1',
  userId: '1',
  title: 'Test Post',
  body: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
  tags: ['angular', 'testing'],
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

function setup(overrides: { author?: SafeUser; isOwner?: boolean } = {}) {
  TestBed.configureTestingModule({
    imports: [PostDetailComponent],
    providers: [translocoProviders],
  });

  const fixture: ComponentFixture<PostDetailComponent> =
    TestBed.createComponent(PostDetailComponent);

  fixture.componentRef.setInput('post', mockPost);
  if (overrides.author !== undefined) fixture.componentRef.setInput('author', overrides.author);
  if (overrides.isOwner !== undefined) fixture.componentRef.setInput('isOwner', overrides.isOwner);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('PostDetailComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should split body into paragraphs', () => {
    const { component } = setup();
    expect(component.paragraphs().length).toBe(3);
    expect(component.paragraphs()[0]).toBe('First paragraph.');
  });

  it('should handle body with no double newlines', () => {
    const singleParagraph = { ...mockPost, body: 'Just one paragraph.' };
    TestBed.configureTestingModule({
      imports: [PostDetailComponent],
      providers: [translocoProviders],
    });
    const fixture = TestBed.createComponent(PostDetailComponent);
    fixture.componentRef.setInput('post', singleParagraph);
    fixture.detectChanges();
    expect(fixture.componentInstance.paragraphs().length).toBe(1);
  });

  it('should have editClicked and deleteClicked outputs', () => {
    const { component } = setup({ isOwner: true });
    expect(component.editClicked).toBeDefined();
    expect(component.deleteClicked).toBeDefined();
  });

  it('should accept author input', () => {
    const { component } = setup({ author: mockAuthor });
    expect(component.author()).toEqual(mockAuthor);
  });

  it('should accept isOwner input', () => {
    const { component } = setup({ isOwner: true });
    expect(component.isOwner()).toBe(true);
  });

  it('should render edit and delete buttons when isOwner is true', () => {
    const { fixture } = setup({ isOwner: true });
    const toolbar = fixture.nativeElement.querySelector('[role="toolbar"]');
    expect(toolbar).toBeTruthy();
    const buttons = toolbar?.querySelectorAll('app-button');
    expect(buttons?.length).toBe(2);
  });

  it('should NOT render edit/delete buttons when isOwner is false', () => {
    const { fixture } = setup({ isOwner: false });
    const toolbar = fixture.nativeElement.querySelector('[role="toolbar"]');
    expect(toolbar).toBeNull();
  });

  it('should render tags as badges', () => {
    const { fixture } = setup();
    const badges = fixture.nativeElement.querySelectorAll('app-badge');
    expect(badges.length).toBe(2);
  });

  it('should NOT render tags section when post has no tags', () => {
    const noTagsPost = { ...mockPost, tags: [] as string[] };
    TestBed.configureTestingModule({
      imports: [PostDetailComponent],
      providers: [translocoProviders],
    });
    const fixture = TestBed.createComponent(PostDetailComponent);
    fixture.componentRef.setInput('post', noTagsPost);
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('app-badge');
    expect(badges.length).toBe(0);
  });

  it('should accept lang input', () => {
    const { fixture, component } = setup();
    fixture.componentRef.setInput('lang', 'en');
    expect(component.lang()).toBe('en');
  });
});
