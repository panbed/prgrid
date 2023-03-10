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

var context = new AudioContext();
//var o = context.createOscillator();
//var g = context.createGain();
var o, g = null;

function playNote(freq, startTime, stopTime) {
    o = context.createOscillator();
    //g = context.createGain();
    o.type = 'square';
    o.connect(context.destination);
    o.frequency.value = freq;
    //g.connect(context.destination);
    o.start(startTime);
    //g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.25);
    o.stop(stopTime);
}

function createNote(row, noteNum) {
    //console.log('#note' + noteNum);
    $('#note' + noteNum).on('click', function() {
        if ($(this).hasClass('live')) {
            //console.log('removing live class');
            $(this).removeClass('live');
        }
        else {
            //console.log('adding live class');
            $(this).addClass('live');
        }
        playNote(pitches[row], context.currentTime, context.currentTime + 0.1);
    });
}

$(function() {
    var noteNum = 0;
    for (let row = 15; row >= 0; row--) {
        for (let column = 15; column >= 0; column--) {
            createNote(row, noteNum++);
        }
    }

    var columnOffset = 0;
    setInterval(function() {
        if (columnOffset > 15) {
            columnOffset = 0;
        }
        console.log(columnOffset);    
        for (let i = 0; i <= 15; i++) {
            
            if ($('#note' + (columnOffset + (i * 16))).hasClass('live')) {
                console.log('looking at note: ' + (columnOffset + (i * 16)));
                playNote(pitches[15 - i], context.currentTime, context.currentTime + 0.150);
            }
        }
        columnOffset++;
    }, 150);

});



