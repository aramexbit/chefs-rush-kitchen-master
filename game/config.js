// Chef's Rush: Kitchen Master — data & tuning.
// Semua angka gameplay hidup di sini supaya level dan resep gampang disetel.

export const W = 1280, H = 720;

// ---- Bahan (bin) ----
export const INGREDIENTS = {
  bun:     { name: 'Roti Bun',    color: '#e8a94e', process: 'raw',  stock: 8, maxStock: 8 },
  patty:   { name: 'Patty Sapi',  color: '#8a4b2a', process: 'grill', stock: 6, maxStock: 6 },
  lettuce: { name: 'Selada',      color: '#58b368', process: 'chop', stock: 6, maxStock: 6 },
  tomato:  { name: 'Tomat',       color: '#e2483d', process: 'chop', stock: 6, maxStock: 6 },
  onion:   { name: 'Bawang',      color: '#b678c9', process: 'chop', stock: 6, maxStock: 6 },
  cheese:  { name: 'Keju',        color: '#f7c948', process: 'raw',  stock: 6, maxStock: 6 },
  pickle:  { name: 'Acar',        color: '#6f9e3f', process: 'raw',  stock: 5, maxStock: 5 },
  chicken: { name: 'Ayam',        color: '#e8b04b', process: 'fry',  stock: 6, maxStock: 6 },
  fries:   { name: 'Kentang',     color: '#f2c14e', process: 'fry',  stock: 6, maxStock: 6 },
  egg:     { name: 'Telur',       color: '#fff3c4', process: 'fry',  stock: 5, maxStock: 5 },
  bread:   { name: 'Roti Tawar',  color: '#f0d9a0', process: 'raw',  stock: 6, maxStock: 6 },
};
// Urutan bin di atas meja (kiri ke kanan).
export const BIN_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'onion', 'cheese', 'pickle', 'chicken', 'fries', 'egg', 'bread'];

// Bahan yang bisa dipotong (talenan) dan yang bisa dimasak (wajan/panggangan).
export const CHOP_ITEMS = ['lettuce', 'tomato', 'onion'];
export const FRY_ITEMS = ['chicken', 'fries', 'egg'];
export const GRILL_ITEMS = ['patty', 'chicken'];

// ---- Resep: layers berurutan, tiap layer butuh item + prosesnya ----
// process: 'raw' (langsung dari bin), 'chop', 'fry', 'grill'.
export const RECIPES = {
  classic: { name: 'Classic Burger', price: 35, layers: [
    { item: 'bun', process: 'raw' }, { item: 'lettuce', process: 'chop' },
    { item: 'tomato', process: 'chop' }, { item: 'patty', process: 'grill' },
    { item: 'cheese', process: 'raw' }, { item: 'bun', process: 'raw' } ] },
  cheese: { name: 'Cheese Burger', price: 40, layers: [
    { item: 'bun', process: 'raw' }, { item: 'lettuce', process: 'chop' },
    { item: 'patty', process: 'grill' }, { item: 'cheese', process: 'raw' },
    { item: 'bun', process: 'raw' } ] },
  chicken: { name: 'Chicken Burger', price: 45, layers: [
    { item: 'bun', process: 'raw' }, { item: 'chicken', process: 'fry' },
    { item: 'lettuce', process: 'chop' }, { item: 'tomato', process: 'chop' },
    { item: 'bun', process: 'raw' } ] },
  fries: { name: 'French Fries', price: 20, layers: [
    { item: 'fries', process: 'fry' } ] },
  combo: { name: 'Chicken Combo', price: 55, layers: [
    { item: 'bun', process: 'raw' }, { item: 'chicken', process: 'fry' },
    { item: 'cheese', process: 'raw' }, { item: 'fries', process: 'fry' },
    { item: 'bun', process: 'raw' } ] },
  egg: { name: 'Egg Sandwich', price: 40, layers: [
    { item: 'bread', process: 'raw' }, { item: 'egg', process: 'fry' },
    { item: 'lettuce', process: 'chop' }, { item: 'bread', process: 'raw' } ] },
  double: { name: 'Double Beef Burger', price: 60, layers: [
    { item: 'bun', process: 'raw' }, { item: 'patty', process: 'grill' },
    { item: 'patty', process: 'grill' }, { item: 'cheese', process: 'raw' },
    { item: 'onion', process: 'chop' }, { item: 'bun', process: 'raw' } ] },
  steak: { name: 'Steak and Fries', price: 65, layers: [
    { item: 'patty', process: 'grill' }, { item: 'fries', process: 'fry' } ] },
  deluxe: { name: 'Deluxe Burger', price: 70, layers: [
    { item: 'bun', process: 'raw' }, { item: 'patty', process: 'grill' },
    { item: 'cheese', process: 'raw' }, { item: 'chicken', process: 'fry' },
    { item: 'tomato', process: 'chop' }, { item: 'onion', process: 'chop' },
    { item: 'bun', process: 'raw' } ] },
};

// ---- Level: 10 level, makin tinggi makin ramai & target makin besar ----
export const LEVELS = [
  { n: 1, name: 'Classic Burger', dishes: ['classic'], spawnEvery: 14, shift: 150, target: 300, star2: 450, star3: 600, patience: 60 },
  { n: 2, name: 'Cheese Burger', dishes: ['classic', 'cheese'], spawnEvery: 13, shift: 150, target: 380, star2: 560, star3: 740, patience: 58 },
  { n: 3, name: 'Chicken Burger', dishes: ['classic', 'cheese', 'chicken'], spawnEvery: 12, shift: 160, target: 460, star2: 680, star3: 900, patience: 56 },
  { n: 4, name: 'French Fries', dishes: ['classic', 'cheese', 'chicken', 'fries'], spawnEvery: 11, shift: 160, target: 520, star2: 770, star3: 1020, patience: 54 },
  { n: 5, name: 'Chicken Combo', dishes: ['cheese', 'chicken', 'fries', 'combo'], spawnEvery: 11, shift: 170, target: 600, star2: 880, star3: 1160, patience: 52 },
  { n: 6, name: 'Egg Sandwich', dishes: ['chicken', 'fries', 'combo', 'egg'], spawnEvery: 10, shift: 170, target: 680, star2: 1000, star3: 1320, patience: 50 },
  { n: 7, name: 'Double Beef Burger', dishes: ['classic', 'combo', 'egg', 'double'], spawnEvery: 10, shift: 180, target: 780, star2: 1150, star3: 1520, patience: 48 },
  { n: 8, name: 'Steak and Fries', dishes: ['chicken', 'egg', 'double', 'steak'], spawnEvery: 9, shift: 180, target: 880, star2: 1300, star3: 1720, patience: 46 },
  { n: 9, name: 'Deluxe Burger', dishes: ['combo', 'double', 'steak', 'deluxe'], spawnEvery: 9, shift: 180, target: 1000, star2: 1480, star3: 1960, patience: 44 },
  { n: 10, name: 'Master Chef Challenge', dishes: ['classic', 'cheese', 'chicken', 'fries', 'combo', 'egg', 'double', 'steak', 'deluxe'], spawnEvery: 8, shift: 180, target: 1150, star2: 1700, star3: 2250, patience: 42 },
];

// ---- Tuning memasak ----
export const COOK = {
  // persen progress: raw 0-25, cooking 26-70, perfect 71-90, overcooked 91-100, lalu gosong.
  perfectMin: 71, perfectMax: 90,
  grillTime: 6.0,   // detik sampai 100%
  fryTime: 5.0,
  chopClicks: 4,    // klik untuk memotong sampai selesai
  restockEvery: 8,  // detik: tiap bin +1 stok (maks maxStock)
};

// ---- Skor ----
export const SCORE = {
  base: 100,          // resep benar
  allPerfect: 50,     // semua bahan perfect
  speedMax: 30,       // bonus cepat (skala dengan sisa kesabaran)
  combo: 20,          // per serve beruntun
  wrongItem: -15,     // bahan salah / urutan salah
  burnt: -40,         // hidangan mengandung bahan gosong
  orderFailed: -50,   // pelanggan pergi
};

// ---- Toko upgrade (di layar level selesai) ----
export const UPGRADES = [
  { id: 'speed', name: 'Kompor Cepat', desc: 'Masak 20% lebih cepat', base: 100, effect: 0.20 },
  { id: 'plates', name: 'Piring Ekstra', desc: '+1 slot piring', base: 150, effect: 1 },
  { id: 'patience', name: 'Pelanggan Sabar', desc: 'Kesabaran +25%', base: 120, effect: 0.25 },
];
export const UPGRADE_MAX = 3;

// ---- Pelanggan (karakter original) ----
export const CUSTOMERS = [
  { name: 'Budi', skin: '#e8b88a', hair: '#2e2118', style: 'short', shirt: '#3a6fd8' },
  { name: 'Sari', skin: '#f0c8a0', hair: '#4a2c14', style: 'long', shirt: '#e26d9c' },
  { name: 'Agus', skin: '#c98d5f', hair: '#1a1a1a', style: 'cap', shirt: '#3f9e4d' },
  { name: 'Dewi', skin: '#f2d0a8', hair: '#6b3a1e', style: 'bun', shirt: '#f08c1e' },
  { name: 'Rina', skin: '#eec39a', hair: '#222222', style: 'bob', shirt: '#8a5fc0' },
  { name: 'Joko', skin: '#d9a06b', hair: '#3a2a1a', style: 'chef', shirt: '#d8d8d8' },
];

export const SAVE_KEY = 'chefs-rush-save-v1';
