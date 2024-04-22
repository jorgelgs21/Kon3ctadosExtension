export abstract class DateModel {
    static msStartDate(date?: Date) {
        if (!date) date = new Date();
        return +new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }



    static localDateISO(date?: Date) {
        if (!date) date = new Date();
        return new Date(+date.getTime() - (3600 * 4 * 1000)).toISOString();
    }

}