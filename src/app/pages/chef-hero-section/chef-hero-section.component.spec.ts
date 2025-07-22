import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefHeroSectionComponent } from './chef-hero-section.component';

describe('ChefHeroSectionComponent', () => {
  let component: ChefHeroSectionComponent;
  let fixture: ComponentFixture<ChefHeroSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefHeroSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefHeroSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
