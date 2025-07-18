import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCallBack } from './auth-call-back';

describe('AuthCallBack', () => {
  let component: AuthCallBack;
  let fixture: ComponentFixture<AuthCallBack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthCallBack]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthCallBack);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
