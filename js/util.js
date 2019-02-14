var event = new MouseEvent('mouseover', {
  'view': window,
  'bubbles': true,
  'cancelable': true
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function wearShortener(ext) {
  if (ext == 'Factory New') {
    return 'FN';
  }else if (ext == 'Minimal Wear') {
    return 'MW';
  }else if (ext == 'Field-Tested') {
    return 'FT';
  }else if (ext == 'Well-Worn') {
    return 'WW';
  }else if (ext == 'Battle-Scarred') {
    return 'BS';
  }else {
    return '';
  }
}

async function updateitemPriceData() {
  var x = new XMLHttpRequest();
  x.open('GET', 'https://csgobackpack.net/api/GetItemsList/v2/?currency=USD&no_details=true', true);
  x.onload = function () {
    itemPriceData = JSON.parse(this.response);
    chrome.storage.local.set({itemPriceData: itemPriceData}, () => {
      console.log('Reacquired itemPriceData.');
    });
  }
  x.send();
  return 'done';
}

function pageCode(code) {
  //creating hidden div
  if (document.getElementById('hiddenDiv') == null) {
    var d = document.createElement('div');
    d.id = 'hiddenDiv';
    document.body.append(d);
  }else {
    document.getElementById('hiddenDiv').innerText = '';
  }

  //creating script
  if (document.getElementById('customScript') !== null) {
    document.getElementById('customScript').parentNode.removeChild(document.getElementById('customScript'));
  }
  var script = document.createElement('script');
  script.id = 'customScript';
  var code = document.createTextNode('(function() {' + code + '})();');
  script.appendChild(code);
  (document.body || document.head).appendChild(script);
  return 'done';
}
