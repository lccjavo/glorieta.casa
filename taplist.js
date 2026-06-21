(function () {
  function el(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function buildItem(item, index) {
    const article = el('article', 'tap-item tap-item-new' + (item.soldOut ? ' sold-out' : ''));

    const info = el('div', 'tap-info');
    const h3 = el('h3');
    const tapName = el('span', 'tap-name');
    tapName.appendChild(el('span', 'beer-dot ' + item.color));
    const nameSpan = el('span');
    nameSpan.textContent = `${index + 1}. ${item.name}`;
    tapName.appendChild(nameSpan);
    h3.appendChild(tapName);
    info.appendChild(h3);

    const p = el('p');
    p.textContent = `${item.style} · ${item.brewery} · ${item.abv}`;
    info.appendChild(p);

    const right = el('div', 'tap-right');
    const actions = el('span', 'tap-actions');
    const hops = el('span', 'hops');
    for (let i = 0; i < 5; i++) {
      hops.appendChild(el('span', i < item.hops ? 'filled' : ''));
    }
    actions.appendChild(hops);
    const price = el('span', 'tap-price');
    price.textContent = `$${item.price}`;
    actions.appendChild(price);
    right.appendChild(actions);

    article.appendChild(info);
    article.appendChild(right);
    return article;
  }

  async function renderTaplist(gridSelector) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;

    try {
      const res = await fetch('/api/taplist', { cache: 'no-store' });
      if (!res.ok) throw new Error('taplist fetch failed');
      const items = await res.json();

      grid.innerHTML = '';
      items.forEach((item, index) => grid.appendChild(buildItem(item, index)));
    } catch (err) {
      console.error('Failed to load taplist', err);
    }
  }

  window.renderTaplist = renderTaplist;
})();
