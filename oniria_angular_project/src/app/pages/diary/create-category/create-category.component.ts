import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IUser } from 'src/app/models/user.model';
import { ApiCategoriesService } from 'src/app/services/api-categories.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.css']
})
export class CreateCategoryComponent implements OnInit {
  categoryForm: FormGroup = new FormGroup({});
  submitted = false;
  currentUser?: IUser;
  @Output() discard = new EventEmitter<boolean>();
  private authService = inject(AuthenticationService);
  private categService = inject(ApiCategoriesService);
  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {

    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      is_default: [false]
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

    if (this.categoryForm.invalid || !this.currentUser) {
      return;
    }
    const categWithUserId = {
      ...this.categoryForm.value,
      user: this.currentUser.id
    };

    this.categService.newCategory(categWithUserId).subscribe({
      next: (response: any) => {
        // console.log('categoria creada');
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
    const control = this.categoryForm.get(contolName);
    return control && control.hasError(errorType) && control.touched || (this.submitted && control?.hasError(errorType));
  }


}
