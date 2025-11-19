import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-get-reports',
  imports: [DatePipe, RouterLink],
  templateUrl: './get-reports.html',
  styleUrl: './get-reports.scss',
})
export class GetReports {
reports: any[] = [];
  loading = true;

  private cdr = inject(ChangeDetectorRef);
  clerk = inject(ClerkService);

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    const user = await firstValueFrom(this.clerk.user$);

    if (!user) {
      this.loading = false;
      return;
    }

    console.log(user,"user ------");


    this.http.get('http://13.58.59.15/api/sred/list-reports', {
      headers: {
        "x-user-id": user?.id
      }
    })
  .subscribe({
    next: (res: any) => {
      this.reports = res.reports || [];
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Failed to load saved reports:", err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
  }
}
