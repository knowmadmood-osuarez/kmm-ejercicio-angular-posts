import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsFeatureForm } from './posts-feature-form';

describe('PostsFeatureForm', () => {
  let component: PostsFeatureForm;
  let fixture: ComponentFixture<PostsFeatureForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFeatureForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsFeatureForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
