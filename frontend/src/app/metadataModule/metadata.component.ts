import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { CruvedStoreService } from '../GN2CommonModule/service/cruved-store.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { omitBy } from 'lodash';

import { DataFormService } from '@geonature_common/form/data-form.service';
import { CommonService } from '@geonature_common/service/common.service';
import { MetadataService } from './services/metadata.service';
import { ConfigService } from '@geonature/services/config.service';

@Component({
  selector: 'pnx-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
})
export class MetadataComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  /* getter this.metadataService.filteredAcquisitionFrameworks */
  acquisitionFrameworks: Observable<any[]>;

  get expandAccordions(): boolean {
    return this.metadataService.expandAccordions;
  }

  /* liste des organismes issues de l'API pour le select. */
  public organisms: any[] = [];
  /* liste des roles issues de l'API pour le select. */
  public roles: any[] = [];

  public areaFilters: Array<any>;

  get isLoading(): boolean {
    return this.metadataService.isLoading;
  }

  searchTerms: any = {};
  afPublishModalId: number;
  afPublishModalLabel: string;
  afPublishModalContent: string;
  APP_CONFIG = null;

  pageSize: number;
  pageIndex: number;

  constructor(
    public _cruvedStore: CruvedStoreService,
    private _dfs: DataFormService,
    private modal: NgbModal,
    public metadataService: MetadataService,
    private _commonService: CommonService,
    public cs: ConfigService
  ) {
    this.APP_CONFIG = this.cs;
  }

  ngOnInit() {
    this._dfs.getOrganisms().subscribe((organisms) => (this.organisms = organisms));

    this._dfs.getRoles({ group: false }).subscribe((roles) => (this.roles = roles));

    this.afPublishModalLabel = this.cs.METADATA.CLOSED_MODAL_LABEL;
    this.afPublishModalContent = this.cs.METADATA.CLOSED_MODAL_CONTENT;

    //Combinaison des observables pour afficher les éléments filtrés en fonction de l'état du paginator
    this.acquisitionFrameworks = combineLatest(
      this.metadataService.filteredAcquisitionFrameworks.pipe(distinctUntilChanged()),
      this.metadataService.pageIndex.asObservable().pipe(distinctUntilChanged()),
      this.metadataService.pageSize.asObservable().pipe(distinctUntilChanged())
    ).pipe(
      map(([afs, pageIndex, pageSize]) =>
        afs.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
      )
    );
    // format areas filter
    this.areaFilters = this.cs.METADATA.METADATA_AREA_FILTERS.map((area) => {
      if (typeof area['type_code'] === 'string') {
        area['type_code_array'] = [area['type_code']];
      } else {
        area['type_code_array'] = area['type_code'];
      }
      return area;
    });
  }

  getOptionText(option) {
    return option?.area_name;
  }

  setDsObservationCount(datasets, dsNbObs) {
    datasets.forEach((ds) => {
      let foundDS = dsNbObs.find((d) => {
        return d.id_dataset == ds.id_dataset;
      });
      if (foundDS) {
        ds.observation_count = foundDS.count;
      } else {
        ds.observation_count = 0;
      }
    });
  }

  refreshFilters() {
    this.metadataService.resetForm();
    this.advancedSearch();
    this.metadataService.expandAccordions = false;
  }

  private advancedSearch() {
    let formValues = this.metadataService.form.value;
    // reformat areas value
    let areas = [];
    let omited = omitBy(formValues, (value = [], field) => {
      // omit control names started by area_
      if (!field || !field.startsWith('area_')) return false;
      // use only one areas ids list
      if (value) {
        areas = [...areas, ...value.map((area) => [area.id_type, area.id_area])];
      }
      return true;
    });
    let finalFormValue = { ...omited, areas: areas.length ? areas : null };
    this.metadataService.formatFormValue(Object.assign({}, formValues));
    this.metadataService.getMetadata(finalFormValue);
    this.metadataService.expandAccordions = true;
  }

  openSearchModal(searchModal) {
    this.metadataService.resetForm();
    this.modal.open(searchModal);
  }

  closeSearchModal() {
    this.modal.dismissAll();
  }

  // isDisplayed(idx: number) {
  //   //numero du CA à partir de 1
  //   let element = idx + 1;
  //   //calcul des tranches active à afficher
  //   let idxMin = this.pageSize * this.activePage;
  //   let idxMax = this.pageSize * (this.activePage + 1);

  //   return idxMin < element && element <= idxMax;
  // }

  changePaginator(event: PageEvent) {
    this.metadataService.pageSize.next(event.pageSize);
    this.metadataService.pageIndex.next(event.pageIndex);
  }

  deleteAf(af_id) {
    this._dfs.deleteAf(af_id).subscribe((res) => this.metadataService.getMetadata());
  }

  openPublishModalAf(e, af_id, publishModal) {
    this.afPublishModalId = af_id;
    this.modal.open(publishModal, { size: 'lg' });
  }

  publishAf() {
    this._dfs.publishAf(this.afPublishModalId).subscribe(
      (res) => this.metadataService.getMetadata(),
      (error) => {
        if (error.error.name == 'mailError') {
          this._commonService.regularToaster(
            'warning',
            "Erreur lors de l'envoi de l'email de confirmation. Le cadre d'acquisition a bien été fermé"
          );
        } else {
          this._commonService.regularToaster(
            'error',
            "Une erreur s'est produite lors de la fermeture du cadre d'acquisition. Contactez l'administrateur"
          );
        }
      }
    );

    this.modal.dismissAll();
  }

  displayMetaAreaFilters = () =>
  this.cs.METADATA?.METADATA_AREA_FILTERS && this.cs.METADATA?.METADATA_AREA_FILTERS.length;
}
