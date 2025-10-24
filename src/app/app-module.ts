import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HeaderComponent } from './widgets/header-component/header-component';
import { FooterComponent } from './widgets/footer-component/footer-component';
import { RegisterComponent } from './users/register-component/register-component';
import { LoginComponent } from './users/login-component/login-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { DashboardComponent } from './pages/dashboard-component/dashboard-component';
import { UploadVideoComponent } from './pages/dashboard-component/upload-video-component/upload-video-component';
import { ViewVideosComponent } from './pages/dashboard-component/view-videos-component/view-videos-component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth-service';
import { VideoService } from './services/video-service';
import { AuthGuard } from './guards/auth-guard';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';
import { ToastrModule } from 'ngx-toastr';
@NgModule({
  declarations: [
    App,
    HeaderComponent,
    FooterComponent,
    RegisterComponent,
    LoginComponent,
    LandingComponent,
    DashboardComponent,
    UploadVideoComponent,
    ViewVideosComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    
  ],
  providers: [
     AuthService,
    VideoService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
