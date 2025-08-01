import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  //GET /api/foods?filters=name==Pizza,price>=30&sorts=-rating&page=1&pageSize=10
  private filters:any[] = ["true" , "Customer"];
  private filterQuery:string = '?filters=name'
  constructor() {}

  setFilter(value: any): void {
    this.filters.push(value);
  }

  // getFilter(id: number): any {
  //   return this.filters[id];
  // }

  clearFilter(id: number): void { //error
    this.filters.splice(id, 1);
  }

  clearAllFilters(): void {
    this.filters = [];
  }
}
