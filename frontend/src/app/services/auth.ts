import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private clerk = inject(ClerkService);
  private backendBaseUrl = 'http://13.58.59.15';

  async syncUserWithBackend() {
    const clerkInstance = await firstValueFrom(this.clerk.clerk$);
    const jwt = await clerkInstance?.session?.getToken();

    if (!jwt) {
      console.error('No valid Clerk session or JWT available');
      return;
    }

    return firstValueFrom(
      this.http.post<{
      message: string;
      user: any;
    }>(`${this.backendBaseUrl}/api/auth/sync`, {}, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
    );
  }
}
