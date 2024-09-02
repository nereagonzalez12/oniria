import { Component, OnInit, inject } from '@angular/core';
import { ICategory } from 'src/app/models/category.models';
import { IPeopleInvolved } from 'src/app/models/people-involved.models';
import { IPost } from 'src/app/models/post.model';
import { ApiCategoriesService } from 'src/app/services/api-categories.service';
import { ApiPeopleInvolvedService } from 'src/app/services/api-people-involved.service';
import { ApiPostService } from 'src/app/services/api-post.service';

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.css']
})
export class GraphicsComponent implements OnInit {
  selectedTimeRange: string = 'historico';
  loading: boolean = true;
  postCountInfo: string = '';
  postCount: number = 0;
  categoryPostCounts: number[] = [];
  peoplePostCounts: number[] = [];
  categoryList: ICategory[] = [];
  postList: IPost[] = [];
  postToGraphicsList: IPost[] = [];
  peopleList: IPeopleInvolved[] = [];
  categoryNames: string[] = [];
  peopleNames: string[] = [];
  topCategories: { name: string, count: number; }[] = [];
  topPeople: { name: string, count: number; }[] = [];
  privacyCounts: { [key: string]: number; } = { public: 0, private: 0, friends: 0 };


  private postService = inject(ApiPostService);
  private categoryService = inject(ApiCategoriesService);
  private peopleService = inject(ApiPeopleInvolvedService);

  constructor() { }

  ngOnInit(): void {
    this.obtainCategoryData();
    this.obtainPeopleData();
    this.obtainPostToGraphics();
  }

  obtainCategoryData() {
    this.categoryService.getAllCategories().subscribe((data: ICategory[]) => {
      this.categoryList = data.map(category => ({ ...category, selected: false }));
      this.categoryNames = this.categoryList.map(category => category.name); // Obtener los nombres de las categorías
      this.obtainPostData();
      this.loading = false;
    });
  }

  obtainPostData() {
    this.postService.getAllPosts().subscribe((data: IPost[]) => {
      this.postList = data;
      this.updateChartData();
      this.loading = false;
    });
  }

  obtainPostToGraphics() {
    this.postService.getAllPosts().subscribe((data: IPost[]) => {
      this.postToGraphicsList = data;
      this.loading = false;
    });
  }

  obtainPeopleData() {
    this.peopleService.getAllPeople().subscribe((data: IPeopleInvolved[]) => {
      this.peopleList = data;
      this.peopleNames = this.peopleList.map(people_involved => people_involved.name); // Obtener los nombres de las categorías
      this.obtainPostData();
      this.loading = false;
    });
  }


  onTimeRangeChange() {
    this.updateChartData();
  }

  updateChartData() {
    switch (this.selectedTimeRange) {
      case 'estaSemana':
        this.countPost(this.getThisWeekRange(), 'esta semana');
        break;
      case 'esteMes':
        this.countPost(this.getThisMonthRange(), 'este mes');
        break;
      case 'esteAño':
        this.countPost(this.getThisYearRange(), 'este año');
        break;
      default:
        this.countPost();
    }
  }

  countPost(dateRange?: Date[], rangeText?: string): void {
    // Filtrar los datos de los posts según el rango de fechas
    const filteredPosts = dateRange ?
      this.postList.filter(post => dateRange[0] <= new Date(post.dream_date) && new Date(post.dream_date) <= dateRange[1]) :
      this.postList;
    if (rangeText == undefined) {
      rangeText = 'en total';
    }
    this.postCount = filteredPosts.length;
    this.postCountInfo = 'sueños ' + rangeText;

    // Contar las categorías de los posts filtrados -------
    const categoryCounts: number[] = new Array(this.categoryList.length).fill(0);
    filteredPosts.forEach(post => {
      post.category.forEach(categoryId => {
        const index = this.categoryList.findIndex(category => category.id === categoryId);
        if (index !== -1) {
          categoryCounts[index]++;
        }
      });
    });
    this.categoryPostCounts = categoryCounts;

    // Verificar si peopleList tiene datos antes de contar
    if (!this.peopleList.length) {
      console.warn("peopleList está vacío o no ha sido poblado");
      return;
    }

    // Contar las personas involucradas de los posts filtrados ------------
    const peopleCounts: number[] = new Array(this.peopleList.length).fill(0);
    filteredPosts.forEach(post => {
      if (post.people_involved && Array.isArray(post.people_involved)) {
        post.people_involved.forEach(peopleId => {
          const index = this.peopleList.findIndex(people_involved => people_involved.id === peopleId);
          if (index !== -1) {
            peopleCounts[index]++;
          }
        });
      } else {
        console.warn("people_involved no es un array o está indefinido en el post con ID:", post.id);
      }
    });
    this.peoplePostCounts = peopleCounts;

    // Calculo Top Etiquetas -----------

    const topCategoryCounts: { [key: number]: number; } = {};
    filteredPosts.forEach(post => {
      post.category.forEach(categoryId => {
        topCategoryCounts[categoryId] = (topCategoryCounts[categoryId] || 0) + 1;
      });
    });

    const sortedCategories = Object.entries(topCategoryCounts)
      .map(([id, count]) => {
        const category = this.categoryList.find(c => c.id === +id);
        return category ? { name: category.name, count } : null;
      })
      .filter(c => c !== null)
      .sort((a, b) => b!.count - a!.count)
      .slice(0, 5);

    this.topCategories = sortedCategories as { name: string, count: number; }[];

    // Calculo Top Intrusos -----------

    const topPeopleCounts: { [key: number]: number; } = {};
    filteredPosts.forEach(post => {
      post.people_involved.forEach(peopleId => {
        topPeopleCounts[peopleId] = (topPeopleCounts[peopleId] || 0) + 1;
      });
    });

    const sortedPeople = Object.entries(topPeopleCounts)
      .map(([id, count]) => {
        const people = this.peopleList.find(c => c.id === +id);
        return people ? { name: people.name, count } : null;
      })
      .filter(c => c !== null)
      .sort((a, b) => b!.count - a!.count)
      .slice(0, 5);

    this.topPeople = sortedPeople as { name: string, count: number; }[];

    // Gráfico Privacidad ----------
    this.privacyCounts = { public: 0, private: 0, friends: 0 };

    filteredPosts.forEach(post => {
      console.log('post en graficos listados');
      console.log(post);
      if (post.privacy in this.privacyCounts) {
        this.privacyCounts[post.privacy]++;
      }
    });

  }


  getThisWeekRange(): Date[] {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + 6) % 7); // Obtener el primer día de la semana (lunes)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // Obtener el último día de la semana (domingo);
    return [startOfWeek, endOfWeek];
  }


  getThisMonthRange(): Date[] {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Primer día del mes actual
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último día del mes actual
    return [startOfMonth, endOfMonth];
  }

  getThisYearRange(): Date[] {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Primer día del año actual
    const endOfYear = new Date(today.getFullYear(), 11, 31); // Último día del año actual
    return [startOfYear, endOfYear];
  }


}
