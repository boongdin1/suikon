$(function () {
    /* --------------------------------
     * Intro 영상 (페이지 진입 시 1회)
     * -------------------------------- */
    (function initIntro() {
        const overlay = document.getElementById("intro-overlay");
        const video = document.getElementById("intro-video");
        if (!overlay || !video) return;

        document.body.classList.add("intro-active");

        let finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            overlay.classList.add("fade-out");
            document.body.classList.remove("intro-active");
            setTimeout(() => {
                overlay.remove();
                if (window.ScrollTrigger) ScrollTrigger.refresh();
            }, 900);
        }

        video.addEventListener("ended", finish);
        video.addEventListener("error", finish);
        const playPromise = video.play();
        if (playPromise && playPromise.catch) playPromise.catch(finish);
        setTimeout(finish, 6000);
        overlay.addEventListener("click", finish);
    })();

    /* --------------------------------
     * 햄버거 메뉴 + 모바일 GNB 토글
     * -------------------------------- */
    (function initMobileMenu() {
        const hamburger = document.querySelector("#header .hamburger");
        const mobileMenu = document.getElementById("mobile-menu");
        const dim = document.querySelector(".menu-dim");
        if (!hamburger || !mobileMenu) return;

        const open = () => {
            document.body.classList.add("menu-open");
            hamburger.setAttribute("aria-expanded", "true");
            mobileMenu.setAttribute("aria-hidden", "false");
        };
        const close = () => {
            document.body.classList.remove("menu-open");
            hamburger.setAttribute("aria-expanded", "false");
            mobileMenu.setAttribute("aria-hidden", "true");
            mobileMenu.querySelectorAll(".m-has-sub.open").forEach(li => {
                li.classList.remove("open");
                const t = li.querySelector(".m-toggle");
                if (t) t.setAttribute("aria-expanded", "false");
            });
        };
        const toggle = () => {
            if (document.body.classList.contains("menu-open")) close();
            else open();
        };

        hamburger.addEventListener("click", (e) => {
            e.preventDefault();
            toggle();
        });
        if (dim) dim.addEventListener("click", close);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && document.body.classList.contains("menu-open")) close();
        });

        // 모바일 메뉴의 서브 메뉴 토글
        mobileMenu.querySelectorAll(".m-has-sub > .m-toggle").forEach(btn => {
            btn.addEventListener("click", () => {
                const li = btn.closest(".m-has-sub");
                if (!li) return;
                const opened = li.classList.toggle("open");
                btn.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        });

        // 모바일 메뉴 항목 클릭 시 닫기 (해시 앵커 점프 자연스럽게)
        mobileMenu.querySelectorAll("a[href]").forEach(a => {
            a.addEventListener("click", () => {
                setTimeout(close, 100);
            });
        });
    })();

    /* --------------------------------
     * 비디오 lazy load (data-src → src) + viewport pause
     * -------------------------------- */
    (function initVideoLazy() {
        const videos = document.querySelectorAll("video[data-src]");
        if (!videos.length) return;
        const ensureSrc = (v) => {
            if (v.dataset && v.dataset.src && !v.getAttribute("src")) {
                v.src = v.dataset.src;
                try { v.load(); } catch (e) {}
            }
        };
        if (!("IntersectionObserver" in window)) {
            videos.forEach(ensureSrc);
            return;
        }
        // 1) 미리 로드 (진입 임박 시)
        const loader = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    ensureSrc(e.target);
                    loader.unobserve(e.target);
                }
            });
        }, { rootMargin: "300px 0px" });
        // 2) viewport 안이면 play (autoplay 속성 시), 밖이면 pause
        const player = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                const v = e.target;
                if (e.isIntersecting) {
                    if (v.autoplay && v.paused) {
                        const p = v.play && v.play();
                        if (p && p.catch) p.catch(() => {});
                    }
                } else {
                    if (!v.paused) { try { v.pause(); } catch (err) {} }
                }
            });
        }, { threshold: 0.05 });
        videos.forEach(v => {
            loader.observe(v);
            player.observe(v);
        });
    })();

    /* --------------------------------
     * 히어로 비디오 — 화면 밖이면 pause
     * -------------------------------- */
    (function initHeroVideoPause() {
        const v = document.querySelector("#hero .bg video");
        if (!v || !("IntersectionObserver" in window)) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
                } else {
                    if (!v.paused) { try { v.pause(); } catch (err) {} }
                }
            });
        }, { threshold: 0.05 });
        io.observe(v);
    })();

    /* --------------------------------
     * 히어로 비디오 재생 속도
     * -------------------------------- */
    (function initHeroVideoSpeed() {
        const video = document.querySelector("#hero .bg video");
        if (!video) return;
        const HERO_RATE = 1;
        const apply = () => { try { video.playbackRate = HERO_RATE; } catch (e) {} };
        apply();
        video.addEventListener("loadedmetadata", apply);
        video.addEventListener("play", apply);
    })();

    const isMobile = window.innerWidth < 768;
    // === AOS ===
    AOS.init({
      duration: 600,
      easing: "ease-out",
      offset: 80,
      once: true,
      mirror: false,
      anchorPlacement: "top-bottom",
    });

    // === GSAP ===
    gsap.registerPlugin(ScrollTrigger);

    // ScrollTrigger가 페이지 높이를 바꿀 때마다 AOS 좌표 재계산
    if (window.AOS && window.ScrollTrigger) {
        ScrollTrigger.addEventListener("refresh", () => AOS.refreshHard());
        window.addEventListener("load", () => {
            AOS.refreshHard();
            ScrollTrigger.refresh();
        });
    }

    /* --------------------------------
     * 히어로 원 마스크 — 스크롤 따라 확장
     * -------------------------------- */
    (function initHeroMask() {
        const hero = document.getElementById("hero");
        const mask = hero && hero.querySelector(".hero-mask");
        if (!hero || !mask) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            mask.style.display = "none";
            return;
        }

        const calcRange = () => {
            const minR = Math.min(window.innerWidth, window.innerHeight) * 0.18;
            const maxR = Math.hypot(window.innerWidth, window.innerHeight) * 0.72;
            return { minR, maxR };
        };
        let range = calcRange();
        mask.style.setProperty("--hero-r", range.minR + "px");

        ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "25% top",
            scrub: 0.2,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const r = range.minR + self.progress * (range.maxR - range.minR);
                mask.style.setProperty("--hero-r", r + "px");
            },
            onRefresh: () => { range = calcRange(); },
        });
    })();

    /* --------------------------------
     * SECTION-01 (about) — sticky scroll
     * 영상 opacity 0 → 0.7 → 0, 텍스트도 동기 페이드
     * -------------------------------- */
    (function initAboutScroll() {
        const section = document.querySelector(".sec-about");
        if (!section) return;
        const bg = section.querySelector(".section-bg");
        const title = section.querySelector(".section-title");
        if (!bg || !title) return;

        bg.style.opacity = 0;
        title.style.opacity = 0;
        title.style.transform = "translateY(20px)";

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
            onUpdate: (self) => {
                const p = self.progress;
                // 배경 영상: 0~0.3 페이드인(→0.7), 0.3~0.65 유지, 0.65~1 페이드아웃(→0)
                let bgOp = 0;
                if (p < 0.3) bgOp = (p / 0.3) * 0.7;
                else if (p < 0.65) bgOp = 0.7;
                else bgOp = ((1 - p) / 0.35) * 0.7;
                bg.style.opacity = Math.max(0, Math.min(0.7, bgOp));

                // 텍스트: 0.08~0.35 페이드인, 0.35~0.7 유지, 0.7~0.95 페이드아웃
                let tOp = 0;
                let tY = 20;
                if (p < 0.08) { tOp = 0; tY = 20; }
                else if (p < 0.35) {
                    const k = (p - 0.08) / 0.27;
                    tOp = k; tY = 20 * (1 - k);
                } else if (p < 0.7) { tOp = 1; tY = 0; }
                else if (p < 0.95) {
                    const k = (p - 0.7) / 0.25;
                    tOp = 1 - k; tY = -10 * k;
                } else { tOp = 0; tY = -10; }
                title.style.opacity = Math.max(0, Math.min(1, tOp));
                title.style.transform = `translateY(${tY}px)`;
            },
        });
    })();


    /* --------------------------------
     * section-04 — 6 scenes (sticky) + 영상 자동 재생
     * -------------------------------- */
    // 0~1 범위에서 start/duration 기준 로컬 진행도
    function getProgress(global, { start, duration }) {
      const t = (global - start) / duration;
      return Math.max(0, Math.min(1, t));
    }

    // 레퍼런스 스타일 씬 페이드/텍스트 진행도
    const sceneFadeInProgress  = (t) => getProgress(t, { start: 0,   duration: 0.2 });
    const sceneFadeOutProgress = (t) => getProgress(t, { start: 0.8, duration: 0.2 });
    const sceneTextInProgress  = (t) => getProgress(t, { start: 0,   duration: 0.3 });
    const sceneTextOutProgress = (t) => getProgress(t, { start: 0.7, duration: 0.3 });


    (function initSection04() {
        const section04 = document.querySelector(".section-04");
        if (!section04) return;
        const sticky = section04.querySelector(".sticky");
        const scenes = Array.from(section04.querySelectorAll(".scene"));
        if (!sticky || !scenes.length) return;

        const videos = scenes.map(s => s.querySelector(".right-section video"));
        videos.forEach(v => {
            if (v) { v.muted = true; v.playsInline = true; v.loop = true; }
        });
        const ensureSrc = (v) => {
            if (v && v.dataset && v.dataset.src && !v.getAttribute("src")) {
                v.src = v.dataset.src;
                try { v.load(); } catch (e) {}
            }
        };

        // 초기: 모두 숨김 (스크롤 진행에 따라 페이드 인)
        scenes.forEach((s) => {
            s.style.position = "absolute";
            s.style.inset = "0";
            s.style.opacity = 0;
        });

        let currentIdx = -1;
        const updateVideos = (activeIdx) => {
            if (activeIdx === currentIdx) return;
            currentIdx = activeIdx;
            videos.forEach((v, i) => {
                if (!v) return;
                if (i === activeIdx) {
                    ensureSrc(v);
                    const p = v.play && v.play();
                    if (p && p.catch) p.catch(() => {});
                } else {
                    v.pause && v.pause();
                }
            });
        };

        const FADE = 0.5; // segment 내 페이드 인/아웃 비율
        const FIRST_DELAY = 0.15; // 첫 scene 시작 지연 (segment 비율 안에서)
        const updateScenes = (progress) => {
            const n = scenes.length;
            const segLen = 1 / n;
            let activeIdx = -1;
            let activeOp = -1;
            scenes.forEach((s, i) => {
                const offset = i === 0 ? FIRST_DELAY * segLen : 0;
                const segStart = i * segLen + offset;
                const denom = segLen - offset;
                const local = denom > 0 ? (progress - segStart) / denom : 0;
                let op = 0;
                if (local >= 0 && local <= 1) {
                    if (local < FADE) op = local / FADE;
                    else if (local > 1 - FADE && i < n - 1) op = (1 - local) / FADE;
                    else op = 1;
                }
                op = Math.max(0, Math.min(1, op));
                s.style.opacity = op;
                if (op > activeOp) { activeOp = op; activeIdx = i; }
            });
            updateVideos(activeOp > 0 ? activeIdx : -1);
        };

        // numberProgress 그리기 (단일 tick 줄 + cursor)
        const npCanvas = section04.querySelector("#numberProgress");
        const npCtx = npCanvas && npCanvas.getContext && npCanvas.getContext("2d");
        const drawProgress = (progress) => {
            if (!npCtx) return;
            const rect = npCanvas.getBoundingClientRect();
            const w = rect.width, h = rect.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (npCanvas.width !== Math.round(w * dpr)) {
                npCanvas.width = Math.round(w * dpr);
                npCanvas.height = Math.round(h * dpr);
                npCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            npCtx.clearRect(0, 0, w, h);

            const n = scenes.length;
            const idx = Math.max(0, currentIdx);

            const sideW = 44;
            const padX = sideW + 10;
            const usable = Math.max(0, w - padX * 2);
            const totalTicks = 36;
            const tickW = 2;
            const tickStep = usable / (totalTicks - 1);
            const tickH = 11;
            const baseY = h / 2 - tickH / 2;

            const filledTicks = Math.max(0, Math.min(totalTicks, progress * totalTicks));

            for (let i = 0; i < totalTicks; i++) {
                const tx = padX + i * tickStep;
                npCtx.fillStyle = i < filledTicks
                    ? "#ff9a3d"
                    : "rgba(255, 154, 61, 0.22)";
                npCtx.fillRect(tx, baseY, tickW, tickH);
            }

            const cursorIdx = Math.min(totalTicks - 1, Math.max(0, Math.floor(filledTicks)));
            const cursorX = padX + cursorIdx * tickStep;
            npCtx.fillStyle = "#ffffff";
            npCtx.fillRect(cursorX - 1, baseY - 4, 3, tickH + 8);

            npCtx.font = "700 20px 'Space Grotesk', 'Pretendard Variable', sans-serif";
            npCtx.fillStyle = "#fff";
            npCtx.textBaseline = "middle";
            npCtx.textAlign = "left";
            npCtx.fillText(String(idx + 1).padStart(2, "0"), 0, h / 2 + 1);

            npCtx.textAlign = "right";
            npCtx.fillStyle = "#fff";
            npCtx.fillText(String(n).padStart(2, "0"), w, h / 2 + 1);
        };

        // 첫 프레임 그리기 + 첫 영상 재생
        drawProgress(0);
        updateScenes(0);

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
            trigger: section04,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                updateScenes(self.progress);
                drawProgress(self.progress);
            },
        });
    })();
   
  /* --------------------------------
    * section-06 (Sticky)
    * -------------------------------- */
  const section6 = document.querySelector('.section-06');
  if (!section6) return;

  gsap.set('.section-06 .paths .path', {
    backgroundColor: 'rgba(11,13,16,1)',
  });

  gsap.set('.section-06 .paths .path span', {
    xPercent: 0,
  });

  gsap.set('.section-06 .text span', {
    opacity: 0,
  });

  gsap.set('.section-06 .text span:nth-child(1)', {
    x: -80,
  });
  gsap.set('.section-06 .text span:nth-child(2)', {
    y: 80,
  });
  gsap.set('.section-06 .text span:nth-child(3)', {
    x: 80,
  });

  gsap.set('.section-06 .text p', {
    opacity: 0,
    y: 30,
  });

  const tl06 = gsap.timeline({
    scrollTrigger: {
      trigger: '.section-06',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  tl06
    .to('.section-06 .paths .path:nth-child(1)', {
      backgroundColor: 'rgba(11,13,16,0)',
      duration: 0.8,
      ease: 'none',
    }, 0)
    .to('.section-06 .text span:nth-child(1)', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '>');

  tl06
    .to('.section-06 .paths .path:nth-child(2)', {
      backgroundColor: 'rgba(11,13,16,0)',
      duration: 0.8,
      ease: 'none',
    }, '+=0.2')
    .to('.section-06 .text span:nth-child(2)', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '>');

  tl06
    .to('.section-06 .paths .path:nth-child(3)', {
      backgroundColor: 'rgba(11,13,16,0)',
      duration: 0.8,
      ease: 'none',
    }, '+=0.2')
    .to('.section-06 .text span:nth-child(3)', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '>');

  tl06
    .to('.section-06 .text p', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '+=0.2');

  tl06
    .to('.section-06 .paths .path span', {
      xPercent: 100,
      duration: 1,
      ease: 'power2.inOut',
    }, '+=0.2');


     /* --------------------------------
     * our-cert (인증서 Swiper)
     * -------------------------------- */
 

    if (document.querySelector(".our-cert .cert-slide.slide-right")) {
      new Swiper(".our-cert .cert-slide.slide-right", {
        loop: true,
        loopAdditionalSlides: 8,
        speed: 5000,
        slidesPerView: 'auto',
        spaceBetween: 24,
        allowTouchMove: false,
        freeMode: { enabled: true, momentum: false },
        autoplay: { delay: 1, disableOnInteraction: false, reverseDirection: false, waitForTransition: false },
        breakpoints: {
          0:    { spaceBetween: 14 },
          768:  { spaceBetween: 20 },
          1500: { spaceBetween: 24 },
        },
      });
    }
    if (document.querySelector(".our-cert .cert-slide.slide-left")) {
      new Swiper(".our-cert .cert-slide.slide-left", {
        loop: true,
        loopAdditionalSlides: 8,
        speed: 5000,
        slidesPerView: 'auto',
        spaceBetween: 24,
        allowTouchMove: false,
        freeMode: { enabled: true, momentum: false },
        autoplay: { delay: 1, disableOnInteraction: false, reverseDirection: true, waitForTransition: false },
        breakpoints: {
          0:    { spaceBetween: 14 },
          768:  { spaceBetween: 20 },
          1500: { spaceBetween: 24 },
        },
      });
    }

    /* --------------------------------
     * NEWS — 뉴스 스와이퍼
     * -------------------------------- */
    if (document.querySelector(".news-slide")) {
        new Swiper(".news-slide", {
            loop: false,
            speed: 700,
            slidesPerView: 1.3,
            spaceBetween: 14,
            centeredSlides: true,
            centeredSlidesBounds: true,
            navigation: {
                nextEl: ".sec-news .news-next",
                prevEl: ".sec-news .news-prev",
            },
            breakpoints: {
                640:  { slidesPerView: 2.3, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 28 },
                1440: { slidesPerView: 4, spaceBetween: 32 },
            },
        });
    }

    /* --------------------------------
     * NEWS — 유튜브 스와이퍼
     * -------------------------------- */
    if (document.querySelector(".youtube-slide")) {
        new Swiper(".youtube-slide", {
            loop: false,
            speed: 700,
            slidesPerView: 1.3,
            spaceBetween: 14,
            centeredSlides: true,
            centeredSlidesBounds: true,
            navigation: {
                nextEl: ".sec-news .youtube-next",
                prevEl: ".sec-news .youtube-prev",
            },
            breakpoints: {
                640:  { slidesPerView: 2.3, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 28 },
                1440: { slidesPerView: 4, spaceBetween: 32 },
            },
        });
    }
  });

    /* --------------------------------
     * 무료체험 신청 모달
     * -------------------------------- */
    (function initTrialModal() {
        const modal = document.getElementById("trial-modal");
        const form = document.getElementById("trial-form");
        if (!modal) return;

        const openers = document.querySelectorAll("[data-trial-open]");
        const closers = modal.querySelectorAll("[data-trial-close]");

        function open(e) {
            if (e) e.preventDefault();
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("trial-open");
            const first = modal.querySelector('input[name="name"]');
            if (first) setTimeout(() => first.focus(), 50);
        }
        function close() {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("trial-open");
        }

        openers.forEach(el => el.addEventListener("click", open));
        closers.forEach(el => el.addEventListener("click", close));
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) close();
        });


        if (form) {
            form.addEventListener("submit", e => {
                e.preventDefault();
                const fd = new FormData(form);
                const name = (fd.get("name") || "").toString().trim();
                const phone = (fd.get("phone") || "").toString().trim();
                const agree = fd.get("agree");
                if (!name || !phone) {
                    alert("이름과 연락처를 입력해 주세요.");
                    return;
                }
                if (!agree) {
                    alert("개인정보 수집·이용에 동의해 주세요.");
                    return;
                }
                alert("신청이 접수되었습니다. 곧 연락드리겠습니다.");
                form.reset();
                close();
            });
        }
    })();

    /* --------------------------------
     * 인증서 줌 모달
     * -------------------------------- */
    (function initCertModal() {
        const modal = document.getElementById("cert-modal");
        if (!modal) return;
        const img = modal.querySelector(".cert-modal__img");
        const open = (src) => {
            if (!src) return;
            img.src = src;
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("cert-open");
        };
        const close = () => {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("cert-open");
            img.src = "";
        };
        document.querySelectorAll(".our-cert .cert-item").forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const src = item.getAttribute("data-cert") || item.querySelector(".cert-img img")?.getAttribute("src");
                open(src);
            });
        });
        modal.querySelectorAll("[data-cert-close]").forEach(el => el.addEventListener("click", close));
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) close();
        });
    })();

    /* --------------------------------
     * 유튜브 재생 모달
     * -------------------------------- */
    (function initYtModal() {
        const modal = document.getElementById("yt-modal");
        if (!modal) return;
        const iframe = document.getElementById("yt-modal-iframe");
        const open = (id) => {
            if (!id) return;
            iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("yt-open");
        };
        const close = () => {
            iframe.src = "";
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("yt-open");
        };
        document.querySelectorAll(".yt-open[data-yt-id]").forEach(el => {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                open(el.getAttribute("data-yt-id"));
            });
        });
        modal.querySelectorAll("[data-yt-close]").forEach(el => el.addEventListener("click", close));
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) close();
        });
    })();

    /* --------------------------------
     * 히어로 코드 rain (은은한 매트릭스)
     * -------------------------------- */
    (function initCodeRain() {
        const canvas = document.getElementById("code-rain");
        if (!canvas) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const ctx = canvas.getContext("2d");
        const snippets = [
            "def trade(price):",
            "    if signal > 0: buy()",
            "    return profit",
            "import pandas as pd",
            "import numpy as np",
            "df = pd.read_csv('btc.csv')",
            "rsi = compute_rsi(df, 14)",
            "macd, sig = compute_macd(df)",
            "if rsi < 30 and macd > 0:",
            "    order.place('BUY')",
            "elif rsi > 70:",
            "    order.place('SELL')",
            "class Strategy:",
            "    def __init__(self):",
            "        self.pnl = 0.0",
            "    def on_tick(self, t):",
            "        return self.decide(t)",
            "for symbol in universe:",
            "    backtest(symbol)",
            "print(f'PnL = {pnl:.2f}')",
            "async function exec() {",
            "  const data = await fetch(api);",
            "  return data.json();",
            "}",
            "const trade = (p) => p * 1.02;",
            "const pnl = orders.reduce((a,b) => a+b.profit, 0);",
            "if (signal === 'BUY') execute();",
            "while (running) { tick(); }",
            "Promise.all([buy(), sell()]);",
            "try { await order(); } catch(e) {}",
            "console.log('order filled');",
            "ws.on('tick', (t) => engine.run(t));",
            "const sma = data.slice(-20);",
            "BTC/USDT rsi=42 macd=+0.18",
            "{ side: 'buy', qty: 0.05 }",
            "0x4f 0x21 0xa3 0xff",
            "export default Strategy;",
            "let position = null;",
            "git push origin main",
            "pip install ccxt pandas",
        ];

        const fontSize = 14;
        let columns = 0;
        let drops = [];
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let rafId = null;

        const pickSnippet = () => snippets[Math.floor(Math.random() * snippets.length)];

        const makeDrop = () => ({
            y: Math.random() * -120,
            snippet: pickSnippet(),
            idx: 0,
            speed: 0.18 + Math.random() * 0.22,
        });

        function resize() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            columns = Math.floor(rect.width / fontSize);
            drops = new Array(columns).fill(0).map(makeDrop);
        }

        function draw() {
            const rect = canvas.getBoundingClientRect();
            ctx.fillStyle = "rgba(5, 7, 13, 0.04)";
            ctx.fillRect(0, 0, rect.width, rect.height);
            ctx.font = fontSize + "px 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'Roboto', monospace";
            for (let i = 0; i < drops.length; i++) {
                const d = drops[i];
                const ch = d.snippet.charAt(d.idx % d.snippet.length);
                const x = i * fontSize;
                const y = d.y * fontSize;
                const head = Math.random() < 0.08;
                ctx.fillStyle = head ? "rgba(255, 220, 170, 0.95)" : "rgba(255, 138, 61, 0.72)";
                ctx.fillText(ch, x, y);
                d.y += d.speed;
                d.idx += 1;
                if (y > rect.height && Math.random() > 0.985) {
                    d.y = 0;
                    d.snippet = pickSnippet();
                    d.idx = 0;
                }
            }
            rafId = requestAnimationFrame(draw);
        }

        resize();
        draw();
        window.addEventListener("resize", () => {
            if (rafId) cancelAnimationFrame(rafId);
            resize();
            draw();
        });
    })();
