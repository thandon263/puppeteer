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
const firebase = require('firebase');
const config = require('./config');
const hotel = require('./hotels');
// Initialize Firebase database
firebase.initializeApp(config);

app.use(async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.send(
      `<h3>Welcome the Zerojet server --API---</h3><br><h4>Server Deployed on Google App Engine</h4><br>
      For example, you want result for "san francisco california"
      <br><br><code>You can send a GET request to the API using...</code><br>
      <a href=http://localhost:8080/?url=https://www.wyndhamhotels.com/hotels/san-francisco-california>
      /?url=https://www.wyndhamhotels.com/hotels/san-francisco-california</a>
      <br><br> This will be your query on the request Header.`
    )
  }


  var database = firebase.database();

  // [START browser]
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: false
  });
  // [END browser]
  const page = await browser.newPage();
  await page.setViewport({
    width: 1000,
    height: 900
  });

  // [ URL ]
  await page.goto(url);
  await page.waitForSelector(".propSummary");
  // [Browser Section] This contains list of hotels in a city
  const sections = await page.$$(".hotel-details-wrapper");
  // [LOCAL VARIABLE] Array of objects (List containing {name, details, price and image})
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
    // This TRY/CATCH block is used to catch null/undefined values
    // When searching for a hotel room using Wyndham hotel group.
    try {
        price  = await page.evaluate( price => price.innerText, roomPrice);    
    } catch (e) {
        price = "unavailable";
    }
    
    const image = await page.evaluate( image => image.src, hotel__image);
    // Data retrieved from searching the web
    var object_values = {
      hotelName,
      hotelDetails,
      price,
      image
    }

    contents.push(object_values);
    database.ref('/wyndhamHotel').push(object_values);
    console.log("Processed!", i);
  }
  
  res.send(contents);
  // This helps prevent service costs on the cloud platform.
  await browser.close();

  return contents;

});

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});
// [END full_sample]

module.exports = app;
