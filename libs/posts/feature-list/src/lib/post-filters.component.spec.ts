import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';

import type { PostFilters } from '@app/posts/data-access';
import type { SafeUser } from '@app/core';

import { PostFiltersComponent } from './post-filters.component';

const defaultFilters: PostFilters = { q: '', author: '', tag: '' };

const mockAuthors: SafeUser[] = [
  { id: '1', name: 'alice', email: 'a@b.com', avatar: '' },
  { id: '2', name: 'bruno', email: 'b@b.com', avatar: '' },
];

const mockTags = ['angular', 'signals', 'testing'];

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup(overrides: { filters?: PostFilters } = {}) {
  TestBed.configureTestingModule({
    imports: [PostFiltersComponent],
    providers: [translocoProviders],
  });

  const fixture: ComponentFixture<PostFiltersComponent> =
    TestBed.createComponent(PostFiltersComponent);

  fixture.componentRef.setInput('filters', overrides.filters ?? defaultFilters);
  fixture.componentRef.setInput('authors', mockAuthors);
  fixture.componentRef.setInput('tags', mockTags);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

describe('PostFiltersComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('toggleFilters toggles filtersOpen signal', () => {
    const { component } = setup();
    expect(component.filtersOpen()).toBe(false);
    component.toggleFilters();
    expect(component.filtersOpen()).toBe(true);
    component.toggleFilters();
    expect(component.filtersOpen()).toBe(false);
  });

  it('onAuthorChange emits filtersChange with updated author', () => {
    const { component } = setup();
    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    component.onAuthorChange('2');

    expect(spy).toHaveBeenCalledWith({ q: '', author: '2', tag: '' });
  });

  it('onTagChange emits filtersChange with updated tag', () => {
    const { component } = setup();
    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    component.onTagChange('angular');

    expect(spy).toHaveBeenCalledWith({ q: '', author: '', tag: 'angular' });
  });

  it('preserves existing filters when changing author', () => {
    const { component } = setup({ filters: { q: 'search', author: '1', tag: 'signals' } });
    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    component.onAuthorChange('3');

    expect(spy).toHaveBeenCalledWith({ q: 'search', author: '3', tag: 'signals' });
  });

  it('preserves existing filters when changing tag', () => {
    const { component } = setup({ filters: { q: 'test', author: '2', tag: '' } });
    const spy = vi.fn();
    component.filtersChange.subscribe(spy);

    component.onTagChange('angular');

    expect(spy).toHaveBeenCalledWith({ q: 'test', author: '2', tag: 'angular' });
  });
});
