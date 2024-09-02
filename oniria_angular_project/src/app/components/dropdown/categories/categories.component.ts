import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICategory } from 'src/app/models/category.models';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  @Output() categorySelected = new EventEmitter<ICategory>();
  @Input() categoryList: ICategory[] = [];
  @Input() selectedCategories: number[] = [];
  @Input() dropdownVisible: boolean = false;


  selectCategory(category: ICategory) {
    this.categorySelected.emit(category);
  }

  isCategorySelected(category: ICategory): boolean {
    return this.selectedCategories.includes(category.id);
  }


}
