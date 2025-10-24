import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-header-component',
  standalone: false,
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent implements OnInit{
  isLoggedIn = false;
   private routerSubscription!: Subscription;

  constructor(private auth: AuthService , private router: Router) {}

  ngOnInit(): void {
     this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        console.log('NavigationEnd to:', event.url);
 this.auth.isLoggedIn$.subscribe(status => {
      console.log(status)
      this.isLoggedIn = status;
    });
        // Call your function here
      });
  }

  logout() {
 this.auth.logout();
    this.router.navigate(['/']);
  }
}
