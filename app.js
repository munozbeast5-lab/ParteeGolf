(function () {
  'use strict';

  const state = { eventType: '', pkg: '' };
  let currentPanel = 1;
  let selectedDate = null;
  let calMonth, calYear, maxDate;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const now = new Date();
    calMonth = now.getMonth();
    calYear = now.getFullYear();
    maxDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

    bindNav();
    bindBooking();
    bindFaq();
    bindPackageButtons();
  }

  // -- Nav (mobile hamburger) --
  function bindNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // -- FAQ accordion --
  function bindFaq() {
    document.querySelectorAll('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.parentElement.classList.toggle('open');
      });
    });
  }

  // -- Package CTA buttons in pricing section --
  function bindPackageButtons() {
    document.querySelectorAll('.btn-pkg').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const name = btn.getAttribute('data-pkg');
        startBooking(name);
      });
    });
  }

  function startBooking(pkgName) {
    state.pkg = pkgName;
    const hidden = document.getElementById('packageHidden');
    if (hidden) hidden.value = pkgName;
    const booking = document.getElementById('booking');
    if (booking) booking.scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { goToPanel(1); }, 250);
    setTimeout(function () {
      document.querySelectorAll('.pkg-option').forEach(function (el) {
        el.classList.remove('selected');
        if (el.getAttribute('data-pkg') === pkgName) el.classList.add('selected');
      });
    }, 400);
  }

  // -- Booking flow --
  function bindBooking() {
    document.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = parseInt(btn.getAttribute('data-goto'), 10);
        if (!validatePanel(currentPanel, target)) return;
        goToPanel(target);
      });
    });

    document.querySelectorAll('.event-option').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.event-option').forEach(function (e) { e.classList.remove('selected'); });
        el.classList.add('selected');
        state.eventType = el.getAttribute('data-event');
        const hidden = document.getElementById('eventTypeHidden');
        if (hidden) hidden.value = state.eventType;
      });
    });

    document.querySelectorAll('.pkg-option').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.pkg-option').forEach(function (e) { e.classList.remove('selected'); });
        el.classList.add('selected');
        state.pkg = el.getAttribute('data-pkg');
        const hidden = document.getElementById('packageHidden');
        if (hidden) hidden.value = state.pkg;
      });
    });

    document.querySelectorAll('.time-slot').forEach(function (el) {
      el.addEventListener('click', function () {
        document.querySelectorAll('.time-slot').forEach(function (e) { e.classList.remove('selected'); });
        el.classList.add('selected');
        const v = el.getAttribute('data-time');
        document.getElementById('eventTimeHidden').value = v;
      });
    });

    const calPrev = document.getElementById('calPrev');
    const calNext = document.getElementById('calNext');
    if (calPrev) calPrev.addEventListener('click', function () {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar();
    });
    if (calNext) calNext.addEventListener('click', function () {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    });

    const form = document.getElementById('bookingForm');
    if (form) form.addEventListener('submit', handleSubmit);

    const retry = document.getElementById('bookingRetry');
    if (retry) retry.addEventListener('click', function () {
      const err = document.getElementById('bookingError');
      if (err) err.hidden = true;
    });
  }

  function goToPanel(n) {
    const cur = document.getElementById('panel' + currentPanel);
    const next = document.getElementById('panel' + n);
    if (cur) cur.classList.remove('active');
    if (next) next.classList.add('active');
    for (let i = 1; i <= 6; i++) {
      const ps = document.getElementById('ps' + i);
      if (!ps) continue;
      ps.classList.remove('active', 'done');
      if (i < n) ps.classList.add('done');
      if (i === n) ps.classList.add('active');
    }
    if (n === 2) renderCalendar();
    if (n === 6) buildConfirm();
    currentPanel = n;
    const booking = document.getElementById('booking');
    if (booking) booking.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validatePanel(from, to) {
    if (to < from) return true;

    if (from === 1 && !state.eventType) {
      alert('Please select an event type to continue.');
      return false;
    }
    if (from === 2) {
      if (!document.getElementById('eventDateHidden').value) { alert('Please pick an event date.'); return false; }
      if (!document.getElementById('eventTimeHidden').value) { alert('Please choose a start time.'); return false; }
      if (!document.getElementById('guestCount').value) { alert('Please tell us your expected guest count.'); return false; }
      if (!document.getElementById('address').value.trim()) { alert('Please enter the event venue / address.'); return false; }
    }
    if (from === 3 && !state.pkg) {
      alert('Please choose a package (or "Custom") to continue.');
      return false;
    }
    if (from === 5) {
      const required = ['firstName', 'lastName', 'email', 'phone'];
      for (let i = 0; i < required.length; i++) {
        const el = document.getElementById(required[i]);
        if (!el.value.trim()) { el.focus(); el.classList.add('invalid'); alert('Please complete all required contact fields.'); return false; }
        el.classList.remove('invalid');
      }
      const email = document.getElementById('email');
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value.trim())) { email.classList.add('invalid'); email.focus(); alert('Please enter a valid email address.'); return false; }
      const phone = document.getElementById('phone');
      const digits = phone.value.replace(/\D/g, '');
      if (digits.length < 10) { phone.classList.add('invalid'); phone.focus(); alert('Please enter a valid phone number.'); return false; }
      const consents = ['consentContact', 'consentWaiver', 'consentAge'];
      for (let j = 0; j < consents.length; j++) {
        const c = document.getElementById(consents[j]);
        if (!c.checked) { alert('Please review and accept all required consents to continue.'); c.focus(); return false; }
      }
    }
    return true;
  }

  // -- Calendar --
  function renderCalendar() {
    const grid = document.getElementById('calGrid');
    const label = document.getElementById('calMonthLabel');
    if (!grid || !label) return;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const first = new Date(calYear, calMonth, 1);
    const last = new Date(calYear, calMonth + 1, 0);
    const startDay = first.getDay();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    label.textContent = months[calMonth] + ' ' + calYear;

    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');
    if (prevBtn) prevBtn.disabled = (calYear === today.getFullYear() && calMonth <= today.getMonth());
    if (nextBtn) nextBtn.disabled = (calYear === maxDate.getFullYear() && calMonth >= maxDate.getMonth());

    grid.innerHTML = '';

    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(function (d) {
      const node = document.createElement('div');
      node.className = 'cal-day-label';
      node.textContent = d;
      grid.appendChild(node);
    });

    for (let i = 0; i < startDay; i++) {
      const e = document.createElement('div');
      e.className = 'cal-day empty';
      grid.appendChild(e);
    }

    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(calYear, calMonth, d);
      const isPast = dt < today;
      const isBeyond = dt > maxDate;
      const isToday = dt.getTime() === today.getTime();
      const isSel = selectedDate && dt.getTime() === selectedDate.getTime();
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day';
      if (isPast || isBeyond) cell.classList.add('disabled');
      if (isToday) cell.classList.add('today');
      if (isSel) cell.classList.add('selected');
      cell.textContent = String(d);
      if (!isPast && !isBeyond) {
        cell.addEventListener('click', (function (y, m, dd) {
          return function () { pickDate(y, m, dd); };
        })(calYear, calMonth, d));
      } else {
        cell.disabled = true;
      }
      grid.appendChild(cell);
    }
  }

  function pickDate(y, m, d) {
    selectedDate = new Date(y, m, d);
    document.getElementById('eventDateHidden').value = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    renderCalendar();
  }

  // -- Confirmation summary --
  function buildConfirm() {
    const d = document.getElementById('eventDateHidden').value;
    const t = document.getElementById('eventTimeHidden').value;
    const addonsChecked = Array.from(document.querySelectorAll('input[name="addon"]:checked')).map(function (cb) { return cb.value; });
    document.getElementById('addonsHidden').value = addonsChecked.join(', ');

    const addonNotes = document.getElementById('addonNotes').value;
    const dash = '—';
    const rows = [
      ['Event Type', state.eventType || dash],
      ['Date', d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : dash],
      ['Time', t || dash],
      ['Address', document.getElementById('address').value || dash],
      ['Guests', document.getElementById('guestCount').value || dash],
      ['Setting', document.getElementById('indoorOutdoor').value || dash],
      ['Package', state.pkg || dash],
      ['Add-Ons', addonsChecked.length ? addonsChecked.join(', ') : 'None'],
      ['Notes', addonNotes || dash],
      ['Name', (document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value).trim() || dash],
      ['Email', document.getElementById('email').value || dash],
      ['Phone', document.getElementById('phone').value || dash],
    ];
    const box = document.getElementById('confirmBox');
    box.innerHTML = '';
    rows.forEach(function (r) {
      const row = document.createElement('div');
      row.className = 'confirm-row';
      const lab = document.createElement('span');
      lab.className = 'cr-label';
      lab.textContent = r[0];
      const val = document.createElement('span');
      val.className = 'cr-val';
      val.textContent = r[1];
      row.appendChild(lab);
      row.appendChild(val);
      box.appendChild(row);
    });
  }

  // -- Submit to Netlify Forms --
  function handleSubmit(e) {
    e.preventDefault();
    if (!validatePanel(5, 6)) return;

    const submitBtn = document.getElementById('bookingSubmitBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

    const form = e.target;
    const data = new FormData(form);
    const params = new URLSearchParams();
    data.forEach(function (value, key) {
      if (typeof value === 'string') params.append(key, value);
    });

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      showSuccess();
    }).catch(function () {
      showError();
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '🏌️ Confirm Request'; }
    });
  }

  function showSuccess() {
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('progressTrack').style.display = 'none';
    document.getElementById('bookingSuccess').style.display = 'block';
    const err = document.getElementById('bookingError');
    if (err) err.hidden = true;
  }

  function showError() {
    const err = document.getElementById('bookingError');
    if (err) err.hidden = false;
  }
})();
