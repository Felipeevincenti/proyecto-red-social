import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { GlobalService } from 'src/app/services/global.service';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { FollowService } from 'src/app/services/follow.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private globalService: GlobalService,
    private publicacionesService: PublicacionesService,
    public appComponent: AppComponent
  ) { };

  public url = this.globalService.URL;
  public token = localStorage.getItem('token');
  public userId = localStorage.getItem('id');

  public openImgModal = false;

  public resUsuario = {
    following: [] as any[],
    followers: [] as any[]
  }

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

  public listaPublicaciones: Array<any> = [];

  public text = "";
  public srcImg = "";

  public idDelete = "";

  public ngOnInit() {
    location.reload;
    this.profile();
    this.publicaciones();
  };

  public obtenerImagenAvatar(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.usuario.image = file;
    };
  };

  public profile() {
    this.counters();
    this.usuariosService.profile(this.userId).subscribe(
      res => {
        this.resUsuario = res;
        this.usuario = res.userProfile;
        this.appComponent.usuario.image = this.usuario.image;
        this.following();
        this.followers();
      },
      err => console.log(err)
    );
  };

  public following() {
    const users = [] as any[];
    if (this.resUsuario) {
      for (let i = 0; i < this.resUsuario.following.length; i++) {
        this.usuariosService.profile(this.resUsuario.following[i]).subscribe(
          res => {
            users.push(res);
            this.resUsuario.following = users;
          },
          err => console.log(err)
        )
      }
    }
  }

  public followers() {
    const users = [] as any[];
    if (this.resUsuario) {
      for (let i = 0; i < this.resUsuario.followers.length; i++) {
        this.usuariosService.profile(this.resUsuario.followers[i]).subscribe(
          res => {
            users.push(res);
            this.resUsuario.followers = users;
          }
        )
      }
    }
  }

  public subirImagenAvatar() {
    const formData = new FormData();
    if (this.usuario.image) {
      formData.append('file0', this.usuario.image);
    };
    this.usuariosService.upload(formData).subscribe(
      res => {
        this.usuario.image = res.user.image;
        location.reload();
      },
      err => console.log(err)
    );
  };

  public editarPerfil() {

    const errorNombre = document.getElementById('editarPerfil__error-name');
    const errorApellido = document.getElementById('editarPerfil__error-surname');
    const errorNick = document.getElementById('editarPerfil__error-nick');

    function contarLetras(palabra: any) {
      const letras = palabra.length;
      return letras;
    };

    function contarPalabras(palabras: any) {
      const palabraSinEspacios = palabras.trim();
      const cantidadPalabrasArray = palabraSinEspacios.split(/\s+/);
      const cantidadPalabras = cantidadPalabrasArray.length;
      return cantidadPalabras;
    };

    function mostrarError(condicion: any, span: any) {
      if (condicion) {
        if (span) {
          (span as HTMLElement).style.display = "block"
        }
        return
      };
      (span as HTMLElement).style.display = "none";
    }


    mostrarError(contarPalabras(this.usuario.name) > 2, errorNombre);
    mostrarError(contarPalabras(this.usuario.surname) > 2, errorApellido);
    mostrarError(contarLetras(this.usuario.nick) < 4 || contarLetras(this.usuario.nick) > 20, errorNick);



    this.usuariosService.update(this.usuario).subscribe(
      res => location.reload(),
      err => console.log(err)
    )
  }

  public abrirModal(event: any) {

    const main = document.getElementById("main");
    const cambiarImgModal = document.getElementById("cambiarImg-modal");
    const editarPerfilModal = document.getElementById("editarPerfil-modal");
    const crearPublicacionModal = document.getElementById("crearPublicacion-modal");
    const infoImgModal = document.getElementById("infoImagen-modal");
    const followingModal = document.getElementById("following-modal");
    const followersModal = document.getElementById("followers-modal");

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

    if (cambiarImgModal && editarPerfilModal && crearPublicacionModal && infoImgModal && followingModal && followersModal && main) {
      window.scroll(0, 0)
      document.body.style.overflow = "hidden";
      main.style.filter = "blur(10px)";

      switch (event.target.classList.value) {
        case "info__cambiarImg": cambiarImgModal.style.display = "flex";
          break;

        case "info__editar": editarPerfilModal.style.display = "flex";
          break;

        case "publicaciones__nueva": crearPublicacionModal.style.display = "flex";
          break;

        case "publicaciones__publicacion": infoImgModal.style.display = "flex";
          break;

        case "info__data info__data-following": followingModal.style.display = "flex";
          break;

        case "info__data info__data-followers": followersModal.style.display = "flex";
          break;

        default:
          break;
      }
    }
  };

  public abrirModalPublicacion(publication: any) {
    const main = document.getElementById("main");
    const infoImgModal = document.getElementById("infoImagen-modal");

    if (infoImgModal && main) {
      this.text = publication.text;
      this.srcImg = publication.file;
      this.idDelete = publication._id;
      window.scroll(0, 0)
      document.body.style.overflow = "hidden";
      main.style.filter = "blur(10px)";
      infoImgModal.style.display = "flex";
    }
  };

  public cerrarModal(event: any) {
    const main = document.getElementById("main");

    const cambiarImgModal = document.getElementById("cambiarImg-modal");
    const editarPerfilModal = document.getElementById("editarPerfil-modal");
    const crearPublicacionModal = document.getElementById("crearPublicacion-modal");
    const infoImgModal = document.getElementById("infoImagen-modal");
    const confirmar = document.getElementById("confirmar__eliminacion");
    const followingModal = document.getElementById("following-modal");
    const followersModal = document.getElementById("followers-modal");

    const inputFile = document.getElementById("cambiarImg__input");

    if (event.target.classList != "icon__close" && event.target.classList != "icon__close edit__profile" && inputFile instanceof HTMLInputElement && inputFile.files && inputFile.files.length === 0) {
      return;
    }

    if (event.target.classList == "icon__close edit__profile") {
      this.profile()
    }

    if (cambiarImgModal && editarPerfilModal && crearPublicacionModal && infoImgModal && confirmar && followingModal && followersModal && main) {
      this.srcImg = "";
      this.idDelete = "";
      document.body.style.overflow = "auto";
      cambiarImgModal.style.display = "none";
      editarPerfilModal.style.display = "none";
      crearPublicacionModal.style.display = "none";
      infoImgModal.style.display = "none";
      confirmar.style.display = "none";
      followingModal.style.display = "none";
      followersModal.style.display = "none";
      main.style.filter = "blur(0px)";
    }
  };

  public counters() {
    this.usuariosService.counters().subscribe(
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

  public crearPublicacion() {

    const formData = new FormData();

    if (this.infoPublicacion.image != "default.png") {
      formData.append('file0', this.infoPublicacion.image);
      this.publicacionesService.savePublication(this.infoPublicacion).subscribe(
        res => {
          const publicacionId = res.publicationStored._id;
          this.publicacionesService.upload(publicacionId, formData).subscribe(
            res => {
              this.infoPublicacion.image = res.publicationUpdated.file;
              location.reload();
            },
            err => console.log(err)
          );

        },
        err => console.log(err)
      )
    }
  };

  public borrarPublicacion(event: any) {
    if (event) {
      this.publicacionesService.deletePublication(this.idDelete).subscribe(
        res => location.reload(),
        err => console.log(err)
      )
    } else {

      const confirmar = document.getElementById("confirmar__eliminacion");

      if (confirmar) {
        confirmar.style.display = "none";
      };
    }
  }

  public deseasEliminar() {
    const confirmarEliminacion = document.getElementById("confirmar__eliminacion");
    if (confirmarEliminacion && !this.openImgModal) {
      confirmarEliminacion.style.display = "flex";
      this.openImgModal = true;
    }
    else if (confirmarEliminacion && this.openImgModal) {
      confirmarEliminacion.style.display = "none";
      this.openImgModal = false;
    }
  }

  public publicaciones() {
    this.publicacionesService.publications(this.userId).subscribe(
      res => this.listaPublicaciones = res.publications,
      err => console.log(err)
    );
  };

  public verPerfil(id: any) {
    this.router.navigate([`/profileSearch/${id}`]);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.appComponent.desplegado = false;
  };

};
