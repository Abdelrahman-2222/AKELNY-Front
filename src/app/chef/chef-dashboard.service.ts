import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChefDashboardService {
  stats = [
    {
      title: "Today's Orders",
      value: 8,
      icon: 'package',
      color: 'bg-primary-orange/10 text-primary-orange',
    },
    {
      title: 'Earnings',
      value: 218,
      icon: 'dollar-sign',
      color: 'bg-primary-green/10 text-primary-green',
    },
    {
      title: 'Rating',
      value: 4.2,
      icon: 'star',
      color: 'bg-amber-400/10 text-amber-500',
    },
    {
      title: 'Avg. Prep Time',
      value: 35,
      icon: 'clock',
      color: 'bg-blue-500/10 text-blue-500',
    },
  ];
  currentOrders = [
    {
      id: '#122',
      customer: 'WittJear',
      items: 3,
      amount: 42.5,
      time: '35 min',
    },
    {
      id: '#121',
      customer: 'Semdrey',
      items: 2,
      amount: 28.75,
      time: '25 min',
    },
  ];

  pastOrders = [
    {
      id: '#120',
      customer: 'Oriana',
      items: 4,
      amount: 56.2,
      date: 'Jul 18, 2025',
    },
    {
      id: '#119',
      customer: 'Plic',
      items: 1,
      amount: 12.99,
      date: 'Jul 17, 2025',
    },
  ];
}
