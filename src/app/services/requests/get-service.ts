import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type getRequest = {
  url: string;
  headers?: { [key: string]: string };
  query?: string;
}

@Injectable({
  providedIn: 'root'
})

export class GetService {
  httpClient = inject(HttpClient);
  constructor() {}

  get(request: getRequest):Observable<any> {
    const { url, headers, query } = request;
    const fullUrl = query ? `${url}?${query}` : url;
    console.log(`${fullUrl} \n ${JSON.stringify({headers: headers})}`);

    return this.httpClient.get(fullUrl,headers? { headers: headers }: {})
  }
}
