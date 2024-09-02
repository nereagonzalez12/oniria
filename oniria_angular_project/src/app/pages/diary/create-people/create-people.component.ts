import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IUser } from 'src/app/models/user.model';
import { ApiPeopleInvolvedService } from 'src/app/services/api-people-involved.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-create-people',
  templateUrl: './create-people.component.html',
  styleUrls: ['./create-people.component.css']
})
export class CreatePeopleComponent implements OnInit {

  peopleForm: FormGroup = new FormGroup({});
  submitted = false;
  currentUser?: IUser;
  @Output() discard = new EventEmitter<boolean>();
  private authService = inject(AuthenticationService);
  private peopleService = inject(ApiPeopleInvolvedService);
  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {

    this.peopleForm = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['']
    });

    // Obtener la información del usuario actual
    this.authService.getUserInfo().subscribe({
      next: (user: IUser) => {
        this.currentUser = user;
      },
      error: (error: any) => {
        console.error('Error al obtener información del usuario:', error);
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.peopleForm.invalid || !this.currentUser) {
      return;
    }

    // Obtener el nombre de usuario del formulario
    const usernameInput = this.peopleForm.get('username')?.value; // Acceso seguro para evitar errores

    var peopleWithUserId = {
      ...this.peopleForm.value,
      user: this.currentUser.id,
    };

    if (usernameInput) {
      peopleWithUserId = {
        ...peopleWithUserId,
        linked_username: usernameInput
      };
    }
    this.peopleService.newPeople(peopleWithUserId).subscribe({
      next: (response: any) => {
        // console.log('intruso creado');
      },
      error: (error: any) => {
        console.log('Error: ', error);
      }
    });
  }

  discardButton() {
    let discard = true;
    this.discard.emit(discard);
  }

  hasErrors(contolName: string, errorType: string) {
    const control = this.peopleForm.get(contolName);
    return control && control.hasError(errorType) && control.touched || (this.submitted && control?.hasError(errorType));
  }

}
