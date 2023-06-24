/*
TODO: the long list
- make actually decent menu ui, its really bad right now
- add some way to change scale (maybe just happy/sad, and a pitch that just adds a num to every pitch hz)
- make sounds less crunchy? i think it has to do with the commented out code in playnote about linearramp or something
 */

const pitches = [
    65.41,  // C2
    77.78,  // Eb2
    87.31,  // F2
    98.00,  // G2
    116.54, // Bb2
    130.81, // C3
    155.56, // Eb3
    174.61, // F3
    196.00, // G3
    233.08, // Bb3
    261.63, // C4
    311.13, // Eb4
    349.23, // F4
    392.00, // G4
    466.16, // Bb4
    523.25  // C5
];

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

let currentTab = 1;         // set the current tab and default (1)
let currentLayer = 1;
let selectedNotes = [];     // notes that are 'lit up' on the board, none by default
// let visibleNotes = [];      // i forgot what this does to be honest
let currentwaveForm = 0;    // default to square wave (look at const waveforms for reference)
let vol = 0.3;              // volume var, can set default here
let paused = false;         // playing by default, can pause playback by setting to false
let columnOffset = 0;       // current playing column
let visibleOffset = 0;      // set offset for visible grid buttons (256 * (0, 1, 2, 3))
let activeNotes = [];       // notes that are highlighted by the omnipresent moving bar
let layerIndex = 0;
let activeLayers = [];
// let numLocalStorage = Object.keys(localStorage).length;

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

    // loop that reads the string
    for (let i = 0; i < noteString.length; i++) {
        if (noteString[i] == 'X') break; // leave if we reach an X (end of string)
        while (noteString[i] != ',') { // read the first data, the note num
            currentNoteString = currentNoteString.concat(noteString[i++]); // add number to string then inc.
        }
        i++; // this fixes things :-) (it skips the ',' in the number before the next while loop i think)

        while (noteString[i] != ':') { // reads the waveform for the number
            currentNoteWaveform = currentNoteWaveform.concat(noteString[i++]);
        }

        // set the note to be active
        makeNoteActive(currentNoteString, currentNoteWaveform);

        // reset note num and waveform
        currentNoteString = "";
        currentNoteWaveform = "";
    }
}

function changeTab(tab) {
    currentTab = tab;                                           // set global currentTab to new tab
    clearNotes();                                               // clear all notes on grid currently
    loadNotes(localStorage.getItem('tab' + tab + 'data'));  // load notes from the string saved in localstorage

    for (let i = 1; i <= 4; i++) {
        // change color of tab if its active
        if (i == tab)
            $('#tab' + i).addClass('activetab');
        else
            $('#tab' + i).removeClass('activetab');

        // make tab color blank if its empty
        if (localStorage.getItem('tab' + i + 'data') == 'X')
            $('#tab' + i).addClass('emptytab');
        else
            $('#tab' + i).removeClass('emptytab');
    }
    changeLayer(currentLayer); // update layer information for the empty/full thing
}

function changeLayer(layer) {
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

$(function() {
    // create all the notes on the board
    let noteNum = 0;
    while (noteNum < 1024) {
        for (let row = 15; row >= 0; row--)
            for (let column = 15; column >= 0; column--)
                createNote(row, noteNum++);
    }

    if (c.state == 'suspended') {
        console.log('audiocontext is suspended, click anywhere to attempt to resume it...');
    }

    // toggling the menu button in jquery with a cool(tm) animation
    $('#menuButton').on('click', function() {
        $('#menu').slideToggle('fast');
    })

    // clear button logic: remove anything that is active ('live'),
    // reset any text on the notes, and then remove any selected notes
    $('#clearbutton').on('click', function() {
        clearNotes('cool');
    });

    $('#playbackbutton').on('click', function() {
        paused = !paused;
        if (paused) {
            $('#playbackionbutton').attr('name', 'play-outline')
        }
        else {
            $('#playbackionbutton').attr('name', 'pause-outline')
        }
    })

    // if the data doesnt exist then it breaks, so we initialize it
    if (localStorage.getItem('tab1data') == null) {
        for (let i = 1; i <= 4; i++) {
            localStorage.setItem('tab' + i + 'data', "X");
            // numLocalStorage++;
        }
    }

    // set the default tab and layer to 1 for refreshes i guess
    changeTab(1);
    changeLayer(1);

    // logic for volume slider
    $('#volume').on('input', function() {
        vol = this.value;
    });

    // logic for the load button and export button
    $('#loadbutton').on('click', function() {
        loadNotes($('#loadtext').val());
    });

    $('#savebutton').on('click', function() {
        navigator.clipboard.writeText(exportNotes());
        console.log("Copied text to clipboard!"); // todo: make this look cooler
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
    for (let i = 1; i <= 4; i++) {
        $('#tab' + i).on('click', function() {changeTab(i);});
    }
    for (let i = 1; i <= 4; i++) {
        $('#layer' + i).on('click', function() {changeLayer(i);});
    }

    let time = 250;
    // logic for the 'active' line that plays notes
    setInterval(function() {
        if (!paused) {
            notePlayer();
        }
    }, time);

});