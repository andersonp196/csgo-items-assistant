var event = new MouseEvent('mouseover', {
  'view': window,
  'bubbles': true,
  'cancelable': true
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateItemData() {
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
