
var domify = require('domify');
var hover = require('hover');
var each = require('each');
var events = require('event');
var bind = require('bind');
var Emitter = require('emitter');
var classes = require('classes');
var exclrange = require('range');
var range = function(a, b){ return exclrange(a, b, true); };

module.exports = Rating;

function Rating(opts) {
  if (!(this instanceof Rating)) return new Rating(opts);
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
  this.disabled = false;

  var timeout = null;
  var reset = true;

  var over = function(star, i){
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }

    if (reset) {
      reset = false;
      self.emit('mouseenter', star, i);
    }

    if (!this.disabled) {
      this.highlight(range(1, i), true);
      this.highlight(range(i+1, this.stars), false);
    }
  };

  var out = function(star, i) {
    timeout = setTimeout(function(){
      reset = true;
      self.emit('mouseleave', star, i);
      if (!this.disabled) {
        self.highlight(range(1, self.stars), false);
        self.highlight(self.current, true);
      }
    }, this.delay);
  };

  var click = function(star, i) {
    this.emit("click", star, i, self.disabled);
    if (!self.disabled)
      self.rate(i);
    classes(star).toggle('clicked');
  }

  each(el.children, function(star, i){
    var bnd = function(fn) { return bind(self, fn, star, i+1); };
    hover(star, bnd(over), bnd(out));
    events.bind(star, 'click', bnd(click));
  });
}

Emitter(Rating.prototype);

Rating.prototype.rate = function Rating_rate(rating) {
  this.rating = rating;
  this.current = range(1, rating);
  this.set(this.current);
  this.emit('rating', rating)
};

Rating.prototype.set = function Rating_set(setting) {
  this.current = setting;
  this.highlight(range(1, this.stars), false);
  this.highlight(this.current, true);
}

Rating.prototype.highlight = function Rating_highlight(ns, highlight) {
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

Rating.prototype.attach = function Rating_attach(el) {
  el.appendChild(this.el);
};

Rating.prototype.enable = function Rating_enable() {
  this.disabled = false;
  classes(this.el).remove('disabled');
};

Rating.prototype.disable = function Rating_disable() {
  this.disabled = true;
  classes(this.el).add('disabled');
};
