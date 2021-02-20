/**
 * jquery-vasttrafik v1.2
 * (c) 2015-2021 Joel Ericsson
 * https://github.com/joel-eriksson/jquery-vasttrafik/blob/master/LICENSE
 */
(function($) {
    $.fn.vasttrafik = function(options, callback) {
        var target = this;

        var api;
        var response = {};

        var defaults = {
            url: "",
            stopId: "",
            method: "GET",
            crossDomain: true,
            cache: false,
            async: true,
            departureNow: "now",
            departureNone: "No departures",
            lineColors: {}
        };

        var settings = $.extend({}, defaults, options);

        function timeDiff(fromUnix, toUnix) {
        	if (isNaN(fromUnix) || isNaN(toUnix)) {
        		return NaN;
        	}
        	return Math.abs(Math.floor(fromUnix - toUnix));
        }

        $.ajax({
            url: settings.url + settings.stopId,
            method: settings.method,
            crossDomain: settings.crossDomain,
            cache: settings.cache,
            async: settings.async,
            dataType: "json",
            statusCode: {
                200: function() {
                    response.statusCode = 200;
                    response.statusDescription = "OK";
                },
                401: function() {
                    response.statusCode = 401;
                    response.statusDescription = "Unauthorized";
                },
                403: function() {
                    response.statusCode = 403;
                    response.statusDescription = "Forbidden";
                },
                404: function() {
                    response.statusCode = 404;
                    response.statusDescription = "Not Found";
                },
                500: function() {
                    response.statusCode = 500;
                    response.statusDescription = "Internal Server Error";
                },
                501: function() {
                    response.statusCode = 501;
                    response.statusDescription = "Not Implemented";
                },
                502: function() {
                    response.statusCode = 502;
                    response.statusDescription = "Bad Gateway";
                },
                503: function() {
                    response.statusCode = 503;
                    response.statusDescription = "Service Unavailable";
                }
            },
            success: function(data) {
                response.success= true;
                api = data;
                if (api.trafik !== null) {
            		var serverTime = api.serverDateTime.unixTimestamp;

            		$(target).html("");

            		$.each(api.trafik, function(currentFirst, linjeinfo) {
            			$.each(linjeinfo.avgang, function(currentSecond, avgang) {

            				var nasta = timeDiff(avgang.unixTimestamp[0], serverTime) / 60;
            				var darefter = timeDiff(avgang.unixTimestamp[1], serverTime) / 60;

            				if (isNaN(darefter)) {
            					darefter = "-";
            				}
            				if (nasta <= 0) {
            					nasta = settings.departureNow;
            				}
            				if (darefter <= 0) {
            					darefter = settings.departureNow;
            				}

                            if (typeof settings.lineColors[linjeinfo.linje] === typeof {}) {
                                linjeinfo.bgFarg = settings.lineColors[linjeinfo.linje].bgColor;
                                linjeinfo.fgFarg = settings.lineColors[linjeinfo.linje].fgColor;
                            }

            				$(target).append("<tr><td class='linje' style='background-color: " + linjeinfo.bgFarg + "; color: " + linjeinfo.fgFarg + ";'>" + linjeinfo.linje + "</td><td> " + avgang.resmal + " </td><td class='lage'>" + avgang.lage[0] + "</td><td class='tid'>" + nasta + "</td><td class='tid'>" + darefter + "</td>");
            			});
            		});
            	} else {
            		$(target).html("<tr><td class='linje' style='background-color: #F44336; color: #FFFFFF'>-</td><td>" + settings.departureNone + "</td><td class='lage'>-</td><td class='tid'>60+</td><td class='tid'>-</td>");
            	}
            },
            error: function(error) {
                response.success = false;
            }
        });

        response.target = target;

        if (typeof callback == "function") {
            return callback(response);
        }
        return response;
    };
}(jQuery));
