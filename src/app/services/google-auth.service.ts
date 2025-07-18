// import { Injectable } from '@angular/core';
// import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';
//
//
// @Injectable({
//   providedIn: 'root'
// })
// export class GoogleAuthService {
//   private apiUrl = environment.apiUrl; // Your backend URL
//
//   constructor(
//     private socialAuthService: SocialAuthService,
//     private http: HttpClient
//   ) {}
//
//   signInWithGoogle(): Promise<SocialUser> {
//     return this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
//   }
//
//   signOut(): Promise<void> {
//     return this.socialAuthService.signOut();
//   }
//
//   sendTokenToBackend(idToken: string): Observable<any> {
//     return this.http.post(`${this.apiUrl}/auth/google`, {
//       idToken: idToken
//     });
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendTokenToBackend(idToken: string, role?: string): Observable<any> {
    const apiUrl = window.location.hostname === 'localhost'
      ? 'https://localhost:7045/api/Auth/google'
      : 'https://akelni.tryasp.net/api/Auth/google';

    return this.http.post(apiUrl, {
      Provider: "Google",
      IdToken: idToken, // Correct casing
      Role: role || 'Customer' // Correct casing
    });
  }
}
