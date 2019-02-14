var currencies = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BOV","BRL","BSD","BTN","BWP","BYN","BZD","CAD","CDF","CHE","CHF","CHW","CLF","CLP","CNY","COP","COU","CRC","CUC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LSL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRU","MUR","MVR","MWK","MXN","MXV","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","SSP","STN","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","USN","UYI","UYU","UYW","UZS","VES","VND","VUV","WST","XAF","XAG","XAU","XBA","XBB","XBC","XBD","XCD","XDR","XOF","XPD","XPF","XPT","XSU","XTS","XUA","XXX","YER","ZAR","ZMW","ZWL"];

var sel = document.getElementById('currencies');
for (var i = 0; i < currencies.length; i++) {
  var opt = document.createElement('option');
  opt.innerHTML = currencies[i];
  opt.value = currencies[i];
  sel.appendChild(opt);
}
sel.addEventListener('change', function() {
  chrome.storage.sync.set({currency:sel.value, newCurr:true}, function() {});
});
try {
  chrome.storage.sync.set('currency', function(result) {
    sel.value = result.currency;
  });
}catch(err) {
  sel.value = 'USD';
}

var checkboxes = document.getElementsByClassName('option');
for (var i = 0; i < checkboxes.length; i++) {
  var item = checkboxes[i];
  item.addEventListener('click', function() {
    var id = this.id
    if (this.checked) {
      chrome.storage.sync.set({id: true}, function() {});
    }else {
      chrome.storage.sync.set({id: false}, function() {});
    }
  });
}

var options = ['inventorySS', 'inventoryExt', 'inventoryFloats', 'inventoryPrices', 'tradeStacking', 'tradeSS', 'tradePrices', 'tradepageExteriors'];
chrome.storage.sync.get(options, function(result) {
  for (var key in result) {
    var value = result[key];
    if (value) {
      document.getElementById(key).click();
    }
  }
});
