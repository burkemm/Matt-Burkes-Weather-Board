
// I want a blank city variable so we can have a clean search for city.
var city="";
// All our global variables 
var sCity=[];
var currentCity = $("#current-city");
var citySearch = $("#city-search");
var presentUVIndex= $("#uv-index");
var presentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var presentWindSpeed=$("#wind-speed")
var searchButton = $("#search-button");
var clearButton = $("#clear-data");

function currentWeather(city){
    // This variable builds the URL for the city and the API key.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        // get the response to show the current weather, date, and weather icon in the searched city.
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        // This variable converts the temperature to Fahrenheit from Kelvin.
        var tempFahrenheit = (response.main.temp - 273.15) * 1.80 + 32;
        $(presentTemperature).html((tempFahrenheit).toFixed(2)+"&#8457");
        // Show the humidity to the user
        $(currentHumidty).html(response.main.humidity+"%");
        //Show the wind speed and add the MPH metric.
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(presentWindSpeed).html(windsmph +" MPH");
        // This function gets the UV Index by retrieving the geographical coordinates and the appID.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city) > 0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}

// This is the API key needed to access the API.
var APIKey="bc2194bf2b678d6ec02f05146c48236e";
// This function prevents the default event and takes in the city search parameters.
function displayWeather(event){
    event.preventDefault();
    if(citySearch.val().trim()!==""){
        city=citySearch.val().trim();
        currentWeather(city);
    }
}

// this searches to see if the city exists in the API.
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}

//  this function adds the searched city to the search history.
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

// this function shows the user the previously searched city when they click on the city again.
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// this function builds the 5-day forecast to be displayed for the searched city.
function forecast(cityid){
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        // The for loop starts at 0 sets the variables and populates the stats for the forecast.
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempKelvin= response.list[((i+1)*8)-1].main.temp;
            var tempFahrenheit=(((tempKelvin-273.5)*1.80)+32).toFixed(2);
            var wind= response.list[((i+1)*8)-1].wind.speed.toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        console.log(wind)
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempFahrenheit+" &#8457");
            $("#fWind"+i).html(wind+" MPH");
            $("#fHumidity"+i).html(humidity+"%");
        }
    });
}

// This function clears the search history when the clear data button is clicked.
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}

// this functions shows the previously searched city's weather forecast and current weather.
function loadlastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}

// This function gets the UV Index for the current weather in a city.
    function UVIndex(ln,lt){
        // This builds the URL for getting the UV Index with the API key.
        var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
        $.ajax({
                url:uvqURL,
                method:"GET"
                }).then(function(response){
                    $(presentUVIndex).html(response.value);
                    changeUvIndexColor()
                });
        
    }

// This if statement determines the color code for the UV Index.
function changeUvIndexColor() {
    presentUVIndex.removeClass();
    if(presentUVIndex.text() >= 0 && presentUVIndex.text() <= 2) {
        presentUVIndex.addClass("green");
        presentUVIndex.addClass("text-light");
    } else if (presentUVIndex.text() >= 2 && presentUVIndex.text() <= 5) {
        presentUVIndex.addClass("yellow");
        presentUVIndex.addClass("text-dark");
    } else if (presentUVIndex.text() >= 5 && presentUVIndex.text() <= 7) {
        presentUVIndex.addClass("orange");
        presentUVIndex.addClass("text-light");
    } else {
        presentUVIndex.addClass("red");
        presentUVIndex.addClass("text-light");
    } 
}

// This is the click handlers that handle the search button and the clear history button.
// It's also the click handler when a previously search city is clicked by the user.
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-data").on("click",clearHistory);
























