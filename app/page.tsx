import React from "react";
import { Users, BookOpen, CheckCircle, Clock, Megaphone, ShieldAlert, Cpu, Bell, Calendar, Wrench, TrendingUp, Award, Briefcase, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KepsekCharts from "@/components/KepsekCharts";
import { trackSession } from "@/lib/sessionTracker";
import { cookies } from "next/headers";
import { DashboardSync } from "@/components/DashboardSync";




export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const currentUser = session.user;

  // Lacak sesi perangkat (Remote Logout Check)
  const sessionCheck = await trackSession();
  
  if (sessionCheck.revoked) {
    // Sesi dihapus, redirect langsung di server jika session check invalid
    redirect("/login?revoked=1");
  }

  let courses: any[] = [];
  let jobSheetsCount = 0;
  let enrollmentsCount = 0;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000 - 1);

  const hour = today.getHours();
  const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  const unreadNotifCount = await prisma.notification.count({
    where: { userId: currentUser.id, read: false }
  });

  let machinesCount = 0;
  let totalStudentsCount = 0;
  let totalAlatTersedia = 0;
  let totalAlatDipinjam = 0;
  let attendancePctToday = 0;

  let pendingSubmissionsCount = 0;
  let guruAttendancePctToday = 0;

  let pendingAssignmentsCount = 0;
  let completedAssignmentsCount = 0;
  let myAttendancePct = 0;
  let myAttendanceTotal = 0;

  let totalGuru = 0;
  let avgGradeAll = 0;
  let violationCount = 0;
  let jobVacancyCount = 0;
  let courseDataForChart: any[] = [];
  let machineDataForChart: any[] = [];

  if (currentUser.role === "Admin") {
    courses = await prisma.course.findMany();
    enrollmentsCount = await prisma.enrollment.count();
    jobSheetsCount = await prisma.jobSheet.count();
    machinesCount = await prisma.machine.count();
    totalStudentsCount = await prisma.user.count({ where: { role: "Murid" } });

    const tools = await prisma.tool.findMany();
    totalAlatTersedia = tools.reduce((s, t) => s + t.available, 0);
    const totalAlat = tools.reduce((s, t) => s + t.quantity, 0);
    totalAlatDipinjam = totalAlat - totalAlatTersedia;

    const todayAttendanceTotal = await prisma.attendance.count({
      where: { date: { gte: todayStart, lte: todayEnd } }
    });
    const todayHadir = await prisma.attendance.count({
      where: { date: { gte: todayStart, lte: todayEnd }, status: "Hadir" }
    });
    attendancePctToday = todayAttendanceTotal > 0 ? Math.round((todayHadir / todayAttendanceTotal) * 100) : 0;
  } else if (currentUser.role === "Guru") {
    courses = await prisma.course.findMany({ where: { teacherId: currentUser.id } });
    const courseIds = courses.map(c => c.id);
    jobSheetsCount = await prisma.jobSheet.count({ where: { courseId: { in: courseIds } } });
    enrollmentsCount = await prisma.enrollment.count({ where: { courseId: { in: courseIds } } });

    pendingSubmissionsCount = await prisma.assignmentSubmission.count({
      where: { assignment: { courseId: { in: courseIds } }, grade: null }
    });

    const guruAttendanceTotal = await prisma.attendance.count({
      where: { courseId: { in: courseIds }, date: { gte: todayStart, lte: todayEnd } }
    });
    const guruHadir = await prisma.attendance.count({
      where: { courseId: { in: courseIds }, date: { gte: todayStart, lte: todayEnd }, status: "Hadir" }
    });
    guruAttendancePctToday = guruAttendanceTotal > 0 ? Math.round((guruHadir / guruAttendanceTotal) * 100) : 0;
  } else if (currentUser.role === "Murid") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: currentUser.id },
      include: { course: true }
    });
    courses = enrollments.map(e => e.course);
    const courseIds = courses.map(c => c.id);
    jobSheetsCount = await prisma.jobSheet.count({ where: { courseId: { in: courseIds } } });

    const mySubmissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: currentUser.id }
    });
    pendingAssignmentsCount = mySubmissions.filter(s => s.grade === null).length;
    completedAssignmentsCount = mySubmissions.filter(s => s.grade !== null).length;

    const myAttendance = await prisma.attendance.findMany({
      where: { studentId: currentUser.id }
    });
    myAttendanceTotal = myAttendance.length;
    const myHadirAtt = myAttendance.filter(a => a.status === "Hadir").length;
    myAttendancePct = myAttendanceTotal > 0 ? Math.round((myHadirAtt / myAttendanceTotal) * 100) : 0;
  } else if (currentUser.role === "Kepsek") {
    courses = await prisma.course.findMany();
    totalStudentsCount = await prisma.user.count({ where: { role: "Murid" } });
    totalGuru = await prisma.user.count({ where: { role: "Guru" } });
    machinesCount = await prisma.machine.count();
    violationCount = await prisma.violation.count();
    jobVacancyCount = await prisma.jobVacancy.count();

    const allGrades = await prisma.grade.findMany({ select: { finalScore: true } });
    avgGradeAll = allGrades.length > 0
      ? Math.round(allGrades.reduce((s, g) => s + g.finalScore, 0) / allGrades.length)
      : 0;

    const coursesWithEnrollment = await prisma.course.findMany({
      include: { _count: { select: { enrollments: true } } }
    });
    courseDataForChart = coursesWithEnrollment.map(c => ({
      name: c.class,
      fullName: `${c.name} ${c.class}`,
      siswa: c._count.enrollments
    }));

    const allMachines = await prisma.machine.findMany();
    const machineStatusCounts = allMachines.reduce<Record<string, number>>((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});
    machineDataForChart = Object.entries(machineStatusCounts).map(([name, value]) => ({ name, value }));
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: { date: "desc" },
    take: 3
  });

  const machines = await prisma.machine.findMany({ orderBy: { name: "asc" } });

  const totalTasks = pendingAssignmentsCount + completedAssignmentsCount;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedAssignmentsCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Greeting Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-800 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_60%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-500 text-sm font-medium mb-1">{greeting}, 👋</p>
            <h2 className="text-2xl font-bold text-slate-100">{currentUser.name}</h2>
            <p className="text-slate-400 mt-1.5 text-sm">
              {currentUser.role === "Admin" && "Kelola sistem LMS SMK YPWKS Cilegon."}
              {currentUser.role === "Guru" && `Anda mengampu ${courses.length} mata pelajaran. ${pendingSubmissionsCount > 0 ? `Ada ${pendingSubmissionsCount} tugas menunggu review.` : "Semua tugas sudah direview."}`}
              {currentUser.role === "Murid" && `Kamu terdaftar di ${courses.length} mata pelajaran. Semangat belajar hari ini!`}
              {currentUser.role === "Kepsek" && "Pantau perkembangan sekolah dan laporan akademik."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500">SMK YPWKS</p>
              <p className="text-sm font-bold text-slate-300">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Progress bar tugas untuk murid */}
        {currentUser.role === "Murid" && totalTasks > 0 && (
          <div className="relative mt-5 pt-4 border-t border-amber-500/10">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Progress Tugas</span>
              <span className="font-semibold text-slate-300">{completedAssignmentsCount}/{totalTasks} selesai</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${taskProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-3 gap-4">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 text-xs font-medium ${myAttendancePct >= 75 ? "text-emerald-400" : "text-red-400"}`}>
                  {myAttendancePct >= 75 ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  Kehadiran: {myAttendancePct}%
                </span>
                {pendingAssignmentsCount > 0 && (
                  <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <Clock size={12} /> {pendingAssignmentsCount} tugas tertunda
                  </span>
                )}
              </div>
              <Link href="/attendance/murid" className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1">
                Lihat absensi <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* Peringatan kehadiran rendah */}
        {currentUser.role === "Murid" && myAttendanceTotal > 0 && myAttendancePct < 75 && (
          <div className="relative mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-400">Kehadiran kamu di bawah 75%. Segera hubungi wali kelas!</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentUser.role === "Admin" && (
          <>
            <StatCard icon={<Users />} label="Total Enrollment" value={enrollmentsCount.toString()} colorClass="text-blue-400" />
            <StatCard icon={<BookOpen />} label="Total Mapel" value={courses.length.toString()} colorClass="text-indigo-400" />
            <StatCard icon={<CheckCircle />} label="Total Job Sheet" value={jobSheetsCount.toString()} colorClass="text-emerald-400" />
            <StatCard icon={<Cpu />} label="Total Mesin" value={machinesCount.toString()} colorClass="text-slate-300" />
            <StatCard icon={<Wrench />} label="Alat Tersedia / Dipinjam" value={`${totalAlatTersedia} / ${totalAlatDipinjam}`} colorClass="text-amber-500" />
            <StatCard icon={<Users />} label="Total Siswa" value={totalStudentsCount.toString()} colorClass="text-cyan-400" />
            <StatCard icon={<Calendar />} label="Kehadiran Hari Ini" value={`${attendancePctToday}%`} colorClass="text-emerald-500" />
            <StatCard icon={<Bell />} label="Notifikasi Belum Dibaca" value={unreadNotifCount.toString()} colorClass="text-red-400" badge={unreadNotifCount > 0} />
          </>
        )}

        {currentUser.role === "Guru" && (
          <>
            <StatCard icon={<BookOpen />} label="Mapel Diampu" value={courses.length.toString()} colorClass="text-indigo-400" />
            <StatCard icon={<Clock />} label="Job Sheet Aktif" value={jobSheetsCount.toString()} colorClass="text-amber-500" />
            <StatCard icon={<Users />} label="Total Murid" value={enrollmentsCount.toString()} colorClass="text-blue-400" />
            <StatCard icon={<CheckCircle />} label="Tugas Perlu Direview" value={pendingSubmissionsCount.toString()} colorClass={pendingSubmissionsCount > 0 ? "text-amber-400" : "text-emerald-400"} badge={pendingSubmissionsCount > 0} />
            <StatCard icon={<Calendar />} label="Kehadiran Hari Ini" value={`${guruAttendancePctToday}%`} colorClass="text-emerald-500" />
            <StatCard icon={<Bell />} label="Notifikasi" value={unreadNotifCount.toString()} colorClass="text-red-400" badge={unreadNotifCount > 0} />
          </>
        )}

        {currentUser.role === "Murid" && (
          <>
            <StatCard icon={<BookOpen />} label="Mapel Diikuti" value={courses.length.toString()} colorClass="text-indigo-400" />
            <StatCard icon={<Clock />} label="Tugas Tertunda" value={pendingAssignmentsCount.toString()} colorClass={pendingAssignmentsCount > 0 ? "text-amber-400" : "text-emerald-400"} badge={pendingAssignmentsCount > 0} />
            <StatCard icon={<CheckCircle />} label="Tugas Selesai" value={completedAssignmentsCount.toString()} colorClass="text-emerald-400" />
            <StatCard icon={<Calendar />} label="Kehadiran" value={`${myAttendancePct}%`} colorClass={myAttendancePct >= 75 ? "text-emerald-400" : "text-red-400"} />
            <StatCard icon={<Bell />} label="Notifikasi" value={unreadNotifCount.toString()} colorClass="text-red-400" badge={unreadNotifCount > 0} />
          </>
        )}

        {currentUser.role === "Kepsek" && (
          <>
            <StatCard icon={<Users />} label="Total Siswa" value={totalStudentsCount.toString()} colorClass="text-blue-400" />
            <StatCard icon={<BookOpen />} label="Total Guru" value={totalGuru.toString()} colorClass="text-indigo-400" />
            <StatCard icon={<Cpu />} label="Total Mesin" value={machinesCount.toString()} colorClass="text-slate-300" />
            <StatCard icon={<TrendingUp />} label="Rata-rata Nilai Akhir" value={avgGradeAll > 0 ? avgGradeAll.toString() : "-"} colorClass="text-emerald-400" />
            <StatCard icon={<ShieldAlert />} label="Total Pelanggaran" value={violationCount.toString()} colorClass="text-red-400" />
            <StatCard icon={<Briefcase />} label="Lowongan BKK Aktif" value={jobVacancyCount.toString()} colorClass="text-amber-500" />
            <StatCard icon={<BookOpen />} label="Total Mapel" value={courses.length.toString()} colorClass="text-purple-400" />
            <StatCard icon={<Bell />} label="Notifikasi" value={unreadNotifCount.toString()} colorClass="text-rose-400" badge={unreadNotifCount > 0} />
          </>
        )}
      </div>

      {currentUser.role === "Kepsek" && (
        <KepsekCharts courseData={courseDataForChart} machineData={machineDataForChart} />
      )}

      {/* Mading & Mesin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <Megaphone className="text-amber-500" size={20} />
              <h3 className="text-lg font-bold text-slate-200">Mading Digital Bengkel</h3>
            </div>
            <Link href="/announcements" className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1">
              Semua <ArrowRight size={12} />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center text-slate-500 text-sm">
              Belum ada pengumuman terbaru.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center hover:border-slate-600 transition-colors">
                  <div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      ann.category === "K3" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      ann.category === "Jadwal" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-slate-700 text-slate-300 border-slate-600"
                    }`}>
                      {ann.category}
                    </span>
                    <h4 className="font-semibold text-slate-200 mt-2 text-sm md:text-base leading-snug">{ann.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ann.content}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    {new Date(ann.date).toLocaleDateString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
            <Cpu className="text-amber-500" size={20} />
            <h3 className="text-lg font-bold text-slate-200 font-mono">Status Mesin</h3>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg space-y-2.5">
            {machines.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Data mesin kosong.</p>
            ) : (
              machines.slice(0, 6).map(mac => (
                <div key={mac.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600/70 transition-colors">
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-300">{mac.name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{mac.notes || "Ready to use."}</p>
                  </div>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${
                    mac.status === "Ready" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                    mac.status === "Maintenance" ? "bg-amber-500/15 text-amber-500 border-amber-500/20" :
                    "bg-red-500/15 text-red-400 border-red-500/20"
                  }`}>
                    {mac.status}
                  </span>
                </div>
              ))
            )}
            <Link href="/stats" className="block text-center text-xs text-amber-500 hover:text-amber-400 hover:underline pt-2 font-medium">
              Kelola Mesin &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Mata Pelajaran Anda</h3>
          <Link href="/courses" className="text-sm text-amber-500 hover:text-amber-400 transition-colors font-medium flex items-center gap-1">
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">Belum ada mata pelajaran.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.slice(0, 6).map((course, idx) => (
              <Link key={course.id} href={`/courses/${course.id}`}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-amber-500/50 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] group block"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                    <BookOpen className="text-slate-400 group-hover:text-amber-500 transition-colors" size={22} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-700 text-slate-400 rounded-md">
                    {course.class}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-100 leading-snug group-hover:text-amber-400 transition-colors">{course.name}</h4>
                {course.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{course.description}</p>
                )}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Masuk kelas</span>
                  <ArrowRight size={14} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentUser.role === "Guru" && (
            <QuickAction href="/grades" icon={<CheckCircle size={20} />} label="Input Nilai" />
          )}
          {currentUser.role === "Murid" && (
            <QuickAction href="/assignments" icon={<BookOpen size={20} />} label="Lihat Tugas" />
          )}
          {(currentUser.role === "Admin" || currentUser.role === "Guru" || currentUser.role === "Kepsek") && (
            <QuickAction href="/announcements" icon={<Megaphone size={20} />} label="Pengumuman" />
          )}
          <QuickAction href="/calendar" icon={<Calendar size={20} />} label="Kalender" />
          {currentUser.role === "Murid" && (
            <QuickAction href="/attendance/murid" icon={<Calendar size={20} />} label="Absensi Saya" />
          )}
          {(currentUser.role === "Admin" || currentUser.role === "Guru") && (
            <QuickAction href="/attendance" icon={<Calendar size={20} />} label="Input Absensi" />
          )}
        </div>
      </div>
      <DashboardSync userId={currentUser.id} needsSession={!!sessionCheck.needsSession} />
    </div>
  );
}

function StatCard({ icon, label, value, colorClass = "text-amber-500", badge = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass?: string;
  badge?: boolean;
}) {
  const bgClass = colorClass.replace("text-", "bg-").replace(/-\d+/, "-500/15");
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3 hover:border-slate-600 transition-colors group">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${bgClass} ${colorClass} relative`}>
        {icon}
        {badge && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-xl font-bold text-slate-100 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex flex-col items-center gap-2 group">
      <span className="text-amber-500 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">{label}</span>
    </Link>
  );
}
