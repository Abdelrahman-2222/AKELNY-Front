import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefReviewsComponent } from './chef-reviews.component';

describe('ChefReviewsComponent', () => {
  let component: ChefReviewsComponent;
  let fixture: ComponentFixture<ChefReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
