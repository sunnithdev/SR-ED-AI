import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ClerkService, ClerkSignInComponent, ClerkUserButtonComponent } from 'ngx-clerk';
import { Auth } from './services/auth';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Github } from './services/github';
import { Ai } from './services/ai';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  imports: [ClerkSignInComponent, ClerkUserButtonComponent, AsyncPipe, DatePipe, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
  clerk = inject(ClerkService);
  authService = inject(Auth);
  github = inject(Github);
  ai = inject(Ai);

  publicRepoUrl: string = "";

  classified: any[] | null = null;
  selectedForReport: { [sha: string]: boolean } = {};
  loadingAI = false;


  repos: any[] | null = null;
  selectedRepo: string | null = null;
  commits: any[] | null = null;


  timeline: string | null = null;
  generatingTimeline = false;



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
    } catch (err) {
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
      alert("Failed to load commits.");
    }
  }

  async analyzeCommits() {
    if (!this.commits) return;

    try {
      this.loadingAI = true;
      const result = await this.ai.classifyCommits(this.commits) as any;

      const commits: any[] = Array.isArray(result)
        ? result
        : result?.commits ?? [];

      this.classified = commits.filter(c => c.isSRED);

      this.classified.forEach(c => {
        this.selectedForReport[c.sha] = true;
      });

    } catch (err) {
      alert("AI classification failed.");
    } finally {
      this.loadingAI = false;
    }
  }

  openDiff(commitUrl: string) {
  window.open(commitUrl, "_blank");
}

  async generateTimeline() {
    if (!this.classified) return;

    try {
      this.generatingTimeline = true;

      // Filter only commits user kept
      const selectedCommits = this.classified.filter(
        (c) => this.selectedForReport[c.sha]
      );

      if (selectedCommits.length === 0) {
        alert("Select at least one commit for the SR&ED timeline.");
        return;
      }

      const result = await this.ai.generateTimeline(
        selectedCommits,
        "My SR&ED Project",
        this.selectedRepo || undefined
      );


      this.timeline = result.report;

    } catch (err) {
      console.error("Timeline generation failed", err);
      alert("Timeline generation failed.");
    } finally {
      this.generatingTimeline = false;
    }
  }

}
