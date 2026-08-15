/* 商品落地页：主图切换 */
(function () {
  'use strict';
  var mainImg = document.getElementById('mainImg');
  var caption = document.getElementById('imgCaption');
  var thumbs = document.querySelectorAll('#galleryThumbs span[data-img]');
  if (!mainImg || !thumbs.length) return;
  thumbs.forEach(function (th) {
    th.addEventListener('click', function () {
      mainImg.src = th.getAttribute('data-img');
      if (caption) caption.textContent = th.getAttribute('data-cap') || '';
      thumbs.forEach(function (t) {
        t.style.border = '2px solid var(--line)';
        t.style.borderColor = '#d7deeb';
      });
      th.style.border = '2px solid var(--accent)';
      th.style.borderColor = '#ff6a13';
    });
  });
})();
