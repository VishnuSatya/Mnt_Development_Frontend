import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { VideoService } from '../../../services/video-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-view-videos-component',
  standalone: false,
  templateUrl: './view-videos-component.html',
  styleUrl: './view-videos-component.scss'
})
export class ViewVideosComponent implements OnInit {
  url: string = `${environment.apiUrl}`;
  videos: any[] = [];
  selectedVideo: any = null;
  currentUserId: string | null = null;
  newComment: { [key: string]: string } = {};

  constructor(private videoService: VideoService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadVideos();
  }

  loadVideos() {
    this.videoService.getVideos().subscribe({
      next: (res: any) => this.videos = res,
      error: (err) => console.error('Error loading videos:', err)
    });
  }

  getVideoUrl(filename: string): string {
    return `${this.url}/api/videos/stream/${filename}`;
  }

  openVideo(video: any) {
    this.selectedVideo = video;
  }

  closeVideo() {
    this.selectedVideo = null;
  }

  like(videoId: string) {
    if (!this.currentUserId) return alert('Please log in to like');
    this.videoService.likeVideo(videoId, this.currentUserId).subscribe((updatedVideo) => {
      this.mergeVideoData(videoId, updatedVideo);
    });
  }

  dislike(videoId: string) {
    if (!this.currentUserId) return alert('Please log in to dislike');
    this.videoService.dislikeVideo(videoId, this.currentUserId).subscribe((updatedVideo) => {
      this.mergeVideoData(videoId, updatedVideo);
    });
  }

  addComment(videoId: string) {
    if (!this.currentUserId) return alert('Please log in to comment');
    const text = this.newComment[videoId];
    if (!text || text.trim() === '') return;

    this.videoService.addComment(videoId, this.currentUserId, text).subscribe((updatedVideo) => {
      this.newComment[videoId] = '';
      this.mergeVideoData(videoId, updatedVideo);
    });
  }

  /** ✅ Fix uploadedBy disappearing by merging existing data */
  private mergeVideoData(videoId: string, updatedVideo: any) {
    const index = this.videos.findIndex(v => v._id === videoId);
    if (index !== -1) {
      updatedVideo.uploadedBy = this.videos[index].uploadedBy; // keep uploader
      this.videos[index] = updatedVideo;
    }
    if (this.selectedVideo && this.selectedVideo._id === videoId) {
      updatedVideo.uploadedBy = this.selectedVideo.uploadedBy; // keep uploader in modal
      this.selectedVideo = updatedVideo;
    }
  }
}
