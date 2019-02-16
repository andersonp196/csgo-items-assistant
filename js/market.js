var itemPriceData = null,
    options = {},
    cachedData = {};
async function start() {
  chrome.storage.sync.get(['marketSS', 'marketPhases'], function(result) {
    for (var key in result) {
      options[key] = result[key];
    }
  });

  var loaded = false;
  while (!loaded) {
    if (Object.keys(options).length > 0) {
      loaded = true;
    }
    await sleep(100);
  }

  if (options.marketPhases) {
    addPhases();
  }

  addMarketBtns();

  var itemIds1 = getIds();
  var itemIds2 = itemIds1;

  setInterval(function() {
    itemIds2 = getIds();
    for (var i = 0; i < itemIds2.length; i++) {
      if (itemIds2[i] !== itemIds1[i] || itemIds1[i] === undefined) {
        itemIds1 = itemIds2;
        if (options.marketPhases) {
          addPhases();
        }
        addMarketBtns();
      }
    }
  }, (1000));
}
start();

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
    if (items[i].querySelector('span').id in cachedData) {
      items[i].innerHTML = cachedData[items[i].querySelector('span').id];
    }else {
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
  }

  if (document.getElementById('btn10') == undefined) {
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
}

function getIds() {
  var itemIds = [];
  var items = document.getElementsByClassName('market_listing_item_name economy_item_hoverable');
  for (var i = 0; i < items.length; i++) {
    itemIds.push(items[i].id);
  }
  return itemIds;
}

function addPhases() {
  var icons = document.getElementById('searchResultsRows').querySelectorAll('img');
  for (var i = 0; i < icons.length; i++) {
    if (icons[i].src.includes('https://steamcommunity-a.akamaihd.net/economy/image/')) {
      var iconUrl = icons[i].src.replace('https://steamcommunity-a.akamaihd.net/economy/image/', '').split('/')[0];
      var phase = dopplerPhaseShortener(iconUrl);
      if (phase !== '') {
        var p = document.createElement('p');
        p.innerText = phase;
        var color;
        switch(phase) {
          case 'Ruby': color = '#c00000'; break;
          case 'Sapph': color = '#00d6e7'; break;
          case 'Pearl': color = '#734aff'; break;
          case 'Emrld': color = '#20ea42'; break;
          default: color = '#9300f7'; break;
        }
        p.style = 'font-size: 16px; font-weight: bold; position: absolute; margin: 0; bottom: 11%; right: 13%; z-index: 4; color: ' + color + ';';
        icons[i].parentNode.append(p);
      }
    }
  }
}

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
    if (options.marketSS) {
      var a = document.createElement('a');
      a.innerText = 'Click for SS';
      a.style = 'appearance: button; -moz-appearance: button;-webkit-appearance: button;text-decoration: none;background-color: black;font-size: 13px;color: #d88b8b;';
      a.href = 'https://csgo.gallery/' + link;
      a.setAttribute('target', '_blank');
      btn.parentNode.append(a);
    }
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
        cachedData[btn.parentNode.querySelector('span').id] = btn.parentNode.innerHTML;
      }
      x.send();
    }catch(err) {

    }
  }catch(err) {
    btn.style.backgroundColor = '#d88b8b';
    btn.innerText = 'Try again';
  }
}
