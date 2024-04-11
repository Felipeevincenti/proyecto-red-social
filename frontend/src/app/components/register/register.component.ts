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
    nick: '',
    email: '',
    password: '',
    role: '',
    image: 'default.png'
  };

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) { }

  public registrarUsuario() {

    const inputNombre = document.querySelector('input[name="nombre"]');
    const inputApellido = document.querySelector('input[name="apellido"]');
    const inputNick = document.querySelector('input[name="nick"]');
    const inputCorreo = document.querySelector('input[name="correo"]');
    const inputContrasena = document.querySelector('input[name="contrasena"]');

    const errorNombre = document.getElementById('error-name');
    const errorApellido = document.getElementById('error-surname');
    const errorNick = document.getElementById('error-nick');
    const errorCorreo = document.getElementById('error-email');
    const errorContrasena = document.getElementById('error-password');

    const errorCorreoExiste = document.getElementById('error-email-existe');
    const errorNickExiste = document.getElementById('error-nick-existe');

    const emailFormat = /^[^\s@]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com)$/;

    (errorNickExiste as HTMLElement).style.display = "none";
    (errorCorreoExiste as HTMLElement).style.display = "none";

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

    if (!this.usuario.name || !this.usuario.surname || !this.usuario.nick || !this.usuario.email || !this.usuario.password) {
      inputNombre?.classList.add('error')
      inputApellido?.classList.add('error')
      inputNick?.classList.add('error')
      inputCorreo?.classList.add('error')
      inputContrasena?.classList.add('error')
      return
    };

    inputNombre?.classList.remove('error');
    inputApellido?.classList.remove('error')
    inputNick?.classList.remove('error')
    inputCorreo?.classList.remove('error')
    inputContrasena?.classList.remove('error')

    function mostrarError(condicion: any, input: any, span: any) {
      if (condicion) {
        input?.classList.remove('success');
        input?.classList.add('error');
        if (span) {
          (span as HTMLElement).style.display = "block"
        }
        return
      };
      input?.classList.add('success');
      (span as HTMLElement).style.display = "none";
    }

    mostrarError(contarPalabras(this.usuario.name) > 2, inputNombre, errorNombre);
    mostrarError(contarPalabras(this.usuario.surname) > 2, inputApellido, errorApellido);
    mostrarError(contarLetras(this.usuario.nick) < 4 || contarLetras(this.usuario.nick) > 20, inputNick, errorNick);
    mostrarError(!emailFormat.test(this.usuario.email), inputCorreo, errorCorreo);
    mostrarError(this.usuario.password.length < 8 || this.usuario.password.length > 20, inputContrasena, errorContrasena);

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
      err => {
        console.log(err);
        if (err.error.message == "El nick ya existe") {
          inputNick?.classList.remove('success');
          inputNick?.classList.add('error');
          (errorNickExiste as HTMLElement).style.display = "block";
        }
        else if (err.error.message == "El email ya existe") {
          inputCorreo?.classList.remove('success');
          inputCorreo?.classList.add('error');
          (errorCorreoExiste as HTMLElement).style.display = "block";
        }
      }
    )
  };
}