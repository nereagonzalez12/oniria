import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Notyf } from 'notyf';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { ICategory } from '../models/category.models';
import { AuthenticationService } from './authentication.service';
import { CategoryNotificationService } from './category-notification.service';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class ApiCategoriesService {

  private categoryURL = API_URL + 'api/categories';

  private errorMessage = 'Ha ocurrido un error';
  private authService = inject(AuthenticationService);

  private categoryNotificationService = inject(CategoryNotificationService);
  constructor(private _httpClient: HttpClient, @Inject(NOTYF) private notyf: Notyf) { }

  // Obtiene el token de autenticación del servicio de autenticación
  token = this.authService.getToken();
  // Agrega el token al encabezado de autorización

  /* GET */
  public getAllCategories(): Observable<ICategory[]> {
    // Realiza la solicitud HTTP con el encabezado de autorización
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<ICategory[]>(`${this.categoryURL}/`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejo de errores
        return throwError(() => new Error());
      })
    );
  }


  public getCategoryById(id: number): Observable<ICategory> { //devuelve un observable de una categoría
    return this._httpClient.get<ICategory>(`${this.categoryURL}/${id}/`);
  }

  /* POST */
  public newCategory(category: ICategory): Observable<ICategory> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.post<ICategory>(`${this.categoryURL}/`, category, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.error instanceof ErrorEvent) {
          this.errorMessage = `${error.error.message}`;
        } else {
          if (error.error.name) {
            this.errorMessage = `${error.error.name[0]}`;
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
        this.categoryNotificationService.notifyCategoryCreated();
        this.notyf.success({
          message: 'Etiqueta añadida!',
          duration: 4000,
          dismissible: false,
          background: '#6871f1'
        });
      }),
    );
  }

  /* PUT */
  public updateCategory(id: number, category: ICategory): Observable<ICategory> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    const updateURL = `${this.categoryURL}/${category.id}/`;
    return this._httpClient.put<ICategory>(`${updateURL}`, category, { headers }).pipe(
      catchError((error: any) => {
        return throwError(() => new Error());
      })
    );
  }

  /* DELETE */
  public deleteCategory(id: number): Observable<ICategory> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.delete<ICategory>(`${this.categoryURL}/${id}/`, { headers }).pipe(
      catchError((error: any) => {
        return throwError(() => new Error());
      })
    );
  }

}
