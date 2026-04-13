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
