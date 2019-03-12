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

let selections = {
  selectedFacility: undefined,
  selectedFacilityType: '',
  facilityQuantity: 0,
  selectedGood: undefined,
  goodsQuantity: 0,
  exporting: false
}

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

  selections.selectedFacility = activeIslands.playerLocation.copper.mines.player;
  selections.selectedGood = activeIslands.playerLocation.copper.player;

  plotAllIslands($map, islands);

  highlightActiveIslands();
  
  displayStats(playerOne);

  $('.island').on('mousedown', function(e) {
    var thisIsland = islands[parseInt($(this).attr('id'))];
    changeActiveIsland(thisIsland);
    if (selections.selectedFacilityType === 'mines') {
      selections.selectedFacility = thisIsland.copper.mines;
    } else {
      selections.selectedFacility = thisIsland.oliveOil.groves;
    }
    updateFacilityPurchasePanel();
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

  $('#goodsQuantity').on('change', function(e) {
    selections.goodsQuantity = this.value;
    trackGoodsQuantity();
  });

  $('#sellGoods #copper').on('mousedown', function(e) {
    $('#sellGoods #oliveOil').removeClass('sellingOliveOil');
    $(this).addClass('sellingCopper');
    // depends on exporting or not!
    selections.selectedGood = activeIslands.selectedIsland.oliveOil; 
    // send all change selections logic to a function that adjusts relevant numbers/maxes
    // have this affect eligibility but keep that logic close to the sale/purchase functions

    $('#sellGoods #goodsQuantity').attr('max', activeIslands.playerLocation.copper.player);
    trackGoodsQuantity();
  });

  $('#sellGoods #oliveOil').on('mousedown', function(e) {
    $('#sellGoods #copper').removeClass('sellingCopper');
    $(this).addClass('sellingOliveOil');
   
    selections.selectedGood = activeIslands.selectedIsland.copper;
    $('#sellGoods #goodsQuantity').attr('max', activeIslands.playerLocation.oliveOil.player);
    trackGoodsQuantity();
  });

  $('#facilitiesQuantity').on('change', function(e) {
    selections.facilityQuantity = this.value;
    updateFacilityPurchasePanel();
  });

  $('#buyFacilities #mines').on('mousedown', function(e) {
    $('#buyFacilities #groves').removeClass('buyingGroves');
    $(this).addClass('buyingMines');
    selections.selectedFacilityType = 'mines';
    selections.selectedFacility = activeIslands.selectedIsland.copper.mines;
    updateFacilityPurchasePanel();
  });

  $('#buyFacilities #groves').on('mousedown', function(e) {
    $('#buyFacilities #mines').removeClass('buyingMines');
    $(this).addClass('buyingGroves');
    selections.selectedFacilityType = 'groves';
    selections.selectedFacility = activeIslands.selectedIsland.oliveOil.groves;
    updateFacilityPurchasePanel();
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

  $('#sellGoods #export').on('mousedown', function(e) {
    selections.exporting = !selections.exporting;
    if (selections.exporting) {
      $(this).removeClass('notExporting');
      $(this).addClass('exporting');
      $(this).text('Exporting');
    } else {
      $(this).removeClass('exporting');
      $(this).addClass('notExporting');
      $(this).text('Not exporting');
    }
  });

  $('#clockAndPause #hide').on('mousedown', function(e) {
    $('#clockAndPause p').toggle();
  });

  $('#clockAndPause #pause').on('mousedown', function(e) {
    paused = !paused;
    if (paused) {
      $(this).addClass('paused'); 
    } else {
      $(this).removeClass('paused');
    }
  })

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
      playerFacilityOutput();
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

function playerFacilityOutput() {
  _.each(islands, function(island) {
    island.copper.player += island.copper.mines.player;
    island.oliveOil.player += island.oliveOil.groves.player;
  });
}

function islanderFacilityCreation(day) {
  if (day % 50 === 0) {
    _.each(islands, function(island) {
      if (island.groves + island.groves.player < island.groves.maximum) {
        island.groves += 1;
        island.oliveOilScarcity = calculateGoodScarcity(island, 'oliveOil');
      }
      if (island.mines + island.mines.player < island.mines.maximum) {
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
  $('#selectedIslandDisplay .islandMineStats').empty();
  $('#selectedIslandDisplay .islandGroveStats').empty();
  _.each(Object.keys(activeIslands.selectedIsland), function(key) {
    
    //  if element is a number, display it, if it is an object, dig a level down...
    if (typeof(activeIslands.selectedIsland[key]) === 'number') {
      var $element = $('<p></p>');
      $element.text(key + ': ' + activeIslands.selectedIsland[key]);
      $element.appendTo($('#selectedIslandDisplay .islandMineStats'));   
    } else if (typeof(activeIslands.selectedIsland[key]) === 'object') {
      
      _.each(Object.keys(activeIslands.selectedIsland[key]), function(key) {
        var $element = $('<p></p>');
        $element.text(key + ': ' + activeIslands.selectedIsland[key]);
        $element.appendTo($('#selectedIslandDisplay .islandGroveStats'));  
      });
    }
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
  island.islandName = nameFunction();
  island.id = id;
  let environment = randomEnvironment();
  island.rocky = environment.rocky;
  island.lush = environment.lush;
  island.population = randomPopulation();
  
  island.copper = {
    player: 0,
    nonplayer: 0,
    scarcity: calculateGoodScarcity(island, 'copper'),
    mines: {}
  };
  island.copper.mines.player = 0;
  island.copper.mines.maximum = Math.floor(island.rocky / 10);
  island.copper.mines.total = Math.floor(island.copper.mines.maximum / 4);
  island.copper.mines.scarcity = calculateFacilityScarcity(island.population, island.rocky, island.copper.mines.maximum, island.copper.mines.total);

  island.oliveOil = {
    player: 0,
    nonplayer: 0,
    scarcity: calculateGoodScarcity(island, 'oliveOil'),
    groves: {}
  };
  island.oliveOil.groves.player = 0;
  island.oliveOil.groves.maximum = Math.floor(island.lush / 10);
  island.oliveOil.groves.total = Math.floor(island.oliveOil.groves.maximum / 4);
  island.oliveOil.groves.scarcity = calculateFacilityScarcity(island.population, island.lush, island.oliveOil.groves.maximum, island.oliveOil.groves.total);

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
function purchaseFacilities() {
  let cost = selections.facilityQuantity * exponentialFacilitesPrice(selections.facilityQuantity, selections.selectedFacility.scarcity);
  if (playerOne.totalGold > cost) {
    if (activeIslands.playerLocation === activeIslands.selectedIsland) {
      selection.selectedFacility += selection.facilityQuantity
      selectedIsland.selectedFacility.total += selectedIsland.mines + selectedIsland.mines.player;
      selectedIsland.copperScarcity = calculateGoodScarcity(selectedIsland, 'copper');
    } else if (selection.selectedFacility > 0) {
      selection.selectedFacility += selection.facilityQuantity;
    } else if (selection.selectedFacility > 0) {

    }
  }
}

function calculateFacilityScarcity(population, terrain, maximum, total) {
  // relationship of population and usable land & existing facilities
  return Math.log((100 * (1/population)) + (100 * (1/terrain)) + (0.1 * (maximum + total)));
}

function updateFacilityPurchasePanel() {
  // find price and display consequences
  let $quantityDisplay = $('#facilitiesQuantity');
  $quantityDisplay.attr('max', selections.selectedFacility.maximum - selections.selectedFacility.total);
  if (parseInt($quantityDisplay.val()) > selections.selectedFacility.maximum) {
    $quantityDisplay.val(selections.selectedFacility.maximum);
  }
  var pricePerFacility = exponentialFacilitesPrice();
  displayPricePerFacility(pricePerFacility);
  displayTotalFacilitiesPrice(pricePerFacility * selections.facilityQuantity);
}

function exponentialFacilitesPrice() {
  if (selections.facilityQuantity < 1) {
    return 0;
  } else {
    return 100 * Math.pow((0.5 * selections.facilityQuantity) + (3 * selections.selectedFacility.scarcity), 1.1);
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
    activeIslands.playerLocation.copper.player -= quantity;
    playerOne.totalGold += quantity * logGoodsPrice(quantity, calculateGoodScarcity(receivingIsland, 'copper'));
  } else {
    activeIslands.playerLocation.oliveOil.player -= quantity;
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
  displayIslandStats();
}

function highlightActiveIslands() {
  $('#' + activeIslands.selectedIsland.id).attr('class', 'island selectedIsland');
  $('#' + activeIslands.exportIsland.id).attr('class', 'island exportIsland');
  $('#' + activeIslands.importIsland.id).attr('class', 'island importIsland');
  $('#' + activeIslands.playerLocation.id).attr('class', 'island playerIsland');
}