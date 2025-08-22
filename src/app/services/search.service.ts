import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SearchConfig {
  placeholder: string;
  searchFunction: (query: string) => void;
  isVisible: boolean;
  showResultsDropdown: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchConfigSubject = new BehaviorSubject<SearchConfig>({
    placeholder: 'Search...',
    searchFunction: () => {},
    isVisible: false,
    showResultsDropdown: false
  });

  public searchConfig$ = this.searchConfigSubject.asObservable();

  setSearchConfig(config: SearchConfig) {
    this.searchConfigSubject.next(config);
  }

  clearSearch() {
    this.searchConfigSubject.next({
      placeholder: 'Search...',
      searchFunction: () => {},
      isVisible: false,
      showResultsDropdown: false
    });
  }
}
