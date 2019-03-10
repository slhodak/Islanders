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
let selectedFacility = '';
let facilityQuantity = 0;
let selectedGood = '';
let playerOne = {
    myName: 'Sam',
    totalGroves: 0,
    totalMines: 0,
    totalGold: 1000,
    location: {}
};
let exporting = false;
let receivingIsland = undefined;

let paused = false;

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

  $('#' + islands.indexOf(playerOne.location)).css('background-color', 'maroon');

  displayStats(playerOne);

  let $selectedGood = $('#selectedGood');
  let $selectedFacility = $('#selectedFacility');

  $('.island').on('mousedown', function(e) {
    if (selectedIsland !== playerOne.location) {
      $(selectedIslandElement).css('background-color', '');  
    } else {
      $(selectedIslandElement).css('background-color', 'maroon');
    }
    if (exporting) {
      receivingIsland = islands[parseInt($(this).attr('id'))];
    }
    $(this).css('background-color', 'green');
    selectedIslandElement = this;
    selectedIsland = islands[parseInt($(this).attr('id'))];
    displayIslandStats(selectedIsland);
  });

  $('#goodsQuantity').on('change', function(e) {
    goodsQuantity = this.value;
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#sellGoods #copper').on('mousedown', function(e) {
    if (selectedIsland) {
      goodsScarcity = selectedIsland.copperScarcity; 
      selectedGood = 'copper';
      $('#sellGoods #goodsQuantity').attr('max', playerOne.location.playerCopper);
    }
    $selectedGood.text('Copper');
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#sellGoods #oliveOil').on('mousedown', function(e) {
    if (selectedIsland) {
      goodsScarcity = selectedIsland.oliveOilScarcity;
      selectedGood = 'oliveOil';
      $('#sellGoods #goodsQuantity').attr('max', playerOne.location.playerOliveOil);
    }
    $selectedGood.text('Olive Oil');
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#facilitiesQuantity').on('change', function(e) {
    facilityQuantity = this.value;
    trackFacilitiesQuantity(facilityQuantity, facilityScarcity);
  });

  $('#buyFacilities #mines').on('mousedown', function(e) {
    if (selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(selectedIsland, 'mines');
      selectedFacility = 'mines';
      $('#facilitiesQuantity').attr('max', selectedIsland.maxMines - selectedIsland.mines - selectedIsland.playerMines);
    }
    $selectedFacility.text('Mines');
    trackFacilitiesQuantity(facilityQuantity, facilityScarcity);
  });

  $('#buyFacilities #groves').on('mousedown', function(e) {
    if (selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(selectedIsland, 'groves');
      selectedFacility = 'groves';
      $('#facilitiesQuantity').attr('max', selectedIsland.maxGroves - selectedIsland.groves - selectedIsland.playerGroves);
    }
    $selectedFacility.text('Groves');
    trackFacilitiesQuantity(facilityQuantity, facilityScarcity);
  });

  $('#buyFacilities #buy').on('mousedown', function(e) {
    purchaseFacilities(parseInt($('#buyFacilities #facilitiesQuantity').val()));
  });

  $('#sellGoods #sell').on('mousedown', function(e) {
    sellGoods(parseInt($('#sellGoods #goodsQuantity').val()));
  });

  $('#sellGoods #export').on('mousedown', function(e) {
    exporting = !exporting;
    if (exporting === true) {
      $(this).css('background-color', 'green');
    } else {
      $(this).css('background-color', '');
      receivingIsland = playerOne.location;
    }
  });

  $('#gameClock #hide').on('mousedown', function(e) {
    $('#gameClock p').toggle();
  });

  gameLoop();
});

// Game Clock/Loop
function gameLoop() {
  let day = 0;
  setInterval(function() {
    if (!paused) {
      day++;
      updateClock(day);
      islanderFacilityCreation(day);
      facilityProduction();
      displayStats(playerOne);
      if (!selectedIsland) {
        displayIslandStats(playerOne.location);
      } else {
        displayIslandStats(selectedIsland);  
      }
    }
  }, 1000);
}

function togglePause() {
  paused = !paused;
}

function updateClock(day) {
  $('#gameClock #time').text('Day: ' + day);
}

function facilityProduction() {
  _.each(islands, function(island) {
    island.playerCopper += island.playerMines;
    island.playerOliveOil += island.playerGroves;
  });
}

function islanderFacilityCreation(day) {
  if (day % 50 === 0) {
    _.each(islands, function(island) {
      if (island.groves + island.playerGroves < island.maxGroves) {
        island.groves += 1;
        island.oliveOilScarcity = calculateGoodScarcity(island, 'oliveOil');
      }
      if (island.mines + island.playerMines < island.maxMines) {
        island.mines += 1;
        island.copperScarcity = calculateGoodScarcity(island, 'copper');
      }
    });
    displayIslandStats(selectedIsland || playerOne.location);
  }
}

// Island Stat Display Functions
function displayIslandStats(island) {
  _.each(Object.keys(island), function(key) {
    $('#islandDisplay p#' + key).text(key + ': ' + island[key]);
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
  return Math.ceil(Math.random() * 9000) + 1000;
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

function purchaseFacilities(quantity) {
  if (selectedIsland !== playerOne.location) {
  // only possible if you have access to that area-- if you are on it or you own a facility of the same type on it
    return;
  } else {
    let cost = quantity * exponentialFacilitesPrice(quantity, facilityScarcity);
    if (playerOne.totalGold < cost) {
      return;
    } else {
      playerOne.totalGold -= cost;
      if (selectedFacility === 'mines') {
        selectedIsland.playerMines += quantity;
        playerOne.totalMines += quantity;
        selectedIsland.copperScarcity = calculateGoodScarcity(selectedIsland, 'copper');
      } else {
        selectedIsland.playerGroves += quantity;
        playerOne.totalGroves += quantity;
        selectedIsland.oliveOilScarcity = calculateGoodScarcity(selectedIsland, 'oliveOil');
      }
      displayStats(playerOne);
      displayIslandStats(selectedIsland);
    }
  }
  // subtract cost from player gold
  // add facility to island of purchase
}

function calculateFacilityScarcity(island, type) {
  // relationship of population and usable land
  let terrain = '';
  let max = '';
  let player = '';
  if (type === 'mines') {
    terrain = 'rocky';
    max = 'maxMines';
    player = 'playerMines';
  } else {
    terrain = 'lush';
    max = 'maxGroves';
    player = 'playerGroves';
  }
  return Math.log((100 * (1/island.population)) + (100 * (1/island[terrain])) + (0.1 * (island[max] + island[type] + island[player])));
}

function trackFacilitiesQuantity(facilityQuantity, facilityScarcity) {
  // find price and display consequences

  var pricePerFacility = exponentialFacilitesPrice(facilityQuantity, facilityScarcity);
  displayPricePerFacility(pricePerFacility);
  displayTotalFacilitiesPrice(pricePerFacility * facilityQuantity);
}

function exponentialFacilitesPrice(facilityQuantity, facilityScarcity) {
  if (facilityQuantity < 1 || !selectedIsland) {
    return 0;
  } else {
    return 100 * Math.pow((0.5 * facilityQuantity) + (3 * facilityScarcity), 1.1);
  }
}

function displayPricePerFacility(price) {
  $('#pricePerFacility').text(price.toString());
}

function displayTotalFacilitiesPrice(price) {
  $('#totalFacilitiesPrice').text(price.toString());
}

// Goods Transaction Panel
function sellGoods(quantity) {
  if (exporting) {
    setTimeout(function() {
      goodsTransaction(quantity, receivingIsland);
    }, calculateDeliveryTime(playerOne.location, receivingIsland));
  } else {
    goodsTransaction(quantity, playerOne.location);
  }
  displayStats(playerOne);
  displayIslandStats(playerOne.location);
}

function goodsTransaction(quantity, receivingIsland) {
  if (selectedGood === 'copper') {
    playerOne.location.playerCopper -= quantity;
    playerOne.totalGold += quantity * logGoodsPrice(quantity, calculateGoodScarcity(receivingIsland, 'copper'));
  } else {
    playerOne.location.playerOliveOil -= quantity;
    playerOne.totalGold += quantity * logGoodsPrice(quantity, calculateGoodScarcity(receivingIsland, 'oliveOil'))
  }
}

function calculateDeliveryTime(seller, buyer) {
  return 1000 * Math.floor(math.distance(seller.coordinates, buyer.coordinates));
}

function logGoodsPrice(goodsQuantity, goodsScarcity) {
  if (goodsQuantity < 1 || !selectedIsland) {
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
  assignCoordinates(islands);
  for (let i = 0; i < islands.length; i++) {
    plotIsland(map, islands[i].coordinates, i);
  }
}

// I'm mutating my array!! Can use closure to assign non-repeating coordinates within the
// island creation function
function assignCoordinates(islands) {
  let coordinates = createCoordinates(islands.length, 32);
  for (let i = 0; i < islands.length; i++) {
    islands[i].coordinates = coordinates[i];
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