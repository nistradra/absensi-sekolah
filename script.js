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
    const absensiKey = `absensi-${nama}-${tanggal}`; // Key unik untuk setiap siswa dan tanggal
    const now = new Date().getTime(); // Dapatkan timestamp saat ini
    const expiry = now + 24 * 60 * 60 * 1000; // Timestamp 24 jam dari sekarang
    const absensiData = {
        nama: nama,
        jurusan: jurusan,
        kelas: kelas,
        status: status,
        keterangan: keterangan,
        tanggal: tanggal, // Simpan tanggal
        expiry: expiry
    };
    localStorage.setItem(absensiKey, JSON.stringify(absensiData));

    // Tampilkan notifikasi
    showNotification();

    // Tambahkan data ke tabel
    addRowToTable(nama, kelas, jurusan, status, keterangan, tanggal);

    // Reset form (opsional)
    document.getElementById('form-absensi').reset();

    // Nonaktifkan form setelah submit
    disableForm();
});

document.getElementById('status').addEventListener('change', function(event) {
    const keteranganIzin = document.getElementById('keterangan-izin');
    if (this.value === 'izin') {
        keteranganIzin.style.display = 'block';
    } else {
        keteranganIzin.style.display = 'none';
    }
});

// Fungsi untuk memeriksa apakah siswa sudah submit absensi dan menghapus jika sudah expired
function checkAbsensi() {
    const nama = document.getElementById('nama').value;
    const tanggal = document.getElementById('tanggal').value;
    const absensiKey = `absensi-${nama}-${tanggal}`;
    const absensiDataString = localStorage.getItem(absensiKey);

    if (absensiDataString) {
        const absensiData = JSON.parse(absensiDataString);
        const now = new Date().getTime();

        if (now > absensiData.expiry) {
            // Jika sudah expired, hapus dari localStorage dan tabel
            localStorage.removeItem(absensiKey);
            removeRowFromTable(absensiData.nama, absensiData.tanggal);
            enableForm(); // Aktifkan kembali form
            // Reset nama field
            document.getElementById('nama').value = '';
        } else {
            // Jika belum expired DAN nama sama, nonaktifkan form
            if (absensiData.nama === nama) {
                disableForm();
            } else {
                enableForm();
                document.getElementById('nama').value = '';
            }
            markRowAsSubmitted(absensiData.nama, absensiData.tanggal);
        }
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

// Fungsi untuk menandai baris sebagai sudah disubmit
function markRowAsSubmitted(nama, tanggal) {
   const tableBody = document.querySelector('#absensi-table tbody');
    for (let i = 0; i < tableBody.rows.length; i++) {
        const row = tableBody.rows[i];
        const namaCell = row.cells[0].textContent;
        const tanggalFormated = document.getElementById('tanggal').value

        if (namaCell === nama && tanggalFormated === tanggal) {
            row.classList.add('sudah-submit');
            break;
        }
    }
}

// Fungsi untuk menghapus baris dari tabel
function removeRowFromTable(nama, tanggal) {
    const tableBody = document.querySelector('#absensi-table tbody');
    for (let i = 0; i < tableBody.rows.length; i++) {
        const row = tableBody.rows[i];
        const namaCell = row.cells[0].textContent;
        const tanggalFormated = document.getElementById('tanggal').value

       if (namaCell === nama && tanggalFormated === tanggal) {
            tableBody.deleteRow(i);
            break;
        }
    }
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

    // Panggil checkAbsensi setelah tanggal di-set
    checkAbsensi();

    // Load existing absensi data from localStorage
    loadExistingAbsensiData();
};

function loadExistingAbsensiData() {
    const tableBody = document.querySelector('#absensi-table tbody');
    tableBody.innerHTML = ''; // Clear existing table data

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('absensi-')) {
            const absensiDataString = localStorage.getItem(key);
            if (absensiDataString) {
                const absensiData = JSON.parse(absensiDataString);
                const now = new Date().getTime();

                if (now > absensiData.expiry) {
                    // If expired, remove from localStorage
                    localStorage.removeItem(key);
                } else {
                    // If not expired, add to table
                    addRowToTable(absensiData.nama, absensiData.kelas, absensiData.jurusan, absensiData.status, absensiData.keterangan, absensiData.tanggal);
                }
            }
        }
    }
}
