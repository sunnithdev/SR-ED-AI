import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.html',
  imports: [DecimalPipe, DatePipe],
  styleUrls: ['./report-view.scss']
})
export class ReportView implements OnInit {

  loading = true;
  report: any = null;

  ngOnInit() {
    this.report = history.state.report;

    if (!this.report) {
      console.error("No report found in navigation state.");
    }

    this.loading = false;
  }

  openCommit(repoUrl: string, sha: string) {
    const url = `${repoUrl}/commit/${sha}`;
    window.open(url, "_blank");
  }
}
