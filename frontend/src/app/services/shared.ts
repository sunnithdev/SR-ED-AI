import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Shared {

  repos = signal<any[]>([]);

  setRepos(list: any[]) {
    this.repos.set(list);
  }

  getRepos() {
    return this.repos();
  }
}

