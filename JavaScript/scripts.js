/*
ITW 25/26 Grupo 50

David Coelho 65929 - PL 23
Miguel Horta 62208 - PL 23
Rodrigo Duarte 60354 - PL 23
*/

(function () {
  var audio = document.querySelector('.bg-music');
  var btn = document.querySelector('.music-toggle');
  var icon = btn && btn.querySelector('.music-toggle__icon');
  if (!audio || !btn || !icon) return;

  btn.addEventListener('click', function () {
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().then(function () {
        icon.src = 'Media/sound.png';
      }).catch(function () {
        icon.src = 'Media/mute.png';
      });
    } else {
      audio.pause();
      icon.src = 'Media/mute.png';
    }
  });
})();

(function () {
  var audio = document.querySelector('.bg-music');
  var slider = document.getElementById('volume-slider');
  if (!audio || !slider) return;
  var k = 'volumeMusicaBejeweled';
  var g = localStorage.getItem(k);
  if (g !== null) {
    var n = parseInt(g, 10);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      slider.value = n;
      audio.volume = n / 100;
    }
  }
  slider.oninput = function () {
    var p = parseFloat(slider.value);
    localStorage.setItem(k, String(Math.round(p)));
    audio.volume = p / 100;
  };
})();
