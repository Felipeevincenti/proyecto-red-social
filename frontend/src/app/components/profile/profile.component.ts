import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public token = localStorage.getItem('token');
  public userId = localStorage.getItem('id');

  public usuario = {
    name: "",
    surname: "",
    nick: "",
    image: ""
  }

  public ngOnInit() {
    this.profile()
  }

  constructor(
    private usuariosService: UsuariosService,
    private globalService: GlobalService
  ) { }

  public url = this.globalService.URL;

  public onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.usuario.image = file;
    }
  }

  public profile() {
    this.usuariosService.profile(this.userId).subscribe(
      res => {
        this.usuario = res.userProfile;
      },
      err => console.log(err)
    )
  }

  public subirImagen() {
    const formData = new FormData();
    if (this.usuario.image) {
      formData.append('file0', this.usuario.image);
    }
    this.usuariosService.upload(formData).subscribe(
      res => {
        this.usuario.image = res.user.image
        console.log(this.url+'user/avatar/'+this.usuario.image)
        console.log("http://localhost:3000/api/user/avatar/avatar-1710428517283-_83da8211-3055-47c3-8e56-adf801e82cea.jpeg")
      },
      err => console.log(err)
    );
  };
}
