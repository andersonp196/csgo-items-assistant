var itemPriceData = null,
    options = {};

async function start() {
  chrome.storage.sync.get(['inventorySS', 'inventoryExt', 'inventoryFloats', 'inventoryPrices'], function(result) {
    if (result.inventorySS) {
      options.inventorySS = true;
    }else {
      options.inventorySS = false;
    }
    if (result.inventoryExt) {
      options.inventoryExt = true;
    }else {
      options.inventoryExt = false;
    }
    if (result.inventoryFloats) {
      options.inventoryFloats = true;
    }else {
      options.inventoryFloats = false;
    }
    if (result.inventoryPrices) {
      options.inventoryPrices = true;
    }else {
      options.inventoryPrices = false;
    }
  });


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
    var itemData = dataLoaded(data, userId);
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

function dataLoaded(data, userId) {
  var itemData = [];
  for (var key in data.rgInventory) {
    var thisData = data.rgInventory[key];
    var pos = thisData.pos;
    var classid = thisData.classid;;
    var instanceid = thisData.instanceid;
    var id = thisData.id;

    var descriptionData = data.rgDescriptions[classid + '_' + instanceid];
    var type = descriptionData.type;
    var ext = descriptionData.descriptions[0].value;
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
    var name = descriptionData.market_hash_name;
    if (name.includes('Graffiti') && !name.includes('Sealed')) {
      name = 'Sealed ' + name;
    }
    var inspect;
    if (descriptionData.actions !== undefined) {
      inspect = descriptionData.actions[0].link.replace('%owner_steamid%', userId).replace('%assetid%', id);
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
    var tradeable = descriptionData.tradeable;

    itemData.push({exterior: exterior, id: id, classid: classid, instanceid: instanceid, inspect: inspect, name: name, tradeable: tradeable, type: type, price: price, pos: pos});
  }

  itemData.sort(function(a,b){
   return a.pos - b.pos;
  });
  return itemData;
}

async function sortData(itemData, data, userId) {
  await pageCode(`Filter.ApplyFilter('key')`);
  await sleep(100);

  await pageCode(`Filter.ClearFilter()`);
  await sleep(100);

  var itemHolders = document.getElementById('inventory_' + userId + '_730_2').querySelectorAll('div.itemHolder:not(.disabled)');
  for (var i = 0; i < itemData.length; i++) {
    itemHolders[itemData[i].pos-1].style.position = 'relative';

    if (options.inventoryExt) {
      var p = document.createElement('p');
      p.innerText = itemData[i].exterior;
      p.style = 'font-size: 16px; font-weight: bold; position: absolute; margin: 0; bottom: 2%; left: 5%; z-index: 4; color: #c44610;';
      itemHolders[itemData[i].pos-1].append(p);
    }

    if (options.inventorySS && !itemData[i].type.includes('Stock') && !itemData[i].type.includes('Sticker') && !itemData[i].type.includes('Graffiti') && !itemData[i].type.includes('Key') && !itemData[i].type.includes('Container') && !itemData[i].type.includes('Extraordinary Collectible')) {
      var a = document.createElement('a');
      a.innerText = 'Click for SS';
      a.style = 'text-decoration: none;background-color: black;font-size: 13px;position: absolute;margin: 0;top: 0%;right: 0;text-align: center;width: 100%;color: #d88b8b;z-index: 5;';
      a.href = 'https://csgo.gallery/' + itemData[i].inspect;
      a.setAttribute('target', '_blank');
      itemHolders[itemData[i].pos-1].append(a);
    }

    if (options.inventoryPrices && itemData[i].price != 'error') {
      var p2 = document.createElement('p');
      p2.innerText = '$' + itemData[i].price;
      p2.style = 'font-size: 14px; position: absolute; margin: 0; bottom: 2%; right: 5%; z-index: 4; color: #daa429;';
      itemHolders[itemData[i].pos-1].append(p2);
    }
  }

  if (options.inventoryFloats) {
    function floats(link, index) {
      var x = new XMLHttpRequest();
      x.open('GET', link, true);
      x.onload = async function() {
        var wear = JSON.parse(this.response).iteminfo.floatvalue;
        if (wear !== 0) {
          var p = document.createElement('p');
          p.innerText = String(wear.toFixed(10));
          p.style = 'font-size: 14px; position: absolute; text-align: center; margin: 0; bottom: 60%; left: 50%; transform: translate(-50%, -50%); z-index: 4; width: 100%; font-weight: 600;background-color: black; color: #bdc6ff;';
          itemHolders[index-1].append(p);
        }
      }
      x.send();
    }

    var usedLinks = [];
    for (var i = 0; i < itemData.length; i++) {
      var link = 'https://api.csgofloat.com/?url=' + itemData[i].inspect;
      if (!usedLinks.includes(link) && !itemData[i].type.includes('Stock') && !itemData[i].type.includes('Sticker') && !itemData[i].type.includes('Graffiti') && !itemData[i].type.includes('Key') && !itemData[i].type.includes('Container') && !itemData[i].type.includes('Extraordinary Collectible')) {
        var index = itemData[i].pos;
        floats(link, index);
        usedLinks.push(link);
        await sleep(500);
      }
    }
  }
}
