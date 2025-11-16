import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ClerkService, ClerkSignInComponent, ClerkUserButtonComponent } from 'ngx-clerk';
import { Auth } from './services/auth';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Github } from './services/github';

@Component({
  selector: 'app-root',
  imports: [ClerkSignInComponent, ClerkUserButtonComponent, AsyncPipe, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
clerk = inject(ClerkService);
  authService = inject(Auth);
  github = inject(Github);

  repos: any[] | null = null;
  selectedRepo: string | null = null;
  commits: any[] | null = null;


  backend = 'http://localhost:4000';
  synced = false;

  constructor() {
    this.clerk.__init({
      publishableKey: 'pk_test_c3RpbGwtZWZ0LTUyLmNsZXJrLmFjY291bnRzLmRldiQ', // your Clerk publishable key
    });
  }

  ngOnInit() {
    // Auto-sync backend when user logs in
    this.clerk.user$.subscribe(async (user) => {
      if (user && !this.synced) {
        this.synced = true;
        try {
          await this.authService.syncUserWithBackend();
          console.log("✓ Synced with backend");
        } catch (err) {
          console.error("Sync error", err);
        }
      }
    });
  }

  connectGitHub() {
    window.location.href = `${this.backend}/api/integrations/github/authorize`;
  }

  connectJira() {
    window.location.href = `${this.backend}/api/integrations/jira/authorize`;
  }

  async loadRepos() {
    try {
      const result = await this.github.loadRepos();
      this.repos = result.repos;
      console.log("Loaded repos:", this.repos);
    } catch (err) {
      console.error("Error loading repos", err);
      alert("Failed to load repos. Make sure GitHub is connected.");
    }
  }

  async loadCommits(fullRepoName: string) {
  try {
    this.selectedRepo = fullRepoName;
    const [owner, repo] = fullRepoName.split("/");

    const result = await this.github.loadCommits(owner, repo);
    this.commits = result;

    console.log("Loaded commits:", this.commits);
  } catch (err) {
    console.error("Error loading commits", err);
    alert("Failed to load commits.");
  }
}

}
