# Birthday Scrapbook Desk — Animated V3

Versi ini adalah proyek HTML + CSS + JavaScript modular untuk ucapan ulang tahun berbentuk meja scrapbook interaktif.

## Struktur folder

```text
index.html
css/style.css
js/config.js
js/app.js
assets/images/
assets/music/
.nojekyll
README.md
```

## Fitur utama

- Meja scrapbook dengan tekstur kayu yang lebih realistis.
- Polaroid Memories.
- Folded Birthday Letter.
- Little Survival Kit dengan ilustrasi wanita berhijab pashmina yang ekspresinya berubah dari murung menjadi bahagia.
- Seed Packet dengan taman bunga yang tumbuh saat benih diklik.
- Recipe Card dengan bahan-bahan yang masuk ke mangkuk.
- Final Gift bertahap: buka pita, kue muncul, tiup lilin, lalu pesan final muncul.
- Mode malam.
- Hidden heart.
- Confetti.
- Responsif untuk laptop dan HP.

## Cara mengubah isi

Edit file:

```text
js/config.js
```

Di sana Anda bisa mengganti:

- nama penerima;
- judul pembuka;
- isi surat;
- caption foto;
- isi Survival Kit;
- isi Seed Packet;
- isi Recipe Card;
- pesan hadiah final.

## Cara mengganti foto

Masukkan foto ke folder:

```text
assets/images/
```

Lalu sesuaikan path di `js/config.js`, misalnya:

```js
src: "assets/images/foto1.jpg"
```

## Efek klik

Efek klik bersifat opsional. Kalau ingin memakai, masukkan file:

```text
assets/music/click.mp3
```

Kalau file tidak ada, halaman tetap berjalan normal.

## Cara upload ke GitHub Pages

Upload semua isi folder ini ke root repository GitHub, bukan folder pembungkusnya. Pastikan `index.html` berada langsung di root repository.

Struktur yang benar:

```text
index.html
css/
js/
assets/
README.md
.nojekyll
```

Lalu aktifkan GitHub Pages dari:

```text
Settings → Pages → Deploy from a branch → main → / root → Save
```
