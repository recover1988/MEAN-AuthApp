import { CanActivateFn, CanMatchFn, Router } from "@angular/router";
import { AuthService } from "../auth/services/auth.service";
import { inject } from "@angular/core";
import { tap } from 'rxjs/operators';

export const validarTokenCanActivateFn: CanActivateFn = () => {

  const router = inject(Router);
  const authService = inject(AuthService)

  return authService.validarToken()
    .pipe(
      tap(valid => {
        if (!valid) {
          router.navigateByUrl('./auth/login')
        }
      })
    )
}

export const validarTokenCanMatchFn: CanMatchFn = () => {

  const router = inject(Router);
  const authService = inject(AuthService)

  return authService.validarToken()
    .pipe(
      tap(valid => {
        if (!valid) {
          router.navigateByUrl('./auth/login')
        }
      })
    )
}


