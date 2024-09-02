import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.css']
})
export class LogoutButtonComponent {
  private authService = inject(AuthenticationService);

  constructor(private router: Router) { };

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        sessionStorage.setItem('loggedOut', 'true');
        const loggedOut = sessionStorage.getItem('loggedOut');
        // Si se ha cerrado sesión, recargar la página una vez y eliminar la bandera
        if (loggedOut === 'true') {
          sessionStorage.removeItem('loggedOut');
          window.location.reload();
        }
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }
}
