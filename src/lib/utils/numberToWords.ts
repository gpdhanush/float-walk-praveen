// Convert number to Indian rupees in words
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  }
  
  // Split into integer and decimal parts
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let words = '';
  
  if (rupees === 0) {
    words = 'Zero';
  } else {
    // Indian numbering system: Crores, Lakhs, Thousands, Hundreds
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;
    
    if (crore > 0) {
      words += convertLessThanThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      words += convertLessThanThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      words += convertLessThanThousand(thousand) + ' Thousand ';
    }
    if (hundred > 0) {
      words += convertLessThanThousand(hundred);
    }
  }
  
  words = words.trim() + ' Rupees';
  
  if (paise > 0) {
    words += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return words + ' Only';
}
