let globaldata = [];
var view_country = true;

var width = 780,
    height = 500,
    active = d3.select(null);

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);


var path = d3.geo.path()
    .projection(projection);

var svg = d3.select(".us_country_map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

var tooltip = d3.select(".us_country_map").append("div")
        // .attr("class", "tooltip")
        .style("position", "absolute")
        .style("color", "#783eff")
        .style("background", "white")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("font-family", "Sans-serif")
        .style("opacity", 0)

var deets_on_demand = d3.select(".us_country_map").append("div")
          .style("position", "absolute")
          .style("background", "white")
          .style("color", "#783eff")
          .style("border", "2px")
          .style("border-radius", "10px");

// var close_deets_on_demand = deets_on_demand.append("")

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");
var gPins = svg.append("g"); // new g element

svg
    //.call(zoom) // delete this line to disable free zooming
    .call(zoom.event);

d3.json("/sample/us.json", function(error, us) {
  if (error) throw error;

  g.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "feature")
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);
});

var already_drawn_dot = new Set(); //so that we don't keep drawing the same dot over itself
                          //this makes it so that lowering the opacity will allow us to actually
                          //see what's beneath the dot instead of the same dot

d3.csv("locations.csv", function(data) {
  data.forEach(function(d) {
    d["city-state"] = d.city + ", " + d.state;
    if (city_frequency[d["city-state"]]) {
      city_frequency[d["city-state"]] += 1;
    } else {
      city_frequency[d["city-state"]] = 1;
    }
    modified_data.push(d);
  });
  draw_circles(modified_data, city_frequency);
});

const get_data_by_city = (city) => {
  let city_data = [];
  modified_data.forEach((d) => {
    if (d["city-state"] === city) {
      city_data.push(d);
    }
  });
  return city_data;
}


const draw_circles = (data, city_frequency) => {
  already_drawn_dot = new Set();
  gPins.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r",function(d) {
      if (!already_drawn_dot.has(d["city-state"])) {
        already_drawn_dot.add(d["city-state"])
        return map_frequency_to_radius(d["city-state"], city_frequency)
      } else {
        return 0;
      }
    })
    .attr("transform", function(d) {return "translate(" + projection([d.longitude,d.latitude]) + ")";})
    .style("opacity", 0.65)
    .style("stroke", "white")
    .style("stroke-width", "0.5")
    .on("mouseover", function(d) {
      tooltip.transition()
      .duration(400)
      .style("opacity", 0.75);
      d3.select(this).style("cursor", "pointer");
      //fill the tooltip with the appropriate data
      tooltip.html("<strong>City: " + d["city-state"] + "</strong><br/>"
                  +"<strong>Shootings: " + city_frequency[d["city-state"]] + "</strong>")
      .style("left", (d3.event.pageX + 5) + "px")
      .style("top", (d3.event.pageY + 3) + "px")
      .style("z-index", 0);
    })
    .on("mouseout", function(d) {
      tooltip.transition()
      .duration(400)
      .style("opacity", 0)
      .style("z-index", -1);
    })
    .on("click", (d) => {
      tooltip.transition()
      .style("opacity", 0)
      .style("z-index", -1);

      let city_data = get_data_by_city(d["city-state"]);
      let html_string = "<table>";
      html_string += "<theader>"
                  + "<th>Date</th>"
                  + "<th>Name</th>"
                  + "<th>Race</th>"
                  + "<th>Gender</th>"
                  + "<th>Age</th>"
                  + "<th>Body Camera</th>"
                  + "</theader>"
      let i = 0;
      //todo handle NULL Race
      //todo convert 'true' and 'false' for body cam into yes and no
      //todo make the deets on demand scrollable
      //todo get rid of tk tk in name
      city_data.forEach((e) => {
        i++;
        let background = i % 2 ? 'yellow' : 'white'
        html_string += "<tr style='background: " + background + "'>"
                    + "<td>" + e.date + "</td>"
                    + "<td>" + e.name + "</td>"
                    + "<td>" + e.race + "</td>"
                    + "<td>" + e.gender + "</td>"
                    + "<td>" + e.age + "</td>"
                    + "<td>" + e.body_camera + "</td>"
                    + "</tr>"
      })
      html_string += "</table>"

      /**Add the details on demand**/
      deets_on_demand.html("<strong style='margin-left: 10px'>" + d["city-state"] + "</strong>"
                    + "<div style='display: inline-block; margin-right: 10px;"
                    + "position: relative; float: right; cursor: pointer;' onClick='closeDeetsOnDemand()'>"
                    + "X</div><br/>" + html_string)
      .style("left", (d3.event.pageX + 5) + "px")
      .style("top", (d3.event.pageY + 3) + "px")
      .style("z-index", 1)
      .style("opacity", 1);

    });
}


var map_frequency_to_radius = function(city, frequency) {
  return Math.sqrt(20 * frequency[city]/Math.PI)
}

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);

  view_country = !view_country;
  draw_circles(modified_data, city_frequency)
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  already_drawn_dot = new Set();
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  gPins.attr("transform","translate("+ d3.event.translate+")scale("+d3.event.scale+")");
  gPins.selectAll("circle").attr("r", (d) => {
    if (!already_drawn_dot.has(d["city-state"])) {
      already_drawn_dot.add(d["city-state"])
      return map_frequency_to_radius(d["city-state"], city_frequency) / d3.event.scale
    } else {
      return 0;
    }
 }).style("opacity", 0.65)
  .style("stroke", "white")
  .style("stroke-width", "0.5");
  closeDeetsOnDemand();
}

function closeDeetsOnDemand() {deets_on_demand.style("z-index", "-1").style("opacity", 0);}


// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

//------------------------------------------------------------------------------------------------------------//
function sunburstDraw(scope, element) {
  gl_scope = scope;
  gl_element = element;

  scope.$watch("data", function() {
    var data = scope.data;
    render(data);
  });

  var width = 500;
  var height = 300;
  var radius = Math.min(width, height) / 2;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
  var b = {
    w: 60,
    h: 30,
    s: 3,
    t: 10
  };

  // margins
  var margin = {
    top: radius,
    bottom: 50,
    left: radius,
    right: 0
  };

  // sunburst margins
  var sunburstMargin = {
    top: 2 * radius + b.h,
    bottom: 0,
    left: 0,
    right: radius / 2
  };

  var colors = d3.scale.category10();
  var totalSize = 0;

  var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) {
      return d.size;
    });

  var arc = d3.svg.arc()
    .startAngle(function(d) {
      return d.x;
    })
    .endAngle(function(d) {
      return d.x + d.dx;
    })
    .innerRadius(function(d) {
      return Math.sqrt(d.y);
    })
    .outerRadius(function(d) {
      return Math.sqrt(d.y + d.dy);
    });

  var vis = d3.select(element[0])
    .append("div").classed("vis-continer", true)
    .style("position", "relative")
    .style("margin-top", "20px")
    .style("margin-bottom", "20px")
    .style("left", "50px")
    .style("height", height + 2 * b.h + "px");

  // create and position SVG
  var sunburst = vis
    .append("div").classed("sunburst-container", true)
    .style("position", "absolute")
    .style("top", 40 + "px")
    .style("left", sunburstMargin.left + "px")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create and position breadcrumbs container and svg
  var breadcrumbs = vis
    .append("div").classed("breadcrumbs-container", true)
    .style("position", "absolute")
    .style("top", sunburstMargin.top - 350 + "px")
    .style("left", 20 + "px")
    .append("svg")
    .attr("width", width)
    .attr("height", b.h)
    .attr("fill", "white")
    .attr("font-weight", 600);

  // create last breadcrumb element
  var lastCrumb = breadcrumbs
    .append("text").classed("lastCrumb", true);

  drawBreadcrumbTemplate();

  // create and position summary container
  var summary = vis
    .append("div").classed("summary-container", true)
    .style("position", "absolute")
    .style("top", (radius * 0.80  + 50) + "px")
    .style("left", sunburstMargin.left + radius / 2 + 5 + "px")
    .style("width", radius + "px")
    .style("height", radius + "px")
    .style("text-align", "center")
    .style("font-size", "11px")
    .style("color", "#fff")
    .style("z-index", "-1");

  /**
   * Render process:
   *
   * 1) Load data
   * 2) Build Tree
   * 3) Draw visualization
   */
  // render visualization
  function render(data) {
    var parsedData = d3.csv.parseRows(data); // load data
    var json = buildHierarchy(parsedData); // build json tree
    removeVisualization(); // remove existing visualization if any
    createVisualization(json); // visualize json tree
  }

  /**
   * Helper functions:
   *
   * @function drawBreadcrumbTemplate(): draws the breadcrumb template
   * @function removeVisualization(): removes existing SVG components
   * @function createVisualization(json): create visualization from json tree structure
   * @function colorMap(d): color nodes with colors mapping
   * @function mouseover(d): mouseover function
   * @function mouseleave(d): mouseleave function
   * @function getAncestors(node): get ancestors of a specified node
   * @function buildHierarchy(data): generate json nested structure from csv data input
   */
  //draws breadcrumb templates
  function drawBreadcrumbTemplate() {
    var bc = 0;
    while (bc < 4) {
      temp_breadcrumb = breadcrumbs.append("g");

      if (bc > 0) {
        temp_breadcrumb
          .append("polygon").classed("breadcrumbs-shape", true)
          .attr("points", templatebreadCPoints)
          .attr("fill", "#fff")
          .attr("opacity", 0.8);

      } else {
        temp_breadcrumb
          .append("polygon").classed("breadcrumbs-shape", true)
          .attr("points", breadcrumbPoints)
          .attr("fill", "#fff")
          .attr("opacity", 0.8);
      }


      temp_breadcrumb
        .append("text").classed("breadcrumbs-text", true)
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("font-size", "10px")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text(function() {
          if (bc === 0) { return "gender"; }
          if (bc === 1) { return "race"; }
          if (bc === 2) { return "age"; }
          return "body cam"
        });

      temp_breadcrumb.attr("transform", "translate(" + 63 * bc + ",0)");

      bc++
    }

    lastCrumb
      .attr("x", 4.6 * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-weight", 600)
      .text("Hover");
  }

  // removes existing SVG components
  function removeVisualization() {
    sunburst.selectAll(".nodePath").remove();
  }

  // visualize json tree structure
  function createVisualization(json) {
    drawSunburst(json); // draw sunburst
  };


  // helper function colorMap - color gray if "end" is detected
  function colorMap(d) {
    return colors(d.name);
  }


  // helper function to draw the sunburst and breadcrumbs
  function drawSunburst(json) {
    // Build only nodes of a threshold "visible" sizes to improve efficiency
    var nodes = partition.nodes(json)
      .filter(function(d) {
        return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

    // this section is required to update the colors.domain() every time the data updates
    var uniqueNames = (function(a) {
      var output = [];
      a.forEach(function(d) {
        if (output.indexOf(d.name) === -1) output.push(d.name);
      });
      return output;
    })(nodes);
    colors.domain(uniqueNames); // update domain colors

    // create path based on nodes
    var path = sunburst.data([json]).selectAll("path")
      .data(nodes).enter()
      .append("path").classed("nodePath", true)
      .attr("display", function(d) {
        return d.depth ? null : "none";
      })
      .attr("d", arc)
      .attr("fill", colorMap)
      .attr("opacity", 1)
      .attr("stroke", "white")
      .on("mouseover", mouseover);


    // // trigger mouse click over sunburst to reset visualization summary
    vis.on("click", click);

    // Update totalSize of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;
  }

  // helper function mouseover to handle mouseover events/animations and calculation of ancestor nodes etc
  function mouseover(d) {
    // build percentage string
    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if (percentage < 1) {
      percentageString = "< 1.0%";
    }

    var rawNumString = d.value + "";

    // update breadcrumbs (get all ancestors)
    var ancestors = getAncestors(d);
    updateBreadcrumbs(ancestors, rawNumString);

    // update sunburst (Fade all the segments and highlight only ancestors of current segment)
    sunburst.selectAll("path")
      .attr("opacity", 0.3);
    sunburst.selectAll("path")
      .filter(function(node) {
        return (ancestors.indexOf(node) >= 0);
      })
      .attr("opacity", 1);

    // update summary
    summary.html(
      "<span class='percentage'>" + percentageString + "</span><br />"
      // + d.value + " of " + totalSize + "<br />"
    );

    // display summary and breadcrumbs if hidden
    summary.style("visibility", "");
    breadcrumbs.style("visibility", "");
  }

  // helper function click to handle mouseleave events/animations
  function click(d) {
    //after clicked on, keep normal. When mouse scrolls away from chart, then reset?

    sunburst.selectAll("path").on("mouseover", null);
    sunburst.selectAll("path")
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .each("end", function() {
        d3.select(this).on("mouseover", mouseover);
      });

    var checkboxes = breadcrumbs.selectAll(".newData")[0];
    var num_factors = checkboxes.length;

    uncheckAll();
    while (num_factors > 0) {
      console.log("ask toggle")
      var factor = checkboxes[num_factors - 1].textContent.trim() + "_id";
      document.getElementById(factor).checked = true;
      sunburstToggle(document.getElementById(factor));
      num_factors--;
    }

    filterUpdate();

    // hide summary and breadcrumbs if visible
    breadcrumbs.selectAll(".newData").remove();
    summary.style("visibility", "hidden");

    //redraw template
    drawBreadcrumbTemplate();
  }

  // Return array of ancestors of nodes, highest first, but excluding the root.
  function getAncestors(node) {
    var path = [];
    var current = node;

    while (current.parent) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

  // Generate a string representation for drawing a breadcrumb polygon.
  function templatebreadCPoints(d) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    points.push(b.t + "," + (b.h / 2));
    points.push(b.t + "," + (b.h / 2));
    return points.join(" ");
  }

  // Generate a string representation for drawing a breadcrumb polygon.
  function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);

    if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
      points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
  }

  // Update the breadcrumb breadcrumbs to show the current sequence and percentage.
  function updateBreadcrumbs(ancestors, rawNumString) {
    // Data join, where primary key = name + depth.
    var g = breadcrumbs.selectAll(".newData")
      .data(ancestors, function(d) {
        return d.name + d.depth;
      });

    // Add breadcrumb and label for entering nodes.
    var breadcrumb = g.enter().append("g").attr("class", "newData");;

    breadcrumb
      .append("polygon").classed("breadcrumbs-shape", true)
      .attr("points", breadcrumbPoints)
      .attr("fill", colorMap);

    breadcrumb
      .append("text").classed("breadcrumbs-text", true)
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .text(function(d) {
        return d.name;
      });

    // Set position for entering and updating nodes.
    g.attr("transform", function(d, i) {
      return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Remove exiting nodes.
    g.exit().remove();
    //redraw the template

    // Update percentage at the lastCrumb.
    lastCrumb
      .attr("x", 4.6 * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-weight", 600)
      .text(rawNumString);
  }

  // Take a 4-column CSV of ["sequence", "stage", "node", "value"] and
  // transform it into a hierarchical structure suitable for a partition layout.
  function buildHierarchy(csv) {
    var data = csv2json(csv); // build JSON dataframe from csv using helper function

    // build tree
    var root = {
      name: "root",
      children: []
    };

    data.forEach(function(d) {
      var nodes = d.nodes;
      var size = parseInt(d.size);

      // build graph, nodes, and child nodes
      var currentNode = root;
      for (var j = 0; j < nodes.length; j++) {
        var children = currentNode.children;
        var nodeName = nodes[j];
        var childNode;

        if (j + 1 < nodes.length) {
          // Not yet at the end of the sequence; move down the tree.
          var foundChild = false;
          for (var k = 0; k < children.length; k++) {
            if (children[k].name == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }
          if (!foundChild) { // If we don't already have a child node for this branch, create it.
            childNode = {
              name: nodeName,
              children: []
            };
            children.push(childNode);
          }
          currentNode = childNode;
        } else { // Reached the end of the sequence; create a leaf node.
          childNode = {
            name: nodeName,
            size: size
          };
          children.push(childNode);
        }
      }
    });
    return root;
  }

  // helper function to buildHierarchy to transform 4-column CSV into a JSON dataframe.
  function csv2json(csv) {
    var data = [];
    var sequences = [];

    // sort the dataframe ascending by sequence (d[0]) then by stage (d[1])
    csv.sort(function(a, b) {
      if (a[2] === b[2]) {
        return d3.ascending(a[0], b[0]);
      }
      return d3.ascending(a[1], b[1]);
    });
    csv.forEach(function(record) {
      var sequence = record[0];
      if (sequences.indexOf(sequence) < 0) sequences.push(sequence);
    });

    sequences.forEach(function(sequence) {
      var d = {
        nodes: [],
        size: 0
      };
      csv.forEach(function(record) {
        var node = record[2];
        var size = record[3];
        if (sequence === record[0]) {
          d.nodes.push(node);
          d.size = size;
        }
      });
      data.push(d);
    });
    return data;
  }
}

//------------------------------------------------------------------------------------------------------------//

var modified_data = [];
var city_frequency = {};
raceFiltered_data = new Set();
genFiltered_data = new Set();
camFiltered_data = new Set();
ageFiltered_data = new Set();
allFiltered_data = new Set();
var filters = document.getElementsByClassName("checkbox");

// checkboxes
function toggleCheckbox(element) {
  var check_node = d3.select(element).node();
  var parent_node = check_node.parentNode;

  if(element.checked) {
    d3.select(parent_node).classed("active", true);
  } else {
    d3.select(parent_node).classed("active", false);
  }
  filterUpdate();
}


function sunburstToggle(element) {
  var check_node = d3.select(element).node();
  var parent_node = check_node.parentNode;

  if(element.checked) {
    d3.select(parent_node).classed("active", true);
  } else {
    d3.select(parent_node).classed("active", false);
  }
}

// function checkDuplicate(parent) {
//   var category = parent.parentNode;
//   var checks = category.getElementsByClassName("checkbox");
//   var restart_sunburst = false;
//   var already_checked = false;

//   for (element_id in checks) {
//     try {
//       var ele = document.getElementById(element_id).checked;
//       if (ele) { if (already_checked) {
//           restartSunburst();
//         } else {
//           already_checked = true;
//         }
//       }
//     } catch (e) {}
//   }
// }

function uncheckAll() {
  var filters = document.getElementsByClassName("checkbox");
  for (element_id in filters) {
    try {
      var element = document.getElementById(element_id);
      element.checked = false;
      sunburstToggle(element);
    } catch (e) {}

  }
}

function checkAll(category) {
  var filters = document.getElementsByClassName(category);
  for (element_id in filters) {
    try {
      var element = document.getElementById(element_id);
      element.checked = false;
      sunburstToggle(element);
    } catch (e) {}

  }
}

//method to update map based on user selected filters
function filterUpdate() {
  modified_data = [];
  city_frequency = {};
  gPins.selectAll("circle").remove();

    d3.csv("locations.csv", function(data) {

      data.forEach(function(d) {
        for(i = 0; i < filters.length; i++ ) {
          if(filters[i].name == "race") {
            if(filters[i].value == d[filters[i].name] && filters[i].checked == true) {
              raceFiltered_data.add(d);
            }
          }
          if(filters[i].name == "gender") {
            if(filters[i].value == d[filters[i].name] && filters[i].checked == true) {
              genFiltered_data.add(d);
            }
          }
          if(filters[i].name == "body_camera") {
            if(filters[i].value == d[filters[i].name] && filters[i].checked == true) {
              camFiltered_data.add(d);
            }
          }
          if(filters[i].name == "age") {
            if(filters[i].value == "Youth" && filters[i].checked == true) {
              var age = +d["age"];
              if(1 <= age && age <= 19) {
                ageFiltered_data.add(d);
              }
            } else if(filters[i].value == "Twenties" && filters[i].checked == true) {
              var age = +d["age"];
              if(20 <= age && age <= 29) {
                ageFiltered_data.add(d);
              }
            } else if(filters[i].value == "Thirties" && filters[i].checked == true) {
              var age = +d["age"];
              if(30 <= age && age <= 39) {
                ageFiltered_data.add(d);
              }
            } else if(filters[i].value == "Forties" && filters[i].checked == true) {
              var age = +d["age"];
              if(40 <= age && age <= 49) {
                ageFiltered_data.add(d);
              }
            } else if(filters[i].value == "Fifties" && filters[i].checked == true) {
              var age = +d["age"];
              if(50 <= age && age <= 59) {
                ageFiltered_data.add(d);
              }
            } else if(filters[i].value == "Elderly" && filters[i].checked == true) {
              var age = +d["age"];
              if(age >= 60) {
                ageFiltered_data.add(d);
              }
            }
          }
        }
      })
      //checks each bucket to verify data point belongs in filter when there are multiple
      data.forEach(function(d) {
        if((raceFiltered_data.has(d) || raceFiltered_data.size == 0)
        && (genFiltered_data.has(d) || genFiltered_data.size == 0)
        && (camFiltered_data.has(d) || camFiltered_data.size == 0)
        && (ageFiltered_data.has(d) || ageFiltered_data.size == 0)) {
          allFiltered_data.add(d);
        }
      })
      allFiltered_data.forEach(function(d) {
      d["city-state"] = d.city + ", " + d.state;
      if (city_frequency[d["city-state"]]) {
        city_frequency[d["city-state"]] += 1;
      } else {
        city_frequency[d["city-state"]] = 1;
      }
      modified_data.push(d);
    });
    draw_circles(modified_data, city_frequency);
  });
}