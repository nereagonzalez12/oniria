import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Notyf } from 'notyf';
import { Observable, catchError, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { IPost } from '../models/post.model';
import { AuthenticationService } from './authentication.service';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class ApiPublicPostService {
  private publicPostURL = API_URL + 'api/posts/public_posts';
  private friendsPostURL = API_URL + 'api/posts/friends_posts';
  private likedPublicPostURL = API_URL + 'api/posts/liked_public_posts';
  private likedFriendsPostURL = API_URL + 'api/posts/liked_friends_posts';
  private errorMessage = 'Ha ocurrido un error';
  private authService = inject(AuthenticationService);
  constructor(private _httpClient: HttpClient, @Inject(NOTYF) private notyf: Notyf) { }

  token = this.authService.getToken();
  /* GET */
  public getAllPosts(): Observable<IPost[]> {
    // Realiza la solicitud HTTP con el encabezado de autorización
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.publicPostURL}/`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejo de errores
        return throwError(() => new Error());
      })
    );
  }

  /* GET */
  public getFriendsPosts(): Observable<IPost[]> {
    // Realiza la solicitud HTTP con el encabezado de autorización
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.friendsPostURL}/`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejo de errores
        return throwError(() => new Error());
      })
    );
  }

  /* BÚSQUEDAS CON FILTROS */

  // filtro por parámetros
  searchPublicPosts(query: string) {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.publicPostURL}/?search=${query}`, { headers }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }

  searchFriendsPosts(query: string) {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.friendsPostURL}/?search=${query}`, { headers }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }

  likedPublicPosts(): Observable<IPost[]> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.likedPublicPostURL}/`, { headers }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }

  likedFriendsPosts(): Observable<IPost[]> {
    const headers = new HttpHeaders().set('Authorization', `Token ${this.token}`);
    return this._httpClient.get<IPost[]>(`${this.likedFriendsPostURL}/`, { headers }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      })
    );
  }
}
