# ae-plugins

> ⚠️ **Work in Progress** — Plugin-plugin ini masih dalam tahap pengembangan aktif. Fitur bisa berubah sewaktu-waktu dan mungkin ada bug. Gunakan dengan risiko sendiri.

Kumpulan CEP Extension (plugin panel) untuk **Adobe After Effects**, dibuat untuk mempercepat workflow motion graphics dan animasi.

---

## Daftar Plugin

| Plugin | Versi | AE Minimum | Status |
|--------|-------|------------|--------|
| [Flow Killer](#flow-killer) | 2.0.0 | AE 2021 (v17.0+) | 🚧 Under Development |
| [MoGraph Tools](#mograph-tools) | 1.0.0 | AE 2020 (v14.0+) | 🚧 Under Development |

---

## Flow Killer

Panel CEP untuk After Effects dengan Bundle ID `com.flowkiller2.panel`.

> 🚧 Dokumentasi lengkap menyusul.

### Instalasi

1. Copy folder `FlowKiller/` ke direktori ekstensi Adobe CEP:

   **Windows:**
   ```
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
   ```
   **macOS:**
   ```
   /Library/Application Support/Adobe/CEP/extensions/
   ```

2. Aktifkan **Player Debug Mode** agar ekstensi unsigned bisa berjalan:

   **Windows** — buka Registry Editor, set value berikut jadi `1`:
   ```
   HKEY_CURRENT_USER\Software\Adobe\CSXS.11\PlayerDebugMode
   ```
   **macOS** — jalankan di Terminal:
   ```bash
   defaults write com.adobe.CSXS.11 PlayerDebugMode 1
   ```
   *(Ganti `CSXS.11` sesuai versi AE kamu — AE 2024 pakai CSXS.11, AE 2022 pakai CSXS.10, dst.)*

3. Restart After Effects, lalu buka dari **Window → Extensions → Flow Killer**.

---

## MoGraph Tools

Panel CEP untuk After Effects dengan Bundle ID `com.mograph.tools`.

> 🚧 Dokumentasi lengkap menyusul.

### Instalasi

Sama seperti Flow Killer di atas, copy folder `mographtool/` ke direktori ekstensi CEP, lalu buka dari **Window → Extensions → Mograph Tools**.

---

## Struktur Repo

```
ae-plugins/
├── README.md
├── .gitignore
├── FlowKiller/
│   ├── CSXS/
│   │   └── manifest.xml
│   ├── jsx/
│   │   └── host.jsx
│   ├── index.html
│   └── .debug
└── mographtool/
    ├── CSXS/
    │   └── manifest.xml
    ├── hostscript.jsx
    ├── index.html
    └── main.js
```

---

## Kontribusi

Repo ini masih early stage. Kalau nemu bug atau punya saran, silakan buka [Issue](../../issues) — feedback sangat diterima.

---

## Lisensi

Belum ditentukan. Hubungi pemilik repo untuk info lebih lanjut.
