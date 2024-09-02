import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CategoryNotificationService {
    private categoryCreatedSource = new Subject<void>();
    categoryCreated$ = this.categoryCreatedSource.asObservable();

    constructor() { }
    notifyCategoryCreated() {
        this.categoryCreatedSource.next();
    }
}
