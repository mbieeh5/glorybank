export const BankSeparator = (bank:string) => {
    const bankBCA = bank.match(/BCA(?!.*DIGITAL)(?!.*SYARIAH)/i) ? "BCA" : null;
    const bankBRI = bank.match(/BRI/i) ? "BRI" : null;
    const bankDanamon = bank ? "DANAMON" : null;
    const sanitizerBank = bankBCA || bankBRI || bankDanamon;
    return sanitizerBank
}