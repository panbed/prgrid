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

function playNote(freq) {
    o = context.createOscillator();
    g = context.createGain();
    o.type = 'sawtooth';
    o.connect(g);
    o.frequency.value = freq;
    g.connect(context.destination);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.5);
}

function createNote(row, noteNum) {
    console.log('#note' + noteNum);
    $('#note' + noteNum).on('click', function() {
        playNote(pitches[row]);
    });
}

$(function() {
    var noteNum = 0;
    for (let row = 15; row >= 0; row--) {
        for (let column = 15; column >= 0; column--) {
            createNote(row, noteNum);
            noteNum++;
        }
    }
});

setInterval(function() {

}, 1000);