import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root' // so you don’t have to add it manually in providers
})
export class AuthService {
  private api = `${environment.apiUrl}/api/auth`;

  // BehaviorSubject to track login state
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * REGISTER
   */
  register(data: any): Observable<any> {
    return this.http.post(`${this.api}/register`, data);
  }

  /**
   * LOGIN
   */
  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, data).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.loggedIn.next(true);
        }
      })
    );
  }

  /**
   * LOGOUT
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedIn.next(false);
  }

  /**
   * TOKEN HELPERS
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * USER HELPERS
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  currentUser(): any {
    return this.getUser();
  }

  getCurrentUserId(): string | null {
    const user = this.getUser();
    return user ? user._id : null; // assumes backend returns { _id, name, email }
  }

  /**
   * SIMPLE FLAGS
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }
}
