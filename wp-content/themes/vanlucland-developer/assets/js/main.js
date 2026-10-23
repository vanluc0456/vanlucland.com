/**
 * Script cho Website Bất Động Sản (Giao diện chuẩn BDS8)
 * Vanilla JavaScript ES6+
 * Tác giả: AI
 * Ngày: 28-07-2026
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smoothScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    // ==========================================
    // Utilities: Throttle & Debounce
    // ==========================================
    
    // Hàm Throttle (giới hạn tần suất thực thi)
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Hàm Debounce (trì hoãn thực thi)
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            const context = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    };

    // Keep footer groups expanded on desktop and collapsed by default only
    // when the administrator selects the compact accordion layout on mobile.
    const footer = document.getElementById('footer');
    const footerDisclosures = document.querySelectorAll('[data-footer-disclosure]');
    if (footer && footerDisclosures.length > 0) {
        const mobileFooterQuery = window.matchMedia('(max-width: 767px)');
        const syncFooterDisclosures = () => {
            const responsivePreset = document.body.classList.contains('vld-responsive--compact')
                || document.body.classList.contains('vld-responsive--ultra');
            const shouldCollapse = mobileFooterQuery.matches
                && (footer.classList.contains('footer-mobile--accordion') || responsivePreset);
            footerDisclosures.forEach((disclosure) => {
                disclosure.open = !shouldCollapse;
            });
        };

        syncFooterDisclosures();
        if (typeof mobileFooterQuery.addEventListener === 'function') {
            mobileFooterQuery.addEventListener('change', syncFooterDisclosures);
        } else if (typeof mobileFooterQuery.addListener === 'function') {
            mobileFooterQuery.addListener(syncFooterDisclosures);
        }
    }

    // ==========================================
    // 10. Toast Notifications
    // ==========================================
    
    const showToast = (message, type = 'success', duration = 4000) => {
        let toastContainer = document.getElementById('toast-container');
        
        // Tạo container nếu chưa có
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.top = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '9999';
            toastContainer.style.display = 'flex';
            toastContainer.style.flexDirection = 'column';
            toastContainer.style.gap = '10px';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Basic styles for toast (phòng trường hợp CSS không có)
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '4px';
        toast.style.color = '#fff';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.4s ease';
        toast.style.fontFamily = 'Arial, sans-serif';
        toast.style.fontSize = '14px';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.justifyContent = 'space-between';
        
        // Màu sắc theo type
        if (type === 'success') toast.style.backgroundColor = '#4caf50';
        else if (type === 'error') toast.style.backgroundColor = '#f44336';
        else if (type === 'info') toast.style.backgroundColor = '#2196f3';

        const toastMessage = document.createElement('span');
        toastMessage.textContent = String(message);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', 'Đóng thông báo');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = 'background:none;border:none;color:#fff;font-size:20px;cursor:pointer;margin-left:15px;';

        toast.append(toastMessage, closeBtn);

        toastContainer.appendChild(toast);

        // Animation show
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        const removeToast = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 400);
        };

        closeBtn.addEventListener('click', removeToast);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(removeToast, duration);
        }
    };

    // ==========================================
    // 1. Sticky Header
    // ==========================================
    
    const header = document.getElementById('header');
    
    if (header) {
        let isScrolled = false;
        const updateHeader = () => {
            const shouldScroll = window.scrollY > 80;
            if (shouldScroll !== isScrolled) {
                isScrolled = shouldScroll;
                header.classList.toggle('scrolled', isScrolled);
            }
        };
        const handleScroll = throttle(updateHeader, 150);
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Let the browser finish the DOM/CSS writes above before the first
        // geometry-dependent scroll read. This avoids a forced synchronous
        // layout during startup while preserving deep-link/restore behavior.
        requestAnimationFrame(() => {
            requestAnimationFrame(updateHeader);
        });
    }

    // ==========================================
    // 2. Mobile Menu
    // ==========================================
    
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileClose = document.getElementById('mobile-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a');

    const toggleMobileMenu = (forceState) => {
        if (!mobileMenu) return;
        
        const isActive = mobileMenu.classList.contains('active');
        const newState = typeof forceState === 'boolean' ? forceState : !isActive;

        if (newState) {
            mobileMenu.removeAttribute('hidden');
            mobileMenu.removeAttribute('inert');
            mobileMenu.removeAttribute('aria-hidden');
            mobileMenu.classList.add('active');
            mobileMenu.querySelectorAll('a, button, input, select').forEach(el => el.removeAttribute('tabindex'));
            if (mobileOverlay) {
                mobileOverlay.removeAttribute('hidden');
                mobileOverlay.removeAttribute('aria-hidden');
                mobileOverlay.classList.add('active');
            }
            if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            if (mobileClose) mobileClose.focus();
        } else {
            mobileMenu.classList.remove('active');
            mobileMenu.removeAttribute('aria-hidden');
            mobileMenu.setAttribute('inert', '');
            mobileMenu.setAttribute('hidden', '');
            mobileMenu.querySelectorAll('a, button, input, select').forEach(el => el.setAttribute('tabindex', '-1'));
            if (mobileOverlay) {
                mobileOverlay.classList.remove('active');
                mobileOverlay.removeAttribute('aria-hidden');
                mobileOverlay.setAttribute('hidden', '');
            }
            if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            if (isActive && hamburger) hamburger.focus();
        }
    };

    // Ensure initial state is completely inert & hidden on startup
    if (mobileMenu && !mobileMenu.classList.contains('active')) {
        mobileMenu.removeAttribute('aria-hidden');
        mobileMenu.setAttribute('inert', '');
        mobileMenu.setAttribute('hidden', '');
        mobileMenu.querySelectorAll('a, button, input, select').forEach(el => el.setAttribute('tabindex', '-1'));
    }

    if (false && hamburger) {
        hamburger.addEventListener('click', () => toggleMobileMenu());
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', () => toggleMobileMenu(false));
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => toggleMobileMenu(false));
    }

    // Đóng khi click link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    // Bấm ESC để đóng
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    });

    // Resize đóng mobile menu nếu màn hình lớn hơn 768px
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu(false);
        }
    }, 200));

    // ==========================================
    // 3. Hero Slider
    // ==========================================
    
    const heroSlider = document.querySelector('.hero-slider');
    const slidesContainer = document.querySelector('.slides-container');
    const slides = document.querySelectorAll('.slides-container .slide');
    const slidePrev = document.getElementById('slide-prev');
    const slideNext = document.getElementById('slide-next');
    const dotsContainer = document.getElementById('slide-dots');
    const slideToggle = document.getElementById('slide-toggle');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;
        const totalSlides = slides.length;
        const autoplayEnabled = heroSlider ? heroSlider.dataset.autoplay !== 'false' : true;
        const configuredDelay = heroSlider ? Number.parseInt(heroSlider.dataset.delay, 10) : 5000;
        const autoplayDelay = Number.isFinite(configuredDelay)
            ? Math.min(12000, Math.max(3000, configuredDelay))
            : 5000;
        let touchStartX = 0;
        let touchEndX = 0;
        let heroIsVisible = true;
        let pointerIsInside = false;
        let focusIsInside = false;
        let manuallyPaused = false;

        // Tạo dots nếu #slide-dots tồn tại
        let dots = [];
        if (dotsContainer) {
            dotsContainer.innerHTML = ''; // Clear fallback
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = i === 0 ? 'dot active' : 'dot';
                dot.dataset.index = i;
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                if (i === 0) dot.setAttribute('aria-current', 'true');
                dotsContainer.appendChild(dot);
                dots.push(dot);
                
                // Click dot
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetSlideInterval();
                });
            }
        } else {
            dots = document.querySelectorAll('#slide-dots .dot');
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    goToSlide(index);
                    resetSlideInterval();
                });
            });
        }

        // Initialize accessibility attributes on startup
        slides.forEach((slide, idx) => {
            const isAct = (idx === currentSlide);
            slide.setAttribute('aria-hidden', isAct ? 'false' : 'true');
            if (isAct) {
                slide.removeAttribute('inert');
                slide.querySelectorAll('a, button, input').forEach(el => el.removeAttribute('tabindex'));
            } else {
                slide.setAttribute('inert', '');
                slide.querySelectorAll('a, button, input').forEach(el => el.setAttribute('tabindex', '-1'));
            }
        });

                const loadSlideImage = (slide) => {
            if (!slide) return;
            const pic = slide.querySelector('picture[data-hero-deferred]');
            if (pic) {
                pic.querySelectorAll('source[data-srcset]').forEach(s => {
                    s.srcset = s.dataset.srcset;
                    s.removeAttribute('data-srcset');
                });
                const img = pic.querySelector('img[data-src]');
                if (img) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                pic.removeAttribute('data-hero-deferred');
            }
        };

        const goToSlide = (index) => {
            // Xóa active class cũ & vô hiệu hóa focusable elements
            const oldSlide = slides[currentSlide];
            oldSlide.classList.remove('active');
            oldSlide.style.opacity = '0';
            oldSlide.style.zIndex = '1';
            oldSlide.setAttribute('aria-hidden', 'true');
            oldSlide.setAttribute('inert', '');
            oldSlide.querySelectorAll('a, button, input').forEach((el) => {
                el.setAttribute('tabindex', '-1');
            });
            
            if (dots[currentSlide]) {
                dots[currentSlide].classList.remove('active');
                dots[currentSlide].removeAttribute('aria-current');
            }

            // Set index mới
            currentSlide = index;
            if (currentSlide < 0) currentSlide = totalSlides - 1;
            if (currentSlide >= totalSlides) currentSlide = 0;

            // Thêm active class mới & khôi phục focusable elements
            const newSlide = slides[currentSlide];
            newSlide.classList.add('active');
            loadSlideImage(newSlide);
            newSlide.style.opacity = '1';
            newSlide.style.zIndex = '2';
            newSlide.setAttribute('aria-hidden', 'false');
            newSlide.removeAttribute('inert');
            newSlide.querySelectorAll('a, button, input').forEach((el) => {
                el.removeAttribute('tabindex');
            });
            
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add('active');
                dots[currentSlide].setAttribute('aria-current', 'true');
            }
        };

        const nextSlide = () => goToSlide(currentSlide + 1);
        const prevSlide = () => goToSlide(currentSlide - 1);

        // Nút Prev/Next
        if (slideNext) {
            slideNext.addEventListener('click', () => {
                nextSlide();
                resetSlideInterval();
            });
        }

        if (slidePrev) {
            slidePrev.addEventListener('click', () => {
                prevSlide();
                resetSlideInterval();
            });
        }

        // Auto advance
        const stopSlideInterval = () => {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        };

        const startSlideInterval = () => {
            stopSlideInterval();
            if (
                autoplayEnabled
                && !prefersReducedMotion
                && !manuallyPaused
                && !pointerIsInside
                && !focusIsInside
                && totalSlides > 1
                && heroIsVisible
                && !document.hidden
            ) {
                slideInterval = setInterval(nextSlide, autoplayDelay);
            }
        };

        const resetSlideInterval = () => {
            startSlideInterval();
        };

        const updateSlideToggle = () => {
            if (!slideToggle) return;

            const icon = slideToggle.querySelector('i');
            slideToggle.hidden = !autoplayEnabled || prefersReducedMotion || totalSlides < 2;
            slideToggle.setAttribute(
                'aria-label',
                manuallyPaused ? 'Tiếp tục trình chiếu' : 'Tạm dừng trình chiếu'
            );

            if (icon) {
                icon.classList.toggle('fa-pause', !manuallyPaused);
                icon.classList.toggle('fa-play', manuallyPaused);
            }

            if (slidesContainer) {
                slidesContainer.setAttribute('aria-live', manuallyPaused ? 'polite' : 'off');
            }
        };

        updateSlideToggle();
        startSlideInterval();

        if (slideToggle) {
            slideToggle.addEventListener('click', () => {
                manuallyPaused = !manuallyPaused;
                updateSlideToggle();
                if (manuallyPaused) stopSlideInterval();
                else startSlideInterval();
            });
        }

        // Pause while the visitor is reading or interacting with the slider.
        const heroSection = heroSlider || slidesContainer.parentElement;
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                pointerIsInside = true;
                stopSlideInterval();
            });
            heroSection.addEventListener('mouseleave', () => {
                pointerIsInside = false;
                startSlideInterval();
            });
            heroSection.addEventListener('focusin', () => {
                focusIsInside = true;
                stopSlideInterval();
            });
            heroSection.addEventListener('focusout', (event) => {
                if (!heroSection.contains(event.relatedTarget)) {
                    focusIsInside = false;
                    startSlideInterval();
                }
            });

            if ('IntersectionObserver' in window) {
                const heroObserver = new IntersectionObserver((entries) => {
                    heroIsVisible = entries[0].isIntersecting;
                    if (heroIsVisible) startSlideInterval();
                    else stopSlideInterval();
                }, { threshold: 0.01 });
                heroObserver.observe(heroSection);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSlideInterval();
            else startSlideInterval();
        });

        // Touch swipe
        if (slidesContainer) {
            slidesContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            slidesContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        const handleSwipe = () => {
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) {
                // Vuốt trái -> next
                nextSlide();
                resetSlideInterval();
            }
            if (touchEndX > touchStartX + threshold) {
                // Vuốt phải -> prev
                prevSlide();
                resetSlideInterval();
            }
        };
    }

    // ==========================================
    // 4. Project Filter
    // ==========================================
    
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    const projectCards = document.querySelectorAll('.project-card[data-type]');
    const navFilterLinks = document.querySelectorAll('.sub-menu a[data-filter]');

    const filterProjects = (filterType) => {
        if (window.vldFilterProjects) {
            window.vldFilterProjects(filterType, 1, false);
            return;
        }
        // Cập nhật trạng thái active cho nút filter
        filterBtns.forEach(btn => {
            const isActive = btn.dataset.filter === filterType;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        // Lọc project
        projectCards.forEach(card => {
            card.hidden = !(filterType === 'all' || card.dataset.type === filterType);
        });
    };

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filterType = btn.dataset.filter;
                filterProjects(filterType);
            });
        });
    }

    // Nav sub-menu click
    if (navFilterLinks.length > 0) {
        navFilterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filterType = link.dataset.filter;
                
                // Lọc
                filterProjects(filterType);
                
                // Cuộn tới #du-an
                const duAnSection = document.getElementById('du-an');
                if (duAnSection) {
                    duAnSection.scrollIntoView({
                        behavior: smoothScrollBehavior,
                        block: 'start'
                    });
                }
            });
        });
    }

    // ==========================================
    // 5. Scroll Reveal (Intersection Observer)
    // ==========================================
    
    const revealElements = document.querySelectorAll('.section-heading, .project-card, .advisor-wrapper, .news-col, .contact-grid, .footer-col');
    
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback cho trình duyệt không hỗ trợ
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // ==========================================
    // 6. Smooth Scroll & 13. Navbar Active State
    // ==========================================
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Không áp dụng cho các filter links ở trên
            if (this.hasAttribute('data-filter') || this.id === 'slide-prev' || this.id === 'slide-next') return;
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: smoothScrollBehavior,
                    block: 'start'
                });
            }
        });
    });

    // Nav Active State
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu > li > a');

    if ('IntersectionObserver' in window && sections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
                });
            });
        }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // ==========================================
    // 7. Form Validation (Contact)
    // ==========================================

    const contactForm = document.getElementById('contact-form');

    const validatePhone = (phone) => {
        const normalized = String(phone).replace(/[\s.\-()]/g, '');
        return /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/.test(normalized);
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));

    const submitLead = (form, onSuccess) => {
        if (typeof vldData === 'undefined' || !vldData.ajaxUrl || !vldData.nonce) {
            showToast('Biểu mẫu chưa kết nối được với WordPress. Vui lòng gọi hotline.', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        formData.set('action', 'vld_contact');
        formData.set('nonce', vldData.nonce);

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
        }

        fetch(vldData.ajaxUrl, {
            method: 'POST',
            credentials: 'same-origin',
            body: formData
        })
        .then((response) => response.json())
        .then((data) => {
            if (!data.success) {
                throw new Error(data.data && data.data.message ? data.data.message : 'Có lỗi xảy ra');
            }

            showToast(data.data.message, 'success');
            form.reset();
            if (typeof onSuccess === 'function') onSuccess();
        })
        .catch((error) => {
            showToast(error.message || 'Lỗi kết nối, vui lòng thử lại', 'error');
        })
        .finally(() => {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
            }
        });
    };

    if (contactForm) {
        const fName = document.getElementById('f-name');
        const fPhone = document.getElementById('f-phone');
        const fEmail = document.getElementById('f-email');
        
        const errName = document.getElementById('err-name');
        const errPhone = document.getElementById('err-phone');
        const errEmail = document.getElementById('err-email');

        const showError = (input, errorEl, message) => {
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';
                errorEl.style.color = '#f44336';
                errorEl.style.fontSize = '12px';
                errorEl.style.marginTop = '5px';
            }
            if (input) {
                input.style.borderColor = '#f44336';
                input.setAttribute('aria-invalid', 'true');
            }
        };

        const clearError = (input, errorEl) => {
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.style.display = 'none';
            }
            if (input) {
                input.style.borderColor = '#e0e0e0';
                input.removeAttribute('aria-invalid');
            }
        };

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // Name
            if (!fName || !fName.value.trim() || fName.value.trim().length < 2) {
                showError(fName, errName, 'Vui lòng nhập họ tên hợp lệ (ít nhất 2 ký tự)');
                isValid = false;
            } else {
                clearError(fName, errName);
            }

            // Phone
            if (!fPhone || !fPhone.value.trim() || !validatePhone(fPhone.value.trim())) {
                showError(fPhone, errPhone, 'Vui lòng nhập số điện thoại VN hợp lệ');
                isValid = false;
            } else {
                clearError(fPhone, errPhone);
            }

            // Email
            if (!fEmail || !fEmail.value.trim() || !validateEmail(fEmail.value.trim())) {
                showError(fEmail, errEmail, 'Vui lòng nhập email hợp lệ');
                isValid = false;
            } else {
                clearError(fEmail, errEmail);
            }

            if (isValid) {
                submitLead(contactForm);
            } else {
                showToast('Vui lòng kiểm tra lại thông tin', 'error');
                const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
                if (firstInvalid) firstInvalid.focus();
            }
        });

        // Realtime validation clear
        [fName, fPhone, fEmail].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    const errEl = document.getElementById(`err-${input.id.split('-')[1]}`);
                    clearError(input, errEl);
                });
            }
        });
    }

    // ==========================================
    // 8. Counter Animation
    // ==========================================
    
    const counterElements = document.querySelectorAll('[data-count]');
    
    if (counterElements.length > 0) {
        const animateCounter = (el) => {
            const target = +el.getAttribute('data-count');
            if (prefersReducedMotion) {
                el.innerText = target.toLocaleString('vi-VN');
                el.removeAttribute('data-count');
                return;
            }
            const duration = 2000; // 2 seconds
            let start = null;
            el.innerText = '0';

            const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const percentage = Math.min(progress / duration, 1);
                
                // Easing function (easeOutExpo)
                const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
                const currentVal = Math.floor(target * easeOut);
                
                el.innerText = currentVal.toLocaleString('vi-VN');

                if (progress < duration) {
                    window.requestAnimationFrame(step);
                } else {
                    el.innerText = target.toLocaleString('vi-VN');
                }
            };

            window.requestAnimationFrame(step);
            el.removeAttribute('data-count'); // Prevent re-animating
        };

        if ('IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counterElements.forEach(el => counterObserver.observe(el));
        } else {
            counterElements.forEach(el => animateCounter(el));
        }
    }

    // ==========================================
    // 9. Back to Top
    // ==========================================
    
    const backToTop = document.getElementById('back-to-top');
    
    if (backToTop) {
        const footerRegion = document.getElementById('footer');
        const mobileBackToTopQuery = window.matchMedia('(max-width: 767px)');
        let footerIsVisible = false;

        const syncBackToTopFooterState = () => {
            backToTop.classList.toggle(
                'is-footer-overlap',
                footerIsVisible && mobileBackToTopQuery.matches
            );
        };

        if (footerRegion && 'IntersectionObserver' in window) {
            const footerObserver = new IntersectionObserver((entries) => {
                footerIsVisible = entries.some((entry) => entry.isIntersecting);
                syncBackToTopFooterState();
            }, {
                root: null,
                threshold: 0.01
            });
            footerObserver.observe(footerRegion);
        }

        if (typeof mobileBackToTopQuery.addEventListener === 'function') {
            mobileBackToTopQuery.addEventListener('change', syncBackToTopFooterState);
        } else if (typeof mobileBackToTopQuery.addListener === 'function') {
            mobileBackToTopQuery.addListener(syncBackToTopFooterState);
        }

        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, 200), { passive: true });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: smoothScrollBehavior
            });
        });
    }

    // ==========================================
    // 11. Lightbox Popup
    // ==========================================
    
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    const popupForm = document.getElementById('popup-form');
    let lightboxTrigger = null;

    if (lightbox) {
        // Nút mở Popup khi click CTA
        const openPopupBtns = document.querySelectorAll('.cta-promo, [href="#lightbox"]');
        openPopupBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                lightboxTrigger = btn;
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                lightbox.removeAttribute('inert');
                if (lightboxClose) lightboxClose.focus();
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            lightbox.setAttribute('inert', '');
            if (lightboxTrigger) lightboxTrigger.focus();
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        // Click outside
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });

        // Popup form
        if (popupForm) {
            const pName = popupForm.querySelector('input[name="name"]');
            const pPhone = popupForm.querySelector('input[type="tel"]');

            popupForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (pName && pName.value.trim().length >= 2 && pPhone && validatePhone(pPhone.value)) {
                    submitLead(popupForm, closeLightbox);
                } else {
                    showToast('Vui lòng nhập họ tên và số điện thoại hợp lệ', 'error');
                }
            });
        }
    }

    // ==========================================
    // 12. Partner Slider
    // ==========================================
    
    const partnerSlider = document.getElementById('partners-slider');
    
    if (partnerSlider && partnerSlider.dataset.autoplay !== 'no' && !prefersReducedMotion) {
        const partnersCount = partnerSlider.children.length;
        if (partnersCount > 0) {
            const originalPartners = Array.from(partnerSlider.children);
            originalPartners.forEach((partner) => {
                partnerSlider.appendChild(partner.cloneNode(true));
            });
            partnerSlider.classList.add('is-auto-scrolling');

            if ('IntersectionObserver' in window) {
                const partnerObserver = new IntersectionObserver((entries) => {
                    partnerSlider.classList.toggle('is-offscreen', !entries[0].isIntersecting);
                }, { threshold: 0.01 });
                partnerObserver.observe(partnerSlider.closest('.section-partners') || partnerSlider);
            }

            const updatePartnerVisibility = () => {
                document.documentElement.classList.toggle('vld-page-hidden', document.hidden);
            };
            document.addEventListener('visibilitychange', updatePartnerVisibility);
            updatePartnerVisibility();
        }
    }

    // ==========================================
    // 16. Newsletter Form
    // ==========================================
    
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');

            if (emailInput && validateEmail(emailInput.value.trim())) {
                submitLead(newsletterForm);
            } else {
                showToast('Vui lòng nhập email hợp lệ', 'error');
            }
        });
    }

    // ==========================================
    // 17. Search Toggle
    // ==========================================
    
    // Search toggle handled by window.vldToggleSearch

    // ==========================================
    // GA4 & GTM Event Tracking (Calls, Zalo, Leads)
    // ==========================================
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href') || '';

        // Track Hotline Calls
        if (href.startsWith('tel:')) {
            const phone = href.replace('tel:', '');
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'click_hotline', {
                    event_category: 'Contact',
                    event_label: phone,
                    value: 1
                });
            }
            if (window.dataLayer && Array.isArray(window.dataLayer)) {
                window.dataLayer.push({ event: 'click_hotline', phone_number: phone });
            }
        }

        // Track Zalo Clicks
        if (href.includes('zalo.me')) {
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'click_zalo', {
                    event_category: 'Contact',
                    event_label: href,
                    value: 1
                });
            }
            if (window.dataLayer && Array.isArray(window.dataLayer)) {
                window.dataLayer.push({ event: 'click_zalo', target_url: href });
            }
        }
    });


    /* ==========================================================================
     * VLD FAQ ACCORDION ENGINE
     * 1. Single-open accordion behavior for native <details> within .faq-accordion,
     *    .vld-faq-accordion, and #sec-faq.
     * 2. Auto-converts static div .faq-item elements (not using native <details>)
     *    into interactive collapsed-by-default accordions.
     * 3. Auto-converts legacy .faq-box Q&A items into native <details> accordions.
     * ========================================================================== */
    function initVldFaqAccordions() {
        // 1. Single-open accordion behavior for native <details>
        var accordionContainers = document.querySelectorAll('.faq-accordion, .vld-faq-accordion, #sec-faq');
        accordionContainers.forEach(function(container) {
            var detailsList = container.querySelectorAll('details');
            detailsList.forEach(function(detail) {
                detail.addEventListener('toggle', function() {
                    if (this.open) {
                        detailsList.forEach(function(other) {
                            if (other !== detail && other.open) {
                                other.removeAttribute('open');
                            }
                        });
                    }
                });
            });
        });

        // 2. Enhance static div .faq-item elements (not using native <details>)
        var staticFaqItems = document.querySelectorAll('.faq-item:not(details), .vld-faq-item:not(details)');
        staticFaqItems.forEach(function(item) {
            if (item.classList.contains('is-accordion-enhanced')) return;
            item.classList.add('is-accordion-enhanced', 'is-accordion-item');

            var header = item.querySelector('h3, h4, .faq-question');
            if (!header) return;

            var answerElements = [];
            var sibling = header.nextElementSibling;
            while (sibling) {
                answerElements.push(sibling);
                sibling = sibling.nextElementSibling;
            }

            if (answerElements.length === 0) return;

            var trigger = document.createElement('div');
            trigger.className = 'faq-accordion-trigger';
            trigger.innerHTML = '<span>' + header.innerHTML + '</span><span class="faq-accordion-chevron">▾</span>';
            
            var panel = document.createElement('div');
            panel.className = 'faq-accordion-panel';
            panel.style.display = 'none';
            answerElements.forEach(function(el) { panel.appendChild(el); });

            header.remove();
            item.innerHTML = '';
            item.appendChild(trigger);
            item.appendChild(panel);

            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                var isOpen = item.classList.contains('is-accordion-open');
                var parent = item.parentElement;
                if (parent) {
                    parent.querySelectorAll('.is-accordion-open').forEach(function(other) {
                        if (other !== item) {
                            other.classList.remove('is-accordion-open');
                            var otherPanel = other.querySelector('.faq-accordion-panel');
                            if (otherPanel) otherPanel.style.display = 'none';
                        }
                    });
                }

                if (isOpen) {
                    item.classList.remove('is-accordion-open');
                    panel.style.display = 'none';
                } else {
                    item.classList.add('is-accordion-open');
                    panel.style.display = 'block';
                }
            });
        });

        // 3. Enhance .faq-box (Q & A in paragraphs)
        var faqBoxes = document.querySelectorAll('.faq-box');
        faqBoxes.forEach(function(box) {
            if (box.classList.contains('is-accordion-enhanced')) return;
            box.classList.add('is-accordion-enhanced');

            var paragraphs = Array.from(box.querySelectorAll('p'));
            var qaItems = [];

            paragraphs.forEach(function(p) {
                var strong = p.querySelector('strong');
                var em = p.querySelector('em');
                if (strong && (em || p.textContent.indexOf('A:') !== -1)) {
                    var questionText = strong.innerHTML.replace(/^Q\d*:\s*/i, '').trim();
                    var answerHtml = '';
                    if (em) {
                        answerHtml = em.innerHTML.replace(/^A:\s*/i, '').trim();
                    } else {
                        var clone = p.cloneNode(true);
                        var s = clone.querySelector('strong');
                        if (s) s.remove();
                        var br = clone.querySelector('br');
                        if (br) br.remove();
                        answerHtml = clone.innerHTML.replace(/^A:\s*/i, '').trim();
                    }
                    if (questionText && answerHtml) {
                        qaItems.push({ q: questionText, a: answerHtml });
                    }
                }
            });

            if (qaItems.length > 0) {
                var accordionWrap = document.createElement('div');
                accordionWrap.className = 'vld-faq-accordion';
                accordionWrap.style.margin = '10px 0';

                qaItems.forEach(function(item) {
                    var details = document.createElement('details');
                    details.className = 'vld-faq-item';
                    details.innerHTML = '<summary class="vld-faq-summary"><span>' + item.q + '</span></summary>' +
                                        '<div class="vld-faq-answer"><p>' + item.a + '</p></div>';
                    accordionWrap.appendChild(details);
                });

                box.innerHTML = '';
                box.appendChild(accordionWrap);
                box.style.background = 'transparent';
                box.style.border = 'none';
                box.style.padding = '0';
            }
        });
    }

    initVldFaqAccordions();

}); // End DOMContentLoaded
