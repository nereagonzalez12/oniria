import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICategory } from 'src/app/models/category.models';
import { IPeopleInvolved } from 'src/app/models/people-involved.models';
import { IPost } from 'src/app/models/post.model';

@Component({
  selector: 'app-delete-alert',
  templateUrl: './delete-alert.component.html',
  styleUrls: ['./delete-alert.component.css']
})
export class DeleteAlertComponent {
  @Input() itemToDelete?: IPost | ICategory | IPeopleInvolved;
  @Output() deleteConfirmed: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteDismissed: EventEmitter<void> = new EventEmitter<void>();
  @Input() deleteMessage: string = '';
  showDeleteAlert: boolean = false;


  confirmDelete() {
    if (this.itemToDelete) {
      this.deleteConfirmed.emit(this.itemToDelete);
    }
  }

  dismissDelete() {
    this.deleteDismissed.emit();
  }
}