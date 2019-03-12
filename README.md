# Islanders

(The intentions of this work-in-progress)


Economic trading game inspired by the ancient Mediterranean.

Player can build groves and mines on islands to produce copper and olive oil, and sell both for gold.

Price is inversely proportional to on an island's scarcity rating for a given product.
Scarcity is determined by the population of an island and its productive capacity for the product.
Islands each have a maximum number of possible groves and mines based on their lushness and rockiness.
Over time, islanders build their own groves and mines, causing scarcity to for all products decrease.
When all islands have maximized production and minimized scarcity for all products, the game is over.


Player begins on a random island, and can travel between islands.
Player can build production facilities of either type on the island they currently occupy, and can build
on other islands more of any facility types that the player has previously built on those islands.

By default, sales are conducted both from and to the island currently occupied by the player.

An import island can be specified by using the "Importer" button and selecting the island to receive goods.
Goods can be sold to the import island by switching the "Exporting/Not exporting" toggle.
An export island can be specified by using the "Exporter" button and selecting the island to export from.
The maximum amount an island can sell of a given product is determined by the amount it has produced of the same.

A sale will trigger a sudden decline in scarcity of that product on the purchasing island. 
Scarcity will slowly rise again to equilibrium as the infusion is consumed.