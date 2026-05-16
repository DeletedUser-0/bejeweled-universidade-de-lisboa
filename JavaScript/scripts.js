/*
ITW 25/26 Grupo 50

David Coelho 65929 - PL 23
Miguel Horta 62208 - PL 23
Rodrigo Duarte 60354 - PL 23
*/

/* ==================== MUSICA ==================== */
(function () {
  var audio = document.querySelector('.bg-music');
  var btn = document.querySelector('.music-toggle');
  var icon = btn && btn.querySelector('.music-toggle__icon');
  if (!audio || !btn || !icon) return;

  btn.addEventListener('click', function () {
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().then(function () {
        icon.src = 'Media/sound.png';
      }).catch(function () {
        icon.src = 'Media/mute.png';
      });
    } else {
      audio.pause();
      icon.src = 'Media/mute.png';
    }
  });
})();

(function () {
  var audio = document.querySelector('.bg-music');
  var slider = document.getElementById('volume-slider');
  if (!audio || !slider) return;
  var k = 'volumeMusicaBejeweled';
  var g = localStorage.getItem(k);
  if (g !== null) {
    var n = parseInt(g, 10);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      slider.value = n;
      audio.volume = n / 100;
    }
  }
  slider.oninput = function () {
    var p = parseFloat(slider.value);
    localStorage.setItem(k, String(Math.round(p)));
    audio.volume = p / 100;
  };
})();

/* ==================== TABULEIRO ==================== */
(function () {
  var grid = document.querySelector('.tabuleiro-grid');
  if (!grid) return;

  /* ---------- Constantes ---------- */
  var LINHAS = 8;
  var COLUNAS = 8;
  var TIPOS = ['vermelha', 'laranja', 'amarela', 'verde', 'azul', 'rosa', 'cinzenta'];
  var CAMINHO_MEDIA = 'Media/joia_';

  /* ---------- Estado do jogo ---------- */
  var tabuleiro = [];
  var celulas = [];
  var primeiraJoia = null;
  var jogoAtivo = false;
  var pontuacao = 0;
  var joiasEliminadas = 0;
  var joiasFaltam = 20;
  var timerSegundos = 0;
  var timerIntervalo = null;

  /* ---------- Elementos de stats ---------- */
  var statsItems = document.querySelectorAll('.stats-item');

  /* ---------- Carregar estado do localStorage ---------- */
  function carregarEstado() {
    var estadoGuardado = localStorage.getItem('bejeweledEstado');
    if (estadoGuardado) {
      try {
        var estado = JSON.parse(estadoGuardado);
        pontuacao = estado.pontuacao || 0;
        joiasEliminadas = estado.joiasEliminadas || 0;
        joiasFaltam = estado.joiasFaltam !== undefined ? estado.joiasFaltam : 20;
        timerSegundos = estado.timerSegundos || 0;
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /* ---------- Guardar estado no localStorage ---------- */
  function guardarEstado() {
    var estado = {
      pontuacao: pontuacao,
      joiasEliminadas: joiasEliminadas,
      joiasFaltam: joiasFaltam,
      timerSegundos: timerSegundos
    };
    localStorage.setItem('bejeweledEstado', JSON.stringify(estado));
  }

  /* ---------- Atualizar stats no ecra ---------- */
  function atualizarStats() {
    if (statsItems[0]) statsItems[0].textContent = 'Pontuacao: ' + pontuacao;
    if (statsItems[2]) statsItems[2].textContent = 'Numero de joias eliminadas: ' + joiasEliminadas;
    if (statsItems[3]) statsItems[3].textContent = 'Numero de joias que faltam eliminar: ' + joiasFaltam;
    guardarEstado();
  }

  /* ---------- Timer ---------- */
  function formatarTempo(seg) {
    var m = Math.floor(seg / 60);
    var s = seg % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function iniciarTimer() {
    if (timerIntervalo) clearInterval(timerIntervalo);
    timerIntervalo = setInterval(function () {
      timerSegundos++;
      if (statsItems[1]) statsItems[1].textContent = 'Tempo decorrido: ' + formatarTempo(timerSegundos);
      guardarEstado();
    }, 1000);
  }

  /* ---------- Gerar tabuleiro aleatorio sem 3 em linha ---------- */
  function gerarTabuleiro() {
    var valido = false;
    while (!valido) {
      tabuleiro = [];
      for (var l = 0; l < LINHAS; l++) {
        tabuleiro[l] = [];
        for (var c = 0; c < COLUNAS; c++) {
          tabuleiro[l][c] = TIPOS[Math.floor(Math.random() * TIPOS.length)];
        }
      }
      valido = !temTresEmLinha(tabuleiro);
    }
  }

  /* ---------- Verificar se ha 3+ do mesmo tipo em linha/coluna ---------- */
  function temTresEmLinha(tab) {
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c <= COLUNAS - 3; c++) {
        if (tab[l][c] !== null &&
            tab[l][c] === tab[l][c + 1] &&
            tab[l][c] === tab[l][c + 2]) {
          return true;
        }
      }
    }
    for (var c2 = 0; c2 < COLUNAS; c2++) {
      for (var l2 = 0; l2 <= LINHAS - 3; l2++) {
        if (tab[l2][c2] !== null &&
            tab[l2][c2] === tab[l2 + 1][c2] &&
            tab[l2][c2] === tab[l2 + 2][c2]) {
          return true;
        }
      }
    }
    return false;
  }

  /* ---------- Encontrar todos os grupos de 3+ a eliminar ---------- */
  function encontrarParaEliminar(tab) {
    var marcadas = [];
    var l, c;
    for (l = 0; l < LINHAS; l++) {
      marcadas[l] = [];
      for (c = 0; c < COLUNAS; c++) {
        marcadas[l][c] = false;
      }
    }

    /* linhas */
    for (l = 0; l < LINHAS; l++) {
      for (c = 0; c <= COLUNAS - 3; c++) {
        if (tab[l][c] !== null &&
            tab[l][c] === tab[l][c + 1] &&
            tab[l][c] === tab[l][c + 2]) {
          var fim = c + 2;
          while (fim + 1 < COLUNAS && tab[l][fim + 1] === tab[l][c]) {
            fim++;
          }
          for (var k = c; k <= fim; k++) {
            marcadas[l][k] = true;
          }
          c = fim;
        }
      }
    }

    /* colunas */
    for (var c2 = 0; c2 < COLUNAS; c2++) {
      for (var l2 = 0; l2 <= LINHAS - 3; l2++) {
        if (tab[l2][c2] !== null &&
            tab[l2][c2] === tab[l2 + 1][c2] &&
            tab[l2][c2] === tab[l2 + 2][c2]) {
          var fim2 = l2 + 2;
          while (fim2 + 1 < LINHAS && tab[fim2 + 1][c2] === tab[l2][c2]) {
            fim2++;
          }
          for (var k2 = l2; k2 <= fim2; k2++) {
            marcadas[k2][c2] = true;
          }
          l2 = fim2;
        }
      }
    }

    return marcadas;
  }

  /* ---------- Contar celulas marcadas ---------- */
  function contarMarcadas(marcadas) {
    var total = 0;
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (marcadas[l][c]) total++;
      }
    }
    return total;
  }

  /* ---------- Desenhar o tabuleiro no DOM ---------- */
  function desenharTabuleiro() {
    grid.innerHTML = '';
    celulas = [];
    for (var l = 0; l < LINHAS; l++) {
      celulas[l] = [];
      for (var c = 0; c < COLUNAS; c++) {
        var celula = document.createElement('div');
        celula.className = 'celula-tabuleiro';
        celula.dataset.linha = l;
        celula.dataset.coluna = c;

        var img = document.createElement('img');
        img.className = 'joia-imagem';
        img.alt = 'joia';

        if (tabuleiro[l][c] !== null) {
          img.src = CAMINHO_MEDIA + tabuleiro[l][c] + '.png';
        } else {
          img.src = '';
          img.style.visibility = 'hidden';
        }

        celula.appendChild(img);
        celula.addEventListener('click', aoClicarCelula);
        grid.appendChild(celula);
        celulas[l][c] = celula;
      }
    }
  }

  /* ---------- Atualizar imagem de uma celula ---------- */
  function atualizarCelula(l, c) {
    var celula = celulas[l][c];
    if (!celula) return;
    var img = celula.querySelector('.joia-imagem');
    if (!img) return;
    if (tabuleiro[l][c] !== null) {
      img.src = CAMINHO_MEDIA + tabuleiro[l][c] + '.png';
      img.style.visibility = 'visible';
    } else {
      img.src = '';
      img.style.visibility = 'hidden';
    }
  }

  /* ---------- Remover selecao visual ---------- */
  function limparSelecao() {
    if (primeiraJoia) {
      celulas[primeiraJoia.linha][primeiraJoia.coluna].classList.remove('joia-selecionada');
    }
    primeiraJoia = null;
  }

  /* ---------- Mostrar popup de aviso ---------- */
  function mostrarAviso(msg) {
    var popup = document.getElementById('popup-aviso');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'popup-aviso';
      document.body.appendChild(popup);
    }
    popup.textContent = msg;
    popup.classList.add('popup-visivel');
    setTimeout(function () {
      popup.classList.remove('popup-visivel');
    }, 3000);
  }

  /* ---------- Verificar se duas posicoes sao adjacentes ---------- */
  function saoAdjacentes(l1, c1, l2, c2) {
    var difLinha = Math.abs(l1 - l2);
    var difColuna = Math.abs(c1 - c2);
    return (difLinha === 1 && difColuna === 0) || (difLinha === 0 && difColuna === 1);
  }

  /* ---------- Trocar duas joias no tabuleiro ---------- */
  function trocarJoias(l1, c1, l2, c2) {
    var temp = tabuleiro[l1][c1];
    tabuleiro[l1][c1] = tabuleiro[l2][c2];
    tabuleiro[l2][c2] = temp;
  }

  /* ---------- Verificar se uma troca cria 3 ou mais em linha ---------- */
  function trocaCriaEliminacao(l1, c1, l2, c2) {
    trocarJoias(l1, c1, l2, c2);
    var marcadas = encontrarParaEliminar(tabuleiro);
    var temElim = contarMarcadas(marcadas) > 0;
    trocarJoias(l1, c1, l2, c2);
    return temElim;
  }

  /* ---------- Eliminar joias marcadas ---------- */
  function eliminarJoias(marcadas) {
    var quantidade = 0;
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (marcadas[l][c]) {
          tabuleiro[l][c] = null;
          atualizarCelula(l, c);
          quantidade++;
        }
      }
    }
    return quantidade;
  }

  /* ---------- Fazer descer joias para preencher espacos vazios ---------- */
  function descerJoias() {
    for (var c = 0; c < COLUNAS; c++) {
      for (var l = LINHAS - 1; l >= 0; l--) {
        if (tabuleiro[l][c] === null) {
          for (var l2 = l - 1; l2 >= 0; l2--) {
            if (tabuleiro[l2][c] !== null) {
              tabuleiro[l][c] = tabuleiro[l2][c];
              tabuleiro[l2][c] = null;
              atualizarCelula(l, c);
              atualizarCelula(l2, c);
              break;
            }
          }
        }
      }
    }
  }

  /* ---------- Processar eliminacoes em cascata ---------- */
  function processarCascata() {
    var marcadas = encontrarParaEliminar(tabuleiro);
    var quantidade = contarMarcadas(marcadas);

    if (quantidade > 0) {
      var eliminadas = eliminarJoias(marcadas);
      joiasEliminadas += eliminadas;
      pontuacao += eliminadas * 10;
      if (joiasFaltam > 0) {
        joiasFaltam = Math.max(0, joiasFaltam - eliminadas);
      }
      atualizarStats();
      descerJoias();
      processarCascata();
    } else {
      /* Sem mais eliminacoes por cascata - preencher os espacos vazios */
      preencherVaziosSeguro();
      jogoAtivo = true;
    }
  }

  /* ---------- Preencher espacos vazios de forma segura (sem causar eliminacao) ---------- */
  function preencherVaziosSeguro() {
    /* Guardar quais posicoes estao vazias */
    var posicoesvazias = [];
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (tabuleiro[l][c] === null) {
          posicoesvazias.push({ linha: l, coluna: c });
        }
      }
    }

    if (posicoesvazias.length === 0) return;

    /* Tentar preencher as posicoes vazias sem causar eliminacao */
    var valido = false;
    while (!valido) {
      /* Preencher cada posicao vazia com uma joia aleatoria */
      for (var i = 0; i < posicoesvazias.length; i++) {
        var pos = posicoesvazias[i];
        tabuleiro[pos.linha][pos.coluna] = TIPOS[Math.floor(Math.random() * TIPOS.length)];
      }
      /* Verificar se o tabuleiro agora tem eliminacoes */
      var marcadas = encontrarParaEliminar(tabuleiro);
      if (contarMarcadas(marcadas) === 0) {
        valido = true;
      } else {
        /* Voltar a por null nas posicoes vazias e tentar outra vez */
        for (var j = 0; j < posicoesvazias.length; j++) {
          var pos2 = posicoesvazias[j];
          tabuleiro[pos2.linha][pos2.coluna] = null;
        }
      }
    }

    /* Mostrar as joias novas no DOM */
    for (var k = 0; k < posicoesvazias.length; k++) {
      var pos3 = posicoesvazias[k];
      atualizarCelula(pos3.linha, pos3.coluna);
    }
  }

  /* ---------- Ao clicar numa celula ---------- */
  function aoClicarCelula(evento) {
    if (!jogoAtivo) return;

    var celula = evento.currentTarget;
    var l = parseInt(celula.dataset.linha);
    var c = parseInt(celula.dataset.coluna);

    if (tabuleiro[l][c] === null) return;

    if (primeiraJoia === null) {
      primeiraJoia = { linha: l, coluna: c };
      celula.classList.add('joia-selecionada');

    } else if (primeiraJoia.linha === l && primeiraJoia.coluna === c) {
      limparSelecao();

    } else if (saoAdjacentes(primeiraJoia.linha, primeiraJoia.coluna, l, c)) {
      var l1 = primeiraJoia.linha;
      var c1 = primeiraJoia.coluna;

      if (trocaCriaEliminacao(l1, c1, l, c)) {
        limparSelecao();
        jogoAtivo = false;
        trocarJoias(l1, c1, l, c);
        atualizarCelula(l1, c1);
        atualizarCelula(l, c);
        processarCascata();
      } else {
        limparSelecao();
        mostrarAviso('Uma troca de joias so e permitida se fizer com que tres ou mais joias iguais fiquem alinhadas na horizontal ou na vertical');
      }

    } else {
      limparSelecao();
      primeiraJoia = { linha: l, coluna: c };
      celula.classList.add('joia-selecionada');
    }
  }

  /* ---------- Iniciar o jogo ---------- */
  function iniciarJogo() {
    carregarEstado();
    gerarTabuleiro();
    desenharTabuleiro();
    atualizarStats();
    if (statsItems[1]) statsItems[1].textContent = 'Tempo decorrido: ' + formatarTempo(timerSegundos);
    iniciarTimer();
    jogoAtivo = true;
  }

  iniciarJogo();

})();