// POLL OPTIONS
const pollOptions = [
  { id: 1, name: "RZ7 | THOPPI", label: "Godfather • Most Powerful" },
  { id: 2, name: "RZ7 | RAMBO", label: "Gang Leader" },
  { id: 3, name: "RZ7 | SHEIKH NUHMAN", label: "Co-Leader" },
  { id: 4, name: "RZ7 | MINNAL MACK", label: "Co-Leader" },
  { id: 5, name: "RZ7 Whole Crew", label: "MARCELLUZ Family" }
];

let userVote = null;

function renderPoll() {
  const container = document.getElementById('pollOptions');
  container.innerHTML = pollOptions.map(opt => `
    <div class="poll-option" data-id="${opt.id}" onclick="selectOption(${opt.id})">
      <strong>${opt.name}</strong><br>
      <small>${opt.label}</small>
    </div>
  `).join('');
}

function selectOption(id) {
  userVote = id;
  document.querySelectorAll('.poll-option').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.id) === id);
  });
}

function submitPoll() {
  if (!userVote) {
    alert("Please select your favourite member!");
    return;
  }

  let totalVotes = 100;
  let resultsHTML = '';

  pollOptions.forEach(opt => {
    let percent = opt.id === userVote ? 42 : Math.floor(Math.random() * 18) + 8;
    resultsHTML += `
      <div class="poll-option">
        <div class="progress-bar" style="width: ${percent}%"></div>
        <span>
          <strong>${opt.name}</strong><br>
          <small>${opt.label}</small>
        </span>
        <strong style="margin-left:auto; color:#ffd76a;">${percent}%</strong>
      </div>
    `;
  });

  document.getElementById('pollOptions').style.display = 'none';
  document.getElementById('pollResults').innerHTML = resultsHTML;
  document.getElementById('pollResults').style.display = 'block';
  document.getElementById('pollSubmitBtn').style.display = 'none';
}

// Show Poll after 40 seconds
setTimeout(() => {
  document.getElementById('eventPopup').style.display = 'flex';
}, 40000);


    // ── MOBILE MENU ──
    document.getElementById('menuToggle').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('active');
    });

    // ── SCROLL REVEAL ──
    function checkReveals() {
      document.querySelectorAll('.reveal').forEach(function(el) {
        if (el.getBoundingClientRect().top < window.innerHeight - 80) {
          el.classList.add('active');
        }
      });
    }
    window.addEventListener('scroll', checkReveals);
    window.addEventListener('load', checkReveals);
    checkReveals();

    // ── COUNTER ANIMATION ──
    var countersData = [
      { id: 'cnt1', target: 0 },
      { id: 'cnt2', target: 0 },
      { id: 'cnt3', target: 0 },
      { id: 'cnt4', target: 0 }
    ];
    var countersDone = false;

    function startCounting() {
      if (countersDone) return;
      countersDone = true;
      countersData.forEach(function(item) {
        var el = document.getElementById(item.id);
        if (!el) return;
        var start = null;
        var duration = 2000;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(ease * item.target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = item.target;
        }
        requestAnimationFrame(tick);
      });
    }

    function checkCounters() {
      var sec = document.getElementById('stats');
      if (sec && sec.getBoundingClientRect().top < window.innerHeight + 200) {
        startCounting();
      }
    }

    window.addEventListener('scroll', checkCounters);
    window.addEventListener('load', function() { setTimeout(checkCounters, 200); });
    setTimeout(startCounting, 2500); // hard fallback

    // ── LINK EXPIRED MODAL ──
    function openLE() {
      var ov = document.getElementById('leOverlay');
      ov.classList.add('active');
      var icon = ov.querySelector('.le-icon');
      icon.style.animation = 'none';
      void icon.offsetHeight;
      icon.style.animation = '';
    }
    function closeLE() {
      document.getElementById('leOverlay').classList.remove('active');
    }
    document.getElementById('leOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeLE();
    });

    // ── UNDER CONSTRUCTION MODAL ──
    function openUC(e) {
      e.preventDefault();
      var ov = document.getElementById('ucOverlay');
      ov.classList.add('active');
      var bar = ov.querySelector('.uc-progress-bar');
      bar.style.animation = 'none';
      void bar.offsetHeight;
      bar.style.animation = '';
    }
    function closeUC() {
      document.getElementById('ucOverlay').classList.remove('active');
    }
    document.getElementById('ucOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeUC();
    });

    // ══════════════════════════════════════════════
    // ANIMAL SOUND ENGINE
    // Plays on card hover AND on the animal SVG hover
    // ══════════════════════════════════════════════
  

  

    // document.addEventListener('click', function(e) {
    //   var el = e.target.closest('a, button');
    //   if (!el) return;
    //   if (el.hasAttribute('onclick')) return;
    //   if (el.closest('#leOverlay') || el.closest('#ucOverlay')) return;
    //   var href = el.getAttribute('href');
    //   var dead = el.classList.contains('unavailable') || href === '#' || href === '' || href === null;
    //   if (dead) {
    //     e.preventDefault();
    //     openLE();
    //   }
    // });

    // Escape key closes any modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { closeLE(); closeUC(); }
    });

    // COPYRIGHT POPUP
function closeCopyrightPopup() {
  document.getElementById('copyrightPopup').style.display = 'none';
}

// ─────────────────────────────
// MUSIC PLAYER WITH PLAYLIST
// ─────────────────────────────

var audio = document.getElementById('bgMusic');
var musicPlayer = document.getElementById('musicPlayer');
var playIcon = document.getElementById('playIcon');
var musicTitle = document.querySelector('.music-title');

var isPlaying = false;

// ===== PLAYLIST =====
var songs = [

  {
    title: "RZ7 WILDFLOWER",
    src: "music/Wildflower MRZ.mp3"
  },{
    title: "RZ7 THE GANGSTA",
    src: "music/MRZ THE GANGSTA.mp3"
  },

  {
    title: "RZ7 FAMILY",
    src: "music/MRZ Family.mp3"
  },

  {
    title: "RZ7 ROLL",
    src: "music/MRZ_Roll.mp3"
  }

];

var currentSong = 0;

// ===== LOAD FIRST SONG =====
audio.src = songs[currentSong].src;
musicTitle.textContent = songs[currentSong].title;

// ===== DEFAULT VOLUME =====
audio.volume = 0.5;

// ===== ICON PATHS =====
var playPath  = 'M8 5v14l11-7z';
var pausePath = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

// PLAY / PAUSE
function toggleMusic() {

  if (isPlaying) {

    audio.pause();
    isPlaying = false;

    musicPlayer.classList.remove('playing');

    playIcon.querySelector('path')
      .setAttribute('d', playPath);

  } else {

    audio.play()
    .then(function() {

      isPlaying = true;

      musicPlayer.classList.add('playing');

      playIcon.querySelector('path')
        .setAttribute('d', pausePath);

    })
    .catch(function(err) {
      console.log('Playback blocked:', err);
    });

  }

}

// NEXT SONG
function nextSong() {

  currentSong++;

  if (currentSong >= songs.length) {
    currentSong = 0;
  }

  loadSong();

}

// PREVIOUS SONG
function prevSong() {

  currentSong--;

  if (currentSong < 0) {
    currentSong = songs.length - 1;
  }

  loadSong();

}

// LOAD SONG
function loadSong() {

  audio.src = songs[currentSong].src;

  musicTitle.textContent = songs[currentSong].title;

  if (isPlaying) {
    audio.play();
  }

}

// AUTO NEXT SONG
audio.addEventListener('ended', function() {
  nextSong();
});

// VOLUME CONTROL
function setVolume(val) {
  audio.volume = val;
}

// AUTO PLAY AFTER USER CLICK
var started = false;

document.addEventListener('click', function initMusic() {

  if (!started) {

    started = true;

    audio.play()
    .then(function() {

      isPlaying = true;

      musicPlayer.classList.add('playing');

      playIcon.querySelector('path')
        .setAttribute('d', pausePath);

    })
    .catch(function(err) {
      console.log(err);
    });

  }

}, { once: true });

// YOUR GAME LINK
const dinoGameURL = "https://sheikh-dino.netlify.app";

// TRACK GAME LOAD
let dinoLoaded = false;

// OPEN POPUP
function openDinoPopup() {

  const popup = document.getElementById('dinoPopup');

  popup.style.display = 'flex';

  // LOAD GAME ONLY ON FIRST OPEN
  if (!dinoLoaded) {

    const container =
      document.getElementById('dinoGameContainer');

    container.innerHTML = `
      <iframe
        src="${dinoGameURL}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;

    dinoLoaded = true;

  }

}

// CLOSE POPUP
function closeDinoPopup() {

  document
    .getElementById('dinoPopup')
    .style.display = 'none';

}

// CLOSE WHEN CLICKING OUTSIDE
document
.getElementById('dinoPopup')
.addEventListener('click', function(e) {

  if (e.target === this) {

    closeDinoPopup();

  }

});

// ESC KEY SUPPORT
document.addEventListener('keydown', function(e) {

  if (e.key === 'Escape') {

    closeDinoPopup();

  }

});