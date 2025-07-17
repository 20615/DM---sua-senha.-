// Carrega as configs do config.json
async function carregarConfig() {
  const response = await fetch('config.json');
  return await response.json();
}

function atualizarCompeticoes(competicoes) {
  const select = document.getElementById('competicao');
  competicoes.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = `${c.nome} - R$ ${c.valor}`;
    select.appendChild(option);
  });
}

function formatarData(d) {
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function atualizarContador(dataEvento) {
  const contador = document.getElementById('contador');
  function atualizar() {
    const now = new Date();
    const diff = new Date(dataEvento) - now;
    if (diff <= 0) {
      contador.textContent = "Evento iniciado!";
      clearInterval(interval);
      return;
    }
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);
    contador.textContent = `Faltam ${dias}d ${horas}h ${minutos}m ${segundos}s para o evento`;
  }
  atualizar();
  const interval = setInterval(atualizar, 1000);
}

function gerarSenha(competicaoId, totalInscricoes) {
  const prefixo = "VAQ2025";
  // sequencial 001, 002...
  const numeroSeq = (totalInscricoes + 1).toString().padStart(3, '0');
  return `${prefixo}-${numeroSeq}`;
}

function validarTelefone(tel) {
  // Regex básico para telefone brasileiro (com DDD)
  const re = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return re.test(tel);
}

document.addEventListener('DOMContentLoaded', async () => {
  const config = await carregarConfig();

  atualizarCompeticoes(config.competicoes);
  atualizarContador(config.dataEvento);

  const pixChaveDiv = document.getElementById('pixChave');
  pixChaveDiv.textContent = config.pixChave;

  // Salvar inscrições no localStorage (simulado)
  let inscricoes = JSON.parse(localStorage.getItem('inscricoesVaquejada')) || [];

  const form = document.getElementById('inscricaoForm');
  const resultado = document.getElementById('resultado');
  const numeroSenhaEl = document.getElementById('numeroSenha');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const competicao = form.competicao.value;
    const nomeCavalo = form.nomeCavalo.value.trim();

    if (!nome || !telefone || !competicao || !nomeCavalo) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (!validarTelefone(telefone)) {
      alert('Digite um telefone válido com DDD. Exemplo: (38) 99999-9999');
      return;
    }

    const senha = gerarSenha(competicao, inscricoes.length);

    const novaInscricao = {
      nome,
      telefone,
      competicao,
      nomeCavalo,
      senha
    };

    inscricoes.push(novaInscricao);
    localStorage.setItem('inscricoesVaquejada', JSON.stringify(inscricoes));

    // Mostrar resultado
    numeroSenhaEl.textContent = senha;
    resultado.classList.remove('hidden');
    form.classList.add('hidden');
  });

  // Painel Gerente
  const loginGerenteInput = document.getElementById('loginGerente');
  const senhaGerenteInput = document.getElementById('senhaGerente');
  const btnLoginGerente = document.getElementById('btnLoginGerente');
  const painelConteudo = document.getElementById('painelConteudo');
  const listaInscricoes = document.getElementById('listaInscricoes');
  const btnLogoutGerente = document.getElementById('btnLogoutGerente');

  const gerenteCredenciais = {
    login: "davidmacedomota@gmail.com",
    senha: "David@20"
  };

  btnLoginGerente.addEventListener('click', () => {
    const login = loginGerenteInput.value.trim();
    const senha = senhaGerenteInput.value.trim();

    if (login === gerenteCredenciais.login && senha === gerenteCredenciais.senha) {
      painelConteudo.classList.remove('hidden');
      btnLoginGerente.disabled = true;
      loginGerenteInput.disabled = true;
      senhaGerenteInput.disabled = true;
      carregarPainel();
    } else {
      alert('Login ou senha incorretos.');
    }
  });

  btnLogoutGerente.addEventListener('click', () => {
    painelConteudo.classList.add('hidden');
    btnLoginGerente.disabled = false;
    loginGerenteInput.disabled = false;
    senhaGerenteInput.disabled = false;
    loginGerenteInput.value = '';
    senhaGerenteInput.value = '';
    listaInscricoes.innerHTML = '';
  });

  function carregarPainel() {
    listaInscricoes.innerHTML = '';
    inscricoes.forEach(ins => {
      const tr = document.createElement('tr');

      const tdNome = document.createElement('td');
      tdNome.textContent = ins.nome;
      tr.appendChild(tdNome);

      const tdTelefone = document.createElement('td');
      tdTelefone.textContent = ins.telefone;
      tr.appendChild(tdTelefone);

      const tdCompeticao = document.createElement('td');
      const comp = config.competicoes.find(c => c.id === ins.competicao);
      tdCompeticao.textContent = comp ? comp.nome : ins.competicao;
      tr.appendChild(tdCompeticao);

      const tdNomeCavalo = document.createElement('td');
      tdNomeCavalo.textContent = ins.nomeCavalo;
      tr.appendChild(tdNomeCavalo);

      const tdSenha = document.createElement('td');
      tdSenha.textContent = ins.senha;
      tr.appendChild(tdSenha);

      listaInscricoes.appendChild(tr);
    });
  }
});
