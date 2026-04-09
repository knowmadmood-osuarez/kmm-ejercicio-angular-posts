import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsFeatureList } from './posts-feature-list';

describe('PostsFeatureList', () => {
  let component: PostsFeatureList;
  let fixture: ComponentFixture<PostsFeatureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsFeatureList],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsFeatureList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
