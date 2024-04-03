import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  constructor(
    private http: HttpClient,
    private globalService: GlobalService
  ) { }

  public token = localStorage.getItem('token');
  public headers = new HttpHeaders({ 'authorization': `${this.token}` });

  public follow(followed: any) {
    return this.http.post<any>(`${this.globalService.URL}/follow/follow`, followed, { headers: this.headers });
  };

  public unFollow(unfollowId: any) {
    return this.http.delete<any>(`${this.globalService.URL}/follow/unfollow/${unfollowId}`, { headers: this.headers });
  };

  public following(id: any) {
    return this.http.get<any>(`${this.globalService.URL}/follow/following/${id}`, { headers: this.headers });
  };

  public followers(id: any) {
    return this.http.get<any>(`${this.globalService.URL}/follow/followers/${id}`, { headers: this.headers });
  };

};
