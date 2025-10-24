import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-component',
  standalone: false,
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss'
})
export class DashboardComponent {
 isCollapsed = false;
  activeTab: string = 'home';

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
   constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
