import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsDataAccess } from './posts-data-access';

describe('PostsDataAccess', () => {
  let component: PostsDataAccess;
  let fixture: ComponentFixture<PostsDataAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsDataAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsDataAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
