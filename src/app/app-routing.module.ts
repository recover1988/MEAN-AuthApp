import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { validarTokenCanActivateFn, validarTokenCanMatchFn } from './guards/index.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./protected/protected.module').then(m => m.ProtectedModule),
    canActivate: [validarTokenCanActivateFn],
    canMatch: [validarTokenCanMatchFn],
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
