/**
 * =============================================
 * MAIN SCRIPT – Rumah Belajar Mentari
 * Memuat konten dinamis dari API (/api/content dan /api/gallery)
 * =============================================
 */

// ===== DATA DEFAULT (fallback jika API gagal) =====
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
    desc: "Rumah Belajar Mentari adalah lembaga bimbingan belajar yang berdedikasi untuk membantu siswa meraih prestasi terbaik mereka.",
    features: [
      { icon: "ph-chalkboard-teacher", title: "Pengajar Berpengalaman", desc: "Tenaga pengajar profesional dan berpengalaman di bidangnya" },
      { icon: "ph-smiley", title: "Belajar Menyenangkan", desc: "Metode pembelajaran interaktif yang membuat siswa semangat belajar" },
      { icon: "ph-chart-line-up", title: "Hasil Terbukti", desc: "Ratusan siswa telah meningkatkan prestasi akademik mereka" },
    ],
  },
  programs: [
    { level: "SD", title: "Sekolah Dasar", subtitle: "Kelas 1 – 6", subjects: ["Matematika", "Bahasa Indonesia", "IPA & IPS", "Bahasa Inggris"], is_featured: false },
    { level: "SMP", title: "Sekolah Menengah Pertama", subtitle: "Kelas 7 – 9", subjects: ["Matematika", "IPA Terpadu", "Bahasa Inggris", "Persiapan UN"], is_featured: true },
    { level: "SMA", title: "Sekolah Menengah Atas", subtitle: "Kelas 10 – 12", subjects: ["Matematika & Fisika", "Kimia & Biologi", "Bahasa Inggris", "Persiapan SNBT"], is_featured: false },
  ],
  schedules: [
    { day: "Senin – Jumat", time: "14.00 – 17.00 WIB", description: "Sesi Sore (Reguler)" },
    { day: "Sabtu", time: "08.00 – 12.00 WIB", description: "Sesi Pagi (Weekend)" },
    { day: "Fleksibel", time: "Sesuai Kesepakatan", description: "Privat / Online" },
  ],
  location: { name: "Rumah Belajar Mentari", address: "Jl. Contoh No. 123, Kota Anda", note: "Hubungi kami untuk informasi lokasi lengkap" },
  links: { wa: "6285733408212", ig: "rb.mentari", waMsg: "Halo Rumah Belajar Mentari! Saya ingin mendaftar sebagai siswa baru. Mohon informasi lebih lanjut 🙏" },
  testimonials: [
    { text: '"Nilai matematika anak saya naik drastis setelah belajar di Rumah Belajar Mentari."', author_name: "Ibu Ani", author_role: "Orang tua siswa SD", stars: 5 },
    { text: '"Belajar di sini menyenangkan! Saya jadi lebih percaya diri menghadapi ujian."', author_name: "Budi", author_role: "Siswa SMP Kelas 9", stars: 5 },
  ],
  footer: { name: "Rumah Belajar Mentari", tagline: '"Mari membuat belajar lebih menyenangkan"', copy: "Made with 💖 Rumah Belajar Mentari" },
};

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== FETCH DATA FROM API =====
async function fetchAllData() {
  try {
    const [contentRes, galleryRes] = await Promise.all([
      fetch("/api/content"),
      fetch("/api/gallery"),
    ]);

    const content = contentRes.ok ? await contentRes.json() : {};
    const gallery = galleryRes.ok ? await galleryRes.json() : [];

    return {
      hero: content.hero || DEFAULT_DATA.hero,
      about: content.about || DEFAULT_DATA.about,
      programs: content.programs?.length ? content.programs : DEFAULT_DATA.programs,
      schedules: content.schedules?.length ? content.schedules : DEFAULT_DATA.schedules,
      location: content.location || DEFAULT_DATA.location,
      links: content.links || DEFAULT_DATA.links,
      testimonials: content.testimonials?.length ? content.testimonials : DEFAULT_DATA.testimonials,
      footer: content.footer || DEFAULT_DATA.footer,
      gallery: gallery || [],
    };
  } catch (err) {
    console.warn("API tidak tersedia, menggunakan data default:", err);
    return { ...DEFAULT_DATA, gallery: [] };
  }
}

// ===== RENDER FUNCTIONS =====
function renderHero(d) {
  const nameEl = document.querySelector(".hero-text h1");
  if (nameEl) {
    const words = (d.name || "").split(" ");
    const last = words.pop();
    nameEl.innerHTML = `${escHtml(words.join(" "))} <span class="highlight">${escHtml(last)}</span>`;
  }
  const taglineEl = document.querySelector(".hero-tagline");
  if (taglineEl) taglineEl.textContent = d.tagline || "";

  const tagEl = document.querySelector(".hero-tag span");
  if (tagEl) tagEl.textContent = d.tag || "";

  const nums = document.querySelectorAll(".stat-number");
  const labels = document.querySelectorAll(".stat-label");
  if (nums[0]) nums[0].textContent = d.statStudents || "";
  if (nums[1]) nums[1].textContent = d.statYears || "";
  if (nums[2]) nums[2].textContent = d.statTeachers || "";
}

function renderAbout(d) {
  const descEl = document.querySelector(".about-text");
  if (descEl) descEl.textContent = d.desc || "";

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

function renderPrograms(programs) {
  const grid = document.querySelector(".programs-grid");
  if (!grid) return;
  grid.innerHTML = programs.map(p => `
    <div class="program-card${p.is_featured ? " program-featured" : ""}">
      ${p.is_featured ? '<div class="program-badge">Populer</div>' : ""}
      <div class="program-level">${escHtml(p.level)}</div>
      <h3>${escHtml(p.title)}</h3>
      <p>${escHtml(p.subtitle)}</p>
      <ul class="program-subjects">
        ${(p.subjects || []).map(s => `<li><i class="ph-fill ph-check-circle"></i> ${escHtml(s)}</li>`).join("")}
      </ul>
    </div>`).join("");
}

function renderSchedule(schedules) {
  const grid = document.querySelector(".schedule-grid");
  if (!grid) return;
  grid.innerHTML = schedules.map(s => `
    <div class="schedule-card">
      <div class="schedule-day">${escHtml(s.day)}</div>
      <div class="schedule-time">
        <i class="ph-fill ph-clock"></i>
        <span>${escHtml(s.time)}</span>
      </div>
      <div class="schedule-desc">${escHtml(s.description || s.desc || "")}</div>
    </div>`).join("");
}

function renderLocation(d) {
  const nameEl = document.querySelector(".location-info h3");
  const addrEl = document.querySelector(".location-info p:first-of-type");
  const noteEl = document.querySelector(".location-note");
  if (nameEl) nameEl.textContent = d.name || "";
  if (addrEl) addrEl.textContent = d.address || "";
  if (noteEl) noteEl.textContent = d.note || "";
}

function renderLinks(d) {
  const waLink = document.querySelector(".link-whatsapp");
  const igLink = document.querySelector(".link-instagram");
  const waSubEl = document.querySelector(".link-whatsapp .link-sub");
  const igSubEl = document.querySelector(".link-instagram .link-sub");

  if (waLink) waLink.href = `https://wa.me/${d.wa}`;
  if (igLink) igLink.href = `https://instagram.com/${d.ig}`;
  if (waSubEl) waSubEl.textContent = "+" + d.wa;
  if (igSubEl) igSubEl.textContent = "@" + d.ig;

  const footerWa = document.querySelector(".footer .social-btn:first-child");
  const footerIg = document.querySelector(".footer .social-btn:last-child");
  if (footerWa) footerWa.href = `https://wa.me/${d.wa}`;
  if (footerIg) footerIg.href = `https://instagram.com/${d.ig}`;

  // Simpan waMsg untuk tombol daftar
  window._waData = d;
}

// ===== GALLERY SLIDESHOW =====
let _gallerySlideIndex = 0;
let _gallerySlideTimer = null;
const GALLERY_ITEMS_PER_SLIDE = 2;
const GALLERY_SLIDE_INTERVAL = 5000; // 5 detik

function renderGallery(gallery) {
  const track = document.getElementById("gallery-track");
  const dotsEl = document.getElementById("gallery-dots");
  if (!track) return;

  // Stop existing timer
  if (_gallerySlideTimer) {
    clearInterval(_gallerySlideTimer);
    _gallerySlideTimer = null;
  }

  const validItems = (gallery || []).filter(g => g.public_url);

  if (validItems.length === 0) {
    track.innerHTML = `<div class="gallery-empty" style="min-width:100%;padding:2rem;text-align:center;color:#8787a3;border:1px dashed rgba(255,255,255,0.1);border-radius:16px"><i class="ph ph-images" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.4"></i>Belum ada foto galeri</div>`;
    if (dotsEl) dotsEl.innerHTML = "";
    return;
  }

  // Bagi gambar menjadi slide, masing-masing 2 gambar
  const slides = [];
  for (let i = 0; i < validItems.length; i += GALLERY_ITEMS_PER_SLIDE) {
    slides.push(validItems.slice(i, i + GALLERY_ITEMS_PER_SLIDE));
  }

  // Render slides
  track.innerHTML = slides.map((slideItems) => `
    <div class="gallery-slide${slideItems.length === 1 ? " single" : ""}">
      ${slideItems.map(g => `
        <div class="gallery-item" onclick="openLightbox('${escHtml(g.public_url)}', '${escHtml(g.caption || "")}')">
          <img src="${escHtml(g.public_url)}" alt="${escHtml(g.caption || "Galeri Belajar")}" loading="lazy" onerror="this.closest('.gallery-item').style.display='none'">
          ${g.caption ? `<div class="gallery-item-caption">${escHtml(g.caption)}</div>` : ""}
        </div>`).join("")}
    </div>`).join("");

  // Render dots
  if (dotsEl) {
    dotsEl.innerHTML = slides.map((_, i) =>
      `<button class="gallery-dot${i === 0 ? " active" : ""}" onclick="goToSlide(${i})" aria-label="Slide ${i + 1}"></button>`
    ).join("");
  }

  // Reset ke slide pertama
  _gallerySlideIndex = 0;
  goToSlide(0);

  // Mulai auto-slide jika lebih dari 1 slide
  if (slides.length > 1) {
    _gallerySlideTimer = setInterval(() => {
      _gallerySlideIndex = (_gallerySlideIndex + 1) % slides.length;
      goToSlide(_gallerySlideIndex);
    }, GALLERY_SLIDE_INTERVAL);
  }
}

function goToSlide(index) {
  const track = document.getElementById("gallery-track");
  const dots = document.querySelectorAll(".gallery-dot");
  if (!track) return;

  _gallerySlideIndex = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

// ===== TESTIMONIAL SLIDESHOW =====
let _testimonialSlideIndex = 0;
let _testimonialSlideTimer = null;
const TESTIMONIAL_SLIDE_INTERVAL = 5000;

function renderTestimonials(testimonials) {
  const track = document.getElementById("testimonial-track");
  const dotsEl = document.getElementById("testimonial-dots");
  if (!track) return;

  if (_testimonialSlideTimer) {
    clearInterval(_testimonialSlideTimer);
    _testimonialSlideTimer = null;
  }

  if (!testimonials || testimonials.length === 0) {
    track.innerHTML = "";
    if (dotsEl) dotsEl.innerHTML = "";
    return;
  }

  // Setiap testimoni = 1 slide
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">
        ${Array.from({ length: t.stars || 5 }, () => '<i class="ph-fill ph-star"></i>').join("")}
      </div>
      <p class="testimonial-text">${escHtml(t.text)}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${escHtml(((t.author_name || t.name || "?")[0]).toUpperCase())}</div>
        <div>
          <p class="author-name">${escHtml(t.author_name || t.name || "")}</p>
          <p class="author-role">${escHtml(t.author_role || t.role || "")}</p>
        </div>
      </div>
    </div>`).join("");

  // Render dots
  if (dotsEl) {
    dotsEl.innerHTML = testimonials.map((_, i) =>
      `<button class="testimonial-dot${i === 0 ? " active" : ""}" onclick="goToTestimonial(${i})" aria-label="Testimoni ${i + 1}"></button>`
    ).join("");
  }

  _testimonialSlideIndex = 0;
  goToTestimonial(0);

  if (testimonials.length > 1) {
    _testimonialSlideTimer = setInterval(() => {
      _testimonialSlideIndex = (_testimonialSlideIndex + 1) % testimonials.length;
      goToTestimonial(_testimonialSlideIndex);
    }, TESTIMONIAL_SLIDE_INTERVAL);
  }
}

function goToTestimonial(index) {
  const track = document.getElementById("testimonial-track");
  const dots = document.querySelectorAll(".testimonial-dot");
  if (!track) return;

  _testimonialSlideIndex = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function renderFooter(d) {
  const nameEl = document.querySelector(".footer-name");
  const taglineEl = document.querySelector(".footer-tagline");
  const copyEl = document.getElementById("footer-copy-text");
  if (nameEl) nameEl.textContent = d.name || "";
  if (taglineEl) taglineEl.textContent = d.tagline || "";
  if (copyEl) copyEl.innerHTML = `${escHtml(d.copy || "")} &copy; ${new Date().getFullYear()}`;
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
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

sections.forEach((section) => revealObserver.observe(section));

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
    const d = window._waData || { wa: "6285733408212", waMsg: "Halo Rumah Belajar Mentari! Saya ingin mendaftar sebagai siswa baru. Mohon informasi lebih lanjut 🙏" };
    const msg = encodeURIComponent(d.waMsg);
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
fetchAllData().then((data) => {
  renderHero(data.hero);
  renderAbout(data.about);
  renderPrograms(data.programs);
  renderSchedule(data.schedules);
  renderLocation(data.location);
  renderLinks(data.links);
  renderGallery(data.gallery);
  renderTestimonials(data.testimonials);
  renderFooter(data.footer);
});
