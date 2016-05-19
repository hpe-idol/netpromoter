describe("NPS calculator", function() {
    var calc = require('../lib/utils/nps-calculator');
    var enums = require('../lib/enums');

    describe("calculate", function() {
        it ("should return a number", function() {
            calc.calculate([0, 10], function(err, res) {
                res.should.be.Number;
            })
        });

        it ("should return correct results", function() {
            calc.calculate([0, 10], function(err, res) {
                res.should.equal(0);
            });
            calc.calculate([0, 8, 10], function(err, res) {
                res.should.equal(0);
            });
            calc.calculate([0, 2, 7, 8, 9, 10], function(err, res) {
                res.should.equal(0);
            });
            calc.calculate([0, 0, 10, 10], function(err, res) {
                res.should.equal(0);
            });
        });

        it ("should return negative results", function() {
            calc.calculate([0], function(err, res) {
                res.should.be.below(0);
            });
            calc.calculate([0, 5, 10], function(err, res) {
                res.should.be.below(0);
            });
            calc.calculate([5, 5, 9, 8, 3, 10], function(err, res) {
                res.should.be.below(0);
            });
        });

        it ("should return positive results", function() {
            calc.calculate([10], function(err, res) {
                res.should.be.above(0);
            });
            calc.calculate([0, 9, 10, 0, 10, 8, 9, 9], function(err, res) {
                res.should.be.above(0);
            });
            calc.calculate([10, 10, 9, 8, 8, 8, 8, 7, 2], function(err, res) {
                res.should.be.above(0);
            });
        });
    });

    describe("categorize", function() {
        it ("should correctly categorize promoters", function() {
            calc.categorize(10).should.equal(enums.npsTypes.promoter);
            calc.categorize(9).should.equal(enums.npsTypes.promoter);
        });

        it ("should correctly categorize passives", function() {
            calc.categorize(8).should.equal(enums.npsTypes.passive);
            calc.categorize(7).should.equal(enums.npsTypes.passive);
        });

        it ("should correctly categorize detractors", function() {
            calc.categorize(6).should.equal(enums.npsTypes.detractor);
            calc.categorize(5).should.equal(enums.npsTypes.detractor);
            calc.categorize(4).should.equal(enums.npsTypes.detractor);
            calc.categorize(3).should.equal(enums.npsTypes.detractor);
            calc.categorize(2).should.equal(enums.npsTypes.detractor);
            calc.categorize(1).should.equal(enums.npsTypes.detractor);
            calc.categorize(0).should.equal(enums.npsTypes.detractor);
        });

        it ("should handle invalid numbers by returning an empty string", function() {
            calc.categorize(-1).should.equal("");
            calc.categorize(11).should.equal("");
            calc.categorize(NaN).should.equal("");
        });
    });
});
