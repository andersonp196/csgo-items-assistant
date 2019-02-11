chrome.storage.sync.get(['inventorySS', 'inventoryExt', 'inventoryFloats', 'inventoryPrices', 'tradeStacking', 'tradeSS', 'tradePrices'], function(result) {
  console.log(result);
  if (result.inventorySS) {
    document.getElementById('inventorySS').click();
  }
  if (result.inventoryExt) {
    document.getElementById('inventoryExt').click();
  }
  if (result.inventoryFloats) {
    document.getElementById('inventoryFloats').click();
  }
  if (result.inventoryPrices) {
    document.getElementById('inventoryPrices').click();
  }
  if (result.tradeStacking) {
    document.getElementById('tradeStacking').click();
  }
  if (result.tradeSS) {
    document.getElementById('tradeSS').click();
  }
  if (result.tradePrices) {
    document.getElementById('tradePrices').click();
  }
});

document.getElementById('inventorySS').addEventListener('click', function() {
  if (this.checked) {
    chrome.storage.sync.set({inventorySS: true}, function() {});
  }else {
    chrome.storage.sync.set({inventorySS: false}, function() {});
  }
});

document.getElementById('inventoryExt').addEventListener('click', function() {
  if (this.checked) {
    chrome.storage.sync.set({inventoryExt: true}, function() {});
  }else {
    chrome.storage.sync.set({inventoryExt: false}, function() {});
  }
});

document.getElementById('inventoryFloats').addEventListener('click', function() {
  if (this.checked) {
    chrome.storage.sync.set({inventoryFloats: true}, function() {});
  }else {
    chrome.storage.sync.set({inventoryFloats: false}, function() {});
  }
});

document.getElementById('inventoryPrices').addEventListener('click', function() {
  if (this.checked) {
    chrome.storage.sync.set({inventoryPrices: true}, function() {});
  }else {
    chrome.storage.sync.set({inventoryPrices: false}, function() {});
  }
});

document.getElementById('tradeStacking').addEventListener('click', function() {
  if (this.checked) {
    chrome.storage.sync.set({tradeStacking: true}, function() {});
  }else {
    chrome.storage.sync.set({tradeStacking: false}, function() {});
  }
});

document.getElementById('tradeSS').addEventListener('click', function() {
  if (this.checked) {
    chrome.storage.sync.set({tradeSS: true}, function() {});
  }else {
    chrome.storage.sync.set({tradeSS: false}, function() {});
  }
});

document.getElementById('tradePrices').addEventListener('click', function() {
  if (this.checked) {
    chrome.storage.sync.set({tradePrices: true}, function() {});
  }else {
    chrome.storage.sync.set({tradePrices: false}, function() {});
  }
});
