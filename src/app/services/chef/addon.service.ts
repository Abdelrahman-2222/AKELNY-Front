import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddOn } from '../../models/AddItemChef';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddOnService {
  private apiUrl = `${environment.apiUrl}/AddOn`;

  constructor(private http: HttpClient) {}

  getChefAddOns(): Observable<AddOn[]> {
    return this.http.get<AddOn[]>(`${this.apiUrl}`);
  }
}
