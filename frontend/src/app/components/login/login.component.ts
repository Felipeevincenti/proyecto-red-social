import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public usuario = {
    email: '@gmail.com',
    password: "contraseña"
  };

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) { }

  public login() {
    this.usuariosService.login(this.usuario).subscribe(
      res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.user.id);
        this.router.navigate(['/profile']);
      },
      err => console.log(err)
    )
  }

}
