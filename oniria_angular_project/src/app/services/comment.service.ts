import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Notyf } from 'notyf';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { IComment } from '../models/comments.models';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private commentsURL = API_URL + 'api/posts';
  private deleteCommentsURL = API_URL + 'api/comments';
  private errorMessage = 'Ha ocurrido un error';
  private headers: HttpHeaders;

  constructor(private _httpClient: HttpClient, private cookieService: CookieService, @Inject(NOTYF) private notyf: Notyf) {
    const token = this.cookieService.get('loginToken');
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
  }

  // Obtener comentarios de un post
  getComments(postId: number): Observable<IComment[]> {
    return this._httpClient.get<IComment[]>(`${this.commentsURL}/${postId}/comments/`, { headers: this.headers })
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

  // Crear un comentario en un post
  createComment(comment: IComment): Observable<IComment> {
    const requestBody = {
      post: comment.post,
      user: comment.user,
      content: comment.content
    };
    return this._httpClient.post<IComment>(`${this.commentsURL}/${comment.post}/comments/`, requestBody, { headers: this.headers })
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

  // Método para eliminar un comentario
  deleteComment(commentId: number): Observable<void> {

    return this._httpClient.delete<void>(`${this.deleteCommentsURL}/${commentId}/`, { headers: this.headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          if (error.error.detail) {
            this.errorMessage = `${error.error.detail}`;
          }
          return throwError(() => new Error(this.errorMessage));
        }),
        tap(() => {
          this.notyf.success({
            message: 'Has eliminado un comentario',
            duration: 4000,
            dismissible: false,
            background: '#5fbcf6'
          });
        }),
      );
  }
}
