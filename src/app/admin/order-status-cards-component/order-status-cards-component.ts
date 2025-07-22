import { Component } from '@angular/core';
import { StatusCardComponent } from '../status-card/status-card.component';

@Component({
  selector: 'app-order-status-cards',
  imports: [StatusCardComponent],
  templateUrl: './order-status-cards-component.html',
  styleUrl: './order-status-cards-component.css',
})
export class OrderStatusCardsComponent {
  cards = [
    {
      title: 'Orders',
      value: 120,
      bgColor: 'bg-green-600',
      dropdown: true,
      dropdownText: 'Suspents',
    },
    {
      title: 'Standard',
      value: 84,
      bgColor: 'bg-orange-400',
      dropdown: false,
    },
    {
      title: 'Substruments',
      value: 37,
      bgColor: 'bg-amber-400',
      dropdown: false,
    },
  ];
}
