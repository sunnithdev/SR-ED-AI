import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private clerk = inject(ClerkService);

  private backendBaseUrl = 'http://localhost:4000';

  // Call this once after login to sync user with backend
  async syncUserWithBackend() {
    const clerkInstance = await firstValueFrom(this.clerk.clerk$);
    if (!clerkInstance || !clerkInstance.session) {
      console.error('No Clerk session available for backend sync');
      return;
    }

    const jwt = await clerkInstance.session.getToken();
    if (!jwt) {
      console.error('Failed to get Clerk JWT for backend sync');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`,
    });

    return this.http
      .post(`${this.backendBaseUrl}/api/auth/sync`, {}, { headers })
      .toPromise();
  }
};
