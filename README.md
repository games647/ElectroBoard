# ElectroBoard

## Description

A dashboard for your home. This project runs on Raspberry Pi and is connected to a monitor on a wall. 
There you can display some your favorite data like the daily travel to your work. 

## Image

![Dashboard](https://i.imgur.com/0eIIRLv.png)

## Features

* Slideshow in fullscreen mode
* Shows network stats (upstream/downstream) of your Fritzbox
* Displays solar panel data (power, energy consume, battery, transfer to the energy provider) - (solar panel from Bosch)
* Display the current time and date
* Display Freifunk clients, upstream and downstream
* Shows the current temperature

##Planned

* Better configuration/modularization 
* Displays news

This project is open for contributions. 

## Setup

1. Install NodeJS
2. Run npm install on the root folder of this project

### About the Fritzbox data

Data is fetched using UPnP. Therefore a little script in Python exists. 
So you have to install Python too and the used dependency ("pip install pysimplesoap")

## Start it up

Run `npm start` or if you installed electron, you could just use `electron .`

## Credits/Dependencies

* NodeJS
* Twitter Bootstrap
* Electron
* Google Maps API
* Images from pixabay (except freifunk is CC0 and solar images are GPLv2)
* Python with pysimplesoap dependency
* openweathermap.org for weather data
