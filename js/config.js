/*
  Cara edit cepat:
  1. Ganti nama penerima di bagian recipient.
  2. Ganti teks surat, caption foto, survival kit, seed packet, recipe card, dan pesan final.
  3. Masukkan foto ke assets/images lalu sesuaikan path di memories.
  4. Efek klik bersifat opsional. Jika ingin memakai, masukkan click.mp3 ke assets/music.
*/

window.SCRAPBOOK_CONFIG = {
  recipient: "Akmelia Zahra",
  pageTitle: "Meja Kenangan Ulang Tahun",
  introTitle: "A Little Birthday Desk for Akmelia",
  introSubtitle: "Sebuah meja kecil berisi potongan kenangan, surat, bekal kecil, benih harapan, resep bahagia, dan hadiah yang bisa kamu buka satu per satu.",
  deskTitle: "Pilih benda mana yang ingin kamu buka dulu",

  clickSound: "assets/music/click.mp3",

  requiredToUnlockGift: 5,

  stamps: {
    polaroid: "remembered",
    letter: "read",
    kit: "equipped",
    seed: "planted",
    recipe: "mixed"
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

  survivalKit: {
    title: "Little Survival Kit",
    subtitle: "Bekal kecil untuk hari-hari yang ringan maupun hari-hari yang terasa berat.",
    note: "Klik satu item untuk membuka pesan kecilnya.",
    items: [
      {
        icon: "🩹",
        title: "Plester Semangat",
        text: "Untuk hari ketika kamu merasa tidak cukup baik. Padahal kamu sudah berusaha sejauh ini."
      },
      {
        icon: "🍬",
        title: "Permen Bahagia",
        text: "Untuk mengingatkan bahwa hal kecil pun boleh jadi alasan kamu tersenyum."
      },
      {
        icon: "🧭",
        title: "Kompas Tenang",
        text: "Untuk saat semuanya terasa ramai. Pelan-pelan saja, kamu tidak harus menemukan semua jawaban hari ini."
      },
      {
        icon: "☁️",
        title: "Awan Istirahat",
        text: "Untuk mengingatkan kamu bahwa berhenti sebentar bukan berarti kalah."
      },
      {
        icon: "💌",
        title: "Catatan Kecil",
        text: "Kamu pantas dirayakan, bukan hanya hari ini, tapi juga di hari-hari biasa."
      },
      {
        icon: "🫶",
        title: "Peluk Virtual",
        text: "Untuk hari apa pun yang butuh sedikit hangat tambahan."
      }
    ]
  },

  seedPacket: {
    title: "Benih untuk Umur Barumu",
    subtitle: "Tanam satu harapan, rawat pelan-pelan, dan biarkan hal baik tumbuh dengan waktunya sendiri.",
    instruction: "Klik benihnya satu per satu.",
    seeds: [
      {
        title: "Tenang",
        text: "Semoga di umur barumu, hatimu lebih sering merasa cukup dan tidak terlalu lelah mengejar semuanya."
      },
      {
        title: "Bahagia",
        text: "Semoga makin banyak hal kecil yang datang tanpa diminta, lalu membuatmu tersenyum diam-diam."
      },
      {
        title: "Sehat",
        text: "Semoga badanmu kuat, pikiranmu lebih ringan, dan istirahatmu lebih terasa cukup."
      },
      {
        title: "Percaya Diri",
        text: "Semoga kamu makin percaya bahwa dirimu layak, mampu, dan berharga."
      },
      {
        title: "Mimpi",
        text: "Semoga mimpi yang kamu simpan pelan-pelan menemukan jalan yang baik."
      },
      {
        title: "Berani",
        text: "Semoga langkahmu tetap berani, bahkan ketika jalannya belum sepenuhnya terang."
      }
    ]
  },

  recipeCard: {
    title: "Resep Kecil untuk Umur Baru",
    subtitle: "Tidak perlu sempurna. Cukup diracik pelan-pelan dengan hati yang tetap baik.",
    ingredientsTitle: "Bahan-bahan",
    ingredients: [
      "2 sendok keberanian untuk mencoba lagi",
      "1 genggam ketenangan untuk hari yang ramai",
      "secukupnya orang-orang tulus di sekitar kamu",
      "banyak senyum kecil yang tidak harus punya alasan besar",
      "istirahat yang cukup, jangan diganti dengan memaksa diri terus",
      "mimpi yang tetap dijaga meski jalannya pelan"
    ],
    stepsTitle: "Cara membuat",
    steps: [
      "Mulai hari dengan percaya bahwa kamu sudah sejauh ini.",
      "Campurkan doa, usaha, dan waktu secukupnya.",
      "Jangan lupa beri ruang untuk gagal, belajar, dan tumbuh.",
      "Sajikan hangat bersama hal-hal kecil yang membuatmu bahagia."
    ],
    closing: "Semoga resep ini menemani umur barumu dengan cara yang sederhana, hangat, dan baik."
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
