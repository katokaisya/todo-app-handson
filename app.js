const STORAGE_KEY = 'todo-app-tasks';

const form = document.querySelector('.task-form');
const input = document.querySelector('.task-input');
const taskList = document.querySelector('.task-list');

// LocalStorageからタスク配列を読み込む
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

// タスク配列をLocalStorageに保存する
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// タスク1件分の<li>要素を生成して返す
function createTaskItem(text, index) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.index = index;

  li.innerHTML = `
    <label class="task-label">
      <input type="checkbox" class="task-checkbox">
      <span class="task-text">${escapeHtml(text)}</span>
    </label>
    <div class="task-actions">
      <button type="button" class="task-edit-button">編集</button>
      <button type="button" class="task-delete-button">削除</button>
    </div>
  `;

  return li;
}

// XSS対策：文字列をHTMLエスケープする
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// タスク配列をもとにリストを全件描画する
function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach((text, index) => {
    taskList.appendChild(createTaskItem(text, index));
  });
}

// 削除ボタンのクリック：確認後にタスクを削除してLocalStorageに保存
taskList.addEventListener('click', (event) => {
  const target = event.target;
  const li = target.closest('.task-item');

  // 削除
  if (target.classList.contains('task-delete-button')) {
    if (!confirm('このタスクを削除しますか？')) return;

    const index = Number(li.dataset.index);
    const tasks = loadTasks();
    tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks(tasks);
    return;
  }

  // 編集：spanをinputに切り替えてボタンを「保存」に変更
  if (target.classList.contains('task-edit-button')) {
    const span = li.querySelector('.task-text');
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = span.textContent;
    span.replaceWith(editInput);

    target.className = 'task-save-button';
    target.textContent = '保存';

    editInput.focus();
    editInput.select();
    return;
  }

  // 保存：入力値でタスクを更新
  if (target.classList.contains('task-save-button')) {
    saveEdit(li);
  }
});

// 編集中のキーボード操作：Enter で保存、Escape でキャンセル
taskList.addEventListener('keydown', (event) => {
  if (!event.target.classList.contains('task-edit-input')) return;

  if (event.key === 'Enter') {
    saveEdit(event.target.closest('.task-item'));
  } else if (event.key === 'Escape') {
    renderTasks(loadTasks());
  }
});

// 編集内容をLocalStorageに保存して再描画する
function saveEdit(li) {
  const editInput = li.querySelector('.task-edit-input');
  const newText = editInput.value.trim();
  if (!newText) return;

  const index = Number(li.dataset.index);
  const tasks = loadTasks();
  tasks[index] = newText;
  saveTasks(tasks);
  renderTasks(tasks);
}

// フォーム送信：タスクを追加してLocalStorageに保存
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const tasks = loadTasks();
  tasks.push(text);
  saveTasks(tasks);
  renderTasks(tasks);

  input.value = '';
  input.focus();
});

// ページ読み込み時にLocalStorageからタスクを復元
renderTasks(loadTasks());
