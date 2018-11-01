import React, {Component} from 'react'
import './App.css'

/* D3 */
import * as d3 from 'd3'
import MapSpain from './Map/Map.js'
import BarChart from './Barchart/Barchart.js'
import Controls from './Controls/Controls.js'
import HorizBarChart from './HorizBarChart/HorizBarChart.js'
import HorizonChart from './HorizonChart/HorizonChart.js'

/* BOOTSTRAP */
import { Grid,Row } from 'react-bootstrap';

/* ICONS */
import { FaChartBar } from 'react-icons/fa'

class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      updating: false,
      rawData: [],
      data: [],
      manufacturers: [],
      currentManufacturer: null,
      products: [],
      currentProduct: null,
      purchasesByManufacturer: [],
      purchasesByProduct: []
    }
  }

  componentWillMount () {
    var purchases = []
    d3.tsv(
        './pedidosCordenados.tsv',
        function (data) {},
        function (row) { purchases.push(row)}
    ).then((rows) => {
      let purchasesByManufacturer = this.getPurchasesByManufacturer(purchases).sort((a, b) => {
        return b.value.income - a.value.income
      })
      // let purchasesByProduct = this.getPurchasesByProduct(purchases).sort((a, b) => {
      //   return b.value.income - a.value.income
      // })
      this.setState({
        rawData: purchases,
        data: purchases,
        purchasesByManufacturer: purchasesByManufacturer,
        // purchasesByProduct: purchasesByProduct
      })
    })
  }

  componentWillUpdate (nextProps, nextState) {
    console.log('se dispara el will update')
  }

  filterItemsByManufacturer (option) {
    let id_manufacturer = parseInt(option)
    const data = this.filterData(option, this.state.currentProduct)
    let purchasesByManufacturer = this.getPurchasesByManufacturer(data).sort((a, b) => {
      return b.value.income - a.value.income
    })
    let purchasesByProduct = this.getPurchasesByProduct(data).sort((a, b) => {
      return b.value.income - a.value.income
    })
    this.setState({
      data: data,
      currentManufacturer: id_manufacturer,
      purchasesByManufacturer,
      purchasesByProduct
    })
  }

  filterItemsByProduct (option) {
    let product_id = parseInt(option)
    const data = this.filterData(this.state.currentManufacturer, option)
    let purchasesByManufacturer = this.getPurchasesByManufacturer(data).sort((a, b) => {
      return b.value.income - a.value.income
    })
    let purchasesByProduct = this.getPurchasesByProduct(data).sort((a, b) => {
      return b.value.income - a.value.income
    })
    this.setState({
      data: data,
      currentProduct: product_id,
      purchasesByManufacturer,
      purchasesByProduct
    })
  }

  filterData (id_manufacturer, product_id) {
    let data = JSON.parse(JSON.stringify(this.state.rawData))
    // let product_id
    // let id_manufacturer
    // if (optionName == 'product') {
    //   product_id = option
    //   id_manufacturer = this.state.currentManufacturer
    // } else {
    //   product_id = this.state.currentProduct
    //   id_manufacturer = option
    // }
    return data.filter(item => {
      if(product_id && id_manufacturer) {
        return (item.id_manufacturer == id_manufacturer) && (item.product_id == product_id)
      } else if (!id_manufacturer && product_id) {
        return (item.product_id == product_id)
      } else if (!product_id && id_manufacturer) {
        return (item.id_manufacturer == id_manufacturer)
      } else {
        return true
      }
    })
  }

  clearData () {
    this.setState({
      data
    })
  }

  clearOptionManufacturer () {
    location.reload()
    // const data = this.filterData(null, this.state.currentProduct)
    // let purchasesByManufacturer = this.getPurchasesByManufacturer(data).sort((a, b) => {
    //   return b.value.income - a.value.income
    // })
    // let purchasesByProduct = this.getPurchasesByProduct(data).sort((a, b) => {
    //   return b.value.income - a.value.income
    // })
    // let purchasesByProduct = []
    // this.setState({
    //   currentManufacturer: null,
    //   data,
    //   purchasesByManufacturer,
    //   purchasesByProduct
    // })
  }

  clearOptionProduct () {//DEPRECATED
    // let data = JSON.parse(JSON.stringify(this.state.rawData))
    const data = this.filterData(this.state.currentManufacturer, null)
    let purchasesByManufacturer = this.getPurchasesByManufacturer(data).sort((a, b) => {
      return b.value.income - a.value.income
    })

    let purchasesByProduct = this.getPurchasesByProduct(data).sort((a, b) => {
      return b.value.income - a.value.income
    })
    this.setState({
      currentProduct: null,
      data,
      purchasesByManufacturer,
      purchasesByProduct
    })
  }

  getPurchasesByManufacturer (data) {
    return d3.nest()
      .key(function(d) { return d.id_manufacturer; })
      .rollup(function(rows) { return {"length": rows.length, "income": d3.sum(rows, function(d) {return parseFloat(d.total_paid);})} })
      .entries(data);
  }

  getPurchasesByProduct (data) {
    return d3.nest()
      .key(function(d) { return d.product_id; })
      .rollup(function(rows) { return {"length": d3.sum(rows, function(d) {return parseFloat(d.product_quantity);}) , "income": d3.sum(rows, function(d) {return parseFloat(d.total_paid);})} })
      .entries(data)
  }

  getPurchasesByCity () {
    return d3.nest()
      .key(function(d) { return d.city})
      .rollup(function(rows) { return {"length": d3.sum(rows, function(d) {return parseFloat(d.product_quantity)}, )}})
  }

  render() {
    const {
      data,
      currentManufacturer,
      currentProduct,
      updating,
      purchasesByManufacturer,
      purchasesByProduct
    } = this.state

    const products = purchasesByProduct.map(item => item.key)
    const manufacturers = purchasesByManufacturer.map(item => item.key)
    console.log('el current manufacturer ', currentManufacturer)

    return <div className="App">
      <div className="App-instructions">
        <div className='header'>
          <h3 className="pull-left"><FaChartBar /> Dashboard de Ventas</h3>
          <Controls
            manufacturers={manufacturers}
            currentManufacturer={currentManufacturer}
            products={products}
            currentProduct={currentProduct}
            onSelect={this.filterItemsByManufacturer.bind(this)}
            onSelectProduct={this.filterItemsByProduct.bind(this)}
            clearProduct={this.clearOptionProduct.bind(this)}
            clearManufacturer={this.clearOptionManufacturer.bind(this)}
            />
        </div>
      </div>
      <div className="App-content">
        {!updating &&
        <Grid className="container-fluid">
        <Row className="show-grid">
        {data.length &&  <MapSpain data={data} />}
        {!currentManufacturer ?
          <BarChart
          currentManufacturer={currentManufacturer}
          purchasesByManufacturer={purchasesByManufacturer}
          purchasesByProduct={purchasesByProduct}  />
          : <HorizBarChart purchasesByProduct={purchasesByProduct} />
        }
        </Row>
        <Row className="show-grid">
            <HorizonChart />
        </Row>
        </Grid>}
      </div>
    </div>
  }
}

export default App
