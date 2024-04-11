import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './global.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private globalService: GlobalService,
  ) { }

  public token = localStorage.getItem('token');
  public headers = new HttpHeaders({ 'authorization': `${this.token}` });

  public vaciarUsuario(usuario: any) {
    usuario = {
      name: '',
      surname: '',
      bio: '',
      nick: '',
      email: '',
      password: '',
      role: '',
      image: 'default.png'
    };
    return usuario;
  };

  public registrarUsuario(usuario: any) {
    return this.http.post<any>(`${this.globalService.URL}/user/register`, usuario);
  };

  public login(usuario: any) {
    return this.http.post<any>(`${this.globalService.URL}/user/login`, usuario);
  };

  public profile(id: any) {
    return this.http.get<any>(`${this.globalService.URL}/user/profile/${id}`, { headers: this.headers });
  };

  public profiles() {
    return this.http.get<any>(`${this.globalService.URL}/user/profiles`, { headers: this.headers });
  };

  public update(newData: any) {
    return this.http.put<any>(`${this.globalService.URL}/user/update`, newData, { headers: this.headers });
  };

  public delete(id: any) {
    return this.http.delete<any>(`${this.globalService.URL}/user/delete/${id}`, { headers: this.headers });
  };

  public logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
  };

  public loggedIn() {
    return !!localStorage.getItem('token');
  };

  public upload(file: object) {
    return this.http.post<any>(`${this.globalService.URL}/user/upload`, file, { headers: this.headers });
  };

  public counters() {
    return this.http.get<any>(`${this.globalService.URL}/user/counters`, { headers: this.headers });
  };

  public searchCounters(id: any) {
    return this.http.get<any>(`${this.globalService.URL}/user/counters/${id}`, { headers: this.headers });
  };

  public searchUser(busqueda: any) {
    return this.http.get<any>(`${this.globalService.URL}/user/buscar/${busqueda}`, { headers: this.headers });
  };
}