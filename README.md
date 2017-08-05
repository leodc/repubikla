[Repubikla](https://repubikla.herokuapp.com/)
======================

Software in development that with a crowdsourcing strategy seeks to generate and centralize data on non-motorized urban mobility, the objective is to complement official information and through [thematic maps](https://repubikla.carto.com/) offer a diagnostic of the citizen perception of the public space.

The news of the project are published [here.](http://www.openstreetmap.mx/repubikla/)

##### Our full set of maps and data can be found in: https://repubikla.cartodb.com/maps


### Run
To run you need to create config/default.json in the top level of the app, the file shold contain the next variables:

{
    "user": carto username, 
    "api_key": carto api key,
    "base_url": base url of the project
}