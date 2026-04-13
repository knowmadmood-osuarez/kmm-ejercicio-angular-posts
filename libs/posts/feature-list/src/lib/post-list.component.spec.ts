import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { Post } from '@app/posts/data-access';
import type { User } from '@app/core';

import { PostListComponent } from './post-list.component';

const mockPost1: Post = {
  id: '1',
  userId: '1',
  title: 'First Post',
  body: 'Body of first post',
  tags: ['angular'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockPost2: Post = {
  id: '2',
  userId: '2',
  title: 'Second Post',
  body: 'Body of second post',
  tags: ['signals'],
  createdAt: '2024-01-02T00:00:00.000Z',
};

const mockUsers: User[] = [
  { id: '1', name: 'alice', password: 'alice123', email: 'a@b.com', avatar: '' },
  { id: '2', name: 'bruno', password: 'bruno123', email: 'b@b.com', avatar: '' },
];

function setup(overrides: { posts?: Post[]; users?: User[]; currentUser?: User | null } = {}) {
  TestBed.configureTestingModule({
    imports: [PostListComponent],
  });

  const fixture: ComponentFixture<PostListComponent> = TestBed.createComponent(PostListComponent);

  fixture.componentRef.setInput('posts', overrides.posts ?? [mockPost1, mockPost2]);
  fixture.componentRef.setInput('users', overrides.users ?? mockUsers);
  if (overrides.currentUser !== undefined) {
    fixture.componentRef.setInput('currentUser', overrides.currentUser);
  }
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('PostListComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('postsWithAuthors maps authors via userId', () => {
    const { component } = setup();
    const result = component.postsWithAuthors();
    expect(result.length).toBe(2);
    expect(result[0].author?.name).toBe('alice');
    expect(result[1].author?.name).toBe('bruno');
  });

  it('postsWithAuthors returns undefined author for unknown userId', () => {
    const unknownPost: Post = { ...mockPost1, userId: '999' };
    const { component } = setup({ posts: [unknownPost] });
    expect(component.postsWithAuthors()[0].author).toBeUndefined();
  });

  it('postsWithAuthors sets isCurrentUser correctly', () => {
    const { component } = setup({ currentUser: mockUsers[0] });
    const result = component.postsWithAuthors();
    expect(result[0].isCurrentUser).toBe(true);
    expect(result[1].isCurrentUser).toBe(false);
  });

  it('postsWithAuthors sets isCurrentUser to false when no currentUser', () => {
    const { component } = setup({ currentUser: null });
    const result = component.postsWithAuthors();
    expect(result[0].isCurrentUser).toBe(false);
  });

  it('postsWithAuthors preserves index', () => {
    const { component } = setup();
    const result = component.postsWithAuthors();
    expect(result[0].index).toBe(0);
    expect(result[1].index).toBe(1);
  });

  it('emits postHovered output', () => {
    const { component } = setup();
    const spy = vi.fn();
    component.postHovered.subscribe(spy);
    component.postHovered.emit('42');
    expect(spy).toHaveBeenCalledWith('42');
  });
});
