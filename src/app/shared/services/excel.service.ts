import { Injectable, inject } from "@angular/core";
import { Workbook, Worksheet } from "exceljs";
import { saveAs } from "file-saver";
import { AlertModel } from "../models/alert.model";
import { IInstallment, IInstallmentCalculator } from "../interfaces/installment.interface";
import { DatePipe, TitleCasePipe, UpperCasePipe } from "@angular/common";
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


    public async downloadInstallments(installments: IInstallment[], data: IInstallmentCalculator) {
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
            const B = ws.getColumn("B");
            A.width = 16;
            B.width = 16;
            A.style = { font: { bold: true } };
            A.alignment = { horizontal: 'right' };
            B.alignment = { horizontal: 'left' };

            ws.getCell(1, 1).value = 'Ejecutivo:';
            ws.getCell(1, 2).value = `${titlePipe.transform(this._executive)}`;

            ws.getCell(2, 1).value = 'Cliente:';
            ws.getCell(2, 2).value = `${titlePipe.transform(data.clientName)}`;

            if (data.RUT) {
                ws.getCell(3, 1).value = 'RUT:';
                ws.getCell(3, 2).value = `${upperPipe.transform(data.RUT)}`;
            }

            if (data.address) {
                ws.getCell(4, 1).value = 'Dirección:';
                ws.getCell(4, 2).value = `${upperPipe.transform(data.address)}`;
            }

            this._addTableInstallments(ws, installments);

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer]);
            saveAs(blob, `CUOTAS_${data.clientName.trim().split(' ').join('-')}.xlsx`);

            await AlertModel.success(`Cuotas Descargadas Correctamente!`)
        } catch (error) {
            console.log({ catch: 'InstallmentExcelService: downloadInstallments', error });
        }
    }














    private _addTableInstallments(ws: Worksheet, installments: IInstallment[]) {
        const C = ws.getColumn("C");
        const D = ws.getColumn("D");
        const E = ws.getColumn("E");
        C.width = 20;
        D.width = 20;
        E.width = 20;
        C.alignment = { horizontal: 'center' };
        D.alignment = { horizontal: 'center' };
        E.numFmt = '#,##0.00';

        const datePipe = new DatePipe('en-US');

        ws.addTable({
            name: 'CUOTAS',
            ref: 'C6',
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