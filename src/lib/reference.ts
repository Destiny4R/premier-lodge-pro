// src/lib/reference.ts
export const generateTransactionRef = (prefix: string = "HTL"): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}-${timestamp}-${random}`;
};