document.getElementById('form-absensi').addEventListener('submit', function(event) {
    event.preventDefault(); // Mencegah form dari submit standar

    // Ambil nilai dari form
    const nama = document.getElementById('nama').value;
    const jurusan = document.getElementById('jurusan').value;
    const kelas = document.getElementById('kelas').value;
    const tanggal = document.getElementById('tanggal').value;
    const status = document.getElementById('status').value;
    let keterangan = '';

    if (status === 'izin') {
        keterangan = document.getElementById('keterangan').value;
    }

    // Simpan data ke localStorage dengan timestamp
    const absensiKey = `absensi-${tanggal}`; // Key unik untuk tanggal
    let absensiData = JSON.parse(localStorage.getItem(absensiKey)) || []; // Ambil data yang sudah ada atau buat array baru
    const now = new Date().getTime(); // Dapatkan timestamp saat ini
    const expiry = now + 24 * 60 * 60 * 1000; // Timestamp 24 jam dari sekarang

    // Tambahkan data absensi baru ke array
    absensiData.push({
        nama: nama,
        jurusan: jurusan,
        kelas: kelas,
        status: status,
        keterangan: keterangan,
        tanggal: tanggal,
        expiry: expiry
    });

    localStorage.setItem(absensiKey, JSON.stringify(absensiData)); // Simpan array ke localStorage

    // Tampilkan notifikasi
    showNotification();

    // Tampilkan data absensi di tabel
    loadExistingAbsensiData();

    // Reset form (opsional)
    document.getElementById('form-absensi').reset();

    // Perbarui tampilan dan status form
    checkAbsensi();
});

document.getElementById('status').addEventListener('change', function(event) {
    const keteranganIzin = document.getElementById('keterangan-izin');
    if (this.value === 'izin') {
        keteranganIzin.style.display = 'block';
    } else {
        keteranganIzin.style.display = 'none';
    }
});

// Fungsi untuk memeriksa apakah siswa sudah submit absensi dan menghapus data yang sudah expired
function checkAbsensi() {
    const nama = document.getElementById('nama').value;
    const tanggal = document.getElementById('tanggal').value;
    const absensiKey = `absensi-${tanggal}`; // Key unik untuk tanggal
    const absensiDataString = localStorage.getItem(absensiKey);

    if (absensiDataString) {
        const absensiData = JSON.parse(absensiDataString);
        const now = new Date().getTime();

        // Filter data yang sudah expired
        const updatedAbsensiData = absensiData.filter(item => item.expiry > now);

        // Simpan kembali data yang sudah difilter ke localStorage
        localStorage.setItem(absensiKey, JSON.stringify(updatedAbsensiData));

        // Periksa apakah siswa sudah absen hari ini
        const sudahAbsen = updatedAbsensiData.some(item => item.nama === nama);

        if (sudahAbsen) {
            disableForm(); // Nonaktifkan form jika sudah absen
        } else {
            enableForm(); // Aktifkan form jika belum absen
        }

        // Tampilkan data absensi di tabel
        loadExistingAbsensiData();
    } else {
        enableForm(); // Aktifkan form jika data tidak ditemukan
    }
}

// Fungsi untuk menambahkan baris ke tabel
function addRowToTable(nama, kelas, jurusan, status, keterangan, tanggal) {
    const tableBody = document.querySelector('#absensi-table tbody');
    const newRow = tableBody.insertRow();

    const namaCell = newRow.insertCell();
    namaCell.textContent = nama;

    const kelasCell = newRow.insertCell();
    kelasCell.textContent = kelas;

    const jurusanCell = newRow.insertCell();
    jurusanCell.textContent = jurusan;

    const statusCell = newRow.insertCell();
    statusCell.textContent = status;

    const keteranganCell = newRow.insertCell();
    keteranganCell.textContent = keterangan;
}

// Fungsi untuk mengaktifkan form
function enableForm() {
    const formElements = document.getElementById('form-absensi').elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = false;
    }
}

// Fungsi untuk menonaktifkan form
function disableForm() {
    const formElements = document.getElementById('form-absensi').elements;
    for (let i = 0; i < formElements.length; i++) {
        formElements[i].disabled = true;
    }
}

// Fungsi untuk menampilkan notifikasi
function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show'); // Tambahkan kelas 'show' untuk memicu animasi

    // Hilangkan notifikasi setelah 3 detik
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
}

// Fungsi untuk menampilkan waktu saat ini
function updateWaktu() {
    const waktuElement = document.getElementById('waktu');
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');
    waktuElement.textContent = `${jam}:${menit}:${detik}`;
}

// Panggil updateWaktu setiap detik
setInterval(updateWaktu, 1000);

// Panggil checkAbsensi saat halaman dimuat
window.onload = function() {
    // Set tanggal default ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;

    // Update waktu setiap detik
    updateWaktu();

    // Load existing absensi data from localStorage
    loadExistingAbsensiData();

    // Panggil checkAbsensi setelah tanggal di-set
    checkAbsensi();
};

function loadExistingAbsensiData() {
    const tableBody = document.querySelector('#absensi-table tbody');
    tableBody.innerHTML = ''; // Bersihkan data tabel yang ada

    const tanggal = document.getElementById('tanggal').value;
    const absensiKey = `absensi-${tanggal}`;
    const absensiDataString = localStorage.getItem(absensiKey);

    if (absensiDataString) {
        const absensiData = JSON.parse(absensiDataString);

        absensiData.forEach(item => {
            addRowToTable(item.nama, item.kelas, item.jurusan, item.status, item.keterangan, item.tanggal);
        });
    }
}
