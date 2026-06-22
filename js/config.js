/*
  Cara edit cepat:
  1. Ganti nama penerima di bagian recipient.
  2. Ganti teks surat, doa, caption foto, dan pesan final.
  3. Masukkan foto ke assets/images lalu sesuaikan path di memories.
  4. Masukkan lagu ke assets/music lalu sesuaikan path di tracks.
*/

window.SCRAPBOOK_CONFIG = {
  recipient: "Akmelia Zahra",
  pageTitle: "Meja Kenangan Ulang Tahun",
  introTitle: "A Little Birthday Desk for Akmelia",
  introSubtitle: "Sebuah meja kecil berisi potongan kenangan, doa, lagu, dan hadiah yang bisa kamu buka satu per satu.",
  deskTitle: "Pilih benda mana yang ingin kamu buka dulu",

  clickSound: "assets/music/click.mp3",

  requiredToUnlockGift: 5,

  stamps: {
    polaroid: "remembered",
    letter: "read",
    jar: "wished",
    cassette: "played",
    passport: "stamped"
  },

  memories: [
    {
      src: "assets/images/photo-1.svg",
      caption: "momen sederhana yang tetap hangat"
    },
    {
      src: "assets/images/photo-2.svg",
      caption: "salah satu potongan hari yang aku simpan"
    },
    {
      src: "assets/images/photo-3.svg",
      caption: "foto kecil, artinya tidak kecil"
    }
  ],

  letterParagraphs: [
    "Selamat ulang tahun, Akmelia Zahra.",
    "Hari ini bukan cuma tentang bertambahnya angka usia, tapi juga tentang semua hal baik yang semoga makin sering datang ke hidupmu.",
    "Aku harap kamu tetap punya ruang untuk merasa tenang, tetap punya alasan untuk tersenyum, dan tetap percaya bahwa kamu pantas menerima hal-hal yang baik.",
    "Terima kasih sudah menjadi kamu, dengan semua cara sederhana yang sering membuat hari terasa lebih hangat."
  ],

  wishes: [
    "Semoga umur barumu lebih tenang dari tahun-tahun sebelumnya.",
    "Semoga kamu selalu dikelilingi orang yang tulus dan membuatmu merasa aman.",
    "Semoga mimpi yang kamu simpan pelan-pelan menemukan jalannya.",
    "Semoga hal kecil yang kamu suka terus punya tempat di hari-harimu.",
    "Semoga kamu tidak terlalu keras pada diri sendiri.",
    "Semoga badanmu sehat, pikiranmu ringan, dan hatimu hangat.",
    "Semoga kamu selalu merasa cukup, dicintai, dan dirayakan."
  ],

  tracks: [
    {
      title: "Lagu ulang tahun utama",
      file: "assets/music/lagu1.mp3",
      note: "Ganti file ini dengan lagu pilihanmu."
    },
    {
      title: "Lagu yang mengingatkanku padamu",
      file: "assets/music/lagu2.mp3",
      note: "Bisa diisi lagu yang punya memori tertentu."
    },
    {
      title: "Lagu penutup yang hangat",
      file: "assets/music/lagu3.mp3",
      note: "Opsional, boleh dihapus kalau cukup satu lagu."
    }
  ],

  passport: {
    title: "Passport to Your New Age",
    nameLabel: "Nama",
    name: "Akmelia Zahra",
    destinationLabel: "Tujuan",
    destination: "umur baru yang lebih tenang, bahagia, dan penuh hal baik",
    statusLabel: "Status",
    status: "loved, celebrated, and prayed for",
    validLabel: "Berlaku",
    valid: "sejak hari ini dan seterusnya",
    stamps: [
      {
        title: "Tenang",
        text: "semoga hatimu lebih sering merasa damai"
      },
      {
        title: "Bahagia",
        text: "semoga makin banyak hal kecil yang membuatmu tersenyum"
      },
      {
        title: "Sehat",
        text: "semoga badan dan pikiranmu selalu dijaga"
      },
      {
        title: "Tumbuh",
        text: "semoga kamu berkembang tanpa kehilangan dirimu"
      },
      {
        title: "Dicintai",
        text: "semoga kamu selalu merasa cukup dan disayangi"
      },
      {
        title: "Berani",
        text: "semoga langkahmu makin yakin, pelan-pelan tapi pasti"
      }
    ]
  },

  finalGift: {
    lockedTitle: "Hadiah ini belum bisa dibuka",
    lockedMessage: "Buka semua benda di meja dulu. Setelah stempelnya lengkap, kotak hadiah ini akan menyala.",
    title: "Satu hadiah kecil terakhir",
    beforeBlow: "Ada lilin kecil yang menunggu ditiup.",
    blowButton: "Tiup lilin ✨",
    afterBlowTitle: "Selamat ulang tahun, Akmelia Zahra",
    message: "Semoga umur barumu membawa lebih banyak tenang, lebih banyak bahagia, dan lebih banyak alasan untuk percaya bahwa hidup masih menyimpan banyak hal baik untukmu.\n\nTerima kasih sudah tetap menjadi kamu. Hari ini, semoga kamu merasa dirayakan dengan cara yang paling hangat."
  },

  secret: {
    unlockedAfter: 3,
    message: "Pesan rahasia terbuka: ternyata ada banyak hal kecil di dunia ini yang bisa mengingatkanku pada kamu."
  }
};
