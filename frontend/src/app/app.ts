import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ClerkService, ClerkSignInComponent, ClerkUserButtonComponent } from 'ngx-clerk';
import { Auth } from './services/auth';
import { AsyncPipe } from '@angular/common';
import { Github } from './services/github';
import { FormsModule } from '@angular/forms';
import { Shared } from './services/shared';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [ClerkSignInComponent, ClerkUserButtonComponent, AsyncPipe, FormsModule, RouterOutlet, RouterLink],
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
        alert('GitHub connected successfully!');
        // Clean up URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      }

      if (params['error']) {
        alert(`Connection failed: ${params['error']}`);
        // Clean up URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      }


    });

    this.clerk.user$.subscribe(async (user) => {
  if (user && !this.synced) {
    this.synced = true;

    try {
      const result = await this.authService.syncUserWithBackend();

      const backendUser = result?.user;

      if (backendUser?.github?.accessToken) {
        this.githubConnected = true;
      }

    } catch (err) {
      console.error("Sync error", err);
    }
  }
});
  }

async connectGitHub() {
  // Wait for Clerk to be fully loaded
  await window.Clerk.load();

  // Now get the session token
  const token = await window.Clerk.session?.getToken();

  if (!token) {
    console.error('No Clerk session found');
    return;
  }

  // Now redirect with token in URL or make authenticated request
  window.location.href = `${this.backend}/api/github/authorize`;
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
