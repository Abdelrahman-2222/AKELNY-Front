import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category, CategoryCreateDto, CategoryResponse } from '../models/categoryModel';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://localhost:7045/api/Categories';

  constructor(private http: HttpClient) {}

  addCategory(dto: CategoryCreateDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/Add`, dto, { responseType: 'text' });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/GetAll`)
      .pipe(
        map(response => response.categories)
      );
  }

  updateCategory(id: number, dto: CategoryCreateDto): Observable<string> {
    return this.http.put(`${this.apiUrl}/Update/${id}`, dto, { responseType: 'text' });
  }


  deleteCategory(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/Delete/${id}`, { responseType: 'text' });
  }

  // deleteAllCategories(): Observable<string>
  // {
  //   return this.http.delete(`${this.apiUrl}/DeleteAll`, { responseType: 'text' });
  // }

  // bulkAddCategories(categoryNames: string[]): Observable<string> {
  //   return this.http.post(`${this.apiUrl}/BulkAdd`, categoryNames, { responseType: 'text' });
  // }
}
