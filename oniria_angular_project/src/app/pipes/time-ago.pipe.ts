// time-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  transform(date: Date | string | number): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  }
}
