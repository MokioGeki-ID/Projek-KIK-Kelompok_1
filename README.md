# IdeaValid
Jalankan: `npm install` lalu `npm run dev` (http://localhost:5173). Ada scene 3D (three.js) di Dashboard dan Matriks Prioritas.
Data tersimpan di localStorage; ekspor lewat CSV/JSON di Dashboard.

## Alur penilaian (draft → analisa → terapkan)
Di tab **Ide & Penilaian** dan **Bobot**, menggeser slider atau checklist hanya mengubah *draft*.
Skor dan peringkat tersimpan baru berubah setelah menekan **Terapkan**.
Sebelum itu muncul panel analisa: skor/peringkat/confidence/kuadran sebelum vs sesudah, kriteria yang berubah,
catatan peringatan (mis. lompatan nilai besar, ide terbaik berganti), dan ide lain yang ikut bergeser.
Setelah diterapkan tersedia tombol **Urungkan**.

## Struktur
- `src/store.jsx` state, rumus, `analyze()` / `previewW()` untuk simulasi tanpa mengubah data
- `src/Evaluate.jsx` halaman Ide & Penilaian dan Bobot
- `src/ui.jsx` komponen bersama (PageHead, Stat, Steps, Modal, Form)
- `src/App.jsx` Dashboard, Matriks, Bandingkan, Tentang
