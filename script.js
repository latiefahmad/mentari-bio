/**
 * =============================================
 * MAIN SCRIPT – Rumah Belajar Mentari
 * Memuat konten dinamis dari localStorage (diatur via admin panel)
 * =============================================
 */

// ===== DATA HELPERS =====
const DEFAULT_DATA = {
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
    { level: "SD", title: "Sekolah Dasar", subtitle: "Kelas 1 – 6", subjects: ["Matematika", "Bahasa Indonesia", "IPA & IPS", "Bahasa Inggris"], featured: false },
    { level: "SMP", title: "Sekolah Menengah Pertama", subtitle: "Kelas 7 – 9", subjects: ["Matematika", "IPA Terpadu", "Bahasa Inggris", "Persiapan UN"], featured: true },
    { level: "SMA", title: "Sekolah Menengah Atas", subtitle: "Kelas 10 – 12", subjects: ["Matematika & Fisika", "Kimia & Biologi", "Bahasa Inggris", "Persiapan SNBT"], featured: false },
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
    { text: '"Nilai matematika anak saya naik drastis setelah belajar di Rumah Belajar Mentari. Pengajarnya sabar dan metodenya mudah dipahami."', name: "Ibu Ani", role: "Orang tua siswa SD", stars: 5 },
    { text: '"Belajar di sini menyenangkan! Saya jadi lebih percaya diri menghadapi ujian. Terima kasih Rumah Belajar Mentari!"', name: "Budi", role: "Siswa SMP Kelas 9", stars: 5 },
  ],
  footer: {
    name: "Rumah Belajar Mentari",
    tagline: '"Mari membuat belajar lebih menyenangkan"',
    copy: "Made with 💖 Rumah Belajar Mentari",
  },
};

function getData(key) {
  try {
    const raw = localStorage.getItem("mentari_" + key);
    return raw ? JSON.parse(raw) : DEFAULT_DATA[key];
  } catch {
    return DEFAULT_DATA[key];
  }
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== RENDER DYNAMIC CONTENT =====
function renderAll() {
  renderHero();
  renderAbout();
  renderPrograms();
  renderSchedule();
  renderLocation();
  renderLinks();
  renderGallery();
  renderTestimonials();
  renderFooter();
}

// --- Hero ---
function renderHero() {
  const d = getData("hero");
  const nameEl = document.querySelector(".hero-text h1");
  if (nameEl) {
    nameEl.innerHTML = `${escHtml(d.name.split(" ").slice(0, -1).join(" "))} <span class="highlight">${escHtml(d.name.split(" ").slice(-1)[0])}</span>`;
  }
  const taglineEl = document.querySelector(".hero-tagline");
  if (taglineEl) taglineEl.textContent = d.tagline;

  const tagEl = document.querySelector(".hero-tag span");
  if (tagEl) tagEl.textContent = d.tag;

  const nums = document.querySelectorAll(".stat-number");
  const labels = document.querySelectorAll(".stat-label");
  if (nums[0]) nums[0].textContent = d.statStudents;
  if (nums[1]) nums[1].textContent = d.statYears;
  if (nums[2]) nums[2].textContent = d.statTeachers;
}

// --- About ---
function renderAbout() {
  const d = getData("about");
  const descEl = document.querySelector(".about-text");
  if (descEl) descEl.textContent = d.desc;

  const featuresEl = document.querySelector(".about-features");
  if (featuresEl && d.features) {
    featuresEl.innerHTML = d.features.map(f => `
      <div class="feature-card">
        <div class="feature-icon"><i class="ph-fill ${escHtml(f.icon)}"></i></div>
        <h3>${escHtml(f.title)}</h3>
        <p>${escHtml(f.desc)}</p>
      </div>`).join("");
  }
}

// --- Programs ---
function renderPrograms() {
  const programs = getData("programs");
  const grid = document.querySelector(".programs-grid");
  if (!grid) return;
  grid.innerHTML = programs.map(p => `
    <div class="program-card${p.featured ? " program-featured" : ""}">
      ${p.featured ? '<div class="program-badge">Populer</div>' : ""}
      <div class="program-level">${escHtml(p.level)}</div>
      <h3>${escHtml(p.title)}</h3>
      <p>${escHtml(p.subtitle)}</p>
      <ul class="program-subjects">
        ${(p.subjects || []).map(s => `<li><i class="ph-fill ph-check-circle"></i> ${escHtml(s)}</li>`).join("")}
      </ul>
    </div>`).join("");
}

// --- Schedule ---
function renderSchedule() {
  const schedule = getData("schedule");
  const grid = document.querySelector(".schedule-grid");
  if (!grid) return;
  grid.innerHTML = schedule.map(s => `
    <div class="schedule-card">
      <div class="schedule-day">${escHtml(s.day)}</div>
      <div class="schedule-time">
        <i class="ph-fill ph-clock"></i>
        <span>${escHtml(s.time)}</span>
      </div>
      <div class="schedule-desc">${escHtml(s.desc)}</div>
    </div>`).join("");
}

// --- Location ---
function renderLocation() {
  const d = getData("location");
  const nameEl = document.querySelector(".location-info h3");
  const addrEl = document.querySelector(".location-info p:first-of-type");
  const noteEl = document.querySelector(".location-note");
  if (nameEl) nameEl.textContent = d.name;
  if (addrEl) addrEl.textContent = d.address;
  if (noteEl) noteEl.textContent = d.note;
}

// --- Links ---
function renderLinks() {
  const d = getData("links");
  const waLink = document.querySelector(".link-whatsapp");
  const igLink = document.querySelector(".link-instagram");
  const waSubEl = document.querySelector(".link-whatsapp .link-sub");
  const igSubEl = document.querySelector(".link-instagram .link-sub");

  if (waLink) waLink.href = `https://wa.me/${d.wa}`;
  if (igLink) igLink.href = `https://instagram.com/${d.ig}`;
  if (waSubEl) waSubEl.textContent = "+" + d.wa;
  if (igSubEl) igSubEl.textContent = "@" + d.ig;

  // Footer social links
  const footerWa = document.querySelector(".footer .social-btn:first-child");
  const footerIg = document.querySelector(".footer .social-btn:last-child");
  if (footerWa) footerWa.href = `https://wa.me/${d.wa}`;
  if (footerIg) footerIg.href = `https://instagram.com/${d.ig}`;
}

// --- Gallery ---
function renderGallery() {
  const gallery = getData("gallery");
  const grid = document.getElementById("gallery-grid");
  const section = document.getElementById("gallery-section");
  if (!grid) return;

  const validItems = gallery.filter(g => g.url && g.url.trim());

  // Hide section if no images
  if (validItems.length === 0) {
    grid.innerHTML = `<div class="gallery-empty"><i class="ph ph-images"></i>Belum ada foto galeri</div>`;
    return;
  }

  grid.innerHTML = validItems.map((g, i) => `
    <div class="gallery-item" onclick="openLightbox('${escHtml(g.url)}', '${escHtml(g.caption || "")}')">
      <img src="${escHtml(g.url)}" alt="${escHtml(g.caption || "Galeri Belajar")}" loading="lazy" onerror="this.closest('.gallery-item').style.display='none'">
      ${g.caption ? `<div class="gallery-item-caption">${escHtml(g.caption)}</div>` : ""}
    </div>`).join("");
}

// --- Testimonials ---
function renderTestimonials() {
  const testimonials = getData("testimonials");
  const container = document.querySelector(".testimonials");
  if (!container) return;
  container.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">
        ${Array.from({ length: t.stars || 5 }, () => '<i class="ph-fill ph-star"></i>').join("")}
      </div>
      <p class="testimonial-text">${escHtml(t.text)}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${escHtml((t.name || "?")[0].toUpperCase())}</div>
        <div>
          <p class="author-name">${escHtml(t.name)}</p>
          <p class="author-role">${escHtml(t.role)}</p>
        </div>
      </div>
    </div>`).join("");
}

// --- Footer ---
function renderFooter() {
  const d = getData("footer");
  const nameEl = document.querySelector(".footer-name");
  const taglineEl = document.querySelector(".footer-tagline");
  const copyEl = document.getElementById("footer-copy-text");
  if (nameEl) nameEl.textContent = d.name;
  if (taglineEl) taglineEl.textContent = d.tagline;
  if (copyEl) copyEl.innerHTML = `${escHtml(d.copy)} &copy; ${new Date().getFullYear()}`;
}

// ===== GALLERY LIGHTBOX =====
let lightbox = null;

function openLightbox(url, caption) {
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.innerHTML = `
      <button class="lightbox-close" onclick="closeLightbox()"><i class="ph-fill ph-x"></i></button>
      <img class="lightbox-img" src="" alt="">
      <p class="lightbox-caption"></p>`;
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.body.appendChild(lightbox);
  }
  lightbox.querySelector(".lightbox-img").src = url;
  lightbox.querySelector(".lightbox-caption").textContent = caption;
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (lightbox) {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// Close lightbox with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// ===== SCROLL REVEAL ANIMATION =====
const sections = document.querySelectorAll(".section");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px",
  }
);

sections.forEach((section) => {
  revealObserver.observe(section);
});

// ===== BACK TO TOP BUTTON =====
const backToTopBtn = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    backToTopBtn.classList.add("visible");
  } else {
    backToTopBtn.classList.remove("visible");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== DAFTAR BUTTON =====
const daftarBtn = document.getElementById("daftar-btn");
if (daftarBtn) {
  daftarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const d = getData("links");
    const msg = encodeURIComponent(d.waMsg || "Halo Rumah Belajar Mentari! Saya ingin mendaftar sebagai siswa baru. Mohon informasi lebih lanjut 🙏");
    window.open(`https://wa.me/${d.wa}?text=${msg}`, "_blank");
  });
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
  const toast = document.getElementById("toast");
  const div = document.createElement("div");
  div.classList.add("toast-container");
  div.textContent = message;
  toast.appendChild(div);

  setTimeout(() => {
    div.classList.add("toast-gone");
    div.addEventListener("animationend", () => div.remove());
  }, 2000);
}

// ===== INIT =====
renderAll();
