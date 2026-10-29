/* ================= Armazenamento (só no navegador) ================= */
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } };
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ================= Abas principais ================= */
const paginas = [...document.querySelectorAll('.pagina')];
const links = [...document.querySelectorAll('a[data-page]')];
function ir(id) {
  const alvo = $(id) || $('inicio');
  const pagina = alvo.classList.contains('pagina') ? alvo : alvo.closest('.pagina');
  paginas.forEach(p => p.classList.toggle('ativa', p === pagina));
  links.forEach(a => a.classList.toggle('ativa', a.dataset.page === pagina.id));
  if (alvo === pagina) window.scrollTo({ top: 0 }); else alvo.scrollIntoView({ behavior: 'smooth' });
}
addEventListener('hashchange', () => ir(location.hash.slice(1)));

/* ================= Datas ================= */
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hoje = new Date(), hojeISO = iso(hoje);

/* ================= Perfis ================= */
const TITULOS = ['Iniciante', 'Aprendiz', 'Dedicado', 'Focado', 'Veterano', 'Mestre'];
const LIBERA = { capelo: 3, louros: 5 };
const AVATAR0 = { pele: '#e8b98f', cabelo: 'curto', corCabelo: '#2b1b12', camisa: '#3b5bff', fundo: '#e8edff', rosto: 'sorriso', acessorio: 'nenhum' };
const GRUPOS = [
  ['pele', 'Pele', ['#f6d5b8', '#e8b98f', '#c98e63', '#9a6440', '#6b4128']],
  ['cabelo', 'Cabelo', { curto: 'Curto', longo: 'Longo', coque: 'Coque', volume: 'Volume', nenhum: 'Sem cabelo' }],
  ['corCabelo', 'Cor do cabelo', ['#2b1b12', '#6b3f1d', '#c28b3c', '#d9482b', '#8d93a6', '#3b5bff']],
  ['camisa', 'Camiseta', ['#3b5bff', '#19c3a6', '#f0476f', '#ffd43b', '#7a5cff', '#0e1b33']],
  ['fundo', 'Fundo', ['#e8edff', '#d9f7f3', '#ffeccc', '#ffe0e8', '#ece6ff', '#dfe6f0']],
  ['rosto', 'Expressão', { sorriso: 'Sorriso', alegre: 'Alegre', serio: 'Sério' }],
  ['acessorio', 'Acessório', { nenhum: 'Nenhum', oculos: 'Óculos', fone: 'Fone', capelo: 'Capelo', louros: 'Louros' }]
];

let db = ler('rota', null);
function criar(nome) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  db.perfis[id] = { nome, curso: '', prova: 'Enem', estudos: [], topicos: [], tarefas: [], dataProva: '', nivel: 1, avatar: { ...AVATAR0 } };
  db.atual = id; return db.perfis[id];
}
if (!db || !db.perfis || !db.perfis[db.atual]) {
  db = { atual: null, perfis: {} };
  const p = criar('Estudante');
  p.estudos = ler('estudos', []); p.dataProva = ler('dataProva', ''); // traz dados da versão anterior
}
const salvar = () => guardar('rota', db);
const P = () => db.perfis[db.atual];
const xp = () => P().estudos.length * 10 + P().topicos.length * 5;
const nivel = () => Math.floor(xp() / 50) + 1;
const titulo = n => TITULOS[Math.min(n - 1, TITULOS.length - 1)];

let tt;
function aviso(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('mostra');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('mostra'), 3600);
}
function checarNivel(silencioso) {
  const n = nivel(), p = P();
  if (n > (p.nivel || 1)) {
    p.nivel = n; salvar();
    if (silencioso) return;
    const novo = Object.entries(LIBERA).find(([, v]) => v === n);
    aviso(`Nível ${n}: ${titulo(n)}!` + (novo ? (novo[0] === 'capelo' ? ' Capelo liberado.' : ' Coroa de louros liberada.') : ''));
    renderOpcoes();
  }
}

/* ================= Personagem (SVG) ================= */
function avatar(a, tam) {
  const h = a.corCabelo, k = a.cabelo;
  const tras = k === 'longo' ? `<path d="M33 52C28 18 92 18 87 52L92 100H28Z" fill="${h}"/>` : k === 'volume' ? `<circle cx="60" cy="44" r="33" fill="${h}"/>` : '';
  const frente = k === 'nenhum' ? '' : `<path d="M35 50C33 27 47 21 60 21C74 21 87 28 85 50C78 39 69 34 60 34C51 34 42 39 35 50Z" fill="${h}"/>` + (k === 'coque' ? `<circle cx="60" cy="19" r="10" fill="${h}"/>` : '');
  const boca = {
    sorriso: '<path d="M51 64Q60 72 69 64" stroke="#1c2a44" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
    alegre: '<path d="M50 63Q60 78 70 63Z" fill="#1c2a44"/>',
    serio: '<path d="M52 66H68" stroke="#1c2a44" stroke-width="2.6" stroke-linecap="round"/>'
  }[a.rosto] || '';
  const acess = {
    oculos: '<g fill="none" stroke="#1c2a44" stroke-width="2.2"><circle cx="50" cy="54" r="8"/><circle cx="70" cy="54" r="8"/><path d="M58 54H62"/></g>',
    fone: '<path d="M34 54C32 24 88 24 86 54" fill="none" stroke="#1c2a44" stroke-width="4"/><rect x="29" y="50" width="9" height="16" rx="4" fill="#1c2a44"/><rect x="82" y="50" width="9" height="16" rx="4" fill="#1c2a44"/>',
    capelo: '<path d="M28 30L60 15L92 30L60 44Z" fill="#1c2a44"/><path d="M84 33V48" stroke="#ffd43b" stroke-width="2.5"/><circle cx="84" cy="50" r="3" fill="#ffd43b"/>',
    louros: '<path d="M38 28L44 14L52 25L60 11L68 25L76 14L82 28Z" fill="#ffd43b" stroke="#e0a800" stroke-width="1.5" stroke-linejoin="round"/>'
  }[a.acessorio] || '';
  return `<span class="av"><svg viewBox="0 0 120 120" width="${tam}" height="${tam}" aria-hidden="true">
    <rect width="120" height="120" fill="${a.fundo}"/>${tras}
    <path d="M18 120C18 94 38 84 60 84C82 84 102 94 102 120Z" fill="${a.camisa}"/>
    <rect x="52" y="68" width="16" height="20" fill="${a.pele}"/>
    <circle cx="36" cy="54" r="4" fill="${a.pele}"/><circle cx="84" cy="54" r="4" fill="${a.pele}"/>
    <ellipse cx="60" cy="52" rx="24" ry="26" fill="${a.pele}"/>${frente}
    <g class="olhos"><circle cx="50" cy="54" r="2.8" fill="#1c2a44"/><circle cx="70" cy="54" r="2.8" fill="#1c2a44"/></g>
    ${boca}${acess}</svg></span>`;
}

function renderAvatar() {
  const p = P();
  $('avGrande').innerHTML = avatar(p.avatar, 150);
  $('chipPerfil').innerHTML = avatar(p.avatar, 34) + `<span>${esc(p.nome)}<small>Nível ${nivel()} · ${titulo(nivel())}</small></span>`;
}

function renderOpcoes() {
  const a = P().avatar, n = nivel();
  $('opcoes').innerHTML = GRUPOS.map(([g, rotulo, valores]) => {
    const botoes = Array.isArray(valores)
      ? valores.map(v => `<button class="cor${a[g] === v ? ' sel' : ''}" data-g="${g}" data-v="${v}" style="background:${v}" aria-label="${rotulo} ${v}"></button>`).join('')
      : Object.entries(valores).map(([v, nome]) => {
          const trava = LIBERA[v] && n < LIBERA[v];
          return `<button class="aba${a[g] === v ? ' ativa' : ''}" data-g="${g}" data-v="${v}"${trava ? ' disabled' : ''}>${nome}${trava ? ` (nível ${LIBERA[v]})` : ''}</button>`;
        }).join('');
    return `<div class="grupo"><h4>${rotulo}</h4><div class="opcoes-linha">${botoes}</div></div>`;
  }).join('');
}
$('opcoes').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  P().avatar[b.dataset.g] = b.dataset.v; salvar(); renderAvatar(); renderOpcoes();
});
$('sortear').onclick = () => {
  const n = nivel(), a = P().avatar;
  GRUPOS.forEach(([g, , v]) => {
    const lista = (Array.isArray(v) ? v : Object.keys(v)).filter(x => !LIBERA[x] || n >= LIBERA[x]);
    a[g] = lista[Math.floor(Math.random() * lista.length)];
  });
  salvar(); renderAvatar(); renderOpcoes();
};

/* ================= Painel do perfil ================= */
function renderPerfil() {
  const p = P(), n = nivel(), x = xp() % 50;
  $('pNome').textContent = p.nome;
  $('pCurso').textContent = p.curso ? `Rumo a ${p.curso} · ${p.prova}` : `Prova: ${p.prova}`;
  $('pNivel').textContent = `Nível ${n}`; $('pTitulo').textContent = titulo(n);
  $('pXp').style.width = (x / 50 * 100) + '%';
  $('pXpTxt').textContent = `${x}/50 pontos para o nível ${n + 1}`;
  $('pDias').textContent = `${p.estudos.length} dias estudados · ${p.topicos.length} temas marcados`;
  $('inNome').value = p.nome; $('inCurso').value = p.curso; $('inProva').value = p.prova;
  $('trocar').innerHTML = Object.entries(db.perfis).map(([id, q]) => `<option value="${id}"${id === db.atual ? ' selected' : ''}>${esc(q.nome)}</option>`).join('');
}
$('inNome').oninput = e => { P().nome = e.target.value.trim() || 'Estudante'; salvar(); renderAvatar(); $('pNome').textContent = P().nome; renderHero(); };
$('inCurso').oninput = e => { P().curso = e.target.value.trim(); salvar(); renderPerfil2(); };
$('inProva').onchange = e => { P().prova = e.target.value; salvar(); renderPerfil2(); };
const renderPerfil2 = () => { const p = P(); $('pCurso').textContent = p.curso ? `Rumo a ${p.curso} · ${p.prova}` : `Prova: ${p.prova}`; };

$('trocar').onchange = e => { db.atual = e.target.value; salvar(); atualizarTudo(); aviso(`Perfil: ${P().nome}`); };
$('cadastrar').onclick = () => {
  const nome = $('novoNome').value.trim(); if (!nome) return $('novoNome').focus();
  criar(nome); $('novoNome').value = ''; atualizarTudo(); aviso(`Perfil de ${nome} criado!`);
};
$('apagar').onclick = () => {
  if (!confirm(`Apagar o perfil de ${P().nome}? Isso não pode ser desfeito.`)) return;
  delete db.perfis[db.atual];
  const resto = Object.keys(db.perfis);
  if (resto.length) db.atual = resto[0]; else criar('Estudante');
  atualizarTudo();
};
$('exportar').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'rota-do-vestibular.json'; a.click(); URL.revokeObjectURL(url);
};
$('importar').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const novo = JSON.parse(r.result);
      if (!novo.perfis || !novo.perfis[novo.atual]) throw 0;
      db = novo; atualizarTudo(); aviso('Perfil importado!');
    } catch (err) { aviso('Arquivo inválido.'); }
  };
  r.readAsText(f); e.target.value = '';
};

/* ================= Início: saudação, dica, tarefas ================= */
const h = hoje.getHours();
function renderHero() { $('saudacao').textContent = `${h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'}, ${P().nome}!`; }

const DICAS = [
  'Antes de reler, tente lembrar. Feche o livro e escreva o que você sabe do assunto.',
  'Misture temas na mesma sessão de exercícios: parece mais difícil, mas fixa melhor.',
  'Revise o que estudou ontem. Cinco minutos hoje valem mais que uma hora na véspera.',
  'Errou uma questão? Escreva o motivo no caderno de erros e refaça em três dias.',
  'Durma bem antes de provas e simulados: o sono ajuda a consolidar a memória.',
  'Explique o tema em voz alta, como se ensinasse alguém. Onde travar, volte ao material.',
  'Faça blocos de 25 minutos com pausas de 5. Começar é a parte mais difícil.'
];
$('dicaDia').textContent = DICAS[Math.floor(hoje / 864e5) % DICAS.length];

function renderTarefas() {
  const lista = P().tarefas.map((t, i) => ({ ...t, i })).filter(t => t.d === hojeISO);
  $('listaTarefas').innerHTML = lista.length
    ? lista.map(t => `<li class="${t.ok ? 'ok' : ''}"><input type="checkbox" data-i="${t.i}"${t.ok ? ' checked' : ''}><span>${esc(t.t)}</span><button data-x="${t.i}" aria-label="Remover">×</button></li>`).join('')
    : '<li><span class="suave">Nenhuma tarefa ainda. Adicione a primeira acima.</span></li>';
}
function addTarefa() {
  const v = $('novaTarefa').value.trim(); if (!v) return;
  P().tarefas.push({ t: v, d: hojeISO, ok: false }); $('novaTarefa').value = ''; salvar(); renderTarefas();
}
$('addTarefa').onclick = addTarefa;
$('novaTarefa').onkeydown = e => { if (e.key === 'Enter') addTarefa(); };
$('listaTarefas').addEventListener('click', e => {
  const c = e.target.closest('[data-i]'), x = e.target.closest('[data-x]');
  if (c) { P().tarefas[c.dataset.i].ok = c.checked; }
  else if (x) { P().tarefas.splice(x.dataset.x, 1); }
  else return;
  salvar(); renderTarefas();
});

/* ================= Texto digitado ================= */
const frase = 'Um dia de cada vez até a aprovação.';
let ci = 0;
(function digitar() { $('digitado').textContent = frase.slice(0, ci++); if (ci <= frase.length) setTimeout(digitar, 55); })();

/* ================= Calendário ================= */
let mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
function desenhar() {
  const p = P(), ano = mesAtual.getFullYear(), mes = mesAtual.getMonth(), g = $('calGrade');
  $('mesTitulo').textContent = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  g.innerHTML = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(s => `<div class="cal-dia-sem">${s}</div>`).join('');
  for (let v = 0; v < new Date(ano, mes, 1).getDay(); v++) g.innerHTML += '<div class="dia vazio"></div>';
  for (let d = 1, total = new Date(ano, mes + 1, 0).getDate(); d <= total; d++) {
    const di = iso(new Date(ano, mes, d));
    g.innerHTML += `<div class="dia${p.estudos.includes(di) ? ' estudado' : ''}${di === p.dataProva ? ' prova' : ''}${di === hojeISO ? ' hoje' : ''}">${d}</div>`;
  }
}
function sequencia() { let n = 0; const d = new Date(); while (P().estudos.includes(iso(d))) { n++; d.setDate(d.getDate() - 1); } return n; }
function atualizarResumo() {
  const p = P(), noMes = p.estudos.filter(d => d.startsWith(hojeISO.slice(0, 7))).length;
  $('totalMes').textContent = noMes; $('totalGeral').textContent = p.estudos.length; $('sequencia').textContent = sequencia();
  $('dataProva').value = p.dataProva;
  setTimeout(() => { $('anelProg').style.strokeDashoffset = 327 - 327 * Math.min(noMes / 20, 1); }, 300);
  const f = $('faltam');
  if (p.dataProva) {
    const dias = Math.ceil((new Date(p.dataProva + 'T00:00:00') - new Date(hojeISO + 'T00:00:00')) / 864e5);
    f.textContent = dias > 0 ? `Faltam ${dias} dias para a prova.` : dias === 0 ? 'A prova é hoje. Boa sorte!' : 'Essa data já passou. Escolha a próxima prova.';
  } else f.textContent = 'Escolha a data da prova para ver a contagem.';
}
$('mesAnt').onclick = () => { mesAtual.setMonth(mesAtual.getMonth() - 1); desenhar(); };
$('mesProx').onclick = () => { mesAtual.setMonth(mesAtual.getMonth() + 1); desenhar(); };
$('dataProva').onchange = e => { P().dataProva = e.target.value; salvar(); desenhar(); atualizarResumo(); };

/* ================= Matérias ================= */
const MATERIAS = [
  { n: 'Matemática', a: 'Exatas', c: '#3b5bff', r: 'Cálculo do dia a dia, funções e geometria.', t: ['Porcentagem e juros', 'Razão, proporção e regra de três', 'Estatística e gráficos', 'Funções de 1º e 2º grau', 'Geometria plana e espacial', 'Probabilidade e combinatória'] },
  { n: 'Português', a: 'Linguagens', c: '#f0476f', r: 'Leitura, texto e língua em uso.', t: ['Interpretação de texto', 'Gêneros textuais', 'Funções da linguagem', 'Figuras de linguagem', 'Variação linguística', 'Coesão e coerência'] },
  { n: 'Literatura', a: 'Linguagens', c: '#e08a00', r: 'Estilos de época e leitura de obras.', t: ['Escolas literárias', 'Romantismo e Realismo', 'Modernismo no Brasil', 'Poesia contemporânea', 'Arte e sociedade'] },
  { n: 'Inglês e Espanhol', a: 'Linguagens', c: '#7a5cff', r: 'Leitura de textos em língua estrangeira.', t: ['Interpretação de textos', 'Vocabulário em contexto', 'Cognatos e falsos cognatos', 'Tempos verbais básicos'] },
  { n: 'Redação', a: 'Linguagens', c: '#0e7a6a', r: 'Texto dissertativo-argumentativo.', t: ['Estrutura do texto', 'Repertório sociocultural', 'Proposta de intervenção', 'Conectivos e coesão', 'As cinco competências'] },
  { n: 'Física', a: 'Natureza', c: '#1f7ae0', r: 'Movimento, energia e eletricidade.', t: ['Cinemática', 'Leis de Newton', 'Energia e trabalho', 'Eletricidade e circuitos', 'Ondulatória e óptica', 'Termologia'] },
  { n: 'Química', a: 'Natureza', c: '#17a35c', r: 'Matéria, reações e soluções.', t: ['Estequiometria', 'Soluções e concentração', 'Química orgânica', 'Eletroquímica', 'Termoquímica', 'Ligações e propriedades'] },
  { n: 'Biologia', a: 'Natureza', c: '#7fa800', r: 'Vida, genética e meio ambiente.', t: ['Ecologia', 'Genética', 'Citologia', 'Evolução', 'Fisiologia humana', 'Saúde e meio ambiente'] },
  { n: 'História', a: 'Humanas', c: '#c2410c', r: 'Do mundo antigo ao Brasil contemporâneo.', t: ['Brasil Colônia e Império', 'República e Era Vargas', 'Ditadura e redemocratização', 'Revolução Industrial', 'Guerras mundiais e Guerra Fria', 'Idade Antiga e Média'] },
  { n: 'Geografia', a: 'Humanas', c: '#0e9aa7', r: 'Espaço, território e ambiente.', t: ['Urbanização', 'Clima e meio ambiente', 'Geopolítica e globalização', 'Cartografia', 'Questão agrária', 'Demografia'] },
  { n: 'Filosofia e Sociologia', a: 'Humanas', c: '#a23bc4', r: 'Pensadores, cultura e sociedade.', t: ['Filosofia clássica', 'Contratualistas', 'Cultura e sociedade', 'Cidadania e direitos humanos', 'Ética e política', 'Desigualdade social'] }
];
const AREAS = ['Todas', 'Exatas', 'Natureza', 'Humanas', 'Linguagens'];
let filtro = 'Todas';
const gs = (site, q) => `https://www.google.com/search?q=${encodeURIComponent(`site:${site} ${q}`)}`;

function renderFiltros() {
  $('filtros').innerHTML = AREAS.map(a => `<button class="aba${a === filtro ? ' ativa' : ''}" data-a="${a}">${a}</button>`).join('');
}
function renderMaterias() {
  const feitos = P().topicos;
  $('gradeMaterias').innerHTML = MATERIAS.filter(m => filtro === 'Todas' || m.a === filtro).map((m, i) => {
    const q = encodeURIComponent(m.n + ' enem aula');
    const ok = m.t.filter(t => feitos.includes(m.n + ':' + t)).length;
    return `<article class="materia" style="--cor:${m.c};animation-delay:${i * 60}ms" data-m="${esc(m.n)}">
      <h3>${m.n}</h3><p>${m.r}</p>
      <div class="prog"><i style="width:${ok / m.t.length * 100}%"></i></div><small>${ok} de ${m.t.length} temas estudados</small>
      <div class="topicos">${m.t.map(t => `<button class="topico${feitos.includes(m.n + ':' + t) ? ' feito' : ''}" data-t="${esc(t)}">${t}</button>`).join('')}</div>
      <div class="links"><a target="_blank" rel="noopener" href="${gs('brasilescola.uol.com.br', m.n)}">Brasil Escola</a>
      <a target="_blank" rel="noopener" href="${gs('todamateria.com.br', m.n)}">Toda Matéria</a>
      <a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}">Vídeos</a></div></article>`;
  }).join('');
}
$('filtros').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { filtro = b.dataset.a; renderFiltros(); renderMaterias(); } });
$('gradeMaterias').addEventListener('click', e => {
  const b = e.target.closest('.topico'); if (!b) return;
  const card = b.closest('.materia'), chave = card.dataset.m + ':' + b.dataset.t, lista = P().topicos, i = lista.indexOf(chave);
  if (i >= 0) lista.splice(i, 1); else lista.push(chave);
  b.classList.toggle('feito', i < 0); salvar();
  const total = card.querySelectorAll('.topico').length, ok = card.querySelectorAll('.feito').length;
  card.querySelector('.prog i').style.width = (ok / total * 100) + '%';
  card.querySelector('small').textContent = `${ok} de ${total} temas estudados`;
  renderPerfil(); renderAvatar(); checarNivel();
});

/* ================= Canais de vídeo ================= */
$('canais').innerHTML = ['Descomplica', 'Me Salva!', 'Khan Academy Brasil', 'Brasil Escola', 'Professor Ferretto (Matemática)', 'Equaciona (Matemática)', 'Biologia Total (Biologia)', 'Stoodi']
  .map(c => `<a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent('canal ' + c)}">${c}</a>`).join('');

/* ================= Abas de estudo ================= */
const abas = [...document.querySelectorAll('#abas .aba')];
function abrirAba(btn) {
  abas.forEach(a => { const on = a === btn; a.classList.toggle('ativa', on); a.setAttribute('aria-selected', on); });
  document.querySelectorAll('.estudo').forEach(e => { const on = e.id === btn.dataset.alvo; e.classList.toggle('ativo', on); e.hidden = !on; });
}
abas.forEach((a, n) => {
  a.onclick = () => abrirAba(a);
  a.onkeydown = e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const prox = abas[(n + (e.key === 'ArrowRight' ? 1 : -1) + abas.length) % abas.length]; prox.focus(); abrirAba(prox);
  };
});

/* ================= Pomodoro ================= */
const pomo = { foco: true, resta: 1500, timer: null };
const mostrar = () => { $('pomoTempo').textContent = `${String(Math.floor(pomo.resta / 60)).padStart(2, '0')}:${String(pomo.resta % 60).padStart(2, '0')}`; $('pomoModo').textContent = pomo.foco ? 'Foco' : 'Pausa'; };
function parar() { clearInterval(pomo.timer); pomo.timer = null; document.querySelector('.pomo').classList.remove('rodando'); $('pomoBtn').textContent = 'Iniciar'; }
$('pomoBtn').onclick = () => {
  if (pomo.timer) return parar();
  document.querySelector('.pomo').classList.add('rodando'); $('pomoBtn').textContent = 'Pausar';
  pomo.timer = setInterval(() => { if (--pomo.resta <= 0) { pomo.foco = !pomo.foco; pomo.resta = pomo.foco ? 1500 : 300; } mostrar(); }, 1000);
};
$('pomoReset').onclick = () => { parar(); pomo.foco = true; pomo.resta = 1500; mostrar(); };

/* ================= Tudo junto ================= */
function marcarHoje() { const p = P(); if (!p.estudos.includes(hojeISO)) p.estudos.push(hojeISO); salvar(); }
function atualizarTudo() {
  marcarHoje(); checarNivel(true);
  renderHero(); renderAvatar(); renderOpcoes(); renderPerfil(); renderTarefas();
  renderFiltros(); renderMaterias(); desenhar(); atualizarResumo();
}
atualizarTudo();
ir(location.hash.slice(1) || 'inicio');

/* ================= Revelar ao rolar + barra de leitura ================= */
const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('leitura').style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
}, { passive: true });
