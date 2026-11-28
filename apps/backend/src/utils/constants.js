export const CURRENCY = 'USD';
export const ISSS_EMPLEADO = 0.03;
export const AFP_EMPLEADO = 0.0725;
export const ISSS_MAXIMO_QUINCENAL = 500.00; //  mensual ($1,000.00)/2
export const AFP_MAXIMO_QUINCENAL = 3800.00; //  mensual ($7,600.00)/2

export const HACIENDA_QUINCENAL = [
    {
        min: 0.01,
        max: 275.00,
        rate: 0,
        fixedFee: 0,
        excessFrom: 0
    },
    {
        min: 275.01,
        max: 447.62,
        rate: 0.10,
        fixedFee: 8.83,
        excessFrom: 275.00
    },
    {
        min: 447.63,
        max: 1019.05,
        rate: 0.20,
        fixedFee: 30.00,
        excessFrom: 447.62
    },
    {
        min: 1019.06,
        max: Infinity,
        rate: 0.30,
        fixedFee: 144.28,
        excessFrom: 1019.05
    }
];
