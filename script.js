// All our global variables. Start searched city (pastCity) as an empty array and then add the search history cities to the array.
var pastCity=[];
var presentCity = $("#present-city");
var citySearch = $("#city-search");
var presentUVIstat= $("#presentUVIstat");
var presentTemperature = $("#presentTemperature");
var presentHumidity= $("#presentHumidity");
var presentWindSpeed=$("#presentWindspeed");
var searchButton = $("#button-search");
var clearButton = $("#clear-data");
var APIKey="aa34196ceb99727d5e5b9f1c4e953d35";

function presentWeather(citySearch){
    // This variable builds the URL for the city and the API key using the get method.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // get the response to show the current weather, date, and weather icon in the searched city.
        // This the forecast images you see above the city weather stats.
        var weatherImage = response.weather[0].icon;
        var imgSource = "https://openweathermap.org/img/wn/"+weatherImage +"@2x.png";
        var date = new Date(response.dt*1000).toLocaleDateString();
        // get the info for the image and city and concatenate them.
        $(presentCity).html(response.name +"("+date+")" + "<img src="+imgSource+">");
        // This variable converts the presentTemperature to Fahrenheit from Kelvin.
        var tempFahrenheit = (response.main.temp - 273.15) * 1.80 + 32;
        $(presentTemperature).html((tempFahrenheit).toFixed(2) + "&#8457");
        // Show the presentHumidity to the user
        $(presentHumidity).html(response.main.humidity+"%");
        //Show the wind speed and add the MPH metric.
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(presentWindSpeed).html(windsmph + " MPH");
        // This function gets the UV Index by retrieving the geographical coordinates and the appID.
        UVIstat(response.coord.lon,response.coord.lat);
        // This is needed to show the 5-day forecast stats.
        forecast(response.id);
    });
}

// this searches to see if the city exists in the API. Typing random characters and click search does nothing.
function validCity(c){
    for (var i = 0; i < pastCity.length; i++){
        if(c.toUpperCase() === pastCity[i]){
            return -1;
        }
    }
    return 1;
}

//  this function adds the searched city to the search history.
function saveCitytolist(c){
    var listEl = $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

// this function shows the user the previously searched city when they click on the city again in the search history.
function previousCityClick(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        presentWeather(city);
    }

}

// This function prevents the default event and takes in the city search parameters.
function showCityWeather(event){
    event.preventDefault();
    if(citySearch.val().trim() !== ""){
        city=citySearch.val().trim();
        presentWeather(city);
    }
}

// this function builds the 5-day forecast to be displayed for the searched city.
function forecast(cityid){
    var apiForecast="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:apiForecast,
        method:"GET"
    }).then(function(response){
        // The for loop starts at 0 sets the variables and populates the stats for the forecast.
        for (i = 0; i < 5; i++){
            var date = new Date((response.list[(( i + 1) * 8 ) - 1].dt) * 1000).toLocaleDateString();
            var imageCode = response.list[(( i + 1 ) * 8) -1].weather[0].icon;
            var imgSource = "https://openweathermap.org/img/wn/"+imageCode+".png";
            var tempKelvin = response.list[((i+1)*8)-1].main.temp;
            var tempFahrenheit = (((tempKelvin-273.5)*1.80)+32).toFixed(2);
            var wind = response.list[((i+1)*8)-1].wind.speed.toFixed(2);
            var presentHumidity = response.list[((i + 1) * 8) -1].main.humidity;
        console.log(wind)
            $("#forecast-day"+i).html(date);
            $("#forecast-image"+i).html("<img src=" + imgSource + ">");
            $("#forecast-temperature"+i).html(tempFahrenheit + " &#8457");
            $("#forecast-windspeed"+i).html(wind + " MPH");
            $("#forecast-humidity"+i).html(presentHumidity + "%");
        }
    });
}

// This function clears the search history when the clear data button is clicked.
function clearData(event){
    event.preventDefault();
    pastCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}

// this functions shows the previously searched city's weather forecast and current weather.
function searchPastCity(){
    $("ul").empty();
    var pastCity = JSON.parse(localStorage.getItem("cityname"));
    if(pastCity !== null){
        pastCity=JSON.parse(localStorage.getItem("cityname"));
        for(i = 0; i < pastCity.length; i++){
            saveCitytolist(pastCity[i]);
        }
        city=pastCity[i - 1];
        presentWeather(city);
    }

}

// This function gets the UV Index for the current weather in a city.
    function UVIstat(ln,lt){
        // This builds the URL for getting the UV Index with the API key.
        var UVIndexURL="https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
        $.ajax({
                url:UVIndexURL,
                method:"GET"
                }).then(function(response){
                    $(presentUVIstat).html(response.value);
                    changeUVIstatColor()
                });
        
    }

// This if statement determines the color code for the UV Index.
function changeUVIstatColor() {
    presentUVIstat.removeClass();
    if(presentUVIstat.text() >= 0 && presentUVIstat.text() <= 2) {
        presentUVIstat.addClass("green");
        presentUVIstat.addClass("text-light");
    } else if (presentUVIstat.text() >= 2 && presentUVIstat.text() <= 5) {
        presentUVIstat.addClass("yellow");
        presentUVIstat.addClass("text-dark");
    } else if (presentUVIstat.text() >= 5 && presentUVIstat.text() <= 7) {
        presentUVIstat.addClass("orange");
        presentUVIstat.addClass("text-light");
    } else {
        presentUVIstat.addClass("red");
        presentUVIstat.addClass("text-light");
    } 
}

// This is the click handlers that handle the search button and the clear history button.
// It's also the click handler when a previously search city is clicked by the user.
$("#button-search").on("click",showCityWeather);
$(document).on("click",previousCityClick);
$(window).on("load",searchPastCity);
$("#clear-data").on("click",clearData);
























