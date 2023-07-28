import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomSelectElement } from '../../interfaces/customSelectElement.interface';
import { Observable, Subscription, of } from 'rxjs';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
})
export class CustomSelectComponent implements OnInit {
  @Input() data: CustomSelectElement[] = [];
  @Input() justIzquierda: boolean = false;
  @Input() $selectSelected: Observable<boolean> = of(false);
  @Input() $numPage?: Observable<number> = of(0);

  subNumber?: Subscription;
  subSelected?: Subscription;

  selectSelected: boolean = false
  desplegar = false;

  @Output('onOpcionSeleccionada') onOpcionSeleccionada: EventEmitter<CustomSelectElement> = new EventEmitter<CustomSelectElement>();


  dataLength?: number;

  elementSelected!: CustomSelectElement;

  constructor() {}

  ngOnInit(): void {
    this.subSelected = this.$numPage?.subscribe( (resp) => {
      this.elementSelected = this.data[resp-1];
    } ) ?? new Subscription()

    this.subNumber = this.$selectSelected.subscribe( (resp) => {
      this.selectSelected = resp
      if( !resp ) this.desplegar = false
    } )

    this.dataLength = this.data.length - 1;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].selected == true) {
        this.elementSelected = this.data[i];
        return;
      }
    }

    this.data[0].selected = true;
    this.elementSelected = this.data[0];
  }

  ngOnDestroy(){
    this.subNumber?.unsubscribe()
    this.subSelected?.unsubscribe()
  }

  clickSelect() {
    this.selectSelected = true;
    this.onOpcionSeleccionada.emit(this.elementSelected)
    this.desplegar = !this.desplegar;
  }


  onClickOption(element: CustomSelectElement) {
    const oldName = this.elementSelected.name;

    this.elementSelected = element;

    this.desplegar = false;

    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].name == oldName) this.data[i].selected = false;
    }

    this.onOpcionSeleccionada.emit(element);
  }
}
