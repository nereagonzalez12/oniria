import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Notyf } from 'notyf';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NOTYF } from '../components/ui/notyf.token';
import { IUser } from '../models/user.model';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private TOKEN_COOKIE_NAME = 'loginToken';
  private loginURL = API_URL + 'api/login';
  private signupURL = API_URL + 'api/signup';
  private logoutURL = API_URL + 'api/logout';
  private userInfoURL = API_URL + 'api/user-info';
  private getUserURL = API_URL + 'api/users';
  private errorMessage = 'Ha ocurrido un error';

  constructor(private _httpClient: HttpClient, private cookieService: CookieService, @Inject(NOTYF) private notyf: Notyf) { }

  /* SIGNUP (POST) */
  public signup(first_name: string, last_name: string, email: string, username: string, password: string): Observable<IUser> {
    return this._httpClient.post<IUser>(`${this.signupURL}/`, { first_name, last_name, email, username, password })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            this.errorMessage = `${error.error.message}`;
          } else {
            // Error del lado del servidor;
            if (error.error.email) {
              this.errorMessage = `${error.error.email[0]}`; // Mensaje de error para el campo email
            } else if (error.error.username) {
              this.errorMessage = `${error.error.username[0]}`; // Mensaje de error para el campo username
            } else if (error.error.password) {
              this.errorMessage = `Error de contraseña: ${error.error.password[0]}`; // Mensaje de error para el campo password
            }
          }
          // Muestra el mensaje de error utilizando el servicio Notyf
          this.notyf.error({
            message: this.errorMessage,
            duration: 5000,
            dismissible: true,
            background: '#EF5350'
          });
          return throwError(() => new Error(this.errorMessage)); // Utilizando función de fábrica
        })
      );
  }

  /* LOGIN (POST)  */
  public login(username: string, password: string): Observable<IUser> {
    return this._httpClient.post<IUser>(`${this.loginURL}/`, { username, password })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            this.errorMessage = `${error.error.message}`;

          } else {
            // Error del lado del servidor
            // errorStatus = `${error.status}`;
            this.errorMessage = `${error.error.detail}`;
          }
          // Muestra el mensaje de error utilizando el servicio Notyf
          console.log(error.error.detail);
          this.notyf.error({
            message: this.errorMessage,
            duration: 5000,
            dismissible: true,
            background: '#EF5350'
          });
          return throwError(() => new Error(this.errorMessage)); // Utilizando función de fábrica
        })
      );
  }

  /* METODO PARA VERIFICAR AUTENTICACIÓN (CHECK) */
  isLoggedIn(): boolean {
    return this.cookieService.check('loginToken');
  }
  /* Obtener el token de autenticación desde la cookie */
  public getToken(): string | null {
    return this.cookieService.get(this.TOKEN_COOKIE_NAME);
  }

  /* GET */
  getUserById(userId: number): Observable<IUser> {
    // Obtener el token de la cookie
    const token = this.cookieService.get('loginToken');
    // Agregar el token al encabezado de autorización
    const headers = { Authorization: `Token ${token}` };
    return this._httpClient.get<IUser>(`${this.getUserURL}/${userId}/`, { headers });
  }

  /* OBTENER INFORMACIÓN DE USUARIO (GET) */
  getUserInfo(): Observable<IUser> {
    // Obtener el token de la cookie
    const token = this.cookieService.get('loginToken');
    // Agregar el token al encabezado de autorización
    const headers = { Authorization: `Token ${token}` };
    // Realizar la solicitud al backend para obtener la información del usuario
    return this._httpClient.get<IUser>(this.userInfoURL + '/', { headers });
  }

  /*  LOGOUT */
  logout() {
    const token = this.cookieService.get('loginToken');
    const headers = { Authorization: `Token ${token}` };
    this.cookieService.delete('loginToken');
    this.cookieService.delete('sessionid');
    return this._httpClient.post(this.logoutURL + '/', {}, { headers });
  }
}
