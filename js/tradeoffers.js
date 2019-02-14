var itemPriceData = null;
async function start() {
  chrome.storage.local.get('itemPriceData', async function(result) {
    itemPriceData = result.itemPriceData;
    if (itemPriceData == undefined) {
      console.log('itemPriceData needs to be acquired for the first time.');
      await updateItemData();
    }else if ((new Date()).getTime()-(itemPriceData.timestamp*1000) > (86400*1000)) {
      console.log('Need to update itemData.');
      await updateItemData();
    }else {
      console.log('itemData acquired from cache.');
    }
  });

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
  var index = Number(btn.id.replace('priceTrade', ''));
  var trade = document.getElementsByClassName('tradeoffer_items_ctn ')[index];

  var offers = trade.getElementsByClassName('tradeoffer_item_list');
  var itemPrices = [];

  for (var i = 0; i < offers.length; i++) {
    var individualItems = offers[i].getElementsByClassName('trade_item');
    for (var j = 0; j < individualItems.length; j++) {
      var thisItem = individualItems[j];
      fetch('https://steamcommunity.com/economy/itemclasshover' + thisItem.getAttribute('data-economy-item').replace('classinfo', '') + '?content_only=1&l=english').then(async (response) => {
        response.text().then((text) => {
          var info = JSON.parse(text.match(/(?<='economy_item_[A-Za-z0-9]*',\s\s)(.*?)(?=,"descriptions")/g)[0] + '}');
          var skin = info.market_hash_name;

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

  await sleep(5000);
  console.log(itemPrices);

  var indItems1 = offers[0].getElementsByClassName('trade_item').length;
  for (var i = 0; i < offers.length; i++) {
    var individualItems = offers[i].getElementsByClassName('trade_item'),
        total = 0;
    for (var j = 0; j < individualItems.length; j++) {
      var p = document.createElement('p');
      var color;
      if (itemPrices[(i*indItems1)+j] != 'error') {
        p.innerHTML = '$' + itemPrices[(i*indItems1)+j];
        total += itemPrices[(i*indItems1)+j];
        color = '#daa429';
      }else {
        p.innerHTML = price;
        color = 'yellow';
      }
      p.style = 'position: absolute;top: 70%;left: 50%;transform: translate(-50%, -50%);color: ' + color + ';';
      individualItems[j].append(p);
    }

    if (i%2 == 0) {
      var s = document.createElement('span');
      s.innerHTML = '$' + total.toFixed(2);
      s.style = 'color: green;';
      trade.parentNode.getElementsByClassName('tradeoffer_header')[0].append(s);

      s = document.createElement('span');
      s.innerHTML = ' for ';
      s.style = 'color: #7884c5;';
      trade.parentNode.getElementsByClassName('tradeoffer_header')[0].append(s);
    }else {
      var s = document.createElement('span');
      s.innerHTML = '$' + total.toFixed(2);
      s.style = 'color: #c70000;';
      trade.parentNode.getElementsByClassName('tradeoffer_header')[0].append(s);
    }
  }

  await sleep(200);
  btn.style.display = 'none';
}
