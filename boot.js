/* boot.js — runs synchronously before styles.css / app.js so it can clear any
   stale service worker or Cache Storage entries left over from a prior broken
   deploy. Without this, a previously-registered worker (or Safari's aggressive
   asset cache) can keep serving an empty white page on the production origin
   long after the site has been fixed. Safe to leave in place: a no-op when
   nothing stale is present. */
(function () {
  'use strict';

  var SESSION_FLAG = 'pt_boot_cleaned_v1';

  try {
    if ('serviceWorker' in navigator && typeof navigator.serviceWorker.getRegistrations === 'function') {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        var hadAny = regs && regs.length > 0;
        if (regs && regs.length) {
          regs.forEach(function (reg) {
            try { reg.unregister(); } catch (e) {}
          });
        }
        if ('caches' in window) {
          caches.keys().then(function (keys) {
            keys.forEach(function (k) {
              try { caches.delete(k); } catch (e) {}
            });
            if (hadAny && !sessionStorage.getItem(SESSION_FLAG)) {
              try { sessionStorage.setItem(SESSION_FLAG, '1'); } catch (e) {}
              location.reload();
            }
          }).catch(function () {});
        } else if (hadAny && !sessionStorage.getItem(SESSION_FLAG)) {
          try { sessionStorage.setItem(SESSION_FLAG, '1'); } catch (e) {}
          location.reload();
        }
      }).catch(function () {});
    } else if ('caches' in window) {
      caches.keys().then(function (keys) {
        keys.forEach(function (k) {
          try { caches.delete(k); } catch (e) {}
        });
      }).catch(function () {});
    }
  } catch (e) {}
})();
