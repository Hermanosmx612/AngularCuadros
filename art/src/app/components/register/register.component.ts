import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isSubmitted: boolean = false;
  supabaseUrl = 'https://yourproject.supabase.co';
  supabaseKey = 'your-supabase-key';

  constructor(private formBuilder: FormBuilder, public userServices: UsersService, private router: Router) {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      photoBlob: ['', Validators.required]
    }, { validator: this.confirmPasswordValidator });
  }

  confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ passwordsNotMatch: true }); // Establecer un error en confirmPassword
      return { passwordsNotMatch: true };
    } else {
      confirmPassword?.setErrors(null); // Eliminar el error de confirmPassword si las contraseñas coinciden
      return null;
    }
  };

  async onSubmit(fileInput: HTMLInputElement) {
    this.isSubmitted = true;
    if (this.registerForm.invalid) {
      console.log('Por favor, complete todos los campos correctamente');
      return;
    }

    const username = this.registerForm.value.username;
    const lastname = this.registerForm.value.lastname;
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;
    //const photoBlob = this.registerForm.value.photoBlob;
    try {
      const signup = await this.userServices.signUp(email, password);
      if (signup) {
        const file: File = fileInput.files![0];
        localStorage.setItem('username', username);
        localStorage.setItem('fullname',lastname);
        if (file) {
          console.log('Archivo seleccionado:', file);
          this.uploadFile(file);
          this.router.navigate(['userManagement/login'])
        } else {
          console.error('No se ha seleccionado ningún archivo.');
        }
      } else {
        console.error('Error en el registro');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  async uploadFile(file: File) {
    try {
      const { data, error } = await this.userServices.supaClient.storage
        .from('avatars')
        .upload(this.userServices.userUid + ".jpg", file);
      if (error) {
        throw error;
      }

      console.log('Archivo subido con éxito:', data);

      return data;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  }
}

