export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface MateriBab {
  id: number;
  bab: number;
  title: string;
  content: string; // HTML or Markdown or pure string
  imageUrl?: string;
  quiz: QuizQuestion[];
}

export const materiPramuka: MateriBab[] = [
  {
    id: 1,
    bab: 1,
    title: "Sejarah Kepramukaan",
    content: `
      <h2>Sejarah Singkat Pramuka di Indonesia</h2>
      <p>Pramuka, singkatan dari Praja Muda Karana, yang berarti Jiwa Muda yang Suka Berkarya. Gerakan kepanduan ini mulai masuk ke Indonesia pada masa penjajahan Belanda dengan nama NIPV (Nederland Indische Padvinders Vereeniging).</p>
      <br/>
      <p>Bapak Pramuka Indonesia adalah Sri Sultan Hamengkubuwono IX. Hari Pramuka di Indonesia diperingati setiap tanggal 14 Agustus.</p>
    `,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/WOSM-logo.svg", // Placeholder
    quiz: [
      {
        id: 1,
        question: "Apa kepanjangan dari Pramuka?",
        options: ["Praja Muda Karana", "Pemuda Maju Karya", "Pemuda Suka Berkarya", "Praja Maju Karana"],
        correctAnswerIndex: 0
      },
      {
        id: 2,
        question: "Tanggal berapakah Hari Pramuka diperingati di Indonesia?",
        options: ["10 November", "14 Agustus", "17 Agustus", "1 Juni"],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    id: 2,
    bab: 2,
    title: "Sandi dan Tali Temali",
    content: `
      <h2>Sandi Morse dan Semaphore</h2>
      <p>Sandi Morse ditemukan oleh Samuel Morse. Terdiri dari titik dan garis. Semaphore adalah cara mengirim pesan menggunakan dua bendera.</p>
      <br/>
      <h2>Tali Temali</h2>
      <p>Tali temali sangat penting untuk membuat pionering. Simpul dasar meliputi Simpul Mati, Simpul Pangkal, dan Simpul Jangkar.</p>
    `,
    quiz: [
      {
        id: 1,
        question: "Siapakah penemu Sandi Morse?",
        options: ["Baden Powell", "Samuel Morse", "Hamengkubuwono IX", "Thomas Edison"],
        correctAnswerIndex: 1
      },
      {
        id: 2,
        question: "Apa nama simpul yang digunakan untuk menyambung dua utas tali yang sama besar dan tidak licin?",
        options: ["Simpul Jangkar", "Simpul Pangkal", "Simpul Mati", "Simpul Hidup"],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    id: 3,
    bab: 3,
    title: "Tanda Kecakapan",
    content: `
      <h2>Tanda Kecakapan Umum (TKU) dan Khusus (TKK)</h2>
      <p>Tanda Kecakapan Pramuka diberikan setelah seorang anggota menyelesaikan Syarat Kecakapan Umum (SKU) atau Khusus (SKK).</p>
    `,
    quiz: [
      {
        id: 1,
        question: "Apa kepanjangan dari TKK?",
        options: ["Tanda Kecakapan Khusus", "Tanda Kepanduan Khusus", "Tanda Kecakapan Keluarga", "Tanda Karya Khusus"],
        correctAnswerIndex: 0
      }
    ]
  }
];
