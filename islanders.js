// Global vars
const $root = $('#root');
const $map = $('<div></div>');
const density = 20;
let islands = [];
let selectedIsland = undefined;
let selectedIslandElement = undefined;
let goodsScarcity = 0;
let facilityScarcity = 0;
let goodsQuantity = 0;
let facilityQuantity = 0;
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
  let $selectedFacility = $('#selectedFacility');

  $('#goodsQuantity').on('change', function(e) {
    goodsQuantity = this.value;
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('.island').on('click', function(e) {
    $(selectedIslandElement).css('background-color', 'tan');
    $(this).css('background-color', 'green');
    selectedIslandElement = this;
    selectedIsland = islands[parseInt($(this).attr('id'))];
    displayIslandStats(this);
  });

  $('#sellGoods #copper').on('click', function(e) {
    if (selectedIsland) {
      goodsScarcity = selectedIsland.copperScarcity;
    }
    $selectedGood.text('Copper');
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#sellGoods #oliveOil').on('click', function(e) {
    if (selectedIsland) {
      goodsScarcity = selectedIsland.oliveOilScarcity;
    }
    $selectedGood.text('Olive Oil');
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#buyFacilities #mines').on('click', function(e) {
    if (selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(selectedIsland, 'rocky');
    }
    $selectedFacility.text('Copper');
    trackFacilitiesQuantity(facilitiesQuantity, facilityScarcity);
  });

  $('#buyFacilities #groves').on('click', function(e) {
    if (selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(selectedIsland, 'lush');
    }
    $selectedFacility.text('Olive Oil');
    trackFacilitiesQuantity(facilitiesQuantity, facilityScarcity);
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
  // goodsScarcity
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

// Facilities Transaction Panel
// cheaper to build on islands with more lush or rock and more population
//    most expensive place to build is less land and small population
//    highest price to sell is less land and small population -- these would be importers
function calculateFacilityScarcity(island, type) {
  // relationship of population and usable land
  let terrain = '';
  type === 'mines' ? terrain = 'rocky' : terrain = 'lush';
  return (100 * (1/island.population)) + (10 * (1/island[terrain])) + (0.1 * island[type]);
}

function trackFacilitiesQuantity(facilitiesQuantity, facilitiesScarcity) {
  // find price and display consequences
  var pricePerFacility = exponentialFacilitesPrice(facilitiesQuantity, facilityScarcity);
  displayPricePerFacility(pricePerFacility);
  displayTotalFacilitiesPrice(pricePerFacility * facilitiesQuantity);
}

function exponentialFacilitesPrice(facilitiesQuantity, facilityScarcity) {
  return Math.pow(facilitiesQuantity + facilityScarcity, 2);
}

function displayPricePerFacility(price) {
  $('#pricePerFacility').text(price.toString());
}

function displayTotalFacilitiesPrice(price) {
  $('#totalFacilitiesPrice').text(price.toString());
}

// Goods Transaction Panel
function logGoodsPrice(goodsQuantity, goodsScarcity) {
  if (goodsQuantity < 1) {
    return 0;
  } else if (goodsQuantity === 1) {
    return logGoodsPrice(2);
  } else {
    return  (goodsScarcity * 100) * (1 / Math.log(goodsQuantity + 2));
  }
}

function trackGoodsQuantity(goodsQuantity, goodsScarcity) {
  var pricePerGood = logGoodsPrice(goodsQuantity, goodsScarcity);
  displayPricePerGood(pricePerGood);
  displayTotalGoodsPrice(pricePerGood * goodsQuantity);
}

function displayPricePerGood(price) {
  $('#pricePerGood').text(price.toString());
}

function displayTotalGoodsPrice(price) {
  $('#totalGoodsPrice').text(price.toString());
}

// Player Stat Panel Functions
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