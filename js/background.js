chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      inventorySS: true,
      inventoryExt: true,
      inventoryFloats: true,
      inventoryPrices: true,
      tradeStacking: true,
      tradeSS: true,
      tradePrices: true,
      tradepageExteriors: true,
      newCurr: true
    }, function() {});
  }else if (details.reason === 'update') {
    //for now reset everything
    chrome.storage.sync.set({
      inventorySS: true,
      inventoryExt: true,
      inventoryFloats: true,
      inventoryPrices: true,
      tradeStacking: true,
      tradeSS: true,
      tradePrices: true,
      tradepageExteriors: true,
      newCurr: true
    }, function() {});
  }
});
