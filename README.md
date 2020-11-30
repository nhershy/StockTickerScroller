# Stock Ticker Scroller

A modern version of the classic LED stock market ticker display, with nicely displayed logos. Optionally supports cryptocurrencies. Runs from your browser of choice. Made especially for the sophisticated schemer. 

"Beyond the point of averageness"

## Getting Started

This program relies on the [Alpha Vantage API](https://www.alphavantage.co/) to fetch current stock/crypto prices. You will need to claim you free personal API key to have access to the data. Then, you must add your newly claimed key to the `config.js` file. Within that same file you can modify which stocks and cryptos you would like to be displayed, as well as the scroll speed.

### Detailed How-To

1. Apply for your API key from Alpha Vantage

```
https://www.alphavantage.co/support/#api-key
```

2. Open the `config.js` file. Paste your key into the `yourAlphaVantageApiKey` variable, within the single quotes.

```
var yourAlphaVantageApiKey = 'YOUR_KEY_NUMBER_HERE';
```

3. Modify the `cryptoSymbols`, `indexSymbols`, and/or `stockSymbols` variables to display your stocks/cryptos of interest. Can have from 1 - 20 total stocks/cryptos. If a new stock/crypto is added, you need to add a new logo within the `logos` folder. All logos must be 500x500 px, have a black background, and have the same name as the ticker/crypto symbol.

```
var cryptoSymbols = "ADA,BTC,ETH,LTC,XMR";
var indexSymbols = "DIA,QQQ,SPY,VT";
var stockSymbols = "AAPL,ACB,AMZN,AXP,DNKN,FB,GOOG,MSFT,NFLX,SPCE,TSLA";
```

4. Adjust the `SCROLL_SPEED` to your liking. The smaller the number, the faster it will scroll. 

```
const SCROLL_SPEED = 17000;
```

5. Double click the `index.html` file to run the program. 

### Other Stuff/Thoughts

Check out the [Alpha Vantage Full Documentation](https://www.alphavantage.co/documentation/).

According to the [Alpha Vantage Support](https://www.alphavantage.co/support/#support), using the free version of their service, you can only make "...up to 5 API requests per minute and 500 requests per day". My program refreshes the displayed stocks once per hour. Which is why you can only have a maximum of 20 stocks (24 hrs * 20 stocks = 480 calls per day). And if you have 20 stocks, it will take 4 seperate call instances (one call per minute of 5 requests each) to load up the program. Which is why it is going to look wonky for the first 4 minutes while loading up all the data. If you can figure out a better solution to this, hats off to you!

## Author

 **Nicholas J Hershy**

## License

This project is licensed under the MIT License - see the `LICENSE.txt` file for details
