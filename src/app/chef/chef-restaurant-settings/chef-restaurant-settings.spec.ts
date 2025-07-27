import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefRestaurantSettings } from './chef-restaurant-settings';

describe('ChefRestaurantSettings', () => {
  let component: ChefRestaurantSettings;
  let fixture: ComponentFixture<ChefRestaurantSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefRestaurantSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefRestaurantSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
