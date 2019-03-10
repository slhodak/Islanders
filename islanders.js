// Global vars
const $root = $('#root');
const $map = $('<div></div>');
const islandDensity = 20;
let island = [];
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
    totalGold: 0,
    location: {}
};

let islandNames = [
  'Mykonos',
  'Kithnos',
  'Kea',
  'Serifos',
  'Siros',
  'Sifnos',
  'Andros',
  'Giaros',
  'Idra',
  'Dokos',
  'Methana',
  'Poros',
  'Rineia',
  'Naxos',
  'Antiparos',
  'Iraklia',
  'Schinousa',
  'Keros',
  'Ano Koufonisi',
  'Kato Koufonisi',
  'Amorgos',
  'Donousa',
  'Ios',
  'Foleganrdos',
  'Sikinos',
  'Thirasia',
  'Santorini',
  'Kinaros',
  'Astipalea',
  'Leros',
  'Kalimnos',
  'Patmos',
  'Tinos',
  'Skiros'
];

// on ready
$(document).ready(function() {
  $map.attr('id', 'map');
  $root.append($map);

  islands = generateAllIslands(islandDensity);
  playerOne.location = islands[Math.floor(Math.random() * (islandDensity - 1))];
  plotAllIslands($map, islands);
  $(playerOne.location[0]).css('background-color', 'maroon');

  

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

  $('#facilitiesQuantity').on('change', function(e) {
    facilitiesQuantity = this.value;
    trackFacilitiesQuantity(facilitiesQuantity, facilityScarcity);
  });

  $('#buyFacilities #mines').on('click', function(e) {
    if (selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(selectedIsland, 'mines');
    }
    console.log(facilityScarcity);
    $selectedFacility.text('Mines');
    trackFacilitiesQuantity(facilitiesQuantity, facilityScarcity);
  });

  $('#buyFacilities #groves').on('click', function(e) {
    if (selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(selectedIsland, 'groves');
    }
    console.log(facilityScarcity);

    $selectedFacility.text('Groves');
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
function randomNonRepeatingIslandName() {
  let usedNames = [];
  return function getName(used) {
    let name = islandNames[Math.floor(Math.random() * (islandNames.length - 1))];
    if (used) {
      usedNames.push(...used);
    }
    if (_.contains(usedNames, name)) {
      return getName(usedNames);
    }
    usedNames.push(name);
    console.log(name);
    return name;
  }
}

function generateAllIslands(number) {
  let islands = [];
  let nameFunction = randomNonRepeatingIslandName();
  for (let i = 0; i < number; i++) {
    islands.push(generateIslandStats(nameFunction));
  }
  return islands;
}

function generateIslandStats(nameFunction) {
  let island = {};
  // island name
  island.islandName = nameFunction();
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
  island.copperScarcity = calculateGoodScarcity(island, 'copper');
  island.oliveOilScarcity = calculateGoodScarcity(island, 'oliveOil');

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
  return (100 * (1/island.population)) + (100 * (1/island[terrain])) + (0.1 * island[type]);
}

function trackFacilitiesQuantity(facilitiesQuantity, facilitiesScarcity) {
  // find price and display consequences
  var pricePerFacility = exponentialFacilitesPrice(facilitiesQuantity, facilityScarcity);
  displayPricePerFacility(pricePerFacility);
  displayTotalFacilitiesPrice(pricePerFacility * facilitiesQuantity);
}

function exponentialFacilitesPrice(facilitiesQuantity, facilityScarcity) {
  return Math.pow(facilitiesQuantity + (15 * facilityScarcity), 1.2);
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

function trackGoodsQuantity(goodsQuantity, goodScarcity) {
  var pricePerGood = logGoodsPrice(goodsQuantity, goodScarcity);
  displayPricePerGood(pricePerGood);
  displayTotalGoodsPrice(pricePerGood * goodsQuantity);
}

function displayPricePerGood(price) {
  $('#pricePerGood').text(price.toString());
}

function displayTotalGoodsPrice(price) {
  $('#totalGoodsPrice').text(price.toString());
}

function calculateGoodScarcity(island, type) {
  let terrain = '';
  let production = '';
  if (type === 'copper') {
    terrain = island.rocky || 0.1; 
    production = island.mines || 0.1;
  } else {
    terrain = island.lush || 0.1; 
    production = island.groves || 0.1;
  }

  return Math.round(Math.log(island.population * (1 / terrain) * (1 / production)));
}

// Player Stat Panel Functions
function displayStats(player) {
  _.each(Object.keys(player), function(stat) {
    if (stat === 'location') {
      $('#' + stat).text(stat + ': ' + player[stat].islandName);
    } else {
      $('#' + stat).text(stat + ': ' + player[stat])
    }
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