document.addEventListener('DOMContentLoaded', () => {
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

    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        initMagneticGrid(heroBg);
    }

    document.querySelectorAll('.video-item video').forEach(video => {
        const seekTime = parseFloat(video.dataset.poster) || 1.5;
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = seekTime;
        });
    });
    
    const cards = document.querySelectorAll('.card');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
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
            if (img) {
                const src = img.src;
                openLightbox(src);
            }
        });
    });
    
    

    document.querySelectorAll('.video-item').forEach(item => {
        const video = item.querySelector('video');
        const toggle = item.querySelector('.audio-toggle');

        item.addEventListener('mouseenter', () => {
            if (video) {
                video.play().catch(() => {});
            }
        });

        item.addEventListener('mouseleave', () => {
            if (video) {
                video.pause();
                video.currentTime = parseFloat(video.dataset.poster) || 1.5;
            }
        });

        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video) {
                    if (video.muted) {
                        video.muted = false;
                        toggle.textContent = '🔊';
                        toggle.classList.add('active');
                    } else {
                        video.muted = true;
                        toggle.textContent = '🔇';
                        toggle.classList.remove('active');
                    }
                }
            });
        }
    });

    document.querySelectorAll('.card').forEach(card => {
        const video = card.querySelector('.card-image video');
        if (video) {
            const seekTime = parseFloat(video.dataset.poster) || 1.5;

            card.addEventListener('mouseenter', () => {
                video.currentTime = seekTime;
                video.play().catch(() => {});
            });

            card.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = seekTime;
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
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
                closeLightbox();
            }
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

function initMagneticGrid(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;display:block';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Obtener el color de las líneas dinámicamente desde el CSS
    const textStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    let gridStrokeColor = 'rgba(255, 255, 255, 0.06)'; // Valor por defecto en blanco
    if (textStyle.startsWith('#')) {
        const hex = textStyle.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        gridStrokeColor = `rgba(${r}, ${g}, ${b}, 0.06)`;
    }

    let W, H;
    const spacing = 30;
    let points = [];

    const mouse = { x: 0, y: 0, active: false };

    function initGrid() {
        points = [];
        const cols = Math.floor(W / spacing) + 2;
        const rows = Math.floor(H / spacing) + 2;
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const ox = x * spacing - spacing / 2;
                const oy = y * spacing - spacing / 2;
                points.push({
                    x: ox,
                    y: oy,
                    ox: ox,
                    oy: oy,
                    vx: 0,
                    vy: 0
                });
            }
        }
    }

    function resize() {
        const rect = container.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = rect.height;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        initGrid();
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    });

    window.addEventListener('mouseout', () => {
        mouse.active = false;
    });

    function draw() {
        // Limpiar con transparencia para ver la imagen de fondo de .hero-bg
        ctx.clearRect(0, 0, W, H);

        const forceRadius = 150;
        const k = 0.08; // Rigidez del resorte
        const damping = 0.85; // Amortiguación

        // 1. Actualizar posiciones de los puntos
        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            let dx = 0;
            let dy = 0;
            let dist = 0;

            if (mouse.active) {
                dx = pt.x - mouse.x;
                dy = pt.y - mouse.y;
                dist = Math.sqrt(dx * dx + dy * dy);
            }

            // Repulsión magnética
            if (mouse.active && dist < forceRadius) {
                const force = (forceRadius - dist) / forceRadius;
                const angle = Math.atan2(dy, dx);
                pt.vx += Math.cos(angle) * force * 3;
                pt.vy += Math.sin(angle) * force * 3;
            }

            // Atracción de muelle a la posición original
            const ax = (pt.ox - pt.x) * k;
            const ay = (pt.oy - pt.y) * k;

            pt.vx = (pt.vx + ax) * damping;
            pt.vy = (pt.vy + ay) * damping;

            pt.x += pt.vx;
            pt.y += pt.vy;
        }

        // 2. Dibujar líneas de cuadrícula
        ctx.strokeStyle = gridStrokeColor; // Carbón translúcido
        ctx.lineWidth = 1;

        const cols = Math.floor(W / spacing) + 2;
        const rows = Math.floor(H / spacing) + 2;

        for (let y = 0; y < rows; y++) {
            ctx.beginPath();
            for (let x = 0; x < cols; x++) {
                const idx = y * cols + x;
                if (idx < points.length) {
                    const pt = points[idx];
                    if (x === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                }
            }
            ctx.stroke();
        }

        for (let x = 0; x < cols; x++) {
            ctx.beginPath();
            for (let y = 0; y < rows; y++) {
                const idx = y * cols + x;
                if (idx < points.length) {
                    const pt = points[idx];
                    if (y === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                }
            }
            ctx.stroke();
        }

        // 3. Dibujar puntos destacados con interpolación de color
        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            const dx = pt.x - pt.ox;
            const dy = pt.y - pt.oy;
            const displacement = Math.sqrt(dx * dx + dy * dy);

            if (displacement > 1) {
                ctx.beginPath();
                const size = Math.min(4, 1.5 + displacement * 0.1);
                ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);

                const t = Math.max(0, Math.min(1, (displacement - 1) / 14));
                const r = Math.round(38 + (242 - 38) * t); // De 38 (carbón) a 242 (rojo #F24949)
                const g = Math.round(37 + (73 - 37) * t);  // De 37 (carbón) a 73 (rojo)
                const b = Math.round(36 + (73 - 36) * t);  // De 36 (carbón) a 73 (rojo)
                const a = 0.2 + 0.7 * t; // Transición de opacidad de 0.2 a 0.9

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                ctx.fill();
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});