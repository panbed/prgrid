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

// todo: mathematically generate these pitches
// i think i saw something with logarithms but ummm unfortunately
// i am not the best at math

const waveforms = ['square', 'sawtooth', 'sine', 'triangle'];   // allowed waveforms
var c = new AudioContext();
var o, g = null;

function playNote(freq, vol, waveform, startTime, stopTime) {
    o = c.createOscillator();
    g = c.createGain();
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

// set a note to be active, 1 arg for just the notenum, 2 for notenum + waveform
function makeNoteActive() {
    let noteNum = arguments[0];
    let noteWaveform = "";
    if (arguments.length == 1) {
        noteWaveform = waveforms[currentwaveForm];
    }
    else if (arguments.length == 2) {
        noteWaveform = arguments[1];
    }
    $('#note' + noteNum).data('waveform', noteWaveform);
    selectedNotes.push(noteNum);
    $('#note' + noteNum).addClass('live');
    $('#note' + noteNum).text(noteWaveform.slice(0,3));
}

function createNote(row, noteNum) {
    // add num of note (0-255) & waveform to the data of note
    $('#note' + noteNum).data('noteNum', noteNum);
    $('#note' + noteNum).data('waveform', waveforms[currentwaveForm]);

    $('#note' + noteNum).on('click', function() {
        // if the note is active, then remove the live class from it and 'reset' it
        if ($(this).hasClass('live')) {
            selectedNotes.splice(selectedNotes.indexOf(noteNum), 1);
            $(this).removeClass('live');
            $(this).text("");
        }
        // else just make it active and then play a note sample
        else {
            makeNoteActive(noteNum);
            playNote(pitches[row], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.1);
        }
        
    });
}

function clearNotes() {
    $('div#grid').children().removeClass('live');
    $('div#grid').children().text("");
    selectedNotes = [];
}

var currentTab = 1;         // set the current tab and default (1)
var selectedNotes = [];     // notes that are 'lit up' on the board, none by default
var currentwaveForm = 0;    // default to square wave (look at const waveforms for reference)
var vol = 0.3;              // volume var, can set default here

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
        i++; // this fixes things :-) (it skips the ',' in the number before the next while loop)

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
    loadNotes(localStorage.getItem('tab' + tab + 'data'));      // load notes from the string saved in localstorage

    for (let i = 1; i <= 3; i++) {
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
}

$(function() {
    let columnOffset = 0;
    let activeNotes = [];   // notes that are currently playing

    // create all the notes on the board
    let noteNum = 0;
    for (let row = 15; row >= 0; row--)
        for (let column = 15; column >= 0; column--)
            createNote(row, noteNum++);
    
    // slice the waveforms text to only 3 chars
    $('#waveforms').text(waveforms[currentwaveForm].slice(0, 3));

    // toggling the menu button in jquery with a cool(tm) animation
    $('#menuButton').on('click', function() {
        $('#menu').slideToggle('fast');
    })

    // clear button logic: remove anything that is active ('live'),
    // reset any text on the notes, and then remove any selected notes
    $('#clearbutton').on('click', function() {
        clearNotes();
    });

    // set the default tab to 1
    changeTab(1);

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
        // todo: make this look cooler
        console.log("Copied text to clipboard!");
    });

    $('#grid, #clearbutton, #loadbutton').on('click', function() {
        switch (currentTab) {
            case 1:
                localStorage.setItem('tab1data', exportNotes());
                break;
            case 2:
                localStorage.setItem('tab2data', exportNotes());
                break;
            case 3:
                localStorage.setItem('tab3data', exportNotes());
                break;
        }
    });

    // logic for the waveform button, displays the current waveform text
    $('#waveforms').on('click', function() {
        // increment what waveform we're on
        currentwaveForm++;
        
        // reset back to zero when out of bounds
        if (currentwaveForm > 3) 
            currentwaveForm = 0;

        // display only 4 chars of waveform text, and play an example waveform when cycling through
        $('#waveforms').text(waveforms[currentwaveForm].slice(0, 3));
        playNote(pitches[10], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.5);

    });

    // amazing tab logic :3 (im so sorry)
    $('#tab1').on('click', function() {changeTab(1);});
    $('#tab2').on('click', function() {changeTab(2);});
    $('#tab3').on('click', function() {changeTab(3);});

    // logic for the 'active' line that plays notes
    setInterval(function() {
        // reset position once we reach the end
        if (columnOffset > 15) columnOffset = 0;

        for (let i = 0; i <= 15; i++) {
            // add the note num to the 'currently playing' (activeNotes) array
            activeNotes.push((columnOffset + (i * 16)));
            
            // play the note if it has the live class
            if ($('#note' + (columnOffset + (i * 16))).hasClass('live')) {
                playNote(pitches[15 - i], vol, $('#note' + (columnOffset + (i * 16))).data('waveform'), c.currentTime, c.currentTime + 0.150);
            }
        }

        // run through the entire grid and add the playing class to it
        for (let j = 0; j < 255; j++) {
            if (activeNotes.includes(j)) {
                $('#note' + j).addClass('playing');
            }
            else {
                $('#note' + j).removeClass('playing');
            }
        }
        
        columnOffset++;     // increment the current column
        activeNotes = [];   // reset the active notes, since we moved to the next column
    }, 150);

});