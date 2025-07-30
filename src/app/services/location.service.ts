// Updated location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {map, tap} from 'rxjs/operators';

export interface LocationDto {
  id: number;
  name: string;
  nameAr: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly apiUrl = '[https://localhost:7045/api/locations](https://localhost:7045/api/locations)';

// Caches
  private governoratesCache: LocationDto[] | null = null;
  private citiesCache = new Map<number, LocationDto[]>();
  private zonesCache = new Map<number, LocationDto[]>();

// Reactive selections
  private _selectedGovernorate = new BehaviorSubject<number | null>(null);
  private _selectedCity = new BehaviorSubject<number | null>(null);

  readonly selectedGovernorate$ = this._selectedGovernorate.asObservable();
  readonly selectedCity$ = this._selectedCity.asObservable();

  constructor(private http: HttpClient) {}

  getGovernorates(): Observable<LocationDto[]> {
  if (this.governoratesCache) {
  return new BehaviorSubject(this.governoratesCache).asObservable();
}
return this.http.get<{ success: boolean; data: LocationDto[] }>(`${this.apiUrl}/governorates`)
  .pipe(
    tap(res => this.governoratesCache = res.data),
    // extract only the data array
    tap(),
    map(res => res.data)
  );
}


getCities(governorateId: number): Observable<LocationDto[]> {
  if (this.citiesCache.has(governorateId)) {
  return new BehaviorSubject(this.citiesCache.get(governorateId)!).asObservable();
}
const params = new HttpParams().set('governorateId', governorateId.toString());
return this.http.get<{ success: boolean; data: LocationDto[] }>(`${this.apiUrl}/cities`, { params })
  .pipe(
    tap(res => this.citiesCache.set(governorateId, res.data)),
    map(res => res.data)
  );
}

getZones(cityId: number): Observable<LocationDto[]> {
  if (this.zonesCache.has(cityId)) {
  return new BehaviorSubject(this.zonesCache.get(cityId)!).asObservable();
}
const params = new HttpParams().set('cityId', cityId.toString());
return this.http.get<{ success: boolean; data: LocationDto[] }>(`${this.apiUrl}/zones`, { params })
  .pipe(
    tap(res => this.zonesCache.set(cityId, res.data)),
    map(res => res.data)
  );
}



getHierarchy(): Observable<{ success: boolean; data: any }> {
  return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/hierarchy`);
}

selectGovernorate(id: number) {
  this._selectedGovernorate.next(id);
  this._selectedCity.next(null);
}

selectCity(id: number) {
  this._selectedCity.next(id);
}
}
