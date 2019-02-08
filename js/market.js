async function addMarketBtns() {
  var btn = document.createElement('button');
  btn.innerText = 'Load all floats';
  btn.style = 'border: 1px solid black;background-color: #339433;';
  btn.addEventListener('click', function() {
    marketLoadAll();
  });
  document.getElementsByClassName('market_listing_header_namespacer')[0].parentNode.append(btn);

  var items = document.getElementsByClassName('market_listing_item_name_block');
  for (var i = 0; i < items.length; i++) {
    var btn2 = document.createElement('button');
    btn2.innerText = 'Load float';
    btn2.id = 'lfBtn' + i;
    btn2.className = 'loadFloatBtn';
    btn2.style = 'border: 1px solid black;background-color: #339433;';
    btn2.addEventListener('click', function() {
      marketLoadFloat(this);
    });
    items[i].append(btn2);
  }

  var itemBtns = [10, 20, 50, 100];
  for (var i = 0; i < itemBtns.length; i++) {
    var itemBtn = document.createElement('button');
    itemBtn.innerText = itemBtns[i] + ' Items';
    itemBtn.style = 'background-color: orange;border: 1px solid black;margin-right: 0.5%;';
    itemBtn.id = 'btn' + itemBtns[i];
    itemBtn.addEventListener('click', function() {
      var start = Number(document.getElementById('searchResults_start').innerText);
      window.location.href = window.location.href.split('?')[0] + '?query=&start=' + start + '&count=' + this.id.replace('btn', '');
    });
    document.getElementsByClassName('market_paging_summary ellipsis')[0].append(itemBtn);
  }
}

function getIds() {
  var itemIds = [];
  var items = document.getElementsByClassName('market_listing_item_name economy_item_hoverable');
  for (var i = 0; i < items.length; i++) {
    itemIds.push(items[i].id);
  }
  return itemIds;
}

addMarketBtns();

var itemIds1 = getIds();
var itemIds2 = itemIds1;

setInterval(function() {
  itemIds2 = getIds();
  for (var i = 0; i < itemIds2.length; i++) {
    if (itemIds2[i] !== itemIds1[i] || itemIds1[i] === undefined) {
      itemIds1 = itemIds2;
      addMarketBtns();
    }
  }
}, (3*1000));

async function marketLoadAll() {
  var btns = document.getElementsByClassName('loadFloatBtn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].style.display !== 'none') {
      marketLoadFloat(btns[i]);
      await sleep(500);
    }
  }
}

async function marketLoadFloat(btn) {
  function addText(btn, wear, link) {
    var a = document.createElement('a');
    a.innerText = 'Click for SS';
    a.style = 'appearance: button; -moz-appearance: button;-webkit-appearance: button;text-decoration: none;background-color: black;font-size: 13px;color: #d88b8b;';
    a.href = 'https://csgo.gallery/' + link;
    a.setAttribute('target', '_blank');
    btn.parentNode.append(a);

    var p = document.createElement('span');
    p.innerHTML = wear;
    p.style = 'font-size: 14px;margin-left: 1%;color: #daa429;';
    btn.parentNode.append(p);
  }

  btn.style.backgroundColor = '#7ffb7f';
  btn.innerText = 'Working...';
  try {
    var index = Number(btn.id.replace('lfBtn', ''));
    document.getElementsByClassName('market_actionmenu_button')[index].click();
    var link = document.getElementById('market_action_popup_itemactions').childNodes[0].href;
    document.getElementById('market_action_popup_itemactions').childNodes[0].style.display = 'none';

    try {
      var x = new XMLHttpRequest();
      x.open('GET', ('https://api.csgofloat.com/?url=' + link), true);
      x.onload = function () {
        var wear = JSON.parse(this.response).iteminfo.floatvalue;
        addText(btn, wear, link);
        btn.style.display = 'none';
      }
      x.send();
    }catch(err) {

    }
  }catch(err) {
    btn.style.backgroundColor = '#d88b8b';
    btn.innerText = 'Try again';
  }
}
