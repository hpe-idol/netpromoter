define([
    'backbone',
    'handlebars',
    'text!templates/app/page/analysis/results/results-table-row.hbs',
    'text!templates/app/page/analysis/results/results-table.hbs',
    'datatables.bootstrap'
], function(Backbone, Handlebars, rowTemplate, template) {

    var datatableOptions = {
        responsive: true,
        lengthChange: false,
        ordering: false,
        pageLength: 5,
        columns: [
            { width: '20px' },
            { width: '50px' },
            { width: '170px' },
            { width: '140px' },
            null
        ]
    };

    return Backbone.View.extend({

        initialize: function(options) {
            this.template = Handlebars.compile(template);
            this.rowTemplate = Handlebars.compile(rowTemplate);

            this.groupingCollection = options.groupingCollection;
            this.topicCollection = options.topicCollection;
            this.resultsChartView = options.resultsChartView;
            this.resultsControlModel = options.resultsControlModel;

            this.listenTo(this.groupingCollection, 'request', _.bind(this.reset, this));
            this.listenTo(this.groupingCollection, 'sync', _.bind(this.addTooltips, this));
            this.listenTo(this.topicCollection, 'cleared', _.bind(this.reset, this));
            this.listenTo(this.resultsChartView, 'chart-bar-click', _.bind(this.populate, this));
        },

        render: function() {
            this.$el.html(this.template());
        },

        reset: function() {
            var $table = this.$('.js-detail-table');
            if ($.fn.dataTable.isDataTable('.js-detail-table')) {
                $table.DataTable().destroy();
            }
            $table.addClass('hide')
                .find('tbody').html('');
        },

        addTooltips: function() {
            this.$('.js-detail-table').tooltip({
                selector: '.answer-truncate',
                title: function() {
                    return $(this).text();
                }
            });
        },

        populate: function(eventData) {
            this.resultsChartView.togglePendingDrilldownRequest(true);

            this.topicCollection.fetch({
                data: {
                    concept: '"' + eventData.text + '"',
                    npsType: this.resultsControlModel.get('npsType'),
                    sentiment: this.resultsControlModel.get('sentiment'),
                    question: this.resultsControlModel.get('question'),
                    excludeSingle: this.resultsControlModel.get('excludeSingle')
                },
                success: _.bind(function(collection) {
                    this.reset();
                    this.resultsChartView.togglePendingDrilldownRequest(false);

                    var rows = collection.map(_.bind(function(model) {
                        return this.rowTemplate(_.extend(model.attributes, {
                            selectedCluster: eventData.text
                        }));
                    }, this)).join('');

                    this.$('.js-detail-table')
                        .find('tbody')
                        .html(rows)
                        .end()
                        .dataTable(datatableOptions)
                        .removeClass('hide');
                }, this)
                //TODO: error handling
            })
        }
    });
});
