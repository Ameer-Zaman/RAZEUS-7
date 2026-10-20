/**
 * RZ7 Shield — Anti-Inspect Protection v2
 * =========================================
 * Blocks casual source viewing. Safari/iOS-safe — no false positives.
 * The real protection is Firebase security rules; this just deters.
 */
(function(){
  'use strict';

  // ── Detect Safari / iOS (skip size-based detection — causes false positives) ──
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || isIOS;

  // ── Block right-click ──
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });

  // ── Block keyboard shortcuts ──
  document.addEventListener('keydown', function(e){
    if(e.key === 'F12'){ e.preventDefault(); return false; }
    if(e.ctrlKey && e.shiftKey && /^[IJCijc]$/.test(e.key)){ e.preventDefault(); return false; }
    if(e.ctrlKey && /^[UuSs]$/.test(e.key)){ e.preventDefault(); return false; }
    if(e.metaKey && e.altKey && /^[IJCijc]$/.test(e.key)){ e.preventDefault(); return false; }
    if(e.metaKey && /^[Uu]$/.test(e.key)){ e.preventDefault(); return false; }
  });

  // ── Devtools size detection (desktop only, skip Safari + mobile) ──
  if(!isSafari && !isMobile){
    var threshold = 160;
    var dtOpen = false;
    setInterval(function(){
      var wDiff = window.outerWidth - window.innerWidth > threshold;
      var hDiff = window.outerHeight - window.innerHeight > threshold;
      var wasOpen = dtOpen;
      dtOpen = wDiff || hDiff;
      if(dtOpen && !wasOpen){
        document.body.style.filter = 'blur(20px)';
        document.body.style.pointerEvents = 'none';
      }
      if(!dtOpen && wasOpen){
        document.body.style.filter = '';
        document.body.style.pointerEvents = '';
      }
    }, 800);
  }

  // ── Debugger trap (desktop only — freezes mobile browsers) ──
  if(!isMobile){
    setInterval(function(){
      var s = performance.now();
      debugger;
      if(performance.now() - s > 100){
        document.body.style.filter = 'blur(20px)';
        document.body.style.pointerEvents = 'none';
      }
    }, 3000);
  }

  // ── Console warning ──
  setInterval(function(){
    console.clear();
    console.log('%c⛔ RZ7 SECURITY','font-size:28px;font-weight:bold;color:#7a1a24;');
    console.log('%cInspecting this page is not allowed.','font-size:13px;color:#888;');
  }, 2000);

  // ── Block text selection on data elements ──
  var s = document.createElement('style');
  s.textContent = '.pcard,.crew-card,.war-row,.stat-val,.lb-name{-webkit-user-select:none;user-select:none;}';
  document.head.appendChild(s);

  // ── Block drag ──
  document.addEventListener('dragstart', function(e){ e.preventDefault(); });

})();