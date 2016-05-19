define([
    'backbone',
    'jquery',
    'handlebars',
    'app/models/grouping-collection',
    'app/page/analysis/results/results-chart',
    'app/page/analysis/results/results-table',
    'text!templates/app/page/analysis/results/results-panel.hbs',
    'icheck'
], function(Backbone, $, Handlebars, GroupingCollection, ResultsChartView, ResultsTableView, template) {

    return Backbone.View.extend({

        events: {
            'click .js-run-analysis': function() {
                this.groupingCollection.fetch({data: this.resultsControlModel.toJSON()})
            },
            'change .js-parametric-nps': function(e) {
                this.resultsControlModel.set('npsType', this.$(e.currentTarget).val());
            },
            'change .js-parametric-sentiment': function(e) {
                this.resultsControlModel.set('sentiment', this.$(e.currentTarget).val());
            },
            'ifChecked input[type="radio"][name="question"]': function(e) {
                this.resultsControlModel.set('question', this.$(e.currentTarget).val());
            },
            'ifToggled .js-exclude-single': function(e) {
                this.resultsControlModel.set('excludeSingle', this.$(e.currentTarget).prop('checked'));
            }
        },

        initialize: function(options) {
            this.template = Handlebars.compile(template);

            this.resultsControlModel = new Backbone.Model();
            this.groupingCollection = new GroupingCollection();
            this.resultsChart = new ResultsChartView({
                groupingCollection: this.groupingCollection,
                topicCollection: options.topicCollection
            });
            this.resultsTable = new ResultsTableView({
                groupingCollection: this.groupingCollection,
                topicCollection: options.topicCollection,
                resultsChartView: this.resultsChart,
                resultsControlModel: this.resultsControlModel
            });
        },

        render: function() {
            this.$el.html(this.template());

            this.resultsChart.setElement(this.$('.js-results-chart')).render();
            this.resultsTable.setElement(this.$('.js-results-table')).render();

            this.populateResultsControlModel();

            this.$('.i-check').iCheck({
                checkboxClass: 'icheckbox-hp',
                radioClass: 'iradio-hp'
            });
        },

        populateResultsControlModel: function() {
            this.resultsControlModel.set({
                npsType: this.$('.js-parametric-nps').val(),
                sentiment: this.$('.js-parametric-sentiment').val(),
                question: this.$('input[type="radio"][name="question"]:checked').val(),
                excludeSingle: this.$('.js-exclude-single').prop('checked')
            });
        }
    });
});
