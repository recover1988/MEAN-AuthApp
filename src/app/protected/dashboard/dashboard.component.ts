import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent {
  logout() {

    this.router.navigateByUrl('/auth/login');
  }


  constructor(private router: Router) { }
}
