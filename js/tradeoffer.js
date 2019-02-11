async function stack() {
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
    var duplicates = inventories[i].querySelector('div.duplicates');
    if (duplicates == null) {
      var d = document.createElement('div');
      d.style.display = 'none';
      d.classList.add('duplicates');
      inventories[i].append(d);
      duplicates = inventories[i].querySelector('div.duplicates');
    }else {
      duplicates.innerHTML = '';
    }

    var items = inventories[i].querySelectorAll('div.itemHolder')
        data = [],
        used = [];
    for (var j = 0; j < items.length; j++) {
      if (!items[j].classList.contains('disabled')) {
        var itemId = items[j].querySelector('div.item').id;
        var itemLink = `document.getElementById('${itemId}')`;
        await pageCode(`try {
                    document.getElementById('hiddenDiv').innerText += ${itemLink}.rgItem.actions[0].link + ',';
                  }catch(err) {
                    document.getElementById('hiddenDiv').innerText += null + ',';
                  }
                  document.getElementById('hiddenDiv').innerText += ${itemLink}.rgItem.market_name + ','
                  document.getElementById('hiddenDiv').innerText += ${itemLink}.rgItem.type + ','
                  document.getElementById('hiddenDiv').innerText += ${itemLink}.rgItem.icon_url`);
        var itemInfo = document.getElementById('hiddenDiv').innerText.split(',');
        var d = document.createElement('div');
        d.innerText = `${itemInfo[0]},${itemInfo[1]},${itemInfo[2]},https://steamcommunity-a.akamaihd.net/economy/image/${itemInfo[3]}/96fx96f`;
        d.classList.add('itemInfo');
        d.style.display = 'none';
        items[j].append(d);

        if (used.includes(itemInfo[1]) && (itemInfo[2].includes('Key') || itemInfo[2].includes('Container') || itemInfo[2].includes('Graffiti') || itemInfo[2].includes('Sticker'))) {
          //item is duplicate
          var index = data.findIndex(function(item) {
            return item.html.querySelector('div.itemInfo').innerText.split(',')[1] == itemInfo[1];
          });
          data[index].count++;
          duplicates.append(items[j]);
        }else {
          //first of this item
          data.push({html: items[j], count: 1});
          used.push(itemInfo[1]);
        }
      }
    }
    itemData.push(data);
  }

  for (var i = 0; i < inventories.length; i++) {
    var invPages = inventories[i].querySelectorAll('div.inventory_page');
    await pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.owner.strSteamId;`);
    var steamId = inventories[i].id.replace('inventory_', '').replace('_730_2', '');
    for (var j = 0; j < invPages.length; j++) {
      invPages[j].innerHTML = '';
      for (var k = 0; k < 16; k++) {
        var curItem = itemData[i][(j*16)+k];
        if (curItem !== undefined) {
          var currItemInfo = curItem.html.querySelector('div.itemInfo').innerText.split(',');
          if (curItem !== undefined) {
            var p = document.createElement('p');
            p.innerHTML = String(curItem.count);
            p.classList.add('count');
            if (curItem.count > 1) {
              p.style = 'font-size: 14px;position: absolute;margin: 0;top: 75%;left: 80%;z-index: 4;color: #ff7d00;';
            }else {
              p.style = 'font-size: 14px;position: absolute;margin: 0;top: 75%;left: 80%;z-index: 4;color: #ff7d00;display: none;';
            }
            curItem.html.append(p);

            try {
              var priceOptions = Object.keys(itemPriceData.items_list[currItemInfo[1]].price);
              var price;
              if (priceOptions.includes('7_days')) {
                price = itemPriceData.items_list[currItemInfo[1]].price['7_days'].average;
              }else if (priceOptions.includes('30_days')) {
                price = itemPriceData.items_list[currItemInfo[1]].price['30_days'].average;
              }else if (priceOptions.includes('all_time')) {
                price = itemPriceData.items_list[currItemInfo[1]].price['all_time'].average;
              }else {
                price = 'error';
              }

              var p2 = document.createElement('p');
              p2.classList.add('price');
              var color;
              if (price != 'error') {
                p2.innerText = '$' + price;
                color = '#daa429';
              }else {
                p2.innerText = price;
                color = 'yellow';
              }
              p2.style = 'position: absolute;top: 70%;left: 50%;transform: translate(-50%, -50%);z-index: 4;color: ' + color + ';';
              curItem.html.append(p2);
            }catch(err) {
              var p2 = document.createElement('p');
              p.innerHTML = 'error';
              p2.style = 'position: absolute;top: 70%;left: 50%;transform: translate(-50%, -50%);z-index: 4;color: yellow;';
              curItem.html.append(p2);
            }

            if (currItemInfo[0] !== 'null' && !currItemInfo[2].includes('Sticker') && !currItemInfo[2].includes('Graffiti') && !currItemInfo[2].includes('Key') && !currItemInfo[2].includes('Container')) {
              var a = document.createElement('a');
              a.innerText = 'Click for SS';
              a.style = 'appearance: button; -moz-appearance: button;-webkit-appearance: button;text-decoration: none;background-color: black;font-size: 13px;position: absolute;margin: 0;top: 0%;right: 0;text-align: center;width: 100%;color: #d88b8b;z-index: 5;';
              var itemAssetId = curItem.html.querySelector('div.item').id.replace('item730_2_', '');
              a.href = 'https://csgo.gallery/' + currItemInfo[0].replace('%owner_steamid%', steamId).replace('%assetid%', itemAssetId);
              a.setAttribute('target', '_blank');
              curItem.html.append(a);
            }

            invPages[j].append(curItem.html);
          }
        }
      }
      if (invPages[j].innerHTML == '') {
        invPages[j].style.display = 'none';
      }
    }
  }

  await loadIcons();
  return 'done';
}

async function addItems(numToAdd) {
  await pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.elInventory.id`);
  var inventory = document.getElementById(document.getElementById('hiddenDiv').innerText),
      pages = inventory.querySelectorAll('div.inventory_page'),
      total = 0,
      duplicates = inventory.querySelector('div.duplicates').querySelectorAll('div.item');
      toAdd = [],
      itemIds = [],
      itemNames = [],
      permSpots = [];

  if (numToAdd == null) {
    total = Number(document.getElementById('addItemsInp').value);
  }else {
    total = numToAdd;
  }

  for (var i = 0; i < pages.length; i++) {
    var items = pages[i].querySelectorAll('div.item');
    for (var j = 0; j < items.length; j++) {
      if (items[j].parentNode.style.display !== 'none') {
        itemIds.push(items[j].id);
        itemNames.push(items[j].parentNode.querySelector('div.itemInfo').innerText.split(',')[1]);
        permSpots.push(items[j].parentNode);
      }
    }
  }

  //here go through duplicates and if they are the same item as items already added (not invisible), add them to itemIds list
  for (var i = 0; i < duplicates.length; i++) {
    var dupeName = duplicates[i].parentNode.querySelector('div.itemInfo').innerText.split(',')[1];
    if (itemNames.includes(dupeName)) {
      //if one of the names of items that match steam filter is in duplicates
      var index = itemNames.indexOf(dupeName) + 1;
      itemIds.splice(index, 0, duplicates[i].id);
      itemNames.splice(index, 0, dupeName);
      permSpots.splice(index, 0, null);
    }
  }

  if (itemIds.length < total) {
    total = itemIds.length;
  }

  for (var i = 0; i < total; i++) {
    await pageCode("MoveItemToTrade(document.querySelector('#" + itemIds[i] + "').parentNode)");
    //await sleep(25);
  }
}

async function addAllItems() {
  //figure out how many items are on page taking into account stacked items
  await pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.elInventory.id`);
  var inventory = document.getElementById(document.getElementById('hiddenDiv').innerText),
      invPages = inventory.querySelectorAll('div.inventory_page'),
      items,
      total = 0;

  for (var i = 0; i < invPages.length; i++) {
    if (invPages[i].style.display !== 'none') {
      items = invPages[i].querySelectorAll('div.itemHolder');
    }
  }

  for (var i = 0; i < items.length; i++) {
    if (items[i].style.display !== 'none') {
      total += Number(items[i].querySelector('p.count').innerText);
    }
  }

  addItems(total);
}

async function removeAllItems(btn) {
  var location = btn.parentNode.parentNode.parentNode,
      items = location.querySelectorAll('div.itemHolder.has_item'),
      itemIds = [];
  for (var i = 0; i < items.length; i++) {
    itemIds.push(items[i].querySelector('div.slot_inner').querySelector('div.item').id);
  }
  for (var i = 0; i < itemIds.length; i++) {
    await pageCode("MoveItemToInventory(document.querySelector('#" + itemIds[i] + "'))");
  }
}

async function loadIcons() {
  //go to other inventory and wait for items to load
  await pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveUser.strSteamId`);
  var activeUser = document.getElementById('hiddenDiv').innerText;
  await pageCode(`document.getElementById('hiddenDiv').innerText = g_ActiveInventory.elInventory.id`);
  var activeInventory = document.getElementById(document.getElementById('hiddenDiv').innerText);
  var youStart = false;

  if (activeInventory.id.includes(activeUser)) {
    youStart = true;
  }

  if (youStart == true) {
    await pageCode('TradePageSelectInventory(UserThem, 730, 2)');
  }else {
    await pageCode('TradePageSelectInventory(UserYou, 730, 2)');
  }

  var loaded = false;
  //wait until both inventories are loaded
  while (!loaded) {
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
  await pageCode(`Filter.ApplyFilter('key')`);
  await sleep(10);
  //go back to start inventory
  if (youStart == true) {
    await pageCode('TradePageSelectInventory(UserYou, 730, 2)');
  }else {
    await pageCode('TradePageSelectInventory(UserThem, 730, 2)');
  }
  await sleep(10);
  //filter items to load all icons
  await pageCode(`Filter.ApplyFilter('case')`);
  await sleep(10);
  await pageCode(`Filter.ClearFilter()`);
  await sleep(10);
  return 'done';
}

async function loadItems() {
  await pageCode('TradePageSelectInventory(UserThem, 730, 2)');
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
  await pageCode('TradePageSelectInventory(UserYou, 730, 2)');
}

function addDOMElements() {
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
    addItems(null);
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

var itemPriceData = null;
async function start() {
  //go to csgo inventory
  await pageCode('TradePageSelectInventory(UserYou, 730, 2)');

  var totalTime = 0;
  var loaded = false;
  while (!loaded) {
    var inventories = document.querySelectorAll('div.inventory_ctn');
    for (var i = 0; i < inventories.length; i++) {
      //if csgo inventory present and there are icons
      if (inventories[i].id.includes('730') && inventories[i].querySelectorAll('img').length > 0) {
        loaded = true;
      //if we've been trying for over a minute stop the script
    }else if (totalTime > 60000) {
        return 'fail';
      }
    }
    await sleep(100);
    totalTime += 100;
  }

  addDOMElements();
  await loadIcons();
  await trade();
  await stack();

  //check all items and make sure they have an icon if their count is > 0
  setInterval(function() {
    var items = document.querySelectorAll('div.itemHolder');
    //going through all items
    for (var i = 0; i < items.length; i++) {
      //if item is not in trade
      if (!items[i].classList.contains('trade_slot')) {
        var duplicates = items[i].parentNode.parentNode.querySelector('div.duplicates');
        var dupeItems = duplicates.querySelectorAll('div.item');
        //first off, if there are more than 1 items in this div because they were removed from trade
        if (items[i].querySelectorAll('img').length > 1) {
          var allItems = items[i].querySelectorAll('div.item');
          for (var j = 0; j < allItems.length; j++) {
            if (j > 0) {
              duplicates.append(allItems[j]);
            }
          }
        }

        var itemP = items[i].querySelector('p.count');
        var itemInfo = items[i].querySelector('div.itemInfo');
        //if item has <p> element and iteminfo div
        if (itemInfo !== null && itemP !== null) {
          var itemName = itemInfo.innerText.split(',')[1];
          //if itemP is shown and thus item has duplicates
          if (itemP.style.display !== 'none') {
            //counting total of this item
            var total = 0;
            //if the item is in the itemholder we're looking at add to total
            if (items[i].querySelectorAll('img').length > 0) {
              total++;
            }
            //going through duplicates to add to total
            for (var j = 0; j < dupeItems.length; j++) {
              var dupeName = dupeItems[j].parentNode.querySelector('div.itemInfo').innerText.split(',')[1];
              //if duplicate is the same item as item we are looking at
              if (dupeName == itemName) {
                //add to total
                total++;
                //if item we are looking at does not have any img and thus has already been added to trade
                if (items[i].querySelectorAll('img').length == 0) {
                  //add the next duplicate in line to the div of the item we are looking at
                  items[i].append(dupeItems[j]);
                }
              }
            }
            //set <p> to proper total of items that are not in trade
            if (items[i].querySelector('p.count').innerText !== String(total)) {
              items[i].querySelector('p.count').innerText = String(total);
            }
            total = 0;
          }
        }
      }
    }

    //get total of your added items
    var yourItems = document.getElementById('your_slots').querySelectorAll('div.trade_slot');
    var yourTotal = 0;
    for(var i = 0; i < yourItems.length; i++) {

    }
    //get total of their added items
    //append totals
    document.getElementById('yourTotal').innerText =
    document.getElementById('theirTotal').innerText =
  }, 100);
}
start();

async function trade() {
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

  var place = document.getElementsByClassName('tutorial_arrow_ctn')[0];

  var s = document.createElement('span');
  s.innerText = '$0.00';
  s.id = 'yourTotal';
  s.style = 'color: green;';
  place.append(s);

  s = document.createElement('span');
  s.innerText = ' for ';
  s.style = 'color: #7884c5;';
  place.append(s);

  s = document.createElement('span');
  s.innerText = '$0.00';
  s.id = 'theirTotal';
  s.style = 'color: #c70000;';
  place.append(s);

  return 'done';
}
