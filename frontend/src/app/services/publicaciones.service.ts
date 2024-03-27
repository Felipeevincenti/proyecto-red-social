import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {

  constructor(
    private http: HttpClient,
    private globalService: GlobalService
  ) { }

  public token = localStorage.getItem('token');
  public headers = new HttpHeaders({ 'authorization': `${this.token}` });

  public savePublication(data: any) {
    return this.http.post<any>(`${this.globalService.URL}/publication/save`, data, { headers: this.headers })
  }

  public publications(id: any) {
    return this.http.get<any>(`${this.globalService.URL}/publication/publications/${id}`, { headers: this.headers })
  }

  public upload(id: any, file: object) {
    return this.http.post<any>(`${this.globalService.URL}/publication/upload/${id}`, file, { headers: this.headers });
  }

}
