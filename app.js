/**
 * Champagne Luxury Wedding Invitation Engine
 * Interactive Anti-Gravity Physics Background, Splash Transition, & Comments Board
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // SPLASH SCREEN & ENTRY LOGIC
  // ==========================================
  const splashScreen = document.getElementById('splashScreen');
  const enterBtn = document.getElementById('enterBtn');
  const mainContent = document.getElementById('mainContent');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const bgMusic = document.getElementById('bgMusic');
  
  const iconPlay = musicToggleBtn.querySelector('.icon-play');
  const iconPause = musicToggleBtn.querySelector('.icon-pause');
  const musicText = musicToggleBtn.querySelector('.music-text');

  enterBtn.addEventListener('click', () => {
    // 1. Fade out and dismiss splash overlay
    splashScreen.classList.add('dismissed');
    
    // 2. Reveal main invitation content with scale/blur transition
    mainContent.classList.remove('blurred');
    mainContent.classList.add('visible-active');
    
    // 3. Unhide floating audio toggle button
    musicToggleBtn.classList.remove('hidden');

    // 4. Autoplay background audio stream (allowed after click interaction)
    bgMusic.play()
      .then(() => {
        musicToggleBtn.classList.add('playing');
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
        musicText.textContent = 'PAUSE MUSIC';
      })
      .catch(err => {
        console.warn("Audio autoplay was blocked or failed:", err);
      });

    // 5. Trigger spring-physics entrance animation using GSAP (Framer Motion feel)
    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline();
      
      tl.from(".hero-greeting", {
        duration: 1,
        opacity: 0,
        y: 20,
        ease: "back.out(1.7)"
      });
      
      tl.from(".groom-name, .ampersand, .bride-name", {
        duration: 1.2,
        opacity: 0,
        y: 50,
        stagger: 0.15,
        ease: "back.out(1.8)"
      }, "-=0.6");
      
      tl.from(".gold-divider", {
        duration: 0.8,
        scaleX: 0,
        opacity: 0,
        ease: "power2.out"
      }, "-=0.8");
      
      tl.from(".hero-subtitle, .hero-date", {
        duration: 1,
        opacity: 0,
        y: 15,
        stagger: 0.15,
        ease: "power2.out"
      }, "-=0.6");

      tl.from(".countdown-container", {
        duration: 1.2,
        opacity: 0,
        scale: 0.9,
        y: 20,
        ease: "back.out(1.5)"
      }, "-=0.6");

      tl.from(".scroll-indicator", {
        duration: 1,
        opacity: 0,
        y: 10,
        ease: "power2.out"
      }, "-=0.6");
    }
  });

  // ==========================================
  // AUDIO CONTROLLER LOGIC (FLOATING PILL)
  // ==========================================
  musicToggleBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          musicToggleBtn.classList.add('playing');
          iconPlay.classList.add('hidden');
          iconPause.classList.remove('hidden');
          musicText.textContent = 'PAUSE MUSIC';
        })
        .catch(err => {
          console.warn("Audio playback was blocked:", err);
        });
    } else {
      bgMusic.pause();
      musicToggleBtn.classList.remove('playing');
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
      musicText.textContent = 'PLAY MUSIC';
    }
  });

  // ==========================================
  // ANTI-GRAVITY CANVAS PHYSICS
  // ==========================================
  const canvas = document.getElementById('antiGravityCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 55;
  const mouse = { x: null, y: null, active: false };
  const repulsionRadius = 140;

  // Track cursor position globally
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Track touch position for mobile responsiveness
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
  });

  // Window resizing handler
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles.forEach(p => p.createGradient());
  });

  // Gold flake particle class definition
  class GoldFlake {
    constructor() {
      this.reset(true);
    }

    reset(initialSetup = false) {
      this.size = Math.random() * 10 + 6; // Flake size (6px to 16px)
      this.x = Math.random() * width;
      this.y = initialSetup ? Math.random() * height : height + this.size + 10;
      
      this.vy = -(Math.random() * 0.8 + 0.4); // Rise speed
      this.vx = (Math.random() * 0.4 - 0.2); // Base drift speed
      this.swaySpeed = Math.random() * 0.01 + 0.005;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() * 0.02 - 0.01); // Random spin
      
      this.repelX = 0;
      this.repelY = 0;

      // Custom Irregular Polygon Definition
      this.numPoints = 5 + Math.floor(Math.random() * 3); // 5 to 7 vertices
      this.points = [];
      for (let i = 0; i < this.numPoints; i++) {
        const angle = (i / this.numPoints) * Math.PI * 2;
        const vertexDist = this.size * (0.5 + Math.random() * 0.7);
        this.points.push({
          x: Math.cos(angle) * vertexDist,
          y: Math.sin(angle) * vertexDist
        });
      }

      this.createGradient();
    }

    // Creates shiny metallic gradient
    createGradient() {
      this.gradient = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
      const colors = ['#BF953F', '#FCF6BA', '#B38728', '#FBF5B7', '#AA771C'];
      const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
      
      this.gradient.addColorStop(0, shuffledColors[0]);
      this.gradient.addColorStop(0.25, shuffledColors[1]);
      this.gradient.addColorStop(0.5, shuffledColors[2]);
      this.gradient.addColorStop(0.75, shuffledColors[3]);
      this.gradient.addColorStop(1, shuffledColors[4]);
    }

    update() {
      let currentVY = this.vy;
      let currentVX = this.vx;

      // Sway wave
      this.swayOffset += this.swaySpeed;
      currentVX += Math.sin(this.swayOffset) * 0.15;

      // Repulsion force
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repulsionRadius) {
          const force = (repulsionRadius - dist) / repulsionRadius;
          const pushStrength = 3.5;
          const ax = (dx / dist) * force * pushStrength;
          const ay = (dy / dist) * force * pushStrength;

          this.repelX += ax;
          this.repelY += ay;
        }
      }

      this.x += currentVX + this.repelX;
      this.y += currentVY + this.repelY;

      this.repelX *= 0.90;
      this.repelY *= 0.90;

      this.rotation += this.rotationSpeed;

      if (this.y < -this.size * 2) {
        this.reset(false);
      }
      
      if (this.x < -this.size * 2) {
        this.x = width + this.size;
      } else if (this.x > width + this.size * 2) {
        this.x = -this.size;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.numPoints; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = this.gradient;
      
      ctx.shadowColor = 'rgba(44, 37, 32, 0.08)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      ctx.fill();
      ctx.restore();
    }
  }

  // Populate particle array
  for (let i = 0; i < particleCount; i++) {
    particles.push(new GoldFlake());
  }

  // Canvas Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  // ==========================================
  // SCROLL-REVEAL INTERSECTION OBSERVER
  // ==========================================
  const fadeElements = document.querySelectorAll('.fade-in');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

  fadeElements.forEach(el => revealObserver.observe(el));

  // Connect scroll click behavior to Hero scroll indicator
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const target = document.getElementById('invitation-context');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==========================================
  // RSVP FORM SUBMISSION LOGIC
  // ==========================================
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpFeedback = document.getElementById('rsvpFeedback');
  const rsvpSubmitBtn = document.getElementById('rsvpSubmitBtn');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      rsvpSubmitBtn.disabled = true;
      const btnText = rsvpSubmitBtn.querySelector('span');
      if (btnText) btnText.textContent = "SENDING RESPONSE...";

      const guestName = document.getElementById('guestName').value.trim();
      const guestCount = document.getElementById('guestCount').value;

      fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, guestCount })
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          rsvpFeedback.innerHTML = `
            <p class="feedback-head" style="font-weight: 600; color: var(--gold); margin-bottom: 0.5rem; font-size: 1.25rem;">Response Registered</p>
            <p>Thank you, <strong>${guestName}</strong>. Your confirmation for <strong>${guestCount} ${parseInt(guestCount) === 1 ? 'guest' : 'guests'}</strong> has been saved. We are delighted to celebrate this special day with you.</p>
          `;
          rsvpFeedback.style.borderColor = 'rgba(212, 175, 55, 0.2)';
          rsvpFeedback.style.color = 'var(--text-primary)';
          rsvpForm.reset();
        } else {
          rsvpFeedback.innerHTML = `
            <p class="feedback-head" style="font-weight: 600; color: #ff4d4f; margin-bottom: 0.5rem; font-size: 1.25rem;">Submission Error</p>
            <p>${result.message || 'We could not submit your response. Please try again.'}</p>
          `;
          rsvpFeedback.style.borderColor = '#ff4d4f';
          rsvpFeedback.style.color = '#ff4d4f';
        }
        rsvpFeedback.classList.remove('hidden');
        rsvpSubmitBtn.disabled = false;
        if (btnText) btnText.textContent = "SUBMIT RESPONSE";
        rsvpFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      })
      .catch(err => {
        console.error("RSVP API Error:", err);
        rsvpFeedback.innerHTML = `
          <p class="feedback-head" style="font-weight: 600; color: #ff4d4f; margin-bottom: 0.5rem; font-size: 1.25rem;">Network Error</p>
          <p>Unable to connect to the registration server. Please check your internet connection and try again.</p>
        `;
        rsvpFeedback.style.borderColor = '#ff4d4f';
        rsvpFeedback.style.color = '#ff4d4f';
        rsvpFeedback.classList.remove('hidden');
        rsvpSubmitBtn.disabled = false;
        if (btnText) btnText.textContent = "SUBMIT RESPONSE";
        rsvpFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  // ==========================================
  // DYNAMIC GUEST WISHES BOARD LOGIC
  // ==========================================
  const wishForm = document.getElementById('wishForm');
  const wishesGrid = document.getElementById('wishesGrid');
  const wishSubmitBtn = document.getElementById('wishSubmitBtn');
  const wishFormFeedback = document.getElementById('wishFormFeedback');

  // Format date helper for guest wishes timestamp
  function formatWishDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Fetch and display wishes
  function fetchWishes() {
    fetch('/api/wishes')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          renderWishes(result.data);
        } else {
          console.error("Failed to load wishes from API.");
        }
      })
      .catch(err => {
        console.error("Wishes API Load Error:", err);
        wishesGrid.innerHTML = `<div class="no-wishes" style="color: #ff4d4f;">Could not load greetings board.</div>`;
      });
  }

  function renderWishes(wishes) {
    wishesGrid.innerHTML = '';

    if (!wishes || wishes.length === 0) {
      wishesGrid.innerHTML = `<div class="no-wishes">Be the first to leave a blessing!</div>`;
      return;
    }

    wishes.forEach(wish => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      
      const nameEscaped = escapeHtml(wish.name);
      const messageEscaped = escapeHtml(wish.message);
      const dateString = formatWishDate(wish.timestamp);

      card.innerHTML = `
        <p class="wish-message">"${messageEscaped}"</p>
        <div class="wish-meta">
          <span class="wish-author">${nameEscaped}</span>
          <span class="wish-time">${dateString}</span>
        </div>
      `;
      wishesGrid.appendChild(card);
    });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Handle wish form submissions
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      wishSubmitBtn.disabled = true;
      const btnText = wishSubmitBtn.querySelector('span');
      if (btnText) btnText.textContent = "SENDING BLESSINGS...";

      const name = document.getElementById('wishName').value.trim();
      const message = document.getElementById('wishMessage').value.trim();

      fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // Success state
          wishFormFeedback.innerHTML = `
            <p style="font-weight: 600; color: var(--gold); margin-bottom: 0.25rem;">Wish Received</p>
            <p>${result.message || 'Thank you for your blessings!'}</p>
          `;
          wishFormFeedback.style.borderColor = 'rgba(212, 175, 55, 0.2)';
          wishFormFeedback.style.color = 'var(--text-primary)';
          wishFormFeedback.classList.remove('hidden');
          
          wishForm.reset();
          // Reload the wishes grid immediately to show the new card
          fetchWishes();
        } else {
          // Validation/server error state
          wishFormFeedback.innerHTML = `
            <p style="font-weight: 600; color: #ff4d4f; margin-bottom: 0.25rem;">Error</p>
            <p>${result.message || 'Failed to submit wish. Please try again.'}</p>
          `;
          wishFormFeedback.style.borderColor = '#ff4d4f';
          wishFormFeedback.style.color = '#ff4d4f';
          wishFormFeedback.classList.remove('hidden');
        }
        
        wishSubmitBtn.disabled = false;
        if (btnText) btnText.textContent = "SEND BLESSINGS";
      })
      .catch(err => {
        console.error("Wishes Form API Error:", err);
        wishFormFeedback.innerHTML = `
          <p style="font-weight: 600; color: #ff4d4f; margin-bottom: 0.25rem;">Network Error</p>
          <p>Unable to connect to the greeting server. Please check your connection.</p>
        `;
        wishFormFeedback.style.borderColor = '#ff4d4f';
        wishFormFeedback.style.color = '#ff4d4f';
        wishFormFeedback.classList.remove('hidden');
        
        wishSubmitBtn.disabled = false;
        if (btnText) btnText.textContent = "SEND BLESSINGS";
      });
    });
  }



  // ==========================================
  // REAL-TIME COUNTDOWN TIMER LOGIC
  // ==========================================
  const targetDate = new Date("2026-08-23T16:30:00+05:30"); // August 23, 2026 4:30 PM IST

  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');
  const countdownEl = document.getElementById('countdown');

  function updateCountdown() {
    const now = new Date();
    const timeDiff = targetDate - now;

    if (timeDiff <= 0) {
      if (countdownEl) {
        countdownEl.innerHTML = `<span style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--gold); letter-spacing: 0.05em; font-style: italic;">The celebration has begun!</span>`;
      }
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  // ==========================================
  // ADD TO CALENDAR BUTTON LOGIC
  // ==========================================
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  const calendarDropdown = document.getElementById('calendarDropdown');
  const downloadIcsBtn = document.getElementById('downloadIcsBtn');

  if (addToCalendarBtn && calendarDropdown) {
    addToCalendarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = addToCalendarBtn.getAttribute('aria-expanded') === 'true';
      addToCalendarBtn.setAttribute('aria-expanded', !isExpanded);
      calendarDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!addToCalendarBtn.contains(e.target) && !calendarDropdown.contains(e.target)) {
        calendarDropdown.classList.add('hidden');
        addToCalendarBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (downloadIcsBtn) {
    downloadIcsBtn.addEventListener('click', () => {
      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Wedding Reception//Nowfal and Hessa//EN",
        "BEGIN:VEVENT",
        "UID:wedding-reception-nowfal-hessa-2026@sisterswedding.com",
        "DTSTAMP:20260716T000000Z",
        "DTSTART:20260823T110000Z", // 11:00 AM UTC (4:30 PM IST)
        "DTEND:20260823T143000Z",   // 2:30 PM UTC (8:00 PM IST)
        "SUMMARY:Wedding Reception — Dr. Nowfal & Dr. Hessa Fathima",
        "DESCRIPTION:You are cordially invited to the wedding reception of Dr. Nowfal Yousaf and Dr. Hessa Fathima.",
        "LOCATION:Hailmount Auditorium, Chelakkara, Thrissur, Kerala",
        "END:VEVENT",
        "END:VCALENDAR"
      ];
      
      const blob = new Blob([icsLines.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "wedding_reception_nowfal_hessa.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Fetch initial list of wishes on page load
  fetchWishes();

});
