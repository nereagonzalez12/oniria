import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPeopleInvolved } from 'src/app/models/people-involved.models';

@Component({
  selector: 'app-people-involved',
  templateUrl: './people-involved.component.html',
  styleUrls: ['./people-involved.component.css']
})
export class PeopleInvolvedComponent {
  @Output() peopleSelected = new EventEmitter<IPeopleInvolved>();
  @Output() removePeople = new EventEmitter<IPeopleInvolved>();
  @Input() peopleList: IPeopleInvolved[] = [];
  @Input() selectedPeople: number[] = [];
  @Input() dropdownVisible: boolean = false;


  selectPeopleInvolved(people: IPeopleInvolved) {
    this.peopleSelected.emit(people);
  }

  isPeopleInvolvedSelected(people: IPeopleInvolved): boolean {
    return this.selectedPeople.includes(people.id);
  }


}
