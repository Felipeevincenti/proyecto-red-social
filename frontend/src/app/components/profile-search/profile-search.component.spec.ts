import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSearchComponent } from './profile-search.component';

describe('ProfileSearchComponent', () => {
  let component: ProfileSearchComponent;
  let fixture: ComponentFixture<ProfileSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileSearchComponent]
    });
    fixture = TestBed.createComponent(ProfileSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
