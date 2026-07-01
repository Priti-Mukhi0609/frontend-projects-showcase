
  let notes = JSON.parse(localStorage.getItem('priti-notes') || '[]');

  function saveNotes() {
    localStorage.setItem('priti-notes', JSON.stringify(notes));
  }

  function updateCharCount() {
    const body = document.getElementById('noteBody').value;
    const left = 500 - body.length;
    document.getElementById('charCount').textContent = `${left} characters left`;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  let editingId = null;

  function addNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const body  = document.getElementById('noteBody').value.trim();
    if (!title && !body) return;

    if (editingId !== null) {
      // ── UPDATE EXISTING NOTE ──
      const note = notes.find(n => n.id === editingId);
      if (note) {
        note.title = title || 'Untitled';
        note.body = body;
        note.editedAt = Date.now();
      }
      cancelEdit();
    } else {
      // ── ADD NEW NOTE ──
      const note = {
        id: Date.now(),
        title: title || 'Untitled',
        body,
        createdAt: Date.now()
      };
      notes.unshift(note);

      document.getElementById('noteTitle').value = '';
      document.getElementById('noteBody').value = '';
      updateCharCount();
    }

    saveNotes();
    renderNotes();
  }

  function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    editingId = id;
    document.getElementById('noteTitle').value = note.title === 'Untitled' ? '' : note.title;
    document.getElementById('noteBody').value = note.body;
    updateCharCount();

    document.getElementById('formEyebrow').textContent = 'Editing Note';
    document.getElementById('saveBtn').textContent = '✓ Save Changes';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    document.getElementById('addForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('noteTitle').focus();
  }

  function cancelEdit() {
    editingId = null;
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteBody').value = '';
    updateCharCount();

    document.getElementById('formEyebrow').textContent = 'New Note';
    document.getElementById('saveBtn').textContent = '+ Add Note';
    document.getElementById('cancelEditBtn').style.display = 'none';
  }

  function deleteNote(id) {
    if (editingId === id) cancelEdit();
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
  }

  function renderNotes() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.body.toLowerCase().includes(query)
    );

    const grid = document.getElementById('notesGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('noteCount');

    count.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      empty.querySelector('h3').textContent = query ? 'No results found' : 'No notes yet';
      empty.querySelector('p').textContent  = query ? `No notes matching "${query}"` : 'Write your first note above!';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = filtered.map(n => `
      <div class="note-card">
        <div class="note-card-title">${escHtml(n.title)}</div>
        ${n.body ? `<div class="note-card-body">${escHtml(n.body)}</div>` : ''}
        <div class="note-card-footer">
          <span class="note-date">${formatDate(n.createdAt)}${n.editedAt ? ' · edited' : ''}</span>
          <div class="note-actions">
            <button class="btn-edit" onclick="editNote(${n.id})" title="Edit">✏️</button>
            <button class="btn-delete" onclick="deleteNote(${n.id})" title="Delete">🗑</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Enter key to add note
  document.getElementById('noteTitle').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('noteBody').focus();
  });

  // ── THEME TOGGLE ──
  function toggleTheme() {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      btn.textContent = '☽';
      localStorage.setItem('notes-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      btn.textContent = '⏾';
      localStorage.setItem('notes-theme', 'dark');
    }
  }

  (function initTheme() {
    const saved = localStorage.getItem('notes-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('themeToggle').textContent = '⏾';
    }
  })();

  renderNotes();
