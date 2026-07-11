    // ══════════════════════════════════════
    // 0. INTRO CINEMÁTICA - HORA DE ARENA
    // ══════════════════════════════════════
    (function() {
        const overlay = document.getElementById('introOverlay');
        const canvas = document.getElementById('introCanvas');

        if (!overlay || !canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const lines = [
            document.getElementById('introLine1'),
            document.getElementById('introLine2'),
            document.getElementById('introLine3'),
            document.getElementById('introLine4'),
            document.getElementById('introLine5'),
            document.getElementById('introSkip')
        ];
        const introBtn = document.getElementById('introBtn');
        const skipBtn = document.getElementById('skipBtn');

        let W, H, animId;
        let particles = [];
        let time = 0;
        let introFinished = false;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // ── Partícula ──
        class Particle {
            constructor() { this.reset(); }
            reset() {
                // Posición inicial: parte superior del reloj (embudo)
                const cx = W / 2;
                const topY = H * 0.15;
                this.x = cx + (Math.random() - 0.5) * 60;
                this.y = topY + Math.random() * 20;
                this.size = Math.random() * 3 + 1.5;
                this.speedY = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.life = 1;
                this.decay = Math.random() * 0.005 + 0.003;
                // Color aleatorio entre violeta, verde y azul
                const colors = [
                    [108,58,255],
                    [0,229,160],
                    [0,180,216],
                    [139,92,246],
                    [255,210,63]
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.glow = Math.random() * 15 + 5;
            }
            update() {
                // Atracción hacia el centro (cuello del reloj)
                const cx = W / 2;
                const neckY = H * 0.5;
                const distToNeck = Math.abs(this.y - neckY);

                if (distToNeck < 100) {
                    // Cerca del cuello: acelerar hacia abajo y al centro
                    this.speedX += (cx - this.x) * 0.002;
                    this.speedY += 0.15;
                } else if (this.y > neckY) {
                    // Debajo del cuello: dispersarse como arena
                    this.speedX += (Math.random() - 0.5) * 0.3;
                    this.speedY += 0.05;
                }

                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= this.decay;

                // Reset si sale de pantalla o muere
                if (this.y > H + 20 || this.life <= 0) {
                    this.reset();
                }
            }
            draw() {
                const [r, g, b] = this.color;
                ctx.save();
                ctx.globalAlpha = this.life * 0.8;
                ctx.shadowBlur = this.glow;
                ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
                ctx.fillStyle = `rgba(${r},${g},${b},1)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Crear partículas
        for (let i = 0; i < 200; i++) {
            const p = new Particle();
            p.y = H * 0.15 + Math.random() * (H * 0.7);
            particles.push(p);
        }

        // ── Dibujar hora de arena ──
        function drawHourglass() {
            const cx = W / 2;
            const top = H * 0.12;
            const bot = H * 0.88;
            const neck = H * 0.5;
            const topW = Math.min(160, W * 0.15);
            const botW = Math.min(160, W * 0.15);
            const neckW = 12;

            ctx.save();
            ctx.strokeStyle = 'rgba(108,58,255,0.2)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(108,58,255,0.15)';

            // Contorno superior
            ctx.beginPath();
            ctx.moveTo(cx - topW, top);
            ctx.quadraticCurveTo(cx - topW, top + 40, cx - neckW, neck);
            ctx.quadraticCurveTo(cx - neckW, neck + 2, cx, neck + 4);
            ctx.quadraticCurveTo(cx + neckW, neck + 2, cx + neckW, neck);
            ctx.quadraticCurveTo(cx + topW, top + 40, cx + topW, top);
            ctx.lineTo(cx - topW, top);
            ctx.stroke();

            // Contorno inferior
            ctx.beginPath();
            ctx.moveTo(cx - botW, bot);
            ctx.quadraticCurveTo(cx - botW, bot - 40, cx - neckW, neck);
            ctx.quadraticCurveTo(cx - neckW, neck - 2, cx, neck - 4);
            ctx.quadraticCurveTo(cx + neckW, neck - 2, cx + neckW, neck);
            ctx.quadraticCurveTo(cx + botW, bot - 40, cx + botW, bot);
            ctx.lineTo(cx - botW, bot);
            ctx.stroke();

            // Marco superior e inferior
            ctx.strokeStyle = 'rgba(108,58,255,0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - topW - 10, top);
            ctx.lineTo(cx + topW + 10, top);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - botW - 10, bot);
            ctx.lineTo(cx + botW + 10, bot);
            ctx.stroke();

            ctx.restore();

            // Resplandor del cuello
            const gradient = ctx.createRadialGradient(cx, neck, 0, cx, neck, 60);
            gradient.addColorStop(0, 'rgba(0,229,160,0.15)');
            gradient.addColorStop(1, 'rgba(0,229,160,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(cx - 60, neck - 60, 120, 120);
        }

        // ── Loop de animación ──
        function animate() {
            ctx.clearRect(0, 0, W, H);

            // Fondo oscuro con vignette
            const vignette = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.8);
            vignette.addColorStop(0, 'rgba(5,5,16,0)');
            vignette.addColorStop(1, 'rgba(5,5,16,1)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, W, H);

            drawHourglass();

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            time += 0.016;
            animId = requestAnimationFrame(animate);
        }
        animate();

        // ── Secuencia de textos ──
        function showLine(el, delay) {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
        }

        showLine(lines[0], 800);   // El tiempo es tu recurso...
        showLine(lines[1], 2000);  // Es hora de implementar...
        showLine(lines[2], 3500);  // Para no quedarse obsoleto...
        showLine(lines[3], 5000);  // Hacé que cada segundo...
        showLine(lines[4], 6500);  // Botón
        showLine(lines[5], 7500);  // Skip

        // ── Cerrar intro ──
        function closeIntro() {
            if (introFinished) return;
            introFinished = true;
            cancelAnimationFrame(animId);
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(1.05)';
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1200);
        }

        introBtn.addEventListener('click', closeIntro);
        skipBtn.addEventListener('click', closeIntro);

        // Auto-cerrar después de 12 segundos
        setTimeout(closeIntro, 12000);
    })();

    // ══════════════════════════════════════
    // 1. INTERSECTION OBSERVER (fade-up)
    // ══════════════════════════════════════
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // ══════════════════════════════════════
    // 2. NAV SCROLL EFFECT
    // ══════════════════════════════════════
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        nav.style.background = window.scrollY > 50
            ? 'rgba(10,10,26,0.95)'
            : 'rgba(10,10,26,0.85)';
    });

    // ══════════════════════════════════════
    // 3. SCROLL SCALE EFFECT (center focus)
    // ══════════════════════════════════════
    const scaleTargets = document.querySelectorAll(
        '.service-card, .ba-card, .process-step, .stat, .tech-pill'
    );
    scaleTargets.forEach(el => el.classList.add('scroll-scale'));

    function updateScrollScale() {
        const centerY = window.innerHeight / 2;
        const maxDist = window.innerHeight * 0.6;

        scaleTargets.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.top + rect.height / 2;
            const dist = Math.abs(elCenter - centerY);
            const ratio = Math.max(0, 1 - dist / maxDist);

            // Scale from 0.92 to 1.06 based on proximity to center
            const scale = 0.92 + ratio * 0.14;
            // Slight brightness boost at center
            const brightness = 0.85 + ratio * 0.2;

            el.style.transform = `scale(${scale.toFixed(3)})`;
            el.style.filter = `brightness(${brightness.toFixed(2)})`;
        });
    }

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                updateScrollScale();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });
    // Initial call
    updateScrollScale();

    // ══════════════════════════════════════
    // 4. CUSTOM CURSOR
    // ══════════════════════════════════════
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('cursorDot');
    let mouseX = -100, mouseY = -100;
    let cursorX = -100, cursorY = -100;

    if (cursorDot) {
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Dot follows instantly
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
    }

    // Smooth cursor follow
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor states on hover
    const hoverTargets = document.querySelectorAll(
        'a, button, .btn-primary, .btn-outline, .nav-cta, .service-card, .ba-card, .tech-pill, .process-step'
    );
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.classList.contains('btn-primary') || el.classList.contains('btn-outline') || el.classList.contains('nav-cta')) {
                document.body.classList.add('cursor-pointer');
            } else {
                document.body.classList.add('cursor-hover');
            }
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-pointer', 'cursor-hover', 'cursor-text');
        });
    });

    // ══════════════════════════════════════
    // 5. MOUSE FOLLOW GLOW
    // ══════════════════════════════════════
    const mouseGlow = document.getElementById('mouseGlow');
    document.addEventListener('mousemove', e => {
        mouseGlow.style.left = e.clientX + 'px';
        mouseGlow.style.top = e.clientY + 'px';
    });

    // ══════════════════════════════════════
    // 6. FLOATING PARTICLES
    // ══════════════════════════════════════
    const particlesContainer = document.getElementById('particles');
    const particleColors = [
        'rgba(108,58,255,0.4)',
        'rgba(0,229,160,0.4)',
        'rgba(0,180,216,0.3)',
        'rgba(139,92,246,0.3)',
        'rgba(255,210,63,0.3)'
    ];

    function createParticle() {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];
        const duration = Math.random() * 15 + 15;
        const delay = Math.random() * 5;
        const startX = Math.random() * 100;

        p.style.cssText = `
            width: ${size}px; height: ${size}px;
            background: ${color};
            left: ${startX}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            box-shadow: 0 0 ${size * 3}px ${color};
        `;
        particlesContainer.appendChild(p);

        // Remove after animation
        setTimeout(() => p.remove(), (duration + delay) * 1000);
    }

    // Create initial batch
    for (let i = 0; i < 30; i++) createParticle();
    // Keep creating
    setInterval(() => {
        if (particlesContainer.children.length < 40) createParticle();
    }, 800);

    // ══════════════════════════════════════
    // 8. FAQ ACCORDION
    // ══════════════════════════════════════
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const wasOpen = item.classList.contains('open');
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            // Toggle current
            if (!wasOpen) item.classList.add('open');
        });
    });

    // ══════════════════════════════════════
    // 7. PARALLAX ON ORBS (subtle)
    // ══════════════════════════════════════
    const orbs = document.querySelectorAll('.bg-orb');
    document.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        orbs.forEach((orb, i) => {
            const speed = (i + 1) * 8;
            orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    // ══════════════════════════════════════
    // 9. SOUND EFFECTS (Web Audio API)
    // ══════════════════════════════════════
    let audioCtx = null;
    let soundEnabled = true;
    const soundToggle = document.getElementById('soundToggle');

    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playTone(freq, duration, type, volume) {
        if (!soundEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(volume || 0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + duration);
        } catch(e) {}
    }

    function playClick() { playTone(800, 0.08, 'sine', 0.06); }
    function playHover() { playTone(1200, 0.05, 'sine', 0.03); }
    function playSuccess() {
        playTone(523, 0.12, 'sine', 0.07);
        setTimeout(() => playTone(659, 0.12, 'sine', 0.07), 100);
        setTimeout(() => playTone(784, 0.15, 'sine', 0.07), 200);
    }
    function playNav() { playTone(440, 0.06, 'triangle', 0.05); }
    function playCardOpen() {
        playTone(600, 0.08, 'sine', 0.05);
        setTimeout(() => playTone(900, 0.1, 'sine', 0.05), 80);
    }
    function playWhoosh() {
        if (!soundEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.15);
        } catch(e) {}
    }

    // Init audio on first interaction
    document.addEventListener('click', () => initAudio(), { once: true });

    // Sound toggle
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            initAudio();
            soundEnabled = !soundEnabled;
            soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
            soundToggle.classList.toggle('muted', !soundEnabled);
            if (soundEnabled) playSuccess();
        });
    }

    // Attach sounds to interactive elements
    document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta').forEach(el => {
        el.addEventListener('click', playClick);
        el.addEventListener('mouseenter', playHover);
    });

    document.querySelectorAll('.service-card, .ba-card, .portfolio-card, .value-card, .case-step').forEach(el => {
        el.addEventListener('mouseenter', playHover);
    });

    document.querySelectorAll('.faq-question').forEach(el => {
        el.addEventListener('click', playCardOpen);
    });

    document.querySelectorAll('.nav-links a').forEach(el => {
        el.addEventListener('click', playNav);
    });

    // Scroll sound (throttled)
    let lastScrollSound = 0;
    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScrollSound > 2000 && soundEnabled && audioCtx) {
            playWhoosh();
            lastScrollSound = now;
        }
    });

