import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ClerkService, ClerkSignInComponent, ClerkUserButtonComponent } from 'ngx-clerk';
import { Auth } from './services/auth';
import { AsyncPipe } from '@angular/common';
import { Github } from './services/github';
import { FormsModule } from '@angular/forms';
import { Shared } from './services/shared';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [ClerkSignInComponent, ClerkUserButtonComponent, AsyncPipe, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
  clerk = inject(ClerkService);
  authService = inject(Auth);
  github = inject(Github);
  shared = inject(Shared);

  backend = 'http://localhost:4000';
  synced = false;
  repos: any[] | null = null;
  githubConnected = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clerk.__init({
      publishableKey: 'pk_test_c3RpbGwtZWZ0LTUyLmNsZXJrLmFjY291bnRzLmRldiQ', // your Clerk publishable key
    });
  }

  ngOnInit() {

    // Check for OAuth callback parameters
    this.route.queryParams.subscribe(params => {
      if (params['github'] === 'connected') {
        this.githubConnected = true;
        alert('🎉 GitHub connected successfully!');
        // Clean up URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      }

      if (params['error']) {
        alert(`❌ Connection failed: ${params['error']}`);
        // Clean up URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      }
    });

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
    alert('Jira connection not implemented yet');
  }

  async loadRepos() {
    try {
      const result = await this.github.loadRepos();
      this.repos = result.repos;
      this.shared.setRepos(result.repos);
      this.router.navigate(['dashboard']);
    } catch (err) {
      alert("Failed to load repos. Make sure GitHub is connected.");
    }
  }

}
