/* cv-router.js — Roteador de views da Casa do Compositor */
(function () {
  'use strict';

    /* Troca a view ativa */
      window.cvNav = function cvNav(view) {
          // oculta todas as views
              document.querySelectorAll('.cv-view').forEach(function (v) {
                    v.classList.remove('active');
                        });
                            // mostra a view alvo
                                var target = document.getElementById('cv-' + view);
                                    if (target) {
                                          target.classList.add('active');
                                                target.scrollTop = 0;
                                                    }
                                                        // atualiza o estado ativo nos botoes da sidebar
                                                            document.querySelectorAll('[data-view]').forEach(function (btn) {
                                                                  btn.classList.toggle('active', btn.dataset.view === view);
                                                                      });
                                                                        };

                                                                          /* Conecta os botoes da sidebar ao roteador */
                                                                            document.addEventListener('DOMContentLoaded', function () {
                                                                                document.querySelectorAll('[data-view]').forEach(function (btn) {
                                                                                      btn.addEventListener('click', function () {
                                                                                              window.cvNav(btn.dataset.view);
                                                                                                    });
                                                                                                        });
                                                                                                            /* Conecta os cards de sala (data-room) */
                                                                                                                document.querySelectorAll('[data-room]').forEach(function (card) {
                                                                                                                      card.addEventListener('click', function () {
                                                                                                                              window.cvNav(card.dataset.room);
                                                                                                                                    });
                                                                                                                                        });
                                                                                                                                          });

                                                                                                                                          }());