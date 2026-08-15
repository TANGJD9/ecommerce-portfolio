/* 全局交互：导航 / 滚动显现 / 数字滚动 / 通用工具 */
(function () {
  'use strict';

  /* ---------- 移动端导航 ---------- */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
    });
    siteNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') siteNav.classList.remove('open');
    });
  }

  /* ---------- 滚动显现 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 数字滚动 ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var dur = 1200;
    var start = null;
    var decimals = (el.getAttribute('data-decimals') || '0') === '1' ? 1 : 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + (decimals ? val.toFixed(1) : Math.round(val).toLocaleString('en-US')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.count-up');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Tab 切换（data-tabs / data-tab 结构） ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    var btns = group.querySelectorAll('[data-tab]');
    var panes = document.querySelectorAll(group.getAttribute('data-tabs'));
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        panes.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var pane = document.querySelector(btn.getAttribute('data-tab'));
        if (pane) pane.classList.add('active');
        // 通知图表重绘
        window.dispatchEvent(new CustomEvent('tabchange', { detail: pane && pane.id }));
      });
    });
  });

  /* ---------- 进度条动画 ---------- */
  var bars = document.querySelectorAll('.bar i[data-w]');
  if (bars.length && 'IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute('data-w') + '%';
          bio.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) { bio.observe(b); });
  } else {
    bars.forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
  }

  /* ---------- 迷你条形图动画 ---------- */
  var mbars = document.querySelectorAll('.mini-bar .track i[data-w]');
  if (mbars.length && 'IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute('data-w') + '%';
          mio.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    mbars.forEach(function (b) { mio.observe(b); });
  } else {
    mbars.forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
  }

  /* ---------- 年份 ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
