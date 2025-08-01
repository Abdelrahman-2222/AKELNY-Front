import { Component, inject, OnInit } from '@angular/core';
import { CustomerCategories } from '../../../models/CustomerCategories.model';
import { GetService } from '../../../services/requests/get-service';

@Component({
  selector: 'app-filter',
  imports: [],
  templateUrl: './filter.html',
})
export class Filter implements OnInit {
  getService = inject(GetService);
  categories: CustomerCategories[] = []

  ngOnInit(): void {
    //restaurants
    this.getCategories();
    //restaurants

  }
  getCategories(): void {
    this.getService.get<CustomerCategories[]>({
      url: 'https://localhost:7045/api/Categories/GetAll',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }
    ).subscribe({
      next: (data: any) => {
        this.categories = data['categories'];
        console.log(this.categories);
      }
      , error: (err) => {
        console.error('Error fetching categories:', err);
      }
      , complete: () => {
        console.log('categories data fetch complete');
      }
    })
  }

  onCategoryChange(eventTarget: HTMLInputElement) {
    const isChecked = eventTarget.checked;
    console.log('Checkbox checked state:', isChecked);
    console.log('Checkbox value:', eventTarget.value);

  }
}


