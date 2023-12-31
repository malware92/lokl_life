import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PaymentCard } from '../../interfaces/paymentCard.interface';
import { CustomSelectElement } from '../../interfaces/customSelectElement.interface';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import * as jwt_decode from 'jwt-decode';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { monthDueValidator } from '../../validators/monthDue.validator';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ArrayType } from '@angular/compiler';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  public fecha: Date = new Date();

  validatingTransaction: boolean = false;
  reference?: string;

  tarjetaActiva: boolean = false;

  subSelectTypeDocument: Subject<boolean> = new Subject<boolean>();
  $selectTypeDocument: Observable<boolean> =
    this.subSelectTypeDocument.asObservable();

  subSelectTypePerson: Subject<boolean> = new Subject<boolean>();
  $selectTypePerson: Observable<boolean> =
    this.subSelectTypeDocument.asObservable();

  public formInversion: FormGroup = this.fb.group({
    value: [110000140, []],
    dues: [1, [Validators.required]],
    payment: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]],
  });

  public opcionesSelect: CustomSelectElement[] = [
    { name: 'A continuación seleccione su banco', value: '', selected: false },
    { name: 'BAN100', value: 1, selected: false },
    { name: 'BANCAMIA S.A.', value: 2, selected: false },
  ];

  public opcionesSelectState: CustomSelectElement[] = [
    { name: 'Departamento', value: '', selected: false },
    { name: 'Amazonas', value: 1, selected: false },
    { name: 'Antioquia', value: 2, selected: false },
    { name: 'Arauca', value: 3, selected: false },
  ];
  public opcionesSelectCity: CustomSelectElement[] = [
    { name: 'Ciudad', value: '', selected: false },
    { name: 'Bogota', value: 1, selected: false },
    { name: 'Medellin', value: 2, selected: false },
    { name: 'Ibague', value: 3, selected: false },
  ];
  public opcionesSelectTypePerson: CustomSelectElement[] = [
    { name: 'Seleccione su tipo de persona', value: '', selected: false },
    { name: 'Persona natural', value: 0, selected: false },
    { name: 'Persona juridica', value: 1, selected: false },
  ];
  public opcionesSelectTypeDocument: CustomSelectElement[] = [
    { name: 'Seleccione su tipo de documento', value: '', selected: false },
    { name: 'Cédula de ciudadanía', value: 'CC', selected: false },
    { name: 'Cédula de extranjería', value: 'CE', selected: false },
    { name: 'Pasaporte', value: 'PP', selected: false },
  ];

  // ------ enviroment --------

  public bearer_token_transactions: string = environment.bearer_token_transactions;
  public api_url_financial_institutions: string = environment.api_url_financial_institutions;
  public api_url_wompi_transactions: string = environment.api_url_wompi_transactions;

  // PSE
  public owner_wompi_pse: string = environment.owner_wompi_pse;
  public project_wompi_pse: string = environment.project_wompi_pse;
  public redirect_url_success_wompi_pse: string =
    environment.redirect_url_success_wompi_pse;

  // CREDIT
  public owner_wompi_credit: string = environment.owner_wompi_credit;
  public project_wompi_credit: string = environment.project_wompi_credit;
  public redirect_url_success_wompi_credit: string =
    environment.redirect_url_success_wompi_credit;

  // ----------

  selectedCountry: string = 'CO';
  selectedState: string = '';
  nameCity: string = '';
  selectedcity: any;

  body!: FormGroup;
  firstNameControl!: FormControl;
  address!: FormControl;
  state!: FormControl;
  city!: FormControl;
  document_number!: FormControl;
  phone!: FormControl;
  emailAdress!: FormControl;
  rut!: FormControl;
  document_type!: FormControl;
  type_person!: FormControl;

  inversionValue: number = 0;
  subtotal = 0;
  investmentTotal = 0;
  taxes: number = 0;
  type: number = 0;
  mapCuotas = {
    '=1': '1 mes',
    other: '# meses',
  };
  numberCard: any = '';
  exp_month: any = '';
  exp_year: any = '';
  cvc: any = '';

  inputCard(event: any) {
    if (event.inputType == 'deleteContentBackward') {
      this.body.patchValue({ card_number: '' });
      return;
    }

    if (/[^0-9]/g.test(event.data)) {
      if (event.target.value.length == 1) {
        event.target.value = '';
        return;
      }

      for (let i = 0; i < event.target.value.length; i++) {
        if (/[^0-9]/g.test(event.target.value[i])) {
          event.target.value = event.target.value.replace(/[^0-9\s]/g, '');
        }
      }
    }

    if (event.target.value.length % 5 == 0) {
      const arrayN = event.target.value.split('');
      arrayN.splice(arrayN.length - 1, 0, ' ');
      event.target.value = arrayN.join('');
    }

    this.numberCard = event.target.value;
    this.body.patchValue({ card_number: this.numberCard });
  }

  inputDueDate(event: any) {
    if (event.inputType == 'deleteContentBackward') {
      this.body.patchValue({ card_due_date: '' });
      return;
    }

    if (/[^0-9]/g.test(event.data)) {
      if (
        event.target.value.length == 3 &&
        event.data == '/' &&
        event.target.value[-1] == '/'
      )
        return;

      if (event.target.value.length == 1) {
        event.target.value = '';
        return;
      }

      for (let i = 0; i < event.target.value.length; i++) {
        if (/[^0-9]/g.test(event.target.value[i])) {
          event.target.value = event.target.value.replace(/[^0-9\s]/g, '');
        }
      }
    }

    if (event.target.value.length == 3) {
      const arrayN = event.target.value.split('');
      arrayN.splice(arrayN.length - 1, 0, '/');
      event.target.value = arrayN.join('');
    }

    const date = event.target.value.split('/');
    this.exp_month = date[0];
    this.exp_year = date[1];
    this.body.patchValue({ card_due_date: event.target.value });
  }

  inputCvc(event: any) {
    if (event.inputType == 'deleteContentBackward') {
      this.body.patchValue({ card_cvc: '' });
      return;
    }

    if (/[^0-9]/g.test(event.data)) {
      if (event.target.value.length == 1) {
        event.target.value = '';
        return;
      }

      for (let i = 0; i < event.target.value.length; i++) {
        if (/[^0-9]/g.test(event.target.value[i])) {
          event.target.value = event.target.value.replace(/[^0-9\s]/g, '');
        }
      }
    }
    this.cvc = event.target.value;
    this.body.patchValue({ card_cvc: this.cvc });
  }

  // ------------------ //

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiservice: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('type')) {
      if (localStorage.getItem('type')! == '0') {
      } else {
        this.tarjetaActiva = localStorage.getItem('type')! == '1';
      }
    } else {
      //No hay tipo en el local Storage
    }
    if([]) console.log('pasa true');

    let reference = this.route.snapshot.queryParamMap.get('reference')
    const amount = this.route.snapshot.queryParamMap.get('amount')
    const type = this.route.snapshot.queryParamMap.get('type')
    const inversion_total = this.route.snapshot.queryParamMap.get('inversion_total')
    const impuestos = this.route.snapshot.queryParamMap.get('impuestos')
    const meses = this.route.snapshot.queryParamMap.get('meses')
    const valor_mes = this.route.snapshot.queryParamMap.get('valor_mes')

    if(reference && amount && type && inversion_total && impuestos && meses && valor_mes){
      const arrayRef = reference.split('_');
      arrayRef.pop();
      reference = arrayRef.join('_') + `_${Math.random().toString().slice(-5, -1)}`;
      this.reference = reference;
      localStorage.setItem('investment', amount)
      localStorage.setItem('type', type)
      localStorage.setItem('investment_total', inversion_total)
      localStorage.setItem('taxes', impuestos)
      localStorage.setItem('months', meses)
      localStorage.setItem('month_value', valor_mes)
    }

    this.body = this.fb.group({
      first_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      document_type: ['', Validators.required],
      document_number: ['', Validators.required],
      phone: ['', [Validators.required]],

      card_number: [''],
      card_due_date: [''],
      card_cvc: [''],

      selectedStateBank: [''],

      emailAdress: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
        ],
      ],
      type_person: ['', Validators.required],
      rut: ['', []],
    });

    if (localStorage.getItem('type')) {
      if (localStorage.getItem('type') == '1') {
        this.tarjetaActiva = true;
        this.body
          .get('card_number')
          ?.setValidators([Validators.required, Validators.minLength(19)]);
        this.body
          .get('card_due_date')
          ?.setValidators([
            Validators.required,
            Validators.minLength(5),
            monthDueValidator(),
          ]);
        this.body
          .get('card_cvc')
          ?.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        this.tarjetaActiva = false;
        this.body
          .get('selectedStateBank')
          ?.setValidators([Validators.required]);
      }
    } else {
      //No hay tipo en el local Storage
    }

    this.formInversion.patchValue({
      value: localStorage.getItem('investment_total'),
    });
    this.formInversion.patchValue({ dues: localStorage.getItem('months') });
    this.formInversion.patchValue({ payment: localStorage.getItem('type') });
    this.formInversion.patchValue({
      acceptTerms: localStorage.getItem('true'),
    });

    // TODO: DESCOMENTAR EN CASO DE NECESITAR AUTOCOMPLETAR ESTA INFO DEL FORM
    this.firstNameControl = this.body.get('first_name') as FormControl;
    this.address = this.body.get('address') as FormControl;
    this.document_type = this.body.get('document_type') as FormControl;
    this.document_number = this.body.get('document_number') as FormControl;
    this.phone = this.body.get('phone') as FormControl;
    this.emailAdress = this.body.get('emailAdress') as FormControl;
    this.type_person = this.body.get('type_person') as FormControl;
    this.rut = this.body.get('rut') as FormControl;

    this.patchForm();
    this.fetchDocumentsTypes();
  }

  // ----------------------- //


  onfocusSelects() {
    this.subSelectTypeDocument.next(false);
    this.subSelectTypePerson.next(false);
  }

  // Funcion de pago con PSE
  public sendDataInvestment() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload: any = jwt_decode.default(token);
    const reference = this.reference ? this.reference :
        payload.id +
        '_632511ecd407318f2592f945_' +
        Math.random().toString().slice(-5, -1);

    let body = {
      bank_code: this?.body.get('selectedStateBank')?.value,
      name: this.body.get('first_name')?.value,
      address: this.body.get('address')?.value,
      region: this?.selectedState,
      city: this?.nameCity,
      type_client: this.body.get('type_person')?.value.toString(),
      type_document: this.body.get('document_type')?.value.toString(),
      number_document: this.body.get('document_number')?.value,
      number: this.body.get('phone')?.value,
      email: this.body.get('emailAdress')?.value,
      redirect_url: this.redirect_url_success_wompi_pse,
      reference: reference,
      amount: this.investmentTotal.toString(),
      type: this.type.toString(),
      info_subcripcion: [
        {
          owner: this.owner_wompi_pse,
          project: this.project_wompi_pse,
          inversion: this.investmentTotal.toString(),
          impuestos: this.taxes.toString(),
          meses: this.formInversion.value.dues,
          valor_mes: this.subtotal.toString(),
        },
      ],
      installments: '6',
      prepayment: '0',
    };

    console.log(body);
    this.apiservice.post(`transaction`, body).subscribe(
      (res: any) => {
        console.log(res);

        if (res) {
          if (this.type === 0) {
            const id = res?.data?.data?.id;
            setTimeout(() => {
              this.redirectPse(id);
            }, 2000);
          }
        }
      },
      (error: any) => {
        console.log('error en enviar data', error);
      }
    );
  };

  // Funcion de pago con tarjeta de credito
  submit() {
    this.validatingTransaction = true;
    setTimeout(() => (this.validatingTransaction = false), 30000);

    const type_document = this.body.value.document_type.toString();
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload: any = jwt_decode.default(token);
    const reference =
      payload.id +
      '_632511ecd407318f2592f945_' +
      Math.random().toString().slice(-5, -1);

    let body;

    if (this.tarjetaActiva) {
      body = {
        name: this.body.get('first_name')?.value,
        address: this.body.value.address,
        region: this.selectedState,
        city: this.selectedcity,
        type_client: this.body.get('type_person')?.value.toString(),
        type_document: type_document,
        number_document: this.body.value.document_number,
        number: this.body.value.phone,
        email: this.body.get('emailAdress')?.value,
        numberCard: this.numberCard,
        exp_month: this.exp_month,
        exp_year: this.exp_year,
        cvc: this.cvc,
        redirect_url: this.redirect_url_success_wompi_credit,
        reference: reference,
        amount: this.investmentTotal.toString(),
        type: this.type.toString(),
        info_subcripcion: [
          {
            owner: this.owner_wompi_credit,
            project: this.project_wompi_credit,
            inversion: this.investmentTotal.toString(),
            impuestos: this.taxes ? this.taxes.toString() : '',
            meses: this.formInversion.value.dues,
            valor_mes: this.investmentTotal.toString(),
          },
        ],
        installments: this.formInversion.value.dues,
        prepayment: '0',
      };


      this.apiservice.post(`transaction`, body).subscribe(
        (res: any) => {
          console.log(res);
        },
        (error: any) => {
          console.log('error en enviar data', error);
        }
      );
    } else {
      this.sendDataInvestment();
    }
  };



  redirectPse(id: string) {

    const apiUrl = `${this.api_url_wompi_transactions}${id}`;

    // token Bearer
    const bearerToken = this.bearer_token_transactions;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${bearerToken}`,
      }),
    };

    this.http.get<any[]>(apiUrl, httpOptions).subscribe(
      (resPse: any) => {
        console.log('resPse', resPse);

        if (resPse) {
          if (resPse?.data?.status === 'PENDING') {
            let url = resPse?.data?.payment_method?.extra?.async_payment_url;

            console.log(url);

            if (url !== null || url !== undefined) {
              window.location.href = url;
            } else {
              window.location.href = `${origin}/payment/error`;
            }
          }
        }
      },
      (error) => {
        console.error('Error al obtener los documentos:', error);
      }
    );
  }

  paymentCards: PaymentCard[] = [];

  generarFecha(): Date {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + 1);

    return fecha;
  }

  changeDues(event: any) {
    this.body.patchValue({ document_type: event.value });
    console.log(this.body);
  }

  changeTypePerson(event: any) {
    this.body.patchValue({ type_person: event.value });
  }

  private patchForm() {
    let first_name = localStorage?.getItem('first_name');
    let last_name = localStorage?.getItem('last_name');
    let address = localStorage?.getItem('address');
    let document_type = localStorage?.getItem('document_type');
    let document_number = localStorage?.getItem('document_number');
    let phone = localStorage?.getItem('phone');
    let months = localStorage?.getItem('months');
    let investment = localStorage?.getItem('investment_total');
    let type = localStorage?.getItem('type');
    let taxes = localStorage?.getItem('taxes');
    let month_value = localStorage?.getItem('month_value')
    let investmentTotal = localStorage?.getItem('investment')

    if (Number(type) === 1) {
      this.paymentCards = [{ name: 'visa', selected: true }];
    } else {
      this.paymentCards = [{ name: 'pse', selected: true }];
    }

    this.opcionesSelectTypeDocument.forEach((doc) => {
      if (doc?.value === document_type) {
        doc.selected = true;
      }
    });

    // this.body.patchValue({
    //   first_name: `${first_name ?? ''} ${last_name ?? ''}`,
    // });
    // this.body.patchValue({ address });
    // this.body.patchValue({ document_number });
    // this.body.patchValue({ phone });
    // this.body.patchValue({ document_type });

    this.formInversion.value.dues = months;
    this.inversionValue = Number(investment) ?? 0;
    this.subtotal = Number(month_value);
    this.investmentTotal = Number(investmentTotal)
    this.taxes = Number(taxes) ?? 0;
    this.type = Number(type) ?? 0;
  }

  fetchDocumentsTypes() {
    this.opcionesSelect = [];
    const apiUrl = this.api_url_financial_institutions;

    // token Bearer
    const bearerToken = this.bearer_token_transactions;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${bearerToken}`,
      }),
    };

    this.http.get<any[]>(apiUrl, httpOptions).subscribe(
      (documentsData: any) => {
        const dataOptions = documentsData?.data?.map((item: any) => {
          return {
            name: item?.financial_institution_name,
            value: item?.financial_institution_code,
            selected: false,
          };
        });

        this.opcionesSelect = [...this.opcionesSelect, ...dataOptions];
      },
      (error) => {
        console.error('Error al obtener los documentos:', error);
      }
    );
  }

  onValorCambiado(event: any) {
    this.selectedCountry = event.valor.iso2;
  }

  stateChange(event: any) {
    console.log(event, 'state');

    this.selectedState = event.valor.iso2;
    this.nameCity = event.valor.name;
  }

  cityChange(event: any) {
    console.log(event, 'ciudad');

    this.selectedcity = event.valor.name;
  }
}
