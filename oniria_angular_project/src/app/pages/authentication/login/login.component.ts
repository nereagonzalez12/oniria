import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Notyf } from 'notyf';
import { NOTYF } from 'src/app/components/ui/notyf.token';
import { IUser } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  passwordFieldType: string = 'password';
  passResponse: boolean = false;
  private authService = inject(AuthenticationService);


  constructor(
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    @Inject(NOTYF) private notyf: Notyf

  ) { }

  ngOnInit(): void {
    // Recoger datos del formulario
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmitLogin() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }


    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    const rememberMe = this.loginForm.value.rememberMe;

    // Pedir token de autenticación con metodo login
    this.authService.login(username, password).subscribe({
      next: (data: IUser) => {
        const expirationDays = rememberMe ? 30 : undefined;
        // Token provisional de inicio de sesión (funciona pero no es seguro)
        this.cookieService.set('loginToken', data.token, expirationDays);
        this.notyf.success({
          message: 'Sesion iniciada',
          duration: 2500,
          dismissible: false
        });
        // Redireccionar al usuario a la página de inicio
        this.router.navigate(['/diary']);
      },
      error: (error) => {
        // Manejar el error
        console.error('Error:', error.message);
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }


  hasErrors(contolName: string, errorType: string) {
    const control = this.loginForm.get(contolName);
    return control && control.hasError(errorType) && control.touched || (this.submitted && control?.hasError(errorType));
  }

  /* respuesta del enlace 'olvidar contraseña' */
  noRestartPass() {
    this.passResponse = true;
  }
}
