import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-paginacio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './paginacio.component.html',
  styleUrl: './paginacio.component.css'
})
export class PaginacioComponent implements OnInit {
  numeroPagina!: number;
  totalPaginas: number = 0;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    console.log("Hola");
    this.http.get<any>('https://api.artic.edu/api/v1/artworks').subscribe(response => {
      this.totalPaginas = response.pagination.total;
      this.numeroPagina = response.pagination.current_page;
    });
  }

  nextPage() {
    if(this.numeroPagina !== this.totalPaginas){
      this.numeroPagina += 1;
      const nextPage = this.numeroPagina;
      this.router.navigate(['/pagina', nextPage]); // Navega a la siguiente página
    }else{
      console.log("Ya estas en la ultima pagina")

    }

    this.scrollToTop()
    
  }

  previousPage(){
    if(this.numeroPagina != 1){
      this.numeroPagina -= 1;
      const nextPage = this.numeroPagina;
      this.router.navigate(['/pagina', nextPage]);
    }else{
      console.log("Ya estas en la primera pagina")
    }
    this.scrollToTop()

  }

  irAPagina(){
    if(this.numeroPagina > this.totalPaginas || this.numeroPagina < 1){
      console.log("Numero no esta entre las cifras correctas")
    }else{
      this.router.navigate(['/pagina', this.numeroPagina]);
    }
    this.scrollToTop()
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

}

