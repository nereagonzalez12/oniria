import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Notyf } from 'notyf';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { NOTYF } from '../components/ui/notyf.token';
import { IRequest } from '../models/request.model';
import { IUser } from '../models/user.model';
import { API_URL } from './globals';

@Injectable({
  providedIn: 'root'
})
export class FollowersService {
  private followsURL = API_URL + 'api/users';
  private errorMessage = 'Ha ocurrido un error';
  private headers: HttpHeaders;


  constructor(private _httpClient: HttpClient, private cookieService: CookieService, @Inject(NOTYF) private notyf: Notyf) {
    const token = this.cookieService.get('loginToken');
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
  }


  /* GET FOLLOWERS */
  getFollowers(userId: number): Observable<IUser[]> {
    return this._httpClient.get<IUser[]>(`${this.followsURL}/${userId}/followers/`, { headers: this.headers });
  }

  /* GET FOLLOWING */
  getFollowing(userId: number): Observable<IUser[]> {
    return this._httpClient.get<IUser[]>(`${this.followsURL}/${userId}/following/`, { headers: this.headers });
  }

  /* POST */
  sendFriendRequest(userId: number): Observable<IRequest> {
    return this._httpClient.post<IRequest>(`${this.followsURL}/send_friend_request/${userId}/`, {}, { headers: this.headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          if (error.error.detail) {
            this.errorMessage = `${error.error.detail}`;
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
      );
  }

  /* GET */
  getFriendRequests(): Observable<IRequest[]> {
    return this._httpClient.get<IRequest[]>(`${this.followsURL}/friend_requests/`, { headers: this.headers })
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error());
        })
      );
  };

  getSentFriendRequests(): Observable<IRequest[]> {
    return this._httpClient.get<IRequest[]>(`${this.followsURL}/sent_friend_requests/`, { headers: this.headers })
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error());
        })
      );
  };

  acceptFriendRequest(requestId: number): Observable<IRequest> {
    return this._httpClient.post<IRequest>(`${this.followsURL}/accept_friend_request/${requestId}/`, {}, { headers: this.headers })
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error());
        }),

        tap(() => {
          this.notyf.success({
            message: 'Has hecho un nuevo amigo!',
            duration: 4000,
            dismissible: false,
            background: '#5fbcf6'
          });
        }),
      );
  };

  rejectFriendRequest(requestId: number): Observable<IRequest> {
    return this._httpClient.post<IRequest>(`${this.followsURL}/reject_friend_request/${requestId}/`, {}, { headers: this.headers })
      .pipe(
        catchError((error: any) => {
          console.log(error);
          return throwError(() => new Error());
        }),

        tap(() => {
          this.notyf.success({
            message: 'Solicitud denegada. El usuario no será informado',
            duration: 4000,
            dismissible: false,
            background: '#eeb35a'
          });
        }),
      );
  };

  hasSentFriendRequest(userId: number): Observable<{ has_sent_request: boolean; }> {
    const url = `${this.followsURL}/has_sent_friend_request/${userId}/`;
    return this._httpClient.get<{ has_sent_request: boolean; }>(url, { headers: this.headers });
  }

  removeFriend(userId: number): Observable<{ status: string; }> {
    return this._httpClient.post<{ status: string; }>(`${this.followsURL}/remove_friend/${userId}/`, {}, { headers: this.headers }).pipe(
      catchError((error: any) => {
        console.log(error);
        return throwError(() => new Error());
      }),

      tap(() => {
        this.notyf.success({
          message: 'Ya no eres amigo de este usuario',
          duration: 4000,
          dismissible: false,
          background: '#eeb35a'
        });
      }),
    );
  }

}
