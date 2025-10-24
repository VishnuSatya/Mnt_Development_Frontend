import { Component } from '@angular/core';
import { VideoService } from '../../../services/video-service';
import { ToastrService } from 'ngx-toastr';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-upload-video-component',
  standalone: false,
  templateUrl: './upload-video-component.html',
  styleUrls: ['./upload-video-component.scss']
})
export class UploadVideoComponent {
  video = {
    title: '',
    description: ''
  };
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private videoService: VideoService,
    private toastr: ToastrService
  ) {}

  // Handle file selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // Upload video
  onUpload() {
  if (!this.selectedFile || !this.video.title || !this.video.description) {
    this.toastr.error('Please fill all fields and select a video!', 'Error');
    return;
  }

  const formData = new FormData();
  formData.append('title', this.video.title);
  formData.append('description', this.video.description);
  formData.append('file', this.selectedFile);

  this.isUploading = true;
  this.uploadProgress = 0;

  this.videoService.uploadVideo(formData, {
    reportProgress: true,
    observe: 'events'
  }).subscribe({
    next: (event: HttpEvent<any>) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response) {
        this.toastr.success('Video uploaded successfully!', 'Success');
        this.resetForm();
      }
    },
    error: (err) => {
      console.error('Upload error:', err);
      this.toastr.error('Video upload failed', 'Error');
      this.isUploading = false;
    }
  });
}


  // Reset form after upload
  resetForm() {
    this.video = { title: '', description: '' };
    this.selectedFile = null;
    this.isUploading = false;
    this.uploadProgress = 0;
  }
}
