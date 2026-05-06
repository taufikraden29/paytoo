export const CATEGORIES = {
  income: [
    { id: 'work', name: 'Gaji', icon: '💼', color: '#10b981' },
    { id: 'bonus', name: 'Bonus', icon: '🎁', color: '#6366f1' },
    { id: 'gift', name: 'Hadiah', icon: '🍰', color: '#f43f5e' },
  ],
  expense: [
    { id: 'food', name: 'Makan', icon: '🍔', color: '#f59e0b' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Belanja', icon: '🛍️', color: '#a855f7' },
    { id: 'bills', name: 'Tagihan', icon: '📄', color: '#ef4444' },
    { id: 'other', name: 'Lainnya', icon: '✨', color: '#64748b' },
  ],
  debt: [
    { id: 'piutang', name: 'Beri Pinjaman', icon: '🤝', color: '#8b5cf6' },
    { id: 'hutang', name: 'Pinjam Uang', icon: '💳', color: '#f59e0b' },
  ]
};

export const TITLE_TEMPLATES = {
  food: ['Makan Siang', 'Camilan', 'Kopi', 'Makan Malam', 'Sembako'],
  transport: ['Bensin', 'Gojek/Grab', 'Parkir', 'Tol', 'Servis Motor'],
  shopping: ['Belanja Bulanan', 'Skincare', 'Pakaian', 'Kebutuhan Rumah'],
  bills: ['Listrik', 'Air', 'Internet/Pulsa', 'Kost', 'Asuransi'],
  work: ['Gaji Bulanan', 'Bonus Project', 'Insentif'],
  bonus: ['Hadiah', 'Rezeki Nomplok'],
  piutang: ['Hutang teman', 'Pinjaman keluarga'],
  hutang: ['Pinjam modal', 'Kebutuhan mendesak'],
  other: ['Lain-lain', 'Sedekah', 'Tabungan']
};

export const NOTIFICATIONS = [
  { id: 1, text: 'Pengeluaran Anda naik 10% minggu ini', time: '2j yang lalu' },
  { id: 2, text: 'Gaji Bulanan telah masuk!', time: '1h yang lalu' },
];

export const PIE_DATA_DEFAULT = [
  { name: 'Makanan', value: 0, color: '#6366f1' },
  { name: 'Transport', value: 0, color: '#a855f7' },
  { name: 'Hiburan', value: 0, color: '#f43f5e' },
  { name: 'Lainnya', value: 0, color: '#10b981' },
];
