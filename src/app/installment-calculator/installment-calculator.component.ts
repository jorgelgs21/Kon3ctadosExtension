import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { IInstallment, IInstallmentCalculatorForm } from "../shared/interfaces/installment.interface";
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonItem, IonInput, IonLabel, IonBadge, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, IonModal, IonDatetime, IonDatetimeButton, IonList, IonListHeader, IonCardHeader, IonCardSubtitle, IonFab, IonButton, IonFooter, IonButtons, IonIcon } from "@ionic/angular/standalone";
import { DatePipe, DecimalPipe } from "@angular/common";
import { IonInputCustomEvent, InputInputEventDetail, IonDatetimeCustomEvent, DatetimeChangeEventDetail } from "@ionic/core";
import { AlertModel } from "../shared/models/alert.model";
import { addIcons } from "ionicons";
import { downloadOutline, personOutline } from "ionicons/icons";
import { InstallmentPDFMakeService } from "../shared/services/pdfmake.service";
import { InstallmentExcelService } from "../shared/services/excel.service";
import { ConfigService } from "../shared/services/config.service";

@Component({
    standalone: true,
    templateUrl: 'installment-calculator.component.html',
    imports: [IonIcon, IonButtons, IonFooter, IonButton, IonFab, IonCardSubtitle, IonCardHeader, IonListHeader, IonList, IonDatetimeButton, IonDatetime, IonModal, IonCol, IonRow, IonGrid, IonBadge, IonSelect, IonSelectOption, IonLabel, IonInput, IonItem, IonCardContent, IonCard, IonContent, IonTitle, IonToolbar, IonHeader, ReactiveFormsModule, DatePipe, DecimalPipe],
})
export default class InstallmentCalculatorComponent {
    public installmentForm!: FormGroup<IInstallmentCalculatorForm>;
    public installments: IInstallment[] = [];
    public installmentList: number[] = [];
    public localDateISO = new Date().toISOString();


    private _formBuilder: FormBuilder = inject(FormBuilder);
    private _InstallmentPDFMakeService: InstallmentPDFMakeService = inject(InstallmentPDFMakeService);
    private _InstallmentExcelService: InstallmentExcelService = inject(InstallmentExcelService);
    private _configService: ConfigService = inject(ConfigService);

    

    constructor() {
        addIcons({ downloadOutline, personOutline })
        this._loadForm();
    }






    changeTotal(event: IonInputCustomEvent<InputInputEventDetail>) {
        const value = parseFloat(`${event.detail.value}`);
        const totalInstallment = value > 3000000 ? 36 : value > 1000000 ? 24 : value > 40000 ? 12 : 0;
        this.installmentList = [];
        for (let i = 0; i < totalInstallment; i++) {
            this.installmentList.push(i + 1);
        }
        if (!this.installmentList.length) {
            this.installmentForm.controls.totalInstallment.reset();
        }
    }









    onChangeDate(ev: IonDatetimeCustomEvent<DatetimeChangeEventDetail>) {
        const { value } = ev.detail;
        if (typeof value == 'string') this.localDateISO = value;
        const _date = new Date(this.localDateISO);
        this.installments.map((installment, i) => {
            installment.date = !i ? _date.getTime() : _date.setMonth(_date.getMonth() + 1);
        })
    }







    async clickInstallment(installment: IInstallment) {
        if (installment.index == this.installments.length) {
            return AlertModel.error('No Puedes Editar la ultima cuota');
        }
        const { index } = installment;
        const value = await AlertModel.formInteger(
            `Cambiar Monto Cuota: ${installment.index}`, 'Ingrese el nuevo Monto!');

        if (!value) return;
        installment.fixedAmount = value;
        this.installments.splice(index - 1, 1, installment);

        const fixed = this.installments.filter(i => i.fixedAmount);
        const noFixed = this.installments.filter(i => !i.fixedAmount);
        const noFixedLength = noFixed.length;
        const totalFixed = fixed.map(i => <number>i.fixedAmount).reduce((p, c) => p + c, 0);
        const total = <number>this.installmentForm.controls.total.value;
        const remaining = total - totalFixed;



        const closeAmount = this._roundNumberClose(remaining / noFixedLength);


        noFixed.map(installment => {
            if (installment.index == this.installments.length) {
                installment.amount = remaining - (closeAmount * (noFixed.length - 1));
            } else {
                installment.amount = closeAmount;
            }
        })

        this.installments = [...fixed, ...noFixed].sort((a, b) => a.index - b.index);
    }





    async setExecutive(){
        this._configService.setExecutive();
    }





    clickedReset(){
        this.installments = [];
        this.installmentList = [];
        this.localDateISO = new Date().toISOString();
        this.installmentForm.reset();
    }






    downloadPDF() {
        const total = this.installmentForm.controls.total.value;
        const clientName = this.installmentForm.controls.client.value;
        if (!this.installments.length || !total) return;
        this._InstallmentPDFMakeService.openPDF(this.installments, total, clientName || '...');
    }
    
    async downloadEXCEL() {
        const RUT = await AlertModel.formText(`Rut del Cliente`);
        const total = this.installmentForm.controls.total.value;
        const clientName = this.installmentForm.controls.client.value;
        if (!this.installments.length || !total || !RUT) return;
        this._InstallmentExcelService.downloadInstallments(this.installments, RUT, clientName || '...');
    }








    private _loadForm() {
        this.installmentForm = this._formBuilder.group<IInstallmentCalculatorForm>({
            total: this._formBuilder.control(null),
            totalInstallment: this._formBuilder.control(null),
            client: this._formBuilder.control(null),
        });


        this.installmentForm.valueChanges.subscribe(value => {
            const { total, totalInstallment } = value;

            this.installments = [];

            if (!total || !totalInstallment) return;

            const _date = new Date(this.localDateISO);
            for (let index = 1; index <= totalInstallment; index++) {
                let amount = this._roundNumberClose(total / totalInstallment);

                if (index == totalInstallment) {
                    amount = total - this.installments.map(i => i.amount).reduce((p, c) => p + c, 0);
                }
                this.installments.push({
                    amount,
                    date: index > 1 ? _date.setMonth(_date.getMonth() + 1) : _date.getTime(),
                    index,
                });
            }
        });
    }







    private _roundNumberClose(value: number) {
        const div = value >= 1000 ? 1000 : value >= 100 ? 100 : 1;
        return Math.floor(value / div) * div;
    }
}