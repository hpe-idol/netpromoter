define([
    'backbone',
    'handlebars',
    'app/page/analysis/results/results-chart-params',
    'text!templates/app/page/analysis/results/results-chart.hbs',
    'flot',
    'flot.resize',
    'flot.tooltip'
], function(Backbone, Handlebars, resultsChartParams, template) {
    return Backbone.View.extend({

        events: {
            'plothover .flot-chart-content': function (event, pos, item) {
                this.$(event.currentTarget).css('cursor', item ? 'pointer': 'auto');
            },
            'plotclick .flot-chart-content': function (event, pos, item) {
                if (item) {
                    this.trigger('chart-bar-click', {
                        text: item.series.xaxis.ticks[item.dataIndex].label
                    });
                }
            }
        },

        initialize: function(options) {
            this.template = Handlebars.compile(template);
            this.groupingCollection = options.groupingCollection;
            this.topicCollection = options.topicCollection;

            this.listenTo(this.groupingCollection, 'request', _.bind(this.pendingRequest, this));
            this.listenTo(this.groupingCollection, 'sync', _.bind(this.updateChart, this));
            this.listenTo(this.groupingCollection, 'error', _.bind(this.onError, this));
            this.listenTo(this.topicCollection, 'cleared', _.bind(this.reset, this));
        },

        render: function() {
            this.$el.html(this.template());
        },

        pendingRequest: function() {
            this.reset();
            this.togglePendingRequest(true);
        },

        reset: function() {
            this.$('.flot-chart-content')
                .html('')
                .addClass('opacity-hide');

            this.$('.flot-chart-error').text('');
        },

        togglePendingRequest: function(pending) {
            this.$('.js-analysis-chart-spinner').toggleClass('hide', !pending);
            this.$('.flot-chart-content').toggleClass('opacity-hide', pending);
        },

        togglePendingDrilldownRequest: function(pending) {
            this.$('.js-analysis-chart-spinner').toggleClass('hide', !pending);
            this.$('.js-analysis-chart-spinner').toggleClass('white-overlay', pending);
        },

        updateChart: function(groupingCollection) {
            var getChartData = function(attribute) {
                return groupingCollection.map(function(model, index) {
                    return [index, model.get(attribute)];
                });
            };

            var chartCoordinates = getChartData('occurrences');
            var chartTicks = getChartData('text');

            $.plot(
                this.$('.flot-chart-content'),
                resultsChartParams.getPlotData(chartCoordinates),
                resultsChartParams.getOptions(chartTicks)
            );
            this.togglePendingRequest(false);
        },

        onError: function() {
            this.$('.flot-chart-error').text('Error occurred while fetching topic analysis.');
            this.$('.js-analysis-chart-spinner').addClass('hide');
            this.$('.flot-chart-content').addClass('opacity-hide');
        }
    });
});