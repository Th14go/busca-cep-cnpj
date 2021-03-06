import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { CEPError, CEPErrorCode, NgxViacepService } from '@brunoc/ngx-viacep';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { catchError, EMPTY } from 'rxjs';
import { CepService } from './cep.service';

@Component({
  selector: 'app-cep',
  templateUrl: './cep.component.html',
  styleUrls: ['./cep.component.css'],
})
export class CepComponent implements OnInit {
  @Input()titleHome = 'Consultando CEP';
  buscar: boolean;
  buscacep: string;

  constructor(
    private cepService: CepService,
    private spinner: NgxSpinnerService,
    private viacep: NgxViacepService,
    private messageService: MessageService,
    private toastr: ToastrService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle('Buscando CEP');
  }

  consultaCEP(cep, form) {
    this.resetFormCep(form);
    this.spinner.show();
    this.viacep
      .buscarPorCep(this.buscacep)
      .pipe(
        catchError((error: CEPError) => {
          switch (error.getCode()) {
            case CEPErrorCode.CEP_VAZIO:
              // this.cepVazio();
              this.buscar = false;
              this.spinner.hide();
              break;
            case CEPErrorCode.CEP_NAO_ENCONTRADO:
              this.cepNaoEncontrado();
              this.buscar = false;
              this.spinner.hide();
              break;
            case CEPErrorCode.CEP_MUITO_CURTO:
              this.buscar = false;
              this.cepCurto();
              this.spinner.hide();
              break;
          }
          return EMPTY;
        })
      )
      .subscribe((dados) => {
        this.buscar = true;
        this.spinner.hide();
        setTimeout(() => {
          this.populaCEPForm(dados, form);
        }, 100);
      });
  }

  populaCEPForm(dados, formulario) {
    formulario.form.patchValue({
      logradouro: dados.logradouro.toUpperCase(),
      localidade: dados.localidade.toUpperCase(),
      bairro: dados.bairro.toUpperCase(),
      numero: dados.numero,
      complemento: dados.complemento.toUpperCase(),
      uf: dados.uf.toUpperCase(),
    });
  }

  resetFormCep(formulario) {
    formulario.form.patchValue({
      logradouro: null,
      localidade: null,
      bairro: null,
      numero: null,
      complemento: null,
      uf: null,
    });
  }

  cepVazio() {
    this.messageService.add({
      severity: 'info',
      summary: 'Aten????o',
      detail: 'Cep vazio!',
    });
  }
  cepCurto() {
    this.messageService.add({
      severity: 'info',
      summary: 'Aten????o',
      detail: 'Cep muito curto!',
    });
  }
  cepNaoEncontrado() {
    this.messageService.add({
      severity: 'error',
      summary: 'Aten????o',
      detail: 'Cep n??o encontrado!',
    });
  }
  // TODO toastr lib externa
  // cepCurto() {
  //   this.toastr.success('Cep muito curto', '???? Aten????o');
  // }
}
