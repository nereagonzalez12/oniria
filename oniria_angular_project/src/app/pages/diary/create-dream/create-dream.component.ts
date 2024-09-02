import { Component, EventEmitter, Input, OnInit, Output, Renderer2, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ICategory } from 'src/app/models/category.models';
import { IPeopleInvolved } from 'src/app/models/people-involved.models';
import { IUser } from 'src/app/models/user.model';
import { ApiCategoriesService } from 'src/app/services/api-categories.service';
import { ApiPeopleInvolvedService } from 'src/app/services/api-people-involved.service';
import { ApiPostService } from 'src/app/services/api-post.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-create-dream',
  templateUrl: './create-dream.component.html',
  styleUrls: ['./create-dream.component.css']
})
export class CreateDreamComponent implements OnInit {
  submitted = false;
  infoMessage: string = '';
  categoryList: ICategory[] = [];
  peopleList: IPeopleInvolved[] = [];
  privacyImage = 'assets/svg/public-icon.svg';
  postForm: FormGroup = new FormGroup({});
  categoriesDropdownVisible = false;
  peopleDropdownVisible = false;
  popupLeft: number = 0; // Posición izquierda del popup
  popupTop: number = 0; // Posición superior del popup
  popupHeight = 230;
  screenHeight = window.innerHeight;
  currentUser?: IUser;
  // Animacion al eliminar categoria
  shakeTimeout: any;
  isShaking: { [categoryId: number]: boolean; } = {};
  selectedCategories: number[] = []; // Array para almacenar las categorías seleccionadas
  selectedPeople: number[] = []; // Array para almacenar las categorías seleccionadas
  private authService = inject(AuthenticationService);
  private postService = inject(ApiPostService);
  private categoryService = inject(ApiCategoriesService);
  private peopleService = inject(ApiPeopleInvolvedService);
  @Output() discard = new EventEmitter<boolean>();
  @Output() showPostForm = new EventEmitter<boolean>();
  @Input() showInfoAlert: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.obtainCategoryData();
    this.obtainPeopleData();


    // Verificar si hay datos en sessionStorage y establecer showForm en true si los hay
    const showPostFormString = sessionStorage.getItem('showCreatePost');
    if (showPostFormString && showPostFormString === 'true') {
      this.showPostForm.emit(true);
    }
    // Verificar si hay datos en sessionStorage para el formulario y establecerlo si existe
    const savedFormData = sessionStorage.getItem('postFormData');
    if (savedFormData) {
      const parsedForm = JSON.parse(savedFormData);
      this.postForm = this.formBuilder.group({
        title: [parsedForm.title, Validators.required],
        content: [parsedForm.content, Validators.required],
        dream_date: [parsedForm.dream_date, Validators.required],
        category: [parsedForm.category], // Asignar las categorías guardadas
        peopleInvolved: [parsedForm.peopleInvolved], // Asignar las categorías guardadas
        privacy: [parsedForm.privacy]
      });
    } else {
      this.postForm = this.formBuilder.group({
        title: ['', Validators.required],
        content: ['', Validators.required],
        dream_date: ['', Validators.required],
        category: [''],
        peopleInvolved: [''],
        privacy: ['private']
      });
    }

    // Obtener la información del usuario actual
    this.authService.getUserInfo().subscribe({
      next: (user: IUser) => {
        this.currentUser = user;
      },
      error: (error: any) => {
        console.error('Error al obtener información del usuario:', error);
      }
    });
  }

  obtainCategoryData() {
    this.categoryService.getAllCategories().subscribe((data: ICategory[]) => {
      this.categoryList = data;

      // Guardar las categorías en la sesión
      const savedCategories = sessionStorage.getItem('postCategories');
      if (savedCategories) {
        this.selectedCategories = JSON.parse(savedCategories);
      } else {
        this.selectedCategories = []; // Si no hay categorías guardadas, inicializar como un array vacío
      }
    });

  }

  obtainPeopleData() {
    this.peopleService.getAllPeople().subscribe((data: IPeopleInvolved[]) => {
      this.peopleList = data;
      // Guardar las categorías en la sesión
      const savedPeople = sessionStorage.getItem('postPeople');
      if (savedPeople) {
        this.selectedPeople = JSON.parse(savedPeople);
      } else {
        this.selectedPeople = []; // Si no hay categorías guardadas, inicializar como un array vacío
      }
    });

  }

  // Actualizar privacidad del post
  updatePrivacyOption(option: string) {
    this.postForm.patchValue({ privacy: option });
  }

  // Método para manejar la selección de categorías;
  addCategoryToPost(category: ICategory) {
    const categoryId = category.id;
    this.isShaking[category.id] = false;
    // Verificar si la categoría ya está seleccionada
    const index = this.selectedCategories.indexOf(categoryId);
    if (index !== -1) {
      // Si la categoría ya está seleccionada, la eliminamos
      this.selectedCategories.splice(index, 1);
    } else {
      // Si la categoría no está seleccionada, la añadimos
      this.selectedCategories.push(categoryId);
    }

    // Actualizamos el formulario con las categorías seleccionadas
    this.postForm.patchValue({ category: this.selectedCategories });

    // Guardar las categorías seleccionadas en sessionStorage
    sessionStorage.setItem('postCategories', JSON.stringify(this.selectedCategories));

    // Cerramos el desplegable de categorías
    this.categoriesDropdownVisible = false;
    this.renderer.removeClass(document.body, 'no-scroll');
  }

  // Método para manejar la selección de categorías;
  addPeopleToPost(person: IPeopleInvolved) {
    const peopleId = person.id;
    const index = this.selectedPeople.indexOf(peopleId);
    if (index !== -1) {
      this.selectedPeople.splice(index, 1);
    } else {
      this.selectedPeople.push(peopleId);
    }
    this.postForm.patchValue({ peopleInvolved: this.selectedPeople });

    // Guardar las categorías seleccionadas en sessionStorage
    sessionStorage.setItem('postPeople', JSON.stringify(this.selectedPeople));

    // Cerramos el desplegable de categorías
    this.peopleDropdownVisible = false;
    this.renderer.removeClass(document.body, 'no-scroll');
  }


  // Obtener la categoría asociada al post
  getCategoryName(categoryId: number): string | null {
    const category = this.categoryList.find(c => c.id === categoryId);
    return category ? category.name : null;
  }

  // Eliminar categoría
  confirmDelete(cat: number) {

    // Encuentra el índice de la categoría que deseas eliminar
    const index = this.selectedCategories.indexOf(cat);

    // Verifica si el índice es válido (-1 significa que el elemento no se encontró)
    if (index !== -1) {
      // Elimina la categoría de la lista
      this.selectedCategories.splice(index, 1);

      // Guarda la lista actualizada en sessionStorage
      sessionStorage.setItem('postCategories', JSON.stringify(this.selectedCategories));
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.postForm.invalid || !this.currentUser) {
      return;
    }

    // Verifica si la privacidad es distinta de 'private'
    if (this.postForm.value.privacy !== 'private') {
      // Establece el mensaje dependiendo del valor de la privacidad
      if (this.postForm.value.privacy === 'public') {
        this.infoMessage = 'Vas a hacer público este sueño. Todos los usuarios podrán leerlo e interactuar con él. ¿Estás de acuerdo?';
      } else if (this.postForm.value.privacy === 'friends') {
        this.infoMessage = 'Vas a hacer público este sueño para tus amigos. Solo los usuarios que te sigan podrán leerlo e interactuar con él. ¿Estás de acuerdo?';
      }

      // Muestra la alerta usando el componente InfoAlertComponent
      this.showInfoAlert = true;
    } else {
      // Si la privacidad es 'private', procede con la creación del post
      this.createPost();
    }
  }

  // Método para crear el post
  createPost() {
    if (!this.currentUser) {
      return;
    }

    // Agregar el ID del usuario al objeto post
    const postWithUserId = {
      ...this.postForm.value,
      user: this.currentUser.id,
      category: this.selectedCategories || [],
      people_involved: this.selectedPeople || []
    };

    this.postService.newPost(postWithUserId).subscribe({
      next: (response: any) => {
        // Borrar valores del formulario en sessionStorage
        sessionStorage.removeItem('postFormData');
        sessionStorage.removeItem('postCategories'); // Limpiar las categorías guardadas
        sessionStorage.removeItem('postPeople');

      },
      error: (error: any) => {
        console.log('Error: ', error);
      }
    });
  }

  // Método para confirmar la publicación del post
  confirmPost() {
    // Ocultar la alerta
    this.showInfoAlert = false;
    // Crear el post
    this.createPost();
  }

  // Método para cancelar la publicación del post
  cancelPost() {
    // Ocultar la alerta
    this.showInfoAlert = false;
    // Continuar editando el post
  }

  discardButton() {
    // Mostrar un alert para confirmar la acción
    const confirmDiscard = confirm("El sueño se descartará y los datos se perderán");
    if (confirmDiscard) {
      // Si el usuario confirma, emitir el evento 'discard' y limpiar los datos del formulario en sessionStorage
      this.discard.emit(true);
      sessionStorage.removeItem('postFormData');
      sessionStorage.removeItem('postCategories');
      sessionStorage.removeItem('postPeople');
    }
  }

  hasErrors(contolName: string, errorType: string) {
    const control = this.postForm.get(contolName);
    return control && control.hasError(errorType) && control.touched || (this.submitted && control?.hasError(errorType));
  }

  // Guardar datos en sessionStorage mientras se edita el formulario
  saveFormDataToSessionStorage() {
    sessionStorage.setItem('postFormData', JSON.stringify(this.postForm.value));
  }

  toggleCategoriesDropdown(event: MouseEvent) {
    this.categoriesDropdownVisible = !this.categoriesDropdownVisible;
    this.peopleDropdownVisible = false;
    this.renderer.addClass(document.body, 'no-scroll');

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

  togglePeopleDropdown(event: MouseEvent) {
    this.peopleDropdownVisible = !this.peopleDropdownVisible;
    this.categoriesDropdownVisible = false;
    this.renderer.addClass(document.body, 'no-scroll');

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


}
