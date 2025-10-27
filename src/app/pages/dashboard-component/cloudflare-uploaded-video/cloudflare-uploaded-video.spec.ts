import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CloudflareUploadedVideoComponent } from './cloudflare-uploaded-video';
import { FormsModule } from '@angular/forms';
import Hls from 'hls.js';

describe('CloudflareUploadedVideoComponent', () => {
  let component: CloudflareUploadedVideoComponent;
  let fixture: ComponentFixture<CloudflareUploadedVideoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudflareUploadedVideoComponent ],
      imports: [ FormsModule ]
    });

    fixture = TestBed.createComponent(CloudflareUploadedVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(true);
    expect(component.error).toBeUndefined();
    expect(component.qualities).toEqual([]);
    expect(component.currentQuality).toBe(-1);
    expect(component.isFullscreen).toBe(false);
  });

  it('should handle quality change for HLS', () => {
    // Mock HLS instance
    component['hls'] = {
      currentLevel: -1,
      levels: [
        { height: 720, bitrate: 2000000 },
        { height: 1080, bitrate: 4000000 }
      ]
    };

    component.onQualityChange(1);
    expect(component.currentQuality).toBe(1);
    expect(component['hls'].currentLevel).toBe(1);
  });

  it('should handle quality change for DASH', () => {
    // Mock DASH player
    component['dashPlayer'] = {
      getBitrateInfoListFor: () => [
        { height: 720, bitrate: 2000000 },
        { height: 1080, bitrate: 4000000 }
      ],
      setQualityFor: jasmine.createSpy('setQualityFor')
    };

    component.onQualityChange(1);
    expect(component.currentQuality).toBe(1);
    expect(component['dashPlayer'].setQualityFor).toHaveBeenCalledWith('video', 1);
  });

  it('should update quality list when HLS manifest is parsed', () => {
    component['hls'] = new Hls();
    const mockLevels = [
      { height: 720, bitrate: 2000000 },
      { height: 1080, bitrate: 4000000 }
    ];
    component['hls'].levels = mockLevels;
    
    // Simulate manifest parsed event
    const event = new Event('manifestParsed');
    component['hls'].trigger(Hls.Events.MANIFEST_PARSED, event);

    expect(component.qualities.length).toBe(2);
    expect(component.qualities[0].height).toBe(720);
    expect(component.qualities[1].height).toBe(1080);
  });

  it('should handle fullscreen toggle', async () => {
    const mockVideo = {
      requestFullscreen: jasmine.createSpy('requestFullscreen').and.returnValue(Promise.resolve()),
    };
    component.videoRef = { nativeElement: mockVideo as any };

    // Mock document methods
    spyOn(document, 'exitFullscreen').and.returnValue(Promise.resolve());
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => null
    });

    await component.toggleFullscreen();
    expect(mockVideo.requestFullscreen).toHaveBeenCalled();
    expect(component.isFullscreen).toBe(true);
  });

  it('should handle fullscreen exit', async () => {
    const mockVideo = {
      requestFullscreen: jasmine.createSpy('requestFullscreen').and.returnValue(Promise.resolve()),
    };
    component.videoRef = { nativeElement: mockVideo as any };

    // Mock document methods
    spyOn(document, 'exitFullscreen').and.returnValue(Promise.resolve());
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => mockVideo
    });

    await component.toggleFullscreen();
    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(component.isFullscreen).toBe(false);
  });

  it('should handle fullscreen errors', async () => {
    const mockVideo = {
      requestFullscreen: jasmine.createSpy('requestFullscreen').and.returnValue(Promise.reject('error')),
    };
    component.videoRef = { nativeElement: mockVideo as any };

    spyOn(console, 'error');
    await component.toggleFullscreen();
    expect(console.error).toHaveBeenCalledWith('Error attempting to enable fullscreen:', 'error');
  });
});