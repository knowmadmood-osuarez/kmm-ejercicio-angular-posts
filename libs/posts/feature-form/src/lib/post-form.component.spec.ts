import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';

import { PostFormComponent } from './post-form.component';
import type { Post } from '@app/posts/data-access';

const mockPost: Post = {
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

function setup(post?: Post) {
  TestBed.configureTestingModule({
    imports: [PostFormComponent],
    providers: [translocoProviders],
  });

  const fixture: ComponentFixture<PostFormComponent> = TestBed.createComponent(PostFormComponent);

  if (post) fixture.componentRef.setInput('post', post);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('PostFormComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('initializes with empty model in new mode', () => {
    const { component } = setup();
    expect(component.postModel()).toEqual({ title: '', body: '', tags: '' });
  });

  it('populates model from post input in edit mode', () => {
    const { component } = setup(mockPost);
    TestBed.flushEffects();
    expect(component.postModel().title).toBe('Existing Post');
    expect(component.postModel().body).toBe('This is the existing body content for testing.');
    expect(component.postModel().tags).toBe('angular, testing');
  });

  it('onSubmit emits submitted with parsed data when form is valid', () => {
    const { component } = setup();
    const spy = vi.fn();
    component.submitted.subscribe(spy);

    component.postModel.set({
      title: '  Test Title  ',
      body: '  This is a long enough body text.  ',
      tags: 'angular, signals, testing',
    });
    component.onSubmit();

    expect(spy).toHaveBeenCalledWith({
      title: 'Test Title',
      body: 'This is a long enough body text.',
      tags: ['angular', 'signals', 'testing'],
    });
  });

  it('onSubmit calls event.preventDefault when event is provided', () => {
    const { component } = setup();
    component.postModel.set({ title: 'abc', body: 'long enough body text', tags: '' });
    const event = { preventDefault: vi.fn() } as unknown as Event;
    component.onSubmit(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('onSubmit parses empty tags correctly', () => {
    const { component } = setup();
    const spy = vi.fn();
    component.submitted.subscribe(spy);

    component.postModel.set({ title: 'Title', body: 'Body that is long enough', tags: '' });
    component.onSubmit();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
  });

  it('onCancel emits cancelled', () => {
    const { component } = setup();
    const spy = vi.fn();
    component.cancelled.subscribe(spy);
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });
});
