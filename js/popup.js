var currencies = ['AED','AFN','ALL','AMD','ANG','AOA','ARS','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYN'];
currencies.push('BZD','CDF','CHE','CHF','CHW','CLP','CNY','COP','COU','CRC','CUC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','FJD','FKP','GEL');
currencies.push('GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF');
currencies.push('KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MYR');
currencies.push('MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG');
currencies.push('SEK','SGD','SHP','SLL','SOS','SRD','SSP','STN','SVC','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','UYU','UYW');
currencies.push('UZS','VES','VND','VUV','WST','XAF','XCD','XDR','XOF','XPF','XSU','XUA','YER','ZAR','ZMW','ZWL');
var majorCurrencies = ['USD','EUR','GBP','AUD','CAD','---'];

var sel = document.getElementById('currencies');
for (var i = 0; i < majorCurrencies.length; i++) {
  var opt = document.createElement('option');
  opt.innerHTML = majorCurrencies[i];
  opt.value = majorCurrencies[i];
  if (opt.value == '---') {
    opt.disabled = true;
  }
  sel.appendChild(opt);
}
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
  chrome.storage.sync.get('currency', function(result) {
    sel.value = result.currency;
  });
}catch(err) {
  sel.value = 'USD';
}

var checkboxes = document.getElementsByClassName('option');
for (var i = 0; i < checkboxes.length; i++) {
  var item = checkboxes[i];
  item.addEventListener('click', function() {
    var toSet = {};
    if (this.checked) {
      toSet[this.id] = true;
    }else {
      toSet[this.id] = false;
    }
    chrome.storage.sync.set(toSet, function() {});
  });
}

var options = ['inventorySS', 'inventoryExt', 'inventoryFloats', 'inventoryPrices', 'inventoryPhases', 'tradeStacking', 'tradeSS', 'tradePrices', 'tradepageExteriors'];
chrome.storage.sync.get(options, function(result) {
  for (var key in result) {
    var value = result[key];
    if (value) {
      document.getElementById(key).click();
    }
  }
});
