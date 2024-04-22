import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { maskitoPhoneOptionsGenerator } from "@maskito/phone";
import metadata from "libphonenumber-js/min/metadata";



export abstract class MaskitoModel {

    static phoneMask = maskitoPhoneOptionsGenerator({
        countryIsoCode: 'US',
        strict: false,
        metadata,
    });

    static priceMask = maskitoNumberOptionsGenerator({
        min: 0,
        precision: 1,
        thousandSeparator: ""
    })

    static yearMask(min: number = 2000, max?: number) {
        return maskitoNumberOptionsGenerator({
            min,
            max: max || new Date().getFullYear() + 1,
            thousandSeparator: ""
        })
    }


    static ageMask: MaskitoOptions = {
        mask: /^\d{0,1}[0-99]$/
    }


    static zipCodeMask: MaskitoOptions = {
        mask: [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
    }
}
