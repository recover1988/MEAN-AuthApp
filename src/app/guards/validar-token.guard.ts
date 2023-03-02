import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ValidarTokenGuard implements CanActivate, CanMatch {
  canActivate(): Observable<boolean> | boolean {
    return this.authService.validarToken()
      .pipe(
        tap(valid => {
          if (!valid) {
            this.router.navigateByUrl('./auth/login')
          }
        })
      );
  }


  canMatch(): Observable<boolean> | boolean {
    return this.authService.validarToken()
      .pipe(
        tap(valid => {
          if (!valid) {
            this.router.navigateByUrl('./auth/login')
          }
        })
      );
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
}
