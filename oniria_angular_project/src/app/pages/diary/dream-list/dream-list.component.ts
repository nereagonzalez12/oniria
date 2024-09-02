import { Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ICategory } from 'src/app/models/category.models';
import { IPeopleInvolved } from 'src/app/models/people-involved.models';
import { IPost } from 'src/app/models/post.model';
import { ApiPostService } from 'src/app/services/api-post.service';
import { PostNotificationService } from 'src/app/services/post-notification.service';

@Component({
  selector: 'app-dream-list',
  templateUrl: './dream-list.component.html',
  styleUrls: ['./dream-list.component.css']
})
export class DreamListComponent implements OnInit, OnChanges {
  //Edición de Post
  submitted = false;
  // Post vacío para limpiar el selectedPost, ya que no puede ser nulo
  emptyPost: IPost = {
    id: 0,
    user: 0,
    category: [],
    categories: [],
    people_involved: [],
    title: '',
    content: '',
    post_date: new Date(),
    dream_date: new Date(),
    public_date: new Date(),
    privacy: ''
  };
  selectedEditPost: IPost = this.emptyPost;
  showEditPostForm: boolean = false;
  editingPost: boolean = false;
  shakeTimeout: any;
  isShaking: { [categoryId: number]: boolean; } = {};
  selectedCategories: number[] = []; // Array para almacenar las categorías seleccionadas
  // Variable para almacenar temporalmente las categorías eliminadas
  deletedCategories: number[] = [];
  contentInfoPriv: string = '';
  showInfo = false;
  // --------------
  postList: IPost[] = [];
  @Input() searchTerm: string = '';
  @Input() categoryList: ICategory[] = [];
  @Input() peopleList: IPeopleInvolved[] = [];
  @Input() showDeleteAlert: boolean = false;
  @Input() itemToDelete: IPost | undefined; // Esta propiedad representa el elemento que se eliminará
  @Input() deleteItem: Function = () => { }; // Esta propiedad es la función que se llamará para eliminar el elemento
  @Input() showCreatePost: boolean = false;
  selectedCategory: ICategory | null = null; // Categoría seleccionada en el dropdown
  categoriesDropdownVisible = false;
  noPostFound = false;
  peopleDropdownVisible = false;
  privacyDropdownVisible = false;
  popupLeft: number = 0; // Posición izquierda del popup
  popupTop: number = 0; // Posición superior del popup
  selectedPost: IPost = this.emptyPost;
  loading: boolean = true;
  popupHeight = 230; // Altura del popup
  screenHeight = window.innerHeight;
  postToDelete?: IPost;
  editPostForm: FormGroup = new FormGroup({}); // Crear un formulario para la edición de posts
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  selectedPostForPrivacy: IPost = this.emptyPost;
  private postService = inject(ApiPostService);
  private postNotificationService = inject(PostNotificationService);

  constructor(private formBuilder: FormBuilder, private _route: ActivatedRoute, private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit(): void {
    this.obtainData();
    // Suscribirse a las notificaciones de creación de post
    this.postNotificationService.postCreated$.subscribe(() => {
      this.obtainData(); // Recargar la lista de posts cuando se cree un nuevo post
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Verificar si el valor de showCreatePost cambió

    if (changes['showCreatePost'] && changes['showCreatePost'].currentValue === true) {
      this.closePopups();
    }
  }

  private handleEditingPostChange() {
    this.closePopupsEditing();
  }

  closePopups() {
    // cerrar todos los pop ups abiertos cuando empiece la creación de un nuevo post
    this.showEditPostForm = false;
    this.showDeleteAlert = false;
    this.loading = false;
    this.showInfo = false;
    this.peopleDropdownVisible = false;
    this.privacyDropdownVisible = false;
    this.categoriesDropdownVisible = false;
    const popup = document.querySelector('#popup-info') as HTMLElement;
    popup.style.display = 'none';

  }

  closePopupsEditing() {
    // cerrar todos los pop ups abiertos cuando empiece la creación de un nuevo post
    this.showDeleteAlert = false;
    this.loading = false;
    this.showInfo = false;
    this.peopleDropdownVisible = false;
    this.privacyDropdownVisible = false;
    this.categoriesDropdownVisible = false;
    const popup = document.querySelector('#popup-info') as HTMLElement;
    popup.style.display = 'none';
  }
  //Eliminar post 
  confirmDelete(post: IPost) {
    this.showDeleteAlert = true;
    this.postToDelete = post;
  }

  dismissDelete() {
    this.showDeleteAlert = false;
  }

  deleteConfirmed(post: IPost) {
    if (post) {
      this.postService.deletePost(post.id).subscribe(() => {
        this.obtainData(); // Actualizar la lista de posts después de eliminar
        this.showDeleteAlert = false; // Ocultar la alerta de eliminación
      });
    } else {
      console.log('No se ha encontrado el post que borrar');
    }
  }


  // Método para activar el modo de edición de un post
  editPost(post: IPost) {
    if (!this.showCreatePost) {
      this.handleEditingPostChange();
      this.selectedEditPost = post; // Establecer el post seleccionado
      this.editPostForm = this.formBuilder.group({ // Crear un nuevo FormGroup con los datos del post
        title: [post.title, Validators.required],
        content: [post.content, Validators.required],
        dream_date: [post.dream_date, Validators.required],
        category: [post.category],
        people_involved: [post.people_involved],
        privacy: [post.privacy]
      });
    }
  }


  obtainData() {
    // forzar tiempo de carga
    // setTimeout(() => {
    this.postService.getAllPosts().subscribe({
      next: (data: IPost[]) => {
        this.postList = data;

        this.loading = false;
      },
      error: (error: any) => {
        console.log(error);
        this.loading = false;
      }
    });
    // }, 10000);

  }
  // Obtener la categoría asociada al post
  getCategoryName(categoryId: number): string | null {
    const category = this.categoryList.find(c => c.id === categoryId);
    return category ? category.name : null;
  }


  toggleCategoriesDropdown(post: IPost, event: MouseEvent) {
    if (!this.showCreatePost) {

      this.peopleDropdownVisible = false;
      this.showInfo = false;
      const info = document.querySelector('#popup-info') as HTMLElement;
      if (info) {
        // Mostrar el popup
        info.style.display = 'none';
      }
      this.categoriesDropdownVisible = !this.categoriesDropdownVisible;
      this.renderer.addClass(document.body, 'no-scroll');
      this.selectedPost = post;

      // Obtener las coordenadas del clic
      const clickX = event.clientX;
      const clickY = event.clientY;

      // Calcular la posición del popup en relación con las coordenadas del clic
      this.popupLeft = clickX;
      this.popupTop = clickY;
      // Obtener el elemento del popup
      const popup = document.querySelector('.visibility-popup-categories') as HTMLElement;

      // Altura disponible para mostrar el popup debajo del cursor
      const spaceBelowCursor = this.screenHeight - event.clientY;

      // Comprobar si hay suficiente espacio para mostrar el popup debajo del cursor
      if (spaceBelowCursor < this.popupHeight) {
        // Si no hay suficiente espacio, mostrar el popup encima del cursor
        this.popupTop = event.clientY - this.popupHeight;
      }

      // Establecer las variables CSS personalizadas con las coordenadas en el elemento del popup
      popup?.style.setProperty("--click-pos-x", `${this.popupLeft}px`);
      popup?.style.setProperty("--click-pos-y", `${this.popupTop}px`);

    }
  }

  togglePeopleDropdown(post: IPost, event: MouseEvent) {
    if (!this.showCreatePost) {

      this.categoriesDropdownVisible = false;
      this.showInfo = false;
      const info = document.querySelector('#popup-info') as HTMLElement;
      if (info) {
        // Mostrar el popup
        info.style.display = 'none';
      }
      this.peopleDropdownVisible = !this.peopleDropdownVisible;
      this.renderer.addClass(document.body, 'no-scroll');
      this.selectedPost = post;
      // Obtener las coordenadas del clic
      const clickX = event.clientX;
      const clickY = event.clientY;

      // Calcular la posición del popup en relación con las coordenadas del clic
      this.popupLeft = clickX;
      this.popupTop = clickY;
      // Obtener el elemento del popup
      const popup = document.querySelector('.visibility-popup-people') as HTMLElement;

      // Altura disponible para mostrar el popup debajo del cursor
      const spaceBelowCursor = this.screenHeight - event.clientY;

      // Comprobar si hay suficiente espacio para mostrar el popup debajo del cursor
      if (spaceBelowCursor < this.popupHeight) {
        // Si no hay suficiente espacio, mostrar el popup encima del cursor
        this.popupTop = event.clientY - this.popupHeight;
      }

      // Establecer las variables CSS personalizadas con las coordenadas en el elemento del popup
      popup?.style.setProperty("--click-pos-x", `${this.popupLeft}px`);
      popup?.style.setProperty("--click-pos-y", `${this.popupTop}px`);
    }

  }

  //Añadir categoria al post
  addCategoryToPost(category: ICategory, post: IPost) {
    this.isShaking[category.id] = false;
    this.postService.getPostById(post.id).subscribe({

      next: (post: IPost) => {
        const categories = [...post.category, category.id]; // Agregar la nueva categoría
        // Llamar a addCategoryToPost con las categorías actualizadas
        this.postService.addCategoryToPost(post.id, categories).subscribe({
          next: (updatedPost: IPost) => {
            // console.log('Categoría añadida al post:', updatedPost);
            // Realizar cualquier otra acción necesaria después de agregar la categoría
            this.categoriesDropdownVisible = !this.categoriesDropdownVisible;
          },
          error: (error) => {
            console.error('Error al añadir categoría al post:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener el post:', error);
      }
    });
  }


  //Añadir intrusos al post
  addPeopleToPost(person: IPeopleInvolved, post: IPost) {
    this.postService.getPostById(post.id).subscribe({

      next: (post: IPost) => {
        const people = [...post.people_involved, person.id];
        this.postService.addPeopleToPost(post.id, people).subscribe({
          next: (updatedPost: IPost) => {
            // console.log('Intruso añadido al post:', updatedPost);
            this.peopleDropdownVisible = !this.peopleDropdownVisible;
          },
          error: (error) => {
            console.error('Error al añadir intruso al post:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener el post:', error);
      }
    });
  }

  // Eliminar intruso
  removePeopleFromPost(people: IPeopleInvolved, post: IPost) {
    // Obtener el índice de la persona en el arreglo de personas involucradas en el sueño
    const index = post.people_involved.indexOf(people.id);

    // Verificar si se encontró la persona en el arreglo
    if (index !== -1) {
      // Eliminar la persona del arreglo de personas involucradas
      post.people_involved.splice(index, 1);

      // Llamar al servicio para actualizar el sueño con la nueva lista de personas involucradas
      this.postService.updatePost(post.id, post).subscribe({
        next: (response: any) => {
          // console.log('Persona eliminada del sueño:', people);
          this.obtainData();
        },
        error: (error: any) => {
          console.error('Error al eliminar la persona del sueño:', error);
        }
      });
    } else {
      console.log('La persona no se encontró en el sueño.');
    }
  }


  // EDICIÓN DE POST +++++++++++++++

  submitEditPost() {
    this.submitted = true;

    if (this.editPostForm.invalid || !this.selectedEditPost) {
      return;
    }

    const post: IPost = {
      ...this.editPostForm.value,
      id: this.selectedEditPost.id,
      user: this.selectedEditPost.user,
      people_involved: this.selectedEditPost.people_involved,
      post_date: this.selectedEditPost.post_date,

    };

    this.postService.updatePost(post.id, post).subscribe({
      next: (response: any) => {
        // Vaciar post seleccionado
        this.selectedEditPost = this.emptyPost;
        this.showEditPostForm = false;
        // Actualizar la lista de posts después de la edición
        this.obtainData();
      },
      error: (error: any) => {
        console.log('Error: ', error);
      }
    });
  }

  discardButton() {
    // Mostrar un alert para confirmar la acción
    const confirmDiscard = confirm("El sueño se descartará y los datos se perderán");
    if (confirmDiscard) {
      // Restaurar las categorías eliminadas al array de categorías seleccionadas del post en edición
      this.selectedEditPost.category.push(...this.deletedCategories);
      // Vaciar el post en edición
      this.selectedEditPost = this.emptyPost;
      // Ocultar el formulario de edición
      this.showEditPostForm = false;
      // Limpiar las categorías eliminadas
      this.deletedCategories = [];
    }
  }

  // Actualizar privacidad del post
  updatePrivacyOption(option: string) {
    this.editPostForm.patchValue({ privacy: option });
  }

  // separar párrafos de los post
  getPostParagraphs(content: string): string[] {
    return content.split('\n').filter(paragraph => paragraph.trim().length > 0);
  }


  // Eliminar categoría
  confirmDeleteCategory(cat: number) {
    if (!this.selectedEditPost || !this.selectedEditPost.category) {
      return; // Si no hay post seleccionado o el post no tiene categorías, salir del método
    }

    // Encuentra el índice de la categoría que deseas eliminar
    const index = this.selectedEditPost.category.indexOf(cat);

    // Verifica si el índice es válido (-1 significa que el elemento no se encontró)
    if (index !== -1) {
      // Guarda la categoría eliminada temporalmente
      this.deletedCategories.push(this.selectedEditPost.category[index]);
      // Elimina la categoría del array de categorías seleccionadas del post en edición
      this.selectedEditPost.category.splice(index, 1);
    }
  }
  //Animaciones categorias
  startShakeAnimation(index: number) {
    // Limpiar el temporizador anterior si existe
    clearTimeout(this.shakeTimeout);
    // Establecer un temporizador para iniciar la animación después de 500 milisegundos (medio segundo)
    this.shakeTimeout = setTimeout(() => {
      this.isShaking[index] = true;
    }, 200);
  }

  stopShakeAnimation(index: number) {
    // Limpiar el temporizador
    clearTimeout(this.shakeTimeout);
    // Detener la animación
    this.isShaking[index] = false;
  }

  hasErrors(contolName: string, errorType: string) {
    const control = this.editPostForm.get(contolName);
    return control && control.hasError(errorType) && control.touched || (this.submitted && control?.hasError(errorType));
  }

  restartScroll() {
    // Obtener el elemento contenedor
    const container = this.scrollContainer.nativeElement;
    // restart la posición de la barra de desplazamiento
    container.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  }


  //  INFO  +++++++++++++++
  showInfoPriv(priv: String, event: MouseEvent, post: IPost) {
    if (!this.showCreatePost) {
      this.categoriesDropdownVisible = false;
      this.peopleDropdownVisible = false;
      this.showInfo = !this.showInfo;
      this.renderer.addClass(document.body, 'no-scroll');
      this.selectedPost = post;
      // Obtener las coordenadas del clic
      const clickX = event.clientX;
      const clickY = event.clientY;

      // Calcular la posición del popup en relación con las coordenadas del clic
      this.popupLeft = clickX;
      this.popupTop = clickY;
      // Obtener el elemento del popup
      const popup = document.querySelector('#popup-info') as HTMLElement;
      if (this.showInfo) {
        // Mostrar el popup
        popup.style.display = 'block';
      } else {
        // Ocultar el popup
        popup.style.display = 'none';
      }
      // Altura disponible para mostrar el popup debajo del cursor
      const spaceBelowCursor = this.screenHeight - event.clientY;

      // Comprobar si hay suficiente espacio para mostrar el popup debajo del cursor
      if (spaceBelowCursor < this.popupHeight) {
        // Si no hay suficiente espacio, mostrar el popup encima del cursor
        this.popupTop = event.clientY - this.popupHeight;
      }

      // Establecer las variables CSS personalizadas con las coordenadas en el elemento del popup
      popup?.style.setProperty("--click-pos-x", `${this.popupLeft}px`);
      popup?.style.setProperty("--click-pos-y", `${this.popupTop}px`);
      if (priv === 'public') {
        this.contentInfoPriv = 'Este sueño es público. Cualquier usuario en Oniria podrá visualizarlo e interactuar con él. Si añades un intruso con username en él, el usuario vinculado será notificado por su aparición en tu sueño ';

      } else if (priv === 'private') {
        this.contentInfoPriv = 'Este sueño es privado y solo tú puedes visualizarlo. Ni siquiera los moderadores tienen permiso para leer tu información privada. Aunque haya intrusos vinculados, no serán notificados mientra el sueño permanezca en privado. En tu diario estás a salvo ;) ';

      } else if (priv === 'friends') {
        this.contentInfoPriv = 'Solo las personas que te sigan podrán visualizar en tu feed este sueño. En caso de haber intrusos mencionados, solo serán notificados si pertenecen a tus amigos ';
      }

    }
  }

  // FILTRO DE BÚSUQUEDA
  reloadDataWithSearchTerm(searchTerm: string) {
    // Realizar la búsqueda con el término recibido
    this.postService.searchPosts(searchTerm).subscribe({
      next: (data: IPost[]) => {
        // Actualizar la lista de posts con los resultados de la búsqueda
        this.postList = data;
        if (this.postList.length === 0) {
          this.noPostFound = true;
        }
        this.loading = false; // Opcional: marcar como cargados los datos
      },
      error: (error: any) => {
        console.error('Error al buscar posts:', error.message);
        this.loading = false; // Opcional: marcar como cargados los datos
      }
    });
  }

  reloadDataWithFilteredPosts(filteredPosts: any[]) {
    this.postList = filteredPosts; // Actualiza la lista de posts con los datos filtrados
    if (this.postList.length === 0) {
      this.noPostFound = true;
    }
  }



}
