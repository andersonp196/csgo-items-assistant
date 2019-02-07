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
    itemData = JSON.parse(this.response);
    chrome.storage.local.set({itemData: itemData}, () => {
      console.log('Reacquired itemData.');
    });
  }
  x.send();
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
  document.body.appendChild(script);
}
