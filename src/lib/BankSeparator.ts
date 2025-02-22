export const BankSeparator = (bank:string) => {
    const bankBCA = bank.match(/BCA(?!.*DIGITAL)(?!.*SYARIAH)/i) ? "BCA" : null;
    const bankBRI = bank.match(/BRI/i) ? "BRI" : null;
    const bankBNI = bank.match(/BNI/i) ? "BNI" : null;
    const bankDanamon = bank ? "DANAMON" : null;
    const sanitizerBank = bankBCA || bankBRI || bankBNI || bankDanamon;
    return sanitizerBank
}