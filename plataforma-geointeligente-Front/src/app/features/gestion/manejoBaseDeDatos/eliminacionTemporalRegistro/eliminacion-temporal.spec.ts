import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EliminacionTemporalModal } from './eliminacion-temporal';

describe('EliminacionTemporalModal', () => {
  let component: EliminacionTemporalModal;
  let fixture: ComponentFixture<EliminacionTemporalModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminacionTemporalModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EliminacionTemporalModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
