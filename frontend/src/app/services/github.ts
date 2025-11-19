import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Github {
private http = inject(HttpClient);
  private clerk = inject(ClerkService);

  backend = 'http://13.58.59.15/api/github';

  // Fetch JWT from Clerk
  private async getJwt(): Promise<string | null> {
    const clerkInstance = await firstValueFrom(this.clerk.clerk$);
    if (!clerkInstance || !clerkInstance.session) return null;
    return await clerkInstance.session.getToken();
  }

  // Load GitHub repositories
  async loadRepos() {
    const jwt = await this.getJwt();
    if (!jwt) throw new Error("No Clerk JWT available");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`,
    });

    return await firstValueFrom(
      this.http.get<{ repos: any[] }>(`${this.backend}/repos`, { headers })
    );
  }

  async loadCommits(owner: string, repo: string) {
  const jwt = await this.getJwt();
  if (!jwt) throw new Error("No Clerk JWT available");

  const headers = new HttpHeaders({
    Authorization: `Bearer ${jwt}`,
  });

  return await firstValueFrom(
    this.http.get<any[]>(
      `${this.backend}/commits/${owner}/${repo}`,
      { headers }
    )
  );
}

}
