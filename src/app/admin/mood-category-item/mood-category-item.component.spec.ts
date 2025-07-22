import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodCategoryItemComponent } from './mood-category-item.component';

describe('MoodCategoryItemComponent', () => {
  let component: MoodCategoryItemComponent;
  let fixture: ComponentFixture<MoodCategoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoodCategoryItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoodCategoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
