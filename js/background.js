chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      inventorySS: true,
      inventoryExt: true,
      inventoryFloats: true,
      inventoryPrices: true,
      inventoryPhases: true,
      tradeStacking: true,
      tradeSS: true,
      tradePrices: true,
      tradepageExteriors: true,
      newCurr: true,
      currency: 'USD'
    }, function() {});
  }else if (details.reason === 'update') {
    var options = ['inventorySS', 'inventoryExt', 'inventoryFloats', 'inventoryPrices', 'inventoryPhases', 'tradeStacking', 'tradeSS', 'tradePrices', 'tradepageExteriors', 'marketSS', 'marketPhases'];
    chrome.storage.sync.get(options, (result) => {
      for (var i = 0; i < options.length; i++) {
        if (result[options[i]] == undefined) {
          var toSet = {};
          toSet[options[i]] = true;
          chrome.storage.sync.set(toSet, function() {});
        }
      }
    });
  }
});
