import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Github } from '../../services/github';
import { Ai } from '../../services/ai';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-commits',
  imports: [DatePipe, FormsModule],
  templateUrl: './commits.html',
  styleUrl: './commits.scss',
})
export class Commits {

  github = inject(Github);
  ai = inject(Ai);
  clerk = inject(ClerkService);

  private cdr = inject(ChangeDetectorRef);

  constructor(private route: ActivatedRoute) {}

  repoName: string | null = null;
  selectedRepo: string | null = null;
  commits: any[] | null = null;
  loading: boolean = false;

  classified: any[] | null = null;
  selectedForReport: { [sha: string]: boolean } = {};
  loadingAI = false;

  timeline: string | null = null;
  generatingTimeline = false;

  reportReady = false;
  savingReport = false;

  ngOnInit(): void {
    this.repoName = this.route.snapshot.paramMap.get('repoName')!;
    console.log('Repo Name:', this.repoName);
    this.loadCommits(this.repoName);
  }

  async loadCommits(fullRepoName: string) {
    try {
      this.loading = true;
      this.selectedRepo = fullRepoName;
      const [owner, repo] = fullRepoName.split("/");

      console.log("Fetching commits for:", owner, repo);

      const result = await this.github.loadCommits(owner, repo);
      this.commits = result;

      console.log("Loaded commits:", this.commits);

      this.cdr.detectChanges();

    } catch (err) {
      console.error("Failed to load commits:", err);
      alert("Failed to load commits.");
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async analyzeCommits() {
    if (!this.commits) return;

    try {
      this.loadingAI = true;
      this.cdr.detectChanges();

      const result = await this.ai.classifyCommits(this.commits) as any;

      const commits: any[] = Array.isArray(result)
        ? result
        : (result?.commits || result?.results) ?? [];

      this.classified = commits.filter(c => c.isSRED);

      if (this.classified.length === 0) {
      alert('ℹ️ No SR&ED-eligible commits found in this analysis.');
      this.cdr.detectChanges();
      return;
    }

      this.classified.forEach(c => {
        this.selectedForReport[c.sha] = true;
      });

      this.cdr.detectChanges();

    } catch (err) {
      console.error("AI classification failed:", err);
      alert("AI classification failed.");
    } finally {
      this.loadingAI = false;
      this.cdr.detectChanges();
    }
  }

  toggleCommitSelection(sha: string, event: any) {
    this.selectedForReport[sha] = event.target.checked;
  }

  openDiff(commitUrl: string) {
    window.open(commitUrl, "_blank");
  }

  async generateTimeline() {
    if (!this.classified) return;

    try {
      this.generatingTimeline = true;
      this.cdr.detectChanges();

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
      this.cdr.detectChanges();
      this.reportReady = true;

    } catch (err) {
      console.error("Timeline generation failed:", err);
      alert("Timeline generation failed.");
    } finally {
      this.generatingTimeline = false;
      this.cdr.detectChanges();
    }
  }

async saveReport() {
  if (!this.reportReady) return alert("No report ready to save.");

  this.savingReport = true;
  this.cdr.detectChanges();

  try {
    const selectedCommits = this.classified?.filter(
      (c) => this.selectedForReport[c.sha]
    ) ?? [];

    if (selectedCommits.length === 0) {
      alert("Select at least one SR&ED commit.");
      return;
    }

    // Get user object from Clerk
    const user = await firstValueFrom(this.clerk.user$);

    if (!user) {
      alert("User not logged in.");
      return;
    }

    // Extract repo owner + repo
    const [repoOwner, repoName] = (this.selectedRepo ?? "").split("/");

    const body = {
      userId: user.id,                                 // Clerk user ID
      repoName,
      repoOwner,
      repoUrl: `https://github.com/${repoOwner}/${repoName}`,
      sredCommits: selectedCommits,
      detailedReport: this.timeline,
    };

    await this.ai.saveReportApi(body);

    alert("SR&ED Report saved!");

  } catch (err) {
    console.error("Save report failed:", err);
    alert("Failed to save report.");
  } finally {
    this.savingReport = false;
    this.cdr.detectChanges();
  }
}


}
