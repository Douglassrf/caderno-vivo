/* cv-router.js — Roteador de views da Casa do Compositor */
(function () {
  'use strict';

    /* Move todas as cv-views para serem irmas diretas de cv-main */
      function flattenViews() {
          var main = document.cv-router.js?v=2">querySelector('.cv-main');
              if (!main) return;
                  document.querySelectorAll('.cv-view').forEach(function (v) {
                        if (v.parentElement !== main) {
                                main.appendChild(v);
                                      }
                                          });
                                            }

                                              /* Troca a view ativa */
                                                window.cvNav = function cvNav(view) {
                                                    document.querySelectorAll('.cv-view').forEach(function (v) {
                                                          v.classList.remove('active');
                                                              });
                                                                  var target = document.getElementById('cv-' + view);
                                                                      if (target) {
                                                                            target.classList.add('active');
                                                                                  target.scrollTop = 0;
                                                                                      }
                                                                                          document.querySelectorAll('[data-view]').forEach(function (btn) {
                                                                                                btn.classList.toggle('active', btn.dataset.view === view);
                                                                                                    });
                                                                                                      };

                                                                                                        /* Conecta botoes e corrige estrutura no DOMContentLoaded */
                                                                                                          document.addEventListener('DOMContentLoaded', function () {
                                                                                                              flattenViews();
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
                                                                                                                                                                        });

                                                                                                                                                                        }());