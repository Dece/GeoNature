import { Injectable} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../conf/app.config';
import { Observable } from 'rxjs';
import { CommonService } from '@geonature_common/service/common.service';
import * as L from 'leaflet';
import { FormControl } from '@angular/forms';
import { MapService } from '@geonature_common/map/map.service';
import { Map } from 'leaflet';

@Injectable()
export class MapListService {
  public tableSelected = new Subject<any>();
  public mapSelected = new Subject<any>();
  public selectedRow = [];
  public data: any;
  public tableData = new Array();
  public geojsonData: any;
  public idName: string;
  public columns = [];
  public layerDict= {};
  public selectedLayer: any;
  public onMapClik$: Observable<number> = this.mapSelected.asObservable();
  public onTableClick$: Observable<number> = this.tableSelected.asObservable();
  public urlQuery: HttpParams = new HttpParams ();
  public page = new Page();
  public genericFilterInput = new FormControl();
  filterableColumns: Array<any>;
  availableColumns: Array<any>;
  displayColumns: Array<any>;
  colSelected: any;
  allColumns: Array<any>;

  originStyle = {
    'color': '#3388ff',
    'fill': true,
    'fillOpacity': 0.2,
    'weight': 3
  };

 selectedStyle = {
  'color': '#ff0000',
   'weight': 3
  };
    constructor(
      private _http: HttpClient,
      private _commonService: CommonService,
      private _ms: MapService
    ) {
      this.columns = [];
      this.page.pageNumber = 0;
      this.page.size = 15;
      this.urlQuery.set('limit', '15');
      this.urlQuery.set('offset', '0');
      this.colSelected = {'prop': '', 'name': ''};



  }



  enableMapListConnexion(map: Map): void {
    this.onTableClick$
    .subscribe(id => {
      const selectedLayer = this.layerDict[id];
      this.toggleStyle(selectedLayer);
      this.zoomOnSelectedLayer(map, selectedLayer);
    });

    this.onMapClik$.subscribe(id => {
      this.selectedRow = []; // clear selected list
      for (const i in this.tableData) {
        if (this.tableData[i][this.idName] === id) {
          this.selectedRow.push(this.tableData[i]);
        }
      }
    });
  }

  onRowSelect(row) {
    this.tableSelected.next(row.selected[0][this.idName]);
  }

  getRowClass() {
    return 'clickable';
  }


  setTablePage(pageInfo) {
    this.page.pageNumber = pageInfo.offset;
    this.urlQuery = this.urlQuery.append('offset', pageInfo.offset);
  }

  getData(endPoint, param?) {
    if (param) {
      if (param.param === 'offset') {
        this.urlQuery = this.urlQuery.set('offset', param.value);
      }else {
        this.urlQuery = this.urlQuery.append(param.param, param.value);
      }
    }
    return this._http.get<any>(`${AppConfig.API_ENDPOINT}/${endPoint}`, {params: this.urlQuery});
  }

  refreshData(apiEndPoint, params?) {
    this.getData(apiEndPoint, params)
      .subscribe(
        res => {
          this.page.totalElements = res.total_filtered;
          this.geojsonData = res.items;
          this.loadTableData(res.items);
        },
        err => {
          console.log(err.error.error);
          this._commonService.regularToaster('error', err.error.error);
          this._commonService.translateToaster('error', 'MapList.InvalidTypeError');
        }
    );
  }

  refreshUrlQuery() {
    this.urlQuery = new HttpParams();
  }

  deleteAndRefresh(apiEndPoint, param) {
    console.log('refreshhhhhhhhhhhhhh');
    
    this.urlQuery = this.urlQuery.delete(param);
    this.refreshData(apiEndPoint);
  }


  toggleStyle(selectedLayer) {
    // togle the style of selected layer
    if ( this.selectedLayer !== undefined) {
      this.selectedLayer.setStyle(this.originStyle);
      this.selectedLayer.closePopup();
    }
    this.selectedLayer = selectedLayer;
    this.selectedLayer.setStyle(this.selectedStyle);
  }

  zoomOnSelectedLayer(map, layer) {
    const zoom = map.getZoom();
    // latlng is different between polygons and point
    let latlng;

    if(layer instanceof L.Polygon || layer instanceof L.Polyline){
      latlng = (layer as any)._bounds._northEast;
    }else {
      latlng = layer._latlng;
    }
    if (zoom >= 12) {
      map.setView(latlng, zoom);
    } else {
      map.setView(latlng, 12);
  }
  }

  loadTableData(data) {
    this.tableData = [];
    data.features.forEach(feature => {
      this.tableData.push(feature.properties);
    });
  }

  deleteObs(idDelete) {
    this.tableData = this.tableData.filter(row => {
      return row[this.idName] !==  idDelete;
    });

    this.geojsonData.features = this.geojsonData.features.filter(row => {
       return row.properties[this.idName] !==  idDelete;
     });

     this.geojsonData = JSON.parse(JSON.stringify(this.geojsonData));

  }

}


export class Page {
  // The number of elements in the page
  size: number = 5;
  // The total number of elements
  totalElements: number = 0;
  // The total number of pages
  totalPages: number = 2;
  // The current page number
  pageNumber: number = 0;
}