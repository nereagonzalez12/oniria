import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Notyf } from 'notyf';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { IPost } from '../models/post.model';
import { AuthenticationService } from './authentication.service';
import { API_URL } from './globals';
import { PostNotificationService } from './post-notification.service';

@Injectable({
  providedIn: 'root'
})
export class ApiPostService {
  private postURL = API_URL + 'api/posts';
  private errorMessage = 'Ha ocurrido un error';
  private authService = inject(AuthenticationService);
  private postNotificationService = inject(PostNotificationService);
  constructor(private _httpClient: HttpClient, @Inject(NOTYF) private notyf: Notyf) { }

  // Obtiene el token de autenticación del servicio de autenticación
  token = this.authService.getToken();
  // Agrega el token al encabezado de autorización

  /* GET */
  public getAllPosts(): Observable<IPost[]> {
    // Realiza la solicitud HTTP con el encabezado de autorización
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.postURL}/`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejo de errores
        return throwError(() => new Error());
      })
    );
  }

  public getPostById(id: number): Observable<IPost> { //devuelve un observable de un post
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost>(`${this.postURL}/${id}/`, { headers });
  }

  /* POST */
  public newPost(post: IPost): Observable<IPost> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.post<IPost>(`${this.postURL}/`, post, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
          this.errorMessage = `${error.error.message}`;
        } else {
          if (error.error.title) {
            this.errorMessage = `${error.error.title[0]}`;
          } else if (error.error.dream_date) {
            this.errorMessage = `${error.error.dream_date[0]}`;
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
        this.postNotificationService.notifyPostCreated();
        this.notyf.success({
          message: 'Sueño registrado!',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),
    );
  }

  /* PUT */
  public updatePost(id: number, post: IPost): Observable<IPost> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    const updateURL = `${this.postURL}/${post.id}/`;
    return this._httpClient.put<IPost>(`${updateURL}`, post, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
          this.errorMessage = `${error.error.message}`;
        } else {
          if (error.error.title) {
            this.errorMessage = `${error.error.title[0]}`;
          } else if (error.error.dream_date) {
            this.errorMessage = `${error.error.dream_date[0]}`;
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
        this.postNotificationService.notifyPostCreated();
        this.notyf.success({
          message: 'Sueño actualizado!',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),

    );
  }

  /* PATCH */
  public addCategoryToPost(postId: number, categories: number[]): Observable<IPost> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    const updateURL = `${this.postURL}/${postId}/`;
    return this._httpClient.patch<IPost>(updateURL, { category: categories }, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
          this.errorMessage = `${error.error.message}`;
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
        this.postNotificationService.notifyPostCreated();
        this.notyf.success({
          message: 'Etiqueta añadida al sueño',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),
    );
  }

  /* PATCH */
  public addPeopleToPost(postId: number, people: number[]): Observable<IPost> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    const updateURL = `${this.postURL}/${postId}/`;
    return this._httpClient.patch<IPost>(updateURL, { people_involved: people }, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
          this.errorMessage = `${error.error.message}`;
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
        this.postNotificationService.notifyPostCreated();
        this.notyf.success({
          message: 'Un intruso se ha colado en el sueño!',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),
    );
  }

  /* DELETE */
  public deletePost(id: number): Observable<IPost> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.delete<IPost>(`${this.postURL}/${id}/`, { headers }).pipe(
      catchError((error: any) => {
        return throwError(() => new Error());
      })
    );
  }

  /* BÚSQUEDAS CON FILTROS */

  // filtro por parámetros
  searchPosts(query: string) {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.postURL}/?search=${query}`, { headers }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }

  // filtro por etiquetas
  getPostsByCategories(categoryIds: number[]): Observable<IPost[]> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    const params = new HttpParams().set('categories', categoryIds.join(','));
    const url = `${this.postURL}/filter_by_categories/`;
    return this._httpClient.get<IPost[]>(url, { headers, params }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }

  // filtro por intrusos
  getPostsByPeopleInvolved(peopleId: number[]): Observable<IPost[]> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    const params = new HttpParams().set('people-involved', peopleId.join(','));
    const url = `${this.postURL}/filter_by_people_involved/`;
    return this._httpClient.get<IPost[]>(url, { headers, params }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }


}
