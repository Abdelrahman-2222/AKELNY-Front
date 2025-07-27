import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefAddResturant } from './chef-add-restaurant';

describe('ChefAddResturant', () => {
  let component: ChefAddResturant;
  let fixture: ComponentFixture<ChefAddResturant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefAddResturant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefAddResturant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
