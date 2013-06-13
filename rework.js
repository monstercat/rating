var rework = require('rework');
var read = require('fs').readFileSync;
var cssfile = process.argv[2];
if (!cssfile) return console.error("No file specified");
var str = read(cssfile, 'utf8');

var prefixes = [
    "animation-name"
  , "animation-duration"
  , "animation-fill-mode"
];

var css = rework(str)
  .vendors(['-webkit-', '-moz-'])
  .use(rework.inline("."))
  .use(rework.prefix(prefixes))
  .use(rework.keyframes())
  .toString();

console.log(css);
