
var domify = require('domify');
var hover = require('hover');
var each = require('each');
var events = require('event');
var bind = require('bind');
var Emitter = require('emitter');
var classes = require('classes');
var exclrange = require('range');
var range = function(a, b){ return exclrange(a, b, true); };

module.exports = Stars;

function Stars(opts) {
  if (!(this instanceof Stars)) return new Stars(opts);
  Emitter.call(this);
  var self = this;
  opts = opts || {};

  var data = {};
  data.stars = opts.stars != null? opts.stars : 5;
  var el = this.el = domify(require('./template')(data));

  this.stars = data.stars;
  this.els = [].slice.call(el.children);
  this.delay = opts.delay != null? opts.delay : 100;
  this.current = [];

  var timeout = null;

  var over = function(star, i){
    if (!this.disabled) {
      if (timeout !== null) { 
        clearTimeout(timeout);
        timeout = null;
      }
      this.highlight(range(1, i+1), true);
      this.highlight(range(i+2, this.stars), false);
    }
  };

  var out = function(star, i) {
    if (!this.disabled) {
      timeout = setTimeout(function(){
        self.highlight(range(1, self.stars), false);
        self.highlight(self.current, true);
      }, this.delay);
    }
  };

  var click = function(star, i) {
    if (!self.disabled)
      self.rate(i+1);
    classes(star).toggle('clicked');
  }

  each(el.children, function(star, i){
    var bnd = function(fn) { return bind(self, fn, star, i); };
    hover(star, bnd(over), bnd(out));
    events.bind(star, 'click', bnd(click));
  });
}

Emitter(Stars.prototype);

Stars.prototype.rate = function Stars_rate(rating) {
  this.rating = rating;
  this.current = range(1, rating);
  this.set(this.current);
  this.emit('rating', rating)
};

Stars.prototype.set = function Stars_set(setting) {
  this.current = setting;
  this.highlight(range(1, this.stars), false);
  this.highlight(this.current, true);
}

Stars.prototype.highlight = function Stars_highlight(ns, highlight) {
  highlight = highlight == null? true : highlight;

  var self = this;
  each(ns, function(n){
    var el = self.els[n-1];
    var c = classes(el);
    if (highlight) 
      c.add('highlight');
    else 
      c.remove('highlight');
  });
};

Stars.prototype.attach = function Stars_attach(el) {
  el.appendChild(this.el);
};

Stars.prototype.enable = function Stars_disable() {
  this.disabled = false;
  classes(this.el).remove('disabled');
};

Stars.prototype.disable = function Stars_disable() {
  this.disabled = true;
  classes(this.el).add('disabled');
};
