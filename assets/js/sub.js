/* 서브페이지 공통 스크립트 — header/footer 인터랙션, AOS */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        // === 모바일에서 hub-node 애니메이션 방향 통일 (좌/우 → 위) ===
        if (window.matchMedia("(max-width: 1024px)").matches) {
            document.querySelectorAll(".hub-node").forEach(el => {
                el.setAttribute("data-aos", "fade-up");
            });
        }

        // === AOS 초기화 ===
        if (window.AOS) {
            AOS.init({
                duration: 700,
                easing: "ease-out",
                offset: 80,
                once: true,
                mirror: false,
                anchorPlacement: "top-bottom",
            });
        }

        // === 햄버거 메뉴 ===
        const hamburger = document.querySelector(".hamburger");
        const mobileMenu = document.getElementById("mobile-menu");
        const menuDim = document.querySelector(".menu-dim");

        const openMenu = () => {
            if (!mobileMenu) return;
            document.body.classList.add("menu-open");
            mobileMenu.setAttribute("aria-hidden", "false");
            hamburger && hamburger.setAttribute("aria-expanded", "true");
        };
        const closeMenu = () => {
            if (!mobileMenu) return;
            document.body.classList.remove("menu-open");
            mobileMenu.setAttribute("aria-hidden", "true");
            hamburger && hamburger.setAttribute("aria-expanded", "false");
            mobileMenu.querySelectorAll(".m-has-sub.open").forEach(li => {
                li.classList.remove("open");
                const t = li.querySelector(".m-toggle");
                t && t.setAttribute("aria-expanded", "false");
            });
        };
        if (hamburger) {
            hamburger.addEventListener("click", () => {
                const opened = document.body.classList.contains("menu-open");
                opened ? closeMenu() : openMenu();
            });
        }
        if (menuDim) menuDim.addEventListener("click", closeMenu);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && document.body.classList.contains("menu-open")) closeMenu();
        });

        // 모바일 서브메뉴 토글
        document.querySelectorAll(".m-has-sub > .m-toggle").forEach(btn => {
            btn.addEventListener("click", () => {
                const li = btn.parentElement;
                const opened = li.classList.toggle("open");
                btn.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        });

        // 모바일 메뉴 항목 클릭 시 닫기
        if (mobileMenu) {
            mobileMenu.querySelectorAll("a[href]").forEach(a => {
                a.addEventListener("click", () => setTimeout(closeMenu, 100));
            });
        }

        // === 인증서 라이트박스 ===
        const certImgs = document.querySelectorAll(".cert-card img");
        if (certImgs.length) {
            const lb = document.createElement("div");
            lb.className = "lightbox";
            lb.innerHTML = '<button type="button" class="close" aria-label="닫기"><i class="ri-close-line"></i></button><img alt="">';
            document.body.appendChild(lb);
            const lbImg = lb.querySelector("img");
            const close = () => lb.classList.remove("is-open");
            lb.querySelector(".close").addEventListener("click", close);
            lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
            document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
            certImgs.forEach(img => {
                img.parentElement.style.cursor = "zoom-in";
                img.parentElement.addEventListener("click", () => {
                    lbImg.src = img.src;
                    lbImg.alt = img.alt;
                    lb.classList.add("is-open");
                });
            });
        }

        // === 폼 제출 (제휴/문의) ===
        document.querySelectorAll(".sub-form").forEach(form => {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const agree = form.querySelector('input[name="agree"]');
                if (agree && !agree.checked) {
                    alert("개인정보 수집 및 이용에 동의해주세요.");
                    return;
                }
                alert("문의가 정상적으로 접수되었습니다. 빠르게 회신 드리겠습니다.");
                form.reset();
            });
        });

        // === 서브 히어로 드롭다운 ===
        const subSelects = document.querySelectorAll(".sub-select");
        const closeAllSelects = (except) => {
            subSelects.forEach(sel => {
                if (sel === except) return;
                sel.classList.remove("is-open");
                const trg = sel.querySelector(".sub-select__trigger");
                trg && trg.setAttribute("aria-expanded", "false");
            });
        };
        subSelects.forEach(sel => {
            const trigger = sel.querySelector(".sub-select__trigger");
            if (!trigger) return;
            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const opened = sel.classList.toggle("is-open");
                trigger.setAttribute("aria-expanded", opened ? "true" : "false");
                if (opened) closeAllSelects(sel);
            });
        });
        if (subSelects.length) {
            document.addEventListener("click", (e) => {
                if (!e.target.closest(".sub-select")) closeAllSelects();
            });
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") closeAllSelects();
            });
        }

        // === 헤더 스크롤 효과 (메인과 톤 일치) ===
        const header = document.getElementById("header");
        if (header) {
            const onScroll = () => {
                if (window.scrollY > 30) header.classList.add("is-scrolled");
                else header.classList.remove("is-scrolled");
            };
            window.addEventListener("scroll", onScroll, { passive: true });
            onScroll();
        }

        // === 인증서 줌 모달 (인증내역 페이지) ===
        const certModal = document.getElementById("cert-modal");
        if (certModal) {
            const modalImg = certModal.querySelector(".cert-modal__img");
            const open = (src) => {
                if (!src) return;
                modalImg.setAttribute("src", src);
                certModal.classList.add("is-open");
                certModal.setAttribute("aria-hidden", "false");
                document.body.classList.add("cert-open");
            };
            const close = () => {
                certModal.classList.remove("is-open");
                certModal.setAttribute("aria-hidden", "true");
                document.body.classList.remove("cert-open");
                modalImg.setAttribute("src", "");
            };
            document.querySelectorAll(".cert-card").forEach(card => {
                card.addEventListener("click", () => {
                    const src = card.getAttribute("data-cert") || card.querySelector(".cert-card__img img")?.getAttribute("src");
                    open(src);
                });
            });
            certModal.querySelectorAll("[data-cert-close]").forEach(el => el.addEventListener("click", close));
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && certModal.classList.contains("is-open")) close();
            });
        }
    });
})();
