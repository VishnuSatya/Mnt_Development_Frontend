import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Video } from '../video.model';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class VideoService {
  api = `${environment.apiUrl}/api/videos`;
 private socket: Socket;

  constructor(private http: HttpClient){
    this.socket = io(`${environment.apiUrl}`);
  }
  uploadVideo(formData: FormData, options: any = {}): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.api}/upload`, formData, {
      reportProgress: true,
      ...options
    });
    return this.http.request(req);
  }

  uploadToCloudflare(formData: FormData, options: any = {}): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.api}/upload-cloudflare`, formData, {
      reportProgress: true,
      ...options
    });
    return this.http.request(req);
  }

   getVideos(): Observable<any> {
    return this.http.get(`${this.api}`);
  }

  getVideoStream(filename: string): string {
    console.log(`${this.api}/stream${filename}`)
    return `${this.api}/stream${filename}`;
  }

 likeVideo(id: string, userId: string) {
  return this.http.put(`${this.api}/like/${id}`, { userId });
}

dislikeVideo(id: string, userId: string) {
  return this.http.put(`${this.api}/dislike/${id}`, { userId });
}

addComment(id: string, userId: string, text: string) {
  return this.http.post(`${this.api}/comment/${id}`, { userId, text });
}

addView(id: string) {
  return this.http.put(`${this.api}/view/${id}`, {});
}

}
