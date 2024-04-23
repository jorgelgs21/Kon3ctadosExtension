import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IInstallment, IInstallmentCalculator, IInstallmentCalculatorForm } from "../shared/interfaces/installment.interface";
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonItem, IonInput, IonLabel, IonBadge, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, IonModal, IonDatetime, IonDatetimeButton, IonList, IonListHeader, IonCardHeader, IonCardSubtitle, IonFab, IonButton, IonFooter, IonButtons, IonIcon, IonText } from "@ionic/angular/standalone";
import { DatePipe, DecimalPipe } from "@angular/common";
import { IonInputCustomEvent, InputInputEventDetail, IonDatetimeCustomEvent, DatetimeChangeEventDetail } from "@ionic/core";
import { AlertModel } from "../shared/models/alert.model";
import { addIcons } from "ionicons";
import { downloadOutline, personOutline, addOutline } from "ionicons/icons";
import { InstallmentPDFMakeService } from "../shared/services/pdfmake.service";
import { InstallmentExcelService } from "../shared/services/excel.service";
import { ConfigService } from "../shared/services/config.service";
import { MaskitoModel } from "../shared/models/maskito.model";
import { MaskitoDirective } from "@maskito/angular";
import { CalculatorDataService } from "../shared/services/calculator-data.service";

@Component({
    standalone: true,
    templateUrl: 'installment-calculator.component.html',
    imports: [IonText, IonIcon, IonButtons, IonFooter, IonButton, IonFab, IonCardSubtitle, IonCardHeader, IonListHeader, IonList, IonDatetimeButton, IonDatetime, IonModal, IonCol, IonRow, IonGrid, IonBadge, IonSelect, IonSelectOption, IonLabel, IonInput, IonItem, IonCardContent, IonCard, IonContent, IonTitle, IonToolbar, IonHeader, ReactiveFormsModule, DatePipe, DecimalPipe, MaskitoDirective],
})
export default class InstallmentCalculatorComponent {
    public installmentForm!: FormGroup<IInstallmentCalculatorForm>;
    public installments: IInstallment[] = [];
    public installmentList: number[] = [];
    public localDateISO = new Date().toISOString();
    public requireAddress!: boolean;


    private _formBuilder: FormBuilder = inject(FormBuilder);
    private _installmentPDFMakeService: InstallmentPDFMakeService = inject(InstallmentPDFMakeService);
    private _installmentExcelService: InstallmentExcelService = inject(InstallmentExcelService);
    private _configService: ConfigService = inject(ConfigService);
    private _calculatorDataService: CalculatorDataService = inject(CalculatorDataService);


    readonly amountMask = MaskitoModel.amountMask;
    readonly maskitoElement = (el: any) => (el as HTMLIonInputElement).getInputElement();



    constructor() {
        addIcons({ downloadOutline, personOutline, addOutline });
        this._loadForm();
        const data = this._calculatorDataService.getCalculatorData();
        if (data) {
            this.installmentForm.patchValue(data);
            this._parseInstallmentList(data.total);
            this.requireAddress = !!data.address
        }
    }






    changeTotal(event: IonInputCustomEvent<InputInputEventDetail>) {
        this._parseInstallmentList(event.detail.value);
    }


    private _parseValue(value: any): number {
        return parseFloat(((`${value}`)).split('.').join('')) || 0;
    }

    private _parseInstallmentList(value: any) {
        value = this._parseValue(value);

        const totalInstallment = value > 3000000
            ? 36
            : value > 1000000
                ? 24
                : value > 360000
                    ? 12
                    : value > 0
                        ? Math.floor(value / 30000)
                        : 0;

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
        const total = this._parseValue(this.installmentForm.controls.total.value);
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





    async setExecutive() {
        this._configService.setExecutive();
    }




    clickedReset() {
        this.installments = [];
        this.installmentList = [];
        this.installmentForm.reset();
        this.requireAddress = false;
        this.installmentForm.patchValue({ date: this.localDateISO });
    }






    downloadPDF() {
        const data = this._parseFormData();
        if (!data || !this.installments.length) return;
        this._installmentPDFMakeService.openPDF(this.installments, data);
    }

    private _parseFormData(): IInstallmentCalculator | null {
        let { address, clientName, date, total, totalInstallment, RUT } = this.installmentForm.value;
        total = this._parseValue(total);

        if (!clientName || !date || !total || !totalInstallment) {
            AlertModel.error(`Error`, `Llena todos los campos del formulario!`);
            return null;
        }
        return {
            RUT: RUT || '', address: address || '', clientName, total, totalInstallment
        }
    }

    async downloadEXCEL() {
        const data = this._parseFormData();
        if (!data || !this.installments.length) return;
        this._installmentExcelService.downloadInstallments(this.installments, data);
    }








    private _loadForm() {
        this.installmentForm = this._formBuilder.group<IInstallmentCalculatorForm>({
            total: this._formBuilder.control(null, Validators.required),
            totalInstallment: this._formBuilder.control(null, Validators.required),
            date: this._formBuilder.control(this.localDateISO, Validators.required),
            clientName: this._formBuilder.control(null, Validators.required),
            RUT: this._formBuilder.control(null),
            address: this._formBuilder.control(null),
        });


        this.installmentForm.valueChanges.subscribe(value => {
            this._calculatorDataService.setCalculatorData(value as IInstallmentCalculator);

            let { total, totalInstallment } = value;

            this.installments = [];

            if (!total || !totalInstallment) return;

            total = this._parseValue(total);


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