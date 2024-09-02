import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IUser } from 'src/app/models/user.model';
import { ApiPublicPostService } from 'src/app/services/api-public-post.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { PublicPostListComponent } from './public-post-list/public-post-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  activeButton: string = 'public';
  isLikedPostsButtonActive: boolean = false;

  searchForm: FormGroup;
  selectedUser?: IUser;
  @ViewChild(PublicPostListComponent) childComponent?: PublicPostListComponent;

  private authService = inject(AuthenticationService);
  private apiPublicPostService = inject(ApiPublicPostService);

  constructor(private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      parameter: [''] // Inicializa el campo 'parameter' con un valor vacío
    });
  }


  ngOnInit(): void {
    const storedActiveButton = sessionStorage.getItem('activeButton');
    if (storedActiveButton) {
      this.activeButton = JSON.parse(storedActiveButton);
    }
  }

  setActiveButton(button: string): void {
    this.activeButton = button;
    sessionStorage.setItem('activeButton', JSON.stringify(this.activeButton));
  }

  /* enviar usuario seleccionado desde el componente lista hacia el componente perfil*/
  sendSelectedUser(user: IUser) {
    this.selectedUser = user; // Asigna el usuario seleccionado
  }

  /* FILTROS DE BÚSQUEDA */
  searchPostsInput() {
    // Llamar al servicio para realizar la búsqueda 
    const storedActiveButton = sessionStorage.getItem('activeButton');
    if (storedActiveButton) {
      this.activeButton = JSON.parse(storedActiveButton);
    }

    if (this.activeButton === 'public') {
      this.apiPublicPostService.searchPublicPosts(this.searchForm.get('parameter')?.value).subscribe({
        next: (data: any) => {
          if (this.childComponent) {
            this.childComponent.reloadDataWithSearchTerm(this.searchForm.get('parameter')?.value, 'public');
          } else {
            console.error('Error al encontrar el componente dream-list');
          }
        },
        error: (error) => {
          console.error('Error al buscar posts:', error.message);
        }
      });
    } else if (this.activeButton === 'friends') {
      this.apiPublicPostService.searchFriendsPosts(this.searchForm.get('parameter')?.value).subscribe({
        next: (data: any) => {
          if (this.childComponent) {
            this.childComponent.reloadDataWithSearchTerm(this.searchForm.get('parameter')?.value, 'friends');
          } else {
            console.error('Error al encontrar el componente dream-list');
          }
        },
        error: (error) => {
          console.error('Error al buscar posts:', error.message);
        }
      });
    }
  }

  // filtro para los post con likes
  likedPosts() {
    // Llamar al servicio para realizar la búsqueda 

    const storedActiveButton = sessionStorage.getItem('activeButton');
    if (storedActiveButton) {
      this.activeButton = JSON.parse(storedActiveButton);
    }

    if (this.activeButton === 'public') {
      this.apiPublicPostService.likedPublicPosts().subscribe({
        next: (data: any) => {
          if (this.childComponent) {
            this.childComponent.reloadDataWithLikedPost('public');
          } else {
            console.error('Error al encontrar el componente dream-list');
          }
        },
        error: (error) => {
          console.error('Error al buscar posts:', error.message);
        }
      });
    } else if (this.activeButton === 'friends') {
      this.apiPublicPostService.likedFriendsPosts().subscribe({
        next: (data: any) => {
          if (this.childComponent) {
            this.childComponent.reloadDataWithLikedPost('friends');
          } else {
            console.error('Error al encontrar el componente dream-list');
          }
        },
        error: (error) => {
          console.error('Error al buscar posts:', error.message);
        }
      });
    }

  }




}
