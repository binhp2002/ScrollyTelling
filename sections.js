
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var width = 850;
  var height = 520;
  var margin = { top: 10, left: 40, bottom: 40, right: 10 };

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  //var squareSize = 6;
  //var squarePad = 2;
  var circleRadius = 4;
  var circlePad = 6;
  var numPerRow = width / (circleRadius + circlePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // We will set the domain when the
  // data is processed.
  // @v4 using new scale names
  var xBarScale = d3.scaleLinear()
    .range([0, width]);

  // The bar chart display is horizontal
  // so we can use an ordinal scale
  // to get width and y locations.
  // @v4 using new scale type
  var yBarScale = d3.scaleBand()
    .paddingInner(0.08)
    .domain([0, 1, 2])
    .range([0, height - 50], 0.1, 0.1);

  // Color is determined just by the index of the bars
  var barColors = {
    0: '#008080',
    1: '#399785',
    2: '#5AAF8C',
    3: '#9C755F',
    4: '#E8491D',
    5: '#573280',
    6: '#FFD700',
    7: '#2E8B57',
    8: '#FF6347',
    9: '#4B0082',
    10: '#00CED1',
    11: '#FFA07A'
  };

  // The histogram display shows the
  // first 30 minutes of data
  // so the range goes from 0 to 30
  // @v4 using new scale name
  var xHistScale = d3.scaleLinear()
    .domain([0, 30])
    .range([0, width - 20]);

  // @v4 using new scale name
  var yHistScale = d3.scaleLinear()
    .range([height, 0]);

  // The color translation uses this
  // scale to convert the progress
  // through the section into a
  // color value.
  // @v4 using new scale name
  var coughColorScale = d3.scaleLinear()
    .domain([0, 1.0])
    .range(['#008080', 'red']);

  // You could probably get fancy and
  // use just one axis, modifying the
  // scale, but I will use two separate
  // ones to keep things easy.
  // @v4 using new axis name
  var xAxisBar = d3.axisBottom()
    .scale(xBarScale);

  // @v4 using new axis name
  var xAxisHist = d3.axisBottom()
    .scale(xHistScale)
    .tickFormat(function (d) { return d + ' min'; });



  /**
   * new histogram chart start here - country
   */  
  var xHistScaleCountry = d3.scaleBand()
    //.domain(['United States', 'United Kingdom', 'Japan', 'Indonesia', 'France', 'Australia', 'Brazil', 'Germany', 'Canada', 'China'])
    .domain([0, 30])
    .range([10, width - 20])
    .padding(0.2);

  // @v4 using new scale name
  var yHistScaleCountry = d3.scaleLinear()
    .domain([0, 1100])
    .range([height, 0]);

  // @v4 using new axis name
  var xAxisHistCountry = d3.axisBottom()
    .scale(xHistScaleCountry)
    .tickFormat(function (d) { return d; });

  var yAxisHistCountry = d3.axisLeft()
    .scale(yHistScaleCountry)
    .tickFormat(function (d) { return d; });


  /**
   * new histogram chart start here - carrier
   */  
  var xHistScaleCarrier = d3.scaleBand()
    .domain([0, 30])
    .range([10, width - 20])
    .padding(0.2);

  // @v4 using new scale name
  var yHistScaleCarrier = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  // @v4 using new axis name
  var xAxisHistCarrier = d3.axisBottom()
    .scale(xHistScaleCarrier)
    .tickFormat(function (d) { return d; });

  var yAxisHistCarrier = d3.axisLeft()
    .scale(yHistScaleCarrier)
    .tickFormat(function (d) { return d; });


  /**
   * new histogram chart start here - manufacturer
   */  
  var xHistScaleManufacturer = d3.scaleBand()
    .domain([0, 30])
    .range([10, width - 20])
    .padding(0.2);

  // @v4 using new scale name
  var yHistScaleManufacturer = d3.scaleLinear()
    .domain([0, 1200])
    .range([height, 0]);

  // @v4 using new axis name
  var xAxisHistManufacturer = d3.axisBottom()
    .scale(xHistScaleManufacturer)
    .tickFormat(function (d) { return d; });

  var yAxisHistManufacturer = d3.axisLeft()
    .scale(yHistScaleManufacturer)
    .tickFormat(function (d) { return d; });

  /**
   * new histogram chart start here - flight phase
   */  
  var xHistScaleFlight = d3.scaleBand()
    .domain([0, 30])
    .range([10, width - 20])
    .padding(0.2);

  // @v4 using new scale name
  var yHistScaleFlight = d3.scaleLinear()
    .domain([0, 200])
    .range([height, 0]);

  // @v4 using new axis name
  var xAxisHistFlight = d3.axisBottom()
    .scale(xHistScaleFlight)
    .tickFormat(function (d) { return d; });

  var yAxisHistFlight = d3.axisLeft()
    .scale(yHistScaleFlight)
    .tickFormat(function (d) { return d; });




  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([wordData]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // perform some preprocessing on raw data
      var wordData = getWords(rawData);
      // filter to just include Total_Serious_Injuries words
      var fillerWords = getFillerWords(wordData);


      /**
       * new histogram chart start here - country
       */
      var fillerCountryCount = groupByCountry(wordData);
      //console.log(fillerCountryCount);
      var fillerCountry = getFillerCountry(fillerCountryCount);
      //console.log(fillerCountry);
      //var temp = fillerCountry.map(function(d) { return d.key; });
      //console.log(temp);
      xHistScaleCountry.domain(fillerCountry.map(function(d) { return d.key; }));


      /**
       * new histogram chart start here - carrier
       */
      var fillerCarrierCount = groupByCarrier(wordData);
      //console.log(fillerCarrierCount);
      var fillerCarrier = getFillerCarrier(fillerCarrierCount);
      //console.log(fillerCarrier);
      xHistScaleCarrier.domain(fillerCarrier.map(function(d) { return d.key; }));

      /**
       * new histogram chart start here - manufacturer
       */
      var fillerManufacturerCount = groupByManufacturer(wordData);
      //console.log(fillerManufacturerCount);
      xHistScaleManufacturer.domain(fillerManufacturerCount.map(function(d) { return d.key; }));


      /**
       * new histogram chart start here - flight phase
       */
      var fillerFlightCount = groupByFlight(wordData);
      //console.log(fillerFlightCount);
      var fillerFlight = getFillerFlight(fillerFlightCount);
      //console.log(fillerFlight);
      xHistScaleFlight.domain(fillerFlight.map(function(d) { return d.key; }));



      //setupVis(wordData, fillerCounts, histData);
      setupVis(wordData, fillerCountry, fillerCarrier, fillerManufacturerCount, fillerFlight);

      setupSections();
    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each Total_Serious_Injuries word type.
   * @param histData - binned histogram data
   */
  //var setupVis = function (wordData, fillerCounts, histData)
  var setupVis = function (wordData, fillerCountry, fillerCarrier, fillerManufacturerCount, fillerFlight) {
    // axis
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxisBar);
    g.select('.x.axis').style('opacity', 0);

    // y axis ==> switch out using select(y axis) in hist function
    g.append('g')
      .attr('class', 'y axis')
      //.attr('transform', 'translate(0,' + height + ')')
      // .attr('transform', 'translate('+ width + ', 0)')
      .call(yAxisHistCountry);
    g.select('.y.axis').style('opacity', 0);

    // count openvis title
    g.append('text')
      .attr('class', 'title openvis-title')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('2013');

    g.append('text')
      .attr('class', 'sub-title openvis-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('OpenVis Conf');

    g.selectAll('.openvis-title')
      .attr('opacity', 0);

    // count Total_Serious_Injuries word count title
    g.append('text')
      .attr('class', 'title count-title highlight')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('180');

    g.append('text')
      .attr('class', 'sub-title count-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text('Total_Serious_Injuries Words');

    g.selectAll('.count-title')
      .attr('opacity', 0);

    // dot grid
    // @v4 Using .merge here to ensure
    // new and old data have same attrs applied
    var dots = g.selectAll('.dot').data(wordData, function (d) { return d.Location; });
    var dotsE = dots.enter()
      .append('circle')
      .classed('dot', true);
    dots = dots.merge(dotsE)
      //.attr('width', squareSize)
      //.attr('height', squareSize)
      .attr('r', circleRadius)
      .attr('fill', '#fff')
      .classed('fill-dot', function (d) { return d.Injury_Severity; })
      .attr('cx', function (d) { return d.x;})
      .attr('cy', function (d) { return d.y;})
      .attr('opacity', 0);

  
    /**
     * new histogram chart start here - country
     */
    var bars = g.selectAll('.barCo').data(fillerCountry);
    var barsE = bars.enter()
      .append('rect')
      .attr('class', 'barCo');
    bars = bars.merge(barsE)
      .attr('x', function (d) { return xHistScaleCountry(d.key);})
      .attr('y', function (d) { return yHistScaleCountry(d.value);})
      .attr('width', xHistScaleCountry.bandwidth())
      .attr('height', function(d) { return height - yHistScaleCountry(d.value); })
      .attr("fill", function(d, i) {
        return barColors[i];
      })
      .attr('opacity', 0);

    /**
     * new histogram chart start here - carrier
     */
    var barsCa = g.selectAll('.barCa').data(fillerCarrier);
    var barsECa = barsCa.enter()
      .append('rect')
      .attr('class', 'barCa');
    barsCa = barsCa.merge(barsECa)
      .attr('x', function (d) { return xHistScaleCarrier(d.key);})
      .attr('y', function (d) { return yHistScaleCarrier(d.value);})
      .attr('width', xHistScaleCarrier.bandwidth())
      .attr('height', function(d) { return height - yHistScaleCarrier(d.value); })
      .attr("fill", function(d, i) {
        return barColors[i];
      })
      .attr('opacity', 0);


    /**
     * new histogram chart start here - manufacturer
     */
    var barsMa = g.selectAll('.barMa').data(fillerManufacturerCount);
    var barsEMa = barsMa.enter()
      .append('rect')
      .attr('class', 'barMa');
    barsMa = barsMa.merge(barsEMa)
      .attr('x', function (d) { return xHistScaleManufacturer(d.key);})
      .attr('y', function (d) { return yHistScaleManufacturer(d.value);})
      .attr('width', xHistScaleManufacturer.bandwidth())
      .attr('height', function(d) { return height - yHistScaleManufacturer(d.value); })
      .attr("fill", function(d, i) {
        return barColors[i];
      })
      .attr('opacity', 0);    
      
      
    /**
     * new histogram chart start here - flight phase
     */
    var barsFl = g.selectAll('.barFl').data(fillerFlight);
    var barsEFl = barsFl.enter()
      .append('rect')
      .attr('class', 'barFl');
    barsFl = barsFl.merge(barsEFl)
      .attr('x', function (d) { return xHistScaleFlight(d.key);})
      .attr('y', function (d) { return yHistScaleFlight(d.value);})
      .attr('width', xHistScaleFlight.bandwidth())
      .attr('height', function(d) { return height - yHistScaleFlight(d.value); })
      .attr("fill", function(d, i) {
        return barColors[i];
      })
      .attr('opacity', 0); 
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showGrid;
    activateFunctions[2] = highlightGridRed;
    activateFunctions[3] = highlightGridOrange;
    activateFunctions[4] = showTitle;
    activateFunctions[5] = showHistAllCountry;
    activateFunctions[6] = showHistAllCarrier;
    activateFunctions[7] = showHistAllManufacturer;
    activateFunctions[8] = showHistAllFlight;


    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function () {};
    }
    //updateFunctions[7] = updateCough;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.dot')
      .transition()
      .duration(600)
      .attr('opacity', 0);

    hideAxis();
    hideAxisY();
    g.selectAll('.hist')
      .transition()
      .duration(600)
      .attr('height', function () { return 0; })
      .attr('y', function () { return height; })
      .style('opacity', 0);

    g.selectAll('.barCo')
      .transition()
      .delay(function (d, i) { return 100 * (i + 1);})
      .duration(600)
      //.attr('height', function(d) { return height - yHistScaleCountry(d.value); })
      .attr('width', xHistScaleCountry.bandwidth())
      .attr('opacity', 0);
  }


  /**
   * showGrid - square grid
   *
   * hides: Total_Serious_Injuries count title
   * hides: Total_Serious_Injuries highlight in grid
   * shows: square grid
   *
   */
  function showGrid() {
    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.dot')
      .transition()
      .duration(600)
      .delay(function (d) {
        return 5 * d.row;
      })
      .attr('opacity', 1.0)
      .attr('fill', '#ddd');
  }

  /**
   * highlightGridRed - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted red
   *  Total_Serious_Injuries words. also ensures squares
   *  are moved back to their place in the grid
   */
  function highlightGridRed() {
    hideAxis();
    g.selectAll('.bar')
      .transition()
      .duration(600)
      .attr('width', 0);

    g.selectAll('.bar-text')
      .transition()
      .duration(0)
      .attr('opacity', 0);


    g.selectAll('.dot')
      .transition()
      .duration(0)
      .attr('opacity', 1.0)
      .attr('fill', '#ddd');

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll('.fill-dot')
      .transition('move-fills')
      .duration(800)
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });

    g.selectAll('.fill-dot')
      .transition()
      .duration(800)
      .attr('opacity', 1.0)
      .attr('fill', function (d) { 
        //console.log(d.Injury_Severity);
        //return d.Total_Serious_Injuries ? '#008080' : '#ddd'; 

        if (d.Injury_Severity === '1') {
          return '#FF0000';
        } else {
          return '#ddd';
        }
      });
  }

  /**
   * highlightGridOrange - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted orange
   *  Injury_Severity words. also ensures squares
   *  are moved back to their place in the grid
   */
  function highlightGridOrange() {

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll('.fill-dot')
      .transition('move-fills')
      .duration(800)
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });

    g.selectAll('.fill-dot')
      .transition()
      .duration(800)
      .attr('opacity', 1.0)
      .attr('fill', function (d) { 
        if (d.Injury_Severity === '0') {
          return '#FFA500';
        } else if (d.Injury_Severity === '1') {
          return '#FF0000';
        } else {
          return '#ddd';
        }
      });
  }


  /**
   * showHistAllCountry - show all histogram => new histogram chart start here
   *
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showHistAllCountry() {
    // ensure the axis to histogram one
    showAxis(xAxisHistCountry);
    showAxisY(yAxisHistCountry);

    g.selectAll('.barCa')
      //.transition()
      //.duration(0)
      .transition()
      .delay(function (d, i) { return 200 * (i + 1);})
      .duration(600)
      .attr('opacity', 0);

    g.selectAll('.barCo')
      .transition()
      .delay(function (d, i) { return 300 * (i + 1);})
      .duration(600)
      //.attr('height', function(d) { return height - yHistScaleCountry(d.value); })
      .attr('width', xHistScaleCountry.bandwidth())
      .attr('opacity', 1);
  }


  /**
   * showHistAllCarrier - show all carrier histogram
   * 
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showHistAllCarrier() {
    // ensure the axis to histogram one
    hideAxis(xAxisHistCountry);
    hideAxisY(yAxisHistCountry);
    hideAxis(xAxisHistManufacturer);
    hideAxisY(yAxisHistManufacturer);
    showAxis(xAxisHistCarrier);
    showAxisY(yAxisHistCarrier);

    g.selectAll('.barCo')
      //.transition()
      //.duration(0)
      .transition()
      .delay(function (d, i) { return 200 * (i + 1);})
      .duration(600)
      .attr('opacity', 0);

    g.selectAll('.barMa')
      //.transition()
      //.duration(0)
      .transition()
      .delay(function (d, i) { return 200 * (i + 1);})
      .duration(600)
      .attr('opacity', 0);

    g.selectAll('.barCa')
      .transition()
      .delay(function (d, i) { return 300 * (i + 1);})
      .duration(600)
      //.attr('height', function(d) { return height - yHistScaleCountry(d.value); })
      .attr('width', xHistScaleCarrier.bandwidth())
      .attr('opacity', 1);      
  }


  /**
   * showHistAllManufacturer - show all manufacturer histogram
   * 
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showHistAllManufacturer() {
    // ensure the axis to histogram one
    hideAxis(xAxisHistCarrier);
    hideAxisY(yAxisHistCarrier);
    hideAxis(xAxisHistFlight);
    hideAxisY(yAxisHistFlight);
    showAxis(xAxisHistManufacturer);
    showAxisY(yAxisHistManufacturer);

    g.selectAll('.barCa')
      //.transition()
      //.duration(0)
      .transition()
      .delay(function (d, i) { return 100 * (i + 1);})
      .duration(600)
      .attr('opacity', 0);

    g.selectAll('.barFl')
      //.transition()
      //.duration(0)
      .transition()
      .delay(function (d, i) { return 100 * (i + 1);})
      .duration(600)
      .attr('opacity', 0);

    g.selectAll('.barMa')
      .transition()
      .delay(function (d, i) { return 300 * (i + 1);})
      .duration(600)
      .attr('width', xHistScaleManufacturer.bandwidth())
      .attr('opacity', 1);      
  }
  

  /**
   * showHistAllFlight - show all flight phase histogram
   * 
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showHistAllFlight() {
    // ensure the axis to histogram one
    hideAxis(xAxisHistManufacturer);
    hideAxisY(yAxisHistManufacturer);
    showAxis(xAxisHistFlight);
    showAxisY(yAxisHistFlight);

    g.selectAll('.barMa')
      //.transition()
      //.duration(0)
      .transition()
      .delay(function (d, i) { return 200 * (i + 1);})
      .duration(300)
      .attr('opacity', 0);

    g.selectAll('.barFl')
      .transition()
      .delay(function (d, i) { return 300 * (i + 1);})
      .duration(600)
      .attr('width', xHistScaleFlight.bandwidth())
      .attr('opacity', 1);      
  }



  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
  function showAxis(axis) {
    g.select('.x.axis')
      .call(axis)
      .transition().duration(500)
      .style('opacity', 1);
  }

  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select('.x.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }


  function showAxisY(axis) {
    g.select('.y.axis')
      .call(axis)
      .transition().duration(500)
      .style('opacity', 1);
  }

  function hideAxisY() {
    g.select('.y.axis')
      .transition().duration(500)
      .style('opacity', 0);
  }


  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getWords - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */
  function getWords(rawData) {
    //console.log(rawData);
    return rawData.map(function (d, i) {
      if (d.Injury_Severity === 'Non-Fatal') {
        d.Injury_Severity = '0';
      } else if (d.Injury_Severity === 'Incident' || d.Injury_Severity === 'Unavailable') {
        d.Injury_Severity = '2';
      } else {
        d.Injury_Severity = '1';
      }


      // is this word a Total_Serious_Injuries word?
      // d.Total_Serious_Injuries = (d.Total_Serious_Injuries === '1') ? true : false;
      // time in seconds word was spoken
      //d.time = +d.time;
      d.time = +d.Total_Fatal_Injuries;
      // time in minutes word was spoken
      d.min = Math.floor(d.time / 60);

      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (circleRadius + circlePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (circleRadius + circlePad);
      return d;
    });
  }

  /**
   * getFillerWords - returns array of
   * only Total_Serious_Injuries words
   *
   * @param data - word data from getWords
   */
  function getFillerWords(data) {
    return data.filter(function (d) {return d.Injury_Severity; });
    //return data.filter(function (d) {return d.Total_Serious_Injuries; });
  }


  /**
   * getFillerCountry - returns array of
   * only Country name
   *
   * @param data - word data from getWords
   */
  function getFillerCountry(data) {
    //return data.filter(function (d) {return d.Country; });
    return data.filter(function (d) { 
      if (d.value >= 30) {
        return true; 
      } else {
        return false;
      }
    });
  }

  /**
   * groupByCountry - group country name together
   * using group. Used to get counts for
   * histogram charts.
   *
   * @param words
   */
  function groupByCountry(words) {

    const groupedData = d3.group(words, d => d.Country);

    const result = Array.from(groupedData, ([key, value]) => ({ key, value: value.length }));

    return result.sort((a, b) => b.value - a.value);
  }


  /**
   * getFillerCarrier - returns array of
   * only Carrier name
   *
   * @param data - word data from getWords
   */
  function getFillerCarrier(data) {
    return data.filter(function (d) { 
      if (d.key != '' && d.key!= null && d.value >= 13) {
        return true; 
      } else {
        return false;
      }
    });
  }

  /**
   * groupByCarrier - group Carrier name together
   * using group. Used to get counts for
   * histogram charts.
   *
   * @param words
   */
  function groupByCarrier(words) {

    // const groupedData = d3.group(words, d => d.Air_Carrier);

    // const groupedData = d3.group(words, d => cleanUpCarrierName(d.Air_Carrier));

    const groupedData = d3.group(words, d => cleanUpCarrierName2(d.Air_Carrier));

    const result = Array.from(groupedData, ([key, value]) => ({ key, value: value.length }));

    return result.sort((a, b) => b.value - a.value);
  }

  function cleanUpCarrierName2(name) {
    if (name.toLowerCase().includes("delta")) {
      return "Delta";
    } else if (name.toLowerCase().includes("american")) {
      return "American";
    } else if (name.toLowerCase().includes("united")) {
      return "United";
    } else if (name.toLowerCase().includes("southwest")) {
      return "Southwest";
    } else if (name.toLowerCase().includes("continental")) {
      return "Continental";
    } else if (name.toLowerCase().includes("us air")) {
      return "US Airways";
    } else if (name.toLowerCase().includes("northwest")) {
      return "Northwest";
    } else if (name.toLowerCase().includes("fedex") || name.toLowerCase().includes("federal express")) {
      return "FedEx";
    } else if (name.toLowerCase().includes("america west")) {
      return "America West";
    } else if (name.toLowerCase().includes("alaska")) {
      return "Alaska";
    }
  }

  function cleanUpCarrierName(name) {
    // Perform any necessary cleaning or normalization of the carrier name
    //return name.toLowerCase().replace(/\binc\b/, '').trim();
    return name.toLowerCase()
        .replace(/[.,()]/g, '')           // Remove common punctuation
        .replace(/\binc\b/g, '')          // Remove the word "inc"
        .replace(/\bco\b/g, '')          // Remove the word "co"
        .replace(/\bdba\b/g, '')          // Remove the term "dba"
        .replace(/^:/, '')                // Remove leading colon
        //.replace(/:\s*/g, ' ')            // Replace colon with space
        //.replace(/"/g, '')              // Remove all double quotes
        //.replace(/"([^"]*)"/g, '$1')    // Remove double quotes around the entire string
        .replace(/\s+/g, ' ')             // Replace multiple spaces with a single space
        .replace(/\sair lines\b/g, ' airlines') // Replace "air lines" with "airlines"
        .replace(' : united airlines', '') // Replace "united airlines : united airlines" with "united airlines"
        .replace(' : delta airlines', '')
        .replace(' : american airlines', '')
        .replace(' : continental airlines', '')
        .replace(' : northwest airlines', '')
        .replace(' : southwest airlines', '')
        .replace(' : us airways', '')
        .replace(' : us air', '')
        .replace(' : america west airlines', '')
        .replace(' : america west', '')
        //.replace(' : FedEx', '')
        .replace('usair', 'us airways')
        .replace('us airways express', 'us airways')
        .replace('us airwaysways express', 'us airways')
        .replace(/\bus air\b/g, 'us airways')
        //.replace(/\bamerica west\b/g, 'America West')
        .replace('federal express corporation', 'FedEx')
        .replace('federal express corp', 'FedEx')
        .replace('federal express', 'FedEx')
        .replace('fedex', 'FedEx')
        .replace('FedEx express', 'FedEx')
        .replace('alaska air group : ', '')
        .replace('delta airlines', 'Delta')
        .replace('american airlines', 'American')
        .replace('united airlines', 'United')
        .replace('southwest airlines', 'Southwest')
        .replace('continental airlines', 'Continental')
        .replace('us airways', 'US Airways')
        .replace('northwest airlines', 'Northwest')
        .replace('america west airlines', 'America West')
        .replace('alaska airlines', 'Alaska')
        //.replace('atlas air', 'us airways') // atlas air might not be us airwaysways ===> question?
        .trim();
  }


  /**
   * groupByManufacturer - group Carrier name together
   * using group. Used to get counts for
   * histogram charts.
   *
   * @param words
   */
  function groupByManufacturer(words) {

    const groupedData = d3.group(words, d => d.Make);

    const result = Array.from(groupedData, ([key, value]) => ({ key, value: value.length }));

    //return result.sort((a, b) => b.value - a.value);
    return result;
  }


  /**
   * getFillerFlight - returns array of
   * only Flight Phase name
   *
   * @param data - word data from getWords
   */
  function getFillerFlight(data) {
    return data.filter(function (d) { 
      if (d.key != '') {
        return true; 
      } else {
        return false;
      }
    });
  }

  /**
   * groupByFlight - group Flight Phase name together
   * using group. Used to get counts for
   * histogram charts.
   *
   * @param words
   */
  function groupByFlight(words) {

    const groupedData = d3.group(words, d => d.Broad_Phase_of_Flight);

    const result = Array.from(groupedData, ([key, value]) => ({ key, value: value.length }));

    //return result.sort((a, b) => b.value - a.value);
    return result;
  }
  


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  //console.log(data);
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display
// d3.csv('incidents.csv', display);

d3.csv('incidents.csv', function(d){return d}).then(function(data){
  //console.log(data);
  display(data);
});
