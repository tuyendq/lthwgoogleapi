'use strict';

const dotenv = require('dotenv').config();
const ypi = require('youtube-playlist-info');
const fs = require('fs');
const path = require('path');

// Credit: https://gist.github.com/hagemann/382adfc57adbd5af078dc93feef01fe1#file-slugify-js
function slugify(string) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return string.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

var playlistId = process.argv[2] || 'PLroUsGOhJjhJB1sG1cZDDzDZOJs7rbeTd';
var playlistName = '';
if (process.argv[3]) {
    playlistName = '-' + slugify(process.argv[3]);
}

var playlistFile = path.join(__dirname, playlistId) + playlistName + '.json';
ypi(process.env.YOUTUBE_API_KEY, playlistId)
    .then((items) => {
        fs.writeFile(playlistFile, JSON.stringify(items), (err) => {
            if (err) {
                throw err;
            }
            console.log(`Playlist of ${items.length} videos saved in ${playlistFile}`);
        });
    })
    .catch(console.error);