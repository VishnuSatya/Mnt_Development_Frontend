import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // change URL if different
    this.socket = io(`${environment.apiUrl}`, {
      transports: ['websocket', 'polling']
    });
  }

  onEvent<T = any>(eventName: string): Observable<T> {
    return new Observable<T>(observer => {
      const handler = (data: T) => observer.next(data);
      this.socket.on(eventName, handler);

      return () => {
        this.socket.off(eventName, handler);
      };
    });
  }

  emit(eventName: string, payload?: any) {
    this.socket.emit(eventName, payload);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
