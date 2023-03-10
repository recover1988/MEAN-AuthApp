# AuthApp

Este es un breve listado de los temas fundamentales:

## Rutas y lazyload

Rutas desde el `componente`

```
// app/auth/auth-routing.module.ts

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'registro', component: RegisterComponent },
      { path: '**', redirectTo: 'login' },
    ]
  }
];
```

Rutas cargadas al `root`

```
// app/app-routing.modules.ts

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./protected/protected.module').then(m => m.ProtectedModule)
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
```

## Formulario Reactivos

Importar el ReactiveFormModule.

```
// auth/auth.module.ts

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    MainComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
```

Crearse el formulario del lado del componente.

```
// pages/login/login.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
  ]
})
export class LoginComponent {

  miFormulario: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  })



  constructor(private fb: FormBuilder) { }
}

```

Pare ello inyectamos el `FormBuilder`, luego creamos el controlador del formulario que es de tipo 'FormGroup' con `this.fb.group`, donde definimos los campos del formulario como el email, password.
Lo conectamos con el form del lado del HTML.

```
// pages/login/login.component.html

<form
  class="login100-form"
  autocomplete="off"
  [formGroup]="miFormulario"
  (ngSubmit)="login()"
>
  <span class="login100-form-title p-b-49"> Login </span>

  <div class="wrap-input100 m-b-23">
    <span class="label-input100">Email</span>
    <input
      class="input100"
      type="email"
      formControlName="email"
      placeholder="Ingrese su email"
    />
    <span class="focus-input100"></span>
  </div>
    .........
  </div>
</form>

```

Se conecta con el `[formGroup]="miFormulario"` en el form y luego cada campo con un `formControlName="'email"`.
Con el `(ngSubmit)="login()"` y el boton de `type:"submit"` ejecutamos el formulario.

El button deberia tener las siguientes propiedades `type="submit"` y `[disabled]="miFormulario.invalid"`

```
  <div class="container-login100-form-btn">
    <div class="wrap-login100-form-btn">
      <div class="login100-form-bgbtn"></div>
      <button
        class="login100-form-btn"
        type="submit"
        [disabled]="miFormulario.invalid"
      >
        Login
      </button>
    </div>
  </div>
```

## Conectar Angular con nuestro backend

Importar el `HttpClientModule` de `"@angular/common/http"` en el app.module.ts

```
// app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Crearse un servicio e inyectar el HttpClient para poder hacer las peticiones http

```
// app/auth/services/auth.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) { }
}
```

En el service crearce una funcion que retorna un `Observable` del tipo de la respuesta que esperamos.

```
  private baseUrl = environment.baseUrl;

  login(email: string, password: string) {
    const url = `${this.baseUrl}/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>(url, body);
  }

```

Para usarlo en el login hay que inyectar el servicio que creamos:

```
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService  <--
  ) { }
}
```

y lo podemos usar en la funcion del login:

```
  login() {
    const { email, password } = this.miFormulario.value;
    this.authService.login(email, password)
      .subscribe(resp => {
        console.log(resp)
      })
    // this.router.navigateByUrl('/dashboard')
  }

```

#### import { map } from "rxjs";

El map sirve para mutar y devolver un nuevo observable

```
  login(email: string, password: string) {
    const url = `${this.baseUrl}/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>(url, body)
      .pipe(
        tap(resp => {
          if (resp.ok) {
            this._usuario = {
              name: resp.name!,
              uid: resp.uid!,
              email
            }
          }
        }),
        map(resp => resp.ok),
        catchError(err => of(false))
      );
  }
```

Con el `tap` podemos realizamos efectos secundarios pero no modifican la respuesta.
En la funcion podemos observar que devuelve solo el `ok` del objeto y cuando se suscriban ya no devuelve toda la data como antes.
Cuando de error el `catchError` se activa y podemos enviar un `false` pero lo tenemos que transformar en un Observable con el `of`.
Con esta cadena de operadores `rxjs` nos aseguramos de obtener la informacion necesaria y devolver solo lo necesario.

## SweetAlert2

Instalamos el npm de `https://sweetalert2.github.io/#download`

```
npm install sweetalert2
```

Y lo usamos para enviar dinamicamente el error desde el backend:

```
 Swal.fire({
            title: 'Error!',
            text: ok,
            icon: 'error',
            confirmButtonText: 'Intente de Nuevo',

          })
```

## Manejo de JWT (Almacenar info del usuario)

Necesitamos guardar el token en el localStorage o SessionStorage cuando el usuario se logee, para eso en el servicio:

```
// auth.service.ts

  login(email: string, password: string) {
    const url = `${this.baseUrl}/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>(url, body)
      .pipe(
        tap(resp => {
          localStorage.setItem('token', resp.token!); <--
          if (resp.ok) {
            this._usuario = {
              name: resp.name!,
              uid: resp.uid!,
              email
            }
          }
        }),
        map(resp => resp.ok),
        catchError(err => of(err.error.msg))
      );
  }

```

Para revalidar el token tenemos que llamar en el servicio a una nueva funcion que envie el token que esta guardado en el LocalStorage o SessionStorage.

```
// auth.service.ts

  validarToken() {
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '');

    return this.http.get(url, { headers })
  }
```

## Guards

CanActivate y CanLoad estan deprecados para su uso en clases y ahora pide usar CanActivateFn y CanMatchFn que son funciones planas.

```
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

```

## Mantener el estado del usuario

Podemos usar el guard para validar el token y guardar los datos en this.\_usuario, asi si esta verificado podemo permitir entrar al dashboard

```
 validarToken(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '');

    return this.http.get<AuthResponse>(url, { headers })
      .pipe(
        map(resp => {
          localStorage.setItem('token', resp.token!);
          this._usuario = {
            name: resp.name!,
            uid: resp.uid!,
          }
          return resp.ok
        }),
        catchError(err => of(false))
      )
  }
```

## Hashear las rutas

La opcion de hasheo permite que las rutas de angular sean compatibles con servidores viejos.

```
// app/app-routing.module.ts

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

```

La opcion es `useHash:true`

## Generar versi??n de producci??n de Angular

## Desplegar nuestra app de Angular en nuestro backend de Node

## Desplegar el backend + frontend en Heroku

## Realizar actualizaciones por cambios en el Frontend o Backend

## Re-desplegar a Heroku

## Revisar logs en producci??n

# Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
