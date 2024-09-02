import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Notyf } from 'notyf';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { IPeopleInvolved } from '../models/people-involved.models';
import { AuthenticationService } from './authentication.service';
import { API_URL } from './globals';
import { PeopleNotificationService } from './people-notification.service';

@Injectable({
  providedIn: 'root'
})
export class ApiPeopleInvolvedService {

  private peopleURL = API_URL + 'api/people-involved';

  private errorMessage = 'Ha ocurrido un error';
  private peopleNotificationService = inject(PeopleNotificationService);
  private authService = inject(AuthenticationService);
  constructor(private _httpClient: HttpClient, @Inject(NOTYF) private notyf: Notyf) { }

  // Obtiene el token de autenticación del servicio de autenticación
  token = this.authService.getToken();
  // Agrega el token al encabezado de autorización



  /* GET */
  public getAllPeople(): Observable<IPeopleInvolved[]> {
    // Realiza la solicitud HTTP con el encabezado de autorización
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPeopleInvolved[]>(`${this.peopleURL}/`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }

  public getPeopleById(id: number): Observable<IPeopleInvolved> { //devuelve un observable de un post
    return this._httpClient.get<IPeopleInvolved>(`${this.peopleURL}/${id}/`);
  }

  /* POST */
  public newPeople(people: IPeopleInvolved): Observable<IPeopleInvolved> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.post<IPeopleInvolved>(`${this.peopleURL}/`, people, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error.linked_username) {
          this.errorMessage = `${error.error.linked_username[0]}`;
        } else if (error.error.non_field_errors) {
          this.errorMessage = `${error.error.non_field_errors[0]}`;
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
        this.peopleNotificationService.notifyPeopleCreated();
        this.notyf.success({
          message: 'Intruso añadido!',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),
    );
  }

  /* PUT */
  public updatePeople(id: number, people: IPeopleInvolved): Observable<IPeopleInvolved> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    const updateURL = `${this.peopleURL}/${people.id}/`;
    return this._httpClient.put<IPeopleInvolved>(`${updateURL}`, people, { headers }).pipe(
      catchError((error: any) => {
        return throwError(() => new Error());
      })
    );
  }

  /* DELETE */
  public deletePeople(id: number): Observable<IPeopleInvolved> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.delete<IPeopleInvolved>(`${this.peopleURL}/${id}/`, { headers }).pipe(
      catchError((error: any) => {
        return throwError(() => new Error());
      })
    );
  }

}
