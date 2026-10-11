document.addEventListener('DOMContentLoaded', () => {
  const heroName = document.getElementById('heroName');
  const footerName = document.getElementById('footerName');
  if (heroName && config.doiName) heroName.textContent = config.doiName;
  if (footerName && config.doiName) footerName.textContent = config.doiName;
  if (config.doiName) document.title = `Untuk ${config.doiName}`;

  const letterContent = document.getElementById('letterContent');
  if (letterContent && config.letterText) letterContent.innerHTML = config.letterText;

  // Carousel
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const posts = config.igPosts || [];
  let currentIdx = 0;
  const slides = [];
  const dots = [];

  if (track && posts.length > 0) {
    posts.forEach((url, i) => {
      const match = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
      if (!match) return;
      const pid = match[2];

      const slide = document.createElement('div');
      slide.className = `carousel-slide ${i === 0 ? 'active' : ''}`;
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-label', `Post ${i + 1} dari ${posts.length}`);

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.instagram.com/p/${pid}/embed/`;
      iframe.loading = 'lazy';
      iframe.allowFullscreen = true;
      iframe.title = `Instagram post ${pid}`;

      slide.appendChild(iframe);
      track.appendChild(slide);
      slides.push(slide);

      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Pindah ke slide ${i + 1}`);
      if (i === 0) dot.className = 'active';
      dot.addEventListener('click', () => showSlide(i));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });
  }

  function showSlide(index) {
    if (!slides.length) return;
    slides[currentIdx].classList.remove('active');
    dots[currentIdx].classList.remove('active');
    currentIdx = (index + slides.length) % slides.length;
    slides[currentIdx].classList.add('active');
    dots[currentIdx].classList.add('active');
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIdx + 1));

  // Touch swipe
  let startX = 0;
  if (track) {
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) showSlide(currentIdx + (diff > 0 ? 1 : -1));
    }, { passive: true });
  }

  // Love meter
  const slider = document.getElementById('loveSlider');
  const meterVal = document.getElementById('meterValue');
  const meterFill = document.getElementById('meterFill');
  const meterMsg = document.getElementById('meterText');
  const btnMax = document.getElementById('btnMaxLove');

  const messages = [
    { threshold: 25, text: 'Masih awalan banget.' },
    { threshold: 50, text: 'Setengah jalan nih.' },
    { threshold: 75, text: 'Udah banyak banget.' },
    { threshold: 99, text: 'Hampir mentok, serius ini.' },
    { threshold: 100, text: 'Seratus persen. Beneran seratus.' }
  ];

  function setMeter(val) {
    const v = Math.max(0, Math.min(100, val));
    if (slider) slider.value = v;
    if (meterVal) meterVal.textContent = `${v} persen`;
    if (meterFill) meterFill.style.width = `${v}%`;
    const found = messages.find(m => v <= m.threshold);
    if (meterMsg && found) meterMsg.textContent = found.text;
    if (v === 100) triggerBurst();
  }

  if (slider) {
    slider.addEventListener('input', (e) => setMeter(parseInt(e.target.value, 10)));
  }

  if (btnMax) {
    btnMax.addEventListener('click', () => {
      let current = parseInt(slider.value, 10) || 0;
      const interval = setInterval(() => {
        current += 5;
        setMeter(current);
        if (current >= 100) clearInterval(interval);
      }, 25);
    });
  }

  // Letter unfold toggle
  const openLetterBtn = document.getElementById('openLetterBtn');
  let letterOpen = false;
  if (openLetterBtn && letterContent) {
    letterContent.style.display = 'none';
    openLetterBtn.addEventListener('click', () => {
      letterOpen = !letterOpen;
      letterContent.style.display = letterOpen ? 'block' : 'none';
      openLetterBtn.textContent = letterOpen ? 'Tutup surat' : 'Buka surat';
      if (letterOpen) triggerBurst();
    });
  }

  // Intro overlay: klik tombol = interaksi resmi browser, audio pasti jalan
  const introOverlay = document.getElementById('introOverlay');
  const introStart = document.getElementById('introStart');
  const bgAudio = document.getElementById('bgAudio');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const audioBars = document.getElementById('audioBars');
  let audioPlaying = false;

  if (bgAudio && config.bgMusic) {
    bgAudio.src = config.bgMusic;
    bgAudio.volume = 0.5;
  }

  function startPlayback() {
    if (!bgAudio) return;
    const startTime = config.musicStartTime || 0;
    bgAudio.currentTime = startTime;
    bgAudio.play().then(() => {
      audioPlaying = true;
      if (musicIcon) musicIcon.textContent = 'Jeda';
      if (audioBars) audioBars.classList.add('playing');
    }).catch(err => {
      console.log('Audio playback error:', err);
    });
    if (introOverlay) introOverlay.classList.add('hidden');
    triggerBurst();
  }

  if (introStart) {
    introStart.addEventListener('click', startPlayback);
  }

  if (musicToggle && bgAudio) {
    musicToggle.addEventListener('click', () => {
      if (audioPlaying) {
        bgAudio.pause();
        audioPlaying = false;
        if (musicIcon) musicIcon.textContent = 'Putar lagu';
        if (audioBars) audioBars.classList.remove('playing');
      } else {
        bgAudio.currentTime = config.musicStartTime || bgAudio.currentTime;
        bgAudio.play().then(() => {
          audioPlaying = true;
          if (musicIcon) musicIcon.textContent = 'Jeda';
          if (audioBars) audioBars.classList.add('playing');
        });
      }
    });
  }

  // Canvas ambient hearts (Identity motif)
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let hearts = [];
  let burstList = [];

  function syncCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  syncCanvas();
  window.addEventListener('resize', syncCanvas);

  function createHeart(x, y, burst = false) {
    return {
      x: x !== undefined ? x : Math.random() * canvas.width,
      y: y !== undefined ? y : canvas.height + 12,
      size: burst ? Math.random() * 16 + 8 : Math.random() * 10 + 6,
      vx: burst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 0.8,
      vy: burst ? -(Math.random() * 5 + 3) : -(Math.random() * 1.2 + 0.6),
      alpha: 1,
      decay: burst ? 0.015 : 0.003,
      burst
    };
  }

  function triggerBurst() {
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    for (let i = 0; i < 28; i++) {
      burstList.push(createHeart(cx, cy, true));
    }
  }

  function drawHeartPath(x, y, s, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    const topCurveHeight = s * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // Lengkungan kiri atas
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + topCurveHeight);
    // Sisi kiri turun ke lancip bawah
    ctx.bezierCurveTo(x - s / 2, y + (s + topCurveHeight) / 2, x, y + (s + topCurveHeight) / 1.4, x, y + s);
    // Sisi kanan naik dari lancip bawah
    ctx.bezierCurveTo(x, y + (s + topCurveHeight) / 1.4, x + s / 2, y + (s + topCurveHeight) / 2, x + s / 2, y + topCurveHeight);
    // Lengkungan kanan atas
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function renderLoop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < (audioPlaying ? 0.25 : 0.08)) {
      hearts.push(createHeart());
    }

    hearts = hearts.filter(h => {
      h.y += h.vy;
      h.x += h.vx;
      h.alpha -= h.decay;
      drawHeartPath(h.x, h.y, h.size, h.alpha);
      return h.y > -20 && h.alpha > 0;
    });

    burstList = burstList.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.12; // gravity
      b.alpha -= b.decay;
      drawHeartPath(b.x, b.y, b.size, b.alpha);
      return b.alpha > 0;
    });

    requestAnimationFrame(renderLoop);
  }

  if (canvas) renderLoop();
});
