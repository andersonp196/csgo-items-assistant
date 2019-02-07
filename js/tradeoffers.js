chrome.storage.local.get(['itemData'], function(result) {
  itemData = result.itemData;
  if (itemData == undefined) {
    console.log('itemData needs to be acquired for the first time.');
    updateItemData();
  }else if ((new Date()).getTime()-(itemData.timestamp*1000) > (86400*1000)) {
    console.log('Need to update itemData.');
    updateItemData();
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
    priceTrade(this);
  });
  trades[i].insertBefore(btn, trades[i].childNodes[0]);
}

async function priceTrade(btn) {
  btn.innerText = 'Working...';
  btn.style.backgroundColor = '#7ffb7f'
  var index = Number(btn.id.replace('priceTrade', ''));
  var trade = document.getElementsByClassName('tradeoffer_items_ctn ')[index];

  var total = 0;
  var offers = trade.getElementsByClassName('tradeoffer_item_list');
  for (var items = 0; items < offers.length; items++) {
    var individualItems = offers[items].getElementsByClassName('trade_item');
    for (var individual = 0; individual < individualItems.length; individual++) {
      var thisItem = individualItems[individual];
      thisItem.dispatchEvent(event);
      await sleep(350);
      document.getElementsByClassName('economyitem_hover')[0].style.display = 'none';
      try {
        var skin = document.getElementsByClassName('hover_item_name')[0].innerText;
        var ext = ' (' + document.getElementsByClassName('item_desc_descriptors')[0].getElementsByClassName('descriptor')[0].innerText + ')';
        if (ext.includes('Exterior: ')) {
          skin += ext.replace('Exterior: ', '');
        }
        var priceOptions = Object.keys(itemData.items_list[skin].price);
        var price;
        if (priceOptions.includes('7_days')) {
          price = itemData.items_list[skin].price['7_days'].average;
        }else if (priceOptions.includes('30_days')) {
          price = itemData.items_list[skin].price['30_days'].average;
        }else if (priceOptions.includes('all_time')) {
          price = itemData.items_list[skin].price['all_time'].average;
        }else {
          price = 'error';
        }
        var p = document.createElement('p');
        var color;
        if (price != 'error') {
          p.innerHTML = '$' + price;
          total += price;
          color = '#daa429';
        }else {
          p.innerHTML = price;
          color = 'yellow';
        }
        p.style = 'position: absolute;top: 70%;left: 50%;transform: translate(-50%, -50%);color: ' + color + ';';
        thisItem.append(p);
      }catch(err) {
        var p = document.createElement('p');
        p.innerHTML = 'error';
        p.style = 'position: absolute;top: 70%;left: 50%;transform: translate(-50%, -50%);color: yellow;';
        thisItem.append(p);
      }
    }
    if (items%2 == 0) {
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
    total = 0;
  }
  await sleep(200);
  document.getElementsByClassName('tradeoffer_footer')[index].click();
  btn.style.display = 'none';
}
