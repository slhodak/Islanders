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
      mines: 0
  };

  displayStats(playerOne);

  $('#quantity').on('change', function(e) {
    trackQuantity(this.value);
  });

});

// Island Stat Functions
function generateIslandStats() {
  let island = {};
  // random lushness, rockiness
  let environment = randomEnvironment();
  island.rocky = environment.rocky;
  island.lush = environment.lush;
  // random population
  island.population = randomPopulation();
  // also maximum groves and mines
  island.maxMines = Math.floor(island.rocky / 10);
  island.maxGroves = Math.floor(island.rocky / 10);
  // island starts with one mine and grove for every 4 maximum
  island.mines = Math.floor(island.maxMines / 4);
  island.groves = Math.floor(island.maxGroves / 4);  
  // scarcity
  island.copperScarcity = Math.ceil(((island.mines || 1) * island.population) / 100);
  island.oliveScarcity = Math.ceil(((island.groves || 1) * island.population) / 100);

  return island;
}

function randomPopulation() {
  return Math.ceil(Math.random() * 1000);
}

function randomEnvironment() {
  let rocky = Math.round(Math.random() * 90);
  let lush = Math.round(Math.random() * (100 - rocky));
  return {
    rocky: rocky,
    lush: lush
  };
}




// Transaction Panel Functions
let scarcity = 100;

function logPrice(quantity) {
  if (quantity < 1) {
    return 0;
  } else if (quantity === 1) {
    return logPrice(2);
  } else {
    return scarcity * (1 / Math.log(quantity + 2));
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

// Player Display Panel Functions
function displayStats(player) {
  $('#name').text('Name: '+ player.myName);
  $('#mines').text('Mines: ' + player.mines);
  $('#groves').text('Groves: ' + player.groves); 
}

// Map creation functions
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