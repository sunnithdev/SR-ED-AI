import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Ai {
private http = inject(HttpClient);
  private clerk = inject(ClerkService);

  backend = 'http://localhost:4000/api/ai';

  private async getJwt(): Promise<string | null> {
    const clerkInstance = await firstValueFrom(this.clerk.clerk$);
    if (!clerkInstance?.session) return null;
    return await clerkInstance.session.getToken();
  }

  // CLASSIFY COMMITS
  async classifyCommits(commits: any[]) {
    const jwt = await this.getJwt();
    if (!jwt) throw new Error("JWT missing");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwt}`
    });

    return await firstValueFrom(
      this.http.post<any[]>(`${this.backend}/classify-commits`, { commits }, { headers })
    );
  }

  async generateTimeline(commits: any[], projectName?: string, repo?: string) {
  const jwt = await this.getJwt();
  if (!jwt) throw new Error("JWT missing");

  const headers = new HttpHeaders({
    Authorization: `Bearer ${jwt}`
  });

  return await firstValueFrom(
    this.http.post<{ report: string }>(
      `${this.backend}/generate-timeline`,
      { commits, projectName, repo },
      { headers }
    )
  );
}

}
