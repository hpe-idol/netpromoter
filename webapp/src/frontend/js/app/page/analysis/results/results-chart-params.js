define([], function() {

    var flotChartColors = {
        primary: 'rgb(1,169,130)',
        primaryFillHover : 'rgba(1,169,130,0.2)',
        gridColor : '#999999',
        tickColor: '#D4D4D4',
        white: '#FFFFFF'
    };

    function getPlotData(data) {
        return [
            {
                data: data,
                bars: {
                    show: true,
                    align: 'center',
                    barWidth: 0.6,
                    fill: true,
                    fillColor: {
                        colors: [{
                            opacity: 0.1
                        }, {
                            opacity: 0.1
                        }]
                    }
                },
                highlightColor: [flotChartColors.primaryFillHover]
            }
        ]
    }

    function getOptions(ticks) {
        return {
            xaxis: {
                ticks: ticks,
                color: [flotChartColors.white]
            },
            yaxis: {tickDecimals: 0},
            colors: [flotChartColors.primary],
            grid: {
                color: [flotChartColors.gridColor],
                hoverable: true,
                clickable: true,
                tickcolor: [flotChartColors.tickColor],
                borderWidth: 0
            },
            legend: {
                show: false
            },
            tooltip: true,
            tooltipOpts: {
                content: 'occurrences: %y'
            }
        }
    }

    return {
        getPlotData: getPlotData,
        getOptions: getOptions
    }
});
