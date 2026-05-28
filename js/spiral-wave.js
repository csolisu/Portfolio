document.addEventListener('DOMContentLoaded', () => {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) initRorschachWave(heroBg);

    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    const cards = document.querySelectorAll('.card');
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(card);
    });

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) openLightbox(img.src);
        });
    });

    document.querySelectorAll('.video-item').forEach(item => {
        const video = item.querySelector('video');
        const toggle = item.querySelector('.audio-toggle');
        item.addEventListener('mouseenter', () => { if (video) video.play().catch(() => {}); });
        item.addEventListener('mouseleave', () => { if (video) { video.pause(); video.currentTime = 0; } });
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video) {
                    video.muted = !video.muted;
                    toggle.textContent = video.muted ? '🔇' : '🔊';
                    toggle.classList.toggle('active');
                }
            });
        }
    });
});

function openLightbox(src) {
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.innerHTML = `<img src="${src}"><button class="lightbox-close">&times;</button>`;
        document.body.appendChild(lightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLightbox();
        });
    } else {
        lightbox.querySelector('img').src = src;
    }
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

function initRorschachWave(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W, H, cols, rows, spacing = 12;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        cols = Math.floor(W / spacing);
        rows = Math.floor(H / spacing);
    }
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    let mx = W / 2, my = H / 2;
    let smx = W / 2, smy = W / 2;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
    });

    function draw() {
        time += 0.02;
        ctx.clearRect(0, 0, W, H);

        smx += (mx - smx) * 0.08;
        smy += (my - smy) * 0.08;

        const cx = W / 2;
        const cy = H / 2;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const px = x * spacing + spacing / 2;
                const py = y * spacing + spacing / 2;

                const dx = px - cx;
                const dy = py - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                const wave = Math.sin(dist * 0.03 - time * 3 + angle) * 0.5 + 0.5;
                const spiral = Math.sin(dist * 0.025 - time * 2 + angle * 3) * 0.5 + 0.5;

                const mdx = px - smx;
                const mdy = py - smy;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                const ripple = Math.sin(mdist * 0.06 - time * 3) * Math.exp(-mdist * 0.008) * 0.6;

                const val = (wave * 0.5 + spiral * 0.5 + ripple);

                if (val > 0.15) {
                    const size = val * 3.5 + 0.5;
                    const alpha = val * 0.25 + 0.04;
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(97, 97, 97, ${alpha})`;
                    ctx.fill();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
}
