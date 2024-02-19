import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js'
import { Observable, Subject, from, tap } from 'rxjs';
import { IUser } from '../interfaces/user';
import { environment } from '../../environments/enviroment';
import { FormGroup } from '@angular/forms';


const emptyUser: IUser = { id: '0', avatar_url: 'assets/logo.svg', full_name: 'none', username: 'none' }

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  userUid: string = '';
  supaClient: any = null;
  urlBaseStorage: string = 'https://iqtetgxkwattmayeatof.supabase.co/storage/v1/object/avatars/';

  constructor() {
    this.supaClient = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  }
  userSubject: Subject<IUser> = new Subject;
  favoritesSubject: Subject<{ id: number, uid: string, artwork_id: string }[]> = new Subject;

  async login(email: string, password: string): Promise<boolean> {
    let session = await this.supaClient.auth.getSession();
    let data, error;
    if (session.data.session) {
      data = session.data.session;
    }
    else {
      session = await this.supaClient.auth.signInWithPassword({
        email,
        password
      });
      data = session.data;
      error = session.error;
      localStorage.setItem("uid", data.session.user.id);
      this.userUid = data.session.user.id;
      if (error) {
        //   throw error;
        return false
      }
    }
    if (data.user != null) {
      this.getProfile(data.user.id);
      return true;
    }
    return false;
  }

  getProfile(userId: string): void {
    let profilePromise: Promise<{ data: IUser[] }> = this.supaClient
      .from('profiles')
      .select("*")
      // Filters
      .eq('id', userId);

    from(profilePromise).pipe(
      tap(data => console.log(data))
    ).subscribe(async (profile: { data: IUser[] }) => {
      this.userSubject.next(profile.data[0]);
      const avatarFile = profile.data[0].avatar_url.split('/').at(-1);
      const { data, error } = await this.supaClient.storage.from('avatars').download(avatarFile);
      const url = URL.createObjectURL(data)
      profile.data[0].avatar_url = url;
      this.userSubject.next(profile.data[0]);
      console.log(profile.data[0])
    }
    );

  }

  async updateProfile(formulario: FormGroup) {
    const formData = formulario.value;
      const { data: updatedData, error: updateError } = await this.supaClient
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
        })
        .eq('id', localStorage.getItem("uid"));
    }

  async isLogged() {
    let { data, error } = await this.supaClient.auth.getSession();
    if (data.session) {
      this.getProfile(data.session.user.id)
    }
  }

  async logout() {
    const { error } = await this.supaClient.auth.signOut();
    this.userSubject.next(emptyUser);
    localStorage.clear();
  }

  getFavorites(uid: string): void {
    let promiseFavorites: Promise<{ data: { id: number, uid: string, artwork_id: string }[] }> = this.supaClient
      .from('favorites')
      .select("*")
      .eq('uid', uid);

    promiseFavorites.then((data) => this.favoritesSubject.next(data.data));
  }

  async setFavorite(artwork_id: string): Promise<any> {

    console.log('setfavorite', artwork_id);
    let { data, error } = await this.supaClient.auth.getSession();

    if (data && data.session) {
      let promiseFavorites: Promise<boolean> = this.supaClient
        .from('favorites')
        .insert({ uid: data.session.user.id, artwork_id });

      promiseFavorites.then(() => this.getFavorites(data.session.user.id));
    } else {
      console.error('No se pudo obtener la sesión del usuario.');
    }
  }

  async signUp(email: string, password: string): Promise<any> {
    const { data, error } = await this.supaClient.auth.signUp({
      email,
      password,
    });
    console.log(error)
    if (error) {
      return false;
    }
    if (data) {
      console.log(data)
      this.userUid = data.user.id;
      return true;
    }
    return false;
  }

  async actualizarTablaProfiles(): Promise<any> {
    try {
      console.log("User id : " + this.userUid);
      console.log(this.urlBaseStorage)
      const { data, error } = await this.supaClient
        .from('profiles')
        .update({avatar_url: this.urlBaseStorage + this.userUid + ".jpg" })
        .eq('id', this.userUid).select();
      console.log("Consulta ejecutada correctamente:", data);
    } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
    }
  }

async guardarDatosUser(): Promise<any> {
  try {
    const { data, error } = await this.supaClient
      .from('profiles')
      .update({full_name: localStorage.getItem("fullname"), username: localStorage.getItem("username")})
      .eq('id', this.userUid).select();
    console.log("Consulta ejecutada correctamente:", data);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
  }
}

async removeFavorite(artwork_id: string): Promise<any> {
  const { data, error } = await this.supaClient
      .from('favorites')
      .delete()
      .eq('uid', localStorage.getItem("uid"))
      .eq('artwork_id', artwork_id);
}
}








/*
npm install @supabase/supabase-js

*/
