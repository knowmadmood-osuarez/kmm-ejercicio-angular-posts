import { render } from '@testing-library/angular';
import { provideTransloco } from '@jsverse/transloco';
import { LinearProgressComponent } from './linear-progress.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['en'], defaultLang: 'en', prodMode: true },
});

describe('LinearProgressComponent', () => {
  it('renders the progress bar when visible', async () => {
    const { container } = await render(LinearProgressComponent, {
      providers: [translocoProviders],
      inputs: { visible: true },
    });
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
  });

  it('does not render when visible is false', async () => {
    const { container } = await render(LinearProgressComponent, {
      providers: [translocoProviders],
      inputs: { visible: false },
    });
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('is visible by default', async () => {
    const { container } = await render(LinearProgressComponent, {
      providers: [translocoProviders],
    });
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
  });
});
