import { Component } from '@angular/core';
import { Geolocation, GeolocationPosition } from '@capacitor/geolocation';
import { ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { Share } from '@capacitor/share';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

map: any;
  @ViewChild('map', { static: true })
  mapElement!: ElementRef;
  coordinates: GeolocationPosition | undefined;
  searchInput: string = ''; // Input search 

  constructor(
    
  ) {}
//Obtener la Ubicacion del Usuario
  async getUserLocation() {
    try {
      this.coordinates = await Geolocation.getCurrentPosition();
      if (this.coordinates) {
        const { latitude, longitude } = this.coordinates.coords;
        this.loadMap(latitude, longitude);
      }
    } catch (error) {
      console.error('Error getting location', error);
      // Maneja de errores
    }
  }

  ngAfterViewInit() {
    this.getUserLocation();
  }
//Cargar Mapa
  loadMap(latitude: number, longitude: number) {
    if (this.mapElement && this.mapElement.nativeElement) {
      const mapOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
  
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  
   // Crea un marcador para la ubicación actual del usuario
      const userLocation = new google.maps.LatLng(latitude, longitude);
      const marker = new google.maps.Marker({
        map: this.map,
        position: userLocation,
        title: 'Ubicacion Actual' // Título del marcador
      });
  
    // Ventana de información para mostrar el nombre de la ubicación
      const infoWindow = new google.maps.InfoWindow({
        content: 'Su ubicación actual' 
      });
  
      // Mostrar ventana de información cuando se hace clic en el marcador
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
    } else {
      console.error('Map element not found');
    }
  }
//Agregar Marcador
  addMarker(latitude: number, longitude: number) {
    const marker = new google.maps.Marker({
      map: this.map,
      position: new google.maps.LatLng(latitude, longitude),
      animation: google.maps.Animation.DROP
    });
  
    const infoWindow = new google.maps.InfoWindow({
      content: 'Estoy Aqui'
    });
  
    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });
  }
//Compartir Ubicacion
  async shareLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      if (coordinates) {
        const { latitude, longitude } = coordinates.coords;
        const message = `Estoy aqui!: https://maps.google.com/?q=${latitude},${longitude}`;
        
      // Compartir ubicación usando el complemento Capacitor Share
        await Share.share({
          title: 'Estoy aqui!',
          text: message,
          url: `https://maps.google.com/?q=${latitude},${longitude}`,
          dialogTitle: 'compartir ubicacion',
        });
      } else {
        console.error('Ubicacion no valida');
      }
    } catch (error) {
      console.error('Error al compartir ubicacion:', error);
    }
  }

//Función para buscar un lugar usando Google Places
searchPlace() {
  if (this.searchInput) {
    const placesService = new google.maps.places.PlacesService(this.map);
    placesService.textSearch(
      {
        query: this.searchInput,
      },
      (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Recupera el primer resultado (puedes recorrer los resultados de varios)
          const place = results[0];
          const { lat, lng } = place.geometry.location;

          // Actualiza el centro del mapa y agrega un marcador para el lugar buscado
          this.map.setCenter(new google.maps.LatLng(lat(), lng()));
          this.addMarker(lat(), lng());

        }
      }
    );
  }
}



}
