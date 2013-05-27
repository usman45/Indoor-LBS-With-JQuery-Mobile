var chart = {

    initialize : function() {
        $("#chart").live("pageshow", function(){
            chart.draw();
        });
    },

    draw : function() {
        console.log("Draw method started.");
        $.jqplot.config.enablePlugins = true;
        var s1 = [2, 6, 7, 10];
        var s2 = [4, 5, 6, 12];
        var months = "January, February, March, April, May, June," +
                 " July, August, September, October, November, December";

        var re = /\s*,\s*/; /* Every space after and before a comma.*/
        var ticks = months.split(re);

        plot1 = $.jqplot('chart1', [s1, s2], {
            animate: !$.jqplot.use_excanvas,
            title: "Waste output of your area",
            seriesDefaults : {
                renderer: $.jqplot.BarRenderer, 
                pointLabels: { show: true }
            },
            series : [
                {label : "Output for 2011"},
                {label: "Output for 2012"}
            ],
            legend: {
                show: true,
                location: 'n',
                placement: 'inside'
            },
            axes : {
                xaxis : {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks
                    },
                },
                highlighter : {show: true}
        });

        $('#chart1').bind('jqplotDataMouseOver', 
            function (ev, seriesIndex, pointIndex, data)    {
                $("#info1").html('series: '+ seriesIndex+', point: '+pointIndex+', data:'+data);
            }
        );
        console.log("Draw method ended");
    },
};
