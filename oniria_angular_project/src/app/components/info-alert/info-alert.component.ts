import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPost } from 'src/app/models/post.model';

@Component({
  selector: 'app-info-alert',
  templateUrl: './info-alert.component.html',
  styleUrls: ['./info-alert.component.css']
})
export class InfoAlertComponent {
  @Input() itemToInfo?: IPost;
  @Output() infoConfirmed: EventEmitter<void> = new EventEmitter<void>();
  @Output() infoDismissed: EventEmitter<void> = new EventEmitter<void>();
  @Input() infoMessage: string = '';
  showInfoAlert: boolean = false;


  confirmInfo() {
    this.infoConfirmed.emit();

  }

  dismissInfo() {
    this.infoDismissed.emit();
  }
}
