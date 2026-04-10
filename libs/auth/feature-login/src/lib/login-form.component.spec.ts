import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@jsverse/transloco';

import { type LoginCredentials, LoginFormComponent } from './login-form.component';

const translocoProviders = provideTransloco({
  config: { availableLangs: ['es', 'en'], defaultLang: 'es', prodMode: true },
});

function setup() {
  TestBed.configureTestingModule({
    imports: [LoginFormComponent],
    providers: [translocoProviders],
  });

  const fixture: ComponentFixture<LoginFormComponent> = TestBed.createComponent(LoginFormComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, component };
}

describe('LoginFormComponent', () => {
  it('should create', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('should render username and password inputs', () => {
    const { fixture } = setup();
    const inputs = fixture.nativeElement.querySelectorAll('app-input');
    expect(inputs.length).toBe(2);
  });

  it('should render a submit button', () => {
    const { fixture } = setup();
    const button = fixture.nativeElement.querySelector('app-button');
    expect(button).toBeTruthy();
  });

  it('should be invalid when fields are empty', () => {
    const { component } = setup();
    expect(component.isValid()).toBe(false);
  });

  it('should be valid when both fields are filled', () => {
    const { component } = setup();
    component.loginModel.set({ name: 'alice', password: 'alice123' });
    expect(component.isValid()).toBe(true);
  });

  it('should be invalid when name is empty', () => {
    const { component } = setup();
    component.loginModel.set({ name: '', password: 'alice123' });
    expect(component.isValid()).toBe(false);
  });

  it('should be invalid when password is empty', () => {
    const { component } = setup();
    component.loginModel.set({ name: 'alice', password: '' });
    expect(component.isValid()).toBe(false);
  });

  it('should emit submitted with trimmed name on valid submit', () => {
    const { component } = setup();
    const emitted: LoginCredentials[] = [];
    component.submitted.subscribe((v) => emitted.push(v));

    component.loginModel.set({ name: '  alice  ', password: 'alice123' });
    component.onSubmit();

    expect(emitted).toEqual([{ name: 'alice', password: 'alice123' }]);
  });

  it('should not emit submitted when form is invalid', () => {
    const { component } = setup();
    const emitted: LoginCredentials[] = [];
    component.submitted.subscribe((v) => emitted.push(v));

    component.onSubmit();

    expect(emitted).toEqual([]);
  });

  it('should not show error message when error is null', () => {
    const { fixture } = setup();
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).toBeFalsy();
  });

  it('should show error message when error input is truthy', () => {
    const { fixture } = setup();
    fixture.componentRef.setInput('error', new Error('fail'));
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
  });
});
