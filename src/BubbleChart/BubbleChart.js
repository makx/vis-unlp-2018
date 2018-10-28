import React from 'react'
import data from './sample.js'

import * as d3 from 'd3'


export default class HorizBarChart extends React.Component {

  componentDidMount () {
    this.drawChart()
  }

  drawChart () {
    let width = 932
    let height = width
    let format = d3.format(",d")ç
    let color = d3.scaleOrdinal().range(d3.schemeCategory10)
    var data = d3.hierarchy(await require("@observablehq/flare"))
      .leaves()
      .map(d => {
        let p = d;
        while (p.depth > 1) p = p.parent;
        d.data.title = d.ancestors().reverse().map(a => a.data.name).join("/");
        d.data.group = p.data.name;
        return d;
      })
      .map(d => d.data)
      .sort((a, b) => a.group.localeCompare(b.group))
      .map(({name, title, group, size}) => ({name, title, group, value: size}))


    var pack = data => d3.pack()
      .size([width - 2, height - 2])
      .padding(3)
    (d3.hierarchy({children: data})
      .sum(d => d.value))

    const root = pack(data)
  
    const svg = d3.select(DOM.svg(width, height))
        .style("width", "100%")
        .style("height", "auto")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");
  
    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
        .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);
  
    leaf.append("circle")
        .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
        .attr("r", d => d.r)
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.data.group));
  
    leaf.append("clipPath")
        .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
      .append("use")
        .attr("xlink:href", d => d.leafUid.href);
  
    leaf.append("text")
        .attr("clip-path", d => d.clipUid)
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter().append("tspan")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
        .text(d => d);
  
    leaf.append("title")
        .text(d => `${d.data.title}\n${format(d.value)}`);
      
    return svg.node();
  }

  render () {
    return <div className='horizontal-bar-chart'></div>
  }
}