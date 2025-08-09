import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getRequest } from '../../models/Shared.model'; // Adjust the import path as necessary


@Injectable({
  providedIn: 'root'
})

export class GetService {
  httpClient = inject(HttpClient);
  constructor() {}

  get<T>(request : getRequest):Observable<T> {
    const { url, headers, query } = request;
    const fullUrl = query ? `${url}?${query}` : url;

    console.log(`${fullUrl} \n ${JSON.stringify({headers: headers})}`);

    return this.httpClient.get<T>(fullUrl,headers? { headers: headers }: {})
  }
}
