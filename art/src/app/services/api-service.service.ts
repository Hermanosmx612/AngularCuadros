import { Injectable } from '@angular/core';
import { IArtwork } from '../interfaces/i-artwork';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, from, map, mergeMap, toArray } from 'rxjs';
import { UsersService } from './users.service';

const url = `https://api.artic.edu/api/v1/artworks`;



@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {


  artworksSubject: Subject<IArtwork[]> = new Subject();

  constructor(private http: HttpClient, private usesService: UsersService,) { }

  public getArtWorksFromPage(actPage : number): Observable<IArtwork[]> {
    this.http.get<{ data: IArtwork[] }>(url+"?limit=3"+"&page="+actPage).pipe(
      map(response => response.data)
    ).subscribe((artworks) => {
        this.artworksSubject.next(artworks);
    }
    );
    return this.artworksSubject;
  }

  public filterArtWorks(filter:string): void{
    this.http.get<{ data: IArtwork[] }>(`${url}/search?q=${filter}&fields=id,description,title,image_id`).pipe(
      map(response => response.data)
    ).subscribe((artworks) => {
        this.artworksSubject.next(artworks);
    }
    );
  }

  public getArtworksFromIDs(artworkList: string[]): Observable<IArtwork[]>{
    from(artworkList).pipe(
      mergeMap(artwork_id =>{
        return  this.http.get<{ data: IArtwork[] }>(`${url}/${artwork_id}`).pipe(
          map(response => response.data)
        )
      }),
      toArray()
    ).subscribe(artworks => this.artworksSubject.next(artworks.flat()))

    return this.artworksSubject;
  }

  public async obtenerArtworkIdsPorUid(): Promise<string[]> {
    // Realiza la consulta SQL para seleccionar los artwork_id para el uid dado
    const { data, error } = await this.usesService.supaClient
      .from('favorites')
      .select('artwork_id')
      .eq('uid', localStorage.getItem("uid"));
  
    if (error) {
      console.error('Error al obtener los artwork_ids:', error.message);
      return [];
    }
  
    // Extrae los artwork_id de los resultados y convierte a string si es necesario
    const artworkIds = data.map((row: any) => row.artwork_id.toString());
  
    return artworkIds;
  }

  async verificarIdEnSupabase(artworkId: string): Promise<boolean> {
    const { data, error } = await this.usesService.supaClient
      .from('favorites')
      .select('*')
      .eq('artwork_id', artworkId)
      .eq('uid', localStorage.getItem("uid"));
  
    if (error) {
      console.error('Error al verificar el ID:', error.message);
      return false;
    }
  
    return data.length > 0;
  }


}
