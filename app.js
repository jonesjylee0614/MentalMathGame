import { LEVELS, findLevel, listCategories } from './levels.js';
import { Store } from './store.js';
import { Game } from './engine.js';
import { audio } from './audio.js';
import { formatDate, formatPercent, formatTime } from './utils.js';

const appEl = document.getElementById('app');
const navEl = document.getElementById('main-nav');
const sidebarEl = document.getElementById('sidebar');
const toastEl = document.getElementById('toast');
const toggleMenuBtn = document.getElementById('toggle-menu');

const ROUTES = ['home', 'levels', 'stats', 'settings'];

const parseHash = () => {
  const hash = location.hash.replace('#/', '') || 'home';
  const [route, query = ''] = hash.split('?');
  const params = {};
  if (query) {
    query.split('&').forEach((pair) => {
      if (!pair) return;
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }
  return { route, params };
};

const navigate = (route, params = {}) => {
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  location.hash = `#/${route}${query ? `?${query}` : ''}`;
};

const showToast = (message) => {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2000);
};

const renderNav = (currentRoute) => {
  navEl.innerHTML = ROUTES.map((route) => {
    const active = route === currentRoute ? 'active' : '';
    const labels = { home: '🏠 首页', levels: '🧩 关卡', stats: '📊 统计', settings: '⚙️ 设置' };
    return `<a href="#/${route}" class="${active}">${labels[route]}</a>`;
  }).join('');
};

const renderSidebar = () => {
  const profile = Store.getProfile();
  const stats = Store.getStats();
  const settings = Store.getSettings();
  sidebarEl.innerHTML = `
    <div class="card">
      <h2>🎮 玩家档案</h2>
      <p><strong>${profile.name}</strong></p>
      <p>创建于 ${formatDate(profile.createdAt)}</p>
    </div>
    <div class="card">
      <h2>⏱️ 累计成绩</h2>
      <p>积分：<strong>${stats.totalScore}</strong></p>
      <p>游玩：${stats.totalPlays} 局</p>
      <p>正确率：${stats.totalCorrect + stats.totalWrong > 0 ? formatPercent(stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) : '—'}</p>
      <p>最佳连击：${stats.bestCombo}</p>
    </div>
    <div class="card">
      <h2>⚙️ 偏好</h2>
      <p>音效：${settings.audio ? '开启' : '关闭'}</p>
      <p>色盲模式：${settings.colorblind ? '开启' : '关闭'}</p>
    </div>
  `;
};

const getLastPlayedLevel = () => {
  const progress = Store.getProgress();
  if (!progress.length) return null;
  return progress.slice().sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))[0];
};

const renderHome = () => {
  const stats = Store.getStats();
  const progress = Store.getProgress();
  const last = getLastPlayedLevel();
  const lastLevel = last ? findLevel(last.levelId) : null;
  const best = progress.slice().sort((a, b) => b.bestScore - a.bestScore)[0];
  appEl.innerHTML = `
    <div class="card">
      <h2>🌱 欢迎回来，勇士！</h2>
      <p>累计积分 <strong>${stats.totalScore}</strong> ｜ 共完成 <strong>${stats.totalPlays}</strong> 场挑战。</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn" id="start-first">立即开战</button>
        ${last ? `<button class="btn ghost" id="continue">继续 ${lastLevel ? lastLevel.name : last.levelId}</button>` : ''}
        <button class="btn ghost" id="goto-levels">查看全部关卡</button>
      </div>
    </div>
    <div class="grid cols-2">
      <div class="card">
        <h3>🔥 热门推荐</h3>
        <ul>
          ${LEVELS.slice(0, 5).map((lv) => `<li>${lv.name}（${lv.desc}）</li>`).join('')}
        </ul>
      </div>
      <div class="card">
        <h3>🏆 我的亮点</h3>
        ${best ? `<p>最高分关卡：<strong>${best.levelId}</strong> ${best.bestScore} 分</p>` : '<p class="empty-state">暂未产生成绩</p>'}
      </div>
    </div>
  `;

  document.getElementById('start-first').addEventListener('click', () => {
    navigate('levels');
  });
  document.getElementById('goto-levels').addEventListener('click', () => {
    navigate('levels');
  });
  const continueBtn = document.getElementById('continue');
  if (continueBtn && last) {
    continueBtn.addEventListener('click', () => {
      navigate('play', { levelId: last.levelId });
    });
  }
};

const renderLevels = () => {
  const categories = listCategories();
  appEl.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <h2>🧩 选择关卡</h2>
        <input id="level-search" class="answer-input" placeholder="搜索关卡关键词"/>
      </div>
      ${categories
        .map((category) => `
          <section style="margin-top:18px;">
            <h3>${category.name}</h3>
            <div class="grid cols-2">
              ${category.items
                .map((level) => {
                  const progress = Store.getProgressByLevel(level.id);
                  const badge = progress ? `<span class="badge">最高 ${progress.bestScore} 分</span>` : '';
                  return `
                    <div class="level-card" data-level-id="${level.id}">
                      <div>
                        <h3>${level.name}</h3>
                        <p>${level.desc}</p>
                      </div>
                      <div class="level-meta">
                        <span>题量：${level.count}</span>
                        <span>时限：${level.timeSec}s</span>
                        <span>难度：${level.difficulty.toFixed(1)}</span>
                        ${badge}
                      </div>
                      <div>
                        <button class="btn small" data-action="start" data-level-id="${level.id}">开始挑战</button>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </section>
        `)
        .join('')}
    </div>
  `;

  const searchInput = document.getElementById('level-search');
  searchInput.addEventListener('input', (event) => {
    const value = event.target.value.trim();
    document.querySelectorAll('.level-card').forEach((card) => {
      const id = card.dataset.levelId;
      const level = findLevel(id);
      if (!level) return;
      const visible = !value || level.name.includes(value) || level.desc.includes(value) || level.id.includes(value);
      card.style.display = visible ? 'flex' : 'none';
    });
  });

  appEl.querySelectorAll('[data-action="start"]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const levelId = event.currentTarget.dataset.levelId;
      navigate('play', { levelId });
    });
  });
};

const renderStats = () => {
  const stats = Store.getStats();
  const progress = Store.getProgress();
  appEl.innerHTML = `
    <div class="card">
      <h2>📊 总览</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>累计积分</h4>
          <strong>${stats.totalScore}</strong>
        </div>
        <div class="stat-card">
          <h4>游玩次数</h4>
          <strong>${stats.totalPlays}</strong>
        </div>
        <div class="stat-card">
          <h4>正确率</h4>
          <strong>${stats.totalCorrect + stats.totalWrong > 0 ? formatPercent(stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) : '—'}</strong>
        </div>
        <div class="stat-card">
          <h4>累计用时</h4>
          <strong>${formatTime(stats.totalTimeSec)}</strong>
        </div>
        <div class="stat-card">
          <h4>最佳连击</h4>
          <strong>${stats.bestCombo}</strong>
        </div>
      </div>
      <h3 style="margin-top:24px;">🎯 关卡详情</h3>
      ${progress.length
        ? `<table class="table">
            <thead>
              <tr><th>关卡</th><th>最高分</th><th>最佳用时</th><th>最佳正确率</th><th>游玩次数</th></tr>
            </thead>
            <tbody>
              ${progress
                .map(
                  (item) => {
                    const level = findLevel(item.levelId);
                    return `<tr>
                    <td>${level ? level.name : item.levelId}</td>
                    <td>${item.bestScore}</td>
                    <td>${item.bestTimeSec}s</td>
                    <td>${formatPercent(item.bestAccuracy)}</td>
                    <td>${item.playCount}</td>
                  </tr>`;
                  })
                .join('')}
            </tbody>
          </table>`
        : '<p class="empty-state">暂无游玩记录，快去挑战一局吧！</p>'}
    </div>
  `;
};

const renderSettings = () => {
  const settings = Store.getSettings();
  appEl.innerHTML = `
    <div class="card">
      <h2>⚙️ 设置</h2>
      <div class="settings-list">
        <div class="settings-item">
          <label for="setting-audio">音效</label>
          <label class="switch">
            <input type="checkbox" id="setting-audio" ${settings.audio ? 'checked' : ''}/>
            <span class="slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <label for="setting-shake">错误震动</label>
          <label class="switch">
            <input type="checkbox" id="setting-shake" ${settings.shake ? 'checked' : ''}/>
            <span class="slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <label for="setting-color">色盲友好</label>
          <label class="switch">
            <input type="checkbox" id="setting-color" ${settings.colorblind ? 'checked' : ''}/>
            <span class="slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <label for="setting-font">字号倍率</label>
          <input type="range" min="0.8" max="1.4" step="0.1" id="setting-font" value="${settings.fontScale}"/>
        </div>
      </div>
    </div>
  `;

  const audioInput = document.getElementById('setting-audio');
  audioInput.addEventListener('change', (event) => {
    const next = Store.updateSettings({ audio: event.target.checked });
    audio.setEnabled(next.audio);
    showToast(`音效${next.audio ? '已开启' : '已关闭'}`);
  });

  document.getElementById('setting-shake').addEventListener('change', (event) => {
    Store.updateSettings({ shake: event.target.checked });
  });

  document.getElementById('setting-color').addEventListener('change', (event) => {
    const next = Store.updateSettings({ colorblind: event.target.checked });
    document.documentElement.dataset.theme = next.colorblind ? 'colorblind' : '';
  });

  document.getElementById('setting-font').addEventListener('input', (event) => {
    const scale = Number(event.target.value);
    Store.updateSettings({ fontScale: scale });
    document.documentElement.style.setProperty('--font-scale', scale);
  });
};

const createHpBar = (hp, max) => {
  const percent = max === 0 ? 0 : Math.round((hp / max) * 100);
  return `<div class="hp-bar ${percent <= 30 ? 'danger' : ''}"><div style="width:${percent}%"></div></div>`;
};

const updateGameView = (state) => {
  const timerEl = document.getElementById('game-timer');
  const progressEl = document.getElementById('game-progress');
  const playerHpEl = document.getElementById('player-hp');
  const monsterHpEl = document.getElementById('monster-hp');
  const comboEl = document.getElementById('game-combo');
  if (timerEl) timerEl.textContent = formatTime(state.timeLeft);
  if (progressEl) {
    const currentDisplay = Math.min(state.questionIndex + 1, state.questionTotal);
    progressEl.textContent = `${currentDisplay}/${state.questionTotal}`;
    const bar = document.getElementById('progress-bar-inner');
    if (bar) bar.style.width = `${Math.round((state.questionIndex / Math.max(1, state.questionTotal)) * 100)}%`;
  }
  if (playerHpEl) playerHpEl.innerHTML = createHpBar(state.hp.player, state.hpMax.player);
  if (monsterHpEl) monsterHpEl.innerHTML = createHpBar(state.hp.monster, state.hpMax.monster);
  if (comboEl) comboEl.textContent = state.combo;
};

const renderQuestion = (question) => {
  const textEl = document.getElementById('question-text');
  const inputEl = document.getElementById('answer-input');
  const optionsEl = document.getElementById('answer-options');
  if (!textEl) return;
  textEl.textContent = question.text;
  if (inputEl) {
    inputEl.value = '';
    inputEl.placeholder = question.kind === 'pair' ? '格式：x,y' : '输入答案后回车';
    inputEl.type = 'text';
    inputEl.disabled = question.kind === 'compare';
  }
  if (optionsEl) {
    optionsEl.innerHTML = '';
    if (question.kind === 'compare') {
      ['>', '=', '<'].forEach((symbol) => {
        const btn = document.createElement('button');
        btn.className = 'btn square';
        btn.textContent = symbol;
        btn.addEventListener('click', () => Game.submit(symbol));
        optionsEl.appendChild(btn);
      });
    }
  }
  if (inputEl && question.kind !== 'compare') {
    setTimeout(() => inputEl.focus(), 50);
  }
};

const renderPlay = (params) => {
  const levelId = params.levelId;
  const level = findLevel(levelId);
  if (!level) {
    appEl.innerHTML = `<div class="card"><h2>未找到关卡</h2><button class="btn" id="back-levels">返回关卡列表</button></div>`;
    document.getElementById('back-levels').addEventListener('click', () => navigate('levels'));
    return;
  }

  appEl.innerHTML = `
    <div class="card">
      <div class="game-info">
        <div>关卡：<strong>${level.name}</strong></div>
        <div>倒计时：<strong id="game-timer">${formatTime(level.timeSec)}</strong></div>
        <div>进度：<strong id="game-progress">0/${level.count}</strong></div>
        <div>连击：<strong id="game-combo">0</strong></div>
      </div>
      <div class="progress-bar"><div id="progress-bar-inner" style="width:0"></div></div>
      <div class="stage" id="battle-stage">
        <div class="entity plant">🌿</div>
        <div class="entity zombie">🧟</div>
        <div class="hp-panel" style="position:absolute;left:16px;top:16px;width:160px;">
          <div>我方 HP</div>
          <div id="player-hp"></div>
        </div>
        <div class="hp-panel" style="position:absolute;right:16px;top:16px;width:160px;">
          <div>怪物 HP</div>
          <div id="monster-hp"></div>
        </div>
      </div>
      <div class="question-box">
        <div class="question-text" id="question-text"></div>
        <div class="answer-row">
          <input id="answer-input" class="answer-input" autocomplete="off" />
          <button class="btn" id="submit-answer">提交</button>
        </div>
        <div class="answer-options" id="answer-options"></div>
      </div>
    </div>
  `;

  const submitBtn = document.getElementById('submit-answer');
  const answerInput = document.getElementById('answer-input');
  submitBtn.addEventListener('click', () => {
    if (answerInput.disabled) return;
    Game.submit(answerInput.value);
  });
  answerInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      Game.submit(answerInput.value);
    }
  });

  const stageEl = document.getElementById('battle-stage');
  const onUpdate = (event) => updateGameView(event.detail);
  const onQuestion = (event) => renderQuestion(event.detail);
  const onFeedback = (event) => {
    if (!stageEl) return;
    const { correct } = event.detail;
    const projectile = document.createElement('div');
    projectile.className = `projectile ${correct ? 'bullet' : 'rock'}`;
    stageEl.appendChild(projectile);
    if (!correct && Store.getSettings().shake) {
      stageEl.classList.add('shake');
      setTimeout(() => stageEl.classList.remove('shake'), 350);
    }
    setTimeout(() => projectile.remove(), 500);
    audio.play(correct ? 'correct' : 'wrong');
  };
  const removeListeners = () => {
    Game.removeEventListener('update', onUpdate);
    Game.removeEventListener('question', onQuestion);
    Game.removeEventListener('feedback', onFeedback);
    Game.removeEventListener('finish', onFinish);
    window.removeEventListener('hashchange', removeListeners);
  };
  const onFinish = (event) => {
    removeListeners();
    showToast(event.detail.outcome === 'victory' ? '胜利！' : '挑战结束');
    navigate('result');
  };
  Game.addEventListener('update', onUpdate);
  Game.addEventListener('question', onQuestion);
  Game.addEventListener('feedback', onFeedback);
  Game.addEventListener('finish', onFinish, { once: true });

  Game.init(level);
  Game.start();

  window.addEventListener('hashchange', removeListeners, { once: true });
};

const renderResult = () => {
  const raw = sessionStorage.getItem('mentalGame:lastResult');
  if (!raw) {
    appEl.innerHTML = `<div class="card"><h2>暂无战报</h2><button class="btn" id="back-home">返回首页</button></div>`;
    document.getElementById('back-home').addEventListener('click', () => navigate('home'));
    return;
  }
  const result = JSON.parse(raw);
  const level = findLevel(result.levelId);
  const accuracy = result.total ? formatPercent(result.correct / result.total) : '—';
  appEl.innerHTML = `
    <div class="card">
      <h2>🏁 战报</h2>
      <p>关卡：<strong>${level ? level.name : result.levelId}</strong></p>
      <p>得分：<strong>${result.score}</strong> ｜ 正确：${result.correct}/${result.total} ｜ 正确率：${accuracy}</p>
      <p>用时：${result.timeUsed}s ｜ 剩余：${result.timeLeft}s ｜ 最大连击：${result.comboMax}</p>
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;">
        <button class="btn" id="replay">再战一次</button>
        <button class="btn ghost" id="back-levels">返回关卡</button>
        <button class="btn ghost" id="back-home">回到首页</button>
      </div>
      <h3 style="margin-top:20px;">作答记录</h3>
      <ul>
        ${result.history
          .map((item, index) => `<li>第 ${index + 1} 题：${item.correct ? '✅' : '❌'}（答：${item.answer || '空'}，应：${item.expected}）</li>`)
          .join('')}
      </ul>
    </div>
  `;
  document.getElementById('replay').addEventListener('click', () => navigate('play', { levelId: result.levelId }));
  document.getElementById('back-levels').addEventListener('click', () => navigate('levels'));
  document.getElementById('back-home').addEventListener('click', () => navigate('home'));
};

const render = () => {
  const { route, params } = parseHash();
  renderNav(route);
  renderSidebar();
  const settings = Store.getSettings();
  document.documentElement.dataset.theme = settings.colorblind ? 'colorblind' : '';
  document.documentElement.style.setProperty('--font-scale', settings.fontScale);
  document.body.dataset.menu = '';
  if (route === 'home') renderHome();
  else if (route === 'levels') renderLevels();
  else if (route === 'play') renderPlay(params);
  else if (route === 'result') renderResult();
  else if (route === 'stats') renderStats();
  else if (route === 'settings') renderSettings();
  else navigate('home');
};

window.addEventListener('hashchange', render);
toggleMenuBtn.addEventListener('click', () => {
  const open = document.body.dataset.menu === 'open';
  document.body.dataset.menu = open ? '' : 'open';
});

document.addEventListener('click', (event) => {
  if (document.body.dataset.menu === 'open' && !sidebarEl.contains(event.target) && event.target !== toggleMenuBtn) {
    document.body.dataset.menu = '';
  }
});

render();
