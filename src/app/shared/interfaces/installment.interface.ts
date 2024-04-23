import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface IInstallmentCalculatorForm {
    clientName: FormControl<string | null>;
    address: FormControl<string | null>;
    RUT: FormControl<string | null>;
    date: FormControl<string | null>;
    total: FormControl<number | null>;
    totalInstallment: FormControl<number | null>;
}



export interface IInstallmentCalculator {
    clientName: string;
    address?: string;
    RUT?: string;
    total: number;
    totalInstallment: number;
}





export interface IInstallment {
    amount: number;
    index: number;
    date: number;
    fixedAmount?: number;
}