var _ = require('underscore');
var enums = require('../enums');
var logger = require('../services/logger');

module.exports.calculate = calculate;
module.exports.categorize = categorize;
module.exports.categorizeSentiment = categorizeSentiment;

/**
* Iterates over a set of responses and calculates the net promoter score
* scores {array of Number}
* callback -> err, Number
*/
 function calculate(scores, callback) {
    var promoters = 0;
    //var passives = 0; // We don't currently use passives anywhere
    var detractors = 0;

    _.each(scores, function(score) {
        var category = categorize(score);

        if (category) {
            if (category === enums.npsTypes.promoter) {
                promoters++;
            //} else if (category === enums.npsTypes.passive) {
            //    passives++
            } else if (category === enums.npsTypes.detractor) {
                detractors++;
            }
        }
    });

    callback(null, calculateNps(promoters, detractors, scores.length));
}

/*
* Calculates the net promoters score for a set of responses
* numPromoters {Number}
* numDetractors {Number}
* numResponses {Number}
* returns {Number}
*/
function calculateNps(numPromoters, numDetractors, numResponses) {
    var percentPromo = numPromoters / numResponses;
    var percentDetract = numDetractors / numResponses;

    return (percentPromo - percentDetract) * 100;
}

/**
* Converts an integer score into an NPS categorization
* score {Number}
* returns {String}
*/
function categorize(score) {
    var category = "";

    if (score == 9 || score == 10) {
        category = enums.npsTypes.promoter;
    } else if (score == 7 || score == 8) {
        category = enums.npsTypes.passive;
    } else if (score >= 0 && score <= 6) {
        category = enums.npsTypes.detractor;
    } else {
        logger.error("Invalid NPS score detected: " + score);
    }

    return category;
}

/**
 * Categorizes a sentiment score into positive/negative
 * score {Number}
 * returns {String}
 */
function categorizeSentiment(score) {
    return score >= 0 ? enums.sentiments.positive : enums.sentiments.negative;
}
