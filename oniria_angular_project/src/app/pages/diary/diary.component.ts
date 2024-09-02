import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ICategory } from 'src/app/models/category.models';
import { IPeopleInvolved } from 'src/app/models/people-involved.models';
import { IUser } from 'src/app/models/user.model';
import { ApiCategoriesService } from 'src/app/services/api-categories.service';
import { ApiPeopleInvolvedService } from 'src/app/services/api-people-involved.service';
import { ApiPostService } from 'src/app/services/api-post.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CategoryNotificationService } from 'src/app/services/category-notification.service';
import { PeopleNotificationService } from 'src/app/services/people-notification.service';
import { PostNotificationService } from 'src/app/services/post-notification.service';
import { DreamListComponent } from './dream-list/dream-list.component';

@Component({
  selector: 'app-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css']
})
export class DiaryComponent implements OnInit, OnChanges {
  categoryList: ICategory[] = [];
  selectedCategoryIds: number[] = [];
  selectedPeopleIds: number[] = [];
  peopleList: IPeopleInvolved[] = [];
  // Caché para almacenar nombres de usuario recuperados
  userPromises: { [userId: number]: Promise<string | undefined>; } = {};
  linkedUserNames: { [userId: number]: string; } = {};
  searchQuery: string = '';
  showCreatePost: boolean = false;
  showCreateCategory: boolean = false;
  showCreatePeople: boolean = false;
  @Input() showDeleteCategoryAlert: boolean = false;
  @Input() showDeletePeopleAlert: boolean = false;
  @Input() itemToDelete: ICategory | undefined; // Esta propiedad representa el elemento que se eliminará
  @Input() deleteItem: Function = () => { }; // Esta propiedad es la función que se llamará para eliminar el elemento
  @ViewChild(DreamListComponent) childComponent?: DreamListComponent;
  searchForm: FormGroup;
  categoryToDelete?: ICategory;
  peopleToDelete?: IPeopleInvolved;
  noPeople = false;
  /* USER INFO */
  loggedInUsername?: string;
  loggedInId?: number;
  profile_image_url?: string;
  first_name?: string;
  last_name?: string;
  birthday?: Date;
  bio?: string;
  date_joined?: Date;
  private postNotificationService = inject(PostNotificationService);
  private postService = inject(ApiPostService);
  private authenticationService = inject(AuthenticationService);
  private categoryNotificationService = inject(CategoryNotificationService);
  private peopleNotificationService = inject(PeopleNotificationService);
  private categoryService = inject(ApiCategoriesService);
  private peopleService = inject(ApiPeopleInvolvedService);

  constructor(private router: Router, private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      parameter: [''] // Inicializa el campo 'parameter' con un valor vacío
    });
  }


  ngOnInit(): void {

    this.getLoggedInUsername();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => {
        sessionStorage.removeItem('showCreatePost');
      });

    // Recuperar el valor del showPersonalDataForm cuando se carga la página
    const showPostFormString = sessionStorage.getItem('showCreatePost');
    if (showPostFormString) {
      this.showCreatePost = showPostFormString === 'true';
    }

    this.obtainCategoryData();
    this.obtainPeopleData();

    // Cuando notifica de post creado el formulario se esconde
    this.postNotificationService.postCreated$.subscribe(() => {
      this.showCreatePost = false;
      sessionStorage.removeItem('showCreatePost');
    });

    this.categoryNotificationService.categoryCreated$.subscribe(() => {
      this.showCreateCategory = false;
      this.obtainCategoryData();
    });

    this.peopleNotificationService.peopleCreated$.subscribe(() => {
      this.showCreatePeople = false;
      this.obtainPeopleData();
    });


  };

  ngOnChanges(changes: SimpleChanges) {
    if ('selectedCategoryIds' in changes) {
      this.filterPostsByCategories();
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

  getLoggedInUsername(): void {
    this.authenticationService.getUserInfo().subscribe({
      next: (user) => {
        this.loggedInId = user.id;
        this.loggedInUsername = user.username;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.birthday = this.parseDate(user.birthday);
        this.date_joined = this.parseDate(user.date_joined);
        this.bio = user.bio;
      },
      error: (error) => {
        console.error('Error obteniendo nombre de usuario:', error);
      }
    });
  }


  createPost() {
    this.showCreatePost = true;
    sessionStorage.setItem('showCreatePost', 'true');
    this.restartScrollList();
  }
  createCategory() {
    if (!this.showCreatePeople) {
      this.showCreateCategory = true;
    }
  }
  createPeople() {
    if (!this.showCreateCategory) {
      this.noPeople = false;
      this.showCreatePeople = true;
    }
  }


  obtainCategoryData() {
    this.categoryService.getAllCategories().subscribe((data: ICategory[]) => {
      this.categoryList = data.map(category => ({ ...category, selected: false }));
    });

  }

  obtainPeopleData() {
    this.peopleService.getAllPeople().subscribe((dataP: IPeopleInvolved[]) => {
      this.peopleList = dataP;
      if (this.peopleList.length === 0) {
        this.noPeople = true;
      }
    });
  }

  getLinkedUserName(linkedUserId: number): string | undefined {
    if (this.linkedUserNames[linkedUserId]) {
      // Si el nombre de usuario está en la caché, devolverlo directamente
      return this.linkedUserNames[linkedUserId];
    } else {
      // Verificar si ya hay una promesa en curso para este usuario
      if (!this.userPromises[linkedUserId]) {
        // Si no hay una promesa en curso, crear una nueva promesa para obtener el nombre de usuario
        this.userPromises[linkedUserId] = new Promise<string | undefined>((resolve, reject) => {
          // Realizar la llamada para obtener el nombre de usuario
          this.authenticationService.getUserById(linkedUserId).subscribe({
            next: (data: IUser) => {
              // Almacenar el nombre de usuario en la caché
              this.linkedUserNames[linkedUserId] = data.username;
              // Resolver la promesa con el nombre de usuario obtenido
              resolve(data.username);
            },
            error: (error) => {
              console.error('Error al obtener el nombre de usuario:', error);
              // Resolver la promesa con undefined en caso de error
              resolve(undefined);
            }
          });
        });
      }
      // Devolver la promesa en curso para este usuario
      return undefined;
    }
  }



  postReceiveShow(show: boolean) {
    if (show) {
      this.showCreatePost = true;
    }
  }


  // Recibir información sobre descarte de creacion de post
  postReceiveDiscard(discard: boolean) {
    if (discard) {
      sessionStorage.removeItem('showCreatePost');
      this.showCreatePost = false;
    }
  }

  categoryReceiveDiscard(discard: boolean) {
    if (discard) {
      this.showCreateCategory = false;
    }
  }

  peopleReceiveDiscard(discard: boolean) {
    if (discard) {
      this.showCreatePeople = false;
    }
  }

  // Eliminar categoría
  confirmDelete(event: MouseEvent, cat: ICategory) {
    event.stopPropagation();
    this.showDeleteCategoryAlert = true;
    this.categoryToDelete = cat;
  }
  confirmDeletePeople(event: MouseEvent, person: IPeopleInvolved) {
    event.stopPropagation();
    this.showDeletePeopleAlert = true;
    this.peopleToDelete = person;
  }

  dismissDeleteCategory() {
    this.showDeleteCategoryAlert = false;
  }

  dismissDeletePeople() {
    this.showDeletePeopleAlert = false;
  }

  deleteCategoryConfirmed(cat: ICategory) {
    if (cat) {
      this.categoryService.deleteCategory(cat.id).subscribe(() => {
        this.obtainCategoryData();
        this.showDeleteCategoryAlert = false;
      });
    } else {
      console.log('No se ha encontrado la etiqueta a borrar');
    }
  }
  deletePeopleConfirmed(person: IPeopleInvolved) {
    if (person) {
      this.peopleService.deletePeople(person.id).subscribe(() => {
        this.obtainPeopleData();
        this.showDeletePeopleAlert = false;
      });
    } else {
      console.log('No se ha encontrado el intruso a borrar');
    }
  }

  restartScrollList() {
    if (this.childComponent) {
      this.childComponent.restartScroll();
    }
  }

  /* FILTROS DE BÚSQUEDA */
  searchPostsInput() {
    // Llamar al servicio para realizar la búsqueda
    this.postService.searchPosts(this.searchForm.get('parameter')?.value).subscribe({
      next: (data: any) => {
        if (this.childComponent) {
          this.childComponent.reloadDataWithSearchTerm(this.searchForm.get('parameter')?.value);
        } else {
          console.error('Error al encontrar el componente dream-list');
        }
      },
      error: (error) => {
        console.error('Error al buscar posts:', error.message);
      }
    });
  }

  filterPostsByCategories() {
    if (this.selectedCategoryIds.length > 0) {
      // Llamar al servicio de post con los identificadores de categoría seleccionados
      this.postService.getPostsByCategories(this.selectedCategoryIds).subscribe({
        next: (data: any) => {
          if (this.childComponent) {
            this.childComponent.reloadDataWithFilteredPosts(data);
          } else {
            console.error('Error al encontrar el componente dream-list');
          }
        },
        error: (error) => {
          console.error('Error al filtrar posts por categoría:', error);
        }
      });
    } else {
      console.log('No se han seleccionado categorías para filtrar.');
      this.childComponent?.obtainData();
    }
  }

  toggleCategorySelection(category: ICategory) {
    category.selected = !category.selected; // Cambia el estado de selección de la categoría

    const index = this.selectedCategoryIds.indexOf(category.id);
    if (category.selected && index === -1) {
      // Agregar el identificador de la categoría seleccionada al arreglo
      this.selectedCategoryIds.push(category.id);
    } else if (!category.selected && index !== -1) {
      // Quitar el identificador de la categoría seleccionada del arreglo
      this.selectedCategoryIds.splice(index, 1);
    }

    // Llamar al método de filtrado después de cambiar las categorías seleccionadas
    this.filterPostsByCategories();
  }

  filterPostsByPeople() {
    if (this.selectedPeopleIds.length > 0) {
      // Llamar al servicio de post con los identificadores de categoría seleccionados
      this.postService.getPostsByPeopleInvolved(this.selectedPeopleIds).subscribe({
        next: (data: any) => {
          if (this.childComponent) {
            this.childComponent.reloadDataWithFilteredPosts(data);
          } else {
            console.error('Error al encontrar el componente dream-list');
          }
        },
        error: (error) => {
          console.error('Error al filtrar posts por intrusos:', error);
        }
      });
    } else {
      this.childComponent?.obtainData();
      console.log('No se han seleccionado intrusos para filtrar.');
    }
  }

  togglePeopleSelection(people: IPeopleInvolved) {
    people.selected = !people.selected; // Cambia el estado de selección de la categoría

    const index = this.selectedPeopleIds.indexOf(people.id);
    if (people.selected && index === -1) {
      // Agregar el identificador de la categoría seleccionada al arreglo
      this.selectedPeopleIds.push(people.id);
    } else if (!people.selected && index !== -1) {
      // Quitar el identificador de la categoría seleccionada del arreglo
      this.selectedPeopleIds.splice(index, 1);
    }

    // Llamar al método de filtrado después de cambiar las categorías seleccionadas
    this.filterPostsByPeople();
  }

}

