// Global vars
const $root = $('#root');
const $map = $('<div></div>');
const islandDensity = 20;
let islands = []

let activeIslands = {
  playerLocation: undefined,
  exportIsland: undefined,
  importIsland: undefined,
  selectedIsland: undefined
};
let choosingExporter = false;
let choosingImporter = false;
let choosingPlayerTravel = false;
let traveling = false;
let timerId = 0;


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
    totalGold: 1000
};

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
  activeIslands.playerLocation = islands[Math.floor(Math.random() * (islandDensity - 1))];
  activeIslands.selectedIsland = activeIslands.playerLocation;
  activeIslands.exportIsland = activeIslands.playerLocation;
  activeIslands.importIsland = activeIslands.playerLocation;
  plotAllIslands($map, islands);

  highlightActiveIslands();
  
  displayStats(playerOne);

  let $selectedGood = $('#selectedGood');
  let $selectedFacility = $('#selectedFacility');

  $('.island').on('mousedown', function(e) {
    var thisIsland = islands[parseInt($(this).attr('id'))];
    changeActiveIsland(thisIsland);
  });

  $('#travel').on('mousedown', function(e) {
    if (traveling === false) {
      choosingPlayerTravel = true;
      traveling = !traveling;
      travelTo(activeIslands.selectedIsland);
      if (traveling) {
        $(this).attr('class', 'traveling');
          $('#travel').text('traveling.');
          setTimeout(function() {
            if (traveling) {
              $('#travel').text('traveling..');
            }
          }, 1000);
          setTimeout(function() {
            if (traveling) {
              $('#travel').text('traveling...');
            }
          }, 2000);
        timerId = setInterval(function() {
          if (traveling) {
            $('#travel').text('traveling.');
          }
          setTimeout(function() {
            if (traveling) {
              $('#travel').text('traveling..');
            }
          }, 1000);
          setTimeout(function() {
            if (traveling) {
              $('#travel').text('traveling...');
            }
          }, 2000);
        }, 3000); 
      }
    }
  });
    
    //  create 'in transit' display, (change button to clicked-in, 'traveling...')
    //  setTimeout for change of playerLocation
    //  playerLocation becomes... new island, but 'traveling' blocker var = true
  $('#goodsQuantity').on('change', function(e) {
    goodsQuantity = this.value;
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#sellGoods #copper').on('mousedown', function(e) {
    if (activeIslands.selectedIsland) {
      goodsScarcity = activeIslands.selectedIsland.copperScarcity; 
      selectedGood = 'copper';
      $('#sellGoods #goodsQuantity').attr('max', activeIslands.playerLocation.playerCopper);
    }
    $selectedGood.text('Copper');
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#sellGoods #oliveOil').on('mousedown', function(e) {
    if (activeIslands.selectedIsland) {
      goodsScarcity = activeIslands.selectedIsland.oliveOilScarcity;
      selectedGood = 'oliveOil';
      $('#sellGoods #goodsQuantity').attr('max', activeIslands.playerLocation.playerOliveOil);
    }
    $selectedGood.text('Olive Oil');
    trackGoodsQuantity(goodsQuantity, goodsScarcity);
  });

  $('#facilitiesQuantity').on('change', function(e) {
    facilityQuantity = this.value;
    trackFacilitiesQuantity(facilityQuantity, facilityScarcity);
  });

  $('#buyFacilities #mines').on('mousedown', function(e) {
    if (activeIslands.selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(activeIslands.selectedIsland, 'mines');
      selectedFacility = 'mines';
      $('#facilitiesQuantity').attr('max', activeIslands.selectedIsland.maxMines - activeIslands.selectedIsland.mines - activeIslands.selectedIsland.playerMines);
    }
    $selectedFacility.text('Mines');
    trackFacilitiesQuantity(facilityQuantity, facilityScarcity);
  });

  $('#buyFacilities #groves').on('mousedown', function(e) {
    if (activeIslands.selectedIsland) {
      facilityScarcity = calculateFacilityScarcity(activeIslands.selectedIsland, 'groves');
      selectedFacility = 'groves';
      $('#facilitiesQuantity').attr('max', activeIslands.selectedIsland.maxGroves - activeIslands.selectedIsland.groves - activeIslands.selectedIsland.playerGroves);
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

  $('#sellGoods #importer').on('mousedown', function(e) {
    choosingImporter = !choosingImporter;
    choosingExporter = false;
    if (choosingImporter === true) {
      $(this).css('background-color', 'orange');
      resetButton($('#exporter'));
    } else {
      resetButton($(this));
    }
  });

  $('#sellGoods #exporter').on('mousedown', function(e) {
    choosingExporter = !choosingExporter;
    choosingImporter = false;
    if (choosingExporter === true) {
      $(this).css('background-color', 'turquoise');
      resetButton($('#importer'));
    } else {
      resetButton($(this));
    }
  });

  $('#clockAndPause #hide').on('mousedown', function(e) {
    $('#clockAndPause p').toggle();
  });

  displayIslandStats();
  gameLoop();
});

// Button functions
function resetButton(button) {
  $(button).css('background-color', '');
}

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
      displayIslandStats();  
    }
  }, 1000);
}

function togglePause() {
  paused = !paused;
}

function updateClock(day) {
  $('#clockAndPause #time').text('Day: ' + day);
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
    displayIslandStats();
  }
}

function travelTo() {
  setTimeout(function() {
    traveling = false;
    $('#travel').attr('class', '');
    $('#travel').text('Travel to');
  }, calculateDeliveryTime(activeIslands.playerLocation, activeIslands.selectedIsland));
  changeActiveIsland(activeIslands.selectedIsland);
  choosingPlayerTravel = false;
}

// Island Stat Display Functions
function displayIslandStats() {
  _.each(Object.keys(activeIslands.selectedIsland), function(key) {
    $('#selectedIslandDisplay p#' + key).text(key + ': ' + activeIslands.selectedIsland[key]);
  });
  _.each(Object.keys(activeIslands.importIsland), function(key) {
    $('#importIslandDisplay p#' + key).text(key + ': ' + activeIslands.importIsland[key]);  
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
    islands.push(generateIslandStats(nameFunction, i));
  }
  return islands;
}

function generateIslandStats(nameFunction, id) {
  let island = {};
  // island name & id
  island.islandName = nameFunction();
  island.id = id;
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
  if (activeIslands.selectedIsland === activeIslands.playerLocation) {
  // only possible if you have access to that area-- if you are on it or you own a facility of the same type on it
    let cost = quantity * exponentialFacilitesPrice(quantity, facilityScarcity);
    if (playerOne.totalGold < cost) {
      return;
    } else {
      playerOne.totalGold -= cost;
      if (selectedFacility === 'mines') {
        activeIslands.selectedIsland.playerMines += quantity;
        playerOne.totalMines += quantity;
        activeIslands.selectedIsland.copperScarcity = calculateGoodScarcity(activeIslands.selectedIsland, 'copper');
      } else {
        activeIslands.selectedIsland.playerGroves += quantity;
        playerOne.totalGroves += quantity;
        activeIslands.selectedIsland.oliveOilScarcity = calculateGoodScarcity(activeIslands.selectedIsland, 'oliveOil');
      }
      displayStats(playerOne);
      displayIslandStats();
    } 
  } else {
    return;
  }
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
  if (facilityQuantity < 1) {
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
  setTimeout(
    function() {
      goodsTransaction(quantity, activeIslands.importIsland);
    }, calculateDeliveryTime(activeIslands.playerLocation, activeIslands.importIsland)
  );
  displayStats(playerOne);
}

function goodsTransaction(quantity, receivingIsland) {
  if (selectedGood === 'copper') {
    activeIslands.playerLocation.playerCopper -= quantity;
    playerOne.totalGold += quantity * logGoodsPrice(quantity, calculateGoodScarcity(receivingIsland, 'copper'));
  } else {
    activeIslands.playerLocation.playerOliveOil -= quantity;
    playerOne.totalGold += quantity * logGoodsPrice(quantity, calculateGoodScarcity(receivingIsland, 'oliveOil'))
  }
}

function calculateDeliveryTime(seller, buyer) {
  return 1000 * Math.floor(math.distance(seller.coordinates, buyer.coordinates));
}

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
  if (traveling) {
    $('#location').text('Location: traveling to ' + activeIslands.playerLocation.islandName) ;
  } else {
    $('#location').text('Location: ' + activeIslands.playerLocation.islandName);
  }
  _.each(Object.keys(player), function(stat) {
    $('#' + stat).text(stat + ': ' + player[stat])
  });
}

// Map functions

// first create island stats, push island object into array
// next create islands for map based on length of that array, assign id according to index
function plotAllIslands(map, islands) {
  assignCoordinates(islands);
  for (let i = 0; i < islands.length; i++) {
    plotIsland(map, islands[i].coordinates, islands[i].id);
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
}

function changeActiveIsland(island) {
  var previous = {};
  if (choosingPlayerTravel) {
    previous = activeIslands.playerLocation;
    activeIslands.playerLocation = island;
  } else if (choosingImporter) {
    previous = activeIslands.importIsland;
    activeIslands.importIsland = island;
  } else if (choosingExporter) {
    //  check if island is valid exporter of anything
    //  in sales function, check if island is valid exporter of that item
    previous = activeIslands.exportIsland;
    activeIslands.exportIsland = island;
  } else {
    previous = activeIslands.selectedIsland;
    activeIslands.selectedIsland = island;
  }
  $('#' + previous.id).attr('class', 'island');
  highlightActiveIslands();
}

function highlightActiveIslands() {
  $('#' + activeIslands.selectedIsland.id).attr('class', 'island selectedIsland');
  $('#' + activeIslands.exportIsland.id).attr('class', 'island exportIsland');
  $('#' + activeIslands.importIsland.id).attr('class', 'island importIsland');
  $('#' + activeIslands.playerLocation.id).attr('class', 'island playerIsland');
}

