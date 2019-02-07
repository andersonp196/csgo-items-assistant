//https://steamcommunity.com/profiles/76561198079698350/inventory/json/730/2

var fdiv = document.createElement('div');
fdiv.id = 'loadFloatsDiv';
document.getElementsByClassName('filter_ctn inventory_filters')[0].insertBefore(fdiv, document.getElementsByClassName('filter_ctn inventory_filters')[0].childNodes[0]);
var btn = document.createElement('button');
btn.innerText = 'Click to load floats';
btn.id = 'loadFloatsBtn';
btn.style = 'border: 1px solid black;background-color: #339433;';
btn.addEventListener('click', function() {
  loadFloats();
});
document.getElementById('loadFloatsDiv').append(btn);


async function loadFloats() {
  document.getElementById('loadFloatsBtn').innerText = 'working...';
  document.getElementById('loadFloatsBtn').style.backgroundColor = '#7ffb7f';

  function addText(item, wear, link) {
    var p = document.createElement('p');
    p.innerHTML = wear.toFixed(10);
    p.style = 'font-size: 13px;position: absolute;margin: 0;top: 90%;left: 50%;transform: translate(-50%, -50%);color: #daa429;';
    item.getElementsByClassName('item app730')[0].append(p);

    var a = document.createElement('a');
    a.innerText = 'Click for SS';
    a.style = 'appearance: button; -moz-appearance: button;-webkit-appearance: button;text-decoration: none;background-color: black;font-size: 13px;position: absolute;margin: 0;top: 0%;right: 0;text-align: center;width: 100%;color: #d88b8b;z-index: 5;';
    a.href = 'https://csgo.gallery/' + link;
    a.setAttribute('target', '_blank');
    item.getElementsByClassName('item app730')[0].append(a);
  }

  var items = document.getElementsByClassName('inventory_item_link'),
      itemHolders = document.getElementsByClassName('itemHolder'),
      currPage = Number(document.getElementById('pagecontrol_cur').innerText),
      start = (currPage-1)*25,
      end = start + 25,
      inspects = [];

  if (end > items.length) {
    end = items.length;
  }

  for (var i = start; i < end; i++) {
    items[i].click();
    await sleep(100);
    items[i].click();
    await sleep(300);
    document.getElementsByClassName('inventory_page_right')[0].style.display = 'none';
    if (document.getElementsByClassName('item_desc_content app730 context2')[0].getElementsByClassName('item_desc_descriptors')[0].getElementsByClassName('descriptor')[0].innerText.includes('Exterior')) {
      try {
        inspects.push(document.getElementsByClassName('btn_small btn_grey_white_innerfade')[0].href);
      }catch(err) {
        inspects.push(null);
      }
    }else {
      inspects.push(null);
    }
  }
  for (var i = 0; i < inspects.length; i++) {
    var index = i+start
    if (inspects[i] !== null) {
      try {
        var x = new XMLHttpRequest();
        x.open('GET', ('https://api.csgofloat.com/?url=' + inspects[i]), true);
        x.onload = function () {
          var wear = JSON.parse(this.response).iteminfo.floatvalue;
          addText(itemHolders[index], wear, inspects[i]);
        }
        x.send();
      }catch(err) {

      }
      await sleep(400);
    }
    document.getElementsByClassName('inventory_page_right')[0].style.display = '';
  }
  document.getElementById('loadFloatsBtn').style.backgroundColor = '#339433';
  document.getElementById('loadFloatsBtn').innerText = 'Click to load floats';
}
