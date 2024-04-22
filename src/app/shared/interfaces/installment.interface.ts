import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface IInstallmentCalculatorForm {
    client: FormControl<string | null>;
    total: FormControl<number | null>;
    totalInstallment: FormControl<number | null>;
}




export interface IInstallmentCalculator {
    total: number;
    totalInstallment: number;
    installments: IInstallment[];
}





export interface IInstallment {
    amount: number;
    index: number;
    date: number;
    fixedAmount?: number;
}