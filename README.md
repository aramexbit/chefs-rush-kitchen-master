# Chef's Rush: Kitchen Master

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/aramexbit/chefs-rush-kitchen-master/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/aramexbit/chefs-rush-kitchen-master/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Game memasak 2D top-down: terima pesanan, potong, goreng, panggang, rakit sesuai urutan resep, lalu sajikan sebelum pelanggan kehabisan sabar.

## Cara main

- **Klik bin bahan** untuk mengambil (bahan mengikuti kursor).
- **Talenan**: taruh selada/tomat/bawang, klik berulang untuk memotong.
- **Wajan**: goreng ayam, kentang, telur. **Panggangan**: panggang patty & ayam.
- Masakan punya status: mentah → memasak → **PERFECT (71–90%)** → overcooked → gosong.
- **Papan rakitan**: taruh bahan sesuai urutan resep pesanan yang dipilih (klik tiket di Order Board untuk memilih target). Urutan salah = −15 poin.
- Hidangan jadi otomatis naik ke piring, lalu tekan tombol **SERVE** yang besar.
- Kesabaran pelanggan menipis — sajikan cepat untuk tip sampai +50%.

## Fitur

- 11 bahan dengan stok & restock, 9 resep, 10 level (buka satu per satu).
- Kualitas masakan memengaruhi skor: resep benar +100, semua perfect +50, cepat +30, kombo +20/serve.
- Koin untuk beli upgrade: Kompor Cepat, Piring Ekstra, Pelanggan Sabar.
- 6 pelanggan original dengan ekspresi (senang / biasa / marah), suara sintetis Web Audio, progres tersimpan di localStorage.
- Offline, tanpa server — buka `game/index.html` atau jalankan `node game/serve.ts`.

## Lomba

Dibuat untuk [best cooking game — make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137) ($250, tutup 25 Nov 2026 20:37 WIB).
