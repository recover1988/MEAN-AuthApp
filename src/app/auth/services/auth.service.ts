import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthResponse, Usuario } from '../interfaces/interface';
import { catchError, map, tap } from "rxjs/operators";
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.baseUrl;
  private _usuario!: Usuario;


  get usuario() {
    return { ...this._usuario };
  }



  login(email: string, password: string) {
    const url = `${this.baseUrl}/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>(url, body)
      .pipe(
        tap(resp => {
          localStorage.setItem('token', resp.token!);
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


  validarToken() {
    const url = `${this.baseUrl}/auth/renew`;
    const headers = new HttpHeaders()
      .set('x-token', localStorage.getItem('token') || '');

    return this.http.get(url, { headers })
  }

  constructor(
    private http: HttpClient
  ) { }
}
