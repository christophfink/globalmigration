/*
 * globalmigration
 * https://github.com/null2/globalmigration
 *
 * Copyright (c) 2013 null2 GmbH Berlin
 * Licensed under the MIT license.
 */

(function() {
  var datafile = 'migrations.json';

  var width = 960,
      height = 960,
      outerRadius = Math.min(width, height) / 2 - 10,
      innerRadius = outerRadius - 24;

  var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  var layout = d3.layout.chord()
      .padding(0.004)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

  var path = d3.svg.chord()
      .radius(innerRadius);

  var form = d3.select("body").append("form");

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("id", "circle")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.append("circle")
      .attr("r", outerRadius);

  function draw(countries, matrix) {
    // Compute the chord layout.
    layout.matrix(matrix);

    // Add a group per neighborhood.
    var group = svg.selectAll(".group")
      .data(layout.groups);
    group.enter()
      .append("g")
      .attr("class", "group");
    group
      .on("mouseover", function(d, i) {
        chord.classed("fade", function(p) {
          return p.source.index !== i && p.target.index !== i;
        });
      });
    group.exit().remove();

    // Add a mouseover title.
    var title = group.selectAll('title')
      .data(function(d, i) { return [countries[i]]; });
    title.enter()
      .append('title');
    title
      .text(function(d) { return d; });
    title.exit().remove();

    // Add the group arc.
    var groupPath = group.selectAll('.group-arc')
      .data(function(d) { return [d]; });
    groupPath.enter()
      .append('path')
      .attr("class", "group-arc")
      .attr("id", function(d, i, k) { return "group" + k; })
      .style("fill", '#dd0000');
    groupPath
      .attr("d", arc);
    groupPath.exit().remove();

    // Add a text label.
    var groupText = group.selectAll('text')
      .data(function(d) { return [d]; });
    groupText.enter()
      .append("text")
      .attr("x", 6)
      .attr("dy", 15)
      .append("textPath")
        .attr("xlink:href", function(d, i, k) { return "#group" + k; })
        .text(function(d, i, k) { return countries[k]; });
    groupText.exit().remove();

    // Remove the labels that don't fit. :(
    // FIXME
    groupText
      .filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 25 < this.getComputedTextLength(); })
      .remove();

    // Add the chords.
    var chord = svg.selectAll(".chord")
        .data(layout.chords);
    chord.enter()
      .append("path")
      .attr("class", "chord")
      .style("fill", '#ff0000');
    chord
      .attr("d", path)
      .append("title").text(function(d) { return countries[d.source.index]; });
    chord.exit().remove();
  }

  d3.json(datafile, function(data) {
    var scope = 'regions';
    draw(data[scope], data.years[1990][scope]);

    form.selectAll('label.year')
      .data(Object.keys(data.years))
      .enter()
      .append('label')
      .classed('year', true)
      .html(function(d) { return d + ' '; })
        .append('input')
        .attr({
          name: 'year',
          type: 'radio',
          value: function(d) { return d; },
          checked: function(d, i) { return i === 0 || null; }
        })
        .on('click', function(d) {
          draw(data[scope], data.years[d][scope]);
        });
  });

})();
