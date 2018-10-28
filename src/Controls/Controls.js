import React from 'react'
import Select from 'react-select'


export default class Controls extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showProductSelect: false
    }
  }
  handleChange (option) {
    if (option) this.props.onSelect(option.value)
    else this.props.clearManufacturer()
    this.setState({showProductSelect: Boolean(option)})
  }
  handleChangeProduct (option) {
    if (option) this.props.onSelectProduct(option.value)
    else this.props.clearProduct()
  }

  getOptions (manufacturers) {
    return manufacturers.map(item => {
      return {
        value: parseInt(item),
        label: parseInt(item)
      }
    }).slice(0,100)
  }

  render () {
    const {
      manufacturers,
      currentManufacturer,
      currentProduct,
      products,
      showProductSelect
    } = this.props

    const productOptions = this.getOptions(products)
    const manufacturerOptions = this.getOptions(manufacturers)
    return (
      <React.Fragment>
        <div className='select-manufacturers'>
          <label>Fabricante: </label>
          <Select
            value={manufacturerOptions.find(item => item.value == currentManufacturer)}
            onChange={this.handleChange.bind(this)}
            options={this.getOptions(manufacturers)}
            isClearable={true}
            />
        </div>
        {/* {this.state.showProductSelect?
        <div className='select-product'>
          <label>Producto: </label>
          <Select
            value={productOptions.find(item => item.value == currentProduct)}
            onChange={this.handleChangeProduct.bind(this)}
            options={this.getOptions(products)}
            isClearable={true}
            />
        </div> : null }*/}
      </React.Fragment>
    )
  }
}