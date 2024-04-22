import { TitleCasePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { AlertModel } from "../models/alert.model";

@Injectable({
    providedIn: 'root',
})
export class ConfigService {


    private _key: string = 'executive';


    async setExecutive() {
        try {
            const titlePipe = new TitleCasePipe();
            const name = await AlertModel.formText(
                `Nombre de Ejecutivo`, 
                'ingrese su nombre', 
                undefined, this.getExecutive() || '');
            if (!name) return;
            localStorage.setItem(this._key, titlePipe.transform(name));
            AlertModel.success(`Nombre de ejecutivo guardado con éxito!`);
        } catch (error) {
            console.log({ catch: 'ConfigService: setExecutive', error });
        }
    }

    getExecutive() {
        try {
            return localStorage.getItem(this._key);
        } catch (error) {
            console.log({ catch: 'ConfigService: getExecutive', error });
            return null;
        }
    }
}