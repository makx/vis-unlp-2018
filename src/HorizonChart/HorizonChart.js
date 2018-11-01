import React from 'react'
import ReactDOM from "react-dom";
import * as d3 from 'd3'
import { Col } from 'react-bootstrap';
import { uniqueId } from 'lodash'

export default class HorizonChart extends React.Component {

    constructor() {
        super();
        this.state = { data: null };
    }

    componentWillMount () {
        var purchases = [];

        d3.csv(
            './time.csv',
            function (data) {},
            function (row) {
                purchases.push({name: row.name, date: row.date * 1000, value: +row.total_1 + +row.total_2 })
            }
        ).then((rows) => {
            //var format = d3.timeFormat("%Y-%m-%dT%H:%M");
            const dates = d3.nest()
                .key(d => d.date)
                .entries(purchases)
                //.map(d => format(new Date(+d.key)))
                .map(d => +d.key)
                .sort(d3.ascending);

            const values = d3.nest()
                .key(d => d.name)
                .key(d => d.date)
                .rollup(v => v[0].value)
                .map(purchases);

            const sums = d3.nest()
                .key(d => d.name)
                .rollup(v => d3.sum(v, d => d.value))
                .map(purchases);

                //console.log(values.entries());
            this.setState({
                data: {
                    series: values.entries()
                        .sort((a, b) => sums.get(b.key) - sums.get(a.key))
                        .map(({key, value}) => ({
                            name: key,
                            values: dates.map(d => value.get(+d))
                        })),
                    dates
                  }
            })

            this.drawChart(this.state.data);
        })
    }

    render () {
        return (
            <Col xs={12} sm={12} md={12}>
            <h2>Ventas en el tiempo</h2>
            <div className='horizon-chart'>
            </div>
            </Col>
        )
    }

    drawChart(data){

        console.log('ladata', data);

        const scheme = "schemePuRd";
        const overlap = 7;
        const step = 23;
        const color = i => d3[scheme][Math.max(3, overlap)][i + Math.max(0, 3 - overlap)]
        const margin = ({top: 30, right: 10, bottom: 0, left: 10})
        const width = 964;
        const height = data.series.length * (step + 1) + margin.top + margin.bottom

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
            .attr("clip-path", d => 'url(http://localhost:3000/#' + d.clip + ')')
            .selectAll("use")
            .data(d => new Array(overlap).fill(d))
            .enter().append("use")
            .attr("fill", (d, i) => color(i))
            .attr("transform", (d, i) => `translate(0,${(i + 1) * step})`)
            .attr("xlink:xlink:href", d => 'http://localhost:3000/#'+ d.path);

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
