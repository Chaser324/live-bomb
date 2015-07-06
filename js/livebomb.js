//Live Bomb UI
$(function() {
    //InterfaceCaching
    var buttonLive = $('#lb-live');
    var buttonSchedule = $('#lb-schedule');

    var buttonRefresh = $('#lb-refresh-button');
    var buttonRefreshSchedule = $('#lb-refresh-schedule');
    var scheduleLoadingIcon = $('#lb-schedule-loading');

    var buttonLightTheme = $('#light-theme');
    var buttonDarkTheme = $('#dark-theme');
    var pageStatus = $('#lb-page-status');
    var pageAbout =  $('#lb-page-about');
    var pageSchedule = $('#lb-page-schedule');

    var statusOnline = $('#lb-status-live');
    var statusOffline = $('#lb-status-offline');
    var statusCountdown = $('#lb-status-countdown');
    var cfgMessage = $('#lb-settings-message');
    var scheduleItems = $('#lb-schedule-items');

    var setCountdown = function(date) {
        console.log(date);
        $('#lb-status-timer').countdown({
            date: new Date(date),
            render: function(data) {
                var output = '';

                if (data.days > 0) {
                    output += data.days + ' days, ';
                }

                output += pluralize(data.hours, ' hour') + ', ';
                output += pluralize(data.min, ' minute') + ', and ';
                output += pluralize(data.sec, ' second');

                $(this.el).html(output);
            }
        });
    };

    var pluralize = function(number, string) {
        return '' + number + string + (number !== 1 ? 's' : '');
    };

    //Initialize slimscroll
    $(".custom-scroll").slimScroll({
        height: '280px',
        distance:'6px',
        size: '8px',
        railOpacity: 0,
    });

    //Fix popup styling for Mac users
    if (navigator.appVersion.indexOf('Mac') !== -1) {
        $('body').css('border','1.5px solid');
    }

    //Initialize settings display
    $.each(preferences, function(name, val) {
        switch (val.type) {
        case 'radio':
            $('input:radio[name="' + name + '"][value=' + storage.get(name) + ']').prop('checked', true);
            break;
        case 'checkbox':
            $('input:checkbox[name="' + name + '"]').prop('checked', storage.get(name));
        case 'range':
            var rangeinput = $('input[type="range"][name="' + name + '"]');
            rangeinput.val(storage.get(name));
            $('#rangeval-' + name).html(storage.get(name) / rangeinput.attr('step'));
            break;
        }
    });

    //Set theme
    if (storage.get('theme') === 'light') {
        buttonDarkTheme.removeClass('active');
        buttonLightTheme.addClass('active');
        $('body').addClass('livebomb-light');
        $('body').removeClass('livebomb-dark');
        _gaq.push(['_trackEvent', 'theme', 'light']);
    } else {
        _gaq.push(['_trackEvent', 'theme', 'dark']);
    }

    //Save Preferences automatically
    $('input').change(function() {
        //Display "Saved" message.
        storage.set('preferences','user-preference');
        cfgMessage.fadeIn(700).fadeTo(350, 1).fadeOut(400);

        if (this.type == "radio" && this.checked) {
            storage.set(this.name, this.value);
            $('body').trigger('checkBadge');
        } else if(this.type == "checkbox") {
            storage.set(this.name, this.checked);
            $('body').trigger('checkBadge');
        } else if (this.type == "range") {
            storage.set(this.name, this.value);
        }
    });

    //Update range value display during input
    $('input[type="range"]').on('input', function() {
        $('#rangeval-' + this.name).html(this.value / this.step);
    });

    //Update schedule badge on change
    $('body').on('checkBadge',function() {
        chrome.runtime.sendMessage({action: "live"});
    });

    if (storage.get('show-schedule') === true) {
        $('[href="#lb-page-schedule"]').tab('show');
    }

    //Status refresh
    buttonRefresh.click(function() {
        _gaq.push(['_trackEvent', 'button', 'click', 'status-refresh']);

        buttonRefresh.removeClass('fa-refresh').addClass('fa-cog fa-spin');

        chrome.runtime.sendMessage({action: "live"}, function(siteData) {
            buttonRefresh.removeClass('fa-cog fa-spin').addClass('fa-refresh');

            //Handle general live status
            if (siteData.isLive) {
                statusOnline.show();
                statusOffline.hide();
                statusCountdown.hide();
                $('[href="#lb-page-status"]').tab('show');

                $('#button-icon').css('color', 'red');

                $.each(siteData.sites, function(key, site) {
                    if (site.isLive) {
                        $('#show-name').html(site.liveTitle);
                        $('#lb-status-live').css('background-image', 'url(' + site.liveImage + ')');
                    }
                });

                $.each(siteData.sites, function(key, site) {
                    if (storage.get('notification') && site.isLive && site.sendMessage) {
                        chrome.notifications.create('notify', options, function() {
                            site.sendMessage = false;
                        });
                    }
                });
            } else if (siteData.countdown) {
                setCountdown(siteData.countdown);

                statusCountdown.show();
                statusOffline.hide();
                statusOnline.hide();
            } else {
                statusOffline.show();
                statusOnline.hide();
                statusCountdown.hide();
            }

            //Handle live status of individual sites
            $.each(siteData.sites, function(key, site) {
                //Display name/image for live site(s)
            });
        });
    });

    //Schedule refresh
    buttonRefreshSchedule.click(function() {
        _gaq.push(['_trackEvent', 'button', 'click', 'schedule-refresh']);

        buttonRefreshSchedule.removeClass('fa-refresh').addClass('fa-times');

        scheduleItems.html('<ul></ul>').hide();
        scheduleLoadingIcon.show();

        chrome.runtime.sendMessage({action: "schedule"}, function(response) {
            var siteData = response;

            $('#lb-schedule-items ul').append(siteData.output);

            scheduleLoadingIcon.hide();
            scheduleItems.show();

            if (siteData.isLive === false) {
                if (siteData.countdown) {
                    setCountdown(siteData.countdown);

                    statusCountdown.show();
                    statusOffline.hide();
                    statusOnline.hide();
                } else {
                    statusOffline.show();
                    statusOnline.hide();
                    statusCountdown.hide();
                }
            }

            buttonRefreshSchedule.removeClass('fa-times').addClass('fa-refresh');
        });
    });

    // About Close Button
    $('#offline-about-close').click(function() {
        pageAbout.removeClass('active');
        var lastPageID = $('#lb-controls li.active a').attr('href');
        $(lastPageID).addClass('active');
    });

    //Light Theme
    buttonLightTheme.click(function(){
        _gaq.push(['_trackEvent', 'button', 'click', 'light-theme']);
        $('body').removeClass('livebomb-dark').addClass('livebomb-light');
    });

    //Dark Theme
    buttonDarkTheme.click(function() {
        _gaq.push(['_trackEvent', 'button', 'click', 'dark-theme']);
        $('body').removeClass('livebomb-light').addClass('livebomb-dark');
    });

    //Test Sounds
    $('[data-playsound]').click(function() {
        audio.playSound($(this).attr('data-playsound'));
    });

    // Windows Hide Scrollbar Hack
    // TODO: I HAVE NO IDEA WHY THIS IS NECESSARY OR WHY IT WORKS!
    setTimeout(function() {
        $('body').height('379px');

        setTimeout(function() {
            $('body').height('');
        }, 100);
    }, 100);

    // Prevent flash of unstyled content
    $('html').show();

    buttonRefresh.click();
    buttonRefreshSchedule.click();
});
