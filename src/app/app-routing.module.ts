import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { ValidarTokenGuard } from './guards/validar-token.guard';
import { validarTokenGuardFn } from './guards/index.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./protected/protected.module').then(m => m.ProtectedModule),
    canActivate: [validarTokenGuardFn],
    canMatch: [validarTokenGuardFn],
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
