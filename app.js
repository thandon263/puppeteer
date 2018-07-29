/*
Copyright 2018 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
'use strict';

// [START full_sample]
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const firebase = require("firebase");
// Set environment variables
var config = {
  apiKey: "AIzaSyCq-rnzCk4hc8LCYwOVSjSez7pTmWBessc",
  authDomain: "fireapp-2a935.firebaseapp.com",
  databaseURL: "https://fireapp-2a935.firebaseio.com",
  projectId: "fireapp-2a935",
  storageBucket: "fireapp-2a935.appspot.com",
  messagingSenderId: "961073507239"
};
// Initialize Firebase database
firebase.initializeApp(config);

app.use(async (req, res) => {
  const url = req.query.url;

  let hotel_city_sanDiego = "/?url=https://www.wyndhamhotels.com/hotels/san-diego-california"
  let hotel_city_nevada = "/?url=https://www.wyndhamhotels.com/hotels/las-vegas-nevada"
  let hotel_city_sanFran = "/?url=https://www.wyndhamhotels.com/hotels/san-francisco-california"
  let hotel_city_la_cali = "/?url=https://www.wyndhamhotels.com/hotels/los-angeles-california"
  let hotel_city_denver = "/?url=https://www.wyndhamhotels.com/hotels/denver-colorado"
  let hotel_city_texas = "/?url=https://www.wyndhamhotels.com/hotels/houston-texas"
  let hotel_city_illinois = "/?url=https://www.wyndhamhotels.com/hotels/chicago-illinois"
  let hotel_city_dallas = "/?url=https://www.wyndhamhotels.com/hotels/dallas-texas"
  let hotel_city_minnesota = "/?url=https://www.wyndhamhotels.com/hotels/inneapolis-minnesota"
  let hotel_city_georgia = "/?url=https://www.wyndhamhotels.com/hotels/atlanta-georgia"
  let hotel_city_washington = "/?url=https://www.wyndhamhotels.com/hotels/washington-district-of-columbia"
  let hotel_city_penn = "/?url=https://www.wyndhamhotels.com/hotels/philadelphia-pennsylvania"

  if (!url) {
    return res.send(`Please provide URL as GET parameter, for example: <a href=${hotel_city_sanDiego}>San Diego Hotels</a> 
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_nevada}>Nevada Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_sanFran}>San Francisco Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_la_cali}>Los Angeles Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_denver}>Denver Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_texas}>Texas Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_illinois}>illinois Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_dallas}>Dallas Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_minnesota}>Minnesota Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_georgia}>Georgia Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_washington}>Washington Hotels</a>
                    <br/><br/> Please provide URL as GET parameter, for example: <a href=${hotel_city_penn}>Pennsylvania Hotels</a>`);
  }

  var database = firebase.database();

  // [START browser]
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true
  });
  // [END browser]
  const page = await browser.newPage();
  await page.setViewport({
    width: 1000,
    height: 900
  });
  
  await page.goto(url);
  await page.waitForSelector(".propSummary");
  
  const sections = await page.$$(".hotel-details-wrapper");

  var contents = [];

  for(let i = 0; i < sections.length; i++) {
    const section = sections[i];

    let price = "";

    const hotel = await section.$(".hotel-url");
    const hotel__details = await section.$(".hotel-tagline");
    const roomPrice = await section.$(".rate");
    const hotel__image = await section.$(".lazy-load");

    const hotelName = await page.evaluate( title => title.innerText, hotel);
    const hotelDetails = await page.evaluate( hotelDetails => hotelDetails.innerText, hotel__details);
    
    try {
        price  = await page.evaluate( price => price.innerText, roomPrice);    
    } catch (e) {
        price = "unavailable";
    }
    
    const image = await page.evaluate( image => image.src, hotel__image);

    var object_values = {
      hotelName,
      hotelDetails,
      price,
      image
    }

    var content = JSON.stringify(object_values);
    contents.push(content);
    database.ref('/wyndhamHotel').push(object_values);
    console.log("Processed!", i);
  }
  
  res.send(contents);
  return contents;

  await browser.close();

});

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});
// [END full_sample]

module.exports = app;
