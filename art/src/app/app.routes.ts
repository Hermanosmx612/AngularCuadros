import { Routes } from '@angular/router';
import { ArtworkListComponent } from './components/artwork-list/artwork-list.component';
import { ArtworkComponent } from './components/artwork/artwork.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: 'pagina/:numeroPagina', component: ArtworkListComponent },
  {path: 'artworks', component: ArtworkListComponent},
  {path: 'artworks/:onlyFavorites', component: ArtworkListComponent},
  {path: 'artwork/:id', component: ArtworkComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'favorites', redirectTo: 'artworks/favorites'},
  {path: 'userManagement/register', component: RegisterComponent},
  {path: 'userManagement/:setmode', component: LoginComponent},
  {path: 'userManagement/:logout', component: LoginComponent},
  { path: '**', component: ArtworkListComponent }

];
