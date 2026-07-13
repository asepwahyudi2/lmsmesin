/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

function generateExcel() {
  const data = [
    ["soal", "opsi_a", "opsi_b", "opsi_c", "opsi_d", "opsi_e", "kunci"],
    [
      "Alat ukur yang memiliki tingkat ketelitian 0,02 mm dan 0,05 mm untuk mengukur diameter dalam, luar, dan kedalaman adalah...",
      "Mikrometer sekrup",
      "Jangka sorong (Vernier caliper)",
      "Dial indicator",
      "Bevel protractor",
      "Alat ukur pneumatik",
      "Jangka sorong (Vernier caliper)"
    ],
    [
      "Bagian utama mesin bubut yang berfungsi untuk mencekam benda kerja dan memutarnya adalah...",
      "Tailstock (Kepala lepas)",
      "Carriage (Eretan)",
      "Chuck (Ragum bubut/Spindel)",
      "Toolpost",
      "Lead screw",
      "Chuck (Ragum bubut/Spindel)"
    ],
    [
      "Rumus yang digunakan untuk mencari kecepatan putaran mesin bubut (n) dalam Rpm adalah...",
      "n = (Cs x d) / 1000",
      "n = (1000 x Cs) / (pi x d)",
      "n = (pi x d x Cs) / 1000",
      "n = (1000 x pi) / (Cs x d)",
      "n = Cs x pi x d",
      "n = (1000 x Cs) / (pi x d)"
    ],
    [
      "Pada pembubutan ulir metris M12 x 1.75, angka 1.75 menunjukkan...",
      "Panjang ulir",
      "Kisar/kisaran pitch ulir (mm)",
      "Diameter nominal ulir",
      "Kedalaman ulir",
      "Sudut puncak ulir",
      "Kisar/kisaran pitch ulir (mm)"
    ],
    [
      "Arah gerakan pemakanan pahat bubut rata kanan saat melakukan pembubutan silindris memanjang adalah...",
      "Dari kiri ke kanan mendekati kepala lepas",
      "Dari kanan ke kiri mendekati spindel utama",
      "Tegak lurus terhadap sumbu benda kerja",
      "Membentuk sudut 45 derajat",
      "Maju mundur secara radial",
      "Dari kanan ke kiri mendekati spindel utama"
    ],
    [
      "Alat bantu pada mesin bubut yang dipasang pada eretan lintang untuk menahan benda kerja yang panjang agar tidak melenting saat disayat adalah...",
      "Follower rest (Penyangga jalan)",
      "Steady rest (Penyangga tetap)",
      "Face plate",
      "Lathe dog",
      "Collet",
      "Follower rest (Penyangga jalan)"
    ],
    [
      "Sudut potong pahat bubut HSS rata untuk pembubutan baja lunak berkisar antara...",
      "1 - 5 derajat",
      "8 - 12 derajat",
      "25 - 30 derajat",
      "55 - 60 derajat",
      "80 - 90 derajat",
      "8 - 12 derajat"
    ],
    [
      "Cairan pendingin (coolant) emulsi minyak dan air saat membubut baja karbon rendah berfungsi untuk...",
      "Mencegah karat dan melumasi",
      "Mendinginkan benda kerja & pahat serta melumasi penyayatan",
      "Mempercepat proses penyayatan saja",
      "Meningkatkan putaran spindel",
      "Mengeraskan permukaan benda kerja",
      "Mendinginkan benda kerja & pahat serta melumasi penyayatan"
    ],
    [
      "Bagian utama mesin frais yang berfungsi sebagai tempat kedudukan arbor untuk memasang pisau frais horizontal adalah...",
      "Knee (Lutut)",
      "Spindel utama",
      "Saddle (Dudukan meja)",
      "Column (Tiang)",
      "Overarm (Lengan penunjang)",
      "Spindel utama"
    ],
    [
      "Proses pengefraisan dimana sumbu putar pisau sejajar dengan permukaan datar benda kerja disebut...",
      "Face milling",
      "End milling",
      "Slab/Horizontal milling",
      "Profile milling",
      "Angular milling",
      "Slab/Horizontal milling"
    ],
    [
      "Perlengkapan mesin frais yang digunakan untuk membagi sudut penyayatan secara beraturan (membuat roda gigi/segi banyak) adalah...",
      "Rotary table",
      "Vise (Ragum catok)",
      "Arbor",
      "Dividing head (Kepala pembagi)",
      "Collet chuck",
      "Dividing head (Kepala pembagi)"
    ],
    [
      "Jika ingin mengefrais roda gigi dengan jumlah gigi 40 menggunakan kepala pembagi dengan rasio 40:1, putaran engkol pembagi adalah...",
      "1/4 putaran",
      "1/2 putaran",
      "1 putaran penuh",
      "2 putaran",
      "4 putaran",
      "1 putaran penuh"
    ],
    [
      "Warna dasar rambu/simbol K3 untuk instruksi wajib (misal: area wajib memakai kacamata pelindung) adalah...",
      "Kuning",
      "Hijau",
      "Merah",
      "Biru",
      "Putih",
      "Biru"
    ],
    [
      "Alat Pelindung Diri (APD) yang mutlak digunakan untuk melindungi kaki dari kejatuhan serpihan tajam (gram) dan benda kerja panas adalah...",
      "Sepatu safety (Safety Shoes)",
      "Safety goggles",
      "Wearpack lengan panjang",
      "Ear plug",
      "Sarung tangan kulit",
      "Sepatu safety (Safety Shoes)"
    ],
    [
      "Tabung pemadam kebakaran jenis APAR dengan media CO2 (Karbondioksida) sangat cocok untuk memadamkan kebakaran kelas C, yaitu...",
      "Kebakaran benda padat non-logam",
      "Kebakaran cairan kimia mudah terbakar",
      "Kebakaran instalasi kelistrikan bertegangan",
      "Kebakaran logam alkali",
      "Kebakaran bahan makanan/dapur",
      "Kebakaran instalasi kelistrikan bertegangan"
    ],
    [
      "Proses pengelasan busur listrik terpelindung gas argon menggunakan elektroda tungsten tidak terumpan disebut...",
      "SMAW (Shielded Metal Arc Welding)",
      "GMAW / MIG (Gas Metal Arc Welding)",
      "GTAW / TIG (Gas Tungsten Arc Welding)",
      "OAW (Oxy Acetylene Welding)",
      "FCAW (Flux Cored Arc Welding)",
      "GTAW / TIG (Gas Tungsten Arc Welding)"
    ],
    [
      "Posisi pengelasan sambungan sudut (fillet) horizontal untuk pengerjaan pelat logam ditandai dengan kode...",
      "1F",
      "2F",
      "3F",
      "4F",
      "1G",
      "2F"
    ],
    [
      "Cacat las yang berupa rongga udara kecil di dalam logam lasan akibat gas yang terperangkap disebut...",
      "Under-cut",
      "Over-lap",
      "Porosity (Porositas)",
      "Crack (Keretakan)",
      "Lack of fusion",
      "Porosity (Porositas)"
    ],
    [
      "Bagian jangka sorong yang berfungsi untuk mengukur kedalaman celah atau lubang sempit adalah...",
      "Jaw bawah (External jaws)",
      "Jaw atas (Internal jaws)",
      "Depth probe (Batang ukur kedalaman)",
      "Lock screw (Baut pengunci)",
      "Skala utama",
      "Depth probe (Batang ukur kedalaman)"
    ],
    [
      "Kegunaan utama skala nonius (vernier) pada alat ukur mekanis jangka sorong adalah...",
      "Mengukur dalam satuan inci saja",
      "Menentukan tingkat ketelitian ukuran desimal (milimeter pecahan)",
      "Mengunci posisi rahang jangka sorong",
      "Mengukur lubang ulir",
      "Mencegah alat ukur aus",
      "Menentukan tingkat ketelitian ukuran desimal (milimeter pecahan)"
    ],
    [
      "Alat ukur linier presisi tinggi yang dapat mengukur ketebalan pelat dengan ketelitian hingga 0,01 mm adalah...",
      "Jangka sorong",
      "Mikrometer luar (Outside Micrometer)",
      "Dial indicator",
      "Penyiku presisi",
      "Caliper gauge",
      "Mikrometer luar (Outside Micrometer)"
    ],
    [
      "Bagian mikrometer sekrup yang berfungsi membatasi penekanan berlebih saat poros ukur bersentuhan dengan benda kerja adalah...",
      "Anvil (Landasan)",
      "Sleeve (Skala tetap)",
      "Thimble (Skala putar)",
      "Ratchet stop (Gigi gelincir)",
      "Lock nut (Pengunci)",
      "Ratchet stop (Gigi gelincir)"
    ],
    [
      "Proses pengefraisan (milling) yang paling cocok digunakan untuk membuat alur pasak (keyway) pada poros besi adalah...",
      "Slab milling",
      "Face milling",
      "End milling",
      "Gear milling",
      "Side milling",
      "End milling"
    ],
    [
      "Sudut puncak pahat bubut ulir segitiga metris standar internasional adalah...",
      "29 derajat",
      "55 derajat",
      "60 derajat",
      "90 derajat",
      "118 derajat",
      "60 derajat"
    ],
    [
      "Kecepatan potong (Cutting Speed - Cs) standar untuk membubut baja lunak (mild steel) ST37 dengan pahat HSS umumnya berkisar antara...",
      "5 - 10 m/menit",
      "20 - 30 m/menit",
      "70 - 100 m/menit",
      "150 - 200 m/menit",
      "300 - 500 m/menit",
      "20 - 30 m/menit"
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Soal Kuis");
  
  const destDir = path.join(__dirname, "../public");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const destFile = path.join(destDir, "soal_teknik_mesin_25.xlsx");
  XLSX.writeFile(wb, destFile);
  console.log(`Sukses membuat file Excel soal di: ${destFile}`);
}

generateExcel();
