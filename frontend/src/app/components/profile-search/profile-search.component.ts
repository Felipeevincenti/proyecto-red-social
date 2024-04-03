import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { AppComponent } from 'src/app/app.component';
import { FollowService } from 'src/app/services/follow.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-profile-search',
  templateUrl: './profile-search.component.html',
  styleUrls: ['./profile-search.component.css']
})
export class ProfileSearchComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private usuariosService: UsuariosService,
    private publicacionesService: PublicacionesService,
    private followService: FollowService,
    private appComponent: AppComponent
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    this.profile(this.id);
    this.following();
    this.followers()
    this.publicaciones();
    location.reload;
  }

  public url = this.globalService.URL;
  public id = "";
  public userId = localStorage.getItem('id');
  public listaPublicaciones: Array<any> = [];
  public iFollow = false;
  public followYou = false;

  public usuario = {
    name: '',
    surname: '',
    bio: '',
    nick: '',
    role: '',
    image: 'default.png'
  }

  public follows = {
    followed: 0,
    following: 0
  }

  public infoPublicacion = {
    text: '',
    image: 'default.png'
  }

  public userFollowed = {
    followed: ""
  }

  public srcImg = "";

  public profile(id: any) {
    this.usuariosService.profile(this.userId).subscribe(
      res => {
        this.appComponent.usuario.image = res.userProfile.image;
      },
      err => console.log(err)
    );
    this.usuariosService.profile(id).subscribe(
      res => {
        this.usuario = res.userProfile;
      },
      err => console.log(err)
    );
    this.counters();
  };

  public obtenerImagenAvatar(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.usuario.image = file;
    };
  };

  public counters() {
    this.usuariosService.searchCounters(this.id).subscribe(
      res => {
        this.follows.followed = res.followed;
        this.follows.following = res.following;
      },
      err => console.log(err)
    );
  };

  public obtenerImagenPublicacion(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.infoPublicacion.image = file;
    };
  };

  public publicaciones() {
    this.publicacionesService.publications(this.id).subscribe(
      res => this.listaPublicaciones = res.publications,
      err => console.log(err)
    );
  };

  public follow() {
    this.userFollowed.followed = this.id;
    this.followService.follow(this.userFollowed).subscribe(
      res => location.reload(),
      err => console.log(err)
    )
  }

  public unFollow() {
    this.followService.unFollow(this.id).subscribe(
      res => location.reload(),
      err => console.log(err)
    )
  }

  public following() {
    this.followService.following(this.userId).subscribe(
      res => {
        // Verifica si el ID que quieres está en el array res.userFollowMe
        if (res.userFollowing.includes(this.id)) {
          this.iFollow = true;
        } else {
          this.iFollow = false;
        }
      },
      err => console.log(err)
    )
  }

  public followers() {
    this.followService.followers(this.userId).subscribe(
      res => {
        if (res.userFollowMe.includes(this.id)) {
          this.followYou = true;
        } else {
          this.followYou = false;
        }
      },
      err => console.log(err)
    )
  }

  public abrirModal(event: any) {
    const main = document.getElementById("main");
    const infoImgModal = document.getElementById("infoImagen-modal");

    const target = event.target as HTMLImageElement;

    if (target.classList.value == "publicaciones__publicacion") {
      const children = target.children;
      const child = children[0] as HTMLImageElement;
      if (child.tagName === 'IMG') {
        const src = child.src;
        this.srcImg = src;
      }
    }

    else if (target.tagName === 'IMG') {
      const src = target.src;
      this.srcImg = src;
    }

    if (infoImgModal && main) {
      window.scroll(0, 0)
      document.body.style.overflow = "hidden";
      main.style.filter = "blur(10px)";

      if (event.target.classList.value == "publicaciones__publicacion" || event.target.classList.value == "publicaciones__publicacion-img") {
        infoImgModal.style.display = "flex";
      }
    }
  };



  public abrirModalPublicacion(publication: any) {
    const main = document.getElementById("main");
    const infoImgModal = document.getElementById("infoImagen-modal");

    if (infoImgModal && main) {
      this.srcImg = publication.file;
      window.scroll(0, 0)
      document.body.style.overflow = "hidden";
      main.style.filter = "blur(10px)";
      infoImgModal.style.display = "flex";
    }
  };

  public cerrarModal(event: any) {

    const main = document.getElementById("main");
    const infoImgModal = document.getElementById("infoImagen-modal");
    this.srcImg = "";

    if (event.target.classList != "icon__close") {
      return;
    };

    if (infoImgModal && main) {
      this.srcImg = "";
      document.body.style.overflow = "auto";
      infoImgModal.style.display = "none";
      main.style.filter = "blur(0px)";
    }

    else if (infoImgModal && main) {
      this.profile(this.id);
      document.body.style.overflow = "auto";
      infoImgModal.style.display = "none";
      main.style.filter = "blur(0px)";
    };

  };


  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.appComponent.desplegado = false;
  };

}
