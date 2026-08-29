
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

