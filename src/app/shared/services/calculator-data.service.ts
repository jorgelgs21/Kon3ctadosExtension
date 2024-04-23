import { TitleCasePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { AlertModel } from "../models/alert.model";
import { IInstallmentCalculator } from "../interfaces/installment.interface";

@Injectable({
    providedIn: 'root',
})
export class CalculatorDataService {


    private _key: string = 'calculator_data_changes';


    async setCalculatorData(data: IInstallmentCalculator) {
        try {
            localStorage.setItem(this._key, JSON.stringify(data));
        } catch (error) {
            console.log({ catch: 'CalculatorDataService: setCalculatorData', error });
        }
    }

    getCalculatorData() {
        try {
            const strJson = localStorage.getItem(this._key);
            return strJson ? JSON.parse(strJson) as IInstallmentCalculator : null;
        } catch (error) {
            console.log({ catch: 'CalculatorDataService: getCalculatorData', error });
            return null;
        }
    }
}