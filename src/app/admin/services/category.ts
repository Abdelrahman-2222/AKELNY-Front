import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category, CategoryCreateDto, CategoryResponse } from '../models/categoryModel';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/Categories`;

  constructor(private http: HttpClient) {}

  addCategory(dto: CategoryCreateDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/Add`, dto, { responseType: 'text' });
  }

  // Sort categories by name alphabetically
  // getCategories(): Observable<Category[]> {
  //   return this.http.get<CategoryResponse>(`${this.apiUrl}/GetAll`)
  //     .pipe(
  //       map(response => response.categories)
  //     );
  // }
  getCategories(): Observable<Category[]> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/GetAll`)
      .pipe(
        map(response => response.categories.sort((a, b) => a.name.localeCompare(b.name)))
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
