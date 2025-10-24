import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './users/login-component/login-component';
import { RegisterComponent } from './users/register-component/register-component';
import { DashboardComponent } from './pages/dashboard-component/dashboard-component';
import { ViewVideosComponent } from './pages/dashboard-component/view-videos-component/view-videos-component';
import { UploadVideoComponent } from './pages/dashboard-component/upload-video-component/upload-video-component';
import { AuthGuard } from './guards/auth-guard';

const routes: Routes = [
   { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children: [
      { path: 'upload', component: UploadVideoComponent },
      { path: 'videos', component: ViewVideosComponent },
      { path: '', redirectTo: 'videos', pathMatch: 'full' } // default dashboard route
    ]
   },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
