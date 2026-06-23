# Birthday Scrapbook Desk

Project ucapan ulang tahun berbasis HTML, CSS, dan JavaScript modular.

## Struktur

```text
index.html
css/style.css
js/config.js
js/app.js
assets/images/
assets/music/
.nojekyll
```

## Bagian interaktif

- Polaroid Memories
- Folded Birthday Letter
- Little Survival Kit
- Seed Packet
- Recipe Card
- Final Gift Box

Kotak hadiah final akan terbuka setelah 5 benda utama dibuka.

## Cara mengedit isi

Edit file:

```text
js/config.js
```

Di sana kamu bisa mengubah:

- nama penerima
- judul dan subtitle
- isi surat
- caption foto
- isi Little Survival Kit
- isi Seed Packet
- isi Recipe Card
- pesan final

## Mengganti foto

Masukkan file foto ke:

```text
assets/images/
```

Lalu ubah path di `js/config.js`, misalnya:

```js
src: "assets/images/foto1.jpg"
```

## Efek suara klik

Efek klik bersifat opsional. Jika ingin memakai efek klik, masukkan file:

```text
assets/music/click.mp3
```

Kalau tidak ada, scrapbook tetap berjalan normal.

## Publish ke GitHub Pages

1. Upload seluruh isi folder ini ke repository GitHub.
2. Pastikan `index.html` berada di root repository.
3. Buka Settings > Pages.
4. Pilih Source: Deploy from a branch.
5. Pilih Branch: main dan folder: / root.
6. Simpan, lalu tunggu link GitHub Pages aktif.
