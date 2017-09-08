import { Injectable } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {  } from '@angular/forms';

@Injectable()
export class FormService {
  currentTaxon:any;
  municipalities: string;
  taxonsList: Array<any>;
  indexCounting: number;
  nbCounting: Array<string>;
  contactForm: FormGroup;
  occurrenceForm : FormGroup;
  countingForm : FormArray;

  constructor(private _fb: FormBuilder) {
    this.currentTaxon = {};
    this.indexCounting = 0;
    this.nbCounting = [''];
    this.taxonsList = [];
   }// end constructor

   initObservationForm(): FormGroup {
    return this._fb.group({
      geometry: ['', Validators.required],
      properties: this._fb.group({
        id_dataset: [null, Validators.required],
        id_digitiser : null,
        date_min: ['', Validators.required],
        date_max: ['', Validators.required],
        altitude_min: '',
        altitude_max : '',
        deleted: false, 
        id_municipality : ['', Validators.required],
        meta_device_entry: 'web',
        comment: '',
        observers: [null, Validators.required],
        t_occurrences_contact: this._fb.array([])
      })
    });
   }

   initOccurrenceForm(): FormGroup {
    return this._fb.group({
      id_nomenclature_obs_technique :[null, Validators.required],
      id_nomenclature_obs_meth: null,
      id_nomenclature_bio_condition: [null, Validators.required],
      id_nomenclature_bio_status : null,
      id_nomenclature_naturalness : null,
      id_nomenclature_exist_proof: null,
      id_nomenclature_valid_status: null, 
      id_nomenclature_diffusion_level: null,
      id_validator: null,
      determiner:'',
      determination_method: '',
      cd_nom: [null, Validators.required],
      nom_cite: '',
      meta_v_taxref: "Taxref V9.0",
      sample_number_proof: '',
      digital_proof:'',
      non_digital_proof:'',
      deleted: false, 
      comment:'',
      cor_counting_contact: ''
    })
  }


   initCounting(): FormGroup {
    return this._fb.group({
      id_nomenclature_life_stage: [null, Validators.required],
      id_nomenclature_sex: [null, Validators.required],
      id_nomenclature_obj_count: [null, Validators.required],
      id_nomenclature_type_count: null,
      count_min : null,
      count_max : null
    })
  }

  initCountingArray():FormArray{
    const arrayForm = this._fb.array([])
    arrayForm.push(this.initCounting());
    return arrayForm
  }

  addOccurence(occurenceForm:FormGroup, observationForm: FormGroup, countingForm:FormArray){
    // push the counting(s) in occurrenceForm  
    occurenceForm.controls.cor_counting_contact.patchValue(countingForm.value);  
    // push the current occurence in the observationForm   
    observationForm.value.properties.t_occurrences_contact.push(occurenceForm.value)
    // reset counting
    this.nbCounting = [''];
    this.indexCounting = 0;
  }

  addCounting(countingForm:FormArray){
    this.indexCounting += 1;
    this.nbCounting.push('');
    const countingCtrl = this.initCounting();
    countingForm.push(countingCtrl);
    }
  
  removeCounting(index:number, coutingForm:FormArray){
    coutingForm.value.splice(index, 1);
    this.nbCounting.splice(index, 1);
  }

  updateTaxon(taxon) {
     this.currentTaxon = taxon;
   }

}