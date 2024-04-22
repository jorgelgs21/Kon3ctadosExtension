import { Injectable, inject } from "@angular/core";
import { Workbook, Worksheet } from "exceljs";
import { saveAs } from "file-saver";
import { AlertModel } from "../models/alert.model";
import { IInstallment } from "../interfaces/installment.interface";
import { DatePipe, DecimalPipe, TitleCasePipe, UpperCasePipe } from "@angular/common";
import { ConfigService } from "./config.service";

@Injectable({
    providedIn: 'root'
})
export class InstallmentExcelService {

    private _executive: string | null;
    private _configService: ConfigService = inject(ConfigService);

    constructor() {
        this._executive = this._configService.getExecutive();
    }


    public async downloadInstallments(installments: IInstallment[], RUT: string, clientName: string) {
        try {
            const titlePipe = new TitleCasePipe();
            const upperPipe = new UpperCasePipe();

            if (!installments.length) {
                return await AlertModel.error(`Sin Cuotas que Guardar`);
            }
            const workbook = new Workbook();
            workbook.creator = 'KON3CTADOS EXTENSION';
            const ws = workbook.addWorksheet('Cuotas');

            const A = ws.getColumn("A");
            A.width = 16;
            A.alignment = { horizontal: 'right' };
            A.style = { font: { bold: true } };

            ws.getCell(1, 1).value = 'Ejecutivo:';
            ws.getCell(1, 2).value = `${titlePipe.transform(this._executive)}`;

            ws.getCell(2, 1).value = 'Cliente:';
            ws.getCell(2, 2).value = `${titlePipe.transform(clientName)}`;

            ws.getCell(3, 1).value = 'RUT:';
            ws.getCell(3, 2).value = `${upperPipe.transform(RUT)}`;

            this._addTableInstallments(ws, installments);

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer]);
            saveAs(blob, `CUOTAS_${clientName.trim().split(' ').join('-')}.xlsx`);

            await AlertModel.success(`Cuotas Descargadas Correctamente!`)
        } catch (error) {
            console.log({ catch: 'InstallmentExcelService: downloadInstallments', error });
        }
    }














    private _addTableInstallments(ws: Worksheet, installments: IInstallment[]) {
        const B = ws.getColumn("B");
        const C = ws.getColumn("C");
        const D = ws.getColumn("D");
        B.width = 20;
        C.width = 20;
        D.width = 20;
        B.alignment = { horizontal: 'center' };
        C.alignment = { horizontal: 'center' };
        D.numFmt = '#,##0.00';

        const datePipe = new DatePipe('en-US');

        ws.addTable({
            name: 'CUOTAS',
            ref: 'B5',
            headerRow: true,
            totalsRow: true,
            columns: [
                { name: 'CHEQUE', totalsRowFunction: 'count', filterButton: false },
                { name: 'FECHA' },
                { name: 'MONTO', totalsRowFunction: 'sum' },
            ],
            rows: installments.map(i => {
                return [
                    `Nro: ${i.index}`,
                    datePipe.transform(i.date, 'dd-MM-yyyy'),
                    i.fixedAmount || i.amount
                ]
            }),
            style: { theme: 'TableStyleLight9' }
        });
    }
}