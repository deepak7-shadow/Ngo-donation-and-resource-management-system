export function generateId(prefix: string = 'ID'): string {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomPart}`;
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `HS-80G-${year}-${random}`;
}

export function generateTxnRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = 'TXN';
  for (let i = 0; i < 9; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}
