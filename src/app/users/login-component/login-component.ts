import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: false,
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent implements OnInit{
  form!: FormGroup;
  showPassword: boolean = false;  
  show=false;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router){}
  ngOnInit(): void {
    this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  }
  onSubmit(){
    if(this.form.invalid) return;
    this.auth.login(this.form.value).subscribe({
      next: ()=> this.router.navigate(['/dashboard']),
      error: (e)=> alert(e.error?.message || 'Login failed')
    });
  }
}
