var jade = require('jade-runtime');
module.exports = 
function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="stars">');
 for (var i = 0; i < stars; ++i)
{
buf.push('<div class="star"></div>');
}
buf.push('</div>');
}
return buf.join("");
};
