const $root = $('#root');
const $map = $('<div></div>');
const density = 20;

$(document).ready(function() {
  $map.attr('id', 'map');
  $root.append($map);

  let coordinates = createCoordinates(density, 32);
  for (let i = 0; i < density; i++) {
    createIsland($map, coordinates[i]); 
  }

  let playerOne = {
      myName: 'Sam',
      groves: 0,
      gold: 0
  };

  displayStats(playerOne);

  $('#quantity').on('change', function(e) {
    trackQuantity(this.value);
  });

});

// increase volume, price per goes down, total price is sum

function logPrice(quantity) {
  if (quantity < 1) {
    return 0;
  } else if (quantity === 1) {
    return logPrice(2);
  } else {
    return 50 * (1 / Math.log(quantity + 2));
  }
}

function trackQuantity(quantity) {
  var pricePer = logPrice(quantity);
  displayPricePer(pricePer);
  displayTotalPrice(pricePer * quantity);
}

function displayPricePer(price) {
  $('#pricePer').text(price.toString());
}

function displayTotalPrice(price) {
  $('#totalPrice').text(price.toString());
}

function displayStats(player) {
  $('#name').text('Name: '+ player.myName);
  $('#gold').text('Gold: ' + player.gold);
  $('#groves').text('Groves: ' + player.groves); 
}


function createIsland(map, coordinates) {
  let $island = $('<div></div>');
  $island.attr('id', 'island');
  // why doesn't .css() work?
  $island.attr('style', 'grid-area: ' + coordinates[0] + ' / ' + coordinates[1] + ';');
  map.append($island);
}

function createCoordinates(many, range) {
  let xArray = nonRepeatingRandomIntArrayInRange(many, range);
  let yArray = nonRepeatingRandomIntArrayInRange(many, range);
  return _.zip(xArray, yArray);
}

function nonRepeatingRandomIntArrayInRange(many, range) {
    let result = [];
    for (let i = 0; i < many; i++) {
        var num = Math.ceil(Math.random() * range);
        if (!_.contains(num)) {
            result.push(num);
        }
    }
    return result;
};