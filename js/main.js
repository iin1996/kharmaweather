$(document).ready(function() {
    //handle_cover
    var navbar_h = $('#navbar').height();
    var page1 = $(window).height();
    $('#page1').css('height', navbar_h + page1 + 'px');
    $('.pattern').css('height', navbar_h + page1 + 'px');

    $(window).resize(function() {
    	$('#page1').css('height','0px');
    	$('.pattern').css('height','0px');
        var navbar_a = $('#navbar').height();
        var page1a = $(window).height();
        $('#page1').css('height', navbar_a + page1a + 'px');
        $('.pattern').css('height', navbar_a + page1a + 'px');
    });

    //handle_navbar
    var navbar = $('#navbar');
    var navbar_h = navbar.height();
    $(window).scroll(function() {
        var windowpos = $(window).scrollTop();
        if (windowpos > navbar_h) {
            navbar.addClass("navbar_colour");
        } else {
            navbar.removeClass("navbar_colour");
        }
    });
    //handle_network
    var bigIcon = $('#icon_on_change'),
        bigCaption = $('#word_on_change'),
        tempCurrent = $('#current_temp_on_change'),
        cityNow = $('#city_on_change'),
        bigFoto = $('.image_big'),
        bigFoto_on_page2 = $('.overlay_blur'),
        timeCurrent = $('#current_time_on_change'),
        summaryCurrent = $('#summary_time_on_change'),
        dailyDiv = $('#onDaily_div'),
        currentlyDiv = $('#oncurrently_div'),
        colour_hourly_bar = $('#hourly_bar'),
        time_hourly_item = $('#all_item_hour'),
        weatherDiv = $('#mainwrapper');

    // Does this browser support geolocation?
    $.getJSON('https://ipinfo.io/geo', function(response) { 
        var loc = response.loc.split(',');
        var coords = {
            latitude: loc[0],
            longitude: loc[1]
        };
        console.log(coords.latitude);
        locationSuccess(coords);
        });  

    function locationSuccess(position) {
        try {
            // Retrive the cache
            var cache = localStorage.weatherCache && JSON.parse(localStorage.weatherCache);
            var d = new Date();
            // If the cache is newer than 60 minutes, use the cache
            if (cache && cache.timestamp && cache.timestamp > d.getTime() - 30 * 60 * 1000) {

                //-------NowInCurrent---------
                //turn the offset minutes into ms
                var offset = d.getTimezoneOffset() * 60 * 1000;
                //-----//
                var city = cache.data.timezone;
                var current_icon = icon_change(cache.data.currently.icon).icon;
                var current_summary = cache.data.currently.summary;
                var current_time_fixed = new Date(cache.data.currently.time * 1000 - offset);
                var current_time_fixed_2 = moment(current_time_fixed).format("HH:mm");
                var current_temperature = cache.data.currently.temperature;
                var foto_big = icon_change(cache.data.currently.icon).on_Big_photo;
                var bad_word = icon_change(cache.data.currently.icon).damn_word;
                addCurrentWeather(city, current_icon, current_summary, current_time_fixed_2, current_temperature, foto_big, bad_word);

                var daily_length = cache.data.daily.data;
                for (var i = 0; i <= 5; i++) {
                    var daily_length2 = daily_length[i];
                    var daily_time_fixed = new Date(daily_length2.time * 1000 - offset);
                    var daily_time_fixed_2 = moment(daily_time_fixed).format("dddd");
                    var daily_icon = icon_change(daily_length2.icon).icon;
                    var daily_desc = icon_change(daily_length2.icon).daily_desc;
                    addDailyWeather(daily_icon, daily_time_fixed_2, daily_desc);
                }

                //now in hourly
                var hourly_length = cache.data.hourly.data;
                for (var j = 0; j <= 11; j++) {
                    var hourly_length2 = hourly_length[j];
                    var hourly_time_fixed = new Date(hourly_length2.time * 1000 - offset);
                    var hourly_time_fixed_2 = moment(hourly_time_fixed).format("HH:mm");
                    var hourly_temp = hourly_length2.temperature;
                    addHourlyWeather(hourly_temp, hourly_time_fixed_2);
                }
                weatherDiv.addClass('loaded');
            }

            //api.darksky.net/forecast/22b106924ed7e3bcde76608f7f064585/37.8267,-122.4233?exclude=minutely?units=si
            else {
                var darkskyAPI = 'https://api.darksky.net/forecast/22b106924ed7e3bcde76608f7f064585/' + position.latitude + ',' + position.longitude + '?exclude=minutely&units=si&callback=?';
                $.getJSON(darkskyAPI, function(response) {
                    localStorage.weatherCache = JSON.stringify({
                        timestamp: (new Date()).getTime(), // getTime() returns milliseconds
                        data: response
                    });
                    locationSuccess(position);
                });
            }

        } catch (e) {
            showError("we cant find the information about the city");
            window.console && console.error(e);
            console.log(e);
        }
    }

    //city, current_icon, current_summary, current_time_fixed_2, current_temperature, foto_big, bad_word
    function addCurrentWeather(city, icon, summary, time, temperature, big_foto, bad_word_new) {
        temperature = Math.round(temperature);
        cityNow.text(city);
        bigIcon.addClass('flaticon-' + icon);
        summaryCurrent.text(summary);
        timeCurrent.text(time);
        bigCaption.text(bad_word_new);
        tempCurrent.text(temperature + '°C');
        bigFoto.css('background', 'url("' + big_foto + '") no-repeat');
        bigFoto_on_page2.css('background', 'url("' + big_foto + '") no-repeat');
    }

    function addDailyWeather(icon, time, desc) {
        var dailyDivComponent = '<div class="col-md-2 col-lg-2 col-sm-12 col-xs-12">' + '<div class="row">' +
            '<div class="thumb">' + '<p class="on_daily_p font_black">' + time + '</p>' +
            '<p class="flaticon-' + icon + ' on_disp_center">' + '</p>' + '<p class="on_daily_p font_reg">' + desc + '</p></div></div></div>';
        dailyDiv.append(dailyDivComponent);
    }

    function addHourlyWeather(temperature, time) {
        var colour_weather;
        if (temperature < 0 && temperature <= 12) {
            colour_weather = '#ffffff';
        } else if (temperature > 12 && temperature <= 22) {
            colour_weather = '#068EFC';
        } else if (temperature > 22 && temperature <= 32) {
            colour_weather = '#F3A831';
        } else {
            colour_weather = '#E6212A';
        }
        var current_hour_item = '<div class="col-md-1 col-lg-1">' + '<p class="hour_item">' + time + '</p></div>';
        var current_colour_item = '<div class="progress-bar" style="width: 8.333333333333%; background-color:' + colour_weather + ';"></div>';
        colour_hourly_bar.append(current_colour_item);
        time_hourly_item.append(current_hour_item);
    }

    function icon_change(icon) {
        var damn_word;
        var daily_desc;
        var on_Big_photo;
        switch (icon) {
            case "clear-day":
                icon = "sun";
                damn_word = "its Fucking georgeous outside, whats your doing inside?";
                daily_desc = "clear day";
                on_Big_photo = "http://www.mrwallpaper.com/wallpapers/sunny-beach.jpg";
                break;
            case "clear-night":
                icon = "night-1";
                damn_word = "ahh,,, just a little rest in a crazy day";
                daily_desc = "clear night";
                on_Big_photo = "http://cdn2.hubspot.net/hub/330850/file-2483502230-jpg/Blog_Photos/winter_stargazing/night_sky.jpg";
                break;
            case "rain":
                icon = "rain";
                damn_word = "grab your umbrella. This one's gonna be a dozzy";
                daily_desc = "rain";
                on_Big_photo = "https://s-media-cache-ak0.pinimg.com/originals/d0/82/14/d08214dea528febcc266e3e05b5ba17e.jpg";
                break;
            case "snow":
                icon = "snowing";
                damn_word = "How is snow white? pretty good, according to 7 dwarfs";
                daily_desc = "snowing";
                on_Big_photo = "http://az616578.vo.msecnd.net/files/2016/01/09/635879112155223228-319755513_635861833670816810507191518_6670-perfect-snow-1920x1080-nature-wallpaper.jpg";
                break;
            case "sleet":
                icon = "snowflake";
                damn_word = "its just a rainy or with an extra ice bucket?";
                daily_desc = "sleet";
                on_Big_photo = "https://i.ytimg.com/vi/AhBFanbd6Ng/maxresdefault.jpg";
                break;
            case "wind":
                icon = "windy";
                damn_word = "whats the wind favourite job? a Blow Job";
                daily_desc = "wind";
                on_Big_photo = "http://eskipaper.com/images/wind-wallpaper-3.jpg";
                break;
            case "fog":
                icon = "clouds";
                damn_word = "its like an opening of the horror movie....";
                daily_desc = "fog";
                on_Big_photo = "http://all4desktop.com/data_images/original/4248111-fog.jpg";
                break;
            case "cloudy":
                icon = "cloudy";
                damn_word = "this shit is grey. Fifty shade of grey";
                daily_desc = "cloudy";
                on_Big_photo = "http://wall-papers.info/images/cloudy-background/cloudy-background-14.jpg";
                break;
            case "partly-cloudy-day":
                icon = "cloud-1";
                damn_word = "now the sun start to play hide and seek";
                daily_desc = "partly cloudy day";
                on_Big_photo = "http://img12.deviantart.net/2be2/i/2015/354/9/0/partly_cloudy_by_ambr0-d9ksjvs.jpg";
                break;
            case "partly-cloudy-night":
                icon = "night";
                damn_word = "now the moon start to play hide and seek";
                daily_desc = "partly-cloudy night";
                on_Big_photo = "https://c2.staticflickr.com/2/1308/4593835179_a87d818840_b.jpg";
                break;
            case "hail":
                icon = "snowing-2";
                damn_word = "hang onto your shingles, this will be no ordinary sprinkles";
                daily_desc = "hail";
                on_Big_photo = "https://i.ytimg.com/vi/8CesDSzWHwQ/maxresdefault.jpg";
                break;
            case "thunderstorm":
                icon = "storm-1";
                damn_word = "now playing the rage of weather today";
                daily_desc = "thunderstorm";
                on_Big_photo = "http://farmersalmanac.com/wp-content/uploads/2015/06/Thunderstorm-5best.jpg";
                break;
            case "tornado":
                icon = "tornado";
                damn_word = "the Mother of Nature has doing the Twist";
                daily_desc = "tornado";
                on_Big_photo = "https://i.ytimg.com/vi/EinzBoVnmRs/maxresdefault.jpg";
                break;
            default:
                icon = "cloud";
                damn_word = "did we talk about weather?";
                daily_desc = "hmm..?";
        }
        return {
            icon: icon,
            damn_word: damn_word,
            daily_desc: daily_desc,
            on_Big_photo: on_Big_photo
        };
    }
});
