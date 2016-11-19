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
        .attr("class", "tooltip")
        .style("opacity", 1)


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
  var city_frequency = {};
  data.forEach(function(d) {
    d["city-state"] = d.city + ", " + d.state;
    if (city_frequency[d["city-state"]]) {
      city_frequency[d["city-state"]] += 1;
    } else {
      city_frequency[d["city-state"]] = 1;
    }
  });

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
    .on("mouseover", function(d) {

      tooltip.transition()
      .duration(200)
      .style("opacity", 75);

      //fill the tooltip with the appropriate data
      tooltip.html("<strong>" + d["city-state"] + "</strong>")
      .style("left", (d3.event.pageX + 2) + "px")
      .style("top", (d3.event.pageY + 2) + "px");
      // console.log(d3.event.pageX)
    })
    .on("mouseout", function(d) {
      tooltip.transition()
      .duration(200)
      .style("opacity", 0);
    });
});

var map_frequency_to_radius = function(city, frequency) {
  // console.log(frequency[city])

  return frequency[city];
}

// d3.csv("locations.csv", function(data) {
//   svg.selectAll("circle")
//   .data(data)
//   .enter()
//   .append("circle")
//   .attr("cx", function(d) {
//     return projection([d.longitude, d.latitude])[0];
//   })
//   .attr("cy", function(d) {
//     return projection([d.longitude, d.latitude])[1];
//   })
//   .attr("r", function(d) {
//     return 4;
//   })
//     .style("fill", "rgb(217,91,67)")
//     .style("opacity", 0.85)
// });

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
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  gPins.attr("transform","translate("+ d3.event.translate+")scale("+d3.event.scale+")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

//------------------------------------------------------------------------------------------------------------//


var sun_width = 430,
    sun_height = 380,
    sun_radius = 180;

var color = d3.scale.category20c();

var partition = d3.layout.partition()
    .size([2 * Math.PI, sun_radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return d.y; })
    .outerRadius(function(d) { return d.y + d.dy; });

var sun_svg = d3.select(".sunburst").append("svg")
    .attr("width", sun_width)
    .attr("height", sun_height)
  .append("g")
    .attr("transform", "translate(" + sun_width / 2 + "," + sun_height / 2 + ")");

d3.json("/sample/readme.json", function(error, root) {
  if (error) throw error;

  sun_path = sun_svg.data([root]).selectAll("sun_path")
      .data(partition.nodes)
    .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      .on("click", magnify)
      .each(stash);
});

// Distort the specified node to 80% of its parent.
function magnify(node) {
  if (parent = node.parent) {
    var parent,
        x = parent.x,
        k = .8;
    parent.children.forEach(function(sibling) {
      x += reposition(sibling, x, sibling === node
          ? parent.dx * k / node.value
          : parent.dx * (1 - k) / (parent.value - node.value));
    });
  } else {
    reposition(node, 0, node.dx / node.value);
  }

  sun_path.transition()
      .duration(750)
      .attrTween("d", arcTween);
}

// Recursively reposition the node at position x with scale k.
function reposition(node, x, k) {
  node.x = x;
  if (node.children && (n = node.children.length)) {
    var i = -1, n;
    while (++i < n) x += reposition(node.children[i], x, k);
  }
  return node.dx = node.value * k;
}

// Stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  return function(t) {
    var b = i(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  };
}


//------------------------------------------------------------------------------------------------------------//

// checkboxes
function toggleCheckbox(element) {
  var check_node = d3.select(element).node();
  parent_node = check_node.parentNode;

  if(element.checked) {
    d3.select(parent_node).classed("active", true);
  } else {
    d3.select(parent_node).classed("active", false);
  }
}
