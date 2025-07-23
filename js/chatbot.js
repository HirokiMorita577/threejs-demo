document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const options = document.getElementById('options');
  options.style.display = 'none'; // もう使わない

  const botIntro = 'こんにちは！質問があればどうぞ。';

  const qaPairs = {
    'どんなサイトなの？': 'このサイトは、Three.jsとCannon-esを使って3D空間を体験できるWebサイトです。',
    '操作は簡単？': 'WASDキーで移動、マウスで視点操作ができるので簡単です！',
    'どんな技術を使ってるの？': 'Three.js（描画）と Cannon-es（物理エンジン）を使っています。',
    '物理演算って何？': 'ボールの落下や衝突など、現実っぽい動きをシミュレートする技術です。'
  };

  function addMessage(content, type = 'bot', isHTML = false) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (isHTML) {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content;
    }
    div.appendChild(bubble);
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return bubble;
  }

  function showQuestionOptions() {
    let html = '';
    for (let q in qaPairs) {
      html += `<button class="question-btn">${q}</button>`;
    }
    const bubble = addMessage(html, 'user', true);

    // 各ボタンにイベント追加
    bubble.querySelectorAll('.question-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.textContent;

        // ボタンを無効化＆テキストに変換
        bubble.innerHTML = question;

        // Botの返答を表示
        setTimeout(() => {
          addMessage(qaPairs[question], 'bot');
          setTimeout(() => {
            showQuestionOptions(); // 再び質問を表示
          }, 1000);
        }, 600);
      });
    });
  }

  // 初期化
  addMessage(botIntro, 'bot');
  setTimeout(() => {
    showQuestionOptions();
  }, 1000);
});
