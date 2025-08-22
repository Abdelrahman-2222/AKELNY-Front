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

    let path = url;
    if (!isAbsolute && !url.startsWith(base)) {
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      path = `${base}${normalizedUrl}`;
    }

    const fullUrl = query ? `${path}?${query}` : path;
    return this.httpClient.get<T>(fullUrl, headers ? { headers } : {});
  }
}
