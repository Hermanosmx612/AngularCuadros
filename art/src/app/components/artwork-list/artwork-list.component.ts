import { Component, Input, OnInit } from '@angular/core';
import { IArtwork } from '../../interfaces/i-artwork';
import { ArtworkComponent } from '../artwork/artwork.component';
import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkFilterPipe } from '../../pipes/artwork-filter.pipe';
import { FilterService } from '../../services/filter.service';
import { debounceTime, filter } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { PaginacioComponent } from "../paginacio/paginacio.component";
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';


@Component({
  selector: 'app-artwork-list',
  standalone: true,
  templateUrl: './artwork-list.component.html',
  styleUrl: './artwork-list.component.css',
  imports: [ArtworkComponent,
    ArtworkRowComponent,
    ArtworkFilterPipe, PaginacioComponent]
})
export class ArtworkListComponent implements OnInit {
  numeroPagina: number = 1;

  constructor(private artService: ApiServiceService,
    private filterService: FilterService,
    private usesService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  async ngOnInit(): Promise<void> {
    if(localStorage.getItem("uid")){
      await this.recuperarIdFavoritos();
    }
    this.route.params.subscribe(params => {
      console.log("Dentro de router params")
      this.numeroPagina = +params['numeroPagina'];

      if (Number.isNaN(this.numeroPagina)) {
        this.numeroPagina = 1;
      }
      console.log(this.numeroPagina);
      if (this.onlyFavorites != 'favorites') {
        this.artService.getArtWorksFromPage(this.numeroPagina).pipe(
          
        )
        .subscribe((artworkList: IArtwork[]) => {
          artworkList.forEach(artwork => {
            console.log(this.artworkIds)
            if (this.artworkIds.includes(artwork.id + "")) {
              artwork.like = true;
            } else {
              artwork.like = false;
            }
          });
          this.quadres = artworkList;
        });
      }
      else {
        this.obtenerYFiltrarArtworks();
      }

    });


    this.filterService.searchFilter.pipe(
      //filter(f=> f.length> 4 || f.length ===0),
      debounceTime(500)
    ).subscribe(filter => this.artService.filterArtWorks(filter));

  }

  async obtenerYFiltrarArtworks() {
    this.artworkIds = await this.artService.obtenerArtworkIdsPorUid();
    this.artService.getArtworksFromIDs(this.artworkIds)
  .subscribe((artworkList: IArtwork[]) => {
    artworkList.forEach(artwork => artwork.like = true);
    this.quadres = artworkList;
  });
  }

  async recuperarIdFavoritos(){
    this.artworkIds = await this.artService.obtenerArtworkIdsPorUid();
  }


  async toggleLike($event: boolean, artwork: IArtwork) {
    if(localStorage.getItem("uid")){
      console.log($event, artwork);
    artwork.like = !artwork.like;
    
    if (artwork.like) {
      const existe = await this.artService.verificarIdEnSupabase(artwork.id + "");
      console.log("Existe: "+ existe)
      if(!existe){
        this.usesService.setFavorite(artwork.id + "")
      }
    }else{
      console.log("Dislike")
      await this.usesService.removeFavorite(artwork.id+"");
      window.location.reload();
    }
    }else{
      alert("Debes estar logueado para añadir a fav")
    }
    
  }
  quadres: IArtwork[] = [];
  artworkIds: string[] = [];
  filter: string = '';
  @Input() onlyFavorites: string = '';

}
