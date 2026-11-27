export function formatDate(value: string | null | undefined): string | null{
    if(!value) return 'Not available'
    
    const date = new Date(value)

    if(Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}