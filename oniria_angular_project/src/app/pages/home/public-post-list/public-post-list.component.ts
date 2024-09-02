import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { ICategory } from 'src/app/models/category.models';
import { IComment } from 'src/app/models/comments.models';
import { IPost } from 'src/app/models/post.model';
import { IUser } from 'src/app/models/user.model';
import { ApiPublicCategoriesService } from 'src/app/services/api-public-categories.service';
import { ApiPublicPostService } from 'src/app/services/api-public-post.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CommentService } from 'src/app/services/comment.service';
import { API_URL } from 'src/app/services/globals';
import { LikesService } from 'src/app/services/likes.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-public-post-list',
  templateUrl: './public-post-list.component.html',
  styleUrls: ['./public-post-list.component.css']
})
export class PublicPostListComponent implements OnInit, OnChanges {
  postList: IPost[] = [];
  categoryList: ICategory[] = [];
  comments: IComment[] = [];
  likeStatus: { [postId: number]: boolean; } = {}; // Estado de "like" para cada publicación
  likeCounts: { [postId: number]: number; } = {}; // Recuento de "likes" para cada publicación
  commentCounts: { [postId: number]: number; } = {}; // Recuento de "comentarios" para cada publicación
  selectedPostId: number | null = null;
  @Output() selectedUser = new EventEmitter<IUser>();
  loading: boolean = true;
  likedPostFound: boolean = true;
  showOverlay: boolean = false;
  overlayImageUrl: string = '';
  loadingImageProfile: boolean = true;
  userDetailsMap: { [key: number]: IUser; } = {};
  profileImageMap: { [key: number]: string; } = {};
  categoryMap = new Map<number, ICategory[]>();
  categoryPostMap: Map<number, ICategory[]> = new Map<number, ICategory[]>();
  newCommentContent: string = '';
  loggedInId?: number;
  @Input() activeButton?: string;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private publicPostService = inject(ApiPublicPostService);
  private userService = inject(UserService);
  private authenticationService = inject(AuthenticationService);
  private publicCategoryService = inject(ApiPublicCategoriesService);
  private likesService = inject(LikesService);
  private commentService = inject(CommentService);
  private apiPublicPostService = inject(ApiPublicPostService);

  ngOnInit(): void {
    this.getLoggedInId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeButton'] && this.activeButton == 'public') {
      this.obtainPublicData();

    } else if (changes['activeButton'] && this.activeButton == 'friends') {
      this.obtainFriendsData();

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

  /* OBTENER LISTA DE POST ============================= */
  obtainPublicData() {
    this.publicPostService.getAllPosts().subscribe({
      next: (data: IPost[]) => {
        this.postList = data;
        this.loadUserDetailsForPosts();
        this.obtainCategoryData();
        this.getStatusForPosts();
        this.loading = false;
      },
      error: (error: any) => {
        console.log(error);
        // this.loading = false;
      }
    });
  }

  obtainFriendsData() {
    this.publicPostService.getFriendsPosts().subscribe({
      next: (data: IPost[]) => {
        this.postList = data;
        this.loadUserDetailsForPosts();
        this.loading = false;
        this.getStatusForPosts();

      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getPostParagraphs(content: string): string[] {
    return content.split('\n').filter(paragraph => paragraph.trim().length > 0);
  }

  /* OBTENER INFORMACIÓN DEL PERFIL ============================= */
  loadUserDetailsForPosts() {
    if (!this.postList || this.postList.length === 0) {
      return;
    }

    const userIds = [...new Set(this.postList.map(post => post.user))];

    if (userIds.length === 0) {
      console.warn('No user IDs found in postList');
      return;
    }

    userIds.forEach(userId => {
      this.authenticationService.getUserById(userId).subscribe({
        next: (user) => {
          this.userDetailsMap[userId] = user;
          this.loadProfileImageUrl(user.id);
        },
        error: (error) => {
          console.error('Error loading user details for userId:', userId, error);
        }
      });
    });
  }

  loadProfileImageUrl(userId: number): void {
    this.userService.getProfileImage(userId).subscribe({
      next: (data) => {
        this.userDetailsMap[userId].profile_image = API_URL + data.profile_image_url;
        this.loadingImageProfile = false;
      },
      error: (error) => {
        console.error('Error al cargar la URL de la imagen de perfil:', error);
      }
    });
  }


  /* OBTENER PERFIL Y MOSTRAR USUARIO ============================= */
  obtainUserProfile(userId: number) {
    this.authenticationService.getUserById(userId).subscribe({
      next: (user) => {
        this.selectedUser.emit(user); // Emite el evento con el usuario seleccionado
      },
      error: (error) => {
        console.error('Error loading user details:', error);
      }
    });
  }

  /* OBTENER CATEGORÍAS ============================= */

  obtainCategoryData() {
    this.publicCategoryService.getAllCategories().subscribe({
      next: (categories: ICategory[]) => {
        this.postList.forEach(post => {
          post.categories = categories.filter(category => post.category.includes(category.id));
        });
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  /* Mostrar imagen de perfil de cerca */
  showImageOverlay(imageUrl: string) {
    this.overlayImageUrl = imageUrl;
    this.showOverlay = true;
  }

  hideImageOverlay() {
    this.showOverlay = false;
  }

  /* DAR LIKES A LOS POST ============================= */

  // Función para dar o quitar "like" a una publicación
  toggleLike(postId: number): void {
    if (this.likeStatus[postId]) {
      this.unlikePost(postId);
    } else {
      this.likePost(postId);
    }
  }

  // Función para dar "like" a una publicación
  likePost(postId: number): void {
    this.likesService.likePost(postId).subscribe(() => {
      this.likeStatus[postId] = true; // Actualizar estado de "like"
      this.likeCounts[postId]++; // Incrementar contador de likes
    });
  }

  // Función para quitar "like" a una publicación
  unlikePost(postId: number): void {
    this.likesService.unlikePost(postId).subscribe(() => {
      this.likeStatus[postId] = false; // Actualizar estado de "like"
      this.likeCounts[postId]--; // Decrementar contador de likes
    });
  }


  // Función para obtener el estado de "like" para las publicaciones
  getStatusForPosts(): void {
    this.postList.forEach(post => {
      this.loadCommentCount(post.id);
      this.likesService.getLikeStatusForPosts(post.id).subscribe({
        next: (response) => {
          this.likeStatus[post.id] = response.liked;
          this.likeCounts[post.id] = response.like_count;
        },
        error: (error) => {
          console.error('Error obteniendo el estado de like para el post con ID:', post.id, error);
        }
      });
    });
  }

  /* COMENTARIOS ============================= */

  // Mostrar/ocultar comentarios de un post
  toggleComments(postId: number): void {
    if (this.selectedPostId === postId) {
      this.selectedPostId = null;
    } else {
      this.selectedPostId = postId;
      this.getPostComments(postId);
    }
  }

  // Obtener comentarios del post
  getPostComments(postId: number): void {
    this.commentService.getComments(postId).subscribe({
      next: (comments: IComment[]) => {
        this.comments = comments;
        this.loadUserDetailsForComments(comments);
        console.log(comments);
      },
      error: (error: any) => {
        console.error('Error obteniendo comentarios del post:', error);
      }
    });
  }

  loadUserDetailsForComments(comments: IComment[]) {
    const userIds = [...new Set(comments.map(comment => comment.user))];

    userIds.forEach(userId => {
      if (!this.userDetailsMap[userId]) { // Evitar múltiples llamadas para el mismo usuario
        this.authenticationService.getUserById(userId).subscribe({
          next: (user) => {
            this.userDetailsMap[userId] = user;
            this.loadProfileImageUrl(user.id);
          },
          error: (error) => {
            console.error('Error loading user details for userId:', userId, error);
          }
        });
      }
    });
  }

  // Carga el conteo de comentarios
  loadCommentCount(postId: number): void {
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        this.commentCounts[postId] = comments.length;
      }, error: (error) => {
        console.error('Error al cargar los comentarios:', error);
      }
    });
  }

  // Método para enviar un nuevo comentario
  submitComment(postId: number): void {
    if (this.newCommentContent.trim() === '') {
      return; // Evitar enviar comentarios vacíos
    }

    this.authenticationService.getUserInfo().subscribe({
      next: (user) => {
        if (!user || !user.id) {
          console.error('Error: usuario no autenticado');
          return;
        }

        const comment: IComment = {
          content: this.newCommentContent,
          user: user.id,
          post: postId
        };

        // Verificar que todos los campos del comentario estén presentes y no estén vacíos
        if (!comment.content || !comment.user || !comment.post) {
          console.error('Error: falta información del comentario');
          return;
        }

        // Llamar al servicio para crear el comentario
        this.commentService.createComment(comment).subscribe({
          next: (response) => {
            // Actualizar la lista de comentarios después de enviar el comentario
            this.getPostComments(postId);
            // Limpiar el contenido del textarea después de enviar el comentario
            this.newCommentContent = '';
          },
          error: (error) => {
            console.error('Error al enviar el comentario:', error);
            // Manejar el error, si es necesario
          }
        });
      },
      error: (error) => {
        console.error('Error obteniendo información del usuario:', error);
      }
    });
  }


  /* ELIMINAR COMENTARIOS */

  // Método para eliminar un comentario
  deleteComment(commentId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(comment => comment.id !== commentId);
        },
        error: (error) => {
          console.error('Error eliminando el comentario:', error);
          // Manejar el error, si es necesario
        }
      });
    }
  }

  // FILTRO DE BÚSUQUEDA
  reloadDataWithSearchTerm(searchTerm: string, publicSection: string) {
    this.likedPostFound = true;
    // Realizar la búsqueda con el término recibido
    if (publicSection === 'public') {
      this.apiPublicPostService.searchPublicPosts(searchTerm).subscribe({
        next: (data: IPost[]) => {
          // Actualizar la lista de posts con los resultados de la búsqueda
          this.postList = data;
          if (this.postList.length === 0) {
          }
          this.loading = false; // Opcional: marcar como cargados los datos
        },
        error: (error: any) => {
          console.error('Error al buscar posts:', error.message);
          this.loading = false; // Opcional: marcar como cargados los datos
        }
      });
    } else if (publicSection === 'friends') {
      this.apiPublicPostService.searchFriendsPosts(searchTerm).subscribe({
        next: (data: IPost[]) => {
          // Actualizar la lista de posts con los resultados de la búsqueda
          this.postList = data;
          if (this.postList.length === 0) {
          }
          this.loading = false; // Opcional: marcar como cargados los datos
        },
        error: (error: any) => {
          console.error('Error al buscar posts:', error.message);
          this.loading = false; // Opcional: marcar como cargados los datos
        }
      });
    }
  }

  reloadDataWithLikedPost(publicSection: string) {
    // Realizar la búsqueda con el término recibido
    if (publicSection === 'public') {
      this.apiPublicPostService.likedPublicPosts().subscribe({
        next: (data: IPost[]) => {
          // Actualizar la lista de posts con los resultados de la búsqueda
          this.postList = data;
          if (this.postList.length === 0) {
            this.likedPostFound = false;
          }
          this.loading = false; // Opcional: marcar como cargados los datos
        },
        error: (error: any) => {
          console.error('Error al buscar posts:', error.message);
          this.loading = false; // Opcional: marcar como cargados los datos
        }
      });
    } else if (publicSection === 'friends') {
      this.apiPublicPostService.likedFriendsPosts().subscribe({
        next: (data: IPost[]) => {
          // Actualizar la lista de posts con los resultados de la búsqueda
          this.postList = data;
          if (this.postList.length === 0) {
            this.likedPostFound = false;
          }
          this.loading = false; // Opcional: marcar como cargados los datos
        },
        error: (error: any) => {
          console.error('Error al buscar posts:', error.message);
          this.loading = false; // Opcional: marcar como cargados los datos
        }
      });
    }
  }
}
