import React from 'react'
import ReactDOM from "react-dom";
import * as d3 from 'd3'
import { Col } from 'react-bootstrap';
import { uniqueId } from 'lodash'

export default class HorizonChart extends React.Component {

    constructor() {
        super();
        this.state = { data: [] };
    }


    componentWillReceiveProps(nextProps) {
        console.log('receive props ', nextProps, this.props)
        // if(nextProps.data.length != this.props.data.length) {
            d3.select(".horizon-chart > *").remove()
            this.loadGraph(nextProps.data)
        // }
    }

    componentWillMount () {
        this.loadGraph(this.props.data)
    }

    loadGraph(data) {
        var purchases = data
        purchases = purchases.map(item => { return {name: item.product_id, date: roundToHour(new Date(item.date_add)).getTime(), value: parseFloat(item.total_paid)}})
        const dates = d3.nest()
            .key(d => d.date)
            .entries(purchases)
            .map(d => {
                return d.key
            })
            .sort(d3.ascending)
    

        const values = d3.nest()
            .key(d => d.name)
            .key(d => d.date)
            .rollup(v => v[0].value)
            .map(purchases)

        const sums = d3.nest()
            .key(d => d.name)
            .rollup(v => d3.sum(v, d => d.value))
            .map(purchases)

        this.setState({
            data: {
                series: values.entries()
                    .sort((a, b) => sums.get(b.key) - sums.get(a.key))
                    .map(({key, value}) => ({
                        name: key,
                        values: dates.map(d => {
                            return value.get(+d)? value.get(+d) : 0
                        })
                    })),
                dates
                }
        }, () => this.drawChart(this.state.data))
    }

    render () {
        this.drawChart(this.state.data)
        return (
            <Col xs={12} sm={12} md={12}>
                <h2>Ventas en el tiempo</h2>
                <div className='horizon-chart'>
                </div>
            </Col>
        )
    }

    drawChart(data){
        const scheme = "schemeRdPu";
        const overlap = 5;
        const step = 23;
        const color = i => d3[scheme][Math.max(3, overlap)][i + Math.max(0, 3 - overlap)]
        const margin = ({top: 30, right: 10, bottom: 0, left: 10})
        const width = 964;
        // const height = data.series.length * (step) + margin.top + margin.bottom
        const height = 'auto'

        let x = d3.scaleUtc()
            .domain(d3.extent(data.dates))
            .range([0, width]);

        let y = d3.scaleLinear()
            .domain([0, d3.max(data.series, d => d3.max(d.values))])
            .range([0, -overlap * step]);

        let area = d3.area()
            .curve(d3.curveBasis)
            .defined(d => !isNaN(d))
            .x((d, i) => x(data.dates[i]))
            .y0(0)
            .y1(d => y(d));

        const svg = d3.select(".horizon-chart")
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', '0,0,964,942')
            .style("font", "10px sans-serif");

        const g = svg.append("g")
            .selectAll("g")
            .data(data.series)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0,${i * (step + 1) + margin.top})`);

        g.append("clipPath")
            .attr("id", d => (d.clip = uniqueId("clip")))
            .append("rect")
            .attr("width", width)
            .attr("height", step);

        g.append("defs").append("path")
            .attr("id", d => (d.path = uniqueId("path")))
            .attr("d", d => area(d.values));
            //.attr("fake", d => console.log(d.values));

        g.append("g")
            .attr("clip-path", d => 'url('+window.location.origin+'/#' + d.clip + ')')
            .selectAll("use")
            .data(d => new Array(overlap).fill(d))
            .enter().append("use")
            .attr("fill", (d, i) => color(i))
            .attr("transform", (d, i) => `translate(0,${(i + 1) * step})`)
            .attr("xlink:xlink:href", d => window.location.origin+'/#'+ d.path);

        g.append("text")
            .attr("x", 4)
            .attr("y", step / 2)
            .attr("dy", "0.35em")
            .text(d => d.name);

        let xAxis = g => g
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(x).ticks(width / 80).tickSizeOuter(0))
            .call(g => g.selectAll(".tick").filter(d => x(d) < margin.left || x(d) >= width - margin.right).remove())
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .call(xAxis);

        return svg.node();
    }
}

function roundToHour(date) {
    let p = 60 * 60 * 1000; // milliseconds in an hour
    return new Date(Math.round(date.getTime() / p ) * p);
  }
  
