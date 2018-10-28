import React, { Component } from 'react'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
require('react-leaflet-markercluster/dist/styles.min.css')
import * as d3 from "d3";
import MarkerClusterGroup from 'react-leaflet-markercluster';



export default class MapSpain extends Component {
  constructor (props) {
    super(props)
    this.state = {
      lat: 40.41,
      lng: -3.70,
      zoom: 5.5
    }
  }

  render() {
    const {
      data
    } = this.props
    const position = [this.state.lat, this.state.lng]
    return (
      <div class='container'>
        <h2>Ventas en España y Portugal</h2>
        <Map className='map-spain' center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
            <MarkerClusterGroup>
              {
                data.length && data.map((item, key) => (
                  <Marker key={key} position={{lat: item.latitude, lng: item.longitude}}>
                    <Popup>
                      A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                  </Marker>
                ))
              }
            </MarkerClusterGroup>
        </Map>
      </div>
    )
  }
}