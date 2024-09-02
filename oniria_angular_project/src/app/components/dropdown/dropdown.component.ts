import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent {
  menuVisible: boolean = true; // Inicialmente visible
  @Output() optionSelected = new EventEmitter<string>();

  selectOption(option: string) {
    this.optionSelected.emit(option);
    this.menuVisible = false;
  }
  showMenu() {
    this.menuVisible = !this.menuVisible; // Mostrar el menú nuevamente al hacer clic en el botón principal
  }
}
