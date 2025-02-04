export function sortExtras(object, initialAddons) {
  var extras = [];
  var stocks = [];
  var up = '';

  for (var i = 0; i < object['stocks']?.length; i++) {
    up = '';
    for (var k = 0; k < object['stocks'][i]['extras']?.length; k++) {
      var extra = Object.assign({}, object['stocks'][i]['extras'][k]);
      var index = extras.findIndex((item) => item['_id'] == extra['_id']);
      if (index == -1) {
        extra['level'] = k;
        extra['up'] = [up];
        extras.push(extra);
        up += extra['_id'].toString();
      } else {
        extras[index]['up'].push(up);
        up += extra['_id'].toString();
      }
    }
    var mdata = {
      id: object['stocks'][i]['_id'],
      extras: up,
      price: object['stocks'][i]['price'],
      quantity: object['stocks'][i]['quantity'],
      countable_id: object['stocks'][i]['_id'],
      discount: object['stocks'][i]['discount'],
      tax: object['stocks'][i]['tax'],
      total_price: object['stocks'][i]['total_price'],
      bonus: object['stocks'][i]['bonus'],
      addons: object['stock']?.addons || object['stocks'][i]['addons'],
    };

    for (let i = 0; i < mdata.addons?.length; i++) {
      for (let j = 0; j < initialAddons?.length; j++) {
        if (mdata.addons[i].addon_id === (initialAddons[j].stock?.product?.id || initialAddons[j].product?.id)) {
          mdata.addons[i].product.quantity = initialAddons[j].quantity;
        }
      }
    }
    stocks.push(mdata);
  }

  return {
    stock: stocks,
    extras: extras,
  };
}

export function getExtras(extrasIdsArray, extras, stocks) {
  var splitted = extrasIdsArray == '' ? [] : extrasIdsArray.split(',');
  var result = [];
  var up = [];
  for (var i = 0; i <= splitted.length; i++) {
    if (i - 1 >= 0) up[up.length] = splitted[i - 1].toString();
    var filtered = extras.filter((item) => {
      var mySet = new Set(item['up']);
      if (mySet.has(up.join(''))) return item;
    });
    if (filtered.length > 0) result.push(filtered);
  }
  var i = 0;
  if (up.length < result.length)
    while (i < extras.length) {
      up[up.length] = result[result.length - 1][0]['id'].toString();
      var filtered = extras.filter((item) => {
        var mySet = new Set(item['up']);
        if (mySet.has(up.join(''))) return item;
      });
      if (filtered.length == 0) {
        //up.pop();
        break;
      }
      result.push(filtered);
      i++;
    }
  var index = stocks.findIndex((item) => item['extras'] == up.join(''));
  return {
    stock: stocks[index],
    extras: result,
  };
}
