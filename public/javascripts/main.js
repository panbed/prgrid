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

// i dont even know what these do, but maybe ill remember if i keep it here
// bars = ['', '', '', '', '', '', '', '']
// var currentBar = 0

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

function createNote(row, noteNum) {
    // add the 'number' of the note (from 0-255) and waveform to the data
    // element of the note (its helpful to read from later)
    $('#note' + noteNum).data('noteNum', noteNum);
    $('#note' + noteNum).data('waveform', waveforms[currentwaveForm]);

    $('#note' + noteNum).on('click', function() {
        // if the note is active, then remove the live class from it and 'reset' it
        if ($(this).hasClass('live')) {
            selectedNotes.splice(selectedNotes.indexOf(noteNum), 1);
            $(this).removeClass('live');
            $(this).text("");
        }
        // if the note is not active, then make it active by adding the live class,
        // reading the current waveform, adding it to the active notes array,
        // and playing the pitch of the note
        else {
            $('#note' + noteNum).data('waveform', waveforms[currentwaveForm]);
            selectedNotes.push(noteNum);
            $(this).addClass('live');
            $(this).text(waveforms[currentwaveForm].slice(0,3));
            playNote(pitches[row], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.1);
        }
        
    });
}

var selectedNotes = [];     // notes that are 'lit up' on the board, none by default
var currentwaveForm = 0;    // default to square wave (look at const waveforms for reference)
var vol = 0.3;              // volume var, can set default here

$(function() {
    let columnOffset = 0;
    let activeNotes = [];   // notes that are currently playing

    // create all the notes on the board
    let noteNum = 0;
    for (let row = 15; row >= 0; row--)
        for (let column = 15; column >= 0; column--)
            createNote(row, noteNum++);

    $('#waveforms').text(waveforms[currentwaveForm].slice(0, 4));

    // toggling the menu button in jquery with a cool(tm) animation
    $('#menuButton').on('click', function() {
        $('#menu').slideToggle('fast');
    })

    // clear button logic: remove anything that is active ('live'),
    // reset any text on the notes, and then remove any selected notes
    $('#clearbutton').on('click', function() {
        $('div#grid').children().removeClass('live');
        $('div#grid').children().text("");
        selectedNotes = [];
    });

    // logic for the waveform button, displays the current waveform text
    $('#waveforms').on('click', function() {
        // increment what waveform we're on
        currentwaveForm++;
        
        // reset back to zero when out of bounds
        if (currentwaveForm > 3) 
            currentwaveForm = 0;

        // display only 4 chars of waveform text, and play an example waveform when cycling through
        $('#waveforms').text(waveforms[currentwaveForm].slice(0, 4));
        playNote(pitches[10], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.5);

    });

    // logic for volume slider
    $('#volume').on('input', function() {
        vol = this.value;
    });

    // interval function that acts as the bpm for the piano grid,
    // controls the 'active' line that plays notes
    setInterval(function() {
        // reset position once we reach the end
        if (columnOffset > 15) {
            columnOffset = 0;
        }

        for (let i = 0; i <= 15; i++) {
            // add the note num to the 'currently playing' (activeNotes) array
            activeNotes.push((columnOffset + (i * 16)));
            
            // play the note if it has the live class
            if ($('#note' + (columnOffset + (i * 16))).hasClass('live')) {
                playNote(pitches[15 - i], vol, $('#note' + (columnOffset + (i * 16))).data('waveform'), c.currentTime, c.currentTime + 0.150);
            }
        }

        // run through the entire grid and add
        // the playing class to it, meaning that it is currently being played 
        // (i actually forgot why i even do this, 
        // i think i wanted to add some feature later but i forgot?)
        for (let j = 0; j < 255; j++) {
            if (activeNotes.includes(j)) {
                $('#note' + j).addClass('playing');
            }
            else {
                $('#note' + j).removeClass('playing');
            }
        }

        // console.log(selectedNotes);
        columnOffset++;     // increment the current column
        activeNotes = [];   // reset the active notes, since we moved to the next column
    }, 150);

});



