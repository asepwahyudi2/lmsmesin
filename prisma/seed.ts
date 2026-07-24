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
      name: 'Pemeliharaan Mesin Industri',
      class: 'XII TMI 1',
      description: 'Mempelajari pemeliharaan preventif dan korektif mesin-mesin industri, hidrolik, pneumatik, kelistrikan mesin, dan keselamatan kerja.',
      teacherId: guru.id,
    }
  })

  const course2 = await prisma.course.upsert({
    where: { id: 'c2' },
    update: {},
    create: {
      id: 'c2',
      name: 'Sistem Pneumatik dan Hidrolik',
      class: 'XII TMI 1',
      description: 'Mempelajari prinsip kerja, komponen, perancangan sirkuit, dan troubleshooting sistem pneumatik serta hidrolik industri.',
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
      title: 'Overhaul Pompa Sentrifugal Industri',
      objective: 'Siswa mampu membongkar, menginspeksi kerusakan, mengganti bearing/seal, dan merakit kembali pompa sentrifugal sesuai SOP.',
      tools: JSON.stringify(['Kunci Pas & Ring Set', 'Bearing Puller', 'Dial Indicator', 'Vernier Caliper', 'Palu Tembaga']),
      materials: JSON.stringify(['Gasket Sheet', 'Grease Pelumas', 'Mechanical Seal Pompa', 'Bearing 6204']),
      sop: JSON.stringify([
        'Siapkan dokumen manual pemeliharaan pompa dan form check sheet.',
        'Pastikan daya listrik ke motor penggerak pompa sudah di-LOTO (Lockout/Tagout).',
        'Bongkar casing pompa secara perlahan menggunakan kunci yang sesuai.',
        'Lepaskan impeller dan shaft bearing menggunakan bearing puller.',
        'Inspeksi poros dan ganti bearing serta mechanical seal yang aus.',
        'Rakit kembali seluruh komponen dan uji kelancaran putaran poros.'
      ]),
      safety: JSON.stringify([
        'Terapkan prosedur Lockout/Tagout (LOTO) sebelum memulai pekerjaan.',
        'Gunakan sarung tangan safety dan kacamata pelindung.',
        'Gunakan safety shoes untuk menghindari kejatuhan komponen pompa yang berat.'
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
      name: "Sistem Trainer Pneumatik Festo",
      type: "Trainer Pneumatik",
      status: "Ready",
      notes: "Kondisi baik, selang dan silinder dalam keadaan normal."
    }
  });

  await prisma.machine.upsert({
    where: { id: "m2" },
    update: {},
    create: {
      id: "m2",
      name: "Pompa Sentrifugal Ebara & Motor Penggerak",
      type: "Pompa Industri",
      status: "Maintenance",
      notes: "Perbaikan poros dan mechanical seal bocor."
    }
  });

  await prisma.machine.upsert({
    where: { id: "m3" },
    update: {},
    create: {
      id: "m3",
      name: "Kompresor Udara Screw Atlas Copco",
      type: "Kompresor",
      status: "Ready",
      notes: "Ganti filter udara dan oli selesai dilakukan."
    }
  });

  // 7. Announcements
  await prisma.announcement.upsert({
    where: { id: "a1" },
    update: {},
    create: {
      id: "a1",
      title: "Jadwal Pelaksanaan Uji Kompetensi Keahlian (UKK) 2026",
      content: "Pelaksanaan UKK Teknik Mekanik Industri (TMI) akan dimulai tanggal 15 Mei 2026. Persiapkan APD lengkap dan wearpack kerja.",
      category: "Jadwal"
    }
  });

  await prisma.announcement.upsert({
    where: { id: "a2" },
    update: {},
    create: {
      id: "a2",
      title: "Wajib Menerapkan LOTO sebelum Perawatan Mesin!",
      content: "Dilarang keras melakukan servis/perawatan mesin tanpa memasang Lockout/Tagout (LOTO) pada saklar daya utama mesin.",
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
      name: "Pressure Gauge Analog 0-10 Bar",
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
      title: "Ujian Harian 1: Pemeliharaan Mesin & Sistem LOTO",
      description: "Tes pengetahuan dasar pemeliharaan pompa, kelistrikan mesin, pneumatik, dan K3 LOTO.",
      timeLimit: 15
    }
  });

  await prisma.question.upsert({
    where: { id: "que1" },
    update: {},
    create: {
      id: "que1",
      quizId: quiz.id,
      text: "Apa kepanjangan dari prosedur keselamatan LOTO dalam pemeliharaan mesin industri?",
      options: JSON.stringify(["Lockout / Tagout", "Lockin / Timeout", "Logoff / Toolout", "Loading / Tagging"]),
      answer: "Lockout / Tagout"
    }
  });

  await prisma.question.upsert({
    where: { id: "que2" },
    update: {},
    create: {
      id: "que2",
      quizId: quiz.id,
      text: "Kavitasi pada pompa sentrifugal biasanya disebabkan oleh...",
      options: JSON.stringify(["Tekanan hisap terlalu rendah dibanding tekanan uap jenuh air", "Putaran poros terlalu lambat", " Mechanical seal terlalu kencang", "Kelebihan grease pada bearing"]),
      answer: "Tekanan hisap terlalu rendah dibanding tekanan uap jenuh air"
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
      position: "Teknisi Pemeliharaan Mesin (Maintenance)",
      description: "Dibutuhkan lulusan SMK Teknik Mekanik Industri untuk posisi Teknisi Maintenance. Mampu melakukan preventif maintenance pompa, gearbox, hidrolik pneumatik, kelistrikan, dan membaca gambar sirkuit industri.",
      location: "Kawasan Industri Krakatau, Cilegon",
      salary: "UJK Cilegon + Lembur",
      contact: "recruitment@krakatausteel.co.id"
    }
  });

  await prisma.jobVacancy.create({
    data: {
      company: "PT Chandra Asri Petrochemical Tbk",
      position: "Mechanical Maintenance Technician (Magang)",
      description: "Program pemagangan BKK SMK untuk lulusan Teknik Mekanik Industri / Teknik Mesin. Fokus pada pemeliharaan preventif pompa, katup (valves), dan mesin-mesin rotasi industri kimia.",
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
