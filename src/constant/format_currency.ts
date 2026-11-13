export interface FormatCurrencyOptions {
    locale?: string;
    maximumFractionDigits?: number;
    fallbackText?: string;
}

export function formatCurrency(
    value: number | string | null | undefined,
    options: FormatCurrencyOptions = {}
): string {
    const {
        locale = "id-ID",
        maximumFractionDigits = 0,
        fallbackText = "0",
    } = options;

    if (value === null || value === undefined || value === "") {
        return fallbackText;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "Invalid number";
    }

    return new Intl.NumberFormat(locale, {
        style: "decimal",
        maximumFractionDigits,
    }).format(amount);
}