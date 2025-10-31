import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ViewVideosComponent } from './view-videos-component';
import { VideoService } from '../../../services/video-service';

describe('ViewVideosComponent', () => {
  let component: ViewVideosComponent;
  let fixture: ComponentFixture<ViewVideosComponent>;

  beforeEach(async () => {
    const mockVideoService = {
      getVideos: () => of([]),
      likeVideo: () => of({}),
      dislikeVideo: () => of({}),
      addComment: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ViewVideosComponent],
      providers: [{ provide: VideoService, useValue: mockVideoService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
