export function formatCurrency(value) {
    if (value == null || value === "") {
        return "Not set";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "Invalid amount";
    }

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);
}