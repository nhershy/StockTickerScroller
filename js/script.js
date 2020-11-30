const SECOND = 1000; // 1000 miliseconds
const MINUTE = 60 * SECOND; // 60 seconds * 1000 miliseconds
const HOUR = 60 * MINUTE; // 60 minutes * 60 seconds * 1000 miliseconds
const REFRESH_RATE = HOUR;
const HOURS_IN_DAY = 24;

const FORMATTER = new Intl.NumberFormat('en-US', {
   minimumFractionDigits: 2,
   maximumFractionDigits: 2,
});

let FULL_TICKER_LIST;
let FULL_TICKER_COUNT;

// Per API documentation, can only make 5 api requests per minute
// https://www.alphavantage.co/support/#support
const API_RATE_LIMIT = {
  "rate": 5,
  "time": MINUTE + (SECOND * 2) // Plus 2 "buffer" seconds
};

let scrollDuration = 0;

$(function() {
  // Per API documentation, can only make 500 api requests per day
  // With REFRESH_RATE of one hour, max stocks input by user can be 20
  FULL_TICKER_LIST = createFullTickerList();
  FULL_TICKER_COUNT = FULL_TICKER_LIST.length;
  var maxStocks = Math.floor(500 / HOURS_IN_DAY);

  if (FULL_TICKER_COUNT > 20) {
    $("#startBtn").hide();
    alert('You have exceeded allowed number of stocks/indices/cryptos.' +
         '\nTotal maximum allowed are 20. Please reduce your choices.');
  }
  else {
    var windowHeight = $(window).height();
    var windowHeight55Percent = windowHeight * 0.55;
    $("#startBtn").css("height", windowHeight55Percent);
  }
});

var startBtnClick = async function() {
  $("#startBtn").hide();
  goFullScreen();
  await execute();
}

var execute = async function() {
  while(true) {
    inserFillerBlurb("Beginning");
    await theMeat();
    await synchronousSetTimeout(REFRESH_RATE);
    clearAllContent();
  }
}

var theMeat = async function() {
  var temporaryCounter = 0;
  var loopTimes = Math.round(FULL_TICKER_COUNT / API_RATE_LIMIT.rate);

  for (var i = 0; i < loopTimes; i++) {
    var j = 0;
    while (j < 5 && temporaryCounter < FULL_TICKER_COUNT) {
      if (FULL_TICKER_LIST[temporaryCounter].type === "crypto") {
        getAlphaVantageCryptoData(FULL_TICKER_LIST[temporaryCounter].tickerSymbol);
      }
      else {
        getAlphaVantageStockData(FULL_TICKER_LIST[temporaryCounter].tickerSymbol);
      }
      temporaryCounter += 1;
      j += 1;
    }
    if (temporaryCounter == FULL_TICKER_COUNT) {
      inserFillerBlurb("Ending");
    }
    startScroll(temporaryCounter);
    await synchronousSetTimeout(API_RATE_LIMIT.time);
  }
}

var getAlphaVantageStockData = function(tickerSymbol) {
  $.ajax({
    url: 'https://www.alphavantage.co/query',
    async : false,
    data: {
      function: 'GLOBAL_QUOTE',
      symbol: tickerSymbol,
      apikey: yourAlphaVantageApiKey,
    },
    dataType: 'json',
    success: function(response) {
      var currentPriceString = response["Global Quote"]["05. price"];
      var currentPrice = FORMATTER.format(parseFloat(currentPriceString));
      var percentChangeString = response["Global Quote"]["10. change percent"];
      var percentChange = FORMATTER.format(parseFloat(percentChangeString.replace('%', ''))) + '%';
      var positiveChange = percentChangeString.indexOf('-') >= 0 ? false : true;
      percentChange = (positiveChange) ? "+".concat(percentChange) : percentChange;

      displayStockInfo(tickerSymbol, currentPrice, percentChange, positiveChange);
    }
  });
}

var getAlphaVantageCryptoData = function(cryptoSymbol) {
  $.ajax({
    url: 'https://www.alphavantage.co/query',
    async : false,
    data: {
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: cryptoSymbol,
      to_currency: 'USD',
      apikey: yourAlphaVantageApiKey,
    },
    dataType: 'json',
    success: function(response) {
      var currentPriceString = response["Realtime Currency Exchange Rate"]["5. Exchange Rate"];
      var currentPrice = FORMATTER.format(parseFloat(currentPriceString));

      displayCryptoInfo(cryptoSymbol, currentPrice);
    }
  });
}

var displayStockInfo = function(tickerSymbol, currentPrice, percentChange, positiveChange) {
  var anchorDiv = $('#anchorDiv');
  var idName = tickerSymbol + "Container";
  anchorDiv.append('<div id="' + idName + '" class="stockContainer">');
  var elementContainer = $("#" + idName);
  elementContainer.append('<img src="logos\\' + tickerSymbol + '.png">');
  elementContainer.append('<p>' + tickerSymbol + '&nbsp;</p>');
  elementContainer.append('<p>$' + currentPrice + '&nbsp;</p>');
  if (positiveChange) {
    elementContainer.append('<p class="positiveChange">' + percentChange + '</p>');
  }
  else {
    elementContainer.append('<p class="negativeChange">' + percentChange + '</p>');
  }
}

var displayCryptoInfo = function(cryptoSymbol, currentPrice) {
  var anchorDiv = $('#anchorDiv');
  var idName = cryptoSymbol + "Container";
  anchorDiv.append('<div id="' + idName + '" class="stockContainer">');
  var elementContainer = $("#" + idName);
  elementContainer.append('<img src="logos\\' + cryptoSymbol + '.png">');
  elementContainer.append('<p>' + cryptoSymbol + '&nbsp;</p>');
  elementContainer.append('<p>$' + currentPrice + '</p>');
}

var createFullTickerList = function() {
  var cryptos = getCryptoSymbols();
  var indices = getIndexSymbols();
  var stocks = getStockSymbols();

  var fullTickerList = [];

  for(var i = 0; i < cryptos.length; i++) {
    fullTickerList.push({
      "tickerSymbol":cryptos[i],
      "type":"crypto"
    });
  }

  for(var i = 0; i < indices.length; i++) {
    fullTickerList.push({
      "tickerSymbol":indices[i],
      "type":"stock"
    });
   }

  for(var i = 0; i < stocks.length; i++) {
    fullTickerList.push({
      "tickerSymbol":stocks[i],
      "type":"stock"
    });
   }

   return fullTickerList;
}

var getStockSymbols = function() {
  return stockSymbols.split(',');
}

var getCryptoSymbols = function() {
  return cryptoSymbols.split(',');
}

var getIndexSymbols = function() {
  return indexSymbols.split(',');
}

var goFullScreen = function() {
  var elem = document.body;
  rfs = elem.requestFullscreen
    || elem.webkitRequestFullScreen
    || elem.mozRequestFullScreen
    || elem.msRequestFullscreen;

  rfs.call(elem);
}

var synchronousSetTimeout = async function(milliseconds) {
  await new Promise(done => setTimeout(() => done(), milliseconds));
}

var inserFillerBlurb = function(identifier) {
  var anchorDiv = $('#anchorDiv');
  var idName = "fillerBlurb" + identifier + "Container";
  anchorDiv.append('<div id="' + idName + '" class="stockContainer">');
  var elementContainer = $("#" + idName);
  var pictureUrlLocation = "Other\\filler";
  elementContainer.append('<img src="logos\\' + pictureUrlLocation + '.png">');
  elementContainer.append('<p style="color:black !important;">' + "?" + '&nbsp;</p>');
}

var clearAllContent = function() {
  $("#anchorDiv").empty();
}

var marqueeScrollAnimation = function() {
  var scrollWidth = $('#anchorDiv').get(0).scrollWidth;
  var clientWidth = $('#anchorDiv').get(0).clientWidth;
  $('#anchorDiv').animate({ scrollLeft: scrollWidth - clientWidth },
  {
      duration: scrollDuration,
      easing: "linear",
      complete: function() {
        stopAnimationScroll();
        resetScrollPosition();
        marqueeScrollAnimation();
      }
  });
}

var startScroll = function(numberOfStocks) {
  scrollDuration = SCROLL_SPEED * numberOfStocks;
  stopAnimationScroll();
  resetScrollPosition();
  marqueeScrollAnimation();
}

var resetScrollPosition = function() {
  $('#anchorDiv').scrollLeft(0);
}

var stopAnimationScroll = function() {
  $('#anchorDiv').stop();
}
