import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsFeatureDetail } from './posts-feature-detail';

describe('PostsFeatureDetail', () => {
  let component: PostsFeatureDetail;
  let fixture: ComponentFixture<PostsFeatureDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFeatureDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsFeatureDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
