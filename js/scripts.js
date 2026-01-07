  //<!-- Logo Animation Script -->//
  // Exposed parameters //
  
  let isExpanded = false;
  let toggleExpansion;

  const CFG = {
    windows: {
      sun:       { start: 0.0, end: 1.2 },   
      dots:      { start: 1.2, end: 2.0 },   
      rays:      { start: 0.4, end: 2.0 },   
      waves:     { start: 0.0, end: 3.0 },   
      text:      { start: 0.8, end: 1.8 },   
      mountains: { start: 0.4, end: 3.0 },   
    },
    feels: {
      sun:   { scaleFrom: 0.3, ease: "back.out(1.3)" },
      dots:  { durEach: 0.2 },
      rays:  { scaleFrom: 0, ease: "back.out(1.5)" },
      text:  { riseY: 30 },
      mountains: { baseDur: 1.0 },
    },
    waves: {
      amplitude: 4,
      frequency: 1.5,
      phaseOffset: 0.1,
      ease: "sine.inOut"
    },
    shimmer: {
      duration: 2.8,   // was 1.8
      delay: -0.5,     // was 0.2
      fadeOut: 0.25    // was 0.3
    }
  };

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function playAnimation(){
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    const dots = document.querySelectorAll("#Dots *");
    const rays = document.querySelectorAll("#Rays *");
    const mountainPaths = document.querySelectorAll("#Mountain_Details path");
    const waves = document.querySelectorAll("#Waves path");
    const textGroup = document.querySelector("#Text");
    const shimmerGrad = document.querySelector("#shimmerGradient");
    if (shimmerGrad) {
        shimmerGrad.setAttribute("gradientTransform", "translate(-300, 0)");
        }
    const sunWin = CFG.windows.sun;
    const dotsWin = CFG.windows.dots;
    const raysWin = CFG.windows.rays;
    const wavesWin = CFG.windows.waves;
    const textWin = CFG.windows.text;
    const mtsWin = CFG.windows.mountains;

    // Prep strokes
    mountainPaths.forEach(p=>{
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    // 1) SUN
    tl.from("#Sun", {
      scale: CFG.feels.sun.scaleFrom,
      opacity: 0,
      transformOrigin: "center center",
      duration: (sunWin.end - sunWin.start),
      ease: CFG.feels.sun.ease
    }, sunWin.start);

    // 2) DOTS
    const dotsDurEach = CFG.feels.dots.durEach;
    const dotsCount = dots.length || 1;
    const dotsWindowDur = (dotsWin.end - dotsWin.start);
    const dotsStaggerEach = clamp((dotsWindowDur - dotsDurEach) / Math.max(1, dotsCount - 1), 0.01, 0.12);
    tl.from("#Dots *", {
      scale: 0,
      opacity: 0,
      transformOrigin: "center center",
      duration: dotsDurEach,
      stagger: { each: dotsStaggerEach, from: "center" }
    }, dotsWin.start);

    // 3) RAYS
    tl.from("#Rays *", {
      scale: CFG.feels.rays.scaleFrom,
      opacity: 0,
      transformOrigin: "center center",
      duration: (raysWin.end - raysWin.start),
      ease: CFG.feels.rays.ease
    }, raysWin.start);

    // 4) WAVES
    const wavesWindowDur = (wavesWin.end - wavesWin.start);
    const waveFreq = CFG.waves.frequency;
    const waveAmp = CFG.waves.amplitude;
    const phaseOffset = CFG.waves.phaseOffset;
    const cycles = Math.floor(wavesWindowDur / waveFreq);
    
    waves.forEach((path, i) => {
      const startDelay = wavesWin.start + (i * phaseOffset);
      tl.to(path, {
        y: `+=${waveAmp}`,
        duration: waveFreq / 2,
        ease: CFG.waves.ease,
        yoyo: true,
        repeat: (cycles * 2) - 1,
      }, startDelay);
    });

    // 5) MOUNTAINS
    const mtsCount = mountainPaths.length || 1;
    const mtsWindowDur = (mtsWin.end - mtsWin.start);
    const mtsDurEach = CFG.feels.mountains.baseDur;
    const mtsStaggerEach = clamp((mtsWindowDur - mtsDurEach) / Math.max(1, mtsCount - 1), 0.005, 0.08);
    tl.to("#Mountain_Details path", {
      strokeDashoffset: 0,
      duration: mtsDurEach,
      ease: "power1.inOut",
      stagger: mtsStaggerEach
    }, mtsWin.start);

    // 6) TEXT rise
    tl.fromTo("#Text", 
      {
        attr: { y: 280 + CFG.feels.text.riseY },  // Start lower (345 is your current y position)
        opacity: 0
      },
      {
        attr: { y: 290 },  // End at final position
        opacity: 1,
        duration: (textWin.end - textWin.start),
        ease: "power3.out"
      }, 
      textWin.start)
    
  // ✨ 7) Unified diagonal shimmer across logo (including text)
  .add(() => {
    const fullGroup = document.querySelector("#layer1");
    const shimmerGrad = document.querySelector("#shimmerGradient");
    if (!fullGroup || !shimmerGrad) return;

    const overlay = fullGroup.cloneNode(true);
    overlay.id = "LogoShimmer";
    overlay.style.pointerEvents = "none";
    overlay.style.mixBlendMode = "screen";
    overlay.setAttribute("opacity", "0");

    function stripFills(node) {
      if (node.removeAttribute) {
        node.removeAttribute("fill");
        
        if (node.tagName === "text" && node.style) {
          const currentStyle = node.getAttribute("style") || "";
          const newStyle = currentStyle.replace(/fill:[^;]+;?/g, "");
          node.setAttribute("style", newStyle);
        }
        // For non-text elements, remove style
        else if (node.tagName !== "text") {
          node.removeAttribute("style");
        }
      }
      for (const child of node.children || []) stripFills(child);
    }
    stripFills(overlay);
    
    // Fix waves shimmering backwards
    const overlayWaves = overlay.querySelector("#Waves");
    if (overlayWaves) {
      overlayWaves.setAttribute("transform", "scale(1, 1)");
      const wavePaths = overlayWaves.querySelectorAll("path");
      wavePaths.forEach(path => {
        path.setAttribute("fill", "url(#shimmerGradient)");
        path.style.transform = "scaleX(-1)";
        path.style.transformOrigin = "center";
      });
    }

    overlay.setAttribute("fill", "url(#shimmerGradient)");
    overlay.setAttribute("stroke", "none");
    overlay.setAttribute("filter", "url(#chromeGlow)");

    fullGroup.parentNode.insertBefore(overlay, fullGroup.nextSibling);

    shimmerGrad.setAttribute("gradientTransform", "translate(-500, 0)");

    const passDur = CFG.shimmer.duration;

    const gleam = gsap.timeline({ defaults: { ease: "sine.inOut" } });

    gleam.to(overlay, { opacity: 1, duration: 0.3 }, 0);

    gleam.to(shimmerGrad, {
      attr: { gradientTransform: "translate(1000, 0)" },
      duration: passDur,
      ease: "power1.inOut"
    }, 0);

    gleam.to(overlay, { opacity: 0, duration: 0.4 }, passDur - 0.4);

    gleam.eventCallback("onComplete", () => {
      overlay.remove();
      shimmerGrad.setAttribute("gradientTransform", "translate(-500, 0)");
    });
  }, textWin.end - 0.6);
  }

  window.addEventListener('load', () => setTimeout(playAnimation, 100));

  // Parallax effect on scroll 
    (function() {
    let ticking = false;
    let cachedScrollY = 0;
    
    // Cache DOM queries ONCE
    const hero = document.querySelector('.hero');
    const logo = document.querySelector('#logo');
    const subtitle = document.querySelector('.hero-subtitle');
    
    if (!hero || !logo || !subtitle) return; // bail if elements missing
    
    // Cache measurements that rarely change
    let heroHeight = hero.offsetHeight;
    let isMobile = window.innerWidth <= 768;
    
    function updateParallax() {
        // Only apply parallax within the hero section
        if (cachedScrollY < heroHeight) {
        const progress = cachedScrollY / (heroHeight * 0.6);
        const drift = cachedScrollY * 0.3;
        
        // Apply transforms (batched)
        logo.style.opacity = Math.max(0, 1 - progress);
        logo.style.transform = `translate(8%, -${drift}px)`;
        
        subtitle.style.opacity = Math.max(0, 1 - progress * 1.2);
        subtitle.style.transform = isMobile 
            ? `translateY(-${drift * 0.8}px)` 
            : `translateX(-50%) translateY(-${drift * 0.8}px)`;
        }
        
        ticking = false;
    }
    
    function onScroll() {
        cachedScrollY = window.scrollY;
        
        if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Recache metrics on resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
        heroHeight = hero.offsetHeight;
        isMobile = window.innerWidth <= 768;
        cachedScrollY = window.scrollY;
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateParallax);
        }
        }, 150);
    }, { passive: true });
    })();

(function(){
  function setVHVars(){
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
    const dvh = Math.max(1, window.innerHeight) * 0.01;
    document.documentElement.style.setProperty('--dvh', dvh + 'px');
  }
  setVHVars();
  window.addEventListener('resize', setVHVars, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(setVHVars, 80);
  }, { passive: true });
})();

    // Version banner
    (function(){
      const v = document.documentElement.getAttribute('data-version') || 'dev';
      const msg = `Website_portfolio_v${v} loaded`;
      console.log('%c ' + msg + ' ', 'background: #222; color: #0ff; padding: 4px 8px; border-radius: 4px;');
    })();

  
  let lightboxData = {}; // Empty placeholder until loaded

  // Fetch the data on load
  document.addEventListener("DOMContentLoaded", async function() {
      try {
          const response = await fetch('js/lightbox-data.json');
          if (!response.ok) throw new Error('Failed to load lightbox data');
          lightboxData = await response.json();
          console.log('Lightbox data loaded successfully!');
          
          // ✅ Initialize thumbnail hover preloading
          initThumbnailPreloading();
          initSmartZoom();
      } catch (error) {
          console.error('Error loading lightbox data:', error);
      }
  });

  /* ==== UNIFIED PAGE NAVIGATION ==== */
  let lastScrollPosition = 0;

  function navigateToPage(pageId) {
      const backBtn = document.getElementById('globalBackBtn');
      const currentPage = document.querySelector('.page.active');
      const newPage = document.getElementById(pageId);
      const fadeLayer = document.getElementById('page-fade');

      // Close any open lightbox
      const lightbox = document.getElementById('lightbox');
      if (lightbox && lightbox.classList.contains('active')) {
          closeLightbox();
      }

      // ✅ Save WINDOW scroll position if leaving home
      if (currentPage && currentPage.id === 'home' && pageId !== 'home') {
          lastScrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          console.log('💾 Saved home scroll position:', lastScrollPosition);
      }

      // --- Fade curtain ON if changing page ---
      if (currentPage && currentPage.id !== pageId) {
          fadeLayer.classList.add('active');
      }

      setTimeout(() => {
          // --- Page Transition Logic ---
          if (currentPage && currentPage.id !== pageId) {
              currentPage.classList.remove('active');
              currentPage.style.display = 'none';
          }

          if (newPage && (!currentPage || currentPage.id !== pageId)) {
              newPage.style.display = 'block';
              requestAnimationFrame(() => {
                  newPage.classList.add('active');
                  // Initialize lazy media for this page only
                  if (newPage && newPage.classList.contains('page')) {
                      initLazyForProjectPage(newPage);
                  }
              });
          }

          // --- Handle button + scroll logic ---
          if (pageId === 'home') {
              if (backBtn) {
                  backBtn.classList.remove('visible');
                  setTimeout(() => (backBtn.style.display = 'none'), 400);
              }

              // ✅ Restore scroll position IMMEDIATELY while curtain is still active
              setTimeout(() => {
                  window.scrollTo({ top: lastScrollPosition, behavior: 'instant' });
                  console.log('🔙 Restored home scroll to:', lastScrollPosition);
              }, 10);

          } else {
              if (backBtn) {
                  backBtn.style.display = 'block';
                  setTimeout(() => backBtn.classList.add('visible'), 400);
              }
              if (newPage) newPage.scrollTop = 0;
          }

          // --- Fade curtain OFF ---
          if (currentPage && currentPage.id !== pageId) {
              setTimeout(() => fadeLayer.classList.remove('active'), 500);
          }
      }, currentPage && currentPage.id !== pageId ? 400 : 0);
  }

  let currentLightboxId = null;
  let currentCategory = null;
  let categoryItems = [];
  let currentIndex = 0;
  let currentMediaIndex = 0;
  const categoriesWithTabs = ['3d-work','scripts','industrial','graphic', 'art', 'project'];

  // Bulletproof body lock (prevents background scroll + preserves position)
  let __bodyLockScrollY = 0;

  function lockBody() {
      if (document.body.classList.contains('is-locked')) return;
      __bodyLockScrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${__bodyLockScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.classList.add('lightbox-open', 'is-locked');
  }

  function unlockBody() {
      if (!document.body.classList.contains('is-locked')) return;
      const y = __bodyLockScrollY;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.classList.remove('lightbox-open', 'is-locked');
      
      // Force instant scroll restoration 
      requestAnimationFrame(() => {
          const htmlEl = document.documentElement;
          const originalBehavior = htmlEl.style.scrollBehavior;
          htmlEl.style.scrollBehavior = 'auto';
          window.scrollTo(0, y);
          htmlEl.style.scrollBehavior = originalBehavior;
      });
  }

  /* ==== CLOUDINARY OPTIMIZATION HELPERS ==== */
  function cld(publicId, w, q = 'q_auto') {
      const cleanId = publicId.replace(/^\/+/, '');
      // ✅ Removed hardcoded version—Cloudinary serves latest automatically
      return `https://res.cloudinary.com/dlepppgm2/image/upload/f_auto,${q},w_${w},dpr_auto,c_limit/${cleanId}`;
  }

  function pickWidth() {
      const dpr = window.devicePixelRatio || 1;
      const target = Math.min(window.innerWidth * dpr, 3840);
      const widths = [800, 1200, 1600, 2000, 2560, 3200, 3840];
      return widths.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a));
  }

  function prefetch(url) {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = url;
  }

  function optimizeImageSrc(originalSrc) {
      if (originalSrc.includes('res.cloudinary.com')) {
          const match = originalSrc.match(/\/v\d+\/(.+)$/);
          if (match) {
              const publicId = match[1];
              const w = pickWidth();
              const q = w >= 2560 ? 'q_auto:eco' : 'q_auto';
              return cld(publicId, w, q);
          }
          return originalSrc;
      }
      
      const w = pickWidth();
      const q = w >= 2560 ? 'q_auto:eco' : 'q_auto';
      return cld(originalSrc, w, q);
  }

  function prefetchNeighbors(data) {
      const w = pickWidth();
      const q = w >= 2560 ? 'q_auto:eco' : 'q_auto';
      
      // Prefetch prev/next media in current item
      if (data.media && data.media.length > 1) {
          const prevIdx = (currentMediaIndex - 1 + data.media.length) % data.media.length;
          const nextIdx = (currentMediaIndex + 1) % data.media.length;
          
          [prevIdx, nextIdx].forEach(idx => {
              const media = data.media[idx];
              if (media.type === 'image') {
                  prefetch(cld(media.src, w, q));
              }
          });
      }
      
      // Prefetch prev/next items in category
      if (categoryItems.length > 1) {
          const prevItemIdx = (currentIndex - 1 + categoryItems.length) % categoryItems.length;
          const nextItemIdx = (currentIndex + 1) % categoryItems.length;
          
          [prevItemIdx, nextItemIdx].forEach(idx => {
              const itemId = categoryItems[idx];
              const itemData = lightboxData[itemId];
              if (itemData && itemData.media && itemData.media[0]) {
                  const media = itemData.media[0];
                  if (media.type === 'image') {
                      prefetch(cld(media.src, w, q));
                  }
              }
          });
      }
  }

  /* ==== ✨ NEW: THUMBNAIL HOVER PRELOADING ==== */
  function initThumbnailPreloading() {
      document.querySelectorAll('[data-lightbox-id]').forEach(thumb => {
          thumb.addEventListener('mouseenter', () => {
              const projectKey = thumb.getAttribute('data-lightbox-id');
              preloadProjectHero(projectKey);
          }, { once: false, passive: true });
      });
  }

  function preloadProjectHero(projectKey) {
      const project = lightboxData[projectKey];
      if (!project || !project.media || !project.media[0]) return;
      
      const firstMedia = project.media[0];
      if (firstMedia.type === 'image') {
          const w = pickWidth();
          const q = w >= 2560 ? 'q_auto:eco' : 'q_auto';
          prefetch(cld(firstMedia.src, w, q));
      }
  }

  function optimizeVideoSrc(publicId) {
    // Strip any existing extension
    const cleanId = publicId.replace(/\.(ts|mp4|mov|avi)$/i, '');
    return `https://res.cloudinary.com/dlepppgm2/video/upload/f_auto,q_auto/${cleanId}.mp4`;
  }

  /* ==== OPEN / UPDATE LIGHTBOX ==== */
  function openLightbox(itemId, startMediaIndex = 0) {
      const data = lightboxData[itemId];
      if (!data) return;
      
      // ✅ Clear stale content IMMEDIATELY
      const imgEl = document.getElementById('lightbox-image');
      const videoEl = document.getElementById('lightbox-video');
      const iframeEl = document.getElementById('lightbox-iframe');
      
      imgEl.style.opacity = '0';
      imgEl.src = '';
      videoEl.style.display = 'none';
      videoEl.pause();
      videoEl.querySelector('source').src = '';
      if (iframeEl) {
          iframeEl.style.display = 'none';
          iframeEl.src = '';
      }
      
      currentLightboxId = itemId;
      currentCategory = data.category || null;
      currentMediaIndex = startMediaIndex;

      // Gather same-category items for prev/next navigation
      categoryItems = Object.keys(lightboxData).filter(id => (lightboxData[id].category || '') === (currentCategory || ''));
      currentIndex = categoryItems.indexOf(itemId);

      updateLightboxContent(data);

      const tabsContainer = document.getElementById('lightbox-tabs');
      const subCarousel = document.getElementById('lightbox-sub-carousel');
      
      // show tabs for categoriesWithTabs
      if (categoriesWithTabs.includes(currentCategory)) {
          tabsContainer.style.display = 'flex';
          updateTabContent(data); // ⬅️ This function needs updating
          
          // Default to description tab
          document.querySelectorAll('.lightbox-tab').forEach(t=>t.classList.remove('active'));
          document.querySelectorAll('.lightbox-tab')[0]?.classList.add('active');
          document.querySelectorAll('.lightbox-tab-content').forEach(c=>c.classList.remove('active'));
          document.getElementById('tab-description').classList.add('active');
          
          // show subcarousel if multiple media items
          if (data.media && data.media.length > 1) {
              subCarousel.style.display = 'flex';
              populateSubCarousel(data.media);
          } else {
              subCarousel.style.display = 'none';
              subCarousel.innerHTML = '';
          }
      } else {
          tabsContainer.style.display = 'none';
          subCarousel.style.display = 'none';
          subCarousel.innerHTML = '';
      }
      
      const prevBtn = document.querySelector('.lightbox-prev');
      const nextBtn = document.querySelector('.lightbox-next');
      // Hide arrows for "project" category entirely
      if (currentCategory === 'project') { 
          prevBtn.classList.add('hidden'); 
          nextBtn.classList.add('hidden'); 
      } else if (categoryItems.length <= 1) {
          prevBtn.classList.add('hidden'); 
          nextBtn.classList.add('hidden'); 
      } else { 
          prevBtn.classList.remove('hidden'); 
          nextBtn.classList.remove('hidden'); 
      }
      
      const lightbox = document.getElementById('lightbox');
      lightbox.style.display = 'flex';
      setTimeout(()=> lightbox.classList.add('active'), 10);
      lockBody();
      
      // 🚀 Prefetch neighbors after opening
      setTimeout(() => prefetchNeighbors(data), 100);
  }

function updateLightboxContent(data) {
    resetZoom();
    const currentMedia = data.media[currentMediaIndex];
    const imageEl = document.getElementById('lightbox-image');
    const videoEl = document.getElementById('lightbox-video');

    document.getElementById('lightbox-title').textContent = currentMedia.title || data.title || '';
    document.getElementById('lightbox-description').textContent = currentMedia.description || data.description || '';

    // 🎬 YouTube embed
    if (currentMedia.type === 'youtube') {
        imageEl.style.display = 'none';
        videoEl.style.display = 'none';
        
        let iframeEl = document.getElementById('lightbox-iframe');
        if (!iframeEl) {
            iframeEl = document.createElement('iframe');
            iframeEl.id = 'lightbox-iframe';
            iframeEl.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            videoEl.parentElement.appendChild(iframeEl);
        }
        iframeEl.style.display = 'block';
        iframeEl.src = `https://www.youtube.com/embed/${currentMedia.videoId}?autoplay=0`;
    }
    // 🎬 Vimeo embed
    else if (currentMedia.type === 'vimeo') {
        imageEl.style.display = 'none';
        videoEl.style.display = 'none';
        
        let iframeEl = document.getElementById('lightbox-iframe');
        if (!iframeEl) {
            iframeEl = document.createElement('iframe');
            iframeEl.id = 'lightbox-iframe';
            iframeEl.allow = 'autoplay; fullscreen; picture-in-picture';
            videoEl.parentElement.appendChild(iframeEl);
        }
        iframeEl.style.display = 'block';
        iframeEl.src = `https://player.vimeo.com/video/${currentMedia.videoId}?autoplay=0`;
    }
    // 📄 PDF embed
    else if (currentMedia.type === 'pdf') {
        imageEl.style.display = 'none';
        videoEl.style.display = 'none';
        
        let iframeEl = document.getElementById('lightbox-iframe');
        if (!iframeEl) {
            iframeEl = document.createElement('iframe');
            iframeEl.id = 'lightbox-iframe';
            videoEl.parentElement.appendChild(iframeEl);
        }
        iframeEl.style.display = 'block';
        iframeEl.src = currentMedia.src;
    }
    // 🎥 Regular video
    else if (currentMedia.type === 'video') {
        imageEl.style.display = 'none';
        videoEl.style.display = 'block';
        const iframeEl = document.getElementById('lightbox-iframe');
        if (iframeEl) iframeEl.style.display = 'none';
        
        const videoSrc = optimizeVideoSrc(currentMedia.src);
        videoEl.querySelector('source').src = videoSrc;
        
        // ⬅️ Set poster/thumbnail if available
        if (currentMedia.thumb) {
            videoEl.poster = getVideoThumb(currentMedia);
        }
        
        videoEl.load();
    }
    // 🖼️ Image (default) — ✅ NOW WITH LOADING STATE
    else {
        if (!videoEl.paused) videoEl.pause();
        videoEl.style.display = 'none';
        const iframeEl = document.getElementById('lightbox-iframe');
        if (iframeEl) iframeEl.style.display = 'none';
        
        // ✅ Show loading state
        imageEl.style.opacity = '0.3';
        imageEl.style.filter = 'blur(10px)';
        imageEl.style.display = 'block';
        
        // ✅ Preload then swap
        const newSrc = optimizeImageSrc(currentMedia.src);
        const tempImg = new Image();
        tempImg.onload = () => {
            imageEl.src = newSrc;
            imageEl.alt = currentMedia.title || '';
            imageEl.style.opacity = '1';
            imageEl.style.filter = 'none';
        };
        tempImg.onerror = () => {
            // Fallback if image fails
            imageEl.style.opacity = '1';
            imageEl.style.filter = 'none';
        };
        tempImg.src = newSrc;
        
        imageEl.loading = 'eager';
        imageEl.decoding = 'async';
        imageEl.fetchPriority = 'high';
    }

    // 🔑 Reset track after loading new media
    const track = document.querySelector('.lightbox-track');
    if (track) {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        setTimeout(() => {
            track.style.transition = '';
        }, 20);
    }
    
    // ✅ Show/hide fullscreen navigation arrows based on subcarousel
    const fullscreenArrows = document.getElementById('fullscreen-nav-arrows');
    if (fullscreenArrows) {
        if (data.media && data.media.length > 1) {
            fullscreenArrows.style.display = 'block';
        } else {
            fullscreenArrows.style.display = 'none';
        }
    }
    
    // 🚀 Prefetch neighbors after switching media
    setTimeout(() => prefetchNeighbors(data), 100);
}

function getVideoThumb(media) {
    if (media.thumb) {
        return media.thumb; // Use custom thumb if provided
    }
    // If it's a Cloudinary video URL, generate a larger thumbnail
    if (media.src && media.src.includes('cloudinary.com')) {
        // Extract the video path and generate a proper thumbnail
        return media.src.replace('/video/upload/', '/video/upload/f_auto,q_auto:best,w_1200,so_0/')
                       .replace('.mp4', '.jpg');
    }
    return 'https://placehold.co/800x450/1a1a1a/666?text=Video';
}

function populateSubCarousel(mediaItems) {
    const subCarousel = document.getElementById('lightbox-sub-carousel');
    subCarousel.innerHTML = '';
    mediaItems.forEach((media, idx) => {
        const item = document.createElement('div');
        item.className = 'sub-carousel-item' + (idx === currentMediaIndex ? ' active' : '');
        
        if (media.type === 'video') {
            const thumbSrc = getVideoThumb(media);
            item.innerHTML = `<img src="${thumbSrc}" alt="${(media.title||'')}" loading="lazy" /><div class="play-icon">▶</div>`;
        } else if (media.type === 'youtube' || media.type === 'vimeo') {
            const thumbSrc = media.thumb || 'https://placehold.co/800x450/1a1a1a/666?text=Video';
            item.innerHTML = `<img src="${thumbSrc}" alt="${(media.title||'')}" loading="lazy" /><div class="play-icon">▶</div>`;
        } else if (media.type === 'pdf') {
            const thumbSrc = media.thumb || 'https://placehold.co/800x450/1a1a1a/666?text=PDF';
            item.innerHTML = `<img src="${thumbSrc}" alt="${(media.title||'')}" loading="lazy" /><div class="play-icon">📄</div>`;
        } else {
            item.innerHTML = `<img src="${media.thumb}" alt="${(media.title||'')}" loading="lazy" />`;
        }
        
        item.onclick = () => switchMedia(idx);
        subCarousel.appendChild(item);
    });
}

  function switchMedia(mediaIndex) {
      const data = lightboxData[currentLightboxId];
      currentMediaIndex = mediaIndex;

      document.querySelectorAll('.sub-carousel-item').forEach((it, i) => {
          it.classList.toggle('active', i === mediaIndex);
      });

      const imageEl = document.getElementById('lightbox-image');
      const videoEl = document.getElementById('lightbox-video');
      imageEl.style.opacity = '0.5'; 
      videoEl.style.opacity = '0.5';
      setTimeout(()=> { 
          updateLightboxContent(data); 
          imageEl.style.opacity = '1'; 
          videoEl.style.opacity = '1'; 
      }, 150);
  }

  function updateTabContent(data) {
      // Update details
      if (data.details) document.getElementById('lightbox-details').textContent = data.details;
      
      // Check if links exist
      const hasLinks = data.links && data.links.length > 0;
      
      // Get the Links tab button and content
      const linksTabButton = document.querySelector('.lightbox-tab[onclick*="links"]');
      const linksTabContent = document.getElementById('tab-links');
      const linksContainer = document.getElementById('lightbox-links');
      
      // Show/hide Links tab based on whether links exist
      if (hasLinks) {
          linksTabButton.style.display = 'inline-block';
          // DON'T force display:block here - let the tab switching handle it
          
          // Populate links
          linksContainer.innerHTML = '';
          data.links.forEach(l => {
              const a = document.createElement('a');
              a.href = l.url;
              a.textContent = l.text;
              a.className = 'lightbox-link';
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              linksContainer.appendChild(a);
          });
      } else {
          // Hide the Links tab and content
          linksTabButton.style.display = 'none';
          linksTabContent.classList.remove('active'); // Remove active class if it has it
          linksContainer.innerHTML = '';
      }
  }

  function switchLightboxTab(tabName, el) {
      document.querySelectorAll('.lightbox-tab').forEach(t => t.classList.remove('active'));
      if (el) el.classList.add('active');

      document.querySelectorAll('.lightbox-tab-content').forEach(c => c.classList.remove('active'));
      const target = document.getElementById('tab-' + tabName);
      if (target) target.classList.add('active');
  }

  function closeLightbox() {
      return new Promise(resolve => {
          const lightbox  = document.getElementById('lightbox');
          const fadeLayer = document.getElementById('page-fade');
          const imageEl   = document.getElementById('lightbox-image');
          const videoEl   = document.getElementById('lightbox-video');
          const mediaContainer = document.querySelector('.lightbox-media-container');

          // ✅ Curtain ON first
          fadeLayer.classList.add('active');

          // ✅ Wait for fade to fully cover
          setTimeout(() => {
              if (imageEl) imageEl.style.display = 'none';
              if (videoEl) {
                  videoEl.style.display = 'none';
                  videoEl.pause();
                  videoEl.querySelector('source').src = '';
                  videoEl.load();
              }

              // 🧹 Clean up iframe
              const iframeEl = document.getElementById('lightbox-iframe');
              if (iframeEl) {
                  iframeEl.style.display = 'none';
                  iframeEl.src = '';
              }

              lightbox.style.display = 'none';
              lightbox.classList.remove('active');
              lightbox.classList.remove('expanded-mode');
              if (mediaContainer) mediaContainer.classList.remove('expanded');

              unlockBody();

              setTimeout(() => {
                  requestAnimationFrame(() => {
                      document.body.offsetHeight;
                      requestAnimationFrame(() => {
                          fadeLayer.classList.remove('active');
                          resolve();
                      });
                  });
              }, 50);

          }, 300);
      });
  }

  // Block wheel/touch from bubbling to page while lightbox is open
  (function attachLightboxScrollGuards() {
      const lb = document.getElementById('lightbox');
      if (!lb) return;

      const blockWheel = e => {
          if (e.target.closest('.lightbox-info')) return;
          e.preventDefault();
      };

      function enableGuards() {
          lb.addEventListener('wheel', blockWheel, { passive: false });
      }
      
      function disableGuards() {
          lb.removeEventListener('wheel', blockWheel);
      }

      const observer = new MutationObserver(() => {
          if (lb.classList.contains('active')) enableGuards(); 
          else disableGuards();
      });
      observer.observe(lb, { attributes: true, attributeFilter: ['class'] });

      if (lb.classList.contains('active')) enableGuards();
  })();

  function navigateLightbox(direction) {
      if (!categoryItems || categoryItems.length <= 1) return;

      // ✅ Clear video BEFORE navigating
      const videoEl = document.getElementById('lightbox-video');
      const iframeEl = document.getElementById('lightbox-iframe');
      if (videoEl) {
          videoEl.pause();
          videoEl.querySelector('source').src = '';
          videoEl.load();
          videoEl.style.display = 'none';
      }
      if (iframeEl) {
          iframeEl.src = '';
          iframeEl.style.display = 'none';
      }

      currentIndex += direction;
      if (currentIndex >= categoryItems.length) currentIndex = 0;
      if (currentIndex < 0) currentIndex = categoryItems.length - 1;
      const newId = categoryItems[currentIndex];
      const data = lightboxData[newId];
      currentLightboxId = newId;
      currentMediaIndex = 0;

      const imageEl = document.getElementById('lightbox-image');
      imageEl.style.opacity='0.5'; 
      
      setTimeout(()=> {
          updateLightboxContent(data);
          
          // ✅ ALWAYS re-evaluate tabs/subcarousel visibility
          const tabsContainer = document.getElementById('lightbox-tabs');
          const subCarousel = document.getElementById('lightbox-sub-carousel');
          
          // ✅ ALWAYS show tabs for categoriesWithTabs
          if (categoriesWithTabs.includes(data.category)) {
              tabsContainer.style.display = 'flex';
              updateTabContent(data);
              
              // ✅ Only show subcarousel if multiple media items
              if (data.media && data.media.length > 1) {
                  subCarousel.style.display = 'flex';
                  populateSubCarousel(data.media);
              } else {
                  subCarousel.style.display = 'none';
                  subCarousel.innerHTML = '';
              }
          } else {
              tabsContainer.style.display = 'none';
              subCarousel.style.display = 'none';
              subCarousel.innerHTML = '';
          }
          
          imageEl.style.opacity='1'; 
      }, 150);
  }

function addLightboxSwipeSupport() {
    const lightboxContent = document.querySelector('.lightbox-content');
    const container = document.querySelector('.lightbox-media-container');
    const track = container?.querySelector('.lightbox-track');
    if (!lightboxContent || !container || !track) return;

    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let isDragging = false;
    let isHorizontalSwipe = null;

    lightboxContent.addEventListener('touchstart', e => {
        if (e.touches.length > 1) return;
        
        const target = e.target;
        if (target.closest('.lightbox-nav') || 
            target.closest('.lightbox-close') || 
            target.closest('.lightbox-tabs') || 
            target.closest('.lightbox-tab') ||
            target.closest('#lightbox-sub-carousel') ||
            target.closest('.lightbox-info')) {
            return;
        }
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        deltaX = 0;
        deltaY = 0;
        isDragging = true;
        isHorizontalSwipe = null;
        track.style.transition = 'none';
    }, { passive: true });  // ⬅️ Passive for better perf

    lightboxContent.addEventListener('touchmove', e => {
        if (!isDragging || e.touches.length > 1) return;
        
        deltaX = e.touches[0].clientX - startX;
        deltaY = e.touches[0].clientY - startY;
        
        if (isHorizontalSwipe === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
            isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        }

        // Show visual feedback for ALL horizontal swipes
        if (isHorizontalSwipe) {
            track.style.transform = `translateX(${deltaX}px)`;
            e.preventDefault();
        }
    }, { passive: false });  

    lightboxContent.addEventListener('touchend', () => {
        if (!isDragging) return;
        
        const threshold = container.offsetWidth * 0.25;
        const subCarousel = document.getElementById('lightbox-sub-carousel');
        const isSubCarouselVisible = subCarousel && subCarousel.style.display !== 'none';
        
        track.style.transition = 'transform 0.3s ease';

        if (isHorizontalSwipe && isSubCarouselVisible && Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                track.style.transform = `translateX(${container.offsetWidth}px)`;
                setTimeout(() => navigateSubCarousel(-1), 300);
            } else {
                track.style.transform = `translateX(-${container.offsetWidth}px)`;
                setTimeout(() => navigateSubCarousel(1), 300);
            }
        } else if (!isSubCarouselVisible && isHorizontalSwipe && Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                navigateLightbox(-1);
            } else {
                navigateLightbox(1);
            }
            track.style.transform = 'translateX(0)';
        } else {
            track.style.transform = 'translateX(0)';
        }

        isDragging = false;
        isHorizontalSwipe = null;
        startX = startY = deltaX = deltaY = 0;
    }, { passive: true });  
}

function navigateSubCarousel(direction) {
    if (!currentLightboxId || !lightboxData[currentLightboxId] || !lightboxData[currentLightboxId].media) return;

    const media = lightboxData[currentLightboxId].media;
    if (media.length <= 1) return;

    // ✅ Clear video BEFORE navigating within subcarousel
    const videoEl = document.getElementById('lightbox-video');
    const iframeEl = document.getElementById('lightbox-iframe');
    if (videoEl) {
        videoEl.pause();
        videoEl.querySelector('source').src = '';
        videoEl.load();
        videoEl.style.display = 'none';
    }
    if (iframeEl) {
        iframeEl.src = '';
        iframeEl.style.display = 'none';
    }

    currentMediaIndex += direction;
    if (currentMediaIndex >= media.length) currentMediaIndex = 0;
    if (currentMediaIndex < 0) currentMediaIndex = media.length - 1;

    setTimeout(() => {
        updateLightboxContent(lightboxData[currentLightboxId]);
        if (categoriesWithTabs.includes(lightboxData[currentLightboxId].category)) {
            populateSubCarousel(media);
            updateTabContent(lightboxData[currentLightboxId]);
        }
    }, 10);
}

/* ==== Keyboard & click handling ==== */
let escPressed = false; 

document.addEventListener('keydown', function(e) {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('active')) {
        const subCarousel = document.getElementById('lightbox-sub-carousel');
        const isSubCarouselVisible = subCarousel && subCarousel.style.display !== 'none';

        switch(e.key) {
            case 'Escape':
                if (escPressed) return; 
                escPressed = true;
                
                if (isExpanded) {
                    toggleExpansion(); // ESC1: Contract
                } else {
                    closeLightbox(); // ESC2: Close lightbox
                }
                
                // Reset flag after a short delay
                setTimeout(() => { escPressed = false; }, 400);
                break;
            case ' ': 
                e.preventDefault();
                const videoEl = document.getElementById('lightbox-video');
                if (videoEl && videoEl.style.display !== 'none') {
                    videoEl.paused ? videoEl.play() : videoEl.pause();
                }
                break;
            case 'ArrowLeft': 
                e.preventDefault(); 
                isSubCarouselVisible ? navigateSubCarousel(-1) : navigateLightbox(-1);
                break;
            case 'ArrowRight': 
                e.preventDefault(); 
                isSubCarouselVisible ? navigateSubCarousel(1) : navigateLightbox(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentMediaIndex > 0) switchMedia(currentMediaIndex - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const data = lightboxData[currentLightboxId];
                if (data && data.media && currentMediaIndex < data.media.length - 1) switchMedia(currentMediaIndex + 1);
                break;
            case 'PageDown':
            case 'PageUp':
            case 'Home':
            case 'End':
                e.preventDefault();
                break;
        }
    }
});

/* ==== SMART ZOOM SYSTEM (UPDATED) ==== */
let zoomState = {
    scale: 1,
    dist: 0,
    isPinching: false // 🚩 New flag to track gesture
};

function initSmartZoom() {
    const img = document.getElementById('lightbox-image');
    if (!img) return;

    let snapTimeout;

    const updateTransform = () => {
        img.style.transform = `scale(${zoomState.scale})`;
    };

    // 1. TOUCH START
    img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            zoomState.isPinching = true; // 🚩 We are starting a pinch
            zoomState.dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            clearTimeout(snapTimeout);
            img.style.transition = 'none';
        }
    }, { passive: false });

    // 2. TOUCH MOVE
    img.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            // zoomState.isPinching is already true
            const newDist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const scaleChange = newDist / zoomState.dist;
            zoomState.scale = Math.max(1, zoomState.scale * scaleChange);
            zoomState.dist = newDist;
            updateTransform();
        }
    }, { passive: false });

    // 3. TOUCH END
    img.addEventListener('touchend', (e) => {
        // 🚩 CRITICAL FIX: If we were pinching, STOP this event from reaching the double-tap detector
        if (zoomState.isPinching) {
            e.stopPropagation();
        }

        // If fingers are lifted (less than 2 touching)
        if (e.touches.length < 2) {
            
            // If ALL fingers are gone, reset the pinching flag
            if (e.touches.length === 0) {
                // Small delay to ensure double-tap logic doesn't fire on the very last lift
                setTimeout(() => { zoomState.isPinching = false; }, 50);
            }

            clearTimeout(snapTimeout);
            snapTimeout = setTimeout(() => {
                img.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                zoomState.scale = 1;
                updateTransform();
            }, 600);
        }
    });
    
    // Safety: Reset flag if gesture is cancelled
    img.addEventListener('touchcancel', () => {
        zoomState.isPinching = false;
    });
}

// Helper to reset zoom when changing slides
function resetZoom() {
    const img = document.getElementById('lightbox-image');
    if (img) {
        zoomState.scale = 1;
        img.style.transition = 'none';
        img.style.transform = 'scale(1)';
        zoomState.isPinching = false;
    }
}

/* ==== Click outside to close ==== */
document.getElementById('lightbox').addEventListener('click', function(e) {
    // Only close if clicking the lightbox background itself, not its children
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// Mobile swipe: velocity-aware snapping + optional one-item paging + edge easing
function initMobileNudge() {
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  // Feel knobs
  const ONE_ITEM_PER_SWIPE = true;  // set true to force exactly ±1 item per swipe
  const FLING_VELOCITY     = 0.34;   // px/ms to count as a flick (used when ONE_ITEM_PER_SWIPE = false)
  const DIST_THRESHOLD     = 0.20;   // fraction of item width to commit (used when not a flick)
  const DRAG_MULTIPLIER    = 1.7;   // makes drag feel lighter
  const IDLE_SNAP_MS       = 50;    // snap shortly after touch ends
  const EDGE_EASING        = true;   // rubber-band illusion at ends
  const EDGE_SLACK_PX      = 36;     // max “visual” overscroll
  const EDGE_EASE_FACTOR   = 0.28;   // how strongly we damp movement near edges (0..1)

  document.querySelectorAll('.carousel').forEach(scroller => {
    let touching = false;
    let lastX = 0;
    let lastT = 0;
    let velocityX = 0;
    let startScrollLeft = 0;
    let dragAccum = 0;
    let idleTimer;

    // For edge easing visualization (we apply a transform and then clear it)
    let visualOverscroll = 0;

    function getItems() {
      return Array.from(scroller.querySelectorAll('.carousel-item'));
    }
    function getNearestIndex() {
      const items = getItems();
      if (!items.length) return { idx: -1, items };
      const rect = scroller.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let nearestIdx = 0;
      let best = Infinity;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        if (d < best) { best = d; nearestIdx = i; }
      });
      return { idx: nearestIdx, items };
    }
    function getItemWidthNearCenter() {
      const { idx, items } = getNearestIndex();
      if (idx < 0) return scroller.clientWidth;
      return items[idx].getBoundingClientRect().width || scroller.clientWidth;
    }
    function atLeftEdge() {
      return scroller.scrollLeft <= 0;
    }
    function atRightEdge() {
      return scroller.scrollLeft >= scroller.scrollWidth - scroller.clientWidth - 1;
    }
    function applyEdgeTransform(px) {
      // Visual-only overscroll. We translate the INNER content, not the scroller.
      // We’ll try the immediate child that contains items; adjust selector if needed.
      const content = scroller; // if you have an inner wrapper like .carousel-track, use that instead
      content.style.transform = `translateX(${px}px)`;
    }
    function clearEdgeTransform() {
      const content = scroller;
      if (content.style.transform) {
        content.style.transition = 'transform 180ms cubic-bezier(0.15, 0.7, 0.25, 1)';
        content.style.transform = 'translateX(0px)';
        // Clean up after transition
        setTimeout(() => {
          content.style.transition = '';
          content.style.transform = '';
        }, 200);
      }
    }

    scroller.addEventListener('touchstart', (e) => {
      touching = true;
      const t = e.touches[0];
      lastX = t.clientX;
      lastT = performance.now();
      velocityX = 0;
      startScrollLeft = scroller.scrollLeft;
      dragAccum = 0;
      visualOverscroll = 0;
      clearTimeout(idleTimer);

      // Cancel any leftover transform instantly
      const content = scroller;
      content.style.transition = '';
      content.style.transform = '';
    }, { passive: true });

    scroller.addEventListener('touchmove', (e) => {
      if (!touching) return;
      const t = e.touches[0];
      const now = performance.now();
      const dx = lastX - t.clientX;
      const dt = Math.max(1, now - lastT);

      // Intent detection: if horizontal motion is dominant, give extra glide
      const intentBoost = 1.12; // small extra glide on consistent horizontal moves

      if (EDGE_EASING && (atLeftEdge() && dx < 0 || atRightEdge() && dx > 0)) {
        const damped = dx * Math.max(0.22, EDGE_EASE_FACTOR - 0.06); // reduce damping further at edge
        const sign = dx < 0 ? -1 : +1;
        visualOverscroll = Math.max(-EDGE_SLACK_PX, Math.min(EDGE_SLACK_PX, (visualOverscroll - damped)));
        applyEdgeTransform(visualOverscroll);

        // Keep scroll change near zero at hard edges; track “intent” velocity lighter
        velocityX = (dx * (DRAG_MULTIPLIER + 0.15) * intentBoost) / dt;
      } else {
        // Normal movement with lighter feel + intent boost
        const boostedDx = dx * (DRAG_MULTIPLIER + 0.15) * intentBoost;
        dragAccum += boostedDx;
        scroller.scrollLeft = startScrollLeft + dragAccum;
        velocityX = boostedDx / dt;

        // If we had visual overscroll and returned inside, clear it
        if (EDGE_EASING && visualOverscroll !== 0) {
          applyEdgeTransform(0);
          visualOverscroll = 0;
        }
      }

      lastX = t.clientX;
      lastT = now;
    }, { passive: true });

    scroller.addEventListener('touchend', () => {
      touching = false;
      
      // Clear edge rubber-band
      if (EDGE_EASING && visualOverscroll !== 0) {
        clearEdgeTransform();
        visualOverscroll = 0;
      }

      const { idx, items } = getNearestIndex();
      if (idx < 0) return;

      let targetIdx = idx;

      if (ONE_ITEM_PER_SWIPE) {
        // Pure pager: always go exactly ±1 based on swipe direction unless at ends
        const dir = velocityX > 0 ? +1 : -1;
        targetIdx = Math.max(0, Math.min(items.length - 1, idx + (dir >= 0 ? +1 : -1)));
      } else {
        // Velocity/distance logic
        const absVel = Math.abs(velocityX);
        const dir = velocityX > 0 ? +1 : -1;

        if (absVel > FLING_VELOCITY) {
          targetIdx = Math.max(0, Math.min(items.length - 1, idx + (dir >= 0 ? +1 : -1)));
        } else {
          // Commit based on distance from center
          const rect = scroller.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const r = items[idx].getBoundingClientRect();
          const itemW = Math.max(1, r.width || getItemWidthNearCenter());
          const deltaToCenter = (r.left + r.width / 2) - center;
          const distRatio = Math.abs(deltaToCenter) / itemW;
          if (distRatio > DIST_THRESHOLD) {
            const commitDir = deltaToCenter > 0 ? +1 : -1;
            targetIdx = Math.max(0, Math.min(items.length - 1, idx + commitDir));
          }
        }
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const rect = scroller.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const target = items[targetIdx];
        if (!target) return;
        const tr = target.getBoundingClientRect();
        const delta = (tr.left + tr.width / 2) - center;
        scroller.scrollBy({ left: delta, behavior: 'smooth' });
      }, IDLE_SNAP_MS);
    }, { passive: true });

    // Small corrective nudge if we drift between items after inertia
    scroller.addEventListener('scroll', () => {
      if (touching) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        const { idx, items } = getNearestIndex();
        if (idx < 0) return;
        const rect = scroller.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const r = items[idx].getBoundingClientRect();
        const delta = (r.left + r.width / 2) - center;
        if (Math.abs(delta) > 1) {
          scroller.scrollBy({ left: delta, behavior: 'smooth' });
        }
      }, 140);
    }, { passive: true });
  });
}

// Prevent wheel from being captured by media; pass vertical scroll upward
document.querySelectorAll('.carousel').forEach(scroller => {
  scroller.addEventListener('wheel', (e) => {
    // Only meddle if event target is media
    const t = e.target;
    if (t && (t.tagName === 'IMG' || t.tagName === 'VIDEO')) {
      // Let vertical scrolling bubble to page; don't block it
      // Do not call preventDefault here.
      // If the browser still tries to scroll the element, you can stop it explicitly:
      t.scrollTop = 0; // ensures no internal scroll
    }
  }, { passive: true });
});

    // === Single unified fullscreen handler ===
    (function() {
    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function isInFullscreen() {
        return !!(document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.msFullscreenElement);
    }

    function requestFullscreen(el) {
        const req = el.requestFullscreen || 
                    el.webkitRequestFullscreen || 
                    el.msRequestFullscreen;
        if (req) {
        try { req.call(el); } catch(e) { console.warn('Fullscreen request failed', e); }
        }
    }

    function exitFullscreen() {
        const exit = document.exitFullscreen || 
                    document.webkitExitFullscreen || 
                    document.msExitFullscreen;
        if (exit) {
        try { exit.call(document); } catch(e) { console.warn('Fullscreen exit failed', e); }
        }
    }

    // Expose for use in consolidated DOMContentLoaded
    window.initFullscreenHandler = function() {
        const mediaContainer = document.querySelector('.lightbox-media-container');
        if (!mediaContainer) return;

        let tapCount = 0;
        let tapTimer = null;

        mediaContainer.addEventListener('click', function(e) {
        // Ignore clicks on UI controls
        if (e.target.closest('.lightbox-sub-carousel, .lightbox-tabs, .lightbox-nav, .lightbox-close, .sub-carousel-item')) {
            return;
        }

        // iOS video: use native fullscreen player
        const video = e.target.tagName === 'VIDEO' ? e.target : mediaContainer.querySelector('video');
        if (video && isIOS() && typeof video.webkitEnterFullscreen === 'function') {
            try { 
            video.webkitEnterFullscreen(); 
            return; 
            } catch(_) {}
        }

        // Double-tap detection for mobile
        tapCount++;
        clearTimeout(tapTimer);

        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
            // Single tap: toggle fullscreen
            if (isInFullscreen()) {
                exitFullscreen();
            } else {
                requestFullscreen(mediaContainer);
            }
            tapCount = 0;
            }, 300);
        } else if (tapCount === 2) {
            // Double-tap: also toggle
            clearTimeout(tapTimer);
            if (isInFullscreen()) {
            exitFullscreen();
            } else {
            requestFullscreen(mediaContainer);
            }
            tapCount = 0;
        }
        }, { passive: true });
    };
    })();

  // Fade the load-only overlay without touching the existing #page-fade logic
  window.addEventListener('load', function () {
    var fadeOnLoad = document.getElementById('page-fade-onload');
    if (!fadeOnLoad) return;

    // Allow first paint, then fade
    requestAnimationFrame(function () {
      fadeOnLoad.classList.add('is-gone');
      // Optional: remove after transition
      setTimeout(function () {
        if (fadeOnLoad && fadeOnLoad.parentNode) {
          fadeOnLoad.parentNode.removeChild(fadeOnLoad);
        }
      }, 800);
    });
  });

  (function() {
    const overlay = document.getElementById('mobileNavOverlay');
    const toggle  = document.getElementById('mobileNavToggle');

    function openMenu() {
      overlay.style.display = 'block';
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
      });
    }

    function closeMenu() {
        // First, blur any focused element inside to avoid ARIA conflict
        const focused = overlay.querySelector(':focus');
        if (focused) focused.blur();

        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('inert', ''); // Add inert to fully disable during hide
        toggle.setAttribute('aria-expanded', 'false');
        
        // Wait for fade to finish before display:none
        setTimeout(() => {
            if (!overlay.classList.contains('active')) {
                overlay.style.display = 'none';
                overlay.removeAttribute('inert'); // Clean up inert after hidden
            }
        }, 300);
    }

    function toggleMenu() {
      const isOpen = overlay.classList.contains('active');
      if (isOpen) closeMenu(); else openMenu();
    }

    toggle?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', (e) => {
      // clicking the dark background closes; clicks inside the menu do not
      if (e.target === overlay) closeMenu();
    });

    // Core navigation logic for all buttons
    async function navigateTo(target) {
    // 1) If a lightbox is open, close it and wait
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        await closeLightbox();
    }

    const home = document.getElementById('home');
    const isOnHome = home && home.classList.contains('active');

    switch (target) {
        case 'home': {
    // If we're not on home, navigate there (restore scroll handled by navigateToPage)
    if (!isOnHome) {
        navigateToPage('home');
    } else {
        // Already on home: scroll to the very top
        document.documentElement.classList.add('user-initiated-scroll');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
        document.documentElement.classList.remove('user-initiated-scroll');
        }, 700);
    }
    break;
    }

        case 'projects': {
        const scrollToProjects = () => {
            const anchor = document.getElementById('projects') || document.getElementById('featured-reels');
            smoothUserScrollIntoView(anchor);
        };

        if (!isOnHome) {
            // Navigate home, then scroll once home is active
            navigateToPage('home');
            waitUntilHomeActiveThen(520, scrollToProjects);
        } else {
            scrollToProjects();
        }
        break;
        }

        case 'project1':
        case 'project2':
        case 'resume': {
        navigateToPage(target);
        break;
        }

        case 'additional-work': {
        const scrollToAdditional = () => {
            const section = document.getElementById('additional-work');
            smoothUserScrollIntoView(section);
        };

        if (!isOnHome) {
            navigateToPage('home');
            waitUntilHomeActiveThen(520, scrollToAdditional);
        } else {
            scrollToAdditional();
        }
        break;
        }

        case 'contact': {
        const scrollToContact = () => {
            const section = document.getElementById('contact');
            smoothUserScrollIntoView(section);
        };

        if (!isOnHome) {
            navigateToPage('home');
            waitUntilHomeActiveThen(520, scrollToContact);
        } else {
            scrollToContact();
        }
        break;
        }
    }

    // Helper: only one definition, correct DOM API
    function smoothUserScrollIntoView(el) {
        if (!el) return;
        document.documentElement.classList.add('user-initiated-scroll');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
        document.documentElement.classList.remove('user-initiated-scroll');
        }, 700);
    }

    // Helper: wait until #home has class .active, then run cb.
    // Fallback to a timeout if the class flip takes a fixed duration.
    function waitUntilHomeActiveThen(delayMs, cb) {
        const homeEl = document.getElementById('home');
        if (!homeEl) {
        setTimeout(cb, delayMs);
        return;
        }
        // Simple approach: check once after delay; you can upgrade to a MutationObserver if needed
        setTimeout(() => {
        if (homeEl.classList.contains('active')) {
            cb();
        } else {
            // If for some reason not active yet, try once more shortly after
            setTimeout(cb, 120);
        }
        }, delayMs);
    }

    closeMenu();
    }

        // Hook up button clicks
        document.querySelectorAll('.mobile-nav-menu .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            navigateTo(target);
        });
        });

        // Keyboard: ESC to close
        document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeMenu();
        }
        });


        // Expose a robust global for inline onclicks
        window.navigateTo = navigateTo;
    })();

// Ensure reel clicks always navigate even if inline handlers are overridden
document.querySelectorAll('.reel-item[onclick]').forEach(el => {
  el.addEventListener('click', (e) => {
    const call = el.getAttribute('onclick') || '';
    const m = call.match(/navigateToPage\('([^']+)'\)/);
    if (m && m[1]) {
      e.preventDefault();
      // Let the global handler do the right thing
      window.navigateToPage(m[1]);
    }
  });
});

  // Select all resume items
  const resumeItems = document.querySelectorAll('.resume-item');

  resumeItems.forEach(item => {
    const header = item.querySelector('h3');
    header.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        // On mobile: close all others before opening this one
        resumeItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
          }
        });
      }
      // Toggle the clicked item
      item.classList.toggle('active');
    });
  });

  // Extra: update behavior on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      // On desktop, allow multiple items open
      resumeItems.forEach(item => item.classList.add('active'));
    }
  });

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

(function(){
  const MIN_THUMB = 40; // px floor so it’s always grab-able

  function recalcRail(rail){
    const carousel = rail.querySelector('.carousel');
    const thumb = rail.querySelector('.scroll-thumb');
    const track = rail;

    if (!carousel || !thumb) return;

    // Force a sync layout read of the carousel first
    // to ensure clientWidth/scrollWidth are up to date
    const _ = carousel.offsetWidth; // reflow hint

    const trackRect = track.getBoundingClientRect();
    const trackWidth = trackRect.width || track.clientWidth;

    if (trackWidth <= 0) return;

    const clientW = carousel.clientWidth;
    const scrollW = carousel.scrollWidth;
    const scrollL = carousel.scrollLeft;

    // No overflow → thumb fills track
    if (scrollW <= clientW + 1) {
      thumb.style.width = trackWidth + 'px';
      thumb.style.transform = 'translateX(0px)';
      thumb.style.opacity = '0.5';
      thumb.dataset.full = '1';
      return;
    } else {
      thumb.dataset.full = '0';
    }

    const thumbW = Math.max(MIN_THUMB, trackWidth * (clientW / scrollW));
    const maxX = trackWidth - thumbW;
    const ratio = (scrollW - clientW) > 0 ? (scrollL / (scrollW - clientW)) : 0;
    const x = Math.max(0, Math.min(maxX, maxX * ratio));

    thumb.style.width = thumbW + 'px';
    thumb.style.transform = `translateX(${x}px)`;
    thumb.style.opacity = '1';
  }

  function recalcAll(){
    document.querySelectorAll('.carousel-rail').forEach(recalcRail);
  }

  // Recalc on scroll for live thumb position
  function bindCarousel(carousel){
    const rail = carousel.closest('.carousel-rail');
    if (!rail) return;
    const thumb = rail.querySelector('.scroll-thumb');
    if (!thumb) return;

    let ticking = false;
    carousel.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        recalcRail(rail);
        ticking = false;
      });
    }, { passive: true });
  }
  
  function watchImagesAndVideos(container){
    const media = container.querySelectorAll('img, video');
    let remaining = media.length;

    if (remaining === 0) return Promise.resolve();

    return new Promise(resolve => {
      media.forEach(el => {
        if ((el.tagName === 'IMG' && el.complete) ||
            (el.tagName === 'VIDEO' && el.readyState >= 2)) {
          if (--remaining === 0) resolve();
          return;
        }
        const done = () => {
          el.removeEventListener('load', done);
          el.removeEventListener('loadeddata', done);
          if (--remaining === 0) resolve();
        };
        el.addEventListener('load', done, { once: true });
        el.addEventListener('loadeddata', done, { once: true });
        el.addEventListener('error', done, { once: true });
      });
    });
  }

  // Robust initialization
  async function init(){
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(bindCarousel);

    // 1) Wait two frames to ensure styles/layout applied
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    // 2) Then wait for media to be ready
    await watchImagesAndVideos(document);

    // 3) Initial calc
    recalcAll();

    // 4) Safety: re-run after fonts/layout settle and after a tiny idle
    setTimeout(recalcAll, 0);
    setTimeout(recalcAll, 120);
    setTimeout(recalcAll, 400);
    // 5) Microtask nudge to catch late style passes
    Promise.resolve().then(recalcAll);
  }

  // Observe size changes (container or viewport)
  const ro = new ResizeObserver(() => recalcAll());
  window.addEventListener('resize', recalcAll, { passive: true });
  window.addEventListener('orientationchange', recalcAll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(recalcAll, 60);
  });

  // Attach ResizeObserver to each rail
  function attachObservers(){
    document.querySelectorAll('.carousel-rail').forEach(rail => {
      ro.observe(rail);
      const carousel = rail.querySelector('.carousel');
      if (carousel) ro.observe(carousel);
    });
  }

  // Expose globals so other scripts can call them
  window.recalcRail = recalcRail;
  window.attachObservers = attachObservers;
  window.init = init;
})();

document.addEventListener('transitionend', (e) => {
  // If any container involved in carousels finishes a size-related transition,
  // recalc that rail so the thumb updates to the final width.
  if (e.target.matches('.carousel-rail, .carousel, .carousel-container')) {
    const rail = e.target.closest('.carousel-rail') || (e.target.classList.contains('carousel-rail') ? e.target : null);
    if (rail && typeof window.recalcRail === 'function') {
      window.recalcRail(rail);
    }
  }
});

(() => {
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  function setThumbByScroll(rail) {
    if (typeof window.recalcRail === 'function') {
      return window.recalcRail(rail);
    }
  }

  function initThumbDrag(rail) {
    const scroller = rail.querySelector('.carousel');
    const track = rail.querySelector('.scroll-track');
    const thumb = rail.querySelector('.scroll-thumb');
    if (!scroller || !track || !thumb) return;

    track.style.pointerEvents = 'none';
    thumb.style.pointerEvents = 'auto';
    thumb.style.cursor = 'grab';
    thumb.style.touchAction = 'none';

    // Sync once immediately and after a frame
    setThumbByScroll(rail);
    requestAnimationFrame(() => setThumbByScroll(rail));

    let dragging = false;
    let startClientX = 0;
    let startThumbX = 0;
    let trackW = 0;
    let thumbW = 0;
    let maxThumbX = 0;
    let maxScroll = 0;

    function refreshMetrics() {
      trackW = track.clientWidth;
      const tw = parseFloat(getComputedStyle(thumb).width) || thumb.getBoundingClientRect().width;
      thumbW = tw;
      maxThumbX = Math.max(0, trackW - thumbW);
      maxScroll = Math.max(1, scroller.scrollWidth - scroller.clientWidth);
    }

    function currentThumbX() {
      const m = getComputedStyle(thumb).transform;
      if (m && m.startsWith('matrix(')) {
        const parts = m.split(',');
        return parseFloat(parts[4]) || 0;
      }
      return 0;
    }

    function onStart(e) {
      const point = e.touches ? e.touches[0] : e;
      dragging = true;
      startClientX = point.clientX;
      refreshMetrics();
      startThumbX = currentThumbX();
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startClientX;
      const x = clamp(startThumbX + dx, 0, maxThumbX);
      const ratio = maxThumbX ? x / maxThumbX : 0;
      scroller.scrollLeft = ratio * maxScroll;
      thumb.style.transform = `translateX(${x}px)`;
      e.preventDefault();
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = '';
    }

    thumb.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);

    thumb.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    scroller.addEventListener('scroll', () => setThumbByScroll(rail), { passive: true });
    window.addEventListener('resize', () => setThumbByScroll(rail));
    window.addEventListener('orientationchange', () => setThumbByScroll(rail));
  }

  function initAll() {
    document.querySelectorAll('.carousel-rail').forEach(initThumbDrag);
  }

  // Expose to unified DOMContentLoaded
  window.initAll = initAll;
})();
  
// === Lightbox Expansion System (Double-Tap on Mobile + Click on Desktop) === //
(function() {
  const lightbox = document.querySelector('.lightbox');
  const mediaContainer = document.querySelector('.lightbox-media-container');
  
  if (!mediaContainer || !lightbox) return;
  
  let lastTap = 0;
  
  // Toggle expansion function – smooth and immediate
  toggleExpansion = function() {
    const fullscreenArrows = document.getElementById('fullscreen-nav-arrows');
    const data = lightboxData[currentLightboxId];
    
    if (isExpanded) {
      // IMMEDIATELY set to false so next ESC closes lightbox
      isExpanded = false;
      
      // Exit expanded mode
      mediaContainer.classList.remove('expanded');
      
      setTimeout(() => {
        lightbox.classList.remove('expanded-mode');
        mediaContainer.style.transformOrigin = '';
        if (fullscreenArrows) fullscreenArrows.style.display = 'none';
      }, 333);
      
      const img = mediaContainer.querySelector('.lightbox-image');
      const video = mediaContainer.querySelector('.lightbox-video');
      if (img) img.style.touchAction = 'manipulation';
      if (video) video.style.touchAction = 'manipulation';
      
    } else {
      // Expand mode
      isExpanded = true;
      
      // Smooth center expansion
      mediaContainer.style.transformOrigin = 'center center';
      lightbox.classList.add('expanded-mode');
      
      setTimeout(() => {
        mediaContainer.classList.add('expanded');
        if (fullscreenArrows && data && data.media && data.media.length > 1) {
          fullscreenArrows.style.display = 'block';
        }
        const img = mediaContainer.querySelector('.lightbox-image');
        const video = mediaContainer.querySelector('.lightbox-video');
        if (img) img.style.touchAction = 'pinch-zoom';
        if (video) video.style.touchAction = 'pinch-zoom';
      }, 320);
    }
  };
  
  // Double-tap (mobile)
  if (window.innerWidth <= 768) {
    mediaContainer.addEventListener('touchend', function(e) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        toggleExpansion();
      }
      lastTap = currentTime;
    });
  }
  
  // Click (desktop)
  if (window.innerWidth > 768) {
    mediaContainer.addEventListener('click', function(e) {
      if (e.target.closest('.lightbox-media-container') && !e.target.closest('.fullscreen-nav-arrow')) {
        toggleExpansion();
      }
    });
  }
  
  // Close button reset
  const closeBtn = document.querySelector('.lightbox-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (isExpanded) {
        isExpanded = false;
        mediaContainer.classList.remove('expanded');
        lightbox.classList.remove('expanded-mode');
      }
    });
  }
  
  // Sync browser fullscreen exit with expanded mode
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isExpanded) {
      toggleExpansion(); // Contract expanded mode when browser fullscreen exits
    }
  });
  
})();

// === Unified Swipe-Down Handler (Exit Expanded Mode OR Close Lightbox) ===
(function() {
  const mediaContainer = document.querySelector('.lightbox-media-container');
  const lightbox = document.querySelector('.lightbox');
  
  if (!mediaContainer || !lightbox || window.innerWidth > 768) return; // Mobile only
  
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  
  // Track expanded state
  const observer = new MutationObserver(() => {
    isExpanded = mediaContainer.classList.contains('expanded');
  });
  observer.observe(mediaContainer, { attributes: true, attributeFilter: ['class'] });
  
  function onTouchStart(e) {
    if (e.touches.length > 1) return;
    
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
  }
  
  function onTouchMove(e) {
    if (!isDragging) return;
    
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow downward swipes
    if (deltaY > 0) {
      if (isExpanded) {
        // Visual feedback for expanded mode exit
        const opacity = Math.max(0.3, 1 - (deltaY / 400));
        const scale = Math.max(0.85, 1 - (deltaY / 800));
        
        mediaContainer.style.transition = 'none';
        mediaContainer.style.transform = `translateY(${deltaY}px) scale(${scale})`;
        mediaContainer.style.opacity = opacity;
      }
      
      if (deltaY > 10) {
        e.preventDefault();
      }
    }
  }
  
  function onTouchEnd(e) {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    const swipeThreshold = isExpanded ? 100 : 80; // Higher threshold for expanded mode
    
    mediaContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    // Swipe down detected
    if (deltaY > swipeThreshold) {
      if (isExpanded) {
        // Exit expanded mode with visual feedback
        toggleExpansion();
      } else {
        // Close lightbox if not expanded
        closeLightbox();
      }
    }
    
    // Reset transform (for expanded mode visual feedback)
    mediaContainer.style.transform = '';
    mediaContainer.style.opacity = '';
    
    isDragging = false;
  }
  
  // Listen on mediaContainer for better control
  mediaContainer.addEventListener('touchstart', onTouchStart, { passive: true });
  mediaContainer.addEventListener('touchmove', onTouchMove, { passive: false });
  mediaContainer.addEventListener('touchend', onTouchEnd);
  mediaContainer.addEventListener('touchcancel', onTouchEnd);
  
})();

/* ==== PROJECT PAGE MEDIA EMBEDS (YouTube/Vimeo only) ==== */
  document.addEventListener("DOMContentLoaded", function() {
    initializeProjectMediaEmbeds();
  });

  function initializeProjectMediaEmbeds() {
    const embeds = document.querySelectorAll('.media-embed');
    embeds.forEach(embed => {
      const type = embed.getAttribute('data-type');
      const id = embed.getAttribute('data-id');
      if (embed.dataset.initialized === '1') return;

      const iframe = document.createElement('iframe');
      iframe.allowFullscreen = true;

      if (type === 'youtube') {
        iframe.src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      } else if (type === 'vimeo') {
        iframe.src = `https://player.vimeo.com/video/${id}`;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      } else {
        return; // Not a supported embed type
      }

      embed.appendChild(iframe);
      embed.dataset.initialized = '1';
    });
  }
  /* ==== PROJECT PAGE LAZY MEDIA ==== */

      // Observe images/videos to swap data-src -> src
      const pageMediaObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;

          // IMG
          if (el.tagName === 'IMG' && el.dataset.src) {
            el.src = el.dataset.src;
            el.addEventListener('load', () => el.classList.add('lazy-loaded'), { once: true });
            delete el.dataset.src;
            obs.unobserve(el);
            return;
          }

          // VIDEO (with <source data-src>)
          if (el.tagName === 'VIDEO') {
            const source = el.querySelector('source[data-src]');
            if (source) {
              source.src = source.dataset.src;
              delete source.dataset.src;
              el.load();
              // Mark loaded once metadata arrives (or on canplay)
              const markLoaded = () => el.classList.add('lazy-loaded');
              el.addEventListener('loadedmetadata', markLoaded, { once: true });
              el.addEventListener('canplay', markLoaded, { once: true });
            }
            obs.unobserve(el);
            return;
          }
        });
      }, { root: null, rootMargin: '200px 0px', threshold: 0.01 });

      // Observe embeds to create iframes lazily
      const embedObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const container = entry.target; // .media-embed.lazy-embed
          if (container.dataset.initialized === '1') { obs.unobserve(container); return; }

          const type = container.getAttribute('data-type');
          const id = container.getAttribute('data-id');

          const iframe = document.createElement('iframe');
          iframe.allowFullscreen = true;

          if (type === 'youtube') {
            iframe.src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          } else if (type === 'vimeo') {
            iframe.src = `https://player.vimeo.com/video/${id}`;
            iframe.allow = 'autoplay; fullscreen; picture-in-picture';
          } else {
            obs.unobserve(container);
            return;
          }

          iframe.addEventListener('load', () => container.classList.add('lazy-loaded'), { once: true });
          container.appendChild(iframe);
          container.dataset.initialized = '1';
          obs.unobserve(container);
        });
      }, { root: null, rootMargin: '200px 0px', threshold: 0.01 });

      // Kick off observers for a specific page container
      function initLazyForProjectPage(pageEl) {
        // Images and videos
        pageEl.querySelectorAll('img.lazy-media, video.lazy-media').forEach(el => {
          // Only observe elements still using data-src (images) or with <source data-src> (videos)
          if (el.tagName === 'IMG' && el.dataset.src) {
            pageMediaObserver.observe(el);
          } else if (el.tagName === 'VIDEO') {
            const source = el.querySelector('source[data-src]');
            if (source) pageMediaObserver.observe(el);
          }
        });

        // Embeds (YouTube/Vimeo)
        pageEl.querySelectorAll('.media-embed.lazy-embed').forEach(el => {
          if (el.dataset.initialized !== '1') embedObserver.observe(el);
        });
      }
// ============================================
// PROJECT 1 PAGE INITIALIZATION
// ============================================

// Initialize project1 page when navigated to
function initProject1Page() {
  const project1Page = document.getElementById('project1');
  if (!project1Page) return;

  // Initialize lazy loading for project1 media (top-to-bottom sequential)
  initSequentialLazyLoad(project1Page);

  // Initialize carousel for topology section
  initProject1Carousel();

  // Initialize embed observers
  initLazyForProjectPage(project1Page);
}

// Sequential lazy loading (loads top-to-bottom in order)
function initSequentialLazyLoad(pageEl) {
  const lazyMedia = Array.from(pageEl.querySelectorAll('.lazy-media'));
  let currentIndex = 0;

  function loadNext() {
    if (currentIndex >= lazyMedia.length) return;

    const media = lazyMedia[currentIndex];
    
    // Handle images
    if (media.tagName === 'IMG' && media.dataset.src) {
      media.src = media.dataset.src;
      media.onload = () => {
        media.classList.add('lazy-loaded');
        currentIndex++;
        loadNext();
      };
      delete media.dataset.src;
    }
    
    // Handle videos
    else if (media.tagName === 'VIDEO') {
      const source = media.querySelector('source[data-src]');
      if (source) {
        source.src = source.dataset.src;
        delete source.dataset.src;
        media.load();
        media.addEventListener('loadedmetadata', () => {
          media.classList.add('lazy-loaded');
          currentIndex++;
          loadNext();
        }, { once: true });
      } else {
        currentIndex++;
        loadNext();
      }
    }
    
    else {
      currentIndex++;
      loadNext();
    }
  }

  // Start loading sequence
  loadNext();
}

// Initialize carousel for project1 topology section
function initProject1Carousel() {
  const carousel = document.getElementById('project1-topology-carousel');
  if (!carousel) return;

  // Reuse existing carousel scroll logic from main page
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('active');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.classList.remove('active');
  });

  carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('active');
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  let touchStartX = 0;
  let touchScrollLeft = 0;

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX - carousel.offsetLeft;
    touchScrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - touchStartX) * 2;
    carousel.scrollLeft = touchScrollLeft - walk;
  });
}

// Hook into page navigation
const originalNavigateToPage = window.navigateToPage;
window.navigateToPage = function(pageId) {
  // Stop any playing Vimeo videos before navigating away from project1
  if (pageId !== 'project1') {
    const project1Page = document.getElementById('project1');
    if (project1Page) {
      const vimeoIframe = project1Page.querySelector('iframe[src*="vimeo.com"]');
      if (vimeoIframe && vimeoIframe.src) {
        // Save the src before clearing it
        vimeoIframe.dataset.originalSrc = vimeoIframe.src;
        vimeoIframe.src = '';
      }
    }
  }
  
  originalNavigateToPage(pageId);
  
  // If navigating to project1, initialize and restore Vimeo
  if (pageId === 'project1') {
    setTimeout(() => {
      const project1Page = document.getElementById('project1');
      if (project1Page) {
        // Restore Vimeo iframe if it was cleared
        const vimeoIframe = project1Page.querySelector('iframe[data-original-src]');
        if (vimeoIframe && vimeoIframe.dataset.originalSrc) {
          vimeoIframe.src = vimeoIframe.dataset.originalSrc;
        }
      }
      
      initProject1Page();
      initializeProjectMediaEmbeds();
    }, 100);
  }
};

// Auto-hiding carousel hint arrows (mobile only)
function initCarouselHints() {
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  const template = document.getElementById('carousel-arrows-template');
  if (!template) return;

  // Intersection Observer to detect when carousel enters viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const rail = entry.target;
        const arrows = rail.querySelector('.carousel-hint-arrows');
        if (arrows && !arrows.classList.contains('hidden')) {
          // Show arrows when carousel enters view
          setTimeout(() => arrows.classList.add('visible'), 100);
        }
      }
    });
  }, {
    threshold: 0.3 // Trigger when 30% of carousel is visible
  });

  document.querySelectorAll('.carousel-rail').forEach(rail => {
    const carousel = rail.querySelector('.carousel');
    if (!carousel) return;

    // Clone and inject arrows
    const arrows = template.content.cloneNode(true).querySelector('.carousel-hint-arrows');
    rail.style.position = 'relative';
    rail.appendChild(arrows);

    let hasScrolled = false;

    function hideArrows() {
      if (hasScrolled) return;
      hasScrolled = true;
      arrows.classList.remove('visible');
      arrows.classList.add('hidden');
      setTimeout(() => arrows.remove(), 600);
    }

    // Hide only when THIS carousel is scrolled
    carousel.addEventListener('scroll', () => {
      if (!hasScrolled) {
        hideArrows();
      }
    }, { once: true, passive: true });

    // Also hide on touch (in case scroll event doesn't fire immediately)
    let touchMoved = false;
    carousel.addEventListener('touchmove', () => {
      touchMoved = true;
    }, { once: true, passive: true });
    
    carousel.addEventListener('touchend', () => {
      if (touchMoved) {
        hideArrows();
      }
    }, { once: true, passive: true });

    // Start observing this carousel
    observer.observe(rail);
  });
}

// Call after DOM ready
document.addEventListener('DOMContentLoaded', initCarouselHints);

// ============================================
// LAZY LOADING IMPLEMENTATION
// ============================================

// Lazy load images, videos, and iframes using IntersectionObserver
function initLazyLoading() {
    const lazyMedia = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const mediaObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const media = entry.target;
                    
                    // Handle images
                    if (media.tagName === 'IMG' && media.dataset.src) {
                        media.src = media.dataset.src;
                        media.classList.remove('lazy-load');
                        media.classList.add('lazy-loaded');
                    }
                    
                    // Handle videos (Cloudinary/direct sources)
                    if (media.tagName === 'VIDEO' && media.dataset.src) {
                        media.src = media.dataset.src;
                        media.load();
                        media.classList.remove('lazy-load');
                        media.classList.add('lazy-loaded');
                    }
                    
                    // Handle iframes (YouTube/Vimeo)
                    if (media.tagName === 'IFRAME' && media.dataset.src) {
                        media.src = media.dataset.src;
                        media.classList.remove('lazy-load');
                        media.classList.add('lazy-loaded');
                    }
                    
                    observer.unobserve(media);
                }
            });
        }, {
            rootMargin: '50px 0px', // Start loading 50px before entering viewport
            threshold: 0.01
        });
        
        lazyMedia.forEach(media => mediaObserver.observe(media));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyMedia.forEach(media => {
            if (media.dataset.src) {
                media.src = media.dataset.src;
                if (media.tagName === 'VIDEO') media.load();
            }
        });
    }
}

/* =========================================
   MOBILE ORIENTATION FIX
   ========================================= */
window.addEventListener("orientationchange", function() {
    // 1. Give the browser 100ms to finish the rotation animation
    setTimeout(() => {
        // 2. Force a viewport reset (fixes the "Super Zoom")
        const viewport = document.querySelector("meta[name=viewport]");
        if (viewport) {
            viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
        }

        // 3. If Lightbox is open (Body is locked), force a width refresh
        // This prevents the background page from getting stuck at the wrong width
        if (document.body.classList.contains("is-locked")) {
            document.body.style.width = window.innerWidth + "px";
            document.body.style.height = window.innerHeight + "px";
            
            // Reset to 100% after a brief moment to ensure layout snaps back
            setTimeout(() => {
                document.body.style.width = "100%";
                document.body.style.height = "";
            }, 50);
        }
    }, 100);
});

// Initialize lazy loading on page load
document.addEventListener('DOMContentLoaded', initLazyLoading);
document.addEventListener('DOMContentLoaded', function() {
  if (typeof attachObservers === 'function') attachObservers();
  if (typeof init === 'function') init();
  if (typeof initAll === 'function') initAll();
  if (typeof initMobileNudge === 'function') initMobileNudge();
  if (typeof addLightboxSwipeSupport === 'function') addLightboxSwipeSupport();
  if (typeof initFullscreenHandler === 'function') initFullscreenHandler();

  const hamburger = document.getElementById('mobileNavToggle');
  const hero = document.querySelector('.hero');
  let hasShownHamburger = false;

  function toggleHamburger() {
    if (hasShownHamburger || !hamburger || !hero) return;
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom <= 0) {
      hamburger.classList.add('visible');
      void hamburger.offsetWidth;
      hamburger.style.animation = 'slideInLeft 0.5s ease-out forwards';
      hasShownHamburger = true;
    }
  }
  window.addEventListener('scroll', toggleHamburger);
  toggleHamburger();

  // Final safety recalc after everything settles
  setTimeout(() => {
    if (typeof window.recalcRail === 'function') {
      document.querySelectorAll('.carousel-rail').forEach(window.recalcRail);
    }
  }, 800);
});
