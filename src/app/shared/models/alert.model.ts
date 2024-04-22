import Swal, { SweetAlertIcon } from 'sweetalert2';

export abstract class AlertModel {

    private static _timer = 2000;

    static async success(title: string, text?: string) {
        await this._alert(title, 'success', text);
    }



    static async error(title?: string, text?: string) {
        await this._alert(title || 'Ocurrio un error inesperado!', 'error', text);
    }



    static async warning(title: string, text?: string) {
        await this._alert(title, 'warning', text);
    }


    static async info(title: string, text?: string) {
        await this._alert(title, 'info', text);
    }


    static async question(title: string, text?: string) {
        await this._alert(title, 'question', text);
    }





    private static async _alert(
        title: string,
        icon: 'success' | 'error' | 'warning' | 'info' | 'question',
        text?: string,
    ) {
        await Swal.fire({
            title,
            text,
            icon,
            heightAuto: false,
            showConfirmButton: false,
            timer: AlertModel._timer,
        });
    }







    static async confirm(
        title: string,
        text: string = 'Seguro de Seguir Adelante?',
        imageUrl?: string,
    ) {
        const { isConfirmed } = await Swal.fire({
            title,
            text,
            icon: imageUrl ? undefined : 'question',
            imageUrl,
            imageHeight: 200,
            heightAuto: false,
            showCancelButton: true,
        });
        return isConfirmed;
    }








    public static toast(title: string, icon: SweetAlertIcon = 'success') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: AlertModel._timer,
        })

        Toast.fire({
            title,
            icon,
        })
    }



    public static async showLoading(title?: string, html?: string) {
        await Swal.fire({
            title,
            html,
            timer: AlertModel._timer,
            didOpen: () => {
                Swal.showLoading()
            }
        })
    }



    public static async processing(title?: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: AlertModel._timer,
            didOpen: (toast) => {
                Swal.showLoading()
            }
        })

        await Toast.fire({
            title: title || 'procesando...'
        })
    }


    public static cancel(title?: string, icon: SweetAlertIcon = 'info') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: AlertModel._timer
        })

        Toast.fire({
            title,
            icon
        })
    }




    static async formSelect(
        title: string,
        inputPlaceholder: string,
        inputOptions: any,
    ) {
        const { value: selection } = await Swal.fire({
            title,
            input: 'select',
            inputOptions,
            inputPlaceholder,
            heightAuto: false,
            showCancelButton: true,
        })

        return selection || null;
    }

    static async formInteger(
        title: string,
        message: string = "Enter Amount",
        imageUrl?: string,
        inputValue?: number,
    ) {
        return await AlertModel.formNumber(title, message, imageUrl, inputValue);
    }



    static async formNumber(
        title: string,
        message: string = "Enter Amount",
        imageUrl?: string,
        inputValue?: number,
    ) {
        const { value } = await Swal.fire({
            title,
            html: `<p>${message}<p>`,
            input: 'number',
            inputValue,
            heightAuto: false,
            showCancelButton: true,
            imageUrl,
            imageHeight: 200
        })
        const n = parseFloat(value);
        return isNaN(n) ? undefined : n;
    }





    static async formText(
        title: string,
        message?: string,
        imageUrl?: string,
        inputValue: string = '',
    ) {
        const { value } = await Swal.fire<string>({
            title,
            html: message ? `<p>${message}<p>` : undefined,
            input: "text",
            inputValue,
            heightAuto: false,
            inputAutoFocus: true,
            showCancelButton: true,
            imageUrl,
            imageHeight: 200
        })
        return value;
    }






    static async formRadio(
        title: string,
        inputOptions: Record<string, any>,
        imageUrl?: string,
    ) {
        const { value } = await Swal.fire({
            title,
            input: "radio",
            inputOptions,
            imageUrl,
            imageHeight: 200,
            heightAuto: false,
            inputAutoFocus: true,
            showCancelButton: true,
        });
        return value || undefined;
    }
}