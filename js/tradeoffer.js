async function stack() {
  document.getElementById('formatBtn').style.backgroundColor = '#51f751';
  document.getElementById('formatBtn').innerText = 'Working...';

  await loadIcons();

  var inventory_ctn = document.getElementsByClassName('inventory_ctn'),
      inventories = [],
      inventoryIds = [];
  for (var i = 0; i < inventory_ctn.length; i++) {
    if (inventory_ctn[i].id.includes('730')) {
      inventories.push(inventory_ctn[i]);
      inventoryIds.push(inventory_ctn[i].id);
    }
  }
  if (window.location.href.includes('new')) {
    inventories = [inventories[0], inventories[1]];
    inventoryIds = [inventoryIds[0], inventoryIds[1]];
  }else {
    inventories = [inventories[1], inventories[0]];
    inventoryIds = [inventoryIds[1], inventoryIds[0]];
  }

  var itemData = [];
  for (var i = 0; i < inventories.length; i++) {
    var items = inventories[i].querySelectorAll('div.itemHolder')
        data = [],
        used = [];
    for (var j = 0; j < items.length; j++) {
      if (!items[j].classList.contains('disabled')) {
        var itemId = items[j].querySelector('div.item').id;
        var itemLink = `document.getElementById('${itemId}')`;
        pageCode(`try {
                    document.getElementById('hiddenDiv').innerText += ${itemLink}.rgItem.actions[0].link + ',';
                  }catch(err) {
                    document.getElementById('hiddenDiv').innerText += null + ',';
                  }
                  document.getElementById('hiddenDiv').innerText += ${itemLink}.rgItem.name + ','
                  document.getElementById('hiddenDiv').innerText += ${itemLink}.rgItem.type`);
        var itemInfo = document.getElementById('hiddenDiv').innerText.split(',');

        if (used.includes(itemInfo[1]) && (itemInfo[2].includes('Key') || itemInfo[2].includes('Container') || itemInfo[2].includes('Graffiti') || itemInfo[2].includes('Sticker'))) {
          //item is duplicate
          var index = data.findIndex(function(item) {
            return item.info.name == itemInfo[1];
          });
          data[index].count++;
        }else {
          //first of this item
          data.push({html: items[j], info: {inspect: itemInfo[0], name: itemInfo[1], type: itemInfo[2]}, count: 1});
          used.push(itemInfo[1]);
        }
      }
    }
    itemData.push(data);
  }

  for (var i = 0; i < inventories.length; i++) {
    var invPages = inventories[i].querySelectorAll('div.inventory_page');
    for (var j = 0; j < invPages.length; j++) {
      invPages[j].innerHTML = '';
      for (var k = 0; k < 16; k++) {
        if (itemData[i][(j*16)+k] !== undefined) {
          var p = document.createElement('p');
          p.innerHTML = String(itemData[i][(j*16)+k].count);
          if (itemData[i][(j*16)+k].count > 1) {
            p.style = 'font-size: 14px;position: absolute;margin: 0;top: 75%;left: 80%;z-index: 3;color: #daa429;';
          }else {
            p.style = 'font-size: 14px;position: absolute;margin: 0;top: 75%;left: 80%;z-index: 3;color: #daa429;display: none;';
          }
          itemData[i][(j*16)+k].html.append(p);
          invPages[j].append(itemData[i][(j*16)+k].html);
        }
      }
      if (invPages[j].innerHTML == '') {
        invPages[j].style.display = 'none';
      }
    }
  }

  document.getElementById('formatBtn').style.display = 'none';
}

async function addItems() {
  pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.elInventory.id`);
  var inventory = document.getElementById(document.getElementById('hiddenDiv').innerText),
      items = inventory.querySelectorAll('div.itemHolder'),
      total = Number(document.getElementById('addItemsInp').value),
      toAdd = [];

  for (var i = 0; i < items.length; i++) {
    if (items[i].style.display !== 'none' && items[i].querySelectorAll('div.item').length > 0) {

      toAdd.push(items[i]);
    }
  }
  if (toAdd.length < total) {
    total = toAdd.length;
  }
  for (var i = 0; i < total; i++) {
    var itemId = toAdd[j].querySelector('div.item').id;
    pageCode("MoveItemToTrade(document.querySelector('#" + itemId + "').parentNode)");
    await sleep(25);
  }
}

async function addAllItems() {
  pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.elInventory.id`);
  var inventory = document.getElementById(document.getElementById('hiddenDiv').innerText),
      items = inventory.querySelectorAll('div.itemHolder'),
      total = Number(document.getElementById('addItemsInp').value);

  for (var i = 0; i < items.length; i++) {
    if (items[i].style.display !== 'none') {
      try {
        var itemId = items[i].querySelector('div.item').id;
        pageCode("MoveItemToTrade(document.querySelector('#" + itemId + "').parentNode)");
        await sleep(25);
      }catch {
        //no item
      }
    }
  }
}

async function removeAllItems(btn) {
  var location = btn.parentNode.parentNode.parentNode,
      items = location.querySelectorAll('div.itemHolder.has_item'),
      itemIds = [];
  for (var i = 0; i < items.length; i++) {
    itemIds.push(items[i].querySelector('div.slot_inner').querySelector('div.item').id);
  }
  for (var i = 0; i < itemIds.length; i++) {
    pageCode("MoveItemToInventory(document.querySelector(#" + itemIds[i] + ")");
    await sleep(25);
  }
}

async function loadIcons() {
  //go to their inventory and wait for items to load
  pageCode('TradePageSelectInventory(UserThem, 730, 2)');
  var loaded = false;
  while (loaded == false) {
    var inventories = document.querySelectorAll('div.inventory_ctn'),
        inv730 = 0;
    for (var i = 0; i < inventories.length; i++) {
      if (inventories[i].id.includes('730')) {
        inv730++;
      }
      if (inv730 == 2) {
        loaded = true;
      }
    }
    await sleep(10);
  }
  //filter items to load all icons
  pageCode(`Filter.ApplyFilter('key')`);
  await sleep(10);
  //go to your inventory
  pageCode('TradePageSelectInventory(UserYou, 730, 2)');
  await sleep(10);
  //filter items to load all icons
  pageCode(`Filter.ApplyFilter('case')`);
  await sleep(10);
  pageCode(`Filter.ApplyFilter('')`);
  await sleep(10);
  return 'done';
}

async function loadItems() {
  pageCode('TradePageSelectInventory(UserThem, 730, 2)');
  var loaded = false;
  while (loaded == false) {
    var inventories = document.querySelectorAll('div.inventory_ctn'),
        inv730 = 0;
    for (var i = 0; i < inventories.length; i++) {
      if (inventories[i].id.includes('730')) {
        inv730++;
      }
      if (inv730 == 2) {
        loaded = true;
      }
    }
    await sleep(10);
  }
  await sleep(100);
  pageCode('TradePageSelectInventory(UserYou, 730, 2)');
}

function addDOMElements() {
  //stacking button
  var btn = document.createElement('button');
  btn.innerText = 'Click to stack keys/cases/graffitis';
  btn.style = 'border: 1px solid black;background-color: #339433;';
  btn.id = 'formatBtn';
  btn.addEventListener('click', function() {
    stack();
  });
  document.getElementsByClassName('tutorial_arrow_ctn')[0].append(btn);

  //# items to add input
  var inp = document.createElement('input');
  inp.placeholder = '# items to add';
  inp.classList.add('filter_search_box');
  inp.id = 'addItemsInp';
  document.getElementById('nonresponsivetrade_itemfilters').querySelectorAll('div.filter_ctn')[0].append(inp);

  //add items button
  var btn2 = document.createElement('button');
  btn2.innerText = 'Add # items';
  btn2.style = 'border: 1px solid black;background-color: #339433;';
  btn2.id = 'addItemsBtn';
  btn2.addEventListener('click', function() {
    addItems();
  });
  document.getElementById('nonresponsivetrade_itemfilters').querySelectorAll('div.filter_ctn')[0].append(btn2)

  //add all items button
  var btn3 = document.createElement('button');
  btn3.innerText = 'Add All Items';
  btn3.style = 'border: 1px solid black;background-color: #339433;';
  btn3.addEventListener('click', function() {
    addAllItems();
  });
  document.getElementById('nonresponsivetrade_itemfilters').querySelectorAll('div.filter_ctn')[0].append(btn3)

  //clear all items buttons
  for (var header of document.querySelectorAll('div.offerheader')) {
    var btn4 = document.createElement('button');
    btn4.innerText = 'Remove All Items';
    btn4.style = 'border: 1px solid black;background-color: #850000;';
    btn4.addEventListener('click', function() {
      removeAllItems(this);
    });
    header.querySelectorAll('div')[2].append(btn4);
  }
}
addDOMElements();

/*

var itemData;

async function priceThisTrade() {
  var btn = document.getElementById('priceTradeBtn');
  btn.innerText = 'Working...';
  btn.style.backgroundColor = '#7ffb7f'

  var yourItems = document.getElementById('your_slots').getElementsByClassName('item app730 context2');
  var theirItems = document.getElementById('their_slots').getElementsByClassName('item app730 context2');
  var items = [yourItems, theirItems];

  for (var i = 0; i < items.length; i++) {
    var total = 0;
    for (var j = 0; j < items[i].length; j++) {
      var thisItem = items[i][j];
      thisItem.dispatchEvent(event);
      await sleep(350);

      document.getElementById('hover_content').style.display = 'none';
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
    if (i == 0) {
      var s = document.createElement('span');
      s.innerHTML = '$' + total.toFixed(2);
      s.style = 'color: green;';
      btn.parentNode.append(s);

      s = document.createElement('span');
      s.innerHTML = ' for ';
      s.style = 'color: #7884c5;';
      btn.parentNode.append(s);
    }else if (i == 1) {
      var s = document.createElement('span');
      s.innerHTML = '$' + total.toFixed(2);
      s.style = 'color: #c70000;';
      btn.parentNode.append(s);
    }
    total = 0;
  }

  await sleep(200);
  document.getElementsByClassName('included_trade_offer_note')[0].click();
  btn.style.display = 'none';
}

async function trade() {
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

  var btn = document.createElement('button');
  btn.innerText = 'Click to price trade';
  btn.style = 'border: 1px solid black;background-color: #339433;';
  btn.id = 'priceTradeBtn';
  btn.addEventListener('click', function() {
    priceThisTrade();
  });
  document.getElementsByClassName('tutorial_arrow_ctn')[0].append(btn);
}

*/
