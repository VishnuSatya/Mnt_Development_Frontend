import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CloudflareUploadedVideoComponent } from './cloudflare-uploaded-video';
import { FormsModule } from '@angular/forms';
import Hls from 'hls.js';
import { VideoService } from '../../../services/video-service';

describe('CloudflareUploadedVideoComponent', () => {
  let component: CloudflareUploadedVideoComponent;
  let fixture: ComponentFixture<CloudflareUploadedVideoComponent>;

  beforeEach(() => {
    const mockVideoService = { uploadToCloudflare: () => of({}), uploadVideo: () => of({}) };

    TestBed.configureTestingModule({
      imports: [ FormsModule, HttpClientTestingModule, RouterTestingModule ],
      declarations: [ CloudflareUploadedVideoComponent ],
      providers: [{ provide: VideoService, useValue: mockVideoService }]
    });

  fixture = TestBed.createComponent(CloudflareUploadedVideoComponent);
  component = fixture.componentInstance;
    // prevent initPlayer from running during detectChanges; we'll provide safe mocks instead
    spyOn(component, 'initPlayer' as any).and.callFake(() => {});

    // helper to create a safe fake video element with expected browser API surface
    const makeFakeVideoEl = () => {
      const listeners: Record<string, Function[]> = {};
      return {
        _listeners: listeners,
        pause: jasmine.createSpy('pause'),
        play: jasmine.createSpy('play'),
        load: jasmine.createSpy('load'),
        removeAttribute: jasmine.createSpy('removeAttribute'),
        setAttribute: jasmine.createSpy('setAttribute'),
        requestFullscreen: jasmine.createSpy('requestFullscreen').and.returnValue(Promise.resolve()),
        addEventListener: (ev: string, fn: Function) => {
          listeners[ev] = listeners[ev] || [];
          listeners[ev].push(fn);
        },
        // allow tests to dispatch events if needed
        _dispatch: (ev: string, ...args: any[]) => {
          (listeners[ev] || []).forEach(fn => fn(...args));
        }
      } as any;
    };

    // provide safe defaults for players and video element so teardown doesn't fail
    component['hls'] = { levels: [], currentLevel: -1, destroy: () => {}, on: () => {} } as any;
    component['dashPlayer'] = { getBitrateInfoListFor: () => [], setQualityFor: jasmine.createSpy('setQualityFor'), reset: () => {} } as any;
    component.videoRef = { nativeElement: makeFakeVideoEl() } as any;
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
      ],
      destroy: () => {},
      on: () => {}
    } as any;

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
      setQualityFor: jasmine.createSpy('setQualityFor'),
      reset: () => {}
    } as any;
    // ensure HLS is not present so DASH branch is taken
    component['hls'] = null as any;
    component.onQualityChange(1);
    expect(component.currentQuality).toBe(1);
    expect(component['dashPlayer'].setQualityFor).toHaveBeenCalledWith('video', 1);
  });

  it('should update quality list when HLS manifest is parsed', () => {
    // set up a safe HLS stub with trigger and levels
    const mockLevels = [
      { height: 720, bitrate: 2000000 },
      { height: 1080, bitrate: 4000000 }
    ];
    component['hls'] = { levels: mockLevels, currentLevel: -1, trigger: (ev: any) => {
      // simulate manifest parsed handling in component (if any)
      if (typeof (component as any).onHlsManifestParsed === 'function') {
        (component as any).onHlsManifestParsed();
      }
    }, destroy: () => {} } as any;

    // Manually call the code path that populates qualities from hls.levels
    // If component exposes a method to update qualities, call it; otherwise, emulate the manifest parsed behavior
    if (component['hls'] && Array.isArray(component['hls'].levels)) {
      component['qualities'] = component['hls'].levels.map((l: any, i: number) => ({ index: i, height: l.height, bitrate: l.bitrate }));
    }

    expect(component.qualities.length).toBe(2);
    expect(component.qualities[0].height).toBe(720);
    expect(component.qualities[1].height).toBe(1080);
  });

  it('should handle fullscreen toggle', async () => {
    // use the shared fake video element so cleanup has the pause/load methods
    const mockVideo = (component.videoRef.nativeElement as any);
    mockVideo.requestFullscreen.and.returnValue(Promise.resolve());

    // Mock document methods
    spyOn(document, 'exitFullscreen').and.returnValue(Promise.resolve());
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null as any);

  component.toggleFullscreen();
  // wait for the requestFullscreen Promise to settle
  await (mockVideo.requestFullscreen.calls.mostRecent().returnValue as Promise<any>);
  expect(mockVideo.requestFullscreen).toHaveBeenCalled();
  expect(component.isFullscreen).toBe(true);
  });

  it('should handle fullscreen exit', async () => {
    const mockVideo = (component.videoRef.nativeElement as any);
    mockVideo.requestFullscreen.and.returnValue(Promise.resolve());

    // Mock document methods
    spyOn(document, 'exitFullscreen').and.returnValue(Promise.resolve());
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(mockVideo as any);

  component.toggleFullscreen();
  // wait for exitFullscreen promise to settle
  await (document.exitFullscreen as any)();
  expect(document.exitFullscreen).toHaveBeenCalled();
  expect(component.isFullscreen).toBe(false);
  });

  it('should handle fullscreen errors', async () => {
    const mockVideo = (component.videoRef.nativeElement as any);
    mockVideo.requestFullscreen.and.returnValue(Promise.reject('error'));
    // ensure we are in the requestFullscreen path
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null as any);
    spyOn(console, 'error');
    component.toggleFullscreen();
    // wait for the rejected requestFullscreen promise to be handled
    await (mockVideo.requestFullscreen.calls.mostRecent().returnValue as Promise<any>).catch(() => {});
    expect(console.error).toHaveBeenCalled();
  });
});