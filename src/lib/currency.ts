/**
 * Currency formatting utility for Nigerian Naira (₦)
 */

export const CURRENCY_SYMBOL = '₦';
export const CURRENCY_CODE = 'NGN';

/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param showDecimal - Whether to show decimal places (default: false for whole numbers)
 */
export function formatCurrency(amount: number | string | undefined | null, showDecimal = false): string {
  if (amount === undefined || amount === null || amount === '') {
    return `${CURRENCY_SYMBOL}0`;
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${CURRENCY_SYMBOL}0`;
  }
  
  if (showDecimal) {
    return `${CURRENCY_SYMBOL}${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return `${CURRENCY_SYMBOL}${numAmount.toLocaleString('en-NG')}`;
}

/**
 * Format currency for display in compact form (e.g., ₦1.5k, ₦2.3M)
 */
export function formatCurrencyCompact(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) {
    return `${CURRENCY_SYMBOL}0`;
  }
  
  if (amount >= 1000000) {
    return `${CURRENCY_SYMBOL}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}k`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-NG')}`;
}
