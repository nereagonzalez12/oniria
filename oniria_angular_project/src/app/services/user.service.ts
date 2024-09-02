import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Notyf } from 'notyf';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { IUser } from '../models/user.model';
import { AuthenticationService } from './authentication.service';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = API_URL + 'users';
  private apiImageProfileUrl = API_URL + 'api/users';
  private errorMessage = 'Ha ocurrido un error';
  private authService = inject(AuthenticationService);

  constructor(private _httpClient: HttpClient, @Inject(NOTYF) private notyf: Notyf) { }

  token = this.authService.getToken();

  updateUser(userId: number, userData: Partial<IUser>): Observable<IUser> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.patch<IUser>(`${this.apiUrl}/${userId}/`, userData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
          this.errorMessage = `${error.error.message}`;
        } else {
          if (error.error.username) {
            this.errorMessage = `${error.error.username[0]}`;
          } else if (error.error.first_name) {
            this.errorMessage = `${error.error.first_name[0]}`;
          } else if (error.error.last_name) {
            this.errorMessage = `${error.error.last_name[0]}`;
          } else if (error.error.bio) {
            this.errorMessage = `${error.error.bio[0]}`;
          }
        }
        // Manejo de errores
        this.notyf.error({
          message: this.errorMessage,
          duration: 5000,
          dismissible: true,
          background: '#EF5350'
        });
        return throwError(() => new Error(this.errorMessage));
      }),

      tap(() => {
        // Enviar una notificación cuando se crea un nuevo post
        this.notyf.success({
          message: 'Informarción personal actualizada!',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),
    );
  }

  updateProfileImage(userId: number, imageData: FormData): Observable<IUser> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.patch<IUser>(`${this.apiImageProfileUrl}/${userId}/upload-profile-image/`, imageData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error.profile_image) {
          this.errorMessage = error.error.profile_image[0];
        }

        this.notyf.error({
          message: this.errorMessage,
          duration: 5000,
          dismissible: true,
          background: '#EF5350'
        });

        return throwError(() => new Error(this.errorMessage));
      }),

      tap(() => {
        // Enviar una notificación cuando se crea un nuevo post
        this.notyf.success({
          message: 'Foto de perfil actualizada!',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),
    );
  }

  getProfileImage(userId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<any>(`${this.apiImageProfileUrl}/${userId}/profile-image/`, { headers });
    // .pipe(
    //   catchError((error: HttpErrorResponse) => {
    //     // console.log(error);
    //     if (error.error instanceof ErrorEvent) {
    //       this.errorMessage = `${error.error.message}`;
    //     }

    //     return throwError(() => new Error(this.errorMessage));
    //   }),
    // );
  }

}
