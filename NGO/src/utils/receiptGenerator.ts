import type { Donation } from '../types';

export interface TaxReceiptDetails {
  receiptNumber: string;
  donationDate: string;
  donorName: string;
  donorEmail: string;
  donorTaxId?: string;
  amount: number;
  currency: string;
  amountInWords: string;
  paymentMethod: string;
  transactionRef: string;
  campaignName: string;
  ngoRegistrationNo: string;
  taxExemptionCode: string;
  ngoName: string;
  ngoAddress: string;
}

function numberToWords(num: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  if (num === 0) return 'Zero';

  function convertChunk(n: number): string {
    let s = '';
    if (n >= 100) {
      s += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      s += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      s += ones[n] + ' ';
    }
    return s.trim();
  }

  let words = '';
  if (num >= 1000000) {
    words += convertChunk(Math.floor(num / 1000000)) + ' Million ';
    num %= 1000000;
  }
  if (num >= 1000) {
    words += convertChunk(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num > 0) {
    words += convertChunk(num);
  }

  return words.trim() + ' Dollars Only';
}

export function generateReceiptData(donation: Donation): TaxReceiptDetails {
  return {
    receiptNumber: donation.receiptNumber,
    donationDate: donation.createdAt,
    donorName: donation.anonymous ? 'Anonymous Benefactor' : donation.donorName,
    donorEmail: donation.donorEmail,
    donorTaxId: donation.donorTaxId || 'N/A',
    amount: donation.amount,
    currency: donation.currency || 'USD',
    amountInWords: numberToWords(donation.amount),
    paymentMethod: donation.paymentMethod.toUpperCase(),
    transactionRef: donation.transactionRef,
    campaignName: donation.campaignName,
    ngoName: 'HopeSphere Foundation Inc.',
    ngoAddress: '440 Humanitarian Way, Suite 300, New York, NY 10001, USA',
    ngoRegistrationNo: 'EIN: 84-2948192 | NGO Trust Reg: HS/80G/9941/2021',
    taxExemptionCode: 'Valid under Section 80G / 501(c)(3) of the Internal Revenue Code',
  };
}
