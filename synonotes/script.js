let currentId = null;
let allNotes = [];

function loadNotes() {
  allNotes = JSON.parse(localStorage.getItem('notes') || '[]');
  renderNotes(allNotes);
}

function saveNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value;
  if (!title) return alert('Title required!');
  if (currentId) {
    // Edit existing
    const idx = allNotes.findIndex(n => n.id === currentId);
    if (idx !== -1) {
      allNotes[idx].title = title;
      allNotes[idx].content = content;
    }
  } else {
    // New note
    allNotes.push({ id: Date.now().toString(), title, content });
  }
  localStorage.setItem('notes', JSON.stringify(allNotes));
  currentId = null;
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').value = '';
  document.getElementById('noteFormLabel').textContent = 'New note';
  loadNotes();
}

function renderNotes(notes) {
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  if (notes.length) {
    notes.forEach(note => {
      const div = document.createElement('div');
      div.className = 'note';
      div.innerHTML = `
        <h4>${note.title}</h4>
        <p>${note.content}</p>
        <button onclick="editNote('${note.id}')">Edit</button>
        <button onclick="deleteNote('${note.id}')">Delete</button>
        <button onclick="exportSingleNotePDF('${note.id}')">Export</button>
      `;
      notesList.appendChild(div);
    });
  } else {
    notesList.innerHTML = '<p>No notes yet.</p>';
  }
}

function editNote(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return;
  currentId = id;
  document.getElementById('noteFormLabel').textContent = 'Edit Note';
  document.getElementById('noteTitle').value = note.title;
  document.getElementById('noteContent').value = note.content;
}

function deleteNote(id) {
  allNotes = allNotes.filter(n => n.id !== id);
  localStorage.setItem('notes', JSON.stringify(allNotes));
  loadNotes();
}

function filterNotes() {
  const query = document.getElementById('searchBar').value.toLowerCase();
  const filtered = allNotes.filter(note => note.title.toLowerCase().includes(query));
  renderNotes(filtered);
}

function exportNotesPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;
  allNotes.forEach(note => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleWidth = doc.getTextWidth(note.title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(note.title, titleX, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(note.content, 10, y + 10);
    y += 30;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save('notes.pdf');
}

function exportSingleNotePDF(id) {
  const note = allNotes.find(n => n.id === id);
  if (!note) return alert('Note not found!');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  const pageWidth = doc.internal.pageSize.getWidth();
  const titleWidth = doc.getTextWidth(note.title);
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(note.title, titleX, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(note.content, 10, 50);
  doc.save(`${note.title || 'note'}.pdf`);
}

// Initial load
loadNotes();
