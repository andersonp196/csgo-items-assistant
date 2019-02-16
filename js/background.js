chrome.runtime.onInstalled.addListener(function(details) {
  var options = ['inventorySS', 'inventoryExt', 'inventoryFloats', 'inventoryPrices', 'inventoryPhases', 'tradeStacking', 'tradeSS', 'tradePrices', 'tradePhases',
                 'tradepageExteriors', 'tradepagePhases', 'marketSS', 'marketPhases', 'lastAcquired'];

  if (details.reason === 'install') {
    for (var i = 0; i < options.length; i++) {
      if (options[i] == 'lastAcquired') {
        chrome.storage.sync.set({lastAcquired: 0}, function() {});
      }else {
        var toSet = {};
        toSet[options[i]] = true;
        chrome.storage.sync.set(toSet, function() {});
      }
    }
    chrome.storage.sync.set({currency:'USD', newCurr:true}, function() {});
  }else if (details.reason === 'update') {
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
