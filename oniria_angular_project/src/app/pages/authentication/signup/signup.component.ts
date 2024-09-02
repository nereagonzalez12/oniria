import { Component, Inject, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControlOptions, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Notyf } from 'notyf';
import { filter } from 'rxjs';
import { NOTYF } from 'src/app/components/ui/notyf.token';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormValidatorService } from 'src/app/services/form-validator.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  showPersonalDataForm: boolean = true;
  passwordFieldType: string = 'password';
  personalDataForm: FormGroup = new FormGroup({});
  usernameForm: FormGroup = new FormGroup({});
  submittedPersonalData: boolean = false;
  submittedUsername: boolean = false;
  private authService = inject(AuthenticationService);

  constructor(private formBuilder: FormBuilder, private router: Router,
    @Inject(NOTYF) private notyf: Notyf) { }

  ngOnInit(): void {
    // Comprobar cuando se navega a otro componente
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => {
        // Eliminar el sessionStorage al salir del componente
        sessionStorage.removeItem('formData');
        sessionStorage.removeItem('formUser');
        sessionStorage.removeItem('showPersonalDataForm');
      });

    const formData = sessionStorage.getItem('formData');
    const formUser = sessionStorage.getItem('formUser');
    // Recuperar el valor del showPersonalDataForm cuando se carga la página
    const showPersonalDataString = sessionStorage.getItem('showPersonalDataForm');
    if (showPersonalDataString) {
      this.showPersonalDataForm = showPersonalDataString === 'true'; // Convertir de cadena a booleano
    }
    // Inicializa el formulario
    // Comprueba en el almacenamiento local los datos guardados del último formulario
    if (formUser) {
      const parsedForm = JSON.parse(formUser);
      this.initUsernameForm();
      this.usernameForm.patchValue(parsedForm);
    } else if (formData) {
      const parsedForm = JSON.parse(formData);
      this.initPersonalDataForm();
      this.personalDataForm.patchValue(parsedForm);
    } else {
      // Inicializar solo el primer formulario
      this.initPersonalDataForm();
    }
  }

  initPersonalDataForm() {
    // Recoger datos del formulario
    this.personalDataForm = this.formBuilder.group({
      firstName: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]],
      lastName: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]],
      email: ['', [Validators.required, FormValidatorService.customEmailValidator()]],
      password: ['', [Validators.required, FormValidatorService.strongPasswordValidator()]],
      confirmPassword: ['', Validators.required],
      agreeCheck: [false, [FormValidatorService.requiredCheckboxValidator()]],
    }, { validator: this.passwordMatchValidator } as FormControlOptions);
  }
  initUsernameForm() {
    this.usernameForm = this.formBuilder.group({
      username: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]],
    });
  }

  get f() { return this.personalDataForm.controls; }
  get f2() { return this.usernameForm.controls; }


  onSubmitPersonalData() {

    this.submittedPersonalData = true;
    sessionStorage.setItem('formData', JSON.stringify(this.personalDataForm.value));

    // Verificar si el primer formulario es válido
    if (this.personalDataForm.invalid) {
      return;
    }

    sessionStorage.setItem('showPersonalDataForm', 'false');
    this.showPersonalDataForm = false;

    // Una vez enviado el primer formulario, inicializar el segundo formulario
    this.initUsernameForm();
  }

  onSubmitUsernameForm() {

    this.submittedUsername = true;
    sessionStorage.setItem('formUser', JSON.stringify(this.usernameForm.value));

    if (this.usernameForm.invalid) {
      return;
    }

    const formData = sessionStorage.getItem('formData');
    const formUser = sessionStorage.getItem('formUser');
    if (formData && formUser) {
      const parsedFormUser = JSON.parse(formUser);
      const parsedFormData = JSON.parse(formData);
      // Crear usuario con funcion signup
      this.authService.signup(parsedFormData.firstName, parsedFormData.lastName, parsedFormData.email, parsedFormUser.username, parsedFormData.password).subscribe({
        next: (response: any) => {
          this.notyf.success({
            message: 'Cuenta creada con éxito!',
            duration: 2500,
            dismissible: false,
            backgroundColor: '#6871f1',
          });

          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          console.log('Error: ', error);
        }
      });
    }

  }

  backButton(): void {
    sessionStorage.removeItem('formUser');
    sessionStorage.removeItem('showPersonalDataForm');
    this.showPersonalDataForm = true;
  };

  hasErrors(controlName: string, errorType: string) {
    const control = this.showPersonalDataForm ? this.personalDataForm.get(controlName) : this.usernameForm.get(controlName);
    const submitted = this.showPersonalDataForm ? this.submittedPersonalData : this.submittedUsername;
    return control && control.hasError(errorType) && control.touched || (submitted && control?.hasError(errorType));
  }


  // Comprobar que las contraseñas coinciden
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      control.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}


