import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) { }

  public usuario = {
    email: '@gmail.com',
    password: "contraseña"
  };

  public login() {
    this.usuariosService.login(this.usuario).subscribe(
      res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('id', res.user.id);
        this.router.navigate(['/profile'])
          .then(() => {
            location.reload();
          })
          .catch((err) => {
            console.log(err);
          })
      },
      err => {
        console.log(err);
        const error = document.querySelector(".login__error") as HTMLElement;
        error.style.display = "block";
      }
    )
  }
}
