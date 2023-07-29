import { Component, OnInit } from '@angular/core';
import { CustomSelectElement } from '../../interfaces/customSelectElement.interface';
import { RestCountriesApiService } from '../../../services/rest-countries-api.service';
import { Country } from '../../interfaces/Country.interface';

@Component({
  selector: 'app-input-celular',
  templateUrl: './input-celular.component.html',
  styleUrls: ['./input-celular.component.scss']
})
export class InputCelularComponent implements OnInit {

  constructor(private api: RestCountriesApiService) { }

  countries: Country[] = [];
  data: CustomSelectElement[] = [];
  selectListo: boolean = false;
  selectValue = "";
  inputValue = "";


  finalValue: string = "";


  ngOnInit(): void {


    this.api.getAllNameIddFlag().subscribe(
      (resp) => {
        this.countries = resp
      }
    )


    setTimeout(
      () => {
        for (let i = 0; i < this.countries.length; i++) {

          if( typeof this.countries[i].idd.root != "string" || this.countries[i].idd.suffixes.length > 1) continue



          this.data.push(
            {
              name:this.countries[i].flags.svg,
              value: this.countries[i].idd.root + this.countries[i].idd.suffixes,
              selected: this.countries[i].idd.root + this.countries[i].idd.suffixes == "+57"
            }
          )
        }
        this.selectListo = true

        this.data.sort(  (a, b) => a.value - b.value)

      }, 500
    )
  }

  onSelectValue( event: CustomSelectElement ){
    this.selectValue = event.value
    this.finalValue = this.selectValue
  }

  onInputValue( event: string | number ){
    this.inputValue = event.toString()
    this.finalValue = this.inputValue
  }


}