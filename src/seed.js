import bcrypt from 'bcryptjs'
import User from './models/User.js'
import DailySheet from './models/DailySheet.js'
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

  const sheets = await DailySheet.create([
    {
      id: 'sheet-1',
      date: '2026-07-22',
      userId: 'user-3',
      createdBy: 'user-1',
      status: 'reported',
      items: [
        { id: 'item-1', timeStart: '09:00', timeEnd: '11:00', work: 'Telepon prospek baru', keterangan: 'Menghubungi kontak prospek untuk penawaran, goal 20 leads', targetLeads: 20, actualTimeStart: '09:00', actualTimeEnd: '11:30', leadsObtained: 18 },
        { id: 'item-2', timeStart: '13:00', timeEnd: '15:00', work: 'Update konten sosial media', keterangan: 'Jadwalkan postingan mingguan, goal engagement', targetLeads: 0, actualTimeStart: '13:00', actualTimeEnd: '15:00', leadsObtained: 0 },
      ],
      notes: 'Koneksi sempat terganggu saat telepon siang.',
      followedUp: 12,
    },
    {
      id: 'sheet-2',
      date: '2026-07-22',
      userId: 'user-4',
      createdBy: 'user-1',
      status: 'reported',
      items: [
        { id: 'item-3', timeStart: '08:00', timeEnd: '10:00', work: 'Review laporan keuangan bulanan', keterangan: 'Validasi laporan keuangan, goal akurasi data', targetLeads: 0, actualTimeStart: '08:00', actualTimeEnd: '10:00', leadsObtained: 0 },
      ],
      notes: 'Dokumen audit selesai 80%.',
      followedUp: 0,
    },
    {
      id: 'sheet-3',
      date: '2026-07-23',
      userId: 'user-3',
      createdBy: 'user-1',
      status: 'draft',
      items: [
        { id: 'item-4', timeStart: '09:00', timeEnd: '11:00', work: 'Follow up calon peserta tes', keterangan: 'Konfirmasi jadwal tes gelombang 2, goal 15 leads', targetLeads: 15 },
      ],
      notes: '',
      followedUp: 0,
    },
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
