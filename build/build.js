

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("monstercat-jade-runtime/index.js", Function("exports, require, module",
"\njade = (function(exports){\n/*!\n * Jade - runtime\n * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>\n * MIT Licensed\n */\n\n/**\n * Lame Array.isArray() polyfill for now.\n */\n\nif (!Array.isArray) {\n  Array.isArray = function(arr){\n    return '[object Array]' == Object.prototype.toString.call(arr);\n  };\n}\n\n/**\n * Lame Object.keys() polyfill for now.\n */\n\nif (!Object.keys) {\n  Object.keys = function(obj){\n    var arr = [];\n    for (var key in obj) {\n      if (obj.hasOwnProperty(key)) {\n        arr.push(key);\n      }\n    }\n    return arr;\n  }\n}\n\n/**\n * Merge two attribute objects giving precedence\n * to values in object `b`. Classes are special-cased\n * allowing for arrays and merging/joining appropriately\n * resulting in a string.\n *\n * @param {Object} a\n * @param {Object} b\n * @return {Object} a\n * @api private\n */\n\nexports.merge = function merge(a, b) {\n  var ac = a['class'];\n  var bc = b['class'];\n\n  if (ac || bc) {\n    ac = ac || [];\n    bc = bc || [];\n    if (!Array.isArray(ac)) ac = [ac];\n    if (!Array.isArray(bc)) bc = [bc];\n    ac = ac.filter(nulls);\n    bc = bc.filter(nulls);\n    a['class'] = ac.concat(bc).join(' ');\n  }\n\n  for (var key in b) {\n    if (key != 'class') {\n      a[key] = b[key];\n    }\n  }\n\n  return a;\n};\n\n/**\n * Filter null `val`s.\n *\n * @param {Mixed} val\n * @return {Mixed}\n * @api private\n */\n\nfunction nulls(val) {\n  return val != null;\n}\n\n/**\n * Render the given attributes object.\n *\n * @param {Object} obj\n * @param {Object} escaped\n * @return {String}\n * @api private\n */\n\nexports.attrs = function attrs(obj, escaped){\n  var buf = []\n    , terse = obj.terse;\n\n  delete obj.terse;\n  var keys = Object.keys(obj)\n    , len = keys.length;\n\n  if (len) {\n    buf.push('');\n    for (var i = 0; i < len; ++i) {\n      var key = keys[i]\n        , val = obj[key];\n\n      if ('boolean' == typeof val || null == val) {\n        if (val) {\n          terse\n            ? buf.push(key)\n            : buf.push(key + '=\"' + key + '\"');\n        }\n      } else if (0 == key.indexOf('data') && 'string' != typeof val) {\n        buf.push(key + \"='\" + JSON.stringify(val) + \"'\");\n      } else if ('class' == key && Array.isArray(val)) {\n        buf.push(key + '=\"' + exports.escape(val.join(' ')) + '\"');\n      } else if (escaped && escaped[key]) {\n        buf.push(key + '=\"' + exports.escape(val) + '\"');\n      } else {\n        buf.push(key + '=\"' + val + '\"');\n      }\n    }\n  }\n\n  return buf.join(' ');\n};\n\n/**\n * Escape the given string of `html`.\n *\n * @param {String} html\n * @return {String}\n * @api private\n */\n\nexports.escape = function escape(html){\n  return String(html)\n    .replace(/&(?!(\\w+|\\#\\d+);)/g, '&amp;')\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;');\n};\n\n/**\n * Re-throw the given `err` in context to the\n * the jade in `filename` at the given `lineno`.\n *\n * @param {Error} err\n * @param {String} filename\n * @param {String} lineno\n * @api private\n */\n\nexports.rethrow = function rethrow(err, filename, lineno){\n  if (!filename) throw err;\n\n  var context = 3\n    , str = require('fs').readFileSync(filename, 'utf8')\n    , lines = str.split('\\n')\n    , start = Math.max(lineno - context, 0)\n    , end = Math.min(lines.length, lineno + context);\n\n  // Error context\n  var context = lines.slice(start, end).map(function(line, i){\n    var curr = i + start + 1;\n    return (curr == lineno ? '  > ' : '    ')\n      + curr\n      + '| '\n      + line;\n  }).join('\\n');\n\n  // Alter exception message\n  err.path = filename;\n  err.message = (filename || 'Jade') + ':' + lineno\n    + '\\n' + context + '\\n\\n' + err.message;\n  throw err;\n};\n\n  return exports;\n\n})({});\n//@ sourceURL=monstercat-jade-runtime/index.js"
));
require.register("stagas-within/index.js", Function("exports, require, module",
"\n/**\n * within\n */\n\nmodule.exports = within\n\n/**\n * Check if an event came from inside of a given element\n *\n * @param object the event object\n * @param Element the element in question\n * @param string the fallback property if relatedTarget is not defined\n * @return boolean\n */\n\nfunction within (evt, elem, fallback) {\n  var targ = evt.relatedTarget, ret;\n  if (targ == null) {\n    targ = evt[fallback] || null;\n  }\n  try {\n    while (targ && targ !== elem) {\n      targ = targ.parentNode;\n    }\n    ret = (targ === elem);\n  } catch(e) {\n    ret = false;\n  }\n  return ret;\n}\n//@ sourceURL=stagas-within/index.js"
));
require.register("stagas-mouseenter/index.js", Function("exports, require, module",
"\n/**\n * mouseenter\n */\n\nvar within = require('within')\n\nmodule.exports = mouseenter\n\nvar listeners = []\nvar fns = []\n\nfunction mouseenter (el, fn) {\n  function listener (ev) {\n    var inside = within(ev, ev.target, 'fromElement')\n    if (inside) return\n    if (fn) fn.call(this, ev)\n  }\n  listeners.push(listener)\n  fns.push(fn)\n  el.addEventListener('mouseover', listener)\n}\n\nmouseenter.bind = mouseenter\n\nmouseenter.unbind = function (el, fn) {\n  var idx = fns.indexOf(fn)\n  if (!~idx) return\n  fns.splice(idx, 1)\n  el.removeEventListener('mouseover', listeners.splice(idx, 1)[0])\n}\n//@ sourceURL=stagas-mouseenter/index.js"
));
require.register("stagas-mouseleave/index.js", Function("exports, require, module",
"\n/**\n * mouseleave\n */\n\nvar within = require('within')\n\nmodule.exports = mouseleave\n\nvar listeners = []\nvar fns = []\n\nfunction mouseleave (el, fn) {\n  function listener (ev) {\n    var inside = within(ev, ev.target, 'toElement')\n    if (inside) return\n    if (fn) fn.call(this, ev)\n  }\n  listeners.push(listener)\n  fns.push(fn)\n  el.addEventListener('mouseout', listener)\n}\n\nmouseleave.bind = mouseleave\n\nmouseleave.unbind = function (el, fn) {\n  var idx = fns.indexOf(fn)\n  if (!~idx) return\n  fns.splice(idx, 1)\n  el.removeEventListener('mouseout', listeners.splice(idx, 1)[0])\n}\n//@ sourceURL=stagas-mouseleave/index.js"
));
require.register("stagas-hover/index.js", Function("exports, require, module",
"\n/**\n * \n * hover\n * \n */\n\n/**\n * Module dependencies.\n */\n\nvar mouseenter = require('mouseenter')\nvar mouseleave = require('mouseleave')\n\n/**\n * Export hover.\n */\n\nmodule.exports = hover\n\n/**\n * Binds `mouseenter` and `mouseleave` events\n * on an `el`.\n *\n * @param {element} el\n * @param {fn} onmouseenter\n * @param {fn} onmouseleave\n * @param {number} leavedelay\n *\n * @return {element} el\n */\n\nfunction hover (el, onmouseenter, onmouseleave, leavedelay) {\n  if (leavedelay) {\n    var t\n    mouseenter(el, function (ev) {\n      clearTimeout(t)\n      onmouseenter(ev)\n    })\n    mouseleave(el, function (ev) {\n      clearTimeout(t)\n      t = setTimeout(onmouseleave, leavedelay, ev)\n    })\n  }\n  else {\n    mouseenter(el, onmouseenter)\n    mouseleave(el, onmouseleave)\n  }\n  return el\n}\n\n/**\n * Hovers only once.\n *\n * @param {element} el \n * @param {fn} onmouseenter \n * @param {fn} onmouseleave \n *\n * @return {element} el\n */\n\nhover.once = function (el, onmouseenter, onmouseleave) {\n  mouseenter(el, onmouseenter)\n  mouseleave(el, function wrapper (ev) {\n    mouseenter.unbind(el, onmouseenter)\n    mouseleave.unbind(el, wrapper)\n\n    onmouseleave.apply(this, arguments)\n  })\n}\n//@ sourceURL=stagas-hover/index.js"
));
require.register("component-range/index.js", Function("exports, require, module",
"\nmodule.exports = function(from, to, inclusive){\n  var ret = [];\n  if (inclusive) to++;\n\n  for (var n = from; n < to; ++n) {\n    ret.push(n);\n  }\n\n  return ret;\n}//@ sourceURL=component-range/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * toString reference.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present, or\n * pass a regular expression to remove\n * any which match.\n *\n * @param {String|RegExp} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  if ('[object RegExp]' == toString.call(name)) {\n    return this.removeMatching(name);\n  }\n\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove all classes matching `re`.\n *\n * @param {RegExp} re\n * @return {ClassList}\n * @api private\n */\n\nClassList.prototype.removeMatching = function(re){\n  var arr = this.array();\n  for (var i = 0; i < arr.length; i++) {\n    if (re.test(arr[i])) {\n      this.remove(arr[i]);\n    }\n  }\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n  var arr = str.split(re);\n  if ('' === arr[0]) arr.shift();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture || false);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture || false);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"\n/**\n * Slice reference.\n */\n\nvar slice = [].slice;\n\n/**\n * Bind `obj` to `fn`.\n *\n * @param {Object} obj\n * @param {Function|String} fn or string\n * @return {Function}\n * @api public\n */\n\nmodule.exports = function(obj, fn){\n  if ('string' == typeof fn) fn = obj[fn];\n  if ('function' != typeof fn) throw new Error('bind() requires a function');\n  var args = [].slice.call(arguments, 2);\n  return function(){\n    return fn.apply(obj, args.concat(slice.call(arguments)));\n  }\n};\n//@ sourceURL=component-bind/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n  \n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) throw new Error('No elements were generated.');\n  var tag = m[1];\n  \n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return [el.removeChild(el.lastChild)];\n  }\n  \n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  return orphan(el.children);\n}\n\n/**\n * Orphan `els` and return an array.\n *\n * @param {NodeList} els\n * @return {Array}\n * @api private\n */\n\nfunction orphan(els) {\n  var ret = [];\n\n  while (els.length) {\n    ret.push(els[0].parentNode.removeChild(els[0]));\n  }\n\n  return ret;\n}\n//@ sourceURL=component-domify/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n/**\n * toString ref.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Return the type of `val`.\n *\n * @param {Mixed} val\n * @return {String}\n * @api public\n */\n\nmodule.exports = function(val){\n  switch (toString.call(val)) {\n    case '[object Function]': return 'function';\n    case '[object Date]': return 'date';\n    case '[object RegExp]': return 'regexp';\n    case '[object Arguments]': return 'arguments';\n    case '[object Array]': return 'array';\n    case '[object String]': return 'string';\n  }\n\n  if (val === null) return 'null';\n  if (val === undefined) return 'undefined';\n  if (val && val.nodeType === 1) return 'element';\n  if (val === Object(val)) return 'object';\n\n  return typeof val;\n};\n//@ sourceURL=component-type/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar type = require('type');\n\n/**\n * HOP reference.\n */\n\nvar has = Object.prototype.hasOwnProperty;\n\n/**\n * Iterate the given `obj` and invoke `fn(val, i)`.\n *\n * @param {String|Array|Object} obj\n * @param {Function} fn\n * @api public\n */\n\nmodule.exports = function(obj, fn){\n  switch (type(obj)) {\n    case 'array':\n      return array(obj, fn);\n    case 'object':\n      if ('number' == typeof obj.length) return array(obj, fn);\n      return object(obj, fn);\n    case 'string':\n      return string(obj, fn);\n  }\n};\n\n/**\n * Iterate string chars.\n *\n * @param {String} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction string(obj, fn) {\n  for (var i = 0; i < obj.length; ++i) {\n    fn(obj.charAt(i), i);\n  }\n}\n\n/**\n * Iterate object keys.\n *\n * @param {Object} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction object(obj, fn) {\n  for (var key in obj) {\n    if (has.call(obj, key)) {\n      fn(key, obj[key]);\n    }\n  }\n}\n\n/**\n * Iterate array-ish.\n *\n * @param {Array|Object} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction array(obj, fn) {\n  for (var i = 0; i < obj.length; ++i) {\n    fn(obj[i], i);\n  }\n}//@ sourceURL=component-each/index.js"
));
require.register("rating/index.js", Function("exports, require, module",
"\nvar domify = require('domify');\nvar hover = require('hover');\nvar each = require('each');\nvar events = require('event');\nvar bind = require('bind');\nvar emitter = require('emitter');\nvar classes = require('classes');\nvar exclrange = require('range');\nvar range = function(a, b){ return exclrange(a, b, true); };\n\nmodule.exports = Stars;\n\nfunction Stars(opts) {\n  if (!(this instanceof Stars)) return new Stars(opts);\n  var self = this;\n  opts = opts || {};\n\n  var data = {};\n  data.stars = opts.stars != null? opts.stars : 5;\n  var el = this.el = domify(require('./template')(data))[0];\n\n  this.stars = data.stars;\n  this.els = [].slice.call(el.children);\n  this.delay = opts.delay != null? opts.delay : 100;\n  this.current = [];\n\n  var timeout = null;\n\n  var over = function(star, i){\n    if (!this.disabled) {\n      if (timeout !== null) { \n        clearTimeout(timeout);\n        timeout = null;\n      }\n      this.highlight(range(1, i+1), true);\n      this.highlight(range(i+2, this.stars), false);\n    }\n  };\n\n  var out = function(star, i) {\n    if (!this.disabled) {\n      timeout = setTimeout(function(){\n        self.highlight(range(1, self.stars), false);\n        self.highlight(self.current, true);\n      }, this.delay);\n    }\n  };\n\n  var click = function(star, i) {\n    if (!self.disabled)\n      self.rate(i+1);\n    classes(star).toggle('clicked');\n  }\n\n  each(el.children, function(star, i){\n    var bnd = function(fn) { return bind(self, fn, star, i); };\n    hover(star, bnd(over), bnd(out));\n    events.bind(star, 'click', bnd(click));\n  });\n}\n\nStars.prototype.rate = function Stars_rate(rating) {\n  this.rating = rating;\n  this.current = range(1, rating);\n  this.set(this.current);\n};\n\nStars.prototype.set = function Stars_set(setting) {\n  this.current = setting;\n  this.highlight(range(1, this.stars), false);\n  this.highlight(this.current, true);\n}\n\nStars.prototype.highlight = function Stars_highlight(ns, highlight) {\n  highlight = highlight == null? true : highlight;\n\n  var self = this;\n  each(ns, function(n){\n    var el = self.els[n-1];\n    var c = classes(el);\n    if (highlight) \n      c.add('highlight');\n    else \n      c.remove('highlight');\n  });\n};\n\nStars.prototype.attach = function Stars_attach(el) {\n  el.appendChild(this.el);\n};\n\nStars.prototype.enable = function Stars_disable() {\n  this.disabled = false;\n  classes(this.el).remove('disabled');\n};\n\nStars.prototype.disable = function Stars_disable() {\n  this.disabled = true;\n  classes(this.el).add('disabled');\n};\n//@ sourceURL=rating/index.js"
));
require.register("rating/template.js", Function("exports, require, module",
"var jade = require('jade-runtime');\nmodule.exports = \nfunction anonymous(locals, attrs, escape, rethrow, merge) {\nattrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;\nvar buf = [];\nwith (locals || {}) {\nvar interp;\nbuf.push('<div class=\"stars\">');\n for (var i = 0; i < stars; ++i)\n{\nbuf.push('<div class=\"star\"></div>');\n}\nbuf.push('</div>');\n}\nreturn buf.join(\"\");\n};\n//@ sourceURL=rating/template.js"
));
require.alias("monstercat-jade-runtime/index.js", "rating/deps/jade-runtime/index.js");
require.alias("monstercat-jade-runtime/index.js", "jade-runtime/index.js");

require.alias("stagas-hover/index.js", "rating/deps/hover/index.js");
require.alias("stagas-hover/index.js", "hover/index.js");
require.alias("stagas-mouseenter/index.js", "stagas-hover/deps/mouseenter/index.js");
require.alias("stagas-within/index.js", "stagas-mouseenter/deps/within/index.js");

require.alias("stagas-mouseleave/index.js", "stagas-hover/deps/mouseleave/index.js");
require.alias("stagas-within/index.js", "stagas-mouseleave/deps/within/index.js");

require.alias("component-range/index.js", "rating/deps/range/index.js");
require.alias("component-range/index.js", "range/index.js");

require.alias("component-emitter/index.js", "rating/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-classes/index.js", "rating/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "rating/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-bind/index.js", "rating/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");

require.alias("component-domify/index.js", "rating/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-each/index.js", "rating/deps/each/index.js");
require.alias("component-each/index.js", "each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("rating/index.js", "rating/index.js");

