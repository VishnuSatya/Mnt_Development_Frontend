import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { UploadVideoComponent } from './upload-video-component';
import { VideoService } from '../../../services/video-service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

describe('UploadVideoComponent', () => {
  let component: UploadVideoComponent;
  let fixture: ComponentFixture<UploadVideoComponent>;

  beforeEach(async () => {
    const mockVideoService = { uploadVideo: () => of({}), uploadToCloudflare: () => of({}) };
    const mockToastr = { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') };

    await TestBed.configureTestingModule({
  imports: [HttpClientTestingModule, RouterTestingModule, FormsModule],
      declarations: [UploadVideoComponent],
      providers: [
        { provide: VideoService, useValue: mockVideoService },
        { provide: ToastrService, useValue: mockToastr }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
