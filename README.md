# [Repubikla](https://repubikla.herokuapp.com/)

Mapping platform powered by citizens that, with a crowdsourcing strategy, seeks to generate and centralize data on non-motorized mobility in any city.

It emerges from the OpenStreetMap Mexico community with the aim of complement official information and offering a diagnosis on the volume and diversity of cyclist travel, intermodality, group mobility, infrastructure, accidents and insecurity in public space. Thus, decision makers and civil society are endowed with a diagnostic tool to promote and design better conditions for sustainable and safe mobility.

Check [our maps](https://repubikla.cartodb.com/maps) and [news](http://www.openstreetmap.mx/repubikla/).

## Setup
This tool use [carto](https://carto.com/) (but you can use any PostGIS database), set the next environment variables:
* CARTO_USER
* CARTO_API_KEY

## Install
1. ```$ git clone https://github.com/leodc/repubikla.git```
2. ```$ cd repubikla```
3. ```$ npm install```
4. ```$ nmp start```
