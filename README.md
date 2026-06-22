# Birthday Scrapbook Desk

Proyek ucapan ulang tahun berbasis HTML, CSS, dan JavaScript modular.

## Struktur folder

```text
scrapbook_desk_birthday_github/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   └── app.js
├── assets/
│   ├── images/
│   │   ├── photo-1.svg
│   │   ├── photo-2.svg
│   │   └── photo-3.svg
│   └── music/
│       └── README.txt
└── .nojekyll
```

## Cara edit isi ucapan

Edit file:

```text
js/config.js
```

Bagian yang paling sering diganti:

- `recipient`
- `introTitle`
- `introSubtitle`
- `memories`
- `letterParagraphs`
- `wishes`
- `tracks`
- `passport`
- `finalGift`

## Cara mengganti foto

1. Masukkan foto ke folder `assets/images/`.
2. Edit `js/config.js` bagian `memories`.

Contoh:

```js
memories: [
  {
    src: "assets/images/foto1.jpg",
    caption: "caption foto"
  }
]
```

## Cara mengganti lagu

1. Masukkan file mp3 ke folder `assets/music/`.
2. Edit `js/config.js` bagian `tracks`.

Contoh:

```js
tracks: [
  {
    title: "Judul lagu",
    file: "assets/music/lagu1.mp3",
    note: "Catatan kecil"
  }
]
```

Catatan: di iPhone dan browser modern, musik biasanya harus dimulai dari tap/klik pengguna. Karena itu, bagian cassette player memakai tombol putar.

## Cara publish ke GitHub Pages

1. Buat repository baru di GitHub.
2. Upload seluruh isi folder ini ke repository.
3. Pastikan `index.html` ada di root repository.
4. Buka Settings > Pages.
5. Pilih branch `main` dan folder `/root`.
6. Simpan, lalu buka link GitHub Pages yang diberikan.

## Catatan privasi

Kalau repository dibuat public, foto dan musik yang Anda upload juga bisa diakses publik melalui link website. Jika berisi hal pribadi, gunakan foto/musik yang aman untuk dibagikan.
