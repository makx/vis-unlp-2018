import React from 'react'
import * as d3 from 'd3'

export default class TreeChart extends React.Component {
  componentDidMount () {
    this.drawChart()
  }
  drawChart () {
    var vWidth = 300;
    var vHeight = 200;
    const g = d3.select('.tree-chart').attr('width', vWidth).attr('height', vHeight);

    // Get the data from our CSV fileç
    d3.dsv(",", "data.csv", function(d) {
      return d;
    }).then((data) => {
      let vData = d3.stratify()(data);
      this.plot(vData, g);
    });
  }

  plot (vData, g) {
      var vWidth = 300;
      var vHeight = 200;
      // Declare d3 layout
      var vLayout = d3.treemap().size([vWidth, vHeight]).paddingOuter(5);

      // Layout + Data
      var vRoot = d3.hierarchy(vData).sum(function (d) { return d.data.size; });
      var vNodes = vRoot.descendants();
      vLayout(vRoot);
      var vSlices = g.selectAll('rect').data(vNodes).enter().append('rect');

      // Draw on screen
      vSlices.attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0; })
          .attr('height', function (d) { return d.y1 - d.y0; });    
  }
    
  render() {
        
    return (
      <svg className='tree-chart'>
      </svg>
    )
  }
  
}


