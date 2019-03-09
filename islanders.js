// Global vars
const $root = $('#root');
const $map = $('<div></div>');
const density = 20;
let islands = [];
let selectedIsland = undefined;
let scarcity = 0;
let quantity = 0;
let playerOne = {
    myName: 'Sam',
    totalGroves: 0,
    totalMines: 0,
    totalGold: 0
};

// on ready
$(document).ready(function() {
  $map.attr('id', 'map');
  $root.append($map);

  islands = generateAllIslands(20);
  plotAllIslands($map, islands);

  

  displayStats(playerOne);

  let $selectedGood = $('#selectedGood');

  $('#quantity').on('change', function(e) {
    quantity = this.value;
    trackQuantity(quantity, scarcity);
  });

  $('.island').on('click', function(e) {
    selectedIsland = islands[parseInt($(this).attr('id'))];
    displayIslandStats(this);
    displayPlayerIslandStats(this);
  });

  $('#trade #copper').on('click', function(e) {
    if (selectedIsland) {
      scarcity = selectedIsland.copperScarcity;
    }
    $selectedGood.text('Copper');
    trackQuantity(quantity, scarcity);
  });

  $('#trade #oliveOil').on('click', function(e) {
    if (selectedIsland) {
      scarcity = selectedIsland.oliveOilScarcity;
    }
    $selectedGood.text('Olive Oil');
    trackQuantity(quantity, scarcity);
  });
  
});

// Island Stat Display Functions
function displayIslandStats(islandElement) {
  let id = parseInt($(islandElement).attr('id'));
  _.each(Object.keys(islands[id]), function(key) {
    $('#islandDisplay p#' + key).text(key + ': ' + islands[id][key]);
  });
}


// Island Functions
function generateAllIslands(number) {
  let islands = [];
  for (let i = 0; i < number; i++) {
    islands.push(generateIslandStats());
  }
  return islands;
}

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
  island.maxGroves = Math.floor(island.lush / 10);
  // island starts with one mine and grove for every 4 maximum
  island.mines = Math.floor(island.maxMines / 4);
  island.groves = Math.floor(island.maxGroves / 4);  
  // scarcity
  island.copperScarcity = Math.ceil(((island.mines || 1) * island.population) / 100);
  island.oliveOilScarcity = Math.ceil(((island.groves || 1) * island.population) / 100);

  island.playerMines = 0;
  island.playerGroves = 0;
  island.playerCopper = 0;
  island.playerOliveOil = 0;

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
function logPrice(quantity, scarcity) {
  if (quantity < 1) {
    return 0;
  } else if (quantity === 1) {
    return logPrice(2);
  } else {
    return (scarcity * 100) * (1 / Math.log(quantity + 2));
  }
}

function trackQuantity(quantity, scarcity) {
  var pricePer = logPrice(quantity, scarcity);
  displayPricePer(pricePer);
  displayTotalPrice(pricePer * quantity);
}

function displayPricePer(price) {
  $('#pricePer').text(price.toString());
}

function displayTotalPrice(price) {
  $('#totalPrice').text(price.toString());
}

// Player Stat Panel Functions
function displayPlayerIslandStats(player) {

}

function displayStats(player) {
  _.each(Object.keys(player), function(stat) {
    $('#'+stat).text(stat + ': ' + player[stat])
  });
}

// Map functions

// first create island stats, push island object into array
// next create islands for map based on length of that array, assign id according to index
function plotAllIslands(map, islands) {
  let coordinates = createCoordinates(islands.length, 32);
  for (let i = 0; i < islands.length; i++) {
    plotIsland(map, coordinates[i], i);
  }
}

function plotIsland(map, coordinates, id) {
  let $island = $('<div></div>');
  $island.addClass('island');
  $island.attr('id', id);
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