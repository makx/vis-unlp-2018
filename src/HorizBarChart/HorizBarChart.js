import React from 'react'
import data from './sample.js'

import * as d3 from 'd3'
import { Col } from 'react-bootstrap';


export default class HorizBarChart extends React.Component {

  componentDidMount () {
    this.drawChart()
  }

  drawChart () {
    let data = this.props.purchasesByProduct.slice(0,14)
    let margin = ({top: 30, right: 0, bottom: 10, left: 30})
    let height = data.length * 25 + margin.top + margin.bottom
    let width = 600
    const svg = d3.select('.horizontal-bar-chart')
      .append('svg')
      .attr('height', height)
      .attr('width', width)

    let x = d3.scaleLinear()
      .domain([0, d3.max(data, d => parseFloat(d.value.income))])
      .range([margin.left, width - margin.right])

    let y = d3.scaleBand()
      .domain(data.map(d => d.key))
      .range([margin.top, height - margin.bottom])
      .padding(0.1)

    let xAxis = g => g
      .classed('x axis', true)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(width / 80))
      // .call(g => g.select(".domain").remove())

    let yAxis = g => g
      .classed('y axis', true)
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0))

    let format = d3.format(".3f")
    svg.append("g")
        .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .enter().append("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.key))
        .attr("width", d => x(parseFloat(d.value.income)) - x(0))
        .attr("height", y.bandwidth());

    svg.append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .style("font", "12px sans-serif")
      .selectAll("text")
      .data(data)
      .enter().append("text")
        .attr("x", d => x(parseFloat(d.value.income)) - 4)
        .attr("y", d => y(d.key) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", "4em")
        .attr('fill', '#000')
        .text(d => format(parseFloat(d.value.income)));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.select('.x.axis')
      .append('text')
      .attr('x',  width/2)
      .attr('y', 40)
      .attr('fill', '#000')
      .style('font-size', '18px')
      .style('text-anchor', 'middle')
      .text('Ventas (€)');

    svg.select('.y.axis')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('transform', `translate(-50, ${height/2}) rotate(-90)`)
      .attr('fill', '#000')
      .style('font-size', '18px')
      .style('text-anchor', 'middle')
      .text('Producto ID')

  }

  render () {
    return(
        <Col xs={12} sm={12} md={8}>
          <h2>Ventas por productos</h2>
          <div className='horizontal-bar-chart'></div>
        </Col>
    )
  }

}
