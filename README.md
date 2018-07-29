# Headless Chrome on Google App Engine

This sample application demonstrates how to use Headless Chrome via the [Puppeteer](https://developers.google.com/web/tools/puppeteer/) module to take screenshots of webpages on [Google App Engine](https://cloud.google.com/appengine) Node.js [standard environment](https://cloud.google.com/appengine/docs/standard/nodejs).

## Running and deploying

Refer to the [appengine/README.md](../README.md) file for instructions on running and deploying.

---

## Hotel Price and Room Search

This application is mainly developed to help search for Hotels and book the best room with lowest price on the listing. There is a lot more depending on application,you can send to the database. 

```JavaSrcipt 
    
    ...
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
    ...
  
``` 
You have a browser instance that runs on the server and it's termed Headless because you don't get to see the `Chrome browser` but it will be gathering data on the background. 

You have to close the browser when you are done with the search, to reduce service costs on Google App Engine.

```JavaScript
    ...
        
     await browser.close();

    ...
```

---
### The Writer
Legend_of_theHeroGenius