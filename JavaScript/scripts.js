/*
ITW 25/26 Grupo 50

David Coelho 65929 - PL 23
Miguel Horta 62208 - PL 23
Rodrigo Duarte 60354 - PL 23
*/

/* ==================== MUSICA ==================== */
// Liga e desliga a música quando o utilizador carrega no botão do som.
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

// Controla o volume da música e guarda o valor escolhido no localStorage.
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

/* ==================== DADOS DOS UTILIZADORES ==================== */
var CHAVE_UTILIZADORES = 'bejeweledUtilizadores';
var CHAVE_UTILIZADOR_ATUAL = 'bejeweledUtilizadorAtual';
var CHAVE_UTILIZADOR_ATUAL_2 = 'bejeweledUtilizadorAtual2';

// Cria os utilizadores que já existem no jogo quando ainda não há dados guardados.
function utilizadoresPredefinidos() {
  return [
    { email: 'pedro@bejeweled.local', password: '1234', avatar: 'a.png', nome: 'pedro', jogos: 31, jogos2: 0, tempo: 3303, pontos: 15100 },
    { email: 'joao@bejeweled.local', password: '1234', avatar: 'b.png', nome: 'joao', jogos: 18, jogos2: 0, tempo: 2535, pontos: 12450 },
    { email: 'martim@bejeweled.local', password: '1234', avatar: 'c.png', nome: 'martim', jogos: 9, jogos2: 0, tempo: 4120, pontos: 8920 }
  ];
}

// Retira a parte do email que aparece antes do @ para usar como nome do jogador.
function obterNomeDoEmail(email) {
  return email.split('@')[0];
}

// Vai buscar os utilizadores ao localStorage e prepara a lista para evitar dados repetidos.
function carregarUtilizadores() {
  var dados = localStorage.getItem(CHAVE_UTILIZADORES);
  var utilizadores;

  if (dados === null) {
    utilizadores = utilizadoresPredefinidos();
  } else {
    try {
      utilizadores = JSON.parse(dados);
    } catch (e) {
      utilizadores = utilizadoresPredefinidos();
    }
  }

  if (!Array.isArray(utilizadores)) utilizadores = [];

  /*
    Limpa utilizadores repetidos que possam ter ficado guardados
    em versões anteriores do trabalho.
  */
  var limpos = [];

  function prepararUtilizador(u) {
    if (!u) return null;

    var email = String(u.email || '').toLowerCase().trim();
    var nome = String(u.nome || '').toLowerCase().trim();

    if (email.indexOf('@') !== -1) {
      nome = obterNomeDoEmail(email).toLowerCase();
    } else if (nome !== '') {
      email = nome + '@bejeweled.local';
    } else {
      return null;
    }

    return {
      email: email,
      password: String(u.password || '1234'),
      avatar: u.avatar || 'a.png',
      nome: nome,
      jogos: Number(u.jogos) || 0,
      jogos2: Number(u.jogos2) || 0,
      tempo: Number(u.tempo) || 0,
      pontos: Number(u.pontos) || 0
    };
  }

  function juntarUtilizador(novo) {
    if (novo === null) return;

    for (var i = 0; i < limpos.length; i++) {
      if (limpos[i].email === novo.email || limpos[i].nome === novo.nome) {
        /* Mantem apenas uma linha por utilizador. */
        limpos[i].email = novo.email.indexOf('@bejeweled.local') === -1 ? novo.email : limpos[i].email;
        limpos[i].password = limpos[i].password || novo.password;
        limpos[i].avatar = limpos[i].avatar || novo.avatar;
        limpos[i].jogos = Math.max(limpos[i].jogos, novo.jogos);
        limpos[i].jogos2 = Math.max(limpos[i].jogos2 || 0, novo.jogos2 || 0);
        limpos[i].tempo = Math.max(limpos[i].tempo, novo.tempo);
        limpos[i].pontos = Math.max(limpos[i].pontos, novo.pontos);
        return;
      }
    }

    limpos.push(novo);
  }

  for (var i = 0; i < utilizadores.length; i++) {
    juntarUtilizador(prepararUtilizador(utilizadores[i]));
  }

  var predefinidos = utilizadoresPredefinidos();
  for (var p = 0; p < predefinidos.length; p++) {
    juntarUtilizador(prepararUtilizador(predefinidos[p]));
  }

  guardarUtilizadores(limpos);
  return limpos;
}
// Guarda a lista atualizada de utilizadores no localStorage.
function guardarUtilizadores(utilizadores) {
  localStorage.setItem(CHAVE_UTILIZADORES, JSON.stringify(utilizadores));
}

// Procura um utilizador através do email escrito no login ou no registo.
function procurarUtilizadorPorEmail(email) {
  var utilizadores = carregarUtilizadores();
  email = email.toLowerCase();
  for (var i = 0; i < utilizadores.length; i++) {
    if (utilizadores[i].email === email) return utilizadores[i];
  }
  return null;
}

// Verifica se o email tem um formato básico válido.
function emailValido(email) {
  email = email.toLowerCase().trim();
  var partes = email.split('@');
  if (partes.length !== 2) return false;
  if (partes[0] === '' || partes[1] === '') return false;
  if (email.indexOf(' ') !== -1) return false;
  if (partes[1].indexOf('.') === -1) return false;
  return true;
}

// Mostra uma mensagem de erro vermelha ao lado do campo indicado durante poucos segundos.
function mostrarErro(elemento, texto) {
  if (!elemento) return;

  var erro = document.querySelector('[data-erro-de="' + elemento.id + '"]');

  if (!erro) {
    erro = document.createElement('span');
    erro.className = 'mensagem-erro';
    erro.setAttribute('data-erro-de', elemento.id);
    document.body.appendChild(erro);
  }

  var retangulo = elemento.getBoundingClientRect();
  erro.textContent = texto;
  erro.style.position = 'fixed';
  erro.style.left = (retangulo.right + 10) + 'px';
  erro.style.top = (retangulo.top + (retangulo.height / 2) - 12) + 'px';
  erro.style.display = 'inline-block';

  setTimeout(function () {
    erro.textContent = '';
    erro.style.display = 'none';
  }, 3000);
}

// Mostra uma mensagem de erro quando o utilizador não escolhe avatar no registo.
function mostrarErroAvatar(texto) {
  var caixa = document.querySelector('.avatar-container');
  if (!caixa) return;
  var erro = document.getElementById('erro-avatar');
  if (!erro) {
    erro = document.createElement('span');
    erro.id = 'erro-avatar';
    erro.className = 'mensagem-erro';
    caixa.insertAdjacentElement('afterend', erro);
  }
  erro.textContent = texto;
  erro.style.display = 'block';
  setTimeout(function () {
    erro.textContent = '';
    erro.style.display = 'none';
  }, 3000);
}

/* ==================== REGISTO ==================== */
// Trata do formulário de registo, valida os dados e cria um novo utilizador.
(function () {
  var botao = document.getElementById('btn-registo');
  if (!botao) return;

  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var password2 = document.getElementById('password2');
  var data = document.getElementById('data-de-nascimento');
  if (data) {
    data.setAttribute('min', '1909-01-01');
    data.setAttribute('max', '2026-12-31');
  }
  var avatares = document.querySelectorAll('input[name="avatar"]');

  function avatarEscolhido() {
    for (var i = 0; i < avatares.length; i++) {
      if (avatares[i].checked) return avatares[i].value;
    }
    return '';
  }

  function atualizarBotao() {
    var tudoPreenchido = email.value.trim() !== '' && password.value !== '' && password2.value !== '' && data.value !== '' && avatarEscolhido() !== '';
    botao.disabled = !tudoPreenchido;
  }

  email.addEventListener('input', function () {
    email.value = email.value.toLowerCase();
    atualizarBotao();
  });
  password.addEventListener('input', atualizarBotao);
  password2.addEventListener('input', atualizarBotao);
  data.addEventListener('input', atualizarBotao);
  for (var i = 0; i < avatares.length; i++) avatares[i].addEventListener('change', atualizarBotao);

  botao.addEventListener('click', function () {
    var ok = true;
    var emailNormalizado = email.value.toLowerCase().trim();
    email.value = emailNormalizado;

    if (!emailValido(emailNormalizado)) {
      mostrarErro(email, 'Email inválido');
      ok = false;
    } else if (procurarUtilizadorPorEmail(emailNormalizado) !== null) {
      mostrarErro(email, 'Este email já está registado');
      ok = false;
    }

    if (password.value !== password2.value) {
      mostrarErro(password2, 'As palavras-passe têm de coincidir');
      ok = false;
    }

    var partesData = data.value.split('-');
    var ano = partesData[0];
    var anoNumero = parseInt(ano, 10);

    if (data.value.length !== 10 || partesData.length !== 3 || ano.length !== 4 || isNaN(anoNumero)) {
      mostrarErro(data, 'O ano tem de ter 4 dígitos');
      ok = false;
    } else if (anoNumero < 1909 || anoNumero > 2026) {
      mostrarErro(data, 'O ano tem de estar entre 1909 e 2026');
      ok = false;
    } else if (anoNumero > 2014) {
      mostrarErro(data, 'A idade mínima permitida é de 12 anos');
      ok = false;
    }

    var avatar = avatarEscolhido();
    if (avatar === '') {
      mostrarErroAvatar('Tem de escolher um avatar');
      ok = false;
    }

    if (!ok) return;

    var utilizadores = carregarUtilizadores();
    utilizadores.push({
      email: emailNormalizado,
      password: password.value,
      avatar: avatar,
      nome: obterNomeDoEmail(emailNormalizado),
      jogos: 0,
      jogos2: 0,
      tempo: 0,
      pontos: 0
    });
    guardarUtilizadores(utilizadores);
    localStorage.setItem(CHAVE_UTILIZADOR_ATUAL, emailNormalizado);
    window.location.href = 'index.html';
  });

  atualizarBotao();
})();

/* ==================== LOGIN ==================== */
// Trata do login normal de um jogador.
(function () {
  var botao = document.getElementById('btn-login');
  if (!botao) return;

  var email = document.getElementById('email');
  var password = document.getElementById('password');

  email.addEventListener('input', function () {
    email.value = email.value.toLowerCase();
  });

  botao.addEventListener('click', function () {
    var emailNormalizado = email.value.toLowerCase().trim();
    email.value = emailNormalizado;
    var utilizador = procurarUtilizadorPorEmail(emailNormalizado);

    if (utilizador === null) {
      mostrarErro(email, 'Este email não está registado');
      return;
    }

    if (utilizador.password !== password.value) {
      mostrarErro(password, 'Palavra-passe incorreta');
      return;
    }

    localStorage.setItem(CHAVE_UTILIZADOR_ATUAL, emailNormalizado);
    window.location.href = 'menu.html';
  });
})();



/* ==================== LOGIN DOIS JOGADORES ==================== */
// Valida o login dos dois jogadores antes de entrar no modo de dois jogadores.
(function () {
  var botao = document.getElementById('btn-login-dois');
  if (!botao) return;

  var email1 = document.getElementById('email-jogador1');
  var pass1 = document.getElementById('password-jogador1');
  var email2 = document.getElementById('email-jogador2');
  var pass2 = document.getElementById('password-jogador2');

  email1.addEventListener('input', function () { email1.value = email1.value.toLowerCase(); });
  email2.addEventListener('input', function () { email2.value = email2.value.toLowerCase(); });

  botao.addEventListener('click', function () {
    var e1 = email1.value.toLowerCase().trim();
    var e2 = email2.value.toLowerCase().trim();
    email1.value = e1;
    email2.value = e2;

    var u1 = procurarUtilizadorPorEmail(e1);
    var u2 = procurarUtilizadorPorEmail(e2);
    var ok = true;

    if (u1 === null) {
      mostrarErro(email1, 'Este email não está registado');
      ok = false;
    } else if (u1.password !== pass1.value) {
      mostrarErro(pass1, 'Palavra-passe incorreta');
      ok = false;
    }

    if (u2 === null) {
      mostrarErro(email2, 'Este email não está registado');
      ok = false;
    } else if (u2.password !== pass2.value) {
      mostrarErro(pass2, 'Palavra-passe incorreta');
      ok = false;
    }

    if (e1 !== '' && e1 === e2) {
      mostrarErro(email2, 'Escolha outro utilizador');
      ok = false;
    }

    if (!ok) return;

    localStorage.setItem(CHAVE_UTILIZADOR_ATUAL, e1);
    localStorage.setItem(CHAVE_UTILIZADOR_ATUAL_2, e2);
    window.location.href = 'tabuleiro-dois-jogadores.html';
  });
})();

/* ==================== TABELAS DE ESTATISTICAS ==================== */
// Converte segundos para o formato usado nas tabelas de estatísticas.
function formatarTempoTabela(segundos) {
  var minutos = Math.floor(segundos / 60);
  var seg = segundos % 60;
  return minutos + ' min ' + (seg < 10 ? '0' : '') + seg + ' s';
}

// Coloca espaços nos pontos para serem mais fáceis de ler.
function formatarPontos(pontos) {
  return String(pontos).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Ordena os utilizadores por pontuação, tempo e nome, mostrando apenas os dez melhores.
function utilizadoresOrdenados() {
  var utilizadores = carregarUtilizadores();
  utilizadores.sort(function (a, b) {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (a.tempo !== b.tempo) return a.tempo - b.tempo;
    return a.nome.localeCompare(b.nome);
  });
  return utilizadores.slice(0, 10);
}

(function () {
  var tabela = document.querySelector('.estatisticas-tabela tbody');
  if (!tabela) return;

  var utilizadores = utilizadoresOrdenados();
  tabela.innerHTML = '';

  for (var i = 0; i < utilizadores.length; i++) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<th scope="row">' + utilizadores[i].nome + '</th>' +
      '<td>' + utilizadores[i].jogos + '</td>' +
      '<td>' + (utilizadores[i].jogos2 || 0) + '</td>' +
      '<td>' + formatarTempoTabela(utilizadores[i].tempo) + '</td>' +
      '<td>' + formatarPontos(utilizadores[i].pontos) + '</td>';
    tabela.appendChild(tr);
  }
})();



/* ==================== TABULEIRO DOIS JOGADORES ==================== */
// Código responsável pelo modo de jogo com dois jogadores.
(function () {
  var grid = document.querySelector('.tabuleiro-grid-dois');
  if (!grid) return;

  var LINHAS = 10;
  var COLUNAS = 10;
  var TIPOS = ['vermelha', 'laranja', 'amarela', 'verde', 'azul', 'rosa', 'cinzenta'];
  var CAMINHO_MEDIA = 'Media/joia_';

  var tabuleiro = [];
  var celulas = [];
  var primeiraJoia = null;
  var jogoAtivo = false;
  var timerIntervalo = null;
  var jogoConcluido = false;
  var jogoJaTerminou = false;
  var jogadorAtual = 0;
  var turnosFeitos = [0, 0];

  var jogadores = [
    { email: localStorage.getItem(CHAVE_UTILIZADOR_ATUAL), nome: 'jogador1', pontos: 0, tempo: 0, joias: 0 },
    { email: localStorage.getItem(CHAVE_UTILIZADOR_ATUAL_2), nome: 'jogador2', pontos: 0, tempo: 0, joias: 0 }
  ];

  var u1 = jogadores[0].email ? procurarUtilizadorPorEmail(jogadores[0].email) : null;
  var u2 = jogadores[1].email ? procurarUtilizadorPorEmail(jogadores[1].email) : null;
  if (u1) jogadores[0].nome = u1.nome;
  if (u2) jogadores[1].nome = u2.nome;

  // Converte segundos para minutos e segundos no formato 00:00.
  function formatarTempo(seg) {
    var m = Math.floor(seg / 60);
    var s = seg % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Atualiza no ecrã os pontos, o tempo e as joias eliminadas dos dois jogadores.
  function atualizarStatsDois() {
    document.getElementById('nome-jogador1').textContent = 'Jogador ' + jogadores[0].nome;
    document.getElementById('pontos-jogador1').textContent = 'Pontuação: ' + jogadores[0].pontos;
    document.getElementById('tempo-jogador1').textContent = 'Tempo decorrido: ' + formatarTempo(jogadores[0].tempo);
    document.getElementById('joias-jogador1').textContent = 'Número de joias eliminadas: ' + jogadores[0].joias;

    document.getElementById('nome-jogador2').textContent = 'Jogador ' + jogadores[1].nome;
    document.getElementById('pontos-jogador2').textContent = 'Pontuação: ' + jogadores[1].pontos;
    document.getElementById('tempo-jogador2').textContent = 'Tempo decorrido: ' + formatarTempo(jogadores[1].tempo);
    document.getElementById('joias-jogador2').textContent = 'Número de joias eliminadas: ' + jogadores[1].joias;

    document.getElementById('caixa-jogador1').classList.toggle('jogador-ativo', jogadorAtual === 0);
    document.getElementById('caixa-jogador2').classList.toggle('jogador-ativo', jogadorAtual === 1);
  }

  // Pequena função auxiliar para fazer pausas nas animações.
  function esperar(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // Gera um tabuleiro novo sem eliminações automáticas e com jogadas possíveis.
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
      valido = !temTresEmLinha(tabuleiro) && existeJogadaPossivel();
    }
  }

  // Verifica se já existem três ou mais joias iguais seguidas.
  function temTresEmLinha(tab) {
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c <= COLUNAS - 3; c++) {
        if (tab[l][c] !== null && tab[l][c] === tab[l][c + 1] && tab[l][c] === tab[l][c + 2]) return true;
      }
    }
    for (var c2 = 0; c2 < COLUNAS; c2++) {
      for (var l2 = 0; l2 <= LINHAS - 3; l2++) {
        if (tab[l2][c2] !== null && tab[l2][c2] === tab[l2 + 1][c2] && tab[l2][c2] === tab[l2 + 2][c2]) return true;
      }
    }
    return false;
  }

  // Marca todas as joias que devem ser eliminadas por estarem alinhadas.
  function encontrarParaEliminar(tab) {
    var marcadas = [];
    var l, c;
    for (l = 0; l < LINHAS; l++) {
      marcadas[l] = [];
      for (c = 0; c < COLUNAS; c++) marcadas[l][c] = false;
    }

    for (l = 0; l < LINHAS; l++) {
      for (c = 0; c <= COLUNAS - 3; c++) {
        if (tab[l][c] !== null && tab[l][c] === tab[l][c + 1] && tab[l][c] === tab[l][c + 2]) {
          var fim = c + 2;
          while (fim + 1 < COLUNAS && tab[l][fim + 1] === tab[l][c]) fim++;
          for (var k = c; k <= fim; k++) marcadas[l][k] = true;
          c = fim;
        }
      }
    }

    for (var c2 = 0; c2 < COLUNAS; c2++) {
      for (var l2 = 0; l2 <= LINHAS - 3; l2++) {
        if (tab[l2][c2] !== null && tab[l2][c2] === tab[l2 + 1][c2] && tab[l2][c2] === tab[l2 + 2][c2]) {
          var fim2 = l2 + 2;
          while (fim2 + 1 < LINHAS && tab[fim2 + 1][c2] === tab[l2][c2]) fim2++;
          for (var k2 = l2; k2 <= fim2; k2++) marcadas[k2][c2] = true;
          l2 = fim2;
        }
      }
    }
    return marcadas;
  }

  // Conta quantas joias foram marcadas para eliminação.
  function contarMarcadas(marcadas) {
    var total = 0;
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (marcadas[l][c]) total++;
      }
    }
    return total;
  }

  // Cria as células e as imagens das joias no HTML.
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
        img.src = CAMINHO_MEDIA + tabuleiro[l][c] + '.png';

        celula.appendChild(img);
        celula.addEventListener('click', aoClicarCelula);
        grid.appendChild(celula);
        celulas[l][c] = celula;
      }
    }
  }

  // Atualiza a imagem de uma célula quando a joia muda.
  function atualizarCelula(l, c) {
    var img = celulas[l][c].querySelector('.joia-imagem');
    if (tabuleiro[l][c] !== null) {
      img.src = CAMINHO_MEDIA + tabuleiro[l][c] + '.png';
      img.style.visibility = 'visible';
    } else {
      img.src = '';
      img.style.visibility = 'hidden';
    }
  }

  // Remove a seleção visual da joia escolhida.
  function limparSelecao() {
    if (primeiraJoia) celulas[primeiraJoia.linha][primeiraJoia.coluna].classList.remove('joia-selecionada');
    primeiraJoia = null;
  }

  // Confirma se duas joias estão lado a lado.
  function saoAdjacentes(l1, c1, l2, c2) {
    var dl = Math.abs(l1 - l2);
    var dc = Math.abs(c1 - c2);
    return (dl === 1 && dc === 0) || (dl === 0 && dc === 1);
  }

  // Troca duas joias dentro do array do tabuleiro.
  function trocarJoias(l1, c1, l2, c2) {
    var temp = tabuleiro[l1][c1];
    tabuleiro[l1][c1] = tabuleiro[l2][c2];
    tabuleiro[l2][c2] = temp;
  }

  // Testa se uma troca vai criar uma eliminação válida.
  function trocaCriaEliminacao(l1, c1, l2, c2) {
    trocarJoias(l1, c1, l2, c2);
    var marcadas = encontrarParaEliminar(tabuleiro);
    var tem = contarMarcadas(marcadas) > 0;
    trocarJoias(l1, c1, l2, c2);
    return tem;
  }

  // Procura se ainda existe pelo menos uma jogada possível no tabuleiro.
  function existeJogadaPossivel() {
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (tabuleiro[l][c] === null) continue;
        if (c + 1 < COLUNAS && tabuleiro[l][c + 1] !== null && trocaCriaEliminacao(l, c, l, c + 1)) return true;
        if (l + 1 < LINHAS && tabuleiro[l + 1][c] !== null && trocaCriaEliminacao(l, c, l + 1, c)) return true;
      }
    }
    return false;
  }

  // Faz a animação visual de duas joias a trocar de lugar.
  function animarTroca(l1, c1, l2, c2) {
    var img1 = celulas[l1][c1].querySelector('.joia-imagem');
    var img2 = celulas[l2][c2].querySelector('.joia-imagem');
    var r1 = img1.getBoundingClientRect();
    var r2 = img2.getBoundingClientRect();
    var dx = r2.left - r1.left;
    var dy = r2.top - r1.top;

    img1.classList.add('joia-a-trocar');
    img2.classList.add('joia-a-trocar');
    setTimeout(function () {
      img1.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      img2.style.transform = 'translate(' + (-dx) + 'px, ' + (-dy) + 'px)';
    }, 20);

    return esperar(230).then(function () {
      img1.classList.remove('joia-a-trocar');
      img2.classList.remove('joia-a-trocar');
      img1.style.transform = '';
      img2.style.transform = '';
    });
  }

  // Faz as joias marcadas desaparecerem e depois remove-as do tabuleiro.
  function eliminarJoias(marcadas) {
    var quantidade = 0;
    var imagens = [];
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (marcadas[l][c]) {
          quantidade++;
          imagens.push(celulas[l][c].querySelector('.joia-imagem'));
        }
      }
    }
    for (var i = 0; i < imagens.length; i++) imagens[i].classList.add('joia-a-desaparecer');

    return esperar(770).then(function () {
      for (var l2 = 0; l2 < LINHAS; l2++) {
        for (var c2 = 0; c2 < COLUNAS; c2++) {
          if (marcadas[l2][c2]) {
            tabuleiro[l2][c2] = null;
            celulas[l2][c2].querySelector('.joia-imagem').classList.remove('joia-a-desaparecer');
            atualizarCelula(l2, c2);
          }
        }
      }
      return quantidade;
    });
  }

  // Faz as joias cair para ocupar os espaços vazios.
  async function descerJoias() {
    for (var c = 0; c < COLUNAS; c++) {
      for (var l = LINHAS - 1; l >= 0; l--) {
        if (tabuleiro[l][c] === null) {
          for (var l2 = l - 1; l2 >= 0; l2--) {
            if (tabuleiro[l2][c] !== null) {
              tabuleiro[l][c] = tabuleiro[l2][c];
              tabuleiro[l2][c] = null;
              atualizarCelula(l, c);
              atualizarCelula(l2, c);
              await esperar(20);
              break;
            }
          }
        }
      }
    }
  }

  // Preenche os espaços vazios com novas joias, evitando eliminações imediatas.
  async function preencherVaziosSeguro() {
    var vazias = [];
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (tabuleiro[l][c] === null) vazias.push({ linha: l, coluna: c });
      }
    }
    if (vazias.length === 0) return;

    var valido = false;
    while (!valido) {
      for (var i = 0; i < vazias.length; i++) {
        tabuleiro[vazias[i].linha][vazias[i].coluna] = TIPOS[Math.floor(Math.random() * TIPOS.length)];
      }
      if (contarMarcadas(encontrarParaEliminar(tabuleiro)) === 0) {
        valido = true;
      } else {
        for (var j = 0; j < vazias.length; j++) tabuleiro[vazias[j].linha][vazias[j].coluna] = null;
      }
    }

    for (var k = 0; k < vazias.length; k++) {
      atualizarCelula(vazias[k].linha, vazias[k].coluna);
      var img = celulas[vazias[k].linha][vazias[k].coluna].querySelector('.joia-imagem');
      img.classList.add('joia-nova');
      setTimeout((function (imagem) { return function () { imagem.classList.remove('joia-nova'); }; })(img), 500);
      await esperar(25);
    }
  }

  // Trata das eliminações, descidas e novas eliminações em sequência.
  async function processarCascata() {
    var marcadas = encontrarParaEliminar(tabuleiro);
    var quantidade = contarMarcadas(marcadas);

    if (quantidade > 0) {
      var eliminadas = await eliminarJoias(marcadas);
      jogadores[jogadorAtual].joias += eliminadas;
      jogadores[jogadorAtual].pontos += 10 * (eliminadas - 2);
      atualizarStatsDois();
      await descerJoias();
      await processarCascata();
    } else {
      await preencherVaziosSeguro();
      if (!existeJogadaPossivel()) {
        gerarTabuleiro();
        desenharTabuleiro();
      }
      jogoAtivo = !jogoConcluido;
    }
  }

  // Controla o clique do utilizador nas joias do tabuleiro.
  async function aoClicarCelula(evento) {
    if (!jogoAtivo) return;
    var celula = evento.currentTarget;
    var l = parseInt(celula.dataset.linha);
    var c = parseInt(celula.dataset.coluna);

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
        await animarTroca(l1, c1, l, c);
        trocarJoias(l1, c1, l, c);
        atualizarCelula(l1, c1);
        atualizarCelula(l, c);
        await processarCascata();
      } else {
        limparSelecao();
        mostrarAviso('Uma troca de joias só é permitida se fizer com que três ou mais joias iguais fiquem alinhadas na horizontal ou na vertical');
      }
    } else {
      limparSelecao();
      primeiraJoia = { linha: l, coluna: c };
      celula.classList.add('joia-selecionada');
    }
  }

  // Mostra um popup simples com uma mensagem e botão Ok.
  function mostrarPopupSimples(mensagem, aoFechar) {
    var fundo = document.createElement('div');
    fundo.className = 'popup-terminar-fundo';
    fundo.innerHTML = '<div class="popup-terminar-caixa"><p>' + mensagem + '</p>' +
      '<button type="button" id="popup-ok-dois" class="popup-botao-sim">Ok</button></div>';
    document.body.appendChild(fundo);
    document.getElementById('popup-ok-dois').addEventListener('click', function () {
      document.body.removeChild(fundo);
      if (aoFechar) aoFechar();
    });
  }

  // Troca a vez entre o jogador 1 e o jogador 2.
  function mudarJogador() {
    jogoAtivo = false;
    limparSelecao();
    jogadorAtual = jogadorAtual === 0 ? 1 : 0;
    atualizarStatsDois();
    mostrarPopupSimples('Agora é a vez do outro jogador', function () {
      jogoAtivo = true;
      iniciarTimerDois();
    });
  }

  // Termina o modo de dois jogadores quando ambos acabam os turnos.
  function concluirJogoDois() {
    jogoConcluido = true;
    jogoAtivo = false;
    if (timerIntervalo) clearInterval(timerIntervalo);
    mostrarPopupSimples('Jogo Concluido, clique no botão vermelho Terminar Jogo', function () {});
  }

  // Conta o tempo de cada jogador e muda a vez a cada 10 segundos.
  function iniciarTimerDois() {
    if (timerIntervalo) clearInterval(timerIntervalo);
    timerIntervalo = setInterval(function () {
      jogadores[jogadorAtual].tempo++;
      atualizarStatsDois();

      if (jogadores[jogadorAtual].tempo % 10 === 0) {
        clearInterval(timerIntervalo);
        turnosFeitos[jogadorAtual]++;
        if (turnosFeitos[0] >= 3 && turnosFeitos[1] >= 3) {
          concluirJogoDois();
        } else {
          mudarJogador();
        }
      }
    }, 1000);
  }

  // Soma os dados finais dos dois jogadores aos dados guardados.
  function atualizarDadosDosDoisJogadores() {
    var utilizadores = carregarUtilizadores();
    for (var j = 0; j < jogadores.length; j++) {
      for (var i = 0; i < utilizadores.length; i++) {
        if (utilizadores[i].email === jogadores[j].email) {
          utilizadores[i].jogos2 = (utilizadores[i].jogos2 || 0) + 1;
          utilizadores[i].tempo = utilizadores[i].tempo + jogadores[j].tempo;
          utilizadores[i].pontos = utilizadores[i].pontos + jogadores[j].pontos;
        }
      }
    }
    guardarUtilizadores(utilizadores);
  }

  // Cria o popup de confirmação para terminar o jogo de dois jogadores.
  function criarPopupTerminarDois() {
    var botao = document.getElementById('btn-terminar-jogo-dois');
    if (!botao) return;
    botao.addEventListener('click', function () {
      jogoAtivo = false;
      if (timerIntervalo) clearInterval(timerIntervalo);
      var fundo = document.createElement('div');
      fundo.className = 'popup-terminar-fundo';
      fundo.innerHTML = '<div class="popup-terminar-caixa">' +
        '<p>Tem a certeza que deseja terminar o jogo?</p>' +
        '<div class="popup-terminar-botoes">' +
        '<button type="button" id="popup-sim-dois" class="popup-botao-sim">Sim</button>' +
        '<button type="button" id="popup-nao-dois" class="popup-botao-nao">Não</button>' +
        '</div></div>';
      document.body.appendChild(fundo);

      document.getElementById('popup-nao-dois').addEventListener('click', function () {
        document.body.removeChild(fundo);
        if (!jogoConcluido) {
          jogoAtivo = true;
          iniciarTimerDois();
        }
      });

      document.getElementById('popup-sim-dois').addEventListener('click', function () {
        if (jogoJaTerminou) return;
        jogoJaTerminou = true;
        atualizarDadosDosDoisJogadores();
        window.location.href = 'jogo-terminado.html';
      });
    });
  }

  // Começa o jogo de dois jogadores.
  function iniciarJogoDois() {
    gerarTabuleiro();
    desenharTabuleiro();
    atualizarStatsDois();
    criarPopupTerminarDois();
    jogoAtivo = true;
    iniciarTimerDois();
  }

  iniciarJogoDois();
})();

/* ==================== TABULEIRO ==================== */
// Código responsável pelo modo SinglePlayer.
(function () {
  var grid = document.querySelector('.tabuleiro-grid');
  if (!grid) return;

  var LINHAS = 8;
  var COLUNAS = 8;
  var TIPOS = ['vermelha', 'laranja', 'amarela', 'verde', 'azul', 'rosa', 'cinzenta'];
  var CAMINHO_MEDIA = 'Media/joia_';

  var tabuleiro = [];
  var celulas = [];
  var primeiraJoia = null;
  var jogoAtivo = false;
  var pontuacao = 0;
  var joiasEliminadas = 0;
  var joiasFaltam = 20;
  var timerSegundos = 0;
  var timerIntervalo = null;
  var jogoJaTerminou = false;
  var popupBaralharAberto = false;
  var joiasComDica = [];

  /* Se esta variável estiver a true, aparecem joias novas depois das eliminações.
     Se estiver a false, as joias vazias não são preenchidas e o jogo pode ficar sem jogadas. */
  var gerarNovasJoias = true;

  var statsItems = document.querySelectorAll('.stats-item');

  // Atualiza no ecrã a pontuação, joias eliminadas e joias que faltam.
  function atualizarStats() {
    if (statsItems[0]) statsItems[0].textContent = 'Pontuação: ' + pontuacao;
    if (statsItems[2]) statsItems[2].textContent = 'Número de joias eliminadas: ' + joiasEliminadas;
    if (statsItems[3]) statsItems[3].textContent = 'Número de joias que faltam eliminar: ' + joiasFaltam;
  }

  // Converte segundos para minutos e segundos no formato 00:00.
  function formatarTempo(seg) {
    var m = Math.floor(seg / 60);
    var s = seg % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Começa o contador de tempo do jogo SinglePlayer.
  function iniciarTimer() {
    if (timerIntervalo) clearInterval(timerIntervalo);
    timerIntervalo = setInterval(function () {
      timerSegundos++;
      if (statsItems[1]) statsItems[1].textContent = 'Tempo decorrido: ' + formatarTempo(timerSegundos);
    }, 1000);
  }

  // Soma os resultados do jogo atual aos dados guardados do jogador.
  function atualizarDadosDoUtilizador() {
    var emailAtual = localStorage.getItem(CHAVE_UTILIZADOR_ATUAL);
    if (!emailAtual) return;

    var utilizadores = carregarUtilizadores();
    for (var i = 0; i < utilizadores.length; i++) {
      if (utilizadores[i].email === emailAtual) {
        utilizadores[i].jogos = utilizadores[i].jogos + 1;
        utilizadores[i].tempo = utilizadores[i].tempo + timerSegundos;
        utilizadores[i].pontos = utilizadores[i].pontos + pontuacao;
      }
    }
    guardarUtilizadores(utilizadores);
  }

  // Termina o jogo, guarda os dados e envia o jogador para a página final.
  function finalizarJogo() {
    if (jogoJaTerminou) return;
    jogoJaTerminou = true;
    jogoAtivo = false;
    if (timerIntervalo) clearInterval(timerIntervalo);
    atualizarDadosDoUtilizador();
    window.location.href = 'jogo-terminado.html';
  }

  // Gera um tabuleiro novo sem eliminações automáticas e com jogadas possíveis.
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

      /* O tabuleiro não deve começar com 3 joias já alinhadas
         e deve ter pelo menos uma jogada possível. */
      valido = !temTresEmLinha(tabuleiro) && existeJogadaPossivel();
    }
  }

  // Verifica se já existem três ou mais joias iguais seguidas.
  function temTresEmLinha(tab) {
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c <= COLUNAS - 3; c++) {
        if (tab[l][c] !== null && tab[l][c] === tab[l][c + 1] && tab[l][c] === tab[l][c + 2]) return true;
      }
    }
    for (var c2 = 0; c2 < COLUNAS; c2++) {
      for (var l2 = 0; l2 <= LINHAS - 3; l2++) {
        if (tab[l2][c2] !== null && tab[l2][c2] === tab[l2 + 1][c2] && tab[l2][c2] === tab[l2 + 2][c2]) return true;
      }
    }
    return false;
  }

  // Marca todas as joias que devem ser eliminadas por estarem alinhadas.
  function encontrarParaEliminar(tab) {
    var marcadas = [];
    var l, c;
    for (l = 0; l < LINHAS; l++) {
      marcadas[l] = [];
      for (c = 0; c < COLUNAS; c++) marcadas[l][c] = false;
    }

    for (l = 0; l < LINHAS; l++) {
      for (c = 0; c <= COLUNAS - 3; c++) {
        if (tab[l][c] !== null && tab[l][c] === tab[l][c + 1] && tab[l][c] === tab[l][c + 2]) {
          var fim = c + 2;
          while (fim + 1 < COLUNAS && tab[l][fim + 1] === tab[l][c]) fim++;
          for (var k = c; k <= fim; k++) marcadas[l][k] = true;
          c = fim;
        }
      }
    }

    for (var c2 = 0; c2 < COLUNAS; c2++) {
      for (var l2 = 0; l2 <= LINHAS - 3; l2++) {
        if (tab[l2][c2] !== null && tab[l2][c2] === tab[l2 + 1][c2] && tab[l2][c2] === tab[l2 + 2][c2]) {
          var fim2 = l2 + 2;
          while (fim2 + 1 < LINHAS && tab[fim2 + 1][c2] === tab[l2][c2]) fim2++;
          for (var k2 = l2; k2 <= fim2; k2++) marcadas[k2][c2] = true;
          l2 = fim2;
        }
      }
    }

    return marcadas;
  }

  // Conta quantas joias foram marcadas para eliminação.
  function contarMarcadas(marcadas) {
    var total = 0;
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (marcadas[l][c]) total++;
      }
    }
    return total;
  }

  // Cria as células e as imagens das joias no HTML.
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
        img.src = CAMINHO_MEDIA + tabuleiro[l][c] + '.png';

        celula.appendChild(img);
        celula.addEventListener('click', aoClicarCelula);
        grid.appendChild(celula);
        celulas[l][c] = celula;
      }
    }
  }

  // Atualiza a imagem de uma célula quando a joia muda.
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

  // Remove a seleção visual da joia escolhida.
  function limparSelecao() {
    if (primeiraJoia) celulas[primeiraJoia.linha][primeiraJoia.coluna].classList.remove('joia-selecionada');
    primeiraJoia = null;
  }

  // Mostra avisos pequenos, por exemplo quando uma troca não é válida.
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

  // Confirma se duas joias estão lado a lado.
  function saoAdjacentes(l1, c1, l2, c2) {
    var difLinha = Math.abs(l1 - l2);
    var difColuna = Math.abs(c1 - c2);
    return (difLinha === 1 && difColuna === 0) || (difLinha === 0 && difColuna === 1);
  }

  // Troca duas joias dentro do array do tabuleiro.
  function trocarJoias(l1, c1, l2, c2) {
    var temp = tabuleiro[l1][c1];
    tabuleiro[l1][c1] = tabuleiro[l2][c2];
    tabuleiro[l2][c2] = temp;
  }

  // Testa se uma troca vai criar uma eliminação válida.
  function trocaCriaEliminacao(l1, c1, l2, c2) {
    trocarJoias(l1, c1, l2, c2);
    var marcadas = encontrarParaEliminar(tabuleiro);
    var temElim = contarMarcadas(marcadas) > 0;
    trocarJoias(l1, c1, l2, c2);
    return temElim;
  }

  // Procura duas joias que possam ser trocadas para formar uma eliminação.
  function procurarJogadaPossivel() {
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (tabuleiro[l][c] === null) continue;

        if (c + 1 < COLUNAS && tabuleiro[l][c + 1] !== null) {
          if (trocaCriaEliminacao(l, c, l, c + 1)) {
            return { l1: l, c1: c, l2: l, c2: c + 1 };
          }
        }

        if (l + 1 < LINHAS && tabuleiro[l + 1][c] !== null) {
          if (trocaCriaEliminacao(l, c, l + 1, c)) {
            return { l1: l, c1: c, l2: l + 1, c2: c };
          }
        }
      }
    }

    return null;
  }

  // Procura se ainda existe pelo menos uma jogada possível no tabuleiro.
  function existeJogadaPossivel() {
    return procurarJogadaPossivel() !== null;
  }

  // Remove a fronteira amarela das joias sinalizadas pela dica.
  function limparDica() {
    for (var i = 0; i < joiasComDica.length; i++) {
      var pos = joiasComDica[i];
      if (celulas[pos.linha] && celulas[pos.linha][pos.coluna]) {
        celulas[pos.linha][pos.coluna].classList.remove('joia-dica');
      }
    }
    joiasComDica = [];
  }

  // Prepara o botão Dica e sinaliza uma jogada possível quando é clicado.
  function criarBotaoDica() {
    var botaoDica = document.getElementById('btn-dica');
    if (!botaoDica) return;

    botaoDica.addEventListener('click', function () {
      if (!jogoAtivo) return;

      if (joiasComDica.length > 0) {
        mostrarAviso('Já tem duas joias sinalizadas. Faça uma jogada para voltar a utilizar o botão de Dica');
        return;
      }

      var jogada = procurarJogadaPossivel();
      if (jogada === null) {
        verificarSeHaJogadasPossiveis();
        return;
      }

      pontuacao = Math.max(0, pontuacao - 5);
      atualizarStats();

      celulas[jogada.l1][jogada.c1].classList.add('joia-dica');
      celulas[jogada.l2][jogada.c2].classList.add('joia-dica');
      joiasComDica = [
        { linha: jogada.l1, coluna: jogada.c1 },
        { linha: jogada.l2, coluna: jogada.c2 }
      ];
    });
  }

  // Depois das jogadas, verifica se o tabuleiro ainda permite alguma troca.
  async function verificarSeHaJogadasPossiveis() {
    if (jogoJaTerminou) return;

    if (existeJogadaPossivel()) {
      jogoAtivo = true;
      return;
    }

    jogoAtivo = false;
    await esperar(3000);

    if (!jogoJaTerminou && !existeJogadaPossivel()) {
      mostrarPopupBaralhar();
    } else if (!jogoJaTerminou) {
      jogoAtivo = true;
    }
  }

  // Mostra o popup que permite baralhar o tabuleiro quando não há jogadas.
  function mostrarPopupBaralhar() {
    if (popupBaralharAberto) return;
    popupBaralharAberto = true;

    var fundo = document.createElement('div');
    fundo.className = 'popup-baralhar-fundo';
    fundo.innerHTML =
      '<div class="popup-baralhar-caixa">' +
      '<p>Atualmente não dá para fazer uma troca de joias, clique no botão abaixo para baralhar as joias do tabuleiro</p>' +
      '<button type="button" id="btn-baralhar-joias" class="popup-botao-baralhar">Baralhar joias</button>' +
      '</div>';

    document.body.appendChild(fundo);

    document.getElementById('btn-baralhar-joias').addEventListener('click', function () {
      if (fundo.parentNode) document.body.removeChild(fundo);
      popupBaralharAberto = false;

      limparDica();
      pontuacao = Math.max(0, pontuacao - 10);
      primeiraJoia = null;

      gerarTabuleiro();
      desenharTabuleiro();
      atualizarStats();

      jogoAtivo = true;
    });
  }

  // Pequena função auxiliar para fazer pausas nas animações.
  function esperar(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // Faz a animação visual de duas joias a trocar de lugar.
  function animarTroca(l1, c1, l2, c2) {
    var img1 = celulas[l1][c1].querySelector('.joia-imagem');
    var img2 = celulas[l2][c2].querySelector('.joia-imagem');
    if (!img1 || !img2) return esperar(0);

    var r1 = img1.getBoundingClientRect();
    var r2 = img2.getBoundingClientRect();
    var dx = r2.left - r1.left;
    var dy = r2.top - r1.top;

    img1.classList.add('joia-a-trocar');
    img2.classList.add('joia-a-trocar');

    setTimeout(function () {
      img1.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      img2.style.transform = 'translate(' + (-dx) + 'px, ' + (-dy) + 'px)';
    }, 20);

    return esperar(227).then(function () {
      img1.classList.remove('joia-a-trocar');
      img2.classList.remove('joia-a-trocar');
      img1.style.transform = '';
      img2.style.transform = '';
    });
  }

  // Faz as joias marcadas desaparecerem e depois remove-as do tabuleiro.
  function eliminarJoias(marcadas) {
    var quantidade = 0;
    var imagens = [];

    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (marcadas[l][c]) {
          var img = celulas[l][c].querySelector('.joia-imagem');
          if (img) imagens.push(img);
          quantidade++;
        }
      }
    }

    for (var i = 0; i < imagens.length; i++) {
      imagens[i].classList.add('joia-a-desaparecer');
    }

    return esperar(770).then(function () {
      for (var l2 = 0; l2 < LINHAS; l2++) {
        for (var c2 = 0; c2 < COLUNAS; c2++) {
          if (marcadas[l2][c2]) {
            tabuleiro[l2][c2] = null;
            var img2 = celulas[l2][c2].querySelector('.joia-imagem');
            if (img2) img2.classList.remove('joia-a-desaparecer');
            atualizarCelula(l2, c2);
          }
        }
      }
      return quantidade;
    });
  }

  // Faz as joias cair para ocupar os espaços vazios.
  async function descerJoias() {
    // Faz as joias descerem visualmente para ocupar os espaços vazios.
    var animacoes = [];

    for (var c = 0; c < COLUNAS; c++) {
      for (var l = LINHAS - 1; l >= 0; l--) {
        if (tabuleiro[l][c] === null) {
          for (var l2 = l - 1; l2 >= 0; l2--) {
            if (tabuleiro[l2][c] !== null) {
              // Atualiza primeiro a informação guardada no array do tabuleiro.
              tabuleiro[l][c] = tabuleiro[l2][c];
              tabuleiro[l2][c] = null;

              // Cria uma cópia da imagem para simular a queda da joia no ecrã.
              (function (srcL, srcC, dstL, dstC) {
                var srcCell = celulas[srcL][srcC];
                var dstCell = celulas[dstL][dstC];
                var srcImg = srcCell && srcCell.querySelector('.joia-imagem');
                if (!srcImg || !dstCell) return;

                // Atualiza a célula de destino antes de começar a animação.
                atualizarCelula(dstL, dstC);

                var clone = srcImg.cloneNode(true);
                clone.classList.add('joia-caindo');
                // Coloca a cópia por cima da imagem original.
                var rSrc = srcImg.getBoundingClientRect();
                clone.style.position = 'fixed';
                clone.style.left = rSrc.left + 'px';
                clone.style.top = rSrc.top + 'px';
                clone.style.width = rSrc.width + 'px';
                clone.style.height = rSrc.height + 'px';
                clone.style.margin = '0';
                clone.style.transition = 'transform 450ms ease, top 450ms ease, left 450ms ease';

                document.body.appendChild(clone);

                var p = new Promise(function (resolve) {
                  // Força o navegador a aplicar os estilos antes da animação.
                  void clone.offsetWidth;
                  var rDst = dstCell.getBoundingClientRect();
                  var dx = rDst.left - rSrc.left;
                  var dy = rDst.top - rSrc.top;
                  clone.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';

                  setTimeout(function () {
                    // Remove a cópia e deixa visível a imagem final.
                    if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
                    atualizarCelula(dstL, dstC);
                    resolve();
                  }, 500);
                });

                animacoes.push(p);
              })(l2, c, l, c);

              break;
            }
          }
        }
      }
    }

    // Espera que todas as animações acabem antes de continuar o jogo.
    if (animacoes.length > 0) await Promise.all(animacoes);
  }

  // Trata das eliminações, descidas e novas eliminações em sequência.
  async function processarCascata() {
    var marcadas = encontrarParaEliminar(tabuleiro);
    var quantidade = contarMarcadas(marcadas);

    if (quantidade > 0) {
      var eliminadas = await eliminarJoias(marcadas);
      joiasEliminadas += eliminadas;
      pontuacao += 10 * (eliminadas - 2);
      if (joiasFaltam > 0) joiasFaltam = Math.max(0, joiasFaltam - eliminadas);
      atualizarStats();

      if (joiasFaltam === 0) {
        finalizarJogo();
        return;
      }

      await descerJoias();
      await processarCascata();
    } else {
      await preencherVaziosSeguro();
      await verificarSeHaJogadasPossiveis();
    }
  }

  // Preenche os espaços vazios com novas joias, evitando eliminações imediatas.
  async function preencherVaziosSeguro() {
    var posicoesvazias = [];
    for (var l = 0; l < LINHAS; l++) {
      for (var c = 0; c < COLUNAS; c++) {
        if (tabuleiro[l][c] === null) posicoesvazias.push({ linha: l, coluna: c });
      }
    }

    if (posicoesvazias.length === 0) return;

    /* Para testar a deteção de falta de jogadas, basta colocar
       a variável gerarNovasJoias como false no início do código do tabuleiro. */
    if (!gerarNovasJoias) {
      for (var p = 0; p < posicoesvazias.length; p++) {
        atualizarCelula(posicoesvazias[p].linha, posicoesvazias[p].coluna);
      }
      return;
    }

    var valido = false;
    while (!valido) {
      for (var i = 0; i < posicoesvazias.length; i++) {
        var pos = posicoesvazias[i];
        tabuleiro[pos.linha][pos.coluna] = TIPOS[Math.floor(Math.random() * TIPOS.length)];
      }

      var marcadas = encontrarParaEliminar(tabuleiro);
      if (contarMarcadas(marcadas) === 0) {
        valido = true;
      } else {
        for (var j = 0; j < posicoesvazias.length; j++) {
          var pos2 = posicoesvazias[j];
          tabuleiro[pos2.linha][pos2.coluna] = null;
        }
      }
    }

    posicoesvazias.sort(function (a, b) {
      if (a.linha !== b.linha) return a.linha - b.linha;
      return a.coluna - b.coluna;
    });

    for (var k = 0; k < posicoesvazias.length; k++) {
      var pos3 = posicoesvazias[k];
      atualizarCelula(pos3.linha, pos3.coluna);
      var img = celulas[pos3.linha][pos3.coluna].querySelector('.joia-imagem');
      if (img) {
        img.classList.add('joia-nova');
        setTimeout((function (imagem) {
          return function () {
            imagem.classList.remove('joia-nova');
          };
        })(img), 500);
      }
      await esperar(63);
    }
  }

  // Controla o clique do utilizador nas joias do tabuleiro.
  async function aoClicarCelula(evento) {
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
        limparDica();
        limparSelecao();
        jogoAtivo = false;
        await animarTroca(l1, c1, l, c);
        trocarJoias(l1, c1, l, c);
        atualizarCelula(l1, c1);
        atualizarCelula(l, c);
        await processarCascata();
      } else {
        limparSelecao();
        mostrarAviso('Uma troca de joias só é permitida se fizer com que três ou mais joias iguais fiquem alinhadas na horizontal ou na vertical');
      }
    } else {
      limparSelecao();
      primeiraJoia = { linha: l, coluna: c };
      celula.classList.add('joia-selecionada');
    }
  }

  // Cria o popup de confirmação do botão Terminar Jogo.
  function criarPopupTerminarJogo() {
    var botaoTerminar = document.getElementById('btn-terminar-jogo');
    if (!botaoTerminar) return;

    botaoTerminar.addEventListener('click', function () {
      jogoAtivo = false;
      var fundo = document.createElement('div');
      fundo.className = 'popup-terminar-fundo';
      fundo.innerHTML = '<div class="popup-terminar-caixa">' +
        '<p>Tem a certeza que deseja terminar o jogo?</p>' +
        '<div class="popup-terminar-botoes">' +
        '<button type="button" id="popup-sim" class="popup-botao-sim">Sim</button>' +
        '<button type="button" id="popup-nao" class="popup-botao-nao">Não</button>' +
        '</div></div>';
      document.body.appendChild(fundo);

      document.getElementById('popup-nao').addEventListener('click', function () {
        document.body.removeChild(fundo);
        jogoAtivo = true;
      });

      document.getElementById('popup-sim').addEventListener('click', function () {
        finalizarJogo();
      });
    });
  }

  // Prepara o tabuleiro, os dados do ecrã e começa o jogo SinglePlayer.
  function iniciarJogo() {
    gerarTabuleiro();
    desenharTabuleiro();
    atualizarStats();
    if (statsItems[1]) statsItems[1].textContent = 'Tempo decorrido: ' + formatarTempo(timerSegundos);
    iniciarTimer();
    criarPopupTerminarJogo();
    criarBotaoDica();
    jogoAtivo = true;
  }

  iniciarJogo();
})();
