import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [],
  templateUrl: './status-card.component.html',
  styleUrl: './status-card.component.css',
})
export class StatusCardComponent {
  @Input() card!:
    | {
        title: string;
        value: number;
        bgColor: string;
        dropdown: boolean;
        dropdownText: string;
      }
    | {
        title: string;
        value: number;
        bgColor: string;
        dropdown: boolean;
        dropdownText?: undefined;
      };
}
