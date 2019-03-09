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

  createPlayerDisplay();

  displayStats(playerOne);

});

let playerOne = {
    name: 'Sam',
    groves: 0,
    gold: 0
  };

let playerTwo = {
  name: '',
  groves: 0,
  gold: 0
};

function displayStats(player) {
  $('#name').text('Name: '+ player[name]);
  $('#gold').text('Gold: ' + player[gold]);
  $('#groves').text('Groves: ' + player[groves]); 
}

function createPlayerDisplay() {
  $playerDiv = $('<div></div>');
  $playerName = $('<p></p>');
  $playerGold = $('<p></p>');
  $playerGroves = $('<p></p>');

  $playerDiv.attr('id', 'playerOne');
  $playerName.attr('id', 'name');
  $playerGold.attr('id', 'gold');
  $playerGroves.attr('id', 'groves');

  $playerName.appendTo($playerDiv);
  $playerGold.appendTo($playerDiv);
  $playerGroves.appendTo($playerDiv);

  $playerDiv.appendTo($('#display'));
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