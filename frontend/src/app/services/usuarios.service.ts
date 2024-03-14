import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
  ) { }

  public registrarUsuario(usuario: any) {
    console.log("Desde el register");
    console.log(usuario);
    return this.http.post<any>(`${this.globalService.URL}/user/register`, usuario);
  }

  public login(usuario: any) {
    return this.http.post<any>(`${this.globalService.URL}/user/login`, usuario);
  }

  public profile(id: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'authorization': `${token}` });
    return this.http.get<any>(`${this.globalService.URL}/user/profile/${id}`, { headers: headers });
  }

  public logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
  }

  public loggedIn() {
    return !!localStorage.getItem('token');
  }

  public upload(file: object) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'authorization': `${token}` });
    return this.http.post<any>(`${this.globalService.URL}/user/upload`, file, { headers: headers });
  }

  // public avatar(filename: string) {
  //   return this.http.get<any>(`${this.globalService.URL}/user/avatar/${filename}`);
  // }
}