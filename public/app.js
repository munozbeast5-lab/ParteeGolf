// Booking state
const state = { eventType: '', pkg: '' };
let currentPanel = 1;
let selectedDate = null;
let calMonth, calYear, maxDate;

(function init() {
  const now = new Date();
  calMonth = now.getMonth();
  calYear = now.getFullYear();
  maxDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
})();

// Panel navigation
function goToPanel(n) {
  document.getElementById('panel' + currentPanel).classList.remove('active');
  document.getElementById('panel' + n).classList.add('active');
  for (let i = 1; i <= 6; i++) {
    const ps = document.getElementById('ps' + i);
    ps.classList.remove('active', 'done');
    if (i < n) ps.classList.add('done');
    if (i === n) ps.classList.add('active');
  }
  if (n === 2) renderCalendar();
  if (n === 6) buildConfirm();
  currentPanel = n;
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Event type select
function selectEvent(el, val) {
  document.querySelectorAll('.event-option').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  state.eventType = val;
}

// Package select
function selectPkg(el, val) {
  document.querySelectorAll('.pkg-option').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  state.pkg = val;
}

// Start booking from package buttons
function startBooking(pkgName) {
  state.pkg = pkgName;
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => goToPanel(1), 300);
  setTimeout(() => {
    document.querySelectorAll('.pkg-option').forEach(el => {
      if (el.querySelector('.po-name').textContent.includes(pkgName)) {
        el.classList.add('selected');
      }
    });
  }, 400);
}

// Calendar
function renderCalendar() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const first = new Date(calYear, calMonth, 1);
  const last = new Date(calYear, calMonth + 1, 0);
  const startDay = first.getDay();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  document.getElementById('calMonthLabel').textContent = months[calMonth] + ' ' + calYear;

  // Enable/disable nav buttons
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  prevBtn.disabled = (calYear === today.getFullYear() && calMonth <= today.getMonth());
  nextBtn.disabled = (calYear === maxDate.getFullYear() && calMonth >= maxDate.getMonth());

  let html = '';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    html += '<div class="cal-day-label">' + d + '</div>';
  });

  for (let i = 0; i < startDay; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const dt = new Date(calYear, calMonth, d);
    const isPast = dt < today;
    const isBeyond = dt > maxDate;
    const isToday = dt.getTime() === today.getTime();
    const isSel = selectedDate && dt.getTime() === selectedDate.getTime();
    let cls = 'cal-day';
    if (isPast || isBeyond) cls += ' disabled';
    if (isToday) cls += ' today';
    if (isSel) cls += ' selected';
    if (isPast || isBeyond) {
      html += '<div class="' + cls + '">' + d + '</div>';
    } else {
      html += '<div class="' + cls + '" onclick="pickDate(' + calYear + ',' + calMonth + ',' + d + ')">' + d + '</div>';
    }
  }

  document.getElementById('calGrid').innerHTML = html;
}

function calPrev() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}

function calNext() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

function pickDate(y, m, d) {
  selectedDate = new Date(y, m, d);
  document.getElementById('eventDateHidden').value = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  renderCalendar();
}

function selectTimeSlot(el, val) {
  document.querySelectorAll('.time-slot').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('eventTimeHidden').value = val;
}

// Build confirm summary
function buildConfirm() {
  const d = document.getElementById('eventDateHidden').value;
  const t = document.getElementById('eventTimeHidden').value;
  const addonsChecked = Array.from(document.querySelectorAll('#addonPicker input[type="checkbox"]:checked')).map(function(cb) { return cb.value; });
  const addonNotes = document.getElementById('addonNotes').value;
  const rows = [
    ['Event Type', state.eventType || '\u2014'],
    ['Date', d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '\u2014'],
    ['Time', t || '\u2014'],
    ['Address', document.getElementById('address').value || '\u2014'],
    ['Guests', document.getElementById('guestCount').value || '\u2014'],
    ['Setting', document.getElementById('indoorOutdoor').value || '\u2014'],
    ['Package', state.pkg || '\u2014'],
    ['Add-Ons', addonsChecked.length ? addonsChecked.join(', ') : 'None'],
    ['Notes', addonNotes || '\u2014'],
    ['Name', (document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value).trim() || '\u2014'],
    ['Email', document.getElementById('email').value || '\u2014'],
    ['Phone', document.getElementById('phone').value || '\u2014'],
  ];
  document.getElementById('confirmBox').innerHTML = rows.map(function(r) {
    return '<div class="confirm-row"><span class="cr-label">' + r[0] + '</span><span class="cr-val">' + r[1] + '</span></div>';
  }).join('');
}

// Submit booking
function submitBooking() {
  document.getElementById('bookingFormWrap').style.display = 'none';
  document.getElementById('progressTrack').style.display = 'none';
  document.getElementById('bookingSuccess').style.display = 'block';
}

// FAQ toggle
function toggleFaq(el) {
  el.parentElement.classList.toggle('open');
}
