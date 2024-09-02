import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { parse } from 'date-fns';
import { IUser } from 'src/app/models/user.model';
import { FollowersService } from 'src/app/services/followers.service';
import { API_URL } from 'src/app/services/globals';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnChanges {
  @Input() loggedInUsername?: string;
  @Input() loggedInId?: number;
  @Input() first_name?: string;
  @Input() last_name?: string;
  @Input() birthday?: Date;
  @Input() bio?: string;
  @Input() date_joined?: Date | string; // Cambiado a Date | string
  profile_image?: File;
  profile_image_url?: string;
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef;
  date_formatted?: string;
  userName?: string;
  isEditMode: boolean = false;
  submitted: boolean = false;
  userForm: FormGroup;
  followers: IUser[] = [];
  private months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  private followersService = inject(FollowersService);
  private userService = inject(UserService);

  constructor(private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private http: HttpClient) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      first_name: [''],
      last_name: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.updateFormattedDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loggedInUsername'] || changes['bio'] || changes['first_name'] || changes['last_name'] || changes['birthday'] || changes['profile_image_url']) {
      this.userName = this.first_name + ' ' + this.last_name;
      this.userForm.patchValue({
        username: this.loggedInUsername,
        first_name: this.first_name,
        last_name: this.last_name,
        bio: this.bio
      });

    }

    if (changes['date_joined'] && this.date_joined !== undefined) {
      this.updateFormattedDate();

      // Solo se parsea si es un string
      if (typeof this.date_joined === 'string') {
        this.transform(this.parseDate(this.date_joined));
      }
    }

    if (changes['loggedInId']) {
      this.loadProfileImageUrl();
      this.loadFollowers();
    }

  }

  updateFormattedDate(): void {
    if (this.date_joined instanceof Date) {
      this.transform(this.date_joined);
    } else if (typeof this.date_joined === 'string') {
      const date = this.parseDate(this.date_joined);
      if (date) {
        this.transform(date);
      } else {
        console.error('Fecha inválida:', this.date_joined);
      }
    }
  }

  transform(date: Date | undefined): void {
    if (date != undefined) {
      const day = date.getDate();
      const month = this.months[date.getMonth()];
      const year = date.getFullYear();
      this.date_formatted = `Te uniste el ${day} de ${month} de ${year}`;
    }
  }

  parseDate(dateStr: string): Date | undefined {
    try {
      const date = parse(dateStr, 'dd/MM/yy HH:mm:ss', new Date());
      return isNaN(date.getTime()) ? undefined : date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return undefined;
    }
  }

  loadFollowers(): void {
    if (this.loggedInId) {
      this.followersService.getFollowers(this.loggedInId).subscribe(data => {
        this.followers = data;
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.userForm.valid && this.loggedInId) {

      this.userService.updateUser(this.loggedInId, this.userForm.value).subscribe({
        next: (updatedUser: IUser) => {
          // console.log('User updated successfully', updatedUser);
          // Actualizar los datos del usuario después de la actualización exitosa
          this.loggedInUsername = updatedUser.username;
          this.first_name = updatedUser.first_name;
          this.last_name = updatedUser.last_name;
          this.userName = this.first_name + ' ' + this.last_name;
          this.bio = updatedUser.bio;
          // Actualizar el formulario con los nuevos datos del usuario
          this.userForm.patchValue({
            username: this.loggedInUsername,
            first_name: this.first_name,
            last_name: this.last_name,
            bio: this.bio
          });
          // Deshabilitar el modo de edición después de la actualización exitosa
          this.isEditMode = false;
        },
        error: (error) => {
          console.error('Error updating user', error);
        }
      });
    }
  }

  discardEdit() {
    this.isEditMode = false;
    this.userForm.patchValue({
      username: this.loggedInUsername,
      first_name: this.first_name,
      last_name: this.last_name,
      bio: this.bio
    });
  }


  enableEditMode(): void {
    this.isEditMode = true;
  }

  hasErrors(contolName: string, errorType: string) {
    const control = this.userForm.get(contolName);
    return control && control.hasError(errorType) && control.touched || (this.submitted && control?.hasError(errorType));
  }

  /* IMAGEN DE PERFIL */
  onImageChanged(event: any) {
    this.profile_image = event.target.files[0];
  }

  loadProfileImageUrl(): void {
    if (this.loggedInId) {
      this.userService.getProfileImage(this.loggedInId).subscribe({
        next: (data) => {
          if (data.profile_image_url !== null) {
            this.profile_image_url = API_URL + data.profile_image_url;
          }
        }
      });
    }
  }

  updateImageProfile() {
    const uploadData = new FormData();
    if (this.profile_image && this.loggedInId) {
      uploadData.append('profile_image', this.profile_image, this.profile_image.name);
      this.userService.updateProfileImage(this.loggedInId, uploadData).subscribe({
        next: (data) => {
          this.loadProfileImageUrl();
        },
        error: (error) => {
          console.error('Error al cargar el archivo:', error);
        }
      });
    }
  }

  onFileSelected(event: any) {
    // Aquí puedes manejar la lógica para obtener el archivo seleccionado
    const selectedFile = event.target.files[0];

    // Asignar el archivo seleccionado a profile_image
    this.profile_image = selectedFile;
    this.updateImageProfile();

  }

  triggerFileInput() {
    this.fileInput?.nativeElement.click();
  }
}



