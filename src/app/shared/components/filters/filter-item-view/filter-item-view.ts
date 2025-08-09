import { Component, inject } from '@angular/core';
import { GetService } from '../../../../services/requests/get-service';
import { CustomerCategories } from '../../../../models/CustomerCategories.model';

@Component({
  selector: 'app-filter-item-view',
  imports: [],
  templateUrl: './filter-item-view.html',
  styleUrl: './filter-item-view.css'
})
export class FilterItemView {
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
