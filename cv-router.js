/* cv-router.js — Roteador de views da Casa do Compositor */
(function () {
    'use strict';

   function flattenViews() {
         var main = document.querySelector('.cv-main');
         if (!main) return;
         document.querySelectorAll('.cv-view').forEach(function (v) {
                 if (v.parentElement !== main) {
                           main.appendChild(v);
                 }
         });
   }

   function normalizeViewId(view) {
         var raw = String(view || '').trim();
         return raw.indexOf('cv-') === 0 ? raw : 'cv-' + raw;
   }

   function normalizeViewKey(viewId) {
         return String(viewId || '').replace(/^cv-/, '');
   }

   window.cvNav = function cvNav(view) {
         var viewId = normalizeViewId(view);
         var viewKey = normalizeViewKey(viewId);
         document.querySelectorAll('.cv-view').forEach(function (v) {
                 v.classList.remove('active');
                 v.style.display = 'none';
         });
         var target = document.getElementById(viewId);
         if (target) {
                 target.style.display = '';
                 target.classList.add('active');
                 target.scrollTop = 0;
         }
         document.querySelectorAll('[data-view]').forEach(function (btn) {
                 btn.classList.toggle('active', btn.dataset.view === viewKey || btn.dataset.view === viewId);
         });
         document.dispatchEvent(new CustomEvent('cv:navigate', { detail: { to: viewId } }));
   };

   document.addEventListener('DOMContentLoaded', function () {
         flattenViews();
         document.querySelectorAll('.cv-view').forEach(function (v) {
                 if (!v.classList.contains('active')) v.style.display = 'none';
         });
         document.querySelectorAll('[data-view]').forEach(function (btn) {
                 btn.addEventListener('click', function () {
                           window.cvNav(btn.dataset.view);
                 });
         });
         document.querySelectorAll('[data-room]').forEach(function (card) {
                 card.addEventListener('click', function () {
                           window.cvNav(card.dataset.room);
                 });
         });
           document.querySelectorAll('[onclick*="cvNav("]').forEach(function (el) {
                     var m = (el.getAttribute('onclick') || '').match(/cvNav\('([^']+)'\)/);
                     if (m) { (function(v){ el.addEventListener('click', function(){ window.cvNav(v); }); })(m[1]); }
           });
   });

}());
