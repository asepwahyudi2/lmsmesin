-- Data Seed Minimal LMS Mesin (Raw SQL)

-- 1. Users (Password: Asep12345)
INSERT INTO `User` (`id`, `name`, `email`, `password_hash`, `role`, `createdAt`, `twoFactorEnabled`) VALUES
('u_admin', 'Admin Utama', 'admin@lms.local', '$2b$10$bo80kvXJXhFhtoFRTZGrrepTPqRz5kUYunc2LJ.zI4NhyA7ydU/vO', 'Admin', NOW(), 0),
('u_guru', 'Pak Budi', 'guru@lms.local', '$2b$10$bo80kvXJXhFhtoFRTZGrrepTPqRz5kUYunc2LJ.zI4NhyA7ydU/vO', 'Guru', NOW(), 0),
('u_murid', 'Andi Wijaya', 'murid@lms.local', '$2b$10$bo80kvXJXhFhtoFRTZGrrepTPqRz5kUYunc2LJ.zI4NhyA7ydU/vO', 'Murid', NOW(), 0),
('u_kepsek', 'Kepala Sekolah', 'kepsek@lms.local', '$2b$10$bo80kvXJXhFhtoFRTZGrrepTPqRz5kUYunc2LJ.zI4NhyA7ydU/vO', 'Kepsek', NOW(), 0)
ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`);

-- 2. Courses
INSERT INTO `Course` (`id`, `name`, `class`, `description`, `teacherId`) VALUES
('c1', 'Teknik Pemesinan Bubut', 'XII TPM 1', 'Mempelajari teknik dasar dan lanjut pengoperasian mesin bubut konvensional.', 'u_guru'),
('c2', 'Gambar Teknik Manufaktur', 'XII TPM 1', 'Mempelajari desain berbantuan komputer (CAD) untuk manufaktur.', 'u_guru')
ON DUPLICATE KEY UPDATE `teacherId`=VALUES(`teacherId`);

-- 3. Enrollments
INSERT INTO `Enrollment` (`id`, `studentId`, `courseId`, `createdAt`, `shift`, `assignedMachineId`) VALUES
('e1', 'u_murid', 'c1', NOW(), NULL, NULL),
('e2', 'u_murid', 'c2', NOW(), NULL, NULL)
ON DUPLICATE KEY UPDATE `studentId`=VALUES(`studentId`);

-- 4. JobSheets
INSERT INTO `JobSheet` (`id`, `courseId`, `title`, `objective`, `tools`, `materials`, `sop`, `safety`, `status`, `dueDate`, `createdAt`) VALUES
('j1', 'c1', 'Pembuatan Benda Kerja Bertingkat', 'Siswa mampu membubut poros bertingkat sesuai ukuran toleransi.', 
 '["Mesin Bubut Konvensional", "Pahat Bubut HSS", "Jangka Sorong 0.05mm", "Kunci Chuck"]', 
 '["Besi As (Mild Steel) Ø 25mm x 100mm"]', 
 '["Siapkan gambar kerja dan pahami ukurannya.", "Cek kondisi mesin bubut dan pastikan aman digunakan.", "Pasang benda kerja pada chuck, pastikan senter.", "Lakukan facing pada salah satu ujung.", "Bubut rata bertingkat sesuai ukuran pada blueprint."]', 
 '["Gunakan kacamata pelindung (Safety Goggles).", "Gunakan sepatu safety.", "Jangan memakai pakaian longgar atau perhiasan."]', 
 'Belum Dikerjakan', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 5. Grades
INSERT INTO `Grade` (`id`, `studentId`, `courseId`, `daily`, `practical`, `midterm`, `final`, `finalScore`, `updatedAt`) VALUES
('g1', 'u_murid', 'c1', 85, 80, 88, 90, 85.75, NOW())
ON DUPLICATE KEY UPDATE `finalScore`=VALUES(`finalScore`);

-- 6. Machines
INSERT INTO `Machine` (`id`, `name`, `type`, `status`, `notes`, `updatedAt`) VALUES
('m1', 'Mesin Bubut Konvensional #1', 'Bubut', 'Ready', 'Kondisi baik, oli baru diganti.', NOW()),
('m2', 'Mesin Bubut Konvensional #2', 'Bubut', 'Maintenance', 'Perbaikan spindle, target selesai besok.', NOW()),
('m3', 'Mesin Milling Haas CNC', 'CNC', 'Ready', 'Kalibrasi sensor sumbu Z selesai.', NOW())
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- 7. Announcements
INSERT INTO `Announcement` (`id`, `title`, `content`, `category`, `date`) VALUES
('a1', 'Jadwal Pelaksanaan Uji Kompetensi Keahlian (UKK) 2026', 'Pelaksanaan UKK Pemesinan Bubut akan dimulai tanggal 15 Mei 2026. Persiapkan alat pelindung diri (Safety shoes, kacamata pelindung, wearpack).', 'Jadwal', NOW()),
('a2', 'Wajib Menggunakan Wearpack & Sepatu Safety di Area Bengkel!', 'Dilarang keras masuk bengkel mesin tanpa menggunakan APD lengkap. Guru berhak mengeluarkan siswa yang melanggar K3.', 'K3', NOW())
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 8. Tools
INSERT INTO `Tool` (`id`, `name`, `quantity`, `available`, `location`) VALUES
('t1', 'Jangka Sorong Mitutoyo 150mm (0.02mm)', 15, 15, 'Lemari Ukur A-1'),
('t2', 'Mikrometer Luar Mitutoyo 0-25mm', 10, 10, 'Lemari Ukur A-2'),
('t3', 'Kunci Chuck Bubut Konvensional 10 Inch', 8, 8, 'Gantungan Panel Alat #1')
ON DUPLICATE KEY UPDATE `quantity`=VALUES(`quantity`);

-- 9. Quizzes
INSERT INTO `Quiz` (`id`, `courseId`, `title`, `description`, `timeLimit`, `createdAt`) VALUES
('q1', 'c1', 'Ujian Harian 1: Pemesinan Bubut Konvensional', 'Tes pengetahuan dasar pembubutan, kecepatan potong, dan K3.', 15, NOW())
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 10. Questions
INSERT INTO `Question` (`id`, `quizId`, `text`, `options`, `answer`) VALUES
('que1', 'q1', 'Manakah alat keselamatan kerja yang WAJIB digunakan saat mengoperasikan mesin bubut untuk menghindari cipratan geram besi?', '["Kacamata Pelindung (Safety Goggles)", "Sarung Tangan Kulit", "Masker Kain", "Apron Las"]', 'Kacamata Pelindung (Safety Goggles)'),
('que2', 'q1', 'Jika diameter benda kerja adalah 50mm dan kecepatan potong (Cs) baja lunak adalah 30 m/menit, berapakah kisaran putaran mesin (RPM) yang harus diset?', '["~190 RPM", "~380 RPM", "~570 RPM", "~760 RPM"]', '~190 RPM'),
('que3', 'q1', 'Alat ukur presisi yang digunakan untuk mengukur diameter dalam suatu silinder berongga dengan ketelitian 0.02mm adalah...', '["Mistar Baja", "Jangka Sorong (Vernier Caliper)", "Mikrometer Luar", "Dial Indicator"]', 'Jangka Sorong (Vernier Caliper)')
ON DUPLICATE KEY UPDATE `text`=VALUES(`text`);
