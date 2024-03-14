import { Component } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  public usuario = {
    name: '',
    surname: '',
    bio: '',
    nick: '',
    email: '',
    password: '',
    role: '',
    image: null // Cambiar de '' a null
  };

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) { }

  public registrarUsuario() {
    this.usuariosService.registrarUsuario(this.usuario).subscribe(
      res => {
        this.usuariosService.login(this.usuario).subscribe(
          res => {
            localStorage.setItem('token', res.token);
            localStorage.setItem('id', res.user.id);
            this.router.navigate(['/profile']);
          },
          err => console.log(err)
        )
      },
      err => console.log(err)
    )
  };
}