import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material/material.module';
import { LandingmoduleModule } from '../home/landingmodule/landingmodule.module';
import { CheckoutRoutingModule } from './checkout-routing.module';

import { AutentificacionComponent } from './pages/autentificacion/autentificacion.component';
import { InversionComponent } from './pages/inversion/inversion.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { CardComponent } from './components/card/card.component';
import { CardPaymentComponent } from './components/card-payment/card-payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CustomSelectComponent } from './components/custom-select/custom-select.component';
import { ActualrouteComponent } from './components/actualroute/actualroute.component';
import { OnlyNumberDirective } from './directives/only-number.directive';
import { InputComponent } from '../shared/input/input.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { SelectciudadComponent } from '../shared/selectciudad/selectciudad.component';
import { SelectdepartamentoComponent } from '../shared/selectdepartamento/selectdepartamento.component';
import { SelectpaisComponent } from '../shared/selectpais/selectpais.component';
import { AlertComponent } from './components/alert/alert.component';
import { InputCelularComponent } from './components/input-celular/input-celular.component';

@NgModule({
  declarations: [
    InversionComponent,
    AutentificacionComponent,
    PaymentComponent,
    CardComponent,
    CardPaymentComponent,
    CustomSelectComponent,
    ActualrouteComponent,
    OnlyNumberDirective,
    InputComponent,
    BackButtonComponent,
    SelectciudadComponent,
    SelectdepartamentoComponent,
    SelectpaisComponent,
    AlertComponent,
    InputCelularComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    CheckoutRoutingModule,
    LandingmoduleModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],

  providers: [
    // Opcional: Si necesitas ajustar el idioma
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
  ],
})
export class CheckoutModule {}
