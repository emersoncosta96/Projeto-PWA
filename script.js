document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkin-form');
  const nameInput = document.getElementById('name');
  const checkinList = document.getElementById('checkin-list');
  const submitBtn = document.getElementById('submit-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editIdInput = document.getElementById('edit-id');
  const offlineNotification = document.getElementById('offline-notification');

  // Verifica status da conexão
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineNotification.classList.remove('show');
    } else {
      offlineNotification.classList.add('show');
    }
  }

  // Carrega check-ins do localStorage
  const getCheckins = () => JSON.parse(localStorage.getItem('checkins')) || [];

  // Salva check-ins no localStorage
  const saveCheckins = (checkins) => {
    localStorage.setItem('checkins', JSON.stringify(checkins));
  };

  // Renderiza a lista de check-ins
  const renderCheckins = () => {
    checkinList.innerHTML = '';
    const checkins = getCheckins();

    if (checkins.length === 0) {
      checkinList.innerHTML = '<div class="list-group-item text-muted">Nenhum check-in registrado</div>';
      return;
    }

    checkins.forEach((checkin) => {
      const item = document.createElement('div');
      item.className = 'list-group-item';
      item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${escapeHtml(checkin.name)}</strong>
            <small class="text-muted d-block">${formatDate(checkin.timestamp)}</small>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${checkin.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${checkin.id}">Excluir</button>
          </div>
        </div>
      `;
      checkinList.appendChild(item);
    });

    // Adiciona eventos aos botões
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEdit);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
  };

  // Formata data
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Previne XSS
  const escapeHtml = (str) => {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  // Manipula o envio do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const id = editIdInput.value;

    if (!name || name.length < 2) {
      alert('Por favor, insira um nome válido (mínimo 2 caracteres)');
      return;
    }

    const checkins = getCheckins();

    if (id) {
      // Edição existente
      const index = checkins.findIndex(c => c.id === id);
      if (index !== -1) {
        checkins[index] = {
          ...checkins[index],
          name,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // Novo registro
      checkins.unshift({
        id: generateId(),
        name,
        timestamp: new Date().toISOString()
      });
    }

    saveCheckins(checkins);
    renderCheckins();
    resetForm();
  });

  // Gera ID único
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Reseta o formulário
  const resetForm = () => {
    form.reset();
    editIdInput.value = '';
    submitBtn.textContent = 'Registrar';
    cancelEditBtn.classList.add('d-none');
    nameInput.focus();
  };

  // Manipula a edição
  const handleEdit = (e) => {
    const id = e.target.getAttribute('data-id');
    const checkins = getCheckins();
    const checkin = checkins.find(c => c.id === id);

    if (checkin) {
      nameInput.value = checkin.name;
      editIdInput.value = checkin.id;
      submitBtn.textContent = 'Atualizar';
      cancelEditBtn.classList.remove('d-none');
      nameInput.focus();
    }
  };

  // Manipula o cancelamento da edição
  cancelEditBtn.addEventListener('click', resetForm);

  // Manipula a exclusão
  const handleDelete = (e) => {
    if (confirm('Tem certeza que deseja excluir este check-in?')) {
      const id = e.target.getAttribute('data-id');
      const checkins = getCheckins().filter(c => c.id !== id);
      saveCheckins(checkins);
      renderCheckins();
    }
  };

  // Inicializa a aplicação
  renderCheckins();
});