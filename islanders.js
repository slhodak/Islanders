// Global vars
const $root = $('#root');
const $map = $('<div></div>');
const islandDensity = 20;
let islands = []

let activeIslands = {
  playerLocation: undefined,
  exportIsland: undefined,
  importIsland: undefined,
  currentSeller: undefined,
  currentBuyer: undefined,
  selectedIsland: undefined
};
let choosingExporter = false;
let choosingImporter = false;
let relocatingPlayer = false;
let traveling = false;
let timerId = 0;

let selections = {
  selectedFacility: undefined,
  selectedFacilityType: 'mines',
  facilityQuantity: 0,
  selectedGood: undefined,
  selectedGoodType: 'copper',
  goodsQuantity: 0,
  exporting: false
}

let player = {
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
  let startIsland = islands[Math.floor(Math.random() * (islandDensity - 1))];
  _.each(Object.keys(activeIslands), function(key) {
    activeIslands[key] = startIsland;
  });

  selections.selectedFacility = activeIslands.playerLocation.copper.mines;
  selections.selectedGood = activeIslands.playerLocation.copper;

  plotAllIslands($map, islands);
  highlightActiveIslands();
  updatePlayerStatPanel();

  $('.island').on('mousedown', function(e) {
    var thisIsland = islands[parseInt($(this).attr('id'))];
    changeActiveIsland(thisIsland);
    updateFacilityPurchasePanel();
  });

  $('#travel').on('mousedown', function(e) {
    if (traveling === false) {
      relocatingPlayer = true;
      traveling = true;
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

  //  Goods UI
  $('#goodsQuantity').on('change', function(e) {
    selections.goodsQuantity = parseInt(this.value);
    updateGoodsTransactionPanel();
  });

  $('#sellGoods #copper').on('mousedown', function(e) {
    $('#sellGoods #oliveOil').removeClass('sellingOliveOil');
    $(this).addClass('sellingCopper');
    selections.selectedGoodType = 'copper';
    updateGoodsTransactionPanel();
  });

  $('#sellGoods #oliveOil').on('mousedown', function(e) {
    $('#sellGoods #copper').removeClass('sellingCopper');
    $(this).addClass('sellingOliveOil'); 
    selections.selectedGoodType = 'oliveOil';
    updateGoodsTransactionPanel();
  });

    $('#sellGoods #sell').on('mousedown', function(e) {
    sellGoods();
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
      selections.selectedGood = activeIslands.exportIsland[selections.selectedGoodType];
    } else {
      $(this).removeClass('exporting');
      $(this).addClass('notExporting');
      $(this).text('Not exporting');
    }
    updateGoodsTransactionPanel();
  });

  //  Facilities UI
  $('#facilitiesQuantity').on('change', function(e) {
    selections.facilityQuantity = parseInt(this.value);
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
    purchaseFacilities();
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

  updateIslandStatPanels();
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
      islanderGoodsConsumption(day);
      islanderFacilityCreation(day);
      playerFacilityOutput();
      updatePlayerStatPanel();
      updateIslandStatPanels();  
      updateGoodsTransactionPanel();
      updateFacilityPurchasePanel();
      console.log('Day: ' + day);
      console.log('Player copper: ' + activeIslands.playerLocation.copper.player);
      console.log('Nonplayer copper: ' + activeIslands.playerLocation.copper.nonplayer);
      console.log('Player mines: ' + activeIslands.playerLocation.copper.mines.player);
      console.log('Island copper scarcity: ' + activeIslands.playerLocation.copper.scarcity);
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
      if (island.oliveOil.groves.total < island.oliveOil.groves.maximum) {
        island.oliveOil.groves.nonplayer += 1;
      }
      if (island.copper.mines.total < island.copper.mines.maximum) {
        island.copper.mines.nonplayer += 1;
      }
    });
    updateIslandStatPanels();
  }
}

function islanderGoodsConsumption(day) {
  if (day % 5 === 0) {
    _.each(islands, function(island) {
      if (island.oliveOil.nonplayer > island.oliveOil.scarcity) {
        island.oliveOil.nonplayer -= island.oliveOil.scarcity;
      } else {
        island.oliveOil.nonplayer = 0;
      }
      if (island.copper.nonplayer > island.copper.scarcity) {
        island.copper.nonplayer -= island.copper.scarcity;
      } else {
        island.copper.nonplayer = 0;
      }
    });
  }
}

function travelTo() {
  setTimeout(function() {
    traveling = false;
    $('#travel').attr('class', '');
    $('#travel').text('Travel to');
  }, calculateDeliveryTime(activeIslands.playerLocation, activeIslands.selectedIsland));
  relocatingPlayer = true;
  changeActiveIsland(activeIslands.selectedIsland);
  updatePlayerStatPanel();
}

// Island Stat Display Functions
function updateIslandStatPanels() {
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
  island.population = randomPopulation();
  let environment = randomEnvironment();
  island.rocky = environment.rocky;
  island.lush = environment.lush;
  island.copper = {
    player: 0,
    nonplayer: 0,
    get scarcity() {
      return calculateGoodScarcity(island.population, island.rocky, island.copper.mines.nonplayer, island.copper.nonplayer);
    },
    mines: {
      maximum: Math.floor(island.rocky / 10),
      player: 0,
      nonplayer: 0,
      get total() { 
        return island.copper.mines.player + island.copper.mines.nonplayer;
      },
      get scarcity() {
        return calculateFacilityScarcity(island.population, island.rocky, island.copper.mines.maximum, island.copper.mines.total);
      }
    }
  };
  island.oliveOil = {
    player: 0,
    nonplayer: 0,
    get scarcity() {
      return calculateGoodScarcity(island.population, island.lush, island.oliveOil.groves.nonplayer, island.oliveOil.nonplayer);
    },
    groves: {
      maximum: Math.floor(island.lush / 10),
      player: 0,
      nonplayer: 0,
      get total() { 
        return island.oliveOil.groves.player + island.oliveOil.groves.nonplayer;
      },
      get scarcity() {
        return calculateFacilityScarcity(island.population, island.lush, island.oliveOil.groves.maximum, island.oliveOil.groves.total);
      }
    }
  };
  //  goods scarcity also has to be a function of how much the nonplayers have
  //  (which they consume back to 0 when player sells them more--
  //  assumption is they produce only the minimum of what they need but player is selling luxury)

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

// Goods Transaction Panel
function sellGoods() {
  let buyer = activeIslands.playerLocation;
  let seller = activeIslands.playerLocation;
  if (selections.exporting) {
    buyer = activeIslands.importIsland;
    seller = activeIslands.exportIsland;
  }
  setTimeout(
    function() {
      goodsTransaction(buyer);
    }, calculateDeliveryTime(seller, buyer)
  );
  updatePlayerStatPanel();
}

function goodsTransaction(buyer) {
  selections.selectedGood.player -= selections.goodsQuantity;

  //  buying island's nonplayer quantity grows so scarcity can react
  //  still need consumption function
  selections.selectedGood.nonplayer += selections.goodsQuantity;
  
  player.totalGold += selections.goodsQuantity * logGoodsPrice(selections.goodsQuantity, buyer[selections.selectedGoodType].scarcity);
  updateGoodsTransactionPanel();
}

function logGoodsPrice(quantity, scarcity) {
  if (quantity < 1) {
    return 0;
  } else {
    return  (scarcity * 100) * (1 / Math.log(quantity + 2));
  }
}

function calculateGoodScarcity(population, terrain, production, available) {
  return Math.round(Math.log(population * (1 / (terrain + (available * 10) + 1)) * (1 / (production || 1))));
}

function calculateDeliveryTime(seller, buyer) {
  return 1000 * Math.floor(math.distance(seller.coordinates, buyer.coordinates));
}

function updateGoodsTransactionPanel() {
  if (selections.exporting) {
    selections.selectedGood = activeIslands.exportIsland[selections.selectedGoodType];
  } else {
    selections.selectedGood = activeIslands.playerLocation[selections.selectedGoodType];
  }
  let $quantityDisplay = $('#goodsQuantity');
  $quantityDisplay.attr('max', selections.selectedGood.player);
  if (parseInt($quantityDisplay.val()) > selections.selectedGood.player) {
    selections.goodsQuantity = selections.selectedGood.player
    $quantityDisplay.val(selections.selectedGood.player);
  }
  var pricePerGood = logGoodsPrice(selections.goodsQuantity, selections.selectedGood.scarcity);
  displayPricePerGood(pricePerGood);
  displayTotalGoodsPrice(pricePerGood * selections.goodsQuantity);
}

function displayPricePerGood(price) {
  $('#pricePerGood').text(price.toString());
}

function displayTotalGoodsPrice(price) {
  $('#totalGoodsPrice').text(price.toString());
}

// Facilities Transaction Panel
function purchaseFacilities() {
  let cost = selections.facilityQuantity * exponentialFacilitesPrice(selections.facilityQuantity, selections.selectedFacility.scarcity);
  if (player.totalGold > cost) {
    if (activeIslands.playerLocation === activeIslands.selectedIsland || selections.selectedFacility.player > 0) {
      selections.selectedFacility.player += selections.facilityQuantity;
      player.totalGold -= cost;
      updatePlayerStatPanel();
      updateIslandStatPanels();
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
    selections.facilityQuantity = selections.selectedFacility.maximum;
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

// Player Stat Panel Functions
function updatePlayerStatPanel() {
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
  if (relocatingPlayer) {
    previous = activeIslands.playerLocation;
    activeIslands.playerLocation = island;
    relocatingPlayer = false;
  } else if (choosingImporter) {
    previous = activeIslands.importIsland;
    activeIslands.importIsland = island;
  } else if (choosingExporter) {
    //  check if island is valid exporter
    previous = activeIslands.exportIsland;
    activeIslands.exportIsland = island;
  } else {
    if (selections.selectedFacilityType === 'mines') {
      selections.selectedFacility = island.copper.mines;
    } else {
      selections.selectedFacility = island.oliveOil.groves;
    }
    previous = activeIslands.selectedIsland;
    activeIslands.selectedIsland = island;
  }
  $('#' + previous.id).attr('class', 'island');
  highlightActiveIslands();
  updateIslandStatPanels();
}

function highlightActiveIslands() {
  $('#' + activeIslands.selectedIsland.id).attr('class', 'island selectedIsland');
  $('#' + activeIslands.exportIsland.id).attr('class', 'island exportIsland');
  $('#' + activeIslands.importIsland.id).attr('class', 'island importIsland');
  $('#' + activeIslands.playerLocation.id).attr('class', 'island playerIsland');
}