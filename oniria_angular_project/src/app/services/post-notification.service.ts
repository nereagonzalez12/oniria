import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostNotificationService {
  private postCreatedSource = new Subject<void>(); // Subject para notificar la creación de un nuevo post

  // Observable que otros componentes pueden suscribirse para recibir notificaciones de creación de post
  postCreated$ = this.postCreatedSource.asObservable();

  constructor() { }

  // Método para notificar la creación de un nuevo post
  notifyPostCreated() {
    this.postCreatedSource.next(); // Emitir un evento cuando se crea un nuevo post
  }
}
