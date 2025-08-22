import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/Profile.model';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private profileService: ProfileService) {}

  setUser(user: User) {
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getUserId(): string {
    const user = this.userSubject.value;
    return user?.id || '';
  }


  clearUser() {
    this.userSubject.next(null);
  }

  fetchAndSetCurrentUser(): Observable<User> {
    return new Observable(observer => {
      this.profileService.getCurrentUser().subscribe({
        next: (user) => {
          this.setUser(user);
          observer.next(user);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }
}
