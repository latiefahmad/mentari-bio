/**
 * =============================================
 * ADMIN PANEL – Rumah Belajar Mentari
 * Semua data disimpan via API ke Supabase
 * =============================================
 */

// ===== AUTH =====
function getToken() {
  return sessionStorage.getItem("mentari_admin_token");
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  sessionStorage.removeItem("mentari_admin_token");
  location.reload();
}

// ===== API HELPER =====
async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPut(path, data) {
  const res = await fetch(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `PUT ${path} failed: ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, data) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `POST ${path} failed: ${res.status}`);
  }
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(path, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `DELETE ${path} failed: ${res.status}`);
  }
  return res.json();
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
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");
  const submitBtn = e.target.querySelector("button[type=submit]");

  errorEl.textContent = "";
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="ph-fill ph-circle-notch" style="animation:spin 1s linear infinite"></i> Masuk...';

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "Login gagal";
      return;
    }

    sessionStorage.setItem("mentari_admin_token", data.token);
    showAdminPage();
  } catch (err) {
    errorEl.textContent = "Tidak dapat terhubung ke server";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Masuk</span><i class="ph-fill ph-arrow-right"></i>';
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

// Logout (sidebar button)
document.getElementById("logout-btn").addEventListener("click", logout);

// Logout (topbar button - mobile)
const topbarLogoutBtn = document.getElementById("topbar-logout-btn");
if (topbarLogoutBtn) {
  topbarLogoutBtn.addEventListener("click", logout);
}

// Back to top button
const adminBackToTop = document.getElementById("admin-back-to-top");
if (adminBackToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      adminBackToTop.classList.add("visible");
    } else {
      adminBackToTop.classList.remove("visible");
    }
  });

  adminBackToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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
    closeSidebar();
  });
});

// Mobile sidebar toggle
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebar-close");

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
async function initAdminPage() {
  try {
    const data = await apiGet("/api/content");
    const gallery = await apiGet("/api/gallery");

    loadHero(data.hero || {});
    loadAbout(data.about || {});
    loadPrograms(data.programs || []);
    loadSchedule(data.schedules || []);
    loadLocation(data.location || {});
    loadLinks(data.links || {});
    loadGallery(gallery || []);
    loadTestimonials(data.testimonials || []);
    loadFooter(data.footer || {});
    // Load events (tidak block jika gagal)
    loadEvents().catch(() => {});
  } catch (err) {
    showToast("Gagal memuat data: " + err.message, "error");
  }
}

// ===========================
// ===== HERO =====
// ===========================
function loadHero(d) {
  document.getElementById("hero-name").value = d.name || "";
  document.getElementById("hero-tagline").value = d.tagline || "";
  document.getElementById("hero-tag").value = d.tag || "";
  document.getElementById("stat-students").value = d.statStudents || "";
  document.getElementById("stat-years").value = d.statYears || "";
  document.getElementById("stat-teachers").value = d.statTeachers || "";
}

async function saveHero() {
  try {
    await apiPut("/api/content/hero", {
      name: document.getElementById("hero-name").value,
      tagline: document.getElementById("hero-tagline").value,
      tag: document.getElementById("hero-tag").value,
      statStudents: document.getElementById("stat-students").value,
      statYears: document.getElementById("stat-years").value,
      statTeachers: document.getElementById("stat-teachers").value,
    });
    showToast("Hero berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== ABOUT =====
// ===========================
let _aboutFeatures = [];

function loadAbout(d) {
  document.getElementById("about-desc").value = d.desc || "";
  _aboutFeatures = d.features ? [...d.features] : [];
  renderAboutFeatures();
}

function renderAboutFeatures() {
  const container = document.getElementById("about-features-list");
  container.innerHTML = "";
  _aboutFeatures.forEach((f, i) => {
    container.innerHTML += `
      <div class="list-item">
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
  _aboutFeatures.push({ icon: "ph-star", title: "Fitur Baru", desc: "Deskripsi fitur" });
  renderAboutFeatures();
}

function removeAboutFeature(index) {
  _aboutFeatures.splice(index, 1);
  renderAboutFeatures();
}

async function saveAbout() {
  // Baca nilai terkini dari form
  _aboutFeatures.forEach((f, i) => {
    f.title = document.getElementById(`af-title-${i}`)?.value || f.title;
    f.desc = document.getElementById(`af-desc-${i}`)?.value || f.desc;
  });

  try {
    await apiPut("/api/content/about", {
      desc: document.getElementById("about-desc").value,
      features: _aboutFeatures,
    });
    showToast("Tentang Kami berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== PROGRAMS =====
// ===========================
let _programs = [];

function loadPrograms(programs) {
  _programs = programs.map(p => ({
    level: p.level || "",
    title: p.title || "",
    subtitle: p.subtitle || "",
    subjects: p.subjects || [],
    is_featured: p.is_featured || false,
  }));
  renderPrograms();
}

function renderPrograms() {
  const container = document.getElementById("programs-list");
  container.innerHTML = "";
  _programs.forEach((p, i) => {
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
          <div class="form-group" style="display:flex;align-items:center;gap:0.5rem;padding-top:1.5rem">
            <input type="checkbox" id="prog-featured-${i}" ${p.is_featured ? "checked" : ""} style="width:auto">
            <label for="prog-featured-${i}" style="margin:0">Tandai sebagai Populer</label>
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
  _programs.push({ level: "Baru", title: "Program Baru", subtitle: "Kelas ...", subjects: [], is_featured: false });
  renderPrograms();
}

function removeProgram(index) {
  _programs.splice(index, 1);
  renderPrograms();
}

async function savePrograms() {
  _programs.forEach((p, i) => {
    p.level = document.getElementById(`prog-level-${i}`)?.value || p.level;
    p.title = document.getElementById(`prog-title-${i}`)?.value || p.title;
    p.subtitle = document.getElementById(`prog-sub-${i}`)?.value || p.subtitle;
    p.is_featured = document.getElementById(`prog-featured-${i}`)?.checked || false;
    const subjectsRaw = document.getElementById(`prog-subjects-${i}`)?.value || "";
    p.subjects = subjectsRaw.split(",").map(s => s.trim()).filter(Boolean);
  });

  try {
    await apiPut("/api/content/programs", _programs);
    showToast("Program Belajar berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== SCHEDULE =====
// ===========================
let _schedules = [];

function loadSchedule(schedules) {
  _schedules = schedules.map(s => ({
    day: s.day || "",
    time: s.time || "",
    desc: s.description || s.desc || "",
  }));
  renderSchedule();
}

function renderSchedule() {
  const container = document.getElementById("schedule-list");
  container.innerHTML = "";
  _schedules.forEach((s, i) => {
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
  _schedules.push({ day: "Hari", time: "00.00 – 00.00 WIB", desc: "Keterangan" });
  renderSchedule();
}

function removeSchedule(index) {
  _schedules.splice(index, 1);
  renderSchedule();
}

async function saveSchedule() {
  _schedules.forEach((s, i) => {
    s.day = document.getElementById(`sch-day-${i}`)?.value || s.day;
    s.time = document.getElementById(`sch-time-${i}`)?.value || s.time;
    s.desc = document.getElementById(`sch-desc-${i}`)?.value || s.desc;
  });

  try {
    await apiPut("/api/content/schedule", _schedules.map(s => ({
      day: s.day,
      time: s.time,
      description: s.desc,
    })));
    showToast("Jadwal Belajar berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== LOCATION =====
// ===========================
function loadLocation(d) {
  document.getElementById("loc-name").value = d.name || "";
  document.getElementById("loc-address").value = d.address || "";
  document.getElementById("loc-note").value = d.note || "";
}

async function saveLocation() {
  try {
    await apiPut("/api/content/location", {
      name: document.getElementById("loc-name").value,
      address: document.getElementById("loc-address").value,
      note: document.getElementById("loc-note").value,
    });
    showToast("Lokasi berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== LINKS =====
// ===========================
function loadLinks(d) {
  document.getElementById("link-wa").value = d.wa || "";
  document.getElementById("link-ig").value = d.ig || "";
  document.getElementById("link-wa-msg").value = d.waMsg || "";
}

async function saveLinks() {
  try {
    await apiPut("/api/content/links", {
      wa: document.getElementById("link-wa").value,
      ig: document.getElementById("link-ig").value,
      waMsg: document.getElementById("link-wa-msg").value,
    });
    showToast("Tautan & Kontak berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== GALLERY =====
// ===========================
let _gallery = [];

function loadGallery(gallery) {
  _gallery = gallery.map(g => ({ ...g }));
  renderGallery();
}

function renderGallery() {
  const container = document.getElementById("gallery-list");
  container.innerHTML = "";

  if (_gallery.length === 0) {
    container.innerHTML = `<p style="color:#8787a3;font-size:0.85rem;margin-bottom:0.75rem;">Belum ada gambar. Klik "Tambah Gambar" untuk menambahkan.</p>`;
    return;
  }

  _gallery.forEach((g, i) => {
    container.innerHTML += `
      <div class="list-item" id="gallery-item-${i}">
        <div class="list-item-header">
          <span class="list-item-title">Gambar #${i + 1}</span>
          <button class="btn-danger" onclick="removeGalleryItem('${g.id}', ${i})">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>
        ${g.public_url ? `<img src="${escHtml(g.public_url)}" class="gallery-preview" alt="Preview">` : ""}
        <div class="form-group">
          <label>Keterangan (opsional)</label>
          <input type="text" id="gal-caption-${i}" value="${escHtml(g.caption || "")}" placeholder="Keterangan gambar...">
        </div>
        <button class="btn-secondary" style="align-self:flex-start" onclick="updateGalleryCaption('${g.id}', ${i})">
          <i class="ph-fill ph-floppy-disk"></i> Simpan Keterangan
        </button>
      </div>`;
  });
}

function addGalleryItem() {
  // Trigger file input
  const fileInput = document.getElementById("gallery-file-input");
  if (fileInput) fileInput.click();
}

async function handleGalleryFileSelect(input) {
  const files = Array.from(input.files);
  if (!files.length) return;

  const captionInput = document.getElementById("gallery-upload-caption");
  const caption = captionInput ? captionInput.value : "";

  for (const file of files) {
    await uploadGalleryFile(file, caption);
  }

  input.value = ""; // Reset input
  if (captionInput) captionInput.value = "";
}

async function uploadGalleryFile(file, caption = "") {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);

  const uploadBtn = document.getElementById("gallery-upload-btn");
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="ph-fill ph-spinner"></i> Mengupload...';
  }

  try {
    const res = await fetch("/api/gallery/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Upload gagal", "error");
      return;
    }

    // Tambahkan ke list
    _gallery.push({
      id: data.id,
      public_url: data.public_url,
      caption: data.caption || "",
    });
    renderGallery();
    showToast(`Gambar berhasil diupload dan dikonversi ke WebP!`);
  } catch (err) {
    showToast("Gagal upload: " + err.message, "error");
  } finally {
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="ph-fill ph-upload"></i> Upload Gambar';
    }
  }
}

async function removeGalleryItem(id, index) {
  if (!confirm("Hapus foto ini?")) return;

  try {
    await apiDelete(`/api/gallery/${id}`);
    _gallery.splice(index, 1);
    renderGallery();
    showToast("Foto berhasil dihapus!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function updateGalleryCaption(id, index) {
  const caption = document.getElementById(`gal-caption-${index}`)?.value || "";

  try {
    const res = await fetch(`/api/gallery/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ caption }),
    });

    if (!res.ok) throw new Error("Gagal update keterangan");

    _gallery[index].caption = caption;
    showToast("Keterangan berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Dummy saveGallery (tidak diperlukan karena upload langsung)
function saveGallery() {
  showToast("Gunakan tombol Upload untuk menambah gambar baru");
}

// ===========================
// ===== TESTIMONIALS =====
// ===========================
let _testimonials = [];

function loadTestimonials(testimonials) {
  _testimonials = testimonials.map(t => ({
    text: t.text || "",
    name: t.author_name || t.name || "",
    role: t.author_role || t.role || "",
    stars: t.stars || 5,
  }));
  renderTestimonials();
}

function renderTestimonials() {
  const container = document.getElementById("testimonials-list");
  container.innerHTML = "";
  _testimonials.forEach((t, i) => {
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
  btns.forEach((btn, i) => btn.classList.toggle("active", i < stars));
}

function addTestimonial() {
  _testimonials.push({ text: '"Testimoni baru..."', name: "Nama", role: "Peran", stars: 5 });
  renderTestimonials();
}

function removeTestimonial(index) {
  _testimonials.splice(index, 1);
  renderTestimonials();
}

async function saveTestimonials() {
  _testimonials.forEach((t, i) => {
    t.text = document.getElementById(`test-text-${i}`)?.value || t.text;
    t.name = document.getElementById(`test-name-${i}`)?.value || t.name;
    t.role = document.getElementById(`test-role-${i}`)?.value || t.role;
    t.stars = parseInt(document.getElementById(`test-stars-${i}`)?.value) || 5;
  });

  try {
    await apiPut("/api/content/testimonials", _testimonials.map(t => ({
      text: t.text,
      name: t.name,
      role: t.role,
      stars: t.stars,
    })));
    showToast("Testimoni berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== FOOTER =====
// ===========================
function loadFooter(d) {
  document.getElementById("footer-name").value = d.name || "";
  document.getElementById("footer-tagline").value = d.tagline || "";
  document.getElementById("footer-copy").value = d.copy || "";
}

async function saveFooter() {
  try {
    await apiPut("/api/content/footer", {
      name: document.getElementById("footer-name").value,
      tagline: document.getElementById("footer-tagline").value,
      copy: document.getElementById("footer-copy").value,
    });
    showToast("Footer berhasil disimpan!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===========================
// ===== CHANGE PASSWORD =====
// ===========================
async function changePassword() {
  const oldPw = document.getElementById("old-password").value;
  const newPw = document.getElementById("new-password").value;
  const confirmPw = document.getElementById("confirm-password").value;
  const msgEl = document.getElementById("pw-msg");

  if (!oldPw || !newPw || !confirmPw) {
    msgEl.textContent = "Semua field wajib diisi.";
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

  try {
    await apiPost("/api/auth/change-password", { oldPassword: oldPw, newPassword: newPw });
    msgEl.textContent = "Password berhasil diubah!";
    msgEl.className = "pw-msg success";
    document.getElementById("old-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
    showToast("Password berhasil diubah!");
  } catch (err) {
    msgEl.textContent = err.message;
    msgEl.className = "pw-msg error";
  }
}

// ===========================
// ===== EVENTS / PROGRAM LAIN =====
// ===========================
let _events = [];

async function loadEvents() {
  try {
    const data = await apiGet("/api/events");
    _events = data || [];
    renderEventsAdmin();
  } catch (err) {
    showToast("Gagal memuat events: " + err.message, "error");
  }
}

function renderEventsAdmin() {
  const container = document.getElementById("events-admin-list");
  if (!container) return;

  if (_events.length === 0) {
    container.innerHTML = `<p style="color:#8787a3;font-size:0.85rem;padding:1rem 0">Belum ada acara. Buat acara baru di atas.</p>`;
    return;
  }

  container.innerHTML = _events.map((event, i) => {
    const photos = event.event_photos || [];
    const dateStr = event.event_date
      ? new Date(event.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "Tanggal tidak diset";

    return `
      <div class="list-item" id="event-item-${event.id}">
        <div class="list-item-header">
          <div>
            <span class="list-item-title">${escHtml(event.title)}</span>
            ${event.category ? `<span style="margin-left:0.5rem;font-size:0.72rem;color:#a78bfa;background:rgba(124,58,237,0.15);padding:0.15rem 0.5rem;border-radius:10px">${escHtml(event.category)}</span>` : ""}
            <br><span style="font-size:0.72rem;color:#8787a3">${dateStr} • ${photos.length} foto • ${event.is_published ? "✅ Ditampilkan" : "🔒 Disembunyikan"}</span>
          </div>
          <button class="btn-danger" onclick="deleteEvent('${event.id}')">
            <i class="ph-fill ph-trash"></i> Hapus
          </button>
        </div>

        <!-- Edit form -->
        <div class="list-item-grid">
          <div class="form-group">
            <label>Nama Acara</label>
            <input type="text" id="ev-title-${event.id}" value="${escHtml(event.title)}">
          </div>
          <div class="form-group">
            <label>Kategori</label>
            <input type="text" id="ev-cat-${event.id}" value="${escHtml(event.category || "")}">
          </div>
          <div class="form-group">
            <label>Tanggal</label>
            <input type="date" id="ev-date-${event.id}" value="${event.event_date || ""}">
          </div>
          <div class="form-group" style="display:flex;align-items:center;gap:0.5rem;padding-top:1.5rem">
            <input type="checkbox" id="ev-pub-${event.id}" ${event.is_published ? "checked" : ""} style="width:auto">
            <label for="ev-pub-${event.id}" style="margin:0">Tampilkan</label>
          </div>
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea id="ev-desc-${event.id}" rows="2">${escHtml(event.description || "")}</textarea>
        </div>
        <button class="btn-secondary" style="align-self:flex-start" onclick="updateEvent('${event.id}')">
          <i class="ph-fill ph-floppy-disk"></i> Simpan Perubahan
        </button>

        <!-- Upload foto -->
        <div class="sub-title" style="margin-top:0.5rem">Foto Acara (${photos.length})</div>
        <div class="upload-area" style="padding:1rem" onclick="document.getElementById('ev-file-${event.id}').click()">
          <i class="ph ph-upload-simple" style="font-size:1.5rem"></i>
          <p style="font-size:0.82rem">Klik untuk upload foto</p>
        </div>
        <input type="file" id="ev-file-${event.id}" accept="image/*" multiple style="display:none"
          onchange="uploadEventPhotos('${event.id}', this)">
        <div class="form-group">
          <label>Keterangan foto (opsional)</label>
          <input type="text" id="ev-photo-caption-${event.id}" placeholder="Keterangan untuk foto yang diupload...">
        </div>

        <!-- Daftar foto -->
        <div id="ev-photos-${event.id}" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-top:0.5rem">
          ${photos.map(p => `
            <div style="position:relative;border-radius:10px;overflow:hidden;aspect-ratio:4/3;background:rgba(255,255,255,0.04)">
              <img src="${escHtml(p.public_url)}" style="width:100%;height:100%;object-fit:cover" alt="">
              <button onclick="deleteEventPhoto('${p.id}', '${event.id}')"
                style="position:absolute;top:0.3rem;right:0.3rem;background:rgba(239,68,68,0.8);border:none;color:white;border-radius:6px;padding:0.2rem 0.4rem;font-size:0.7rem;cursor:pointer">
                <i class="ph-fill ph-trash"></i>
              </button>
              ${p.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.6);color:white;font-size:0.65rem;padding:0.3rem 0.4rem">${escHtml(p.caption)}</div>` : ""}
            </div>`).join("")}
        </div>
      </div>`;
  }).join("");
}

async function createEvent() {
  const title = document.getElementById("new-event-title")?.value?.trim();
  if (!title) {
    showToast("Nama acara wajib diisi", "error");
    return;
  }

  try {
    const data = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        title,
        description: document.getElementById("new-event-desc")?.value || "",
        event_date: document.getElementById("new-event-date")?.value || null,
        category: document.getElementById("new-event-category")?.value || "",
        is_published: document.getElementById("new-event-published")?.checked !== false,
      }),
    }).then(r => r.json());

    if (data.error) throw new Error(data.error);

    // Reset form
    document.getElementById("new-event-title").value = "";
    document.getElementById("new-event-desc").value = "";
    document.getElementById("new-event-date").value = "";
    document.getElementById("new-event-category").value = "";

    // Reload events
    await loadEvents();
    showToast("Acara berhasil dibuat!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function updateEvent(eventId) {
  try {
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        title: document.getElementById(`ev-title-${eventId}`)?.value,
        description: document.getElementById(`ev-desc-${eventId}`)?.value,
        event_date: document.getElementById(`ev-date-${eventId}`)?.value || null,
        category: document.getElementById(`ev-cat-${eventId}`)?.value,
        is_published: document.getElementById(`ev-pub-${eventId}`)?.checked,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await loadEvents();
    showToast("Acara berhasil diperbarui!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteEvent(eventId) {
  if (!confirm("Hapus acara ini beserta semua fotonya?")) return;
  try {
    const res = await fetch(`/api/events/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await loadEvents();
    showToast("Acara berhasil dihapus!");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function uploadEventPhotos(eventId, input) {
  const files = Array.from(input.files);
  if (!files.length) return;

  const caption = document.getElementById(`ev-photo-caption-${eventId}`)?.value || "";

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);

    try {
      const res = await fetch(`/api/events/photos?event_id=${eventId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Foto berhasil diupload!");
    } catch (err) {
      showToast("Gagal upload: " + err.message, "error");
    }
  }

  input.value = "";
  await loadEvents();
}

async function deleteEventPhoto(photoId, eventId) {
  if (!confirm("Hapus foto ini?")) return;
  try {
    const res = await fetch(`/api/events/photos?photo_id=${photoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    await loadEvents();
    showToast("Foto berhasil dihapus!");
  } catch (err) {
    showToast(err.message, "error");
  }
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
