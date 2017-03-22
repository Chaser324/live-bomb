
var scheduleCounter = 0;

var siteData = {};
siteData.sites = {};
siteData.sites.gb = {
    'name': 'Giant Bomb',
    'upcomingSetting': 'gb-upcoming',
    'liveSetting': 'gb-live',
    'dataUrl': 'https://www.giantbomb.com/upcoming_json',
    'chatUrl': 'http://www.giantbomb.com/chat',
    'isLive': false,
    'sendMessage': false,
    'liveTitle': '',
    'liveImage': ''
};
// siteData.sites.gs = {
//     'name': 'GameSpot',
//     'upcomingSetting': 'gs-upcoming',
//     'liveSetting': 'gs-live',
//     'dataUrl': 'http://www.gamespot.com/upcoming_json',
//     'chatUrl': 'http://www.gamespot.com/chat',
//     'isLive': false,
//     'sendMessage': false,
//     'liveTitle': '',
//     'liveImage': ''
// };
// siteData.sites.cv = {
//     'name': 'Comic Vine',
//     'upcomingSetting': 'cv-upcoming',
//     'liveSetting': 'cv-live',
//     'dataUrl': 'http://www.comicvine.com/upcoming_json',
//     'chatUrl': 'http://www.comicvine.com/chat',
//     'isLive': false,
//     'sendMessage': false,
//     'liveTitle': '',
//     'liveImage': ''
// };
siteData.isLive = false;
siteData.output = '';
siteData.countdown = false;


//Check for live video
var checkLive = function() {
    var checkLiveDone = [];

    $.each(siteData.sites, function(key, site) {
        if (storage.get(site.liveSetting)) {
            checkLiveDone.push($.getJSON(site.dataUrl, function(data) {
                checkLiveCallback(site, data)
            }));
        }
    });

    return $.when.apply($, checkLiveDone);
};

var checkLiveCallback = function(site, data) {
    if (data.liveNow !== null) {
        site.isLive = true;
        site.liveTitle = data.liveNow.title;
        site.liveImage = data.liveNow.image;
    } else {
        site.isLive = false;
    }
}


//Schedule Function
var getSchedule = function() {

    var getScheduleDone = [];

    scheduleCounter = 0;
    siteData.output = '';
    siteData.countdown = false;

    $.each(siteData.sites, function(key, site) {
        if (storage.get(site.upcomingSetting)) {
            getScheduleDone.push($.getJSON(site.dataUrl, function(data) {
                getScheduleCallback(site, data)
            }));
        }
    });

    return $.when.apply($, getScheduleDone);
};

var getScheduleCallback = function(site, data) {
    if (data.upcoming.length > 0) {
        var eventType,
            scheduleDate,
            liveShows = [];

        $.each(data.upcoming, function(key, val) {
            // Parse Date
            var date  = new Date(val.date),
                formatted = moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a'),
                dt    = moment.tz(formatted, 'dddd, MMMM Do YYYY, h:mm:ss a', 'America/Los_Angeles'),
                today = moment().get('date');

            val.dt = dt;

            // Parse Event Type
            switch (val.type) {
            case 'Live Show':
                eventType = '<i class="fa fa-dot-circle-o fa-lg circle-schedule"></i> Live Show ';
                liveShows.push(val);
                break;
            case 'Video':
                eventType = '<i class="fa fa-play-circle fa-lg circle-schedule"></i> Video '; break;
            case 'Article':
                eventType = '<i class="fa fa-file-o fa-lg"></i> Article '; break;
            case 'Podcast':
                eventType = '<i class="fa fa-microphone fa-lg"></i> Podcast '; break;
            default:
                eventType = '<i class="fa fa-question-circle fa-lg"></i> Something ';
            }

            dt.zone(moment().zone());

            if (today == dt) {
                scheduleDate = dt.fromNow();
            } else {
                scheduleDate = '- ' + dt.calendar();
            }

            var eventName = val.title;
            var eventImage = "'http://" + val.image + "'";

            // Assemble Output
            siteData.output +=  '<li style="background-image: url('+ eventImage +')"><h4>' + eventName +
                '</h4> <p>'+ eventType + scheduleDate +'</p></li>';

            scheduleCounter += 1;
        });

        if (liveShows.length > 0) {
            // Find the earliest live show date
            var nextShow = moment.min.apply(null, $.map(liveShows, function(show) {
                return show.dt;
            })).toDate();

            siteData.countdown = nextShow.toString();
        }
    }
};

//Routine
var liveRoutine = function() {
    var getLiveDone = $.Deferred();

    checkLive().done(function() {

        siteData.isLive = false;
        $.each(siteData.sites, function(key, site) {
            siteData.isLive = siteData.isLive || site.isLive;
        });

        //Handle general live status
        if (siteData.isLive === true) {
            chrome.browserAction.setBadgeText({ text: 'LIVE' });
            $('body').trigger('statusLive');
        } else {
            $('body').trigger('statusNotLive');

            if (storage.get('schedule-badge') === true && scheduleCounter > 0) {
                chrome.browserAction.setBadgeText({text: '' + scheduleCounter + ''});
            } else {
                chrome.browserAction.setBadgeText({text: ''});
            }
        }

        //Handle live status of individual sites
        $.each(siteData.sites, function(key, site) {
            if (storage.get('notification') && site.isLive && site.sendMessage) {
                var options = {
                    type: 'basic',
                    title: 'Hey duder! ' + site.name + ' is live with:',
                    message: '' + site.liveTitle + '',
                    iconUrl: '/images/notificationicon.png'
                };

                site.sendMessage = false;
                chrome.notifications.create(site.chatUrl, options, function(){});

                if (storage.get('notification-sound') === true) {
                    audio.playSound(storage.get('sound'), storage.get('notification-volume'));
                }
            } else if (site.isLive === false) {
                site.sendMessage = true;
            }
        });

        getLiveDone.resolve();
    });

    return getLiveDone.promise();
};

var scheduleRoutine = function() {
    var getScheduleDone = $.Deferred();

    getSchedule().done(function() {
        if (storage.get('schedule-badge') === true && siteData.isLive === false && scheduleCounter > 0) {
            chrome.browserAction.setBadgeText({text: '' + scheduleCounter + ''});
        }

        getScheduleDone.resolve();
    });

    return getScheduleDone.promise();
};
