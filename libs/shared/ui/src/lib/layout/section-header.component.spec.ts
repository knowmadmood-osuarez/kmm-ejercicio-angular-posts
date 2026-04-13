import { render } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { SectionHeaderComponent } from './section-header.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('SectionHeaderComponent', () => {
  it('renders an h2 element', async () => {
    const { container } = await render(SectionHeaderComponent, {
      inputs: { title: 'posts.comments' },
      providers: [translocoProviders],
    });
    expect(container.querySelector('h2')).toBeTruthy();
  });

  it('does not show count by default', async () => {
    const { container } = await render(SectionHeaderComponent, {
      inputs: { title: 'posts.comments' },
      providers: [translocoProviders],
    });
    const h2 = container.querySelector('h2')!;
    expect(h2.textContent).not.toContain('/');
  });

  it('shows zero-padded count when provided', async () => {
    const { container } = await render(SectionHeaderComponent, {
      inputs: { title: 'posts.comments', count: 3 },
      providers: [translocoProviders],
    });
    const h2 = container.querySelector('h2')!;
    expect(h2.textContent).toContain('03');
  });

  it('does not show divider by default', async () => {
    const { container } = await render(SectionHeaderComponent, {
      inputs: { title: 'posts.comments' },
      providers: [translocoProviders],
    });
    const wrapper = container.querySelector('.flex.items-center')!;
    expect(wrapper.classList.contains('border-t')).toBe(false);
  });

  it('does not expose native title attribute on host', async () => {
    const { fixture } = await render(SectionHeaderComponent, {
      inputs: { title: 'posts.comments' },
      providers: [translocoProviders],
    });
    expect(fixture.nativeElement.getAttribute('title')).toBeNull();
  });

  it('shows divider when enabled', async () => {
    const { container } = await render(SectionHeaderComponent, {
      inputs: { title: 'posts.comments', divider: true },
      providers: [translocoProviders],
    });
    const wrapper = container.querySelector('.flex.items-center')!;
    expect(wrapper.classList.contains('border-t')).toBe(true);
  });
});
