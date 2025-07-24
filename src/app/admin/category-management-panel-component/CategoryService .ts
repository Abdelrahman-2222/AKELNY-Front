import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryCreateDto {
  name: string;
}

export interface Category {
  id?: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly baseUrl = environment.apiUrl; // Replace with your actual API base URL

  constructor(private http: HttpClient) {}

  addCategory(dto: CategoryCreateDto): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/Add`, dto);
  }

  // You might want to add other category-related methods here
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}`);
  }
}
