export const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val);
};

export const formatInputRupiah = (value) => {
  if (!value) return '';
  const numberString = value.toString().replace(/[^0-9]/g, '');
  if (!numberString) return '';
  return new Intl.NumberFormat('id-ID').format(numberString);
};

export const parseRupiah = (value) => {
  if (!value) return '';
  return value.toString().replace(/[^0-9]/g, '');
};

export const getAmountClass = (t) => {
  if (t.category === 'Beri Pinjaman') return 'debt-out';
  if (t.category === 'Pinjam Uang') return 'debt-in';
  if (t.category === 'Pelunasan') return 'debt-settle';
  return t.type;
};

export const formatCalcDisplay = (val) => {
  if (val === null || val === undefined) return '';
  const strVal = String(val);
  if (strVal === '0' || strVal === '') return 'Rp 0';
  
  const parts = strVal.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : null;
  
  const formattedInteger = new Intl.NumberFormat('id-ID').format(integerPart);
  
  let result = `Rp ${formattedInteger}`;
  if (decimalPart !== null) {
    result += `,${decimalPart}`;
  } else if (strVal.endsWith('.')) {
    result += ',';
  }
  
  return result;
};
