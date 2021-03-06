var itemPriceData = null,
    options = {};
async function start() {
  chrome.storage.sync.get(['tradepageExteriors', 'newCurr', 'currency', 'tradepagePhases'], function(result) {
    for (var key in result) {
      options[key] = result[key];
    }
  });

  var loaded = false;
  while (!loaded) {
    if (Object.keys(options).length > 0) {
      getTheData();
      loaded = true;
    }
    await sleep(100);
  }

  var trades = document.getElementsByClassName('tradeoffer');
  for (var i = 0; i < trades.length; i++) {
    var btn = document.createElement('button');
    btn.innerText = 'Click to price trade';
    btn.id = 'priceTrade' + i;
    btn.style = 'border: 1px solid black;background-color: #339433;';
    btn.addEventListener('click', function() {
      if (itemPriceData !== null) {
        priceTrade(this);
      }else {
        alert('Wait a bit longer for pricedata to download.');
      }
    });
    trades[i].insertBefore(btn, trades[i].childNodes[0]);
  }
}
start();

async function priceTrade(btn) {
  btn.innerText = 'Working...';
  btn.style.backgroundColor = '#7ffb7f'

  //making secondary icons 96x96
  var imageHolders = document.getElementsByClassName('tradeoffer_items secondary')[0].querySelectorAll('div.trade_item');
  for (var i = 0; i < imageHolders.length; i++) {
    imageHolders[i].style.width = '96px';
    imageHolders[i].style.height = '96px';
    imageHolders[i].querySelector('img').src = imageHolders[i].querySelector('img').src.replace('73fx73f', '96fx96f');
    imageHolders[i].querySelector('img').srcset = imageHolders[i].querySelector('img').src.replace('73fx73f', '96fx96f').replace('73fx73f', '96fx96f');
  }

  var index = Number(btn.id.replace('priceTrade', ''));
  var trade = document.getElementsByClassName('tradeoffer_items_ctn ')[index];

  var offers = trade.getElementsByClassName('tradeoffer_item_list');
  var itemPrices = [],
      itemExteriors = [],
      itemPhases = [];

  for (var i = 0; i < offers.length; i++) {
    var individualItems = offers[i].getElementsByClassName('trade_item');
    for (var j = 0; j < individualItems.length; j++) {
      var thisItem = individualItems[j];
      fetch('https://steamcommunity.com/economy/itemclasshover' + thisItem.getAttribute('data-economy-item').replace('classinfo', '') + '?content_only=1&l=english').then(async (response) => {
        response.text().then((text) => {
          var info = JSON.parse(text.match(/(?<='economy_item_[A-Za-z0-9]*',\s\s)(.*?)(?=,"descriptions")/g)[0] + '}');
          var skin = info.market_hash_name;
          if (options.tradepageExteriors) {
            itemExteriors.push(wearShortener(skin.split('(')[1].replace(')', '')));
          }
          if (options.tradepagePhases) {
            itemPhases.push(dopplerPhaseShortener(info.icon_url));
          }
          try {
            var priceOptions = Object.keys(itemPriceData.items_list[skin].price);
            var price;
            if (priceOptions.includes('7_days')) {
              price = itemPriceData.items_list[skin].price['7_days'].average;
            }else if (priceOptions.includes('30_days')) {
              price = itemPriceData.items_list[skin].price['30_days'].average;
            }else if (priceOptions.includes('all_time')) {
              price = itemPriceData.items_list[skin].price['all_time'].average;
            }else {
              price = 'error';
            }
          }catch(err) {
            price = 'error';
          }
          itemPrices.push(price);
        });
        await sleep(100);
      });
    }
  }

  var loaded = false;
  while (!loaded) {
    if (itemPrices.length == trade.getElementsByClassName('trade_item').length) {
      loaded = true;
    }
    await sleep(100);
  }

  var indItems1 = offers[0].getElementsByClassName('trade_item').length;
  for (var i = 0; i < offers.length; i++) {
    var individualItems = offers[i].getElementsByClassName('trade_item'),
        total = 0;
    for (var j = 0; j < individualItems.length; j++) {
      var p = document.createElement('p');
      var color;
      if (itemPrices[(i*indItems1)+j] != 'error') {
        p.innerHTML = itemPrices[(i*indItems1)+j] + ' ' + options.currency;
        total += itemPrices[(i*indItems1)+j];
        color = '#daa429';
      }else {
        p.innerHTML = price;
        color = 'yellow';
      }
      p.style = 'position: absolute; width: 100%; text-align: right; top: 78%; left: 50%; transform: translate(-50%, -50%); color: ' + color + ';';
      individualItems[j].append(p);

      if (options.tradepageExteriors) {
        p = document.createElement('p');
        p.innerText = itemExteriors[(i*indItems1)+j];
        p.style = 'font-size: 16px; font-weight: bold; position: absolute; margin: 0; bottom: 2%; left: 5%; z-index: 4; color: #c44610;';
        individualItems[j].append(p);
      }

      if (options.tradepagePhases && itemPhases[i] !== '') {
        p = document.createElement('p');
        p.innerText = itemPhases[i];
        var color;
        if (itemPhases[i] == 'Ruby') {
          color = '#c00000';
        }else if (itemPhases[i] == 'Sapph') {
          color = '#00d6e7';
        }else if (itemPhases[i] == 'Pearl') {
          color = '#734aff';
        }else if (itemPhases[i] == 'Emrld') {
          color = '#20ea42';
        }else {
          color = '#9300f7';
        }
        p.style = 'font-size: 16px; font-weight: bold; position: absolute; margin: 0; bottom: 17%; right: 5%; z-index: 4; color: ' + color + ';';
        individualItems[j].append(p);
      }
    }

    if (i%2 == 0) {
      var s = document.createElement('span');
      s.innerHTML = total.toFixed(2) + ' ' + options.currency;
      s.style = 'color: green;';
      trade.parentNode.getElementsByClassName('tradeoffer_header')[0].append(s);

      s = document.createElement('span');
      s.innerHTML = ' for ';
      s.style = 'color: #7884c5;';
      trade.parentNode.getElementsByClassName('tradeoffer_header')[0].append(s);
    }else {
      var s = document.createElement('span');
      s.innerHTML = total.toFixed(2) + ' ' + options.currency;
      s.style = 'color: #c70000;';
      trade.parentNode.getElementsByClassName('tradeoffer_header')[0].append(s);
    }
  }

  await sleep(200);
  btn.style.display = 'none';
}
