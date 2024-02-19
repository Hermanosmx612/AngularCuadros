import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginacioComponent } from './paginacio.component';

describe('PaginacioComponent', () => {
  let component: PaginacioComponent;
  let fixture: ComponentFixture<PaginacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginacioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaginacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
