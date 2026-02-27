/**
 * Scroll Reveal Animation
 * Menampilkan section saat di-scroll ke dalam viewport
 */
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

/**
 * Hover icon sosmed: switch ph -> ph-fill
 */
document.querySelectorAll(".sosmed i").forEach((sosmed) => {
  sosmed.addEventListener("mouseenter", () => {
    sosmed.classList.remove("ph");
    sosmed.classList.add("ph-fill");
  });

  sosmed.addEventListener("mouseleave", () => {
    sosmed.classList.remove("ph-fill");
    sosmed.classList.add("ph");
  });
});

/**
 * Tombol Daftar Sekarang → redirect ke WhatsApp dengan pesan pendaftaran
 */
const daftarBtn = document.getElementById("daftar-btn");
if (daftarBtn) {
  daftarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      "Halo Rumah Belajar Mentari! Saya ingin mendaftar sebagai siswa baru. Mohon informasi lebih lanjut 🙏"
    );
    window.open(`https://wa.me/6285733408212?text=${msg}`, "_blank");
  });
}

/**
 * Back to Top Button
 * Muncul saat halaman di-scroll ke bawah, hilang saat sudah di atas
 */
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

/**
 * Toast notification helper
 */
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
