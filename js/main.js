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
        initSpiralWave(heroBg);
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

function initSpiralWave(container) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;display:block';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W, H, cols, rows, spacing = 12;

    function resize() {
        const rect = container.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = rect.height;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        cols = Math.floor(W / spacing);
        rows = Math.floor(H / spacing);
    }
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    let mx = container.getBoundingClientRect().width / 2, my = container.getBoundingClientRect().height / 2;
    let smx = mx, smy = my;

    canvas.addEventListener('mousemove', (e) => {
        mx = e.offsetX;
        my = e.offsetY;
    });

    container.addEventListener('mouseleave', () => {
        const rect = container.getBoundingClientRect();
        mx = rect.width / 2;
        my = rect.height / 2;
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
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.5})`;
                    ctx.fill();
                }
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