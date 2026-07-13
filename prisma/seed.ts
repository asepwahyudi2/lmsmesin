import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  const password = await bcrypt.hash('Asep12345', 10)
  
  // 1. Users
  const _admin = await prisma.user.upsert({
    where: { email: 'admin@lms.local' },
    update: {},
    create: {
      email: 'admin@lms.local',
      name: 'Admin Utama',
      password_hash: password,
      role: 'Admin',
    },
  })
  
  const guru = await prisma.user.upsert({
    where: { email: 'guru@lms.local' },
    update: {},
    create: {
      email: 'guru@lms.local',
      name: 'Pak Budi',
      password_hash: password,
      role: 'Guru',
    },
  })

  const murid = await prisma.user.upsert({
    where: { email: 'murid@lms.local' },
    update: {},
    create: {
      email: 'murid@lms.local',
      name: 'Andi Wijaya',
      password_hash: password,
      role: 'Murid',
    },
  })

  const _kepsek = await prisma.user.upsert({
    where: { email: 'kepsek@lms.local' },
    update: {},
    create: {
      email: 'kepsek@lms.local',
      name: 'Kepala Sekolah',
      password_hash: password,
      role: 'Kepsek',
    },
  })

  // 2. Courses
  const course1 = await prisma.course.upsert({
    where: { id: 'c1' },
    update: {},
    create: {
      id: 'c1',
      name: 'Teknik Pemesinan Bubut',
      class: 'XII TPM 1',
      description: 'Mempelajari teknik dasar dan lanjut pengoperasian mesin bubut konvensional.',
      teacherId: guru.id,
    }
  })

  const course2 = await prisma.course.upsert({
    where: { id: 'c2' },
    update: {},
    create: {
      id: 'c2',
      name: 'Gambar Teknik Manufaktur',
      class: 'XII TPM 1',
      description: 'Mempelajari desain berbantuan komputer (CAD) untuk manufaktur.',
      teacherId: guru.id,
    }
  })

  // 3. Enrollments (Murid join Course)
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: murid.id, courseId: course1.id } },
    update: {},
    create: { studentId: murid.id, courseId: course1.id }
  })
  
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: murid.id, courseId: course2.id } },
    update: {},
    create: { studentId: murid.id, courseId: course2.id }
  })

  // 4. JobSheets
  const _js1 = await prisma.jobSheet.upsert({
    where: { id: 'j1' },
    update: {},
    create: {
      id: 'j1',
      courseId: course1.id,
      title: 'Pembuatan Benda Kerja Bertingkat',
      objective: 'Siswa mampu membubut poros bertingkat sesuai ukuran toleransi.',
      tools: JSON.stringify(['Mesin Bubut Konvensional', 'Pahat Bubut HSS', 'Jangka Sorong 0.05mm', 'Kunci Chuck']),
      materials: JSON.stringify(['Besi As (Mild Steel) Ø 25mm x 100mm']),
      sop: JSON.stringify([
        'Siapkan gambar kerja dan pahami ukurannya.',
        'Cek kondisi mesin bubut dan pastikan aman digunakan.',
        'Pasang benda kerja pada chuck, pastikan senter.',
        'Lakukan facing pada salah satu ujung.',
        'Bubut rata bertingkat sesuai ukuran pada blueprint.'
      ]),
      safety: JSON.stringify([
        'Gunakan kacamata pelindung (Safety Goggles).',
        'Gunakan sepatu safety.',
        'Jangan memakai pakaian longgar atau perhiasan.'
      ]),
      status: 'Belum Dikerjakan',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  })

  // 5. Grades
  await prisma.grade.upsert({
    where: { studentId_courseId: { studentId: murid.id, courseId: course1.id } },
    update: {},
    create: {
      studentId: murid.id,
      courseId: course1.id,
      daily: 85,
      practical: 80,
      midterm: 88,
      final: 90,
      finalScore: 85.75
    }
  })

  // 6. Machines
  await prisma.machine.upsert({
    where: { id: "m1" },
    update: {},
    create: {
      id: "m1",
      name: "Mesin Bubut Konvensional #1",
      type: "Bubut",
      status: "Ready",
      notes: "Kondisi baik, oli baru diganti."
    }
  });

  await prisma.machine.upsert({
    where: { id: "m2" },
    update: {},
    create: {
      id: "m2",
      name: "Mesin Bubut Konvensional #2",
      type: "Bubut",
      status: "Maintenance",
      notes: "Perbaikan spindle, target selesai besok."
    }
  });

  await prisma.machine.upsert({
    where: { id: "m3" },
    update: {},
    create: {
      id: "m3",
      name: "Mesin Milling Haas CNC",
      type: "CNC",
      status: "Ready",
      notes: "Kalibrasi sensor sumbu Z selesai."
    }
  });

  // 7. Announcements
  await prisma.announcement.upsert({
    where: { id: "a1" },
    update: {},
    create: {
      id: "a1",
      title: "Jadwal Pelaksanaan Uji Kompetensi Keahlian (UKK) 2026",
      content: "Pelaksanaan UKK Pemesinan Bubut akan dimulai tanggal 15 Mei 2026. Persiapkan alat pelindung diri (Safety shoes, kacamata pelindung, wearpack).",
      category: "Jadwal"
    }
  });

  await prisma.announcement.upsert({
    where: { id: "a2" },
    update: {},
    create: {
      id: "a2",
      title: "Wajib Menggunakan Wearpack & Sepatu Safety di Area Bengkel!",
      content: "Dilarang keras masuk bengkel mesin tanpa menggunakan APD lengkap. Guru berhak mengeluarkan siswa yang melanggar K3.",
      category: "K3"
    }
  });

  // 8. Tools (Tool Crib)
  await prisma.tool.upsert({
    where: { id: "t1" },
    update: {},
    create: {
      id: "t1",
      name: "Jangka Sorong Mitutoyo 150mm (0.02mm)",
      quantity: 15,
      available: 15,
      location: "Lemari Ukur A-1"
    }
  });

  await prisma.tool.upsert({
    where: { id: "t2" },
    update: {},
    create: {
      id: "t2",
      name: "Mikrometer Luar Mitutoyo 0-25mm",
      quantity: 10,
      available: 10,
      location: "Lemari Ukur A-2"
    }
  });

  await prisma.tool.upsert({
    where: { id: "t3" },
    update: {},
    create: {
      id: "t3",
      name: "Kunci Chuck Bubut Konvensional 10 Inch",
      quantity: 8,
      available: 8,
      location: "Gantungan Panel Alat #1"
    }
  });

  // 9. Quizzes
  const quiz = await prisma.quiz.upsert({
    where: { id: "q1" },
    update: {},
    create: {
      id: "q1",
      courseId: course1.id,
      title: "Ujian Harian 1: Pemesinan Bubut Konvensional",
      description: "Tes pengetahuan dasar pembubutan, kecepatan potong, dan K3.",
      timeLimit: 15
    }
  });

  await prisma.question.upsert({
    where: { id: "que1" },
    update: {},
    create: {
      id: "que1",
      quizId: quiz.id,
      text: "Manakah alat keselamatan kerja yang WAJIB digunakan saat mengoperasikan mesin bubut untuk menghindari cipratan geram besi?",
      options: JSON.stringify(["Kacamata Pelindung (Safety Goggles)", "Sarung Tangan Kulit", "Masker Kain", "Apron Las"]),
      answer: "Kacamata Pelindung (Safety Goggles)"
    }
  });

  await prisma.question.upsert({
    where: { id: "que2" },
    update: {},
    create: {
      id: "que2",
      quizId: quiz.id,
      text: "Jika diameter benda kerja adalah 50mm dan kecepatan potong (Cs) baja lunak adalah 30 m/menit, berapakah kisaran putaran mesin (RPM) yang harus diset?",
      options: JSON.stringify(["~190 RPM", "~380 RPM", "~570 RPM", "~760 RPM"]),
      answer: "~190 RPM"
    }
  });

  await prisma.question.upsert({
    where: { id: "que3" },
    update: {},
    create: {
      id: "que3",
      quizId: quiz.id,
      text: "Alat ukur presisi yang digunakan untuk mengukur diameter dalam suatu silinder berongga dengan ketelitian 0.02mm adalah...",
      options: JSON.stringify(["Mistar Baja", "Jangka Sorong (Vernier Caliper)", "Mikrometer Luar", "Dial Indicator"]),
      answer: "Jangka Sorong (Vernier Caliper)"
    }
  });

  // 10. Maintenance Log
  await prisma.maintenanceLog.create({
    data: {
      machineId: "m2", // Mesin bubut yang rusak
      userId: guru.id,
      task: "Penggantian gear spindle utama yang aus & penggantian oli pelumas gearbox",
      status: "Completed",
      notes: "Suku cadang gear spindle resmi dari pabrik dipasang."
    }
  });

  // 11. JobVacancy (BKK)
  await prisma.jobVacancy.create({
    data: {
      company: "PT Krakatau Steel (Persero) Tbk",
      position: "Operator Mesin Bubut & CNC",
      description: "Dibutuhkan lulusan SMK Teknik Pemesinan untuk posisi Operator Bubut & CNC. Mampu membaca gambar teknik, menggunakan jangka sorong/mikrometer, dan mengoperasikan mesin CNC Siemens/Fanuc.",
      location: "Kawasan Industri Krakatau, Cilegon",
      salary: "UJK Cilegon + Lembur",
      contact: "recruitment@krakatausteel.co.id"
    }
  });

  await prisma.jobVacancy.create({
    data: {
      company: "PT Chandra Asri Petrochemical Tbk",
      position: "Mechanical Maintenance Technician (Magang)",
      description: "Program pemagangan BKK SMK untuk lulusan Teknik Mesin/Pemesinan. Fokus pada pemeliharaan preventif pompa, katup (valves), dan mesin-mesin rotasi industri kimia.",
      location: "Ciwandan, Cilegon",
      salary: "Uang Saku Magang & BPJS",
      contact: "bkk-ypwks@chandra-asri.com"
    }
  });

  console.log('Seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
