import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';

import { CommentFormComponent } from './comment-form.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup(initialBody = '') {
  TestBed.configureTestingModule({
    imports: [CommentFormComponent],
    providers: [translocoProviders],
  });

  const fixture: ComponentFixture<CommentFormComponent> =
    TestBed.createComponent(CommentFormComponent);

  if (initialBody) fixture.componentRef.setInput('initialBody', initialBody);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('CommentFormComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('initializes with empty body', () => {
    const { component } = setup();
    expect(component.commentModel().body).toBe('');
  });

  it('populates body from initialBody input via effect', () => {
    const { component } = setup('existing comment');
    TestBed.flushEffects();
    expect(component.commentModel().body).toBe('existing comment');
  });

  it('onSubmit emits submitted with trimmed body when valid', () => {
    const { component } = setup();
    const spy = vi.fn();
    component.submitted.subscribe(spy);

    component.commentModel.set({ body: '  hello world  ' });
    component.onSubmit();

    expect(spy).toHaveBeenCalledWith('hello world');
  });

  it('onSubmit resets body to empty when not in edit mode', () => {
    const { component } = setup();
    component.commentModel.set({ body: 'new comment text' });
    component.onSubmit();
    expect(component.commentModel().body).toBe('');
  });

  it('onSubmit does NOT reset body when initialBody is set (edit mode)', () => {
    const { component } = setup('original');
    TestBed.flushEffects();
    component.commentModel.set({ body: 'updated body' });
    component.onSubmit();
    // In edit mode (initialBody exists), body should not be cleared
    expect(component.commentModel().body).toBe('updated body');
  });

  it('onSubmit calls event.preventDefault when event is provided', () => {
    const { component } = setup();
    component.commentModel.set({ body: 'valid text' });
    const event = { preventDefault: vi.fn() } as unknown as Event;
    component.onSubmit(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('onCancel resets body to initialBody and emits cancelled', () => {
    const { component } = setup('original');
    TestBed.flushEffects();
    const spy = vi.fn();
    component.cancelled.subscribe(spy);

    component.commentModel.set({ body: 'changed' });
    component.onCancel();

    expect(component.commentModel().body).toBe('original');
    expect(spy).toHaveBeenCalled();
  });
});
