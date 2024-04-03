import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { GlobalService } from 'src/app/services/global.service';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { PublicacionesService } from 'src/app/services/publicaciones.service';

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
        this.usuario = res.userProfile;
        this.appComponent.usuario.image = this.usuario.image;
      },
      err => console.log(err)
    );
  };

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
    this.usuariosService.update(this.usuario).subscribe(
      res => console.log(res),
      err => console.log(err)
    )
  }

  public abrirModal(event: any) {
    console.log(event);
    const main = document.getElementById("main");
    const cambiarImgModal = document.getElementById("cambiarImg-modal");
    const editarPerfilModal = document.getElementById("editarPerfil-modal");
    const crearPublicacionModal = document.getElementById("crearPublicacion-modal");
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

    if (cambiarImgModal && editarPerfilModal && crearPublicacionModal && infoImgModal && main) {
      window.scroll(0, 0)
      document.body.style.overflow = "hidden";
      main.style.filter = "blur(10px)";

      if (event.target.classList.value == "info__cambiarImg") {
        cambiarImgModal.style.display = "flex";
      }
      if (event.target.classList.value == "info__editar") {
        editarPerfilModal.style.display = "flex";
      }
      if (event.target.classList.value == "publicaciones__nueva") {
        crearPublicacionModal.style.display = "flex";
      }
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
      console.log(publication);
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

    const inputFile = document.getElementById("cambiarImg__input");

    if (event.target.classList != "icon__close" && inputFile instanceof HTMLInputElement && inputFile.files && inputFile.files.length === 0) {
      return;
    };

    if (cambiarImgModal && editarPerfilModal && crearPublicacionModal && infoImgModal && main && event.target.classList.value == "editarPerfil__submit") {
      this.srcImg = "";
      this.idDelete = "";
      document.body.style.overflow = "auto";
      cambiarImgModal.style.display = "none";
      editarPerfilModal.style.display = "none";
      crearPublicacionModal.style.display = "none";
      infoImgModal.style.display = "none";
      main.style.filter = "blur(0px)";
    }

    else if (cambiarImgModal && editarPerfilModal && crearPublicacionModal && infoImgModal && main) {
      this.profile();
      document.body.style.overflow = "auto";
      cambiarImgModal.style.display = "none";
      editarPerfilModal.style.display = "none";
      crearPublicacionModal.style.display = "none";
      infoImgModal.style.display = "none";
      main.style.filter = "blur(0px)";
    };

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

  public borrarPublicacion() {
    this.publicacionesService.deletePublication(this.idDelete).subscribe(
      res => location.reload(),
      err => console.log(err)
    )
  }

  public publicaciones() {
    this.publicacionesService.publications(this.userId).subscribe(
      res => this.listaPublicaciones = res.publications,
      err => console.log(err)
    );
  };

  public opciones() {
    console.log("Opciones");
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.appComponent.desplegado = false;
  };

};
