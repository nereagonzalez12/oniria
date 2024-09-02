import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Notyf } from 'notyf';
import { Observable, catchError, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  private likesURL = API_URL + 'api/posts';
  private errorMessage = 'Ha ocurrido un error';
  private headers: HttpHeaders;

  constructor(private _httpClient: HttpClient, private cookieService: CookieService, @Inject(NOTYF) private notyf: Notyf) {
    const token = this.cookieService.get('loginToken');
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
  }

  /* ESTADO DEL LIKE (GET)*/
  getLikeStatusForPosts(postId: number): Observable<{ post_id: number, liked: boolean, like_count: number; }> {
    return this._httpClient.get<{ post_id: number, liked: boolean, like_count: number; }>(`${this.likesURL}/${postId}/like_status/`, { headers: this.headers }) // Usa la URL actualizada y las opciones de cabecera
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          if (error.error.detail) {
            this.errorMessage = `${error.error.detail}`;
          }
          return throwError(() => new Error(this.errorMessage));
        }),
      );
  }


  /* DAR LIKE (POST)*/
  likePost(postId: number): Observable<any> {
    return this._httpClient.post<any>(`${this.likesURL}/${postId}/like/`, {}, { headers: this.headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          if (error.error.detail) {
            this.errorMessage = `${error.error.detail}`;
          }
          return throwError(() => new Error(this.errorMessage));
        }),
      );
  }

  /* QUITAR LIKE (DELETE)*/
  unlikePost(postId: number): Observable<any> {
    return this._httpClient.delete<any>(`${this.likesURL}/${postId}/unlike/`, { headers: this.headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          if (error.error.detail) {
            this.errorMessage = `${error.error.detail}`;
          }
          return throwError(() => new Error(this.errorMessage));
        }),
      );
  }

}
