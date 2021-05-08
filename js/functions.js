//Live check query variables.
//Variables

var storage = $.localStorage;

var preferences = {
    //Internal settings
    'preferences': {default: chrome.runtime.getManifest().version, type: null},
    //User settings
    'notification': {default: true, type: 'checkbox'},
    'timer': {default: 300000, type: 'range'},
    'theme': {default: 'dark', type: 'radio'},
    'notification-sound': {default: true, type: 'checkbox'},
    'notification-volume': {default: 100, type: 'range'},
    'sound': {default: 'dropbomb', type: 'radio'},
    'schedule-badge': {default: true, type: 'checkbox'},
    'show-schedule': {default: true, type: 'checkbox'},

    'gb-upcoming': {default: true, type: 'checkbox'},
    'gb-live': {default: true, type: 'checkbox'},
    'gs-upcoming': {default: true, type: 'checkbox'},
    'gs-live': {default: true, type: 'checkbox'},
    'cv-upcoming': {default: true, type: 'checkbox'},
    'cv-live': {default: true, type: 'checkbox'},

    '24h-clock': {default: false, type: 'checkbox'},
    'utc-offset': {default: "auto", type: 'select-one'}
};

//Initialize audio handler object.
var audio = {};
audio.currentAudio = null;
audio.playSound = function(sound, volume) {
    //Stop any current sound.
    if (this.currentAudio) {
        this.currentAudio.pause();
        document.body.removeChild(this.currentAudio);
        this.currentAudio = null;
    }

    //Add and init new sound.
    this.currentAudio = document.createElement('audio');
    document.body.appendChild(this.currentAudio);
    this.currentAudio.autoplay = true;
    this.currentAudio.volume = volume / 100;
    this.currentAudio.src = 'sounds/' + sound + '.ogg';
};
audio.stopSound = function() {
    //Stop any current sound.
    if (this.currentAudio) {
        this.currentAudio.pause();
    }
};