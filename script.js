
(function(){
  var controls = document.getElementById('log-controls');
  if (!controls) return;
  var tbody = document.getElementById('log-tbody');
  var countEl = document.getElementById('log-count');
  var emptyEl = document.getElementById('log-empty');
  var sortSelect = document.getElementById('log-sort');
  var state = { type: 'all', quality: 'all', sort: 'date-desc' };

  function applyFilter(){
    var rows = tbody.querySelectorAll('tr');
    var shown = 0;
    rows.forEach(function(row){
      var matchType = state.type === 'all' || row.getAttribute('data-type') === state.type;
      var matchQuality = state.quality === 'all' || row.getAttribute('data-quality') === state.quality;
      var visible = matchType && matchQuality;
      row.hidden = !visible;
      if (visible) shown++;
    });
    countEl.textContent = shown + ' of ' + rows.length + ' shown';
    emptyEl.hidden = shown !== 0;
  }

  function applySort(){
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    var qualityRank = { ok: 0, warn: 1, cut: 2 };
    rows.sort(function(a, b){
      switch (state.sort) {
        case 'date-asc':
          return a.getAttribute('data-date').localeCompare(b.getAttribute('data-date'));
        case 'date-desc':
          return b.getAttribute('data-date').localeCompare(a.getAttribute('data-date'));
        case 'quality':
          return qualityRank[a.getAttribute('data-quality')] - qualityRank[b.getAttribute('data-quality')];
        case 'type':
          return a.getAttribute('data-type').localeCompare(b.getAttribute('data-type')) ||
                 a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
        case 'alpha':
          return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
        default:
          return 0;
      }
    });
    rows.forEach(function(row){ tbody.appendChild(row); });
  }

  controls.querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      var group = chip.getAttribute('data-filter');
      var value = chip.getAttribute('data-value');
      state[group] = value;
      controls.querySelectorAll('.chip[data-filter="' + group + '"]').forEach(function(c){
        c.classList.toggle('active', c === chip);
      });
      applyFilter();
    });
  });

  sortSelect.addEventListener('change', function(){
    state.sort = sortSelect.value;
    applySort();
    applyFilter();
  });

  applySort();
  applyFilter();
})();

(function(){
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var imgEl = document.getElementById('lightbox-img');
  var counterEl = document.getElementById('lightbox-counter');
  var thumbsEl = document.getElementById('lightbox-thumbs');
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');
  var closeBtn = document.getElementById('lightbox-close');

  var currentImages = [];
  var currentIndex = 0;

  function fullSrc(thumbSrc){
    var i = thumbSrc.lastIndexOf('/');
    return thumbSrc.slice(0, i + 1) + 'full/' + thumbSrc.slice(i + 1);
  }

  function render(){
    var item = currentImages[currentIndex];
    imgEl.src = item.full;
    imgEl.alt = item.alt;
    counterEl.textContent = (currentIndex + 1) + ' / ' + currentImages.length;

    var single = currentImages.length <= 1;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
    thumbsEl.hidden = single;

    thumbsEl.querySelectorAll('.lightbox-thumb').forEach(function(t, i){
      t.classList.toggle('active', i === currentIndex);
      if (i === currentIndex) t.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
  }

  function buildThumbs(){
    thumbsEl.innerHTML = '';
    currentImages.forEach(function(item, i){
      var t = document.createElement('img');
      t.className = 'lightbox-thumb';
      t.src = item.thumb;
      t.alt = '';
      t.addEventListener('click', function(){
        currentIndex = i;
        render();
      });
      thumbsEl.appendChild(t);
    });
  }

  function open(images, index){
    currentImages = images;
    currentIndex = index;
    buildThumbs();
    render();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close(){
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function step(delta){
    if (currentImages.length <= 1) return;
    currentIndex = (currentIndex + delta + currentImages.length) % currentImages.length;
    render();
  }

  document.querySelectorAll('.strip').forEach(function(strip){
    var pins = Array.prototype.slice.call(strip.querySelectorAll('figure.pin img'));
    var images = pins.map(function(img){
      return { thumb: img.getAttribute('src'), full: fullSrc(img.getAttribute('src')), alt: img.getAttribute('alt') || '' };
    });
    pins.forEach(function(img, i){
      img.addEventListener('click', function(){
        open(images, i);
      });
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function(){ step(-1); });
  nextBtn.addEventListener('click', function(){ step(1); });

  lightbox.addEventListener('click', function(e){
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function(e){
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
})();

