import { Component } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { GlobalService } from 'src/app/services/global.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    public usuariosService: UsuariosService,
    private router: Router,
    private globalService: GlobalService
  ) { }


  public url = this.globalService.URL;
  public token = localStorage.getItem('token');
  public userId = localStorage.getItem('id');
  public desplegado = false;

  public usuario = {
    name: "",
    surname: "",
    nick: "",
    bio: "",
    image: ""
  }

  public onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.usuario.image = file;
    };
  };

  public subirImagen() {
    const formData = new FormData();
    if (this.usuario.image) {
      formData.append('file0', this.usuario.image);
    };
    this.usuariosService.upload(formData).subscribe(
      res => this.usuario.image = res.user.image,
      err => console.log(err)
    );
  };

  public logOut() {
    this.usuariosService.logOut();
    const usuarioVacio = this.usuariosService.vaciarUsuario(this.usuario);
    this.usuario = usuarioVacio;
  };

  public desplegar() {
    if (this.desplegado == false) this.desplegado = true;
    else this.desplegado = false;
  }

  public cerrar() {
    this.desplegado = false;
  }
}
