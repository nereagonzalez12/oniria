import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Oniria';

}
abstract class ViewportScroller {
  abstract setOffset(offset: [number, number] | (() => [number, number])): void;
  abstract scrollToPosition(position: [number, number]): void;
  abstract scrollToAnchor(anchor: string): void;
  abstract setHistoryScrollRestoration(scrollRestoration: "auto" | "manual"): void;
}