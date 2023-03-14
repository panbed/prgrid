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
]; // todo: mathematically generate these pitches
// i think i saw something with logarithms but ummm unfortunately
// i am not the best at math

const waveforms = ['square', 'sawtooth', 'sine', 'triangle'];
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

function createNote(row, noteNum) {
    //console.log('#note' + noteNum);
    $('#note' + noteNum).data('noteNum', noteNum);
    $('#note' + noteNum).data('waveform', waveforms[currentwaveForm]);
    $('#note' + noteNum).on('click', function() {
        console.log($(this).data('noteNum'));
        if ($(this).hasClass('live')) {
            selectedNotes.splice(selectedNotes.indexOf(noteNum), 1);
            $(this).removeClass('live');
        }
        else {
            $('#note' + noteNum).data('waveform', waveforms[currentwaveForm]);
            //console.log('updated note waveform thing ' + $('#note' + noteNum).data('waveform'));
            selectedNotes.push(noteNum);
            $(this).addClass('live');
            playNote(pitches[row], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.1);
        }
        
    });
}

var selectedNotes = [];
var currentwaveForm = 0;
var vol = 0.3; // sorry for these global variables lol
$(function() {
    $('#menuButton').on('click', function() {
        $('#menu').slideToggle('fast');
    })

    let noteNum = 0;
    
    for (let row = 15; row >= 0; row--)
        for (let column = 15; column >= 0; column--)
            createNote(row, noteNum++);

    let columnOffset = 0;
    let activeNotes = [];

    $('#clearbutton').on('click', function() {
        $('div#grid').children().removeClass('live');
        selectedNotes = [];
    });

    $('#waveforms').on('click', function() {
        currentwaveForm++;
        if (currentwaveForm > 3) {
            currentwaveForm = 0;
        }
        //$('#note' + noteNum).data('waveform', waveforms[currentwaveForm]);
        //$('div#grid').children().not('.live').data('waveform', waveforms[currentwaveForm]);

        //$('div#grid:not([live])').data('waveform', waveforms[currentwaveForm]);
        //console.log($('div#grid').children().not('.live'));
        //$('div#grid').children().not('.live').data('waveform', waveforms[currentwaveForm]);
        // for (let i = 0; i < 256; i++) {
        //     if (!$('#note' + i).hasClass('live')) {
        //         $('#note' + i).data('waveform', waveforms[currentwaveForm]);
        //         console.log($('#note' + i).data('waveform'));
        //     }
        // }

        //console.log(waveforms[currentwaveForm]);
        playNote(pitches[10], vol, waveforms[currentwaveForm], c.currentTime, c.currentTime + 0.5);

    });

    $('#volume').on('input', function() {
        vol = this.value;
    });
    setInterval(function() {
        if (columnOffset > 15)
            columnOffset = 0;

        for (let i = 0; i <= 15; i++) {
            activeNotes.push((columnOffset + (i * 16)));
            
            // if (selectedNotes.includes($('#note' + (columnOffset + (i * 16))).data('noteNum'))) {
            //     selectedNotes.push(columnOffset + (i * 16));
            // }
            if ($('#note' + (columnOffset + (i * 16))).hasClass('live')) {
                //console.log('looking at note: ' + (columnOffset + (i * 16)));
                playNote(pitches[15 - i], vol, $('#note' + (columnOffset + (i * 16))).data('waveform'), c.currentTime, c.currentTime + 0.150);
                // if (!selectedNotes.includes(columnOffset + (i * 16))) {
                //     //selectedNotes.push(columnOffset + (i * 16));
                // }
                //$('#note' + (columnOffset + (i * 16))).addClass('playing');
                //console.log($('#note' + (columnOffset + (i * 16))).data('waveform'));
            }
        }

        for (let j = 0; j < 255; j++) {
            if (activeNotes.includes(j)) {
                $('#note' + j).addClass('playing');
            }
            else {
                $('#note' + j).removeClass('playing');
            }
        }

        columnOffset++;
        activeNotes = [];
    }, 150);

});



