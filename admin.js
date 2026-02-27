/**
 * =============================================
 * ADMIN PANEL – Rumah Belajar Mentari
 * Semua data disimpan di localStorage
 * =============================================
 */

// ===== DEFAULT DATA =====
const DEFAULT_DATA = {
  credentials: { username: "admin", password: "mentari123" },
  hero: {
    name: "Rumah Belajar Mentari",
    tagline: '"Mari membuat belajar lebih menyenangkan"',
    tag: "Lembaga Bimbingan Belajar",
    statStudents: "100+",
    statYears: "5+",
    statTeachers: "10+",
  },
  about: {
    desc: "Rumah Belajar Mentari adalah lembaga bimbingan belajar yang berdedikasi untuk membantu siswa meraih prestasi terbaik mereka. Kami percaya bahwa setiap anak memiliki potensi luar biasa yang perlu dikembangkan dengan cara yang menyenangkan dan efektif.",
    features: [
      { icon: "ph-chalkboard-teacher", title: "Pengajar Berpengalaman", desc: "Tenaga pengajar profesional dan berpengalaman di bidangnya" },
      { icon: "ph-smiley", title: "Belajar Menyenangkan", desc: "Metode pembelajaran interaktif yang membuat siswa semangat belajar" },
      { icon: "ph-chart-line-up", title: "Hasil Terbukti", desc: "Ratusan siswa telah meningkatkan prestasi akademik mereka" },
    ],
  },
  programs: [
    {
      level: "SD",
      title: "Sekolah Dasar",
      subtitle: "Kelas 1 – 6",
      subjects: ["Matematika", "Bahasa Indonesia", "IPA & IPS", "Bahasa Inggris"],
      featured: false,
    },
    {
      level: "SMP",
      title: "Sekolah Menengah Pertama",
      subtitle: "Kelas 7 – 9",
      subjects: ["Matematika", "IPA Terpadu", "Bahasa Inggris", "Persiapan UN"],
      featured: true,
    },
    {
      level: "SMA",
      title: "Sekolah Menengah Atas",
      subtitle: "Kelas 10 – 12",
      subjects: ["Matematika & Fisika", "Kimia & Biologi", "Bahasa Inggris", "Persiapan SNBT"],
      featured: false,
    },
  ],
  schedule: [
    { day: "Senin – Jumat", time: "14.00 – 17.00 WIB", desc: "Sesi Sore (Reguler)" },
    { day: "Sabtu", time: "08.00 – 12.00 WIB", desc: "Sesi Pagi (Weekend)" },
    { day: "Fleksibel", time: "Sesuai Kesepakatan", desc: "Privat / Online" },
  ],
  location: {
    name: "Rumah Belajar Mentari",
    address: "Jl. Contoh No. 123, Kota Anda",
    note: "Hubungi kami untuk informasi lokasi lengkap",
  },
  links: {
    wa: "6285733408212",
    ig: "rb.mentari",
    waMsg: "Halo Rumah Belajar Mentari! Saya ingin mendaftar sebagai siswa baru. Mohon informasi lebih lanjut 🙏",
  },
  gallery: [],
  testimonials: [
    {
      text: '"Nilai matematika anak saya naik drastis setelah belajar di Rumah Belajar Mentari. Pengajarnya sabar dan metodenya mudah dipahami."',
      name: "Ibu Ani",
      role: "Orang tua siswa SD",
      stars: 5,
    },
    {
      text: '"Belajar di sini menyenangkan! Saya jadi lebih percaya diri menghadapi ujian. Terima kasih Rumah Belajar Mentari!"',
      name: "Budi",
      role: "Siswa SMP Kelas 9",
      stars: 5,
    },
  ],
  footer: {
    name: "Rumah Belajar Mentari",
    tagline: '"Mari membuat belajar lebih menyenangkan"',
    copy: "Made with 💖 Rumah Belajar Mentari",
  },
};

// ===== STORAGE HELPERS =====
function getData(key) {
  try {
    const raw = localStorage.getItem("mentari_" + key);
    return raw ? JSON.parse(raw) : DEFAULT_DATA[key];
  } catch {
    return DEFAULT_DATA[key];
  }
}

function setData(key, value) {
  localStorage.setItem("mentari_" + key, JSON.stringify(value));
}

// ===== AUTH =====
function isLoggedIn() {
  return sessionStorage.getItem("mentari_admin_logged_in") === "true";
}

function login(username, password) {
  const creds = getData("credentials");
  return username === creds.username && password === creds.password;
}

function logout() {
  sessionStorage.removeItem("mentari_admin_logged_in");
  location.reload();
}

// ===== TOAST =====
function showToast(message, type = "success") {
  const container = document.getElementById("admin-toast");
  const item = document.createElement("div");
  item.className = `admin-toast-item ${type}`;
  item.innerHTML = `<i class="ph-fill ${type === "success" ? "ph-check-circle" : "ph-warning-circle"}"></i> ${message}`;
  container.appendChild(item);
  setTimeout(() => {
    item.classList.add("fade-out");
    item.addEventListener("animationend", () => item.remove());
  }, 2500);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    showAdminPage();
  } else {
    showLoginPage();
  }
});

function showLoginPage() {
  document.getElementById("login-page").classList.remove("hidden");
  document.getElementById("admin-page").classList.add("hidden");
}

function showAdminPage() {
  document.getElementById("login-page").classList.add("hidden");
  document.getElementById("admin-page").classList.remove("hidden");
  initAdminPage();
}

// ===== LOGIN FORM =====
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");

  if (login(username, password)) {
    sessionStorage.setItem("mentari_admin_logged_in", "true");
    errorEl.textContent = "";
    showAdminPage();
  } else {
    errorEl.textContent = "Username atau password salah.";
  }
});

// Toggle password visibility
document.getElementById("toggle-password").addEventListener("click", () => {
  const input = document.getElementById("password");
  const icon = document.getElementById("eye-icon");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "ph ph-eye-slash";
  } else {
    input.type = "password";
    icon.className = "ph ph-eye";
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", logout);

// ===== SIDEBAR NAVIGATION =====
const navItems = document.querySelectorAll(".nav-item");
const tabContents = document.querySelectorAll(".tab-content");
const pageTitle = document.getElementById("page-title");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const tab = item.dataset.tab;

    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");

    tabContents.forEach((t) => t.classList.add("hidden"));
    const target = document.getElementById("tab-" + tab);
    if (target) target.classList.remove("hidden");

    pageTitle.textContent = item.textContent.trim();

    // Close sidebar on mobile
    closeSidebar();
  });
});

// Mobile sidebar toggle
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebar-close");

// Create overlay
const overlay = document.createElement("div");
overlay.className = "sidebar-overlay";
document.body.appendChild(overlay);

menuToggle.addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("active");
});

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
}

sidebarClose.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

// ===== INIT ADMIN PAGE =====
function initAdminPage() {
  loadHero();
  loadAbout();
  loadPrograms();
  loadSchedule();
  loadLocation();
  loadLinks();
  loadGallery();
  loadTestimonials();
  loadFooter();
}

// ===========================
// ===== HERO =====
// ===========================
function loadHero() {
  const d = getData("hero");
  document.getElementById("hero-name").value = d.name || "";
  document.getElementById("hero-tagline").value = d.tagline || "";
  document.getElementById("hero-tag").value = d.tag || "";
  document.getElementById("stat-students").value = d.statStudents || "";
  document.getElementById("stat-years").value = d.statYears || "";
  document.getElementById("stat-teachers").value = d.statTeachers || "";
}

function saveHero() {
  setData("hero", {
    name: document.getElementById("hero-name").value,
    tagline: document.getElementById("hero-tagline").value,
    tag: document.getElementById("hero-tag").value,
    statStudents: document.getElementById("stat-students").value,
    statYears: document.getElementById("stat-years").value,
    statTeachers: document.getElementById("stat-teachers").value,
  });
  showToast("Hero berhasil disimpan!");
}

// ===========================
// ===== ABOUT =====
// ===========================
function loadAbout() {
  const d = getData("about");
  document.getElementById("about-desc").value = d.desc || "";
  renderAboutFeatures(d.features || []);
}

function renderAboutFeatures(features) {
  const container = document.getElementById("about-features-list");
  container.innerHTML = "";
  features.forEach((f, i) => {
    container.innerHTML += `
      <div class="list-item" id="about-feature-${i}">
        <div class="list-item-header">
          <span class="list-item-title">Fitur #${i + 1}</span>
          <button class="btn-danger" onclick="removeAboutFeature(${i})">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>
        <div class="list-item-grid">
          <div class="form-group">
            <label>Judul</label>
            <input type="text" id="af-title-${i}" value="${escHtml(f.title)}">
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <input type="text" id="af-desc-${i}" value="${escHtml(f.desc)}">
          </div>
        </div>
      </div>`;
  });
}

function addAboutFeature() {
  const d = getData("about");
  const features = d.features || [];
  features.push({ icon: "ph-star", title: "Fitur Baru", desc: "Deskripsi fitur" });
  d.features = features;
  setData("about", d);
  renderAboutFeatures(features);
}

function removeAboutFeature(index) {
  const d = getData("about");
  d.features.splice(index, 1);
  setData("about", d);
  renderAboutFeatures(d.features);
}

function saveAbout() {
  const d = getData("about");
  d.desc = document.getElementById("about-desc").value;
  const features = d.features || [];
  features.forEach((f, i) => {
    f.title = document.getElementById(`af-title-${i}`)?.value || f.title;
    f.desc = document.getElementById(`af-desc-${i}`)?.value || f.desc;
  });
  d.features = features;
  setData("about", d);
  showToast("Tentang Kami berhasil disimpan!");
}

// ===========================
// ===== PROGRAMS =====
// ===========================
function loadPrograms() {
  const programs = getData("programs");
  renderPrograms(programs);
}

function renderPrograms(programs) {
  const container = document.getElementById("programs-list");
  container.innerHTML = "";
  programs.forEach((p, i) => {
    container.innerHTML += `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-title">Program #${i + 1}</span>
          <button class="btn-danger" onclick="removeProgram(${i})">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>
        <div class="list-item-grid">
          <div class="form-group">
            <label>Level (SD/SMP/SMA)</label>
            <input type="text" id="prog-level-${i}" value="${escHtml(p.level)}">
          </div>
          <div class="form-group">
            <label>Nama Program</label>
            <input type="text" id="prog-title-${i}" value="${escHtml(p.title)}">
          </div>
          <div class="form-group">
            <label>Subtitle (misal: Kelas 1–6)</label>
            <input type="text" id="prog-sub-${i}" value="${escHtml(p.subtitle)}">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="prog-featured-${i}" ${p.featured ? "checked" : ""}> Tandai sebagai Populer
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Mata Pelajaran (pisahkan dengan koma)</label>
          <input type="text" id="prog-subjects-${i}" value="${escHtml((p.subjects || []).join(", "))}">
        </div>
      </div>`;
  });
}

function addProgram() {
  const programs = getData("programs");
  programs.push({ level: "Baru", title: "Program Baru", subtitle: "Kelas ...", subjects: [], featured: false });
  setData("programs", programs);
  renderPrograms(programs);
}

function removeProgram(index) {
  const programs = getData("programs");
  programs.splice(index, 1);
  setData("programs", programs);
  renderPrograms(programs);
}

function savePrograms() {
  const programs = getData("programs");
  programs.forEach((p, i) => {
    p.level = document.getElementById(`prog-level-${i}`)?.value || p.level;
    p.title = document.getElementById(`prog-title-${i}`)?.value || p.title;
    p.subtitle = document.getElementById(`prog-sub-${i}`)?.value || p.subtitle;
    p.featured = document.getElementById(`prog-featured-${i}`)?.checked || false;
    const subjectsRaw = document.getElementById(`prog-subjects-${i}`)?.value || "";
    p.subjects = subjectsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  });
  setData("programs", programs);
  showToast("Program Belajar berhasil disimpan!");
}

// ===========================
// ===== SCHEDULE =====
// ===========================
function loadSchedule() {
  const schedule = getData("schedule");
  renderSchedule(schedule);
}

function renderSchedule(schedule) {
  const container = document.getElementById("schedule-list");
  container.innerHTML = "";
  schedule.forEach((s, i) => {
    container.innerHTML += `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-title">Jadwal #${i + 1}</span>
          <button class="btn-danger" onclick="removeSchedule(${i})">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>
        <div class="list-item-grid">
          <div class="form-group">
            <label>Hari</label>
            <input type="text" id="sch-day-${i}" value="${escHtml(s.day)}">
          </div>
          <div class="form-group">
            <label>Waktu</label>
            <input type="text" id="sch-time-${i}" value="${escHtml(s.time)}">
          </div>
          <div class="form-group">
            <label>Keterangan</label>
            <input type="text" id="sch-desc-${i}" value="${escHtml(s.desc)}">
          </div>
        </div>
      </div>`;
  });
}

function addSchedule() {
  const schedule = getData("schedule");
  schedule.push({ day: "Hari", time: "00.00 – 00.00 WIB", desc: "Keterangan" });
  setData("schedule", schedule);
  renderSchedule(schedule);
}

function removeSchedule(index) {
  const schedule = getData("schedule");
  schedule.splice(index, 1);
  setData("schedule", schedule);
  renderSchedule(schedule);
}

function saveSchedule() {
  const schedule = getData("schedule");
  schedule.forEach((s, i) => {
    s.day = document.getElementById(`sch-day-${i}`)?.value || s.day;
    s.time = document.getElementById(`sch-time-${i}`)?.value || s.time;
    s.desc = document.getElementById(`sch-desc-${i}`)?.value || s.desc;
  });
  setData("schedule", schedule);
  showToast("Jadwal Belajar berhasil disimpan!");
}

// ===========================
// ===== LOCATION =====
// ===========================
function loadLocation() {
  const d = getData("location");
  document.getElementById("loc-name").value = d.name || "";
  document.getElementById("loc-address").value = d.address || "";
  document.getElementById("loc-note").value = d.note || "";
}

function saveLocation() {
  setData("location", {
    name: document.getElementById("loc-name").value,
    address: document.getElementById("loc-address").value,
    note: document.getElementById("loc-note").value,
  });
  showToast("Lokasi berhasil disimpan!");
}

// ===========================
// ===== LINKS =====
// ===========================
function loadLinks() {
  const d = getData("links");
  document.getElementById("link-wa").value = d.wa || "";
  document.getElementById("link-ig").value = d.ig || "";
  document.getElementById("link-wa-msg").value = d.waMsg || "";
}

function saveLinks() {
  setData("links", {
    wa: document.getElementById("link-wa").value,
    ig: document.getElementById("link-ig").value,
    waMsg: document.getElementById("link-wa-msg").value,
  });
  showToast("Tautan & Kontak berhasil disimpan!");
}

// ===========================
// ===== GALLERY =====
// ===========================
function loadGallery() {
  const gallery = getData("gallery");
  renderGallery(gallery);
}

function renderGallery(gallery) {
  const container = document.getElementById("gallery-list");
  container.innerHTML = "";
  if (gallery.length === 0) {
    container.innerHTML = `<p style="color:#8787a3;font-size:0.85rem;margin-bottom:0.75rem;">Belum ada gambar. Klik "Tambah Gambar" untuk menambahkan.</p>`;
    return;
  }
  gallery.forEach((g, i) => {
    container.innerHTML += `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-title">Gambar #${i + 1}</span>
          <button class="btn-danger" onclick="removeGalleryItem(${i})">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>
        <div class="form-group">
          <label>URL Gambar</label>
          <input type="url" id="gal-url-${i}" value="${escHtml(g.url)}" placeholder="https://..." oninput="previewGalleryImage(${i})">
        </div>
        <div class="form-group">
          <label>Keterangan (opsional)</label>
          <input type="text" id="gal-caption-${i}" value="${escHtml(g.caption || "")}" placeholder="Keterangan gambar...">
        </div>
        ${g.url ? `<img src="${escHtml(g.url)}" class="gallery-preview" id="gal-preview-${i}" alt="Preview" onerror="this.style.display='none'">` : `<div class="gallery-preview-placeholder" id="gal-preview-${i}"><i class="ph ph-image" style="font-size:1.5rem;margin-right:0.5rem"></i> Preview gambar</div>`}
      </div>`;
  });
}

function addGalleryItem() {
  const gallery = getData("gallery");
  gallery.push({ url: "", caption: "" });
  setData("gallery", gallery);
  renderGallery(gallery);
}

function removeGalleryItem(index) {
  const gallery = getData("gallery");
  gallery.splice(index, 1);
  setData("gallery", gallery);
  renderGallery(gallery);
}

function previewGalleryImage(index) {
  const url = document.getElementById(`gal-url-${index}`)?.value;
  const preview = document.getElementById(`gal-preview-${index}`);
  if (!preview) return;
  if (url) {
    if (preview.tagName === "IMG") {
      preview.src = url;
      preview.style.display = "";
    } else {
      const img = document.createElement("img");
      img.src = url;
      img.className = "gallery-preview";
      img.id = `gal-preview-${index}`;
      img.alt = "Preview";
      img.onerror = () => { img.style.display = "none"; };
      preview.replaceWith(img);
    }
  }
}

function saveGallery() {
  const gallery = getData("gallery");
  gallery.forEach((g, i) => {
    g.url = document.getElementById(`gal-url-${i}`)?.value || g.url;
    g.caption = document.getElementById(`gal-caption-${i}`)?.value || "";
  });
  setData("gallery", gallery);
  showToast("Galeri berhasil disimpan!");
}

// ===========================
// ===== TESTIMONIALS =====
// ===========================
function loadTestimonials() {
  const testimonials = getData("testimonials");
  renderTestimonials(testimonials);
}

function renderTestimonials(testimonials) {
  const container = document.getElementById("testimonials-list");
  container.innerHTML = "";
  testimonials.forEach((t, i) => {
    container.innerHTML += `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-title">Testimoni #${i + 1}</span>
          <button class="btn-danger" onclick="removeTestimonial(${i})">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>
        <div class="form-group">
          <label>Teks Testimoni</label>
          <textarea id="test-text-${i}" rows="3">${escHtml(t.text)}</textarea>
        </div>
        <div class="list-item-grid">
          <div class="form-group">
            <label>Nama</label>
            <input type="text" id="test-name-${i}" value="${escHtml(t.name)}">
          </div>
          <div class="form-group">
            <label>Peran / Keterangan</label>
            <input type="text" id="test-role-${i}" value="${escHtml(t.role)}">
          </div>
        </div>
        <div class="form-group">
          <label>Rating Bintang</label>
          <div class="stars-selector" id="stars-${i}">
            ${[1,2,3,4,5].map(n => `<button type="button" class="${n <= t.stars ? 'active' : ''}" onclick="setStars(${i}, ${n})">★</button>`).join("")}
          </div>
          <input type="hidden" id="test-stars-${i}" value="${t.stars}">
        </div>
      </div>`;
  });
}

function setStars(testimonialIndex, stars) {
  document.getElementById(`test-stars-${testimonialIndex}`).value = stars;
  const btns = document.querySelectorAll(`#stars-${testimonialIndex} button`);
  btns.forEach((btn, i) => {
    btn.classList.toggle("active", i < stars);
  });
}

function addTestimonial() {
  const testimonials = getData("testimonials");
  testimonials.push({ text: '"Testimoni baru..."', name: "Nama", role: "Peran", stars: 5 });
  setData("testimonials", testimonials);
  renderTestimonials(testimonials);
}

function removeTestimonial(index) {
  const testimonials = getData("testimonials");
  testimonials.splice(index, 1);
  setData("testimonials", testimonials);
  renderTestimonials(testimonials);
}

function saveTestimonials() {
  const testimonials = getData("testimonials");
  testimonials.forEach((t, i) => {
    t.text = document.getElementById(`test-text-${i}`)?.value || t.text;
    t.name = document.getElementById(`test-name-${i}`)?.value || t.name;
    t.role = document.getElementById(`test-role-${i}`)?.value || t.role;
    t.stars = parseInt(document.getElementById(`test-stars-${i}`)?.value) || 5;
  });
  setData("testimonials", testimonials);
  showToast("Testimoni berhasil disimpan!");
}

// ===========================
// ===== FOOTER =====
// ===========================
function loadFooter() {
  const d = getData("footer");
  document.getElementById("footer-name").value = d.name || "";
  document.getElementById("footer-tagline").value = d.tagline || "";
  document.getElementById("footer-copy").value = d.copy || "";
}

function saveFooter() {
  setData("footer", {
    name: document.getElementById("footer-name").value,
    tagline: document.getElementById("footer-tagline").value,
    copy: document.getElementById("footer-copy").value,
  });
  showToast("Footer berhasil disimpan!");
}

// ===========================
// ===== CHANGE PASSWORD =====
// ===========================
function changePassword() {
  const oldPw = document.getElementById("old-password").value;
  const newPw = document.getElementById("new-password").value;
  const confirmPw = document.getElementById("confirm-password").value;
  const msgEl = document.getElementById("pw-msg");

  const creds = getData("credentials");

  if (oldPw !== creds.password) {
    msgEl.textContent = "Password lama tidak sesuai.";
    msgEl.className = "pw-msg error";
    return;
  }
  if (newPw.length < 6) {
    msgEl.textContent = "Password baru minimal 6 karakter.";
    msgEl.className = "pw-msg error";
    return;
  }
  if (newPw !== confirmPw) {
    msgEl.textContent = "Konfirmasi password tidak cocok.";
    msgEl.className = "pw-msg error";
    return;
  }

  creds.password = newPw;
  setData("credentials", creds);
  msgEl.textContent = "Password berhasil diubah!";
  msgEl.className = "pw-msg success";
  document.getElementById("old-password").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("confirm-password").value = "";
  showToast("Password berhasil diubah!");
}

// ===========================
// ===== UTILS =====
// ===========================
function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
