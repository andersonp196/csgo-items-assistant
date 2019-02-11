var itemPriceData = null;
async function start() {
  chrome.storage.local.get(['itemPriceData'], async function(result) {
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

  await pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.m_steamid`);
  var userId = document.getElementById('hiddenDiv').innerText;

  var loaded = false;
  while (!loaded) {
    if (document.getElementById('inventory_' + userId + '_730_2').querySelectorAll('a.inventory_item_link').length > 0) {
      loaded = true;
    }
    await sleep(100);
  }

  await pageCode(`var pages = g_ActiveInventory.m_rgPages;
                  for (var i = 0; i < pages.length; i++) {
                    g_ActiveInventory.EnsurePageItemsCreated(i);
                  }`);

  var x = new XMLHttpRequest();
  x.open('GET', ('https://steamcommunity.com/profiles/' + userId + '/inventory/json/730/2'), true);
  x.onload = async function () {
    var data = JSON.parse(this.response);
    var itemData = dataLoaded(data);
    sortData(itemData, data, userId);
  }
  x.send();
}

async function veryStart() {
  var csgo = setInterval(async function() {
    await pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.m_appid`);
    if (document.getElementById('hiddenDiv').innerText == '730') {
      clearInterval(csgo);
      start();
    }
  }, 500);
}
veryStart();

function dataLoaded(data) {
  var itemData = [];
  for (var key in data.rgDescriptions) {
    var thisData = data.rgDescriptions[key];

    var type;
    try {
      type = thisData.type;
    }catch(err) {
      type = null;
    }


    var exterior;
    try {
      var ext = thisData.descriptions[0].value;
      if (ext == 'Exterior: Factory New') {
        exterior = 'FN';
      }else if (ext == 'Exterior: Minimal Wear') {
        exterior = 'MW';
      }else if (ext == 'Exterior: Field-Tested') {
        exterior = 'FT';
      }else if (ext == 'Exterior: Well-Worn') {
        exterior = 'WW';
      }else if (ext == 'Exterior: Battle-Scarred') {
        exterior = 'BS';
      }else {
        exterior = '';
      }
    }catch(err) {
      exterior = '';
    }

    var classid;
    try {
      classid = thisData.classid;
    }catch(err) {
      classid = null;
    }

    var instanceid;
    try {
      instanceid = thisData.instanceid;
    }catch(err) {
      instanceid = null;
    }

    var inspect;
    try {
      inspect = thisData.actions[0].link;
    }catch(err) {
      inspect = null;
    }

    var name;
    try {
      name = thisData.market_name;
    }catch(err) {
      name = null;
    }

    var price;
    try {
      var priceOptions = Object.keys(itemPriceData.items_list[name].price);
      if (priceOptions.includes('7_days')) {
        price = itemPriceData.items_list[name].price['7_days'].average;
      }else if (priceOptions.includes('30_days')) {
        price = itemPriceData.items_list[name].price['30_days'].average;
      }else if (priceOptions.includes('all_time')) {
        price = itemPriceData.items_list[name].price['all_time'].average;
      }else {
        price = 'error';
      }
    }catch(err) {
    price = 'error';
    }

    var tradeable;
    try {
      tradeable = thisData.tradeable;
    }catch(err) {
      tradeable = null;
    }

    itemData.push({exterior: exterior, classid: classid, instanceid: instanceid, inspect: inspect, name: name, tradeable: tradeable, type: type, price: price});
  }
  return itemData;
}

async function sortData(itemData, data, userId) {
  console.log(data);
  console.log(itemData);

  /*var matched = [];
  for (var key in data.rgInventory) {
    //matching itemdata with rgInventory data
    var rgInvData = data.rgInventory[key];
    console.log(rgInvData.classid + '_' + rgInvData.instanceid);
    //we have all the data of the items but don't know where to append it
    //find the index of where the instance ids match
    try {
      var index = rgInvData.findIndex(function(item) {
        return item.classid == rgInvData.classid && item.instanceid == rgInvData.instanceid;
      });
      console.log(index);

      if (itemData[index].inspect !== null) {
        itemData[index].inspect = itemData[index].inspect.replace('%owner_steamid%', userId).replace('%assetid%', rgInvData.id);
      }
      itemData[index].pos = rgInvData.pos;
      matched.push(itemData[index]);
    }catch(err) {
      //nope
    }
  }
  console.log(matched);*/

  await pageCode(`Filter.ApplyFilter('key')`);
  await sleep(100);

  await pageCode(`Filter.ClearFilter()`);
  await sleep(100);

  var itemHolders = document.getElementById('inventory_' + userId + '_730_2').querySelectorAll('div.itemHolder:not(.disabled)');
  for (var i = 0; i < matched.length; i++) {
    itemHolders[matched[i].pos-1].style.position = 'relative';

    var p = document.createElement('p');
    p.innerHTML = matched[i].exterior;
    p.style = 'font-size: 16px; font-weight: bold; position: absolute; margin: 0; bottom: 2%; left: 5%; z-index: 4; color: #c44610;';
    itemHolders[matched[i].pos-1].append(p);

    if (!matched[i].type.includes('Sticker') && !matched[i].type.includes('Graffiti') && !matched[i].type.includes('Key') && !matched[i].type.includes('Container') && !matched[i].type.includes('Extraordinary Collectible')) {
      var a = document.createElement('a');
      a.innerText = 'Click for SS';
      a.style = 'appearance: button; -moz-appearance: button;-webkit-appearance: button;text-decoration: none;background-color: black;font-size: 13px;position: absolute;margin: 0;top: 0%;right: 0;text-align: center;width: 100%;color: #d88b8b;z-index: 5;';
      a.href = 'https://csgo.gallery/' + matched[i].inspect;
      a.setAttribute('target', '_blank');
      itemHolders[matched[i].pos-1].append(a);
    }

    if (matched[i].price != 'error') {
      var p2 = document.createElement('p');
      p2.innerText = '$' + matched[i].price;
      p2.style = 'font-size: 14px; position: absolute; margin: 0; bottom: 2%; right: 5%; z-index: 4; color: #daa429;';
      itemHolders[matched[i].pos-1].append(p2);
    }
  }
}
/*
  function addText(item, wear, link) {
    var p = document.createElement('p');
    p.innerHTML = wear.toFixed(10);
    p.style = 'font-size: 13px;position: absolute;margin: 0;top: 90%;left: 50%;transform: translate(-50%, -50%);color: #daa429;';
    item.getElementsByClassName('item app730')[0].append(p);

    var a = document.createElement('a');
    a.innerText = 'Click for SS';
    a.style = 'appearance: button; -moz-appearance: button;-webkit-appearance: button;text-decoration: none;background-color: black;font-size: 13px;position: absolute;margin: 0;top: 0%;right: 0;text-align: center;width: 100%;color: #d88b8b;z-index: 5;';
    a.href = 'https://csgo.gallery/' + link;
    a.setAttribute('target', '_blank');
    item.getElementsByClassName('item app730')[0].append(a);
  }

  var items = document.getElementsByClassName('inventory_item_link'),
      itemHolders = document.getElementsByClassName('itemHolder'),
      currPage = Number(document.getElementById('pagecontrol_cur').innerText),
      start = (currPage-1)*25,
      end = start + 25,
      inspects = [];

  if (end > items.length) {
    end = items.length;
  }

  for (var i = 0; i < inspects.length; i++) {
    var index = i+start
    if (inspects[i] !== null) {
      try {
        var x = new XMLHttpRequest();
        x.open('GET', ('https://api.csgofloat.com/?url=' + inspects[i]), true);
        x.onload = function () {
          var wear = JSON.parse(this.response).iteminfo.floatvalue;
          addText(itemHolders[index], wear, inspects[i]);
        }
        x.send();
      }catch(err) {

      }
      await sleep(400);
    }
    document.getElementsByClassName('inventory_page_right')[0].style.display = '';
  }
}*/
