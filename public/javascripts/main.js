/*
TODO: the long list
- make actually decent menu ui, its really bad right now
- add some way to change scale (maybe just happy/sad, and a pitch that just adds a num to every pitch hz)
- make sounds less crunchy? i think it has to do with the commented out code in playnote about linearramp or something
 */

const startingHz = [
    55.00, // a1
    110.00, // a2
    220.00, // a3
    440.00, // a4
    880.00, // a5
    1760.00, // a6
    3520.00, // a7
]

// set starting note to A4 (440hz)
let startHz = startingHz[3];

// pitch numbers relative to A4
// a2, c2, d2, e2, g2, a3, c3, d3, e3, g3, a4, c4, d4, e4, g4, a5
const minorPentatonicScale = [
    -24,
    -21,
    -19,
    -17,
    -14,
    -12,
    -9,
    -7,
    -5,
    -2,
    0,
    3,
    5,
    7,
    10,
    12
]

const pitches = [];
// generate pitch table, starting from C0 to C8:
function generateTable(startHz) {
    // we use A4 (440hz) as our constant
    // and if we want to change the octave i guess we can just change to a lower/higher A
    let pitchHz;
    for (let i = 0; i < 16; i++) {
        pitchHz = (startHz * Math.pow((Math.pow(2, 1/12)), minorPentatonicScale[i])).toFixed(2);
        pitches[i] = pitchHz;
    }

}

generateTable(startHz)
// console.log(pitches)

const waveforms = ['square', 'sawtooth', 'sine', 'triangle'];   // allowed waveforms
var c = new AudioContext();
var o, g = null;
function playNote(freq, vol, waveform, startTime, stopTime) {
    o = c.createOscillator();
    g = c.createGain();
    if (c.state == 'suspended') {
        // try fixing an issue that will create a loud noise when audiocontext is blocked
        // probably inefficient? but it saves my ears :-)
        // console.log('audiocontext suspended');
        c.resume();
        // g.gain.value = 0;
    }
    else {
        o.type = waveform;
        //o.connect(c.destination);
        //g.connect(c.destination);
        o.connect(g);
        g.connect(c.destination);
        o.frequency.value = freq;
        g.gain.value = vol;
        //g.gain.setValueAtTime(1, c.currentTime);
        o.start(startTime);
        //g.gain.setTargetAtTime(0, c.currentTime, 0.015);
        o.stop(stopTime);
        //g.gain.setValueAtTime(1, stopTime - 0.25);
        //g.gain.linearRampToValueAtTime(0, stopTime);
    }
}

// set a note to be active, 1 arg for just the notenum, 2 for notenum + waveform
function makeNoteActive() {
    let noteNum = arguments[0];
    let noteWaveform = "";
    let noteSelector = $('#note' + noteNum);
    if (arguments.length == 1) {
        noteWaveform = waveforms[currentwaveForm];
    }
    else if (arguments.length == 2) {
        noteWaveform = arguments[1];
    }
    noteSelector.data('waveform', noteWaveform);
    selectedNotes.push('' + noteNum);
    noteSelector.addClass('live');
    // $('#note' + noteNum).text(noteWaveform.slice(0,3));
    // $('#note' + noteNum).css('background-image', 'url(\'../assets/icons/black/square.png\')');
    switch (noteWaveform) {
        case 'square':
            noteSelector.addClass('squareTile');
            break;
        case 'sine':
            noteSelector.addClass('sineTile');
            break;
        case 'sawtooth':
            noteSelector.addClass('sawtoothTile');
            break;
        case 'triangle':
            noteSelector.addClass('triangleTile');
            break;
    }
}

function createNote(row, noteNum) {
    // add num of note (0-255) & waveform to the data of note
    let noteSelector = $('#note' + noteNum);
    noteSelector.data('noteNum', noteNum);
    noteSelector.data('waveform', waveforms[currentwaveForm]);

    noteSelector.on('click', function() {
        // if the note is active, then remove the live class from it and 'reset' it
        if ($(this).hasClass('live')) {
            // selectedNotes.splice(selectedNotes.indexOf(noteNum), 1);
            for (let i = selectedNotes.length; i--;) {
                if (selectedNotes[i] == noteNum) selectedNotes.splice(i, 1);
            }
            $(this).removeClass('live');
            // $(this).text("");
            $(this).removeClass('squareTile sineTile sawtoothTile triangleTile');
        }
        // else just make it active and then play a note sample
        else {
            makeNoteActive(noteNum);
            playNote(pitches[row], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.1);
        }
        
    });
}

let notificationShown = 0;
let showNotification = null;

function createNotification(message) {
    if (showNotification != null) {
        $('.notification').css('display', 'none');
        clearTimeout(showNotification);
    }

    $('#message').text(message);
    $('.notification').fadeIn('fast');

    notificationShown = 1;
    showNotification = setTimeout(() => {
        $('.notification').fadeOut('fast');
    }, 2000);
}

function killNotification() {
    $('.notification').fadeOut('fast');
    clearTimeout(showNotification);
}

let currentTab = 1;         // set the current tab and default (1)
let currentLayer = 1;
let selectedNotes = [];     // notes that are 'lit up' on the board, none by default
// let visibleNotes = [];      // i forgot what this does to be honest
let currentwaveForm = 0;    // default to square wave (look at const waveforms for reference)
let vol = (localStorage.getItem('volume') == null) ? 0.3 : localStorage.getItem('volume'); // set volume with localStorage
let paused = false;         // playing by default, can pause playback by setting to false
let columnOffset = 0;       // current playing column
let visibleOffset = 0;      // set offset for visible grid buttons (256 * (0, 1, 2, 3))
let activeNotes = [];       // notes that are highlighted by the omnipresent moving bar
let layerIndex = 0;
let activeLayers = [];
let time = 150; // in ms
let timer;

function localStorageExporter(currentTab) {
    let tabString = 'tab' + currentTab + 'data';
    localStorage.setItem(tabString, exportNotes());
}

function clearNotes() {
    if (arguments[0] == 'cool') { // delete only the current layer's notes instead of everything
        // console.log('WARNING :  ACTIVATING COOL MODE ........ WEEEEEEWOOOOOWEEEEWOOOOOOOOO [ COOL ACTIVATEING ]');

        $('div#grid' + currentLayer).children().removeClass('live squareTile sineTile sawtoothTile triangleTile');

        for (let i = (256 * (currentLayer - 1)); i < (256 * currentLayer); i++) {
            // remove the note from selectednotes so we can export it
            selectedNotes = selectedNotes.filter(e => e !== ('' + i));
        }
    }
    else {
        for (let i = 1; i <= 4; i++) {
            $('div#grid' + i).children().removeClass('live squareTile sineTile sawtoothTile triangleTile');
        }
        selectedNotes = [];
    }
}

function notePlayer() {
    visibleOffset = (currentLayer - 1) * 256;
    // reset position once we reach the end
    if (columnOffset > 15) columnOffset = 0;

    // reset layer lit
    for (let i = 1; i <= 4; i++) {
        $('#layer' + i).removeClass('layerlit');
    }

    while (layerIndex < 4) {
        for (let i = 0; i <= 15; i++) {
            // add notes to show that they are being played (its just a css property)
            activeNotes.push((columnOffset + (i * 16) + visibleOffset));

            // play the note if it has the live class
            if ($('#note' + (columnOffset + (layerIndex * 256) + (i * 16))).hasClass('live')) {
                playNote(pitches[15 - i], vol, $('#note' + (columnOffset  + (layerIndex * 256) + (i * 16))).data('waveform'), c.currentTime, c.currentTime + 0.150);
                activeLayers.push(layerIndex + 1);
            }

        }
        layerIndex++;
    }

    // run through the entire grid and add the playing class to it (denotes css property)
    for (let j = 0; j < 1024; j++) {
        if (activeNotes.includes(j)) {
            $('#note' + j).addClass('playing');
        }
        else {
            $('#note' + j).removeClass('playing');
        }
    }

    // make layer button lit up if its currently playing something
    for (let i = 1; i <= 4; i++) {
        if (activeLayers.includes(i)) {
            $('#layer' + i).addClass('layerlit');
        }
    }

    columnOffset++;     // increment the current column
    activeNotes = [];   // reset the active notes, since we moved to the next column
    layerIndex = 0;
    activeLayers = [];
}

function exportNotes() {
    let exportedNotes = "";
    let currentNoteWaveform = "";
    // exportedNotes = exportedNotes.concat('[' + startingHz.indexOf(startHz) + ']');
    // console.log(startingHz.indexOf(startHz) + 1);
    exportedNotes = exportedNotes.concat('(' + (startingHz.indexOf(startHz) + 1) + ')'); // other settings (e.g speed, pitch)
    
    for (let i = 0; i < selectedNotes.length; i++) {
        currentNoteWaveform = $('#note' + selectedNotes[i]).data('waveform');
        exportedNotes = exportedNotes.concat(selectedNotes[i] + ',' + currentNoteWaveform + ':');
    }
    exportedNotes = exportedNotes.concat('X');
    return exportedNotes;
}

function loadNotes(noteString) {
    let currentNoteString = "";
    let currentNoteWaveform = "";
    let currentPitch = 4;
    let valid = true;

    // check if the string contains any commas or :, if it doesn't then it's probably invalid
    if (!noteString.includes('X')) {
        valid = false;
    }
    
    // get info about speed and pitch
    let i = 0;
    if (noteString[0] == '(') {
        while (noteString[i] != ')' && i < noteString.length) {
            if (!isNaN(noteString[i])) {
                currentPitch = parseInt(noteString[i]);
            }
            i++;
        }
    }
    else {
        valid = false;
    }
    
    i++;
    
    // loop that reads the string
    for (let i = 3; i < noteString.length; i++) {
        if (noteString[i] == 'X' || !valid) break; // leave if we reach an X (end of string)

        if (!noteString.includes(',', ':')) {
            valid = false;
        }

        if (valid) {
            while (noteString[i] != ',' && i < noteString.length) { // read the first data, the note num
                currentNoteString = currentNoteString.concat(noteString[i++]); // add number to string then inc.
            }

            // check if the note actually exists on the board - if not then the string is probably wrong
            if (!$('#note' + currentNoteString).length) {
                valid = false;
                break;
            }
    
            i++; // this fixes things :-) (it skips the ',' in the number before the next while loop i think)
    
            while (noteString[i] != ':' && i < noteString.length) { // reads the waveform for the number
                currentNoteWaveform = currentNoteWaveform.concat(noteString[i++]);
            }

            if (waveforms.includes(currentNoteWaveform)) {
                // set the note to be active
                makeNoteActive(currentNoteString, currentNoteWaveform);
        
                // reset note num and waveform
                currentNoteString = "";
                currentNoteWaveform = "";
            }
            else {
                valid = false;
                break;
            }
        }
    }

    if (valid) {
        changePitch(currentPitch);
    }

    if (!valid) {
        createNotification("invalid string! double check it please...")
    }
}

function changeTab(tab) {
    if (tab < 1) 
        tab = 8;
    else if (tab > 8) 
        tab = 1;

    currentTab = tab; // set global currentTab to new tab
    let tabData = null;
    clearNotes(); // clear all notes on grid currently
    loadNotes(localStorage.getItem('tab' + tab + 'data')); // load notes from the string saved in localstorage

    for (let i = 1; i <= 8; i++) {
        // change color of tab if its active
        if (i == tab)
            $('#tab' + i).addClass('activetab');
        else
            $('#tab' + i).removeClass('activetab');

        // make tab color blank if its empty (blank format is something like " (4)X ")
        tabData = localStorage.getItem('tab' + i + 'data');
        // console.log(tabData);
        if (tabData.indexOf('X') == 3)
            $('#tab' + i).addClass('emptytab');
        else
            $('#tab' + i).removeClass('emptytab');
    }
    changeLayer(currentLayer); // update layer information for the empty/full thing
}

function changeLayer(layer) {
    // handle inc/dec layer number in controls
    if (layer < 1) 
        layer = 4;
    else if (layer > 4) 
        layer = 1;

    currentLayer = layer;
    for (let i = 1; i <= 4; i++) {
        if (i != layer) {
            $('#grid' + i).removeClass('gridstyle');
            $('#grid' + i).addClass('gridstylehidden');
            $('#layer' + i).removeClass('activelayer');
            $('#layer' + i).addClass('emptylayer');
        }
    }

    // go through the notes that will be played and determine if the layer is empty or not
    // maybe this is a little unnecessary for just a little visual feature (its really unnecessary)
    for (let i = 0; i < selectedNotes.length; i++) {
        if (selectedNotes[i] >= 0 && selectedNotes[i] < 256) {
            $('#layer1').removeClass('emptylayer');
        }
        else if (selectedNotes[i] >= 256 && selectedNotes[i] < 512) {
            $('#layer2').removeClass('emptylayer');
        }
        else if (selectedNotes[i] >= 512 && selectedNotes[i] < 768) {
            $('#layer3').removeClass('emptylayer');
        }
        else if (selectedNotes[i] >= 768 && selectedNotes[i] < 1024) {
            $('#layer4').removeClass('emptylayer');
        }
    }

    $('#grid' + layer).removeClass('gridstylehidden');
    $('#grid' + layer).addClass('gridstyle');
    $('#layer' + layer).removeClass('emptylayer');
    $('#layer' + layer).addClass('activelayer');
}

function changePitch(pitch) {
    if (pitch < 1) 
        pitch = 7;
    else if (pitch > 7) 
        pitch = 1;

    startHz = startingHz[pitch - 1];
    generateTable(startHz);
    localStorageExporter(currentTab);

    // change color of active pitch
    for (let i = 1; i <= 7; i++) {
        if (startingHz[i - 1] == startHz) {
            $('#pitch' + i).addClass('pitchbuttonselected');
        }
        else {
            $('#pitch' + i).removeClass('pitchbuttonselected');
        }
    }
}

function togglePause() {
    paused = !paused;
    if (paused) {
        $('#playbackionbutton').attr('name', 'play-outline')
    }
    else {
        $('#playbackionbutton').attr('name', 'pause-outline')
    }
}

function nukeEverything() {
    // warning: this will, in fact, nuke everything
    localStorage.clear();
    location.reload();
}

function saveAndSendNotification() {
    navigator.clipboard.writeText(exportNotes());
    createNotification("copied current tab information to clipboard");
}
// TODO: maybe make the layer more obvious, since when something is playing it is kind of hard to see
async function controlHandler(e) {
    var tag = e.target.tagName.toLowerCase();
    if (tag != 'input' && tag != 'textarea') { // make sure we dont detect kepresses in any inputs
        switch (e.key) {
            case ' ':
                togglePause();
                break;
            case 'ArrowDown':
            case 's':
                changeLayer(++currentLayer);
                break;
            case 'ArrowUp':
            case 'w':
                changeLayer(--currentLayer);
                break;
            case 'ArrowLeft':
            case 'a':
                changeTab(--currentTab);
                break;
            case 'ArrowRight':
            case 'd':
                changeTab(++currentTab);
                break;
            case 'c':
                saveAndSendNotification();
                break;
            case 'v':
                // firefox for some reason doesnt let you read from clipboard
                // so lets let the user know why copying doesnt work
                if (typeof navigator.clipboard.readText === 'function')
                    navigator.clipboard.readText().then((copiedString) => loadNotes(copiedString));
                else createNotification("unable to read the clipboard :<");
                break;
            case 'Backspace':
                clearNotes('cool'); // clear only the current layer
                break;
        }
    }
}

function gridInterval() {
    if (!paused) notePlayer();
}

// the 'big' function that will be run when the page loads
$(function() {
    // create all the notes on the board
    // (since theres 4 layers, and each layer has 256 notes)
    let noteNum = 0;
    while (noteNum < 1024) {
        for (let row = 15; row >= 0; row--)
            for (let column = 15; column >= 0; column--)
                createNote(row, noteNum++);
    }

    if (c.state == 'suspended') {
        createNotification('audiocontext is suspended, click anywhere to attempt to resume it...');
    }

    $('.notification').on('click', () => {
        killNotification();
    });

    // toggling the menu button in jquery with a cool(tm) animation
    $('#menuButton').on('click', function() {
        $('#menu').fadeToggle('fast');
    })

    // clear button logic: remove anything that is active ('live'),
    // reset any text on the notes, and then remove any selected notes
    $('#clearbutton').on('click', function() {
        clearNotes('cool'); // this is bad
    });

    $('#playbackbutton').on('click', function() {
        togglePause();
    })

    // debug menu options
    $('#nuke').on('click', function() {
        if (confirm("hitting ok will nuke everything... are you sure you want to nuke everything...?!")) {
            nukeEverything();
        }
    });

    // if the data doesnt exist then it breaks, so we initialize it
    if (localStorage.getItem('tab1data') == null) {
        for (let i = 1; i <= 8; i++) {
            localStorage.setItem('tab' + i + 'data', "(4)X");
            // numLocalStorage++;
        }
    }

    // set the default tab and layer to 1 for refreshes i guess
    changeTab(1);
    changeLayer(1);

    // logic for volume slider
    $('#volume').attr('value', vol);
    $('#volume').on('input', function() {
        vol = this.value;
        localStorage.setItem('volume', this.value);
    });
    $('#volume').on('change', function() {
        $('#loadtext').text(vol);
    });

    $('#speed').on('change', function() {
        time = this.value;
        console.log(time);
        clearInterval(timer); // clear old interval
        timer = setInterval(gridInterval, time); // create new interval with new time
    })

    $('#clear').on('click', function() {
        clearNotes();
    });

    // logic for the load button and export button
    $('#loadbutton').on('click', function() {
        loadNotes($('#loadtext').val());
    });

    $('#savebutton').on('click', function() {
        saveAndSendNotification();
    });

    // todo: fix stuff where if you import something it doesnt automatically update the layer if it went
    // from being empty to full (maybe just be lazy and add changelayer(currentlayer) or something idk)
    $('#main, #loadbutton, #clearbutton').on('click', function() {
        localStorageExporter(currentTab);
    });

    // logic for the waveform button, displays the current waveform text
    $('#waveforms').on('click', function() {
        // increment what waveform we're on
        currentwaveForm++;
        
        // reset back to zero when out of bounds
        if (currentwaveForm > 3) 
            currentwaveForm = 0;

        switch (currentwaveForm) {
            case 0: // square
                $(this).css('background-image', 'url(\'../assets/icons/white/square.png\')');
                break;
            case 1: // saw
                $(this).css('background-image', 'url(\'../assets/icons/white/sawtooth.png\')');
                break;
            case 2: // sine
                $(this).css('background-image', 'url(\'../assets/icons/white/sine.png\')');
                break;
            case 3: // triangle
                $(this).css('background-image', 'url(\'../assets/icons/white/triangle.png\')');
                break;
        }

        // display only 4 chars of waveform text, and play an example waveform when cycling through
        playNote(pitches[10], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.5);

    });

    // please dont go through the git history and see that instead of putting a for loop
    // i put like 7 different statements for each different tab hardcoded in
    for (let i = 1; i <= 8; i++) {
        $('#tab' + i).on('click', function() {
            changeTab(i);
        });
    }
    for (let i = 1; i <= 4; i++) {
        $('#layer' + i).on('click', function() {
            changeLayer(i);
        });
    }
    for (let i = 1; i <= 7; i++) {
        $('#pitch' + i).on('click', function() {
            changePitch(i);
        });
    }

    // handle all controls 
    $(document).on('keydown', function(e) {
        controlHandler(e);
    });

    // logic for the 'active' line that plays notes
    timer = setInterval(gridInterval, time);

});