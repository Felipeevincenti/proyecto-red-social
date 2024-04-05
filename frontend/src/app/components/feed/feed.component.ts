import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AppComponent } from 'src/app/app.component';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FollowService } from 'src/app/services/follow.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  constructor(
    private usuariosService: UsuariosService,
    private followService: FollowService,
    private router: Router,
    private globalService: GlobalService,
    private publicacionesService: PublicacionesService,
    public appComponent: AppComponent
  ) { };

  public url = this.globalService.URL;
  public token = localStorage.getItem('token');
  public userId = localStorage.getItem('id');

  public feedPublicaciones: Array<any> = []

  public follows = false;

  ngOnInit(): void {
    this.profile();
    this.feed();
    this.following();
  }

  public profile() {
    this.usuariosService.profile(this.userId).subscribe(
      res => {
        this.appComponent.usuario.image = res.userProfile.image;
      },
      err => console.log(err)
    );
  };

  public feed() {
    this.publicacionesService.feed().subscribe(
      res => {
        this.feedPublicaciones = res.publications;
      },
      err => console.log(err)
    );
  };

  public following() {
    this.followService.following(this.userId).subscribe(
      res => {
        if (res.follows.length > 0) {
          this.follows = true;
          console.log(this.follows);
        }
      }
    )
  }

  public verPerfil(id: any) {
    this.router.navigate([`/profileSearch/${id}`]);
  };

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.appComponent.desplegado = false;
  };

}
