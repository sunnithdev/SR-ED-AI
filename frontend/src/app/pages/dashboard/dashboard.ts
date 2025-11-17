import { Component, inject } from '@angular/core';
import { Github } from '../../services/github';
import { Router, RouterModule } from '@angular/router';
import { Shared } from '../../services/shared';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  github = inject(Github);
  shared = inject(Shared);

  repos: any[] | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    console.log("DASHBOARD LOADED!");
    this.repos = this.shared.getRepos();
  }

 openCommits(repoName: string) {
  console.log("opencommits called", repoName);

    this.router.navigate(['/commits', repoName]);
  }

}
