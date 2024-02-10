function fetchDataAndUpdateChart4() {
    fetch('/get-product-revenue')
    .then(response => response.json())
    .then(data => {
      console.log(data)
      updateChart4(data);
    })
    .catch(error => console.error('Error:', error));
  }


  function updateChart4(data) {
am5.ready(function() {

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element 
    var root = am5.Root.new("chartdiv4");
    
    const myTheme = am5.Theme.new(root);
    
    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy:1
    });
    
    myTheme.rule("Grid", ["x"]).setAll({
      strokeOpacity: 0.05
    });
    
    myTheme.rule("Grid", ["x", "minor"]).setAll({
      strokeOpacity: 0.05
    });
    
    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      myTheme
    ]);
    
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      pinchZoomX:true
    }));
    
    
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    var value = 100;
    
    function generateData() {
      value = Math.round((Math.random() * 10 - 4.2) + value);
      am5.time.add(date, "day", 1);
      return {
        date: date.getTime(),
        value: value
      };
    }
    
    function generateDatas(count) {
      var data = [];
      for (var i = 0; i < count; ++i) {
        data.push(generateData());
      }
      return data;
    }
    
    
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "month",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
        minorGridEnabled: true
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));
    
    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));
    

// Initialize an array to store series data
var seriesData = [];

// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
for (var i = 0; i < data.length; i++) {
    var product = data[i].Product;

    // Find or create the series data for the product
    var productData = seriesData.find(item => item.name === product);
    if (!productData) {
        productData = { name: product, data: [] };
        seriesData.push(productData);
    }

    // Add data point to the series data
    var date = new Date(data[i].Year, data[i].Month - 1); // Adjust the date creation
    productData.data.push({ date: date.getTime(), value: data[i].ProductRevenue });
}

// Add series to the chart
for (var i = 0; i < seriesData.length; i++) {
    var productData = seriesData[i];

    var series = chart.series.push(am5xy.LineSeries.new(root, {
        name: productData.name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{valueY}"
        })
    }));

    // Add data points to the series
    series.data.setAll(productData.data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear();
}


    
    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);
    
    
    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));
    
    chart.set("scrollbarY", am5.Scrollbar.new(root, {
      orientation: "vertical"
    }));
    
    
    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.rightAxesContainer.children.push(am5.Legend.new(root, {
      width: 200,
      paddingLeft: 15,
      height: am5.percent(100)
    }));
    
    // When legend item container is hovered, dim all the series except the hovered one
    legend.itemContainers.template.events.on("pointerover", function(e) {
      var itemContainer = e.target;
    
      // As series list is data of a legend, dataContext is series
      var series = itemContainer.dataItem.dataContext;
    
      chart.series.each(function(chartSeries) {
        if (chartSeries != series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000)
          });
        } else {
          chartSeries.strokes.template.setAll({
            strokeWidth: 3
          });
        }
      })
    })
    
    // When legend item container is unhovered, make all series as they are
    legend.itemContainers.template.events.on("pointerout", function(e) {
      var itemContainer = e.target;
      var series = itemContainer.dataItem.dataContext;
    
      chart.series.each(function(chartSeries) {
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get("fill")
        });
      });
    })
    
    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right"
    });
    
    // It's is important to set legend data after all the events are set on template, otherwise events won't be copied
    legend.data.setAll(chart.series.values);
    
         // Set number formatter settings for large and small numbers
         root.numberFormatter.setAll({
          numberFormat: "#a",
          bigNumberPrefixes: [
              { "number": 1e+6, "suffix": "M" },
              { "number": 1e+9, "suffix": "B" }
          ],
          smallNumberPrefixes: []
      });


    
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);
    
    }); // end am5.ready()
  }


    document.addEventListener('DOMContentLoaded', function(){
    fetchDataAndUpdateChart4();
});
