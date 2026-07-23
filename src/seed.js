import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Task from './models/Task.js'
import Event from './models/Event.js'
import KPI from './models/KPI.js'
import Report from './models/Report.js'

export async function seedDatabase() {
  const existing = await User.findOne()
  if (existing) return

  const users = await User.create([
    { id: 'user-1', name: 'Admin STIFIn', email: 'admin@stifinfamily.com', password: bcrypt.hashSync('admin123', 10), role: 'admin', department: 'STIFIn Family' },
    { id: 'user-2', name: 'Budi Santoso', email: 'budi@stifinfamily.com', password: bcrypt.hashSync('123456', 10), role: 'manager', department: 'Operations' },
    { id: 'user-3', name: 'Siti Rahmawati', email: 'siti@stifinfamily.com', password: bcrypt.hashSync('123456', 10), role: 'staff', department: 'Marketing' },
    { id: 'user-4', name: 'Ahmad Hidayat', email: 'ahmad@stifinfamily.com', password: bcrypt.hashSync('123456', 10), role: 'staff', department: 'Finance' },
    { id: 'user-5', name: 'Dewi Lestari', email: 'dewi@stifinfamily.com', password: bcrypt.hashSync('123456', 10), role: 'manager', department: 'HR' },
  ])

  const tasks = await Task.create([
    { id: 'task-1', title: 'Review laporan keuangan bulanan', description: 'Periksa dan validasi semua laporan keuangan untuk bulan ini.', status: 'in_progress', priority: 'high', progress: 65, dueDate: '2026-07-25', timeStart: '08:00', timeEnd: '10:00', assignee: 'user-4', createdBy: 'user-1' },
    { id: 'task-2', title: 'Persiapan event STIFIn Workshop', description: 'Koordinasi venue, materi, dan peserta untuk workshop.', status: 'todo', priority: 'urgent', progress: 0, dueDate: '2026-07-30', timeStart: '13:00', timeEnd: '15:00', assignee: 'user-2', createdBy: 'user-1' },
    { id: 'task-3', title: 'Update konten sosial media', description: 'Buat dan jadwalkan postingan.', status: 'done', priority: 'medium', progress: 100, dueDate: '2026-07-22', timeStart: '09:00', timeEnd: '11:30', assignee: 'user-3', createdBy: 'user-3' },
    { id: 'task-4', title: 'Rekrutmen staff baru', description: 'Seleksi berkas dan jadwalkan interview.', status: 'in_progress', priority: 'high', progress: 40, dueDate: '2026-07-28', timeStart: '10:00', timeEnd: '12:00', assignee: 'user-5', createdBy: 'user-5' },
    { id: 'task-5', title: 'Backup data server', description: 'Backup rutin data server utama.', status: 'todo', priority: 'low', progress: 0, dueDate: '2026-07-26', timeStart: '07:00', timeEnd: '08:00', assignee: 'user-1', createdBy: 'user-1' },
    { id: 'task-6', title: 'Evaluasi kinerja tim marketing', description: 'Meeting evaluasi pencapaian Q2.', status: 'todo', priority: 'medium', progress: 0, dueDate: '2026-07-24', timeStart: '14:00', timeEnd: '15:30', assignee: 'user-2', createdBy: 'user-1' },
  ])

  const events = await Event.create([
    { id: 'event-1', title: 'STIFIn Workshop: Personal Growth', description: 'Workshop pengembangan diri.', date: '2026-08-15', time: '09:00', location: 'Gedung Serbaguna STIFIn', pic: 'user-2', status: 'upcoming', createdBy: 'user-1' },
    { id: 'event-2', title: 'Rapat Koordinasi Bulanan', description: 'Rapat rutin bulanan seluruh departemen.', date: '2026-07-25', time: '10:00', location: 'Ruang Rapat Utama', pic: 'user-1', status: 'upcoming', createdBy: 'user-1' },
    { id: 'event-3', title: 'Pelatihan Internal: Customer Service', description: 'Pelatihan kualitas layanan.', date: '2026-07-22', time: '13:00', location: 'Training Room A', pic: 'user-5', status: 'ongoing', createdBy: 'user-1' },
    { id: 'event-4', title: 'STIFIn Family Gathering', description: 'Acara tahunan keluarga besar STIFIn.', date: '2026-06-20', time: '08:00', location: 'Lapangan STIFIn Center', pic: 'user-2', status: 'completed', createdBy: 'user-1' },
  ])

  const kpi = await KPI.create([
    { id: 'kpi-1', name: 'Jumlah Peserta Workshop', description: 'Total peserta workshop per bulan.', target: 100, current: 72, unit: 'orang', department: 'STIFIn Family', period: 'monthly' },
    { id: 'kpi-2', name: 'Tingkat Kepuasan Klien', description: 'Persentase kepuasan klien.', target: 95, current: 88, unit: '%', department: 'Operations', period: 'monthly' },
    { id: 'kpi-3', name: 'Realisasi Anggaran', description: 'Persentase realisasi anggaran.', target: 100, current: 62, unit: '%', department: 'Finance', period: 'quarterly' },
    { id: 'kpi-4', name: 'Jangkauan Media Sosial', description: 'Total engagement media sosial.', target: 5000, current: 3850, unit: 'engagement', department: 'Marketing', period: 'monthly' },
    { id: 'kpi-5', name: 'Retensi Karyawan', description: 'Persentase retensi karyawan.', target: 90, current: 85, unit: '%', department: 'HR', period: 'yearly' },
  ])

  await Report.create([
    { id: 'rpt-1', title: 'Laporan Harian - 22 Juli 2026', summary: 'Menyelesaikan review konten sosial media.', notes: 'Konten sudah dijadwalkan.', type: 'daily', date: '2026-07-22', userId: 'user-3', taskIds: JSON.stringify(['task-3']) },
    { id: 'rpt-2', title: 'Laporan Harian - 22 Juli 2026', summary: 'Seleksi berkas pelamar.', notes: '5 kandidat lolos.', type: 'daily', date: '2026-07-22', userId: 'user-5', taskIds: JSON.stringify(['task-4']) },
    { id: 'rpt-3', title: 'Laporan Harian - 21 Juli 2026', summary: 'Review laporan keuangan.', notes: 'Dokumen audit 80%.', type: 'daily', date: '2026-07-21', userId: 'user-4', taskIds: JSON.stringify([]) },
  ])

  console.log('Database seeded successfully')
}
