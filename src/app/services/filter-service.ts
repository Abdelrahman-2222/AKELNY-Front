import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filters: { [key: string]: any } = {"auth": "true" , "role": "Customer"};

  constructor() {}

  setFilter(key: string, value: any): void {
    this.filters[key] = value;
  }

  getFilter(key: string): any {
    return this.filters[key];
  }

  clearFilter(key: string): void {
    delete this.filters[key];
  }

  clearAllFilters(): void {
    this.filters = {};
  }

  getAllFilters(): { [key: string]: any } {
    return this.filters;
  }
}
