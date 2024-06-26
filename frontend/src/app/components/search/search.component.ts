import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import { FollowService } from 'src/app/services/follow.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(
    private router: Router,
    private globalService: GlobalService,
    private usuariosService: UsuariosService,
    public appComponent: AppComponent
  ) { };

  ngOnInit(): void {
    this.profile();
    this.profiles();
  }

  public url = this.globalService.URL;
  public userId = localStorage.getItem('id');

  public listaUsuarios: Array<any> = [];

  public listaBusqueda: Array<any> = [];

  public nombreUsuario = "";

  public nickUsuario = "";

  public infoUsuario = {
    bio: '',
    nick: '',
    role: '',
    image: 'default.png'
  }

  public follows = {
    followed: 0,
    following: 0
  }

  public busqueda = "";

  public followed = "";

  public listaPublicaciones: Array<any> = [];

  public profile() {
    this.usuariosService.profile(this.userId).subscribe(
      res => {
        this.nombreUsuario = res.userProfile.name;
        this.nickUsuario = res.userProfile.nick;
        this.appComponent.usuario.image = res.userProfile.image;
      },
      err => console.log(err)
    );
  };

  public verPerfil(id: any) {
    this.router.navigate([`/profileSearch/${id}`]);
  };

  public profiles() {
    this.usuariosService.profiles().subscribe(
      res => this.listaUsuarios = res.usersProfiles,
      err => console.log(err)
    )
  };

  public buscarUsuario() {
    if (this.busqueda != "") {
      this.usuariosService.searchUser(this.busqueda.replace(/ /g, "+")).subscribe(
        res => {
          if (res.users) {
            for (const user of res.users) {
              if (user.nick != this.nickUsuario) {
                this.listaBusqueda = res.users;
              }
            }
          }
        },
        err => this.listaBusqueda = []
      );
    }
    this.listaBusqueda = [];
  }

};
