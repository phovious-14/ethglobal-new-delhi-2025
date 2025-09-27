export const validateAmount = (amount: string, balances: any): string => {
    if (!amount) {
        return 'Amount is required';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return 'Amount must be greater than 0';
    }
    if (!balances?.superToken) {
        return 'Unable to fetch balance';
    }
    const balanceNum = parseFloat(balances.superToken);
    if (numAmount > balanceNum) {
        return `Insufficient balance. You have ${balances.superToken} ${balances.superTokenSymbol}`;
    }
    return '';
};