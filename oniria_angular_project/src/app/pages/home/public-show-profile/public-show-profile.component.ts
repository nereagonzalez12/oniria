import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { IUser } from 'src/app/models/user.model';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FollowersService } from 'src/app/services/followers.service';
import { API_URL, API_URL_2 } from 'src/app/services/globals';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-public-show-profile',
  templateUrl: './public-show-profile.component.html',
  styleUrls: ['./public-show-profile.component.css']
})
export class PublicShowProfileComponent implements OnChanges, OnInit {
  @Input() selectedUser?: IUser;
  showUserProfile: boolean = false;
  loadRequestUsers: boolean = true;
  loadProfile: boolean = true;
  loggedInId?: number;
  sendRequestButtonActive: boolean = false;
  isFriend: boolean = false;
  friendId?: number;
  isRequestPending: boolean = false;
  requestPendingUsers: Map<number, IUser> = new Map();
  userName: string = '';
  birthday?: Date;
  date_joined?: Date;
  profile_image_url?: string;
  date_formatted?: string;
  followers: IUser[] = [];
  following: IUser[] = [];
  /* paginación solicitudes */
  currentPage: number = 1;
  itemsPerPage: number = 4; // Número de solicitudes por página

  private months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  private followersService = inject(FollowersService);
  private authenticationService = inject(AuthenticationService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getLoggedInId();
    this.getPendingRequests();
  }
  ngOnChanges(changes: SimpleChanges) {
    if ('selectedUser' in changes && this.selectedUser != undefined && this.selectedUser.id != undefined) {
      this.showUserProfile = true;
      this.userName = this.selectedUser.first_name + ' ' + this.selectedUser.last_name;
      this.birthday = this.parseDate(this.selectedUser.birthday);
      this.date_joined = this.parseDate(this.selectedUser.date_joined);
      this.transform(this.date_joined);
      this.loadProfileImageUrl(this.selectedUser.id);
      this.loadFollowers(this.selectedUser.id);
      this.checkFriendshipStatus();
      this.checkSentFriendRequests();
    }

    if ('isFriend' in changes || 'isRequestPending' in changes) {
      console.log('desde el change: ', this.isRequestPending);
    }
  }

  getLoggedInId(): void {
    this.authenticationService.getUserInfo().subscribe({
      next: (user) => {
        this.loggedInId = user.id;
      },
      error: (error) => {
        console.error('Error obteniendo nombre de usuario:', error);
      }
    });
  }

  transform(date: Date | undefined): void {
    if (date != undefined) {
      const day = date.getDate();
      const month = this.months[date.getMonth()];
      const year = date.getFullYear();
      this.date_formatted = `Se unió el ${day} de ${month} de ${year}`;
    }
  }

  parseDate(date: string | Date): Date | undefined {
    if (date === null) {
      return;
    }

    if (date instanceof Date) {
      return date;
    }
    const [day, month, year] = date.split('/').map(part => parseInt(part, 10));
    const formattedYear = year + (year < 100 ? 2000 : 0); // Ajustar el año correctamente
    const parsedDate = new Date(formattedYear, month - 1, day);
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  loadProfileImageUrl(userId: number): void {
    this.userService.getProfileImage(userId).subscribe({
      next: (data) => {
        this.profile_image_url = API_URL + data.profile_image_url;

      },
      error: (error) => {
        console.error('Error al cargar la URL de la imagen de perfil:', error);
      }
    });
  }

  loadFollowers(userId: number): void {
    if (userId) {
      this.followersService.getFollowers(userId).subscribe(data => {
        this.followers = data;
      });

      this.followersService.getFollowing(userId).subscribe(data => {
        this.following = data;
      });
    }
  }

  clearProfile() {
    this.selectedUser = undefined;
    this.showUserProfile = false;
    this.profile_image_url = undefined;
  }

  /* SOLICITUDES DE AMISTAD */

  // comprueba el estado de amistad con el usuario seleccionado
  checkFriendshipStatus(): void {
    if (this.loggedInId) {
      this.followersService.getFollowers(this.loggedInId).subscribe({
        next: (followers) => {
          this.isFriend = followers.some(follower => follower.id === this.selectedUser?.id);
          // this.loadProfile = false;

        },
        error: (error) => {
          console.error('Error checking friendship status:', error);
        }
      });
    }
  }

  // comprueba las solicitudes de amistad recibidas
  checkPendingRequests(): void {
    this.followersService.getFriendRequests().subscribe({
      next: (requests) => {
        this.isRequestPending = requests.some((request: any) => request.from_user === this.selectedUser?.id);
        // this.loadProfile = false;

      },
      error: (error) => {
        console.error('Error checking pending friend requests:', error);
      }
    });
  }

  // almacena las solicitudes de amistad recibidas
  getPendingRequests(): void {
    this.followersService.getFriendRequests().subscribe({
      next: (requests) => {
        const userRequests = requests.map(request =>
          this.authenticationService.getUserById(request.from_user).pipe(
            map(user => ({ requestId: request.id, user: user }))
          )
        );
        forkJoin(userRequests).subscribe({
          next: (usersWithRequests) => {
            usersWithRequests.forEach(({ requestId, user }) => {
              if (user.profile_image != null) {
                user.profile_image = API_URL_2 + user.profile_image;
              }
              this.requestPendingUsers.set(requestId, user);
            });
            this.loadRequestUsers = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading user details for friend requests:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error checking pending friend requests:', error);
      }
    });
  }


  // envia una solicitud de amistad
  sendFriendRequest(userId: number): void {
    this.followersService.sendFriendRequest(userId).subscribe({
      next: (response) => {
        this.isRequestPending = true;
        this.sendRequestButtonActive = false;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // comprueba las solicitudes de amistad enviadas
  checkSentFriendRequests(): void {
    if (this.selectedUser) {
      this.followersService.hasSentFriendRequest(this.selectedUser.id).subscribe({
        next: (data) => {
          this.isRequestPending = data.has_sent_request;
          this.loadProfile = false;

        },
        error: (error) => {
          console.error('Error checking sent friend requests:', error);
        }
      });
    }
  }

  /* ACEPTAR Y DENEGAR SOLICITUDES */
  // aceptar una solicitud de amistad
  acceptFriendRequest(requestId: number): void {
    this.followersService.acceptFriendRequest(requestId).subscribe(response => {
      // console.log('Friend request accepted:', response);
      this.friendId = response.from_user;
      this.isRequestPending = false;
      this.cdr.detectChanges(); // Forzar la detección de cambios
    });
  }

  // rechazar una solicitud de amistad
  rejectFriendRequest(requestId: number): void {
    this.followersService.rejectFriendRequest(requestId).subscribe(response => {
      // console.log('Friend request rejected:', response);
      this.getPendingRequests(); // Recargar la lista de solicitudes pendientes
      this.cdr.detectChanges(); // Forzar la detección de cambios
    });
  }

  /* cambio de color a las iteraciones pares e impares de los request */
  isEven(index: number): boolean {
    return index % 2 === 0;
  }

  // eliminar amigo
  removeFriend(userId: number) {
    this.followersService.removeFriend(userId).subscribe({
      next: (response) => {
        if (response.status === 'Amistad eliminada') {
          this.sendRequestButtonActive = true;
        } else {
          console.error('Error al eliminar la amistad', response);
        }
      },
      error: (error) => {
        console.error('Error al eliminar la amistad', error);
      },
    });
  }

  /* OBTENER PERFIL Y MOSTRAR USUARIO */
  obtainUserProfile(userId: number) {
    this.authenticationService.getUserById(userId).subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.userName = this.selectedUser.first_name + ' ' + this.selectedUser.last_name;
        this.birthday = this.parseDate(this.selectedUser.birthday);
        this.date_joined = this.parseDate(this.selectedUser.date_joined);
        this.transform(this.date_joined);
        this.loadProfileImageUrl(this.selectedUser.id);
        this.loadFollowers(this.selectedUser.id);
        this.checkFriendshipStatus();
        this.checkSentFriendRequests();

      },
      error: (error) => {
        console.error('Error loading user details:', error);
      }
    });
  }

  /* PAGINACIÓN DE SOLICITUDES  */
  // Método para obtener las solicitudes paginadas
  get paginatedRequests() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return Array.from(this.requestPendingUsers.entries()).slice(startIndex, endIndex);
  }

  // Método para cambiar la página
  changePage(page: number) {
    this.currentPage = page;
  }

  // Método para obtener el número total de páginas
  get totalPages() {
    return Math.ceil(this.requestPendingUsers.size / this.itemsPerPage);
  }
}



