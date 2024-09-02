import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Notyf } from 'notyf';
import { Observable, catchError, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { ICategory } from '../models/category.models';
import { AuthenticationService } from './authentication.service';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class ApiPublicCategoriesService {
  private publicCategoriesURL = API_URL + 'api/categories/public_categories';
  private errorMessage = 'Ha ocurrido un error';
  private authService = inject(AuthenticationService);
  constructor(private _httpClient: HttpClient, @Inject(NOTYF) private notyf: Notyf) { }

  token = this.authService.getToken();
  /* GET */
  public getAllCategories(): Observable<ICategory[]> {
    // Realiza la solicitud HTTP con el encabezado de autorización
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<ICategory[]>(`${this.publicCategoriesURL}/`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejo de errores
        return throwError(() => new Error());
      })
    );
  }

  public getCategoryById(id: number): Observable<ICategory> { //devuelve un observable de una categoría
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<ICategory>(`${this.publicCategoriesURL}/${id}/`, { headers });
  }
}
