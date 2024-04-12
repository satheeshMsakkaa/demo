function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function fetchChannels(callback) {
    fetch('data.json')
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Error fetching JSON:', error));
}

function setupPlayer(channelData) {
    // Set up JWPlayer
    var playerSetup = {
        file: channelData.url,
        position: 'bottom',
        autostart: true,
        stretching: "",
        width: "100%",
        mute: false
    };

    if (channelData.url.endsWith('.mpd')) {
        // Set up DRM for DASH with keys if available
        playerSetup.type = 'dash';

        // Check if Clear Key is available
        if (channelData.license_key && channelData.license_key2) {
            playerSetup.drm = {
                clearkey: {
                    keyId: channelData.license_key,
                    key: channelData.license_key2
                }
            };
        }
    } else if (channelData.url.endsWith('.m3u8')) {
        // Set up DRM for HLS with keys if available
        playerSetup.type = 'hls';

        // Check if Clear Key is available
        if (channelData.license_key && channelData.license_key2) {
            playerSetup.drm = {
                clearkey: {
                    keyId: channelData.license_key,
                    key: channelData.license_key2
                }
            };
        }
    } else {
        // Default to HLS without keys
        playerSetup.type = 'hls';
    }

    jwplayer("jwplayerDiv").setup(playerSetup);
}

// Fetch channels data and set up the player
fetchChannels(function(channels) {
    // Get channel name from the URL
    var channelName = getParameterByName('ch');
    // Find the channel data in the JSON
    var channelData = channels.find(channel => decodeURIComponent(channel.name) === channelName);

    if (channelData) {
        // Set up the player with the channel data
        setupPlayer(channelData);
    } else {
        console.error('Channel not found:', channelName);
    }
});