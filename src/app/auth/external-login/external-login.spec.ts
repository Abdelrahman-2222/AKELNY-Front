import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalLogin } from './external-login';

describe('ExternalLogin', () => {
  let component: ExternalLogin;
  let fixture: ComponentFixture<ExternalLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
