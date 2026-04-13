import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = TestBed.inject(ToastService);
  });

  afterEach(() => vi.useRealTimers());

  it('starts with empty toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('success() adds a success toast', () => {
    service.success('toast.ok');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('success');
    expect(service.toasts()[0].messageKey).toBe('toast.ok');
  });

  it('error() adds an error toast', () => {
    service.error('toast.fail');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('error');
    expect(service.toasts()[0].messageKey).toBe('toast.fail');
  });

  it('passes params to the toast', () => {
    service.success('toast.ok', { count: 5 });
    expect(service.toasts()[0].params).toEqual({ count: 5 });
  });

  it('dismiss() removes a toast by id', () => {
    service.success('a');
    service.success('b');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].messageKey).toBe('b');
  });

  it('auto-dismisses after 3500ms', () => {
    service.success('auto');
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(3500);
    expect(service.toasts().length).toBe(0);
  });

  it('increments id for each toast', () => {
    service.success('a');
    service.error('b');
    const ids = service.toasts().map((t) => t.id);
    expect(ids[1]).toBeGreaterThan(ids[0]);
  });
});
