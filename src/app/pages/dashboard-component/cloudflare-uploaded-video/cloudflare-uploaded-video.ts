import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { VideoService } from '../../../services/video-service';
import { HttpEventType } from '@angular/common/http';
import Hls from 'hls.js';
import * as dashjs from 'dashjs';

@Component({
  selector: 'app-cloudflare-uploaded-video',
  standalone: false,
  templateUrl: './cloudflare-uploaded-video.html',
  styleUrls: ['./cloudflare-uploaded-video.scss']
})
export class CloudflareUploadedVideoComponent implements AfterViewInit, OnDestroy {
  /** Defaults can be overridden by inputs when using the component */
  @Input() videoId: string = 'ceb0811395f68fa1c0c8837344cce884';
  @Input() hlsManifestUrl?: string;
  @Input() dashManifestUrl?: string;

  @ViewChild('player', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  
  loading = true;
  error?: string;
  qualities: { height: number; bitrate: number; label: string }[] = [];
  currentQuality = -1;
  isFullscreen = false;

  private hls: any = null;
  private dashPlayer: any = null;
  // upload UI state
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploadResult: any = null;
  uploading = false;

  // Drag-and-drop state
  dragActive = false;

  // Preview and validation
  previewUrl: string | null = null;
  fileError: string | null = null;

  constructor(private videoService: VideoService) {}

  ngAfterViewInit(): void {
    // compute fallback URLs if not provided
    if (!this.hlsManifestUrl) {
      this.hlsManifestUrl = `https://customer-rya3x70cgdcuq995.cloudflarestream.com/${this.videoId}/manifest/video.m3u8`;
    }
    if (!this.dashManifestUrl) {
      this.dashManifestUrl = `https://customer-rya3x70cgdcuq995.cloudflarestream.com/${this.videoId}/manifest/video.mpd`;
    }

    this.initPlayer();
  }

  ngOnDestroy(): void {
    this.cleanupPlayers();
  }

  async initPlayer() {
    const videoEl = this.videoRef?.nativeElement;
    if (!videoEl) return;

    this.loading = true;
    this.error = undefined;

    videoEl.addEventListener('loadeddata', () => {
      this.loading = false;
    });

    videoEl.addEventListener('error', () => {
      this.error = 'Failed to load video. Please try again later.';
      this.loading = false;
    });

    // If browser supports HLS natively (Safari), use the HLS manifest directly
    if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = this.hlsManifestUrl!;
      videoEl.load();
      return;
    }

    // Try hls.js if supported
    try {
      if (Hls.isSupported()) {
        this.hls = new Hls();
        
        this.hls.on(Hls.Events.MANIFEST_PARSED, (_event: any, data: any) => {
          this.qualities = this.hls.levels.map((level: any, index: number) => ({
            height: level.height,
            bitrate: level.bitrate,
            label: `${level.height}p`
          }));
          this.currentQuality = this.hls.currentLevel;
        });

        this.hls.on(Hls.Events.ERROR, (_event: any, data: { fatal: boolean }) => {
          if (data.fatal) {
            this.error = 'Failed to load video stream. Please try again later.';
            this.loading = false;
          }
        });
        
        this.hls.loadSource(this.hlsManifestUrl!);
        this.hls.attachMedia(videoEl);
        return;
      }
    } catch (e) {
      console.warn('hls.js init failed:', e);
      this.error = 'Failed to initialize video player. Please try again later.';
      this.loading = false;
    }

    // Fallback to dash.js
    try {
      this.dashPlayer = dashjs.MediaPlayer().create();
      this.dashPlayer.initialize(videoEl, this.dashManifestUrl!, true);
      return;
    } catch (e) {
      console.warn('dash.js init failed:', e);
    }

    // Final fallback: try HLS manifest directly (some browsers may support it)
    videoEl.src = this.hlsManifestUrl!;
    videoEl.load();
  }

  private cleanupPlayers() {
    try {
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }
    } catch (e) {
      console.warn('Error destroying hls instance', e);
    }

    try {
      if (this.dashPlayer) {
        this.dashPlayer.reset();
        this.dashPlayer = null;
      }
    } catch (e) {
      console.warn('Error resetting dash player', e);
    }

    const videoEl = this.videoRef?.nativeElement;
    if (videoEl) {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
    }
  }

  private loadScriptOnce(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src === src);
      if (existing) {
        if ((existing as any).loaded) return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
        return;
      }

      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => { (s as any).loaded = true; resolve(); };
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  onQualityChange(index: number) {
    if (this.hls) {
      this.hls.currentLevel = index;
      this.currentQuality = index;
    } else if (this.dashPlayer) {
      const tracks = this.dashPlayer.getBitrateInfoListFor('video');
      if (tracks && tracks.length > index) {
        this.dashPlayer.setQualityFor('video', index);
        this.currentQuality = index;
      }
    }
  }

  toggleFullscreen() {
    const video = this.videoRef.nativeElement;
    if (!document.fullscreenElement) {
      video.requestFullscreen()
        .then(() => this.isFullscreen = true)
        .catch(err => console.error('Error attempting to enable fullscreen:', err));
    } else {
      document.exitFullscreen()
        .then(() => this.isFullscreen = false)
        .catch(err => console.error('Error attempting to exit fullscreen:', err));
    }
  }

  // ---- Upload helpers ----
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    this.fileError = null;
    this.previewUrl = null;
    if (!file.type.startsWith('video/')) {
      this.fileError = 'Only video files are allowed.';
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
    this.uploadProgress = 0;
    this.uploadResult = null;
    // Generate preview thumbnail
    const url = URL.createObjectURL(file);
    this.previewUrl = url;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = false;
  }

  uploadToCloudflare(title?: string) {
    if (!this.selectedFile) return;
    const fd = new FormData();
    fd.append('file', this.selectedFile, this.selectedFile.name);
    if (title) fd.append('title', title);

    this.uploading = true;
    this.videoService.uploadToCloudflare(fd).subscribe((event: any) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round(100 * (event.loaded / event.total));
      } else if (event.type === HttpEventType.Response) {
        this.uploadResult = event.body;
        this.uploading = false;
        this.selectedFile = null;

        // Try to extract Cloudflare UID from backend response
        const cfUid = this.uploadResult?.cloudflare?.result?.uid
          || this.uploadResult?.cloudflare?.uid
          || this.uploadResult?.video?.cloudflareId
          || this.uploadResult?.video?.cloudflare_id;

        if (cfUid) {
          // set videoId to the uploaded Cloudflare UID and re-init player
          this.videoId = cfUid;
          // clear any previously provided manifest URLs so initPlayer recomputes them
          this.hlsManifestUrl = undefined;
          this.dashManifestUrl = undefined;
          // cleanup and re-init
          this.cleanupPlayers();
          // slight delay to ensure video element reset
          setTimeout(() => this.initPlayer(), 100);
        }
      }
    }, (err) => {
      console.error('Upload error', err);
      this.uploading = false;
    });
  }
}
