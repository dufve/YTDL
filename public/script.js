document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    document.getElementById('downloadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submission prevented');
        const videoUrl = document.getElementById('videoUrl').value;
        if (!validYouTubeURL(videoUrl)) {
            alert("Please enter a valid YouTube URL.");
            return;
        }
        fetch(`/videoInfo?url=${encodeURIComponent(videoUrl)}`)
            .then(response => response.json())
            .then(data => {
                displayVideoMetadata(data.videoDetails);
                displayFormats(videoUrl, data.formats, data.videoDetails);
            })
            .catch(err => console.error('Error fetching info:', err));
    });
});

function validYouTubeURL(url) {
    if (url.includes('<') || url.includes('>')) {
        return false;
    }

    const regExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return url.match(regExp);
}

function sanitizeFilename(title) {
    let sanitized = title.replace(/[<>:"\/\\|?*]/g, '_'); // Filter out specified characters
    sanitized = sanitized.length > 250 ? sanitized.substr(0, 247) + '...' : sanitized;
    return sanitized;
}

function displayVideoMetadata(videoDetails) {
    const metadataDiv = document.getElementById('videoMetadata');
    const duration = new Date(videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8);
    // Replace line breaks in the description with <br> tags
    const description = videoDetails.description.replace(/\n/g, '<br>');
    metadataDiv.innerHTML = `
        <h2>${videoDetails.title}</h2>
        <img src="${videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url}" alt="Thumbnail" style="max-width: 200px;">
        <p>${description}</p>
        <p>Duration: ${duration}</p>
        <p>Uploaded on: ${new Date(videoDetails.publishDate).toLocaleDateString()}</p>
    `;
}


function displayFormats(videoUrl, formats, videoDetails) {
    const formatOptionsDiv = document.getElementById('formatOptions');
    formatOptionsDiv.innerHTML = '';
    let categories = {
        'Video & Audio': [],
        'Audio Only': [],
        'Video Only': []
    };

    formats.sort((a, b) => b.bitrate - a.bitrate);

    formats.forEach(format => {
        const quality = format.qualityLabel ? `${format.qualityLabel} ` : format.audioQuality ? `${format.audioQuality.replace('AUDIO_QUALITY_', '')} ` : '';
        const type = (format.hasAudio && format.hasVideo) ? 'Video & Audio' :
            format.hasAudio ? 'Audio Only' : 'Video Only';
        categories[type].push(format);
    });

    for (let type in categories) {
        if (categories[type].length > 0) {
            const separator = document.createElement('div');
            separator.classList.add('separator');
            const line = document.createElement('hr');
            const text = document.createElement('span');
            text.textContent = type;
            separator.appendChild(line);
            separator.appendChild(text);
            separator.appendChild(line.cloneNode());
            formatOptionsDiv.appendChild(separator);

            categories[type].forEach(format => {
                const formatElement = document.createElement('button');
                const quality = format.qualityLabel ? format.qualityLabel : format.audioQuality ? format.audioQuality.replace('AUDIO_QUALITY_', '') : 'Unknown';
                formatElement.textContent = `Download ${quality} (${format.mimeType})`;
                formatElement.onclick = () => {
                    const title = sanitizeFilename(videoDetails.title);
                    const downloadName = `${title} [${quality}] [${videoDetails.videoId}]`;
                    window.location.href = `/download?url=${encodeURIComponent(videoUrl)}&itag=${format.itag}&name=${encodeURIComponent(downloadName)}`;
                };
                formatOptionsDiv.appendChild(formatElement);
            });
        }
    }
}