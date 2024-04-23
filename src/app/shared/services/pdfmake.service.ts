import { Injectable, inject } from '@angular/core';
import { TDocumentDefinitions, Content, UnorderedListElement, Column } from 'pdfmake/interfaces';
import * as pdfMake from "pdfmake/build/pdfmake";
import { IInstallment, IInstallmentCalculator } from '../interfaces/installment.interface';
import { DatePipe, DecimalPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ConfigService } from './config.service';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;



@Injectable({
    providedIn: 'root'
})
export class InstallmentPDFMakeService {

    private _executive: string | null;
    private _configService: ConfigService = inject(ConfigService);

    constructor() {
        this._executive = this._configService.getExecutive();
    }


    async openPDF(installments: IInstallment[], data: IInstallmentCalculator) {
        try {
            const titlePipe = new TitleCasePipe();
            const upperPipe = new UpperCasePipe();

            const content: Content = [
                {
                    bold: true,
                    fontSize: 24,
                    color: '#0000ff',
                    text: [
                        { text: 'KON' }, { text: '3', color: '#ff0000', }, { text: 'CTADOS' },
                    ],
                },
                {
                    color: '#0000ff',
                    text: [
                        { text: 'TU C' }, { text: '3', color: '#ff0000' }, { text: 'NTRO DE CONTACTOS' },
                    ],
                    marginBottom: 20,
                },
                {
                    text: `Especialista: ${titlePipe.transform(this._executive)}`,
                    fontSize: 12,
                    bold: true,
                    marginLeft: 30,
                    italics: true,
                },
                {
                    text: `
                    Cliente: ${titlePipe.transform(data.clientName)}
                    ${data.RUT ? 'RUT: '+ upperPipe.transform(data.RUT) : ''}
                    ${data.address ? 'Dirección: '+ titlePipe.transform(data.address) : ''}
                    \n`,
                    fontSize: 12,
                    bold: true,
                    marginLeft: 30,
                    italics: true,
                },
                {
                    text: `Estimad@, Acá los detalles para la elaboración de cada cheque!.`,
                    fontSize: 10,
                    alignment: 'center',
                },
                {
                    ul: this._installentFiles(installments, data.total),
                    italics: true,
                    lineHeight: installments.length > 20 ? 1.4 : 1.8,
                    margin: [40, 10, 40, 10],
                },
            ];

            const docDefinition: TDocumentDefinitions = {
                content,
                pageSize: installments.length > 20 ? 'LEGAL' : 'A4',
                footer: {
                    text: `NOTA: Cada cheque debe ir: tachado a la orden del portador, cruzado, nominativo y endosado. \nA nombre de Soc. Consecionaria Autopista Central S.A`,
                    alignment: 'center'
                },
                pageMargins: [20, 20, 20, 30],
            };
            pdfMake.createPdf(docDefinition).open();
        } catch (error) {
            console.log({ catch: 'InstallmentPDFMakeService: openPDF', error });
        }
    }







    private _installentFiles(installments: IInstallment[], total: number): UnorderedListElement[] {
        const decimalPipe = new DecimalPipe('en-US');
        const datePipe = new DatePipe('en-US');
        const ul: UnorderedListElement[] = [{
            listType: 'none',
            bold: true,
            columns: this._parseColumns(
                'Cheque', 'Fecha', 'Monto'
            )
        }];
        for (let i = 0; i < installments.length; i++) {
            const installment = installments[i];
            ul.push({
                listType: 'none',
                columns: this._parseColumns(
                    `Cheque Nro: ${installment.index}`,
                    datePipe.transform(installment.date, 'dd-MM-yyyy') || '',
                    decimalPipe.transform(installment.fixedAmount || installment.amount, '0.2-2') || '')
            })
        }



        ul.push({
            listType: 'none',
            bold: true,
            columns: this._parseColumns(
                `Total: ${decimalPipe.transform(total, '0.2-2')}`
            )
        })
        return ul;
    }






    private _parseColumns(...texts: string[]): Column[] {
        return texts.map((text, i) => {
            return {
                width: `${100 / texts.length}%`,
                alignment: (i + 1 == texts.length) ? 'right' : 'justify',
                text
            }
        });
    }






    private _getBase64ImageFromURL(url: string) {
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.setAttribute("crossOrigin", "anonymous");

            img.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                var ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);

                var dataURL = canvas.toDataURL("image/png");

                resolve(dataURL);
            };

            img.onerror = error => {
                reject(error);
            };

            img.src = url;
        });
    }

}