import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getRequest } from '../../models/Shared.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GetService {
  httpClient = inject(HttpClient);

  get<T>(request: getRequest): Observable<T> {
    const { url, headers, query } = request;

    const isAbsolute = /^https?:\/\//i.test(url);
    const base = environment.apiUrl;
    const path = isAbsolute
      ? url
      : `${base}${url.startsWith('/') ? '' : '/'}${url}`;

    const fullUrl = query ? `${path}?${query}` : path;

    // console.log(`${fullUrl} \n ${JSON.stringify({ headers })}`);
    return this.httpClient.get<T>(fullUrl, headers ? { headers } : {});
  }
}
