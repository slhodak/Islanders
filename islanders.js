const $root = $('#root');
const $map = $('<div></div>');
const density = 20;

$(document).ready(function() {
  $map.attr('id', 'map');
  $root.append($map);


  for (let i = 0; i < density; i++) {
    createIsland($map); 
  }

});


function createIsland(map) {
  let $island = $('<div></div>');
  let randomX = Math.ceil(Math.random() * 32);
  let randomY = Math.ceil(Math.random() * 32);
  $island.attr('id', 'island');
  // why doesn't .css() work?
  $island.attr('style', 'grid-area: ' + randomX + ' / ' + randomY + ';');
map.append($island);
}