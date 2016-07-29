'use strict'
var config = require("../config/config.json");
var MonteCarlo = require("montecarlo-estimate").montecarlo;
var knapsack = require("knapsack01");

/**
 * Simulator provides methods for simulating a single/series of sprints using the Montecarlo heuristic
 * and the KP01 algorithm to choose the best possible selection according to the provided business value
 */
class Simulator {
	
	/**
	 *	Run a Montecarlo simulation
	 */
	runMontecarlo (sprint, settings) {
		settings = settings || {};

		//set inputs for montecarlo heuristic
		var biasKey = settings.biasKey || "estimation";
		var mcThreshold = sprint.threshold || config.mcThreshold;
		var capacity = Math.round(sprint.capacity * sprint.focusFactor);
		
		var table = new MonteCarlo({biasKey : biasKey}).roll(sprint.cards, sprint.threshold);
		
	    var valueAtThreshold = table.valueAtThreshold;
	    var thresholdIndex = table.thresholdIndex;
	    var totalSprintPlanning = this.__getTotalSprintPlanning(sprint, biasKey);
	    
	    var retTable = table.probabilityTable;

	    var result = {};
	    result.table = MonteCarlo.transformToArray(retTable);
	    result.threshold = mcThreshold;
	    result.valueAtThreshold = valueAtThreshold;
	    result.thresholdIndex = thresholdIndex;
	    result.biasedItemsAtTh = retTable[valueAtThreshold];

	    //expected delivery after montecarlo simulation  
	    result.expectedDelivery = Math.round(totalSprintPlanning*capacity / valueAtThreshold);


	    return result;
	};

	/**
	 * Run a Knapsac problem
	 * @param {Array} cards list of objecth of type card
	 * @param {number} capacity knapsack capacity
	 * @param {object} settings
	 *    <pre>map</pre> map custom fields to the weight and value for the kp algorithm
	 */
	runKnapsack (cards, capacity, settings) {
		settings = settings || {};

		var result = knapsack.run(cards, capacity, settings.map);

	    return result;
	};

	runSimulation (sprint, settings) {
		var mc = this.runMontecarlo(sprint, settings);
		var kpBiased = this.runKnapsack(mc.biasedItemsAtTh.biasedItems, mc.expectedDelivery, {"map" : {"value" : "bvalue", "weight" : "biasedValue"}});
		var kp = this.runKnapsack(sprint.cards, sprint.capacity, {"map" : {"value" : "bvalue", "weight" : "estimation"}});
		return {
			 mc : mc,
			 biasedKp : kpBiased,
			 kp : kp,
			 sprint : sprint,
			 totalSprintPlanning : this.__getTotalSprintPlanning(sprint,"estimation")
			} ;
	}

    /**
     * Calculate the sprint planning from sprint cards
     */
	__getTotalSprintPlanning(sprint, weightKey) {
		var total = 0;
		sprint.cards.forEach(function(item) {
			total +=item[weightKey];
		})
		return total;
	}
}

module.exports = new Simulator


