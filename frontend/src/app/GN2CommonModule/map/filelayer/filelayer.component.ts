import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  AfterViewInit,
  OnChanges
} from '@angular/core';
import { MapService } from '../map.service';
import { Map } from 'leaflet';
import * as L from 'leaflet';
import * as ToGeojson from 'togeojson';
import * as FileLayer from 'leaflet-filelayer';
import { CommonService } from '@geonature_common/service/common.service';
import { style } from '@angular/animations';

@Component({
  selector: 'pnx-leaflet-filelayer',
  templateUrl: './filelayer.component.html'
})
export class LeafletFileLayerComponent implements OnInit, AfterViewInit, OnChanges {
  public map: Map;
  public Le: any;
  // previous layer loaded with filelayer
  public previousLayer: any;
  // previous layer selectionned with right click on a filelayer layer
  public previousCurrentLayer: any;
  public fileLayerControl: L.Control;
  // input to detect a new layer on the map
  // when this input change -> delete the layer
  @Input() removeLayer: any;
  @Input() editMode = false;
  // style of the layers
  @Input() style;
  @Output() onLoad = new EventEmitter<any>();
  constructor(public mapService: MapService, private _commonService: CommonService) {}

  ngOnInit() {
    this.style = this.style || this.mapService.searchStyle;
  }

  ngAfterViewInit() {
    this.mapService.initializefileLayerFeatureGroup();
    this.map = this.mapService.getMap();
    // set mapService fileLayerEditionMode parameters from the input
    this.mapService.fileLayerEditionMode = this.editMode;

    FileLayer(null, L, ToGeojson);
    (L.Control as any).FileLayerLoad.LABEL =
      '<img class="icon" width="15" src="assets/images/folder.svg" alt="file icon"/>';
    this.fileLayerControl = (L.Control as any)
      .fileLayerLoad({
        layer: (L as any).geoJson,
        // Add to map after loading (default: true) ?
        addToMap: false,
        // File size limit in kb (default: 10024) ?
        fileSizeLimit: 10024,
        // Restrict accepted file formats (default: .geojson, .json, .kml, and .gpx) ?
        formats: ['.gpx', '.geojson', '.kml']
      })
      .addTo(this.map);

    // event on load success
    (this.fileLayerControl as any).loader.on('data:loaded', event => {
      // remove layer from leaflet draw
      this.mapService.removeAllLayers(this.mapService.map, this.mapService.leafletDrawFeatureGroup);
      // set marker editing OFF
      this.mapService.setEditingMarker(false);
      // remove the previous layer loaded via file layer
      this.mapService.removeAllLayers(this.mapService.map, this.mapService.fileLayerFeatureGroup);
      let currentFeature;

      const geojsonArray = [];
      // loop on layers to set them on the map via the fileLayerFeatureGroup
      // tslint:disable-next-line:forin
      for (let _layer in event.layer._layers) {
        // emit the geometry as an output
        currentFeature = event.layer._layers[_layer]['feature'];
        geojsonArray.push(currentFeature);

        // create a geojson with the name on over
        const newLayer = L.geoJSON(currentFeature, {
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng);
          },
          onEachFeature: (feature, layer) => {
            let propertiesContent = '';
            // loop on properties dict to build the popup
            // tslint:disable-next-line:forin
            for (let prop in currentFeature.properties) {
              propertiesContent +=
                '<b>' + prop + '</b> : ' + currentFeature.properties[prop] + ' ' + '<br>';
            }
            if (propertiesContent.length > 0) {
              layer.bindPopup(propertiesContent);
            }
            // on right click display popup
            layer.on('contextmenu', e => {
              layer.openPopup();
            });

            // on click on a layer, change the color of the layer
            if (this.editMode) {
              layer.on('click', e => {
                layer.closePopup();
                if (this.previousCurrentLayer) {
                  this.previousCurrentLayer.setStyle(this.style);
                }
                (layer as any).setStyle(this.mapService.searchStyle);
                this.previousCurrentLayer = layer;
                // remove marker eventually
                if (this.mapService.marker) {
                  this.mapService.marker.remove();
                }
                // sent geojson observable
                this.mapService.setGeojsonCoord((layer as any).feature);
              });
            }
          },
          style: this.style
        });
        // add the layers to the feature groupe
        this.mapService.fileLayerFeatureGroup.addLayer(newLayer);

        this.onLoad.emit(geojsonArray);
      }
      // remove the previous layer of the map
      if (this.previousLayer) {
        this.map.removeLayer(this.previousLayer);
      }
      this.previousLayer = event.layer;
    });

    // event on load fail

    (this.fileLayerControl as any).loader.on('data:error', error => {
      this._commonService.translateToaster('error', 'ErrorMessage');
      console.error(error);
    });
  }

  setNewLayerFromClick(layer) {}

  ngOnChanges(changes) {
    if (changes && changes.removeLayer && changes.removeLayer.currentValue) {
      if (this.previousLayer) {
        // when this input change -> delete the layer because an other layer has been loaded
        this.map.removeLayer(this.previousLayer);
      }
    }
  }
}
