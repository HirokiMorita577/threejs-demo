document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = `
    <ul>
      <li><a href="index.html">トップ</a></li>
      <li><a href="about.html">このサイトについて</a></li>
      <li><a href="models.html">モデル一覧</a></li>
      <li><a href="main.html">3D空間に入る</a></li>
    </ul>
  `;
});
