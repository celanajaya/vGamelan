(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Loader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
         listeners.fn === fn
      && (!once || listeners.once)
      && (!context || listeners.context === context)
    ) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
           listeners[i].fn !== fn
        || (once && !listeners[i].once)
        || (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
'use strict'

module.exports = function parseURI (str, opts) {
  opts = opts || {}

  var o = {
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
    q: {
      name: 'queryKey',
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  }

  var m = o.parser[opts.strictMode ? 'strict' : 'loose'].exec(str)
  var uri = {}
  var i = 14

  while (i--) uri[o.key[i]] = m[i] || ''

  uri[o.q.name] = {}
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2
  })

  return uri
}

},{}],3:[function(require,module,exports){
'use strict';

var parseUri        = require('parse-uri');
var async           = require('./async');
var Resource        = require('./Resource');
var EventEmitter    = require('eventemitter3');

// some constants
var DEFAULT_CONCURRENCY = 10;
var MAX_PROGRESS = 100;

/**
 * Manages the state and loading of multiple resources to load.
 *
 * @class
 * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
 * @param {number} [concurrency=10] - The number of resources to load concurrently.
 */
function Loader(baseUrl, concurrency) {
    EventEmitter.call(this);

    concurrency = concurrency || DEFAULT_CONCURRENCY;

    /**
     * The base url for all resources loaded by this loader.
     *
     * @member {string}
     */
    this.baseUrl = baseUrl || '';

    /**
     * The progress percent of the loader going through the queue.
     *
     * @member {number}
     */
    this.progress = 0;

    /**
     * Loading state of the loader, true if it is currently loading resources.
     *
     * @member {boolean}
     */
    this.loading = false;

    /**
     * The percentage of total progress that a single resource represents.
     *
     * @member {number}
     */
    this._progressChunk = 0;

    /**
     * The middleware to run before loading each resource.
     *
     * @member {function[]}
     */
    this._beforeMiddleware = [];

    /**
     * The middleware to run after loading each resource.
     *
     * @member {function[]}
     */
    this._afterMiddleware = [];

    /**
     * The `_loadResource` function bound with this object context.
     *
     * @private
     * @member {function}
     */
    this._boundLoadResource = this._loadResource.bind(this);

    /**
     * The resource buffer that fills until `load` is called to start loading resources.
     *
     * @private
     * @member {Resource[]}
     */
    this._buffer = [];

    /**
     * Used to track load completion.
     *
     * @private
     * @member {number}
     */
    this._numToLoad = 0;

    /**
     * The resources waiting to be loaded.
     *
     * @private
     * @member {Resource[]}
     */
    this._queue = async.queue(this._boundLoadResource, concurrency);

    /**
     * All the resources for this loader keyed by name.
     *
     * @member {object<string, Resource>}
     */
    this.resources = {};

    /**
     * Emitted once per loaded or errored resource.
     *
     * @event progress
     * @memberof Loader#
     */

    /**
     * Emitted once per errored resource.
     *
     * @event error
     * @memberof Loader#
     */

    /**
     * Emitted once per loaded resource.
     *
     * @event load
     * @memberof Loader#
     */

    /**
     * Emitted when the loader begins to process the queue.
     *
     * @event start
     * @memberof Loader#
     */

    /**
     * Emitted when the queued resources all load.
     *
     * @event complete
     * @memberof Loader#
     */
}

Loader.prototype = Object.create(EventEmitter.prototype);
Loader.prototype.constructor = Loader;
module.exports = Loader;

/**
 * Adds a resource (or multiple resources) to the loader queue.
 *
 * This function can take a wide variety of different parameters. The only thing that is always
 * required the url to load. All the following will work:
 *
 * ```js
 * loader
 *     // normal param syntax
 *     .add('key', 'http://...', function () {})
 *     .add('http://...', function () {})
 *     .add('http://...')
 *
 *     // object syntax
 *     .add({
 *         name: 'key2',
 *         url: 'http://...'
 *     }, function () {})
 *     .add({
 *         url: 'http://...'
 *     }, function () {})
 *     .add({
 *         name: 'key3',
 *         url: 'http://...'
 *         onComplete: function () {}
 *     })
 *     .add({
 *         url: 'https://...',
 *         onComplete: function () {},
 *         crossOrigin: true
 *     })
 *
 *     // you can also pass an array of objects or urls or both
 *     .add([
 *         { name: 'key4', url: 'http://...', onComplete: function () {} },
 *         { url: 'http://...', onComplete: function () {} },
 *         'http://...'
 *     ])
 *
 *     // and you can use both params and options
 *     .add('key', 'http://...', { crossOrigin: true }, function () {})
 *     .add('http://...', { crossOrigin: true }, function () {});
 * ```
 *
 * @alias enqueue
 * @param {string} [name] - The name of the resource to load, if not passed the url is used.
 * @param {string} [url] - The url for this resource, relative to the baseUrl of this loader.
 * @param {object} [options] - The options for the load.
 * @param {boolean} [options.crossOrigin] - Is this request cross-origin? Default is to determine automatically.
 * @param {Resource.XHR_LOAD_TYPE} [options.loadType=Resource.LOAD_TYPE.XHR] - How should this resource be loaded?
 * @param {Resource.XHR_RESPONSE_TYPE} [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] - How should the data being
 *      loaded be interpreted when using XHR?
 * @param {function} [cb] - Function to call when this specific resource completes loading.
 * @return {Loader} Returns itself.
 */
Loader.prototype.add = Loader.prototype.enqueue = function (name, url, options, cb) {
    // special case of an array of objects or urls
    if (Array.isArray(name)) {
        for (var i = 0; i < name.length; ++i) {
            this.add(name[i]);
        }

        return this;
    }

    // if an object is passed instead of params
    if (typeof name === 'object') {
        cb = url || name.callback || name.onComplete;
        options = name;
        url = name.url;
        name = name.name || name.key || name.url;
    }

    // case where no name is passed shift all args over by one.
    if (typeof url !== 'string') {
        cb = options;
        options = url;
        url = name;
    }

    // now that we shifted make sure we have a proper url.
    if (typeof url !== 'string') {
        throw new Error('No url passed to add resource to loader.');
    }

    // options are optional so people might pass a function and no options
    if (typeof options === 'function') {
        cb = options;
        options = null;
    }

    // check if resource already exists.
    if (this.resources[name]) {
        throw new Error('Resource with name "' + name + '" already exists.');
    }

    // add base url if this isn't an absolute url
    url = this._prepareUrl(url);

    // create the store the resource
    this.resources[name] = new Resource(name, url, options);

    if (typeof cb === 'function') {
        this.resources[name].once('afterMiddleware', cb);
    }

    this._numToLoad++;

    // if already loading add it to the worker queue
    if (this._queue.started) {
        this._queue.push(this.resources[name]);
        this._progressChunk = (MAX_PROGRESS - this.progress) / (this._queue.length() + this._queue.running());
    }
    // otherwise buffer it to be added to the queue later
    else {
        this._buffer.push(this.resources[name]);
        this._progressChunk = MAX_PROGRESS / this._buffer.length;
    }

    return this;
};

/**
 * Sets up a middleware function that will run *before* the
 * resource is loaded.
 *
 * @alias pre
 * @method before
 * @param {function} fn - The middleware function to register.
 * @return {Loader} Returns itself.
 */
Loader.prototype.before = Loader.prototype.pre = function (fn) {
    this._beforeMiddleware.push(fn);

    return this;
};

/**
 * Sets up a middleware function that will run *after* the
 * resource is loaded.
 *
 * @alias use
 * @method after
 * @param {function} fn - The middleware function to register.
 * @return {Loader} Returns itself.
 */
Loader.prototype.after = Loader.prototype.use = function (fn) {
    this._afterMiddleware.push(fn);

    return this;
};

/**
 * Resets the queue of the loader to prepare for a new load.
 *
 * @return {Loader} Returns itself.
 */
Loader.prototype.reset = function () {
    // this.baseUrl = baseUrl || '';

    this.progress = 0;

    this.loading = false;

    this._progressChunk = 0;

    // this._beforeMiddleware.length = 0;
    // this._afterMiddleware.length = 0;

    this._buffer.length = 0;

    this._numToLoad = 0;

    this._queue.kill();
    this._queue.started = false;

    // abort all resource loads
    for (var k in this.resources) {
        var res = this.resources[k];

        res.off('complete', this._onLoad, this);

        if (res.isLoading) {
            res.abort();
        }
    }

    this.resources = {};

    return this;
};

/**
 * Starts loading the queued resources.
 *
 * @fires start
 * @param {function} [cb] - Optional callback that will be bound to the `complete` event.
 * @return {Loader} Returns itself.
 */
Loader.prototype.load = function (cb) {
    // register complete callback if they pass one
    if (typeof cb === 'function') {
        this.once('complete', cb);
    }

    // if the queue has already started we are done here
    if (this._queue.started) {
        return this;
    }

    // notify of start
    this.emit('start', this);

    // update loading state
    this.loading = true;

    // start the internal queue
    for (var i = 0; i < this._buffer.length; ++i) {
        this._queue.push(this._buffer[i]);
    }

    // empty the buffer
    this._buffer.length = 0;

    return this;
};

/**
 * Prepares a url for usage based on the configuration of this object
 *
 * @private
 * @param {string} url - The url to prepare.
 * @return {string} The prepared url.
 */
Loader.prototype._prepareUrl = function (url) {
    var parsedUrl = parseUri(url, { strictMode: true });

    // absolute url, just use it as is.
    if (parsedUrl.protocol || !parsedUrl.path || parsedUrl.path.indexOf('//') === 0) {
        return url;
    }

    // if baseUrl doesn't end in slash and url doesn't start with slash, then add a slash inbetween
    if (this.baseUrl.length
        && this.baseUrl.lastIndexOf('/') !== this.baseUrl.length - 1
        && url.charAt(0) !== '/'
    ) {
        return this.baseUrl + '/' + url;
    }

    return this.baseUrl + url;
};

/**
 * Loads a single resource.
 *
 * @private
 * @param {Resource} resource - The resource to load.
 * @param {function} dequeue - The function to call when we need to dequeue this item.
 */
Loader.prototype._loadResource = function (resource, dequeue) {
    var self = this;

    resource._dequeue = dequeue;

    // run before middleware
    async.eachSeries(
        this._beforeMiddleware,
        function (fn, next) {
            fn.call(self, resource, function () {
                // if the before middleware marks the resource as complete,
                // break and don't process any more before middleware
                next(resource.isComplete ? {} : null);
            });
        },
        function () {
            // resource.on('progress', self.emit.bind(self, 'progress'));

            if (resource.isComplete) {
                self._onLoad(resource);
            }
            else {
                resource.once('complete', self._onLoad, self);
                resource.load();
            }
        }
    );
};

/**
 * Called once each resource has loaded.
 *
 * @fires complete
 * @private
 */
Loader.prototype._onComplete = function () {
    this.loading = false;

    this.emit('complete', this, this.resources);
};

/**
 * Called each time a resources is loaded.
 *
 * @fires progress
 * @fires error
 * @fires load
 * @private
 * @param {Resource} resource - The resource that was loaded
 */
Loader.prototype._onLoad = function (resource) {
    var self = this;

    // run middleware, this *must* happen before dequeue so sub-assets get added properly
    async.eachSeries(
        this._afterMiddleware,
        function (fn, next) {
            fn.call(self, resource, next);
        },
        function () {
            resource.emit('afterMiddleware', resource);

            self._numToLoad--;

            self.progress += self._progressChunk;
            self.emit('progress', self, resource);

            if (resource.error) {
                self.emit('error', resource.error, self, resource);
            }
            else {
                self.emit('load', self, resource);
            }

            // do completion check
            if (self._numToLoad === 0) {
                self.progress = 100;
                self._onComplete();
            }
        }
    );

    // remove this resource from the async queue
    resource._dequeue();
};

Loader.LOAD_TYPE = Resource.LOAD_TYPE;
Loader.XHR_RESPONSE_TYPE = Resource.XHR_RESPONSE_TYPE;

},{"./Resource":4,"./async":5,"eventemitter3":1,"parse-uri":2}],4:[function(require,module,exports){
'use strict';

var EventEmitter    = require('eventemitter3');
var parseUri        = require('parse-uri');

// tests is CORS is supported in XHR, if not we need to use XDR
var useXdr = !!(window.XDomainRequest && !('withCredentials' in (new XMLHttpRequest())));
var tempAnchor = null;

// some status constants
var STATUS_NONE = 0;
var STATUS_OK = 200;
var STATUS_EMPTY = 204;

/**
 * Manages the state and loading of a single resource represented by
 * a single URL.
 *
 * @class
 * @param {string} name - The name of the resource to load.
 * @param {string|string[]} url - The url for this resource, for audio/video loads you can pass an array of sources.
 * @param {object} [options] - The options for the load.
 * @param {string|boolean} [options.crossOrigin] - Is this request cross-origin? Default is to determine automatically.
 * @param {Resource.LOAD_TYPE} [options.loadType=Resource.LOAD_TYPE.XHR] - How should this resource be loaded?
 * @param {Resource.XHR_RESPONSE_TYPE} [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] - How should the data being
 *      loaded be interpreted when using XHR?
 * @param {object} [options.metadata] - Extra info for middleware.
 */
function Resource(name, url, options) {
    EventEmitter.call(this);

    options = options || {};

    if (typeof name !== 'string' || typeof url !== 'string') {
        throw new Error('Both name and url are required for constructing a resource.');
    }

    /**
     * The name of this resource.
     *
     * @member {string}
     * @readonly
     */
    this.name = name;

    /**
     * The url used to load this resource.
     *
     * @member {string}
     * @readonly
     */
    this.url = url;

    /**
     * Stores whether or not this url is a data url.
     *
     * @member {boolean}
     * @readonly
     */
    this.isDataUrl = this.url.indexOf('data:') === 0;

    /**
     * The data that was loaded by the resource.
     *
     * @member {any}
     */
    this.data = null;

    /**
     * Is this request cross-origin? If unset, determined automatically.
     *
     * @member {string}
     */
    this.crossOrigin = options.crossOrigin === true ? 'anonymous' : options.crossOrigin;

    /**
     * The method of loading to use for this resource.
     *
     * @member {Resource.LOAD_TYPE}
     */
    this.loadType = options.loadType || this._determineLoadType();

    /**
     * The type used to load the resource via XHR. If unset, determined automatically.
     *
     * @member {string}
     */
    this.xhrType = options.xhrType;

    /**
     * Extra info for middleware, and controlling specifics about how the resource loads.
     *
     * Note that if you pass in a `loadElement`, the Resource class takes ownership of it.
     * Meaning it will modify it as it sees fit.
     *
     * @member {object}
     * @property {HTMLImageElement|HTMLAudioElement|HTMLVideoElement} [loadElement=null] - The
     *  element to use for loading, instead of creating one.
     * @property {boolean} [skipSource=false] - Skips adding source(s) to the load element. This
     *  is useful if you want to pass in a `loadElement` that you already added load sources
     *  to.
     */
    this.metadata = options.metadata || {};

    /**
     * The error that occurred while loading (if any).
     *
     * @member {Error}
     * @readonly
     */
    this.error = null;

    /**
     * The XHR object that was used to load this resource. This is only set
     * when `loadType` is `Resource.LOAD_TYPE.XHR`.
     *
     * @member {XMLHttpRequest}
     */
    this.xhr = null;

    /**
     * Describes if this resource was loaded as json. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isJson = false;

    /**
     * Describes if this resource was loaded as xml. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isXml = false;

    /**
     * Describes if this resource was loaded as an image tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isImage = false;

    /**
     * Describes if this resource was loaded as an audio tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isAudio = false;

    /**
     * Describes if this resource was loaded as a video tag. Only valid after the resource
     * has completely loaded.
     *
     * @member {boolean}
     */
    this.isVideo = false;

    /**
     * Describes if this resource has finished loading. Is true when the resource has completely
     * loaded.
     *
     * @member {boolean}
     */
    this.isComplete = false;

    /**
     * Describes if this resource is currently loading. Is true when the resource starts loading,
     * and is false again when complete.
     *
     * @member {boolean}
     */
    this.isLoading = false;

    /**
     * The `dequeue` method that will be used a storage place for the async queue dequeue method
     * used privately by the loader.
     *
     * @private
     * @member {function}
     */
    this._dequeue = null;

    /**
     * The `complete` function bound to this resource's context.
     *
     * @private
     * @member {function}
     */
    this._boundComplete = this.complete.bind(this);

    /**
     * The `_onError` function bound to this resource's context.
     *
     * @private
     * @member {function}
     */
    this._boundOnError = this._onError.bind(this);

    /**
     * The `_onProgress` function bound to this resource's context.
     *
     * @private
     * @member {function}
     */
    this._boundOnProgress = this._onProgress.bind(this);

    // xhr callbacks
    this._boundXhrOnError = this._xhrOnError.bind(this);
    this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
    this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
    this._boundXdrOnTimeout = this._xdrOnTimeout.bind(this);

    /**
     * Emitted when the resource beings to load.
     *
     * @event start
     * @memberof Resource#
     */

    /**
     * Emitted each time progress of this resource load updates.
     * Not all resources types and loader systems can support this event
     * so sometimes it may not be available. If the resource
     * is being loaded on a modern browser, using XHR, and the remote server
     * properly sets Content-Length headers, then this will be available.
     *
     * @event progress
     * @memberof Resource#
     */

    /**
     * Emitted once this resource has loaded, if there was an error it will
     * be in the `error` property.
     *
     * @event complete
     * @memberof Resource#
     */
}

Resource.prototype = Object.create(EventEmitter.prototype);
Resource.prototype.constructor = Resource;
module.exports = Resource;

/**
 * Marks the resource as complete.
 *
 * @fires complete
 */
Resource.prototype.complete = function () {
    // TODO: Clean this up in a wrapper or something...gross....
    if (this.data && this.data.removeEventListener) {
        this.data.removeEventListener('error', this._boundOnError, false);
        this.data.removeEventListener('load', this._boundComplete, false);
        this.data.removeEventListener('progress', this._boundOnProgress, false);
        this.data.removeEventListener('canplaythrough', this._boundComplete, false);
    }

    if (this.xhr) {
        if (this.xhr.removeEventListener) {
            this.xhr.removeEventListener('error', this._boundXhrOnError, false);
            this.xhr.removeEventListener('abort', this._boundXhrOnAbort, false);
            this.xhr.removeEventListener('progress', this._boundOnProgress, false);
            this.xhr.removeEventListener('load', this._boundXhrOnLoad, false);
        }
        else {
            this.xhr.onerror = null;
            this.xhr.ontimeout = null;
            this.xhr.onprogress = null;
            this.xhr.onload = null;
        }
    }

    if (this.isComplete) {
        throw new Error('Complete called again for an already completed resource.');
    }

    this.isComplete = true;
    this.isLoading = false;

    this.emit('complete', this);
};

/**
 * Aborts the loading of this resource, with an optional message.
 *
 * @param {string} message - The message to use for the error
 */
Resource.prototype.abort = function (message) {
    // abort can be called multiple times, ignore subsequent calls.
    if (this.error) {
        return;
    }

    // store error
    this.error = new Error(message);

    // abort the actual loading
    if (this.xhr) {
        this.xhr.abort();
    }
    else if (this.xdr) {
        this.xdr.abort();
    }
    else if (this.data) {
        // single source
        if (typeof this.data.src !== 'undefined') {
            this.data.src = '';
        }
        // multi-source
        else {
            while (this.data.firstChild) {
                this.data.removeChild(this.data.firstChild);
            }
        }
    }

    // done now.
    this.complete();
};

/**
 * Kicks off loading of this resource. This method is asynchronous.
 *
 * @fires start
 * @param {function} [cb] - Optional callback to call once the resource is loaded.
 */
Resource.prototype.load = function (cb) {
    if (this.isLoading) {
        return;
    }

    if (this.isComplete) {
        if (cb) {
            var self = this;

            setTimeout(function () {
                cb(self);
            }, 1);
        }

        return;
    }
    else if (cb) {
        this.once('complete', cb);
    }

    this.isLoading = true;

    this.emit('start', this);

    // if unset, determine the value
    if (this.crossOrigin === false || typeof this.crossOrigin !== 'string') {
        this.crossOrigin = this._determineCrossOrigin(this.url);
    }

    switch (this.loadType) {
        case Resource.LOAD_TYPE.IMAGE:
            this._loadElement('image');
            break;

        case Resource.LOAD_TYPE.AUDIO:
            this._loadSourceElement('audio');
            break;

        case Resource.LOAD_TYPE.VIDEO:
            this._loadSourceElement('video');
            break;

        case Resource.LOAD_TYPE.XHR:
            /* falls through */
        default:
            if (useXdr && this.crossOrigin) {
                this._loadXdr();
            }
            else {
                this._loadXhr();
            }
            break;
    }
};

/**
 * Loads this resources using an element that has a single source,
 * like an HTMLImageElement.
 *
 * @private
 * @param {string} type - The type of element to use.
 */
Resource.prototype._loadElement = function (type) {
    if (this.metadata.loadElement) {
        this.data = this.metadata.loadElement;
    }
    else if (type === 'image' && typeof window.Image !== 'undefined') {
        this.data = new Image();
    }
    else {
        this.data = document.createElement(type);
    }

    if (this.crossOrigin) {
        this.data.crossOrigin = this.crossOrigin;
    }

    if (!this.metadata.skipSource) {
        this.data.src = this.url;
    }

    var typeName = 'is' + type[0].toUpperCase() + type.substring(1);

    if (this[typeName] === false) {
        this[typeName] = true;
    }

    this.data.addEventListener('error', this._boundOnError, false);
    this.data.addEventListener('load', this._boundComplete, false);
    this.data.addEventListener('progress', this._boundOnProgress, false);
};

/**
 * Loads this resources using an element that has multiple sources,
 * like an HTMLAudioElement or HTMLVideoElement.
 *
 * @private
 * @param {string} type - The type of element to use.
 */
Resource.prototype._loadSourceElement = function (type) {
    if (this.metadata.loadElement) {
        this.data = this.metadata.loadElement;
    }
    else if (type === 'audio' && typeof window.Audio !== 'undefined') {
        this.data = new Audio();
    }
    else {
        this.data = document.createElement(type);
    }

    if (this.data === null) {
        this.abort('Unsupported element ' + type);

        return;
    }

    if (!this.metadata.skipSource) {
        // support for CocoonJS Canvas+ runtime, lacks document.createElement('source')
        if (navigator.isCocoonJS) {
            this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
        }
        else if (Array.isArray(this.url)) {
            for (var i = 0; i < this.url.length; ++i) {
                this.data.appendChild(this._createSource(type, this.url[i]));
            }
        }
        else {
            this.data.appendChild(this._createSource(type, this.url));
        }
    }

    this['is' + type[0].toUpperCase() + type.substring(1)] = true;

    this.data.addEventListener('error', this._boundOnError, false);
    this.data.addEventListener('load', this._boundComplete, false);
    this.data.addEventListener('progress', this._boundOnProgress, false);
    this.data.addEventListener('canplaythrough', this._boundComplete, false);

    this.data.load();
};

/**
 * Loads this resources using an XMLHttpRequest.
 *
 * @private
 */
Resource.prototype._loadXhr = function () {
    // if unset, determine the value
    if (typeof this.xhrType !== 'string') {
        this.xhrType = this._determineXhrType();
    }

    var xhr = this.xhr = new XMLHttpRequest();

    // set the request type and url
    xhr.open('GET', this.url, true);

    // load json as text and parse it ourselves. We do this because some browsers
    // *cough* safari *cough* can't deal with it.
    if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
        xhr.responseType = Resource.XHR_RESPONSE_TYPE.TEXT;
    }
    else {
        xhr.responseType = this.xhrType;
    }

    xhr.addEventListener('error', this._boundXhrOnError, false);
    xhr.addEventListener('abort', this._boundXhrOnAbort, false);
    xhr.addEventListener('progress', this._boundOnProgress, false);
    xhr.addEventListener('load', this._boundXhrOnLoad, false);

    xhr.send();
};

/**
 * Loads this resources using an XDomainRequest. This is here because we need to support IE9 (gross).
 *
 * @private
 */
Resource.prototype._loadXdr = function () {
    // if unset, determine the value
    if (typeof this.xhrType !== 'string') {
        this.xhrType = this._determineXhrType();
    }

    var xdr = this.xhr = new XDomainRequest();

    // XDomainRequest has a few quirks. Occasionally it will abort requests
    // A way to avoid this is to make sure ALL callbacks are set even if not used
    // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
    xdr.timeout = 5000;

    xdr.onerror = this._boundXhrOnError;
    xdr.ontimeout = this._boundXdrOnTimeout;
    xdr.onprogress = this._boundOnProgress;
    xdr.onload = this._boundXhrOnLoad;

    xdr.open('GET', this.url, true);

    // Note: The xdr.send() call is wrapped in a timeout to prevent an
    // issue with the interface where some requests are lost if multiple
    // XDomainRequests are being sent at the same time.
    // Some info here: https://github.com/photonstorm/phaser/issues/1248
    setTimeout(function () {
        xdr.send();
    }, 0);
};

/**
 * Creates a source used in loading via an element.
 *
 * @private
 * @param {string} type - The element type (video or audio).
 * @param {string} url - The source URL to load from.
 * @param {string} [mime] - The mime type of the video
 * @return {HTMLSourceElement} The source element.
 */
Resource.prototype._createSource = function (type, url, mime) {
    if (!mime) {
        mime = type + '/' + url.substr(url.lastIndexOf('.') + 1);
    }

    var source = document.createElement('source');

    source.src = url;
    source.type = mime;

    return source;
};

/**
 * Called if a load errors out.
 *
 * @param {Event} event - The error event from the element that emits it.
 * @private
 */
Resource.prototype._onError = function (event) {
    this.abort('Failed to load element using ' + event.target.nodeName);
};

/**
 * Called if a load progress event fires for xhr/xdr.
 *
 * @fires progress
 * @private
 * @param {XMLHttpRequestProgressEvent|Event} event - Progress event.
 */
Resource.prototype._onProgress = function (event) {
    if (event && event.lengthComputable) {
        this.emit('progress', this, event.loaded / event.total);
    }
};

/**
 * Called if an error event fires for xhr/xdr.
 *
 * @private
 * @param {XMLHttpRequestErrorEvent|Event} event - Error event.
 */
Resource.prototype._xhrOnError = function () {
    var xhr = this.xhr;

    this.abort(reqType(xhr) + ' Request failed. Status: ' + xhr.status + ', text: "' + xhr.statusText + '"');
};

/**
 * Called if an abort event fires for xhr.
 *
 * @private
 * @param {XMLHttpRequestAbortEvent} event - Abort Event
 */
Resource.prototype._xhrOnAbort = function () {
    this.abort(reqType(this.xhr) + ' Request was aborted by the user.');
};

/**
 * Called if a timeout event fires for xdr.
 *
 * @private
 * @param {Event} event - Timeout event.
 */
Resource.prototype._xdrOnTimeout = function () {
    this.abort(reqType(this.xhr) + ' Request timed out.');
};

/**
 * Called when data successfully loads from an xhr/xdr request.
 *
 * @private
 * @param {XMLHttpRequestLoadEvent|Event} event - Load event
 */
Resource.prototype._xhrOnLoad = function () {
    var xhr = this.xhr;
    var status = typeof xhr.status === 'undefined' ? xhr.status : STATUS_OK; // XDR has no `.status`, assume 200.

    // status can be 0 when using the file:// protocol, also check if a response was found
    if (status === STATUS_OK || status === STATUS_EMPTY || (status === STATUS_NONE && xhr.responseText.length > 0)) {
        // if text, just return it
        if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
            this.data = xhr.responseText;
        }
        // if json, parse into json object
        else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
            try {
                this.data = JSON.parse(xhr.responseText);
                this.isJson = true;
            }
            catch (e) {
                this.abort('Error trying to parse loaded json:', e);

                return;
            }
        }
        // if xml, parse into an xml document or div element
        else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
            try {
                if (window.DOMParser) {
                    var domparser = new DOMParser();

                    this.data = domparser.parseFromString(xhr.responseText, 'text/xml');
                }
                else {
                    var div = document.createElement('div');

                    div.innerHTML = xhr.responseText;
                    this.data = div;
                }
                this.isXml = true;
            }
            catch (e) {
                this.abort('Error trying to parse loaded xml:', e);

                return;
            }
        }
        // other types just return the response
        else {
            this.data = xhr.response || xhr.responseText;
        }
    }
    else {
        this.abort('[' + xhr.status + ']' + xhr.statusText + ':' + xhr.responseURL);

        return;
    }

    this.complete();
};

/**
 * Sets the `crossOrigin` property for this resource based on if the url
 * for this resource is cross-origin. If crossOrigin was manually set, this
 * function does nothing.
 *
 * @private
 * @param {string} url - The url to test.
 * @param {object} [loc=window.location] - The location object to test against.
 * @return {string} The crossOrigin value to use (or empty string for none).
 */
Resource.prototype._determineCrossOrigin = function (url, loc) {
    // data: and javascript: urls are considered same-origin
    if (url.indexOf('data:') === 0) {
        return '';
    }

    // default is window.location
    loc = loc || window.location;

    if (!tempAnchor) {
        tempAnchor = document.createElement('a');
    }

    // let the browser determine the full href for the url of this resource and then
    // parse with the node url lib, we can't use the properties of the anchor element
    // because they don't work in IE9 :(
    tempAnchor.href = url;
    url = parseUri(tempAnchor.href, { strictMode: true });

    var samePort = (!url.port && loc.port === '') || (url.port === loc.port);
    var protocol = url.protocol ? url.protocol + ':' : '';

    // if cross origin
    if (url.host !== loc.hostname || !samePort || protocol !== loc.protocol) {
        return 'anonymous';
    }

    return '';
};

/**
 * Determines the responseType of an XHR request based on the extension of the
 * resource being loaded.
 *
 * @private
 * @return {Resource.XHR_RESPONSE_TYPE} The responseType to use.
 */
Resource.prototype._determineXhrType = function () {
    return Resource._xhrTypeMap[this._getExtension()] || Resource.XHR_RESPONSE_TYPE.TEXT;
};

Resource.prototype._determineLoadType = function () {
    return Resource._loadTypeMap[this._getExtension()] || Resource.LOAD_TYPE.XHR;
};

Resource.prototype._getExtension = function () {
    var url = this.url;
    var ext = '';

    if (this.isDataUrl) {
        var slashIndex = url.indexOf('/');

        ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
    }
    else {
        var queryStart = url.indexOf('?');

        if (queryStart !== -1) {
            url = url.substring(0, queryStart);
        }

        ext = url.substring(url.lastIndexOf('.') + 1);
    }

    return ext.toLowerCase();
};

/**
 * Determines the mime type of an XHR request based on the responseType of
 * resource being loaded.
 *
 * @private
 * @param {Resource.XHR_RESPONSE_TYPE} type - The type to get a mime type for.
 * @return {string} The mime type to use.
 */
Resource.prototype._getMimeFromXhrType = function (type) {
    switch (type) {
        case Resource.XHR_RESPONSE_TYPE.BUFFER:
            return 'application/octet-binary';

        case Resource.XHR_RESPONSE_TYPE.BLOB:
            return 'application/blob';

        case Resource.XHR_RESPONSE_TYPE.DOCUMENT:
            return 'application/xml';

        case Resource.XHR_RESPONSE_TYPE.JSON:
            return 'application/json';

        case Resource.XHR_RESPONSE_TYPE.DEFAULT:
        case Resource.XHR_RESPONSE_TYPE.TEXT:
            /* falls through */
        default:
            return 'text/plain';

    }
};

/**
 * Quick helper to get string xhr type.
 *
 * @ignore
 * @param {XMLHttpRequest|XDomainRequest} xhr - The request to check.
 * @return {string} The type.
 */
function reqType(xhr) {
    return xhr.toString().replace('object ', '');
}

/**
 * The types of loading a resource can use.
 *
 * @static
 * @readonly
 * @enum {number}
 */
Resource.LOAD_TYPE = {
    /** Uses XMLHttpRequest to load the resource. */
    XHR:    1,
    /** Uses an `Image` object to load the resource. */
    IMAGE:  2,
    /** Uses an `Audio` object to load the resource. */
    AUDIO:  3,
    /** Uses a `Video` object to load the resource. */
    VIDEO:  4
};

/**
 * The XHR ready states, used internally.
 *
 * @static
 * @readonly
 * @enum {string}
 */
Resource.XHR_RESPONSE_TYPE = {
    /** defaults to text */
    DEFAULT:    'text',
    /** ArrayBuffer */
    BUFFER:     'arraybuffer',
    /** Blob */
    BLOB:       'blob',
    /** Document */
    DOCUMENT:   'document',
    /** Object */
    JSON:       'json',
    /** String */
    TEXT:       'text'
};

Resource._loadTypeMap = {
    gif:      Resource.LOAD_TYPE.IMAGE,
    png:      Resource.LOAD_TYPE.IMAGE,
    bmp:      Resource.LOAD_TYPE.IMAGE,
    jpg:      Resource.LOAD_TYPE.IMAGE,
    jpeg:     Resource.LOAD_TYPE.IMAGE,
    tif:      Resource.LOAD_TYPE.IMAGE,
    tiff:     Resource.LOAD_TYPE.IMAGE,
    webp:     Resource.LOAD_TYPE.IMAGE,
    tga:      Resource.LOAD_TYPE.IMAGE,
    'svg+xml':  Resource.LOAD_TYPE.IMAGE
};

Resource._xhrTypeMap = {
    // xml
    xhtml:    Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    html:     Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    htm:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    xml:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tmx:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tsx:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    svg:      Resource.XHR_RESPONSE_TYPE.DOCUMENT,

    // images
    gif:      Resource.XHR_RESPONSE_TYPE.BLOB,
    png:      Resource.XHR_RESPONSE_TYPE.BLOB,
    bmp:      Resource.XHR_RESPONSE_TYPE.BLOB,
    jpg:      Resource.XHR_RESPONSE_TYPE.BLOB,
    jpeg:     Resource.XHR_RESPONSE_TYPE.BLOB,
    tif:      Resource.XHR_RESPONSE_TYPE.BLOB,
    tiff:     Resource.XHR_RESPONSE_TYPE.BLOB,
    webp:     Resource.XHR_RESPONSE_TYPE.BLOB,
    tga:      Resource.XHR_RESPONSE_TYPE.BLOB,

    // json
    json:     Resource.XHR_RESPONSE_TYPE.JSON,

    // text
    text:     Resource.XHR_RESPONSE_TYPE.TEXT,
    txt:      Resource.XHR_RESPONSE_TYPE.TEXT
};

/**
 * Sets the load type to be used for a specific extension.
 *
 * @static
 * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
 * @param {Resource.LOAD_TYPE} loadType - The load type to set it to.
 */
Resource.setExtensionLoadType = function (extname, loadType) {
    setExtMap(Resource._loadTypeMap, extname, loadType);
};

/**
 * Sets the load type to be used for a specific extension.
 *
 * @static
 * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
 * @param {Resource.XHR_RESPONSE_TYPE} xhrType - The xhr type to set it to.
 */
Resource.setExtensionXhrType = function (extname, xhrType) {
    setExtMap(Resource._xhrTypeMap, extname, xhrType);
};

function setExtMap(map, extname, val) {
    if (extname && extname.indexOf('.') === 0) {
        extname = extname.substring(1);
    }

    if (!extname) {
        return;
    }

    map[extname] = val;
}

},{"eventemitter3":1,"parse-uri":2}],5:[function(require,module,exports){
'use strict';

/**
 * Smaller version of the async library constructs.
 *
 */

module.exports = {
    eachSeries: asyncEachSeries,
    queue: asyncQueue
};

function _noop() { /* empty */ }

/**
 * Iterates an array in series.
 *
 * @param {*[]} array - Array to iterate.
 * @param {function} iterator - Function to call for each element.
 * @param {function} callback - Function to call when done, or on error.
 */
function asyncEachSeries(array, iterator, callback) {
    var i = 0;
    var len = array.length;

    (function next(err) {
        if (err || i === len) {
            if (callback) {
                callback(err);
            }

            return;
        }

        iterator(array[i++], next);
    })();
}

/**
 * Ensures a function is only called once.
 *
 * @param {function} fn - The function to wrap.
 * @return {function} The wrapping function.
 */
function onlyOnce(fn) {
    return function onceWrapper() {
        if (fn === null) {
            throw new Error('Callback was already called.');
        }

        var callFn = fn;

        fn = null;
        callFn.apply(this, arguments);
    };
}

/**
 * Async queue implementation,
 *
 * @param {function} worker - The worker function to call for each task.
 * @param {number} concurrency - How many workers to run in parrallel.
 * @return {*} The async queue object.
 */
function asyncQueue(worker, concurrency) {
    if (concurrency == null) { // eslint-disable-line no-eq-null,eqeqeq
        concurrency = 1;
    }
    else if (concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    var workers = 0;
    var q = {
        _tasks: [],
        concurrency: concurrency,
        saturated: _noop,
        unsaturated: _noop,
        buffer: concurrency / 4,
        empty: _noop,
        drain: _noop,
        error: _noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = _noop;
            q._tasks = [];
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        process: function () {
            while (!q.paused && workers < q.concurrency && q._tasks.length) {
                var task = q._tasks.shift();

                if (q._tasks.length === 0) {
                    q.empty();
                }

                workers += 1;

                if (workers === q.concurrency) {
                    q.saturated();
                }

                worker(task.data, onlyOnce(_next(task)));
            }
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return workers;
        },
        idle: function () {
            return q._tasks.length + workers === 0;
        },
        pause: function () {
            if (q.paused === true) {
                return;
            }

            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) {
                return;
            }

            q.paused = false;

            // Need to call q.process once per concurrent
            // worker to preserve full concurrency after pause
            for (var w = 1; w <= q.concurrency; w++) {
                q.process();
            }
        }
    };

    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') { // eslint-disable-line no-eq-null,eqeqeq
            throw new Error('task callback must be a function');
        }

        q.started = true;

        if (data == null && q.idle()) { // eslint-disable-line no-eq-null,eqeqeq
            // call drain immediately if there are no tasks
            setTimeout(function () {
                q.drain();
            }, 1);

            return;
        }

        var item = {
            data: data,
            callback: typeof callback === 'function' ? callback : _noop
        };

        if (insertAtFront) {
            q._tasks.unshift(item);
        }
        else {
            q._tasks.push(item);
        }

        setTimeout(function () {
            q.process();
        }, 1);
    }

    function _next(task) {
        return function () {
            workers -= 1;

            task.callback.apply(task, arguments);

            if (arguments[0] != null) { // eslint-disable-line no-eq-null,eqeqeq
                q.error(arguments[0], task.data);
            }

            if (workers <= (q.concurrency - q.buffer)) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }

            q.process();
        };
    }

    return q;
}

},{}],6:[function(require,module,exports){
/* eslint no-magic-numbers: 0 */
'use strict';

module.exports = {
    // private property
    _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encodeBinary: function (input) {
        var output = '';
        var bytebuffer;
        var encodedCharIndexes = new Array(4);
        var inx = 0;
        var jnx = 0;
        var paddingBytes = 0;

        while (inx < input.length) {
            // Fill byte buffer array
            bytebuffer = new Array(3);

            for (jnx = 0; jnx < bytebuffer.length; jnx++) {
                if (inx < input.length) {
                    // throw away high-order byte, as documented at:
                    // https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
                    bytebuffer[jnx] = input.charCodeAt(inx++) & 0xff;
                }
                else {
                    bytebuffer[jnx] = 0;
                }
            }

            // Get each encoded character, 6 bits at a time
            // index 1: first 6 bits
            encodedCharIndexes[0] = bytebuffer[0] >> 2;
            // index 2: second 6 bits (2 least significant bits from input byte 1 + 4 most significant bits from byte 2)
            encodedCharIndexes[1] = ((bytebuffer[0] & 0x3) << 4) | (bytebuffer[1] >> 4);
            // index 3: third 6 bits (4 least significant bits from input byte 2 + 2 most significant bits from byte 3)
            encodedCharIndexes[2] = ((bytebuffer[1] & 0x0f) << 2) | (bytebuffer[2] >> 6);
            // index 3: forth 6 bits (6 least significant bits from input byte 3)
            encodedCharIndexes[3] = bytebuffer[2] & 0x3f;

            // Determine whether padding happened, and adjust accordingly
            paddingBytes = inx - (input.length - 1);
            switch (paddingBytes) {
                case 2:
                    // Set last 2 characters to padding char
                    encodedCharIndexes[3] = 64;
                    encodedCharIndexes[2] = 64;
                    break;

                case 1:
                    // Set last character to padding char
                    encodedCharIndexes[3] = 64;
                    break;

                default:
                    break; // No padding - proceed
            }

            // Now we will grab each appropriate character out of our keystring
            // based on our index array and append it to the output string
            for (jnx = 0; jnx < encodedCharIndexes.length; jnx++) {
                output += this._keyStr.charAt(encodedCharIndexes[jnx]);
            }
        }

        return output;
    }
};

},{}],7:[function(require,module,exports){
/* eslint global-require: 0 */
'use strict';

module.exports = require('./Loader');
module.exports.Resource = require('./Resource');
module.exports.middleware = {
    caching: {
        memory: require('./middlewares/caching/memory')
    },
    parsing: {
        blob: require('./middlewares/parsing/blob')
    }
};

module.exports.async = require('./async');

},{"./Loader":3,"./Resource":4,"./async":5,"./middlewares/caching/memory":8,"./middlewares/parsing/blob":9}],8:[function(require,module,exports){
'use strict';

// a simple in-memory cache for resources
var cache = {};

module.exports = function () {
    return function (resource, next) {
        // if cached, then set data and complete the resource
        if (cache[resource.url]) {
            resource.data = cache[resource.url];
            resource.complete(); // marks resource load complete and stops processing before middlewares
        }
        // if not cached, wait for complete and store it in the cache.
        else {
            resource.once('complete', function () {
                cache[this.url] = this.data;
            });
        }

        next();
    };
};

},{}],9:[function(require,module,exports){
'use strict';

var Resource = require('../../Resource');
var b64 = require('../../b64');

var Url = window.URL || window.webkitURL;

// a middleware for transforming XHR loaded Blobs into more useful objects

module.exports = function () {
    return function (resource, next) {
        if (!resource.data) {
            next();

            return;
        }

        // if this was an XHR load of a blob
        if (resource.xhr && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BLOB) {
            // if there is no blob support we probably got a binary string back
            if (!window.Blob || typeof resource.data === 'string') {
                var type = resource.xhr.getResponseHeader('content-type');

                // this is an image, convert the binary string into a data url
                if (type && type.indexOf('image') === 0) {
                    resource.data = new Image();
                    resource.data.src = 'data:' + type + ';base64,' + b64.encodeBinary(resource.xhr.responseText);

                    resource.isImage = true;

                    // wait until the image loads and then callback
                    resource.data.onload = function () {
                        resource.data.onload = null;

                        next();
                    };

                    // next will be called on load
                    return;
                }
            }
            // if content type says this is an image, then we should transform the blob into an Image object
            else if (resource.data.type.indexOf('image') === 0) {
                var src = Url.createObjectURL(resource.data);

                resource.blob = resource.data;
                resource.data = new Image();
                resource.data.src = src;

                resource.isImage = true;

                // cleanup the no longer used blob after the image loads
                resource.data.onload = function () {
                    Url.revokeObjectURL(src);
                    resource.data.onload = null;

                    next();
                };

                // next will be called on load.
                return;
            }
        }

        next();
    };
};

},{"../../Resource":4,"../../b64":6}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXZlbnRlbWl0dGVyMy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZS11cmkvaW5kZXguanMiLCJzcmMvTG9hZGVyLmpzIiwic3JjL1Jlc291cmNlLmpzIiwic3JjL2FzeW5jLmpzIiwic3JjL2I2NC5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9taWRkbGV3YXJlcy9jYWNoaW5nL21lbW9yeS5qcyIsInNyYy9taWRkbGV3YXJlcy9wYXJzaW5nL2Jsb2IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaDVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHByZWZpeCA9ICd+JztcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciB0byBjcmVhdGUgYSBzdG9yYWdlIGZvciBvdXIgYEVFYCBvYmplY3RzLlxuICogQW4gYEV2ZW50c2AgaW5zdGFuY2UgaXMgYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRXZlbnRzKCkge31cblxuLy9cbi8vIFdlIHRyeSB0byBub3QgaW5oZXJpdCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC4gSW4gc29tZSBlbmdpbmVzIGNyZWF0aW5nIGFuXG4vLyBpbnN0YW5jZSBpbiB0aGlzIHdheSBpcyBmYXN0ZXIgdGhhbiBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKG51bGwpYCBkaXJlY3RseS5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBjaGFyYWN0ZXIgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Rcbi8vIG92ZXJyaWRkZW4gb3IgdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy9cbmlmIChPYmplY3QuY3JlYXRlKSB7XG4gIEV2ZW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIC8vXG4gIC8vIFRoaXMgaGFjayBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgYF9fcHJvdG9fX2AgcHJvcGVydHkgaXMgc3RpbGwgaW5oZXJpdGVkIGluXG4gIC8vIHNvbWUgb2xkIGJyb3dzZXJzIGxpa2UgQW5kcm9pZCA0LCBpUGhvbmUgNS4xLCBPcGVyYSAxMSBhbmQgU2FmYXJpIDUuXG4gIC8vXG4gIGlmICghbmV3IEV2ZW50cygpLl9fcHJvdG9fXykgcHJlZml4ID0gZmFsc2U7XG59XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgZXZlbnQgbGlzdGVuZXIuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvbmNlPWZhbHNlXSBTcGVjaWZ5IGlmIHRoZSBsaXN0ZW5lciBpcyBhIG9uZS10aW1lIGxpc3RlbmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgYEV2ZW50RW1pdHRlcmAgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIGBFdmVudEVtaXR0ZXJgIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IGxpc3RpbmcgdGhlIGV2ZW50cyBmb3Igd2hpY2ggdGhlIGVtaXR0ZXIgaGFzIHJlZ2lzdGVyZWRcbiAqIGxpc3RlbmVycy5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICB2YXIgbmFtZXMgPSBbXVxuICAgICwgZXZlbnRzXG4gICAgLCBuYW1lO1xuXG4gIGlmICh0aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgcmV0dXJuIG5hbWVzO1xuXG4gIGZvciAobmFtZSBpbiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzKSkge1xuICAgIGlmIChoYXMuY2FsbChldmVudHMsIG5hbWUpKSBuYW1lcy5wdXNoKHByZWZpeCA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lKTtcbiAgfVxuXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgcmV0dXJuIG5hbWVzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGV2ZW50cykpO1xuICB9XG5cbiAgcmV0dXJuIG5hbWVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3RlbmVycyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBPbmx5IGNoZWNrIGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogQ2FsbHMgZWFjaCBvZiB0aGUgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGVsc2UgYGZhbHNlYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMiwgYTMpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBBZGQgYSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lciwgdGhpcy5fZXZlbnRzQ291bnQrKztcbiAgZWxzZSBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFt0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYSBvbmUtdGltZSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXIsIHRoaXMuX2V2ZW50c0NvdW50Kys7XG4gIGVsc2UgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBsaXN0ZW5lcnMgb2YgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gT25seSByZW1vdmUgdGhlIGxpc3RlbmVycyB0aGF0IG1hdGNoIHRoaXMgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgdGhhdCBoYXZlIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmUtdGltZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuICBpZiAoIWZuKSB7XG4gICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKFxuICAgICAgICAgbGlzdGVuZXJzLmZuID09PSBmblxuICAgICAgJiYgKCFvbmNlIHx8IGxpc3RlbmVycy5vbmNlKVxuICAgICAgJiYgKCFjb250ZXh0IHx8IGxpc3RlbmVycy5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICkge1xuICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZXZlbnRzID0gW10sIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgICAvL1xuICAgIGlmIChldmVudHMubGVuZ3RoKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gICAgZWxzZSBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBvZiB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gW2V2ZW50XSBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIHZhciBldnQ7XG5cbiAgaWYgKGV2ZW50KSB7XG4gICAgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2dF0pIHtcbiAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gQWxsb3cgYEV2ZW50RW1pdHRlcmAgdG8gYmUgaW1wb3J0ZWQgYXMgbW9kdWxlIG5hbWVzcGFjZS5cbi8vXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VVUkkgKHN0ciwgb3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuXG4gIHZhciBvID0ge1xuICAgIGtleTogWydzb3VyY2UnLCAncHJvdG9jb2wnLCAnYXV0aG9yaXR5JywgJ3VzZXJJbmZvJywgJ3VzZXInLCAncGFzc3dvcmQnLCAnaG9zdCcsICdwb3J0JywgJ3JlbGF0aXZlJywgJ3BhdGgnLCAnZGlyZWN0b3J5JywgJ2ZpbGUnLCAncXVlcnknLCAnYW5jaG9yJ10sXG4gICAgcToge1xuICAgICAgbmFtZTogJ3F1ZXJ5S2V5JyxcbiAgICAgIHBhcnNlcjogLyg/Ol58JikoW14mPV0qKT0/KFteJl0qKS9nXG4gICAgfSxcbiAgICBwYXJzZXI6IHtcbiAgICAgIHN0cmljdDogL14oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykpPygoKCg/OltePyNcXC9dKlxcLykqKShbXj8jXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pLyxcbiAgICAgIGxvb3NlOiAvXig/Oig/IVteOkBdKzpbXjpAXFwvXSpAKShbXjpcXC8/Iy5dKyk6KT8oPzpcXC9cXC8pPygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSgoKFxcLyg/OltePyNdKD8hW14/I1xcL10qXFwuW14/I1xcLy5dKyg/Ols/I118JCkpKSpcXC8/KT8oW14/I1xcL10qKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/KS9cbiAgICB9XG4gIH1cblxuICB2YXIgbSA9IG8ucGFyc2VyW29wdHMuc3RyaWN0TW9kZSA/ICdzdHJpY3QnIDogJ2xvb3NlJ10uZXhlYyhzdHIpXG4gIHZhciB1cmkgPSB7fVxuICB2YXIgaSA9IDE0XG5cbiAgd2hpbGUgKGktLSkgdXJpW28ua2V5W2ldXSA9IG1baV0gfHwgJydcblxuICB1cmlbby5xLm5hbWVdID0ge31cbiAgdXJpW28ua2V5WzEyXV0ucmVwbGFjZShvLnEucGFyc2VyLCBmdW5jdGlvbiAoJDAsICQxLCAkMikge1xuICAgIGlmICgkMSkgdXJpW28ucS5uYW1lXVskMV0gPSAkMlxuICB9KVxuXG4gIHJldHVybiB1cmlcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBhcnNlVXJpICAgICAgICA9IHJlcXVpcmUoJ3BhcnNlLXVyaScpO1xudmFyIGFzeW5jICAgICAgICAgICA9IHJlcXVpcmUoJy4vYXN5bmMnKTtcbnZhciBSZXNvdXJjZSAgICAgICAgPSByZXF1aXJlKCcuL1Jlc291cmNlJyk7XG52YXIgRXZlbnRFbWl0dGVyICAgID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpO1xuXG4vLyBzb21lIGNvbnN0YW50c1xudmFyIERFRkFVTFRfQ09OQ1VSUkVOQ1kgPSAxMDtcbnZhciBNQVhfUFJPR1JFU1MgPSAxMDA7XG5cbi8qKlxuICogTWFuYWdlcyB0aGUgc3RhdGUgYW5kIGxvYWRpbmcgb2YgbXVsdGlwbGUgcmVzb3VyY2VzIHRvIGxvYWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gW2Jhc2VVcmw9JyddIC0gVGhlIGJhc2UgdXJsIGZvciBhbGwgcmVzb3VyY2VzIGxvYWRlZCBieSB0aGlzIGxvYWRlci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbY29uY3VycmVuY3k9MTBdIC0gVGhlIG51bWJlciBvZiByZXNvdXJjZXMgdG8gbG9hZCBjb25jdXJyZW50bHkuXG4gKi9cbmZ1bmN0aW9uIExvYWRlcihiYXNlVXJsLCBjb25jdXJyZW5jeSkge1xuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgY29uY3VycmVuY3kgPSBjb25jdXJyZW5jeSB8fCBERUZBVUxUX0NPTkNVUlJFTkNZO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgdXJsIGZvciBhbGwgcmVzb3VyY2VzIGxvYWRlZCBieSB0aGlzIGxvYWRlci5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsIHx8ICcnO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHByb2dyZXNzIHBlcmNlbnQgb2YgdGhlIGxvYWRlciBnb2luZyB0aHJvdWdoIHRoZSBxdWV1ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnByb2dyZXNzID0gMDtcblxuICAgIC8qKlxuICAgICAqIExvYWRpbmcgc3RhdGUgb2YgdGhlIGxvYWRlciwgdHJ1ZSBpZiBpdCBpcyBjdXJyZW50bHkgbG9hZGluZyByZXNvdXJjZXMuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHBlcmNlbnRhZ2Ugb2YgdG90YWwgcHJvZ3Jlc3MgdGhhdCBhIHNpbmdsZSByZXNvdXJjZSByZXByZXNlbnRzLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuX3Byb2dyZXNzQ2h1bmsgPSAwO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1pZGRsZXdhcmUgdG8gcnVuIGJlZm9yZSBsb2FkaW5nIGVhY2ggcmVzb3VyY2UuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbltdfVxuICAgICAqL1xuICAgIHRoaXMuX2JlZm9yZU1pZGRsZXdhcmUgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBtaWRkbGV3YXJlIHRvIHJ1biBhZnRlciBsb2FkaW5nIGVhY2ggcmVzb3VyY2UuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbltdfVxuICAgICAqL1xuICAgIHRoaXMuX2FmdGVyTWlkZGxld2FyZSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGBfbG9hZFJlc291cmNlYCBmdW5jdGlvbiBib3VuZCB3aXRoIHRoaXMgb2JqZWN0IGNvbnRleHQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZW1iZXIge2Z1bmN0aW9ufVxuICAgICAqL1xuICAgIHRoaXMuX2JvdW5kTG9hZFJlc291cmNlID0gdGhpcy5fbG9hZFJlc291cmNlLmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcmVzb3VyY2UgYnVmZmVyIHRoYXQgZmlsbHMgdW50aWwgYGxvYWRgIGlzIGNhbGxlZCB0byBzdGFydCBsb2FkaW5nIHJlc291cmNlcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1lbWJlciB7UmVzb3VyY2VbXX1cbiAgICAgKi9cbiAgICB0aGlzLl9idWZmZXIgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gdHJhY2sgbG9hZCBjb21wbGV0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5fbnVtVG9Mb2FkID0gMDtcblxuICAgIC8qKlxuICAgICAqIFRoZSByZXNvdXJjZXMgd2FpdGluZyB0byBiZSBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBtZW1iZXIge1Jlc291cmNlW119XG4gICAgICovXG4gICAgdGhpcy5fcXVldWUgPSBhc3luYy5xdWV1ZSh0aGlzLl9ib3VuZExvYWRSZXNvdXJjZSwgY29uY3VycmVuY3kpO1xuXG4gICAgLyoqXG4gICAgICogQWxsIHRoZSByZXNvdXJjZXMgZm9yIHRoaXMgbG9hZGVyIGtleWVkIGJ5IG5hbWUuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtvYmplY3Q8c3RyaW5nLCBSZXNvdXJjZT59XG4gICAgICovXG4gICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEVtaXR0ZWQgb25jZSBwZXIgbG9hZGVkIG9yIGVycm9yZWQgcmVzb3VyY2UuXG4gICAgICpcbiAgICAgKiBAZXZlbnQgcHJvZ3Jlc3NcbiAgICAgKiBAbWVtYmVyb2YgTG9hZGVyI1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRW1pdHRlZCBvbmNlIHBlciBlcnJvcmVkIHJlc291cmNlLlxuICAgICAqXG4gICAgICogQGV2ZW50IGVycm9yXG4gICAgICogQG1lbWJlcm9mIExvYWRlciNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEVtaXR0ZWQgb25jZSBwZXIgbG9hZGVkIHJlc291cmNlLlxuICAgICAqXG4gICAgICogQGV2ZW50IGxvYWRcbiAgICAgKiBAbWVtYmVyb2YgTG9hZGVyI1xuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogRW1pdHRlZCB3aGVuIHRoZSBsb2FkZXIgYmVnaW5zIHRvIHByb2Nlc3MgdGhlIHF1ZXVlLlxuICAgICAqXG4gICAgICogQGV2ZW50IHN0YXJ0XG4gICAgICogQG1lbWJlcm9mIExvYWRlciNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEVtaXR0ZWQgd2hlbiB0aGUgcXVldWVkIHJlc291cmNlcyBhbGwgbG9hZC5cbiAgICAgKlxuICAgICAqIEBldmVudCBjb21wbGV0ZVxuICAgICAqIEBtZW1iZXJvZiBMb2FkZXIjXG4gICAgICovXG59XG5cbkxvYWRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEV2ZW50RW1pdHRlci5wcm90b3R5cGUpO1xuTG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExvYWRlcjtcbm1vZHVsZS5leHBvcnRzID0gTG9hZGVyO1xuXG4vKipcbiAqIEFkZHMgYSByZXNvdXJjZSAob3IgbXVsdGlwbGUgcmVzb3VyY2VzKSB0byB0aGUgbG9hZGVyIHF1ZXVlLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gY2FuIHRha2UgYSB3aWRlIHZhcmlldHkgb2YgZGlmZmVyZW50IHBhcmFtZXRlcnMuIFRoZSBvbmx5IHRoaW5nIHRoYXQgaXMgYWx3YXlzXG4gKiByZXF1aXJlZCB0aGUgdXJsIHRvIGxvYWQuIEFsbCB0aGUgZm9sbG93aW5nIHdpbGwgd29yazpcbiAqXG4gKiBgYGBqc1xuICogbG9hZGVyXG4gKiAgICAgLy8gbm9ybWFsIHBhcmFtIHN5bnRheFxuICogICAgIC5hZGQoJ2tleScsICdodHRwOi8vLi4uJywgZnVuY3Rpb24gKCkge30pXG4gKiAgICAgLmFkZCgnaHR0cDovLy4uLicsIGZ1bmN0aW9uICgpIHt9KVxuICogICAgIC5hZGQoJ2h0dHA6Ly8uLi4nKVxuICpcbiAqICAgICAvLyBvYmplY3Qgc3ludGF4XG4gKiAgICAgLmFkZCh7XG4gKiAgICAgICAgIG5hbWU6ICdrZXkyJyxcbiAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAqICAgICB9LCBmdW5jdGlvbiAoKSB7fSlcbiAqICAgICAuYWRkKHtcbiAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAqICAgICB9LCBmdW5jdGlvbiAoKSB7fSlcbiAqICAgICAuYWRkKHtcbiAqICAgICAgICAgbmFtZTogJ2tleTMnLFxuICogICAgICAgICB1cmw6ICdodHRwOi8vLi4uJ1xuICogICAgICAgICBvbkNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7fVxuICogICAgIH0pXG4gKiAgICAgLmFkZCh7XG4gKiAgICAgICAgIHVybDogJ2h0dHBzOi8vLi4uJyxcbiAqICAgICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gKCkge30sXG4gKiAgICAgICAgIGNyb3NzT3JpZ2luOiB0cnVlXG4gKiAgICAgfSlcbiAqXG4gKiAgICAgLy8geW91IGNhbiBhbHNvIHBhc3MgYW4gYXJyYXkgb2Ygb2JqZWN0cyBvciB1cmxzIG9yIGJvdGhcbiAqICAgICAuYWRkKFtcbiAqICAgICAgICAgeyBuYW1lOiAna2V5NCcsIHVybDogJ2h0dHA6Ly8uLi4nLCBvbkNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7fSB9LFxuICogICAgICAgICB7IHVybDogJ2h0dHA6Ly8uLi4nLCBvbkNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7fSB9LFxuICogICAgICAgICAnaHR0cDovLy4uLidcbiAqICAgICBdKVxuICpcbiAqICAgICAvLyBhbmQgeW91IGNhbiB1c2UgYm90aCBwYXJhbXMgYW5kIG9wdGlvbnNcbiAqICAgICAuYWRkKCdrZXknLCAnaHR0cDovLy4uLicsIHsgY3Jvc3NPcmlnaW46IHRydWUgfSwgZnVuY3Rpb24gKCkge30pXG4gKiAgICAgLmFkZCgnaHR0cDovLy4uLicsIHsgY3Jvc3NPcmlnaW46IHRydWUgfSwgZnVuY3Rpb24gKCkge30pO1xuICogYGBgXG4gKlxuICogQGFsaWFzIGVucXVldWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gLSBUaGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgdG8gbG9hZCwgaWYgbm90IHBhc3NlZCB0aGUgdXJsIGlzIHVzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gW3VybF0gLSBUaGUgdXJsIGZvciB0aGlzIHJlc291cmNlLCByZWxhdGl2ZSB0byB0aGUgYmFzZVVybCBvZiB0aGlzIGxvYWRlci5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gLSBUaGUgb3B0aW9ucyBmb3IgdGhlIGxvYWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNyb3NzT3JpZ2luXSAtIElzIHRoaXMgcmVxdWVzdCBjcm9zcy1vcmlnaW4/IERlZmF1bHQgaXMgdG8gZGV0ZXJtaW5lIGF1dG9tYXRpY2FsbHkuXG4gKiBAcGFyYW0ge1Jlc291cmNlLlhIUl9MT0FEX1RZUEV9IFtvcHRpb25zLmxvYWRUeXBlPVJlc291cmNlLkxPQURfVFlQRS5YSFJdIC0gSG93IHNob3VsZCB0aGlzIHJlc291cmNlIGJlIGxvYWRlZD9cbiAqIEBwYXJhbSB7UmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEV9IFtvcHRpb25zLnhoclR5cGU9UmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuREVGQVVMVF0gLSBIb3cgc2hvdWxkIHRoZSBkYXRhIGJlaW5nXG4gKiAgICAgIGxvYWRlZCBiZSBpbnRlcnByZXRlZCB3aGVuIHVzaW5nIFhIUj9cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYl0gLSBGdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhpcyBzcGVjaWZpYyByZXNvdXJjZSBjb21wbGV0ZXMgbG9hZGluZy5cbiAqIEByZXR1cm4ge0xvYWRlcn0gUmV0dXJucyBpdHNlbGYuXG4gKi9cbkxvYWRlci5wcm90b3R5cGUuYWRkID0gTG9hZGVyLnByb3RvdHlwZS5lbnF1ZXVlID0gZnVuY3Rpb24gKG5hbWUsIHVybCwgb3B0aW9ucywgY2IpIHtcbiAgICAvLyBzcGVjaWFsIGNhc2Ugb2YgYW4gYXJyYXkgb2Ygb2JqZWN0cyBvciB1cmxzXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYW1lLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLmFkZChuYW1lW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIGlmIGFuIG9iamVjdCBpcyBwYXNzZWQgaW5zdGVhZCBvZiBwYXJhbXNcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNiID0gdXJsIHx8IG5hbWUuY2FsbGJhY2sgfHwgbmFtZS5vbkNvbXBsZXRlO1xuICAgICAgICBvcHRpb25zID0gbmFtZTtcbiAgICAgICAgdXJsID0gbmFtZS51cmw7XG4gICAgICAgIG5hbWUgPSBuYW1lLm5hbWUgfHwgbmFtZS5rZXkgfHwgbmFtZS51cmw7XG4gICAgfVxuXG4gICAgLy8gY2FzZSB3aGVyZSBubyBuYW1lIGlzIHBhc3NlZCBzaGlmdCBhbGwgYXJncyBvdmVyIGJ5IG9uZS5cbiAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgY2IgPSBvcHRpb25zO1xuICAgICAgICBvcHRpb25zID0gdXJsO1xuICAgICAgICB1cmwgPSBuYW1lO1xuICAgIH1cblxuICAgIC8vIG5vdyB0aGF0IHdlIHNoaWZ0ZWQgbWFrZSBzdXJlIHdlIGhhdmUgYSBwcm9wZXIgdXJsLlxuICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHVybCBwYXNzZWQgdG8gYWRkIHJlc291cmNlIHRvIGxvYWRlci4nKTtcbiAgICB9XG5cbiAgICAvLyBvcHRpb25zIGFyZSBvcHRpb25hbCBzbyBwZW9wbGUgbWlnaHQgcGFzcyBhIGZ1bmN0aW9uIGFuZCBubyBvcHRpb25zXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNiID0gb3B0aW9ucztcbiAgICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgcmVzb3VyY2UgYWxyZWFkeSBleGlzdHMuXG4gICAgaWYgKHRoaXMucmVzb3VyY2VzW25hbWVdKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzb3VyY2Ugd2l0aCBuYW1lIFwiJyArIG5hbWUgKyAnXCIgYWxyZWFkeSBleGlzdHMuJyk7XG4gICAgfVxuXG4gICAgLy8gYWRkIGJhc2UgdXJsIGlmIHRoaXMgaXNuJ3QgYW4gYWJzb2x1dGUgdXJsXG4gICAgdXJsID0gdGhpcy5fcHJlcGFyZVVybCh1cmwpO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBzdG9yZSB0aGUgcmVzb3VyY2VcbiAgICB0aGlzLnJlc291cmNlc1tuYW1lXSA9IG5ldyBSZXNvdXJjZShuYW1lLCB1cmwsIG9wdGlvbnMpO1xuXG4gICAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlc291cmNlc1tuYW1lXS5vbmNlKCdhZnRlck1pZGRsZXdhcmUnLCBjYik7XG4gICAgfVxuXG4gICAgdGhpcy5fbnVtVG9Mb2FkKys7XG5cbiAgICAvLyBpZiBhbHJlYWR5IGxvYWRpbmcgYWRkIGl0IHRvIHRoZSB3b3JrZXIgcXVldWVcbiAgICBpZiAodGhpcy5fcXVldWUuc3RhcnRlZCkge1xuICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKHRoaXMucmVzb3VyY2VzW25hbWVdKTtcbiAgICAgICAgdGhpcy5fcHJvZ3Jlc3NDaHVuayA9IChNQVhfUFJPR1JFU1MgLSB0aGlzLnByb2dyZXNzKSAvICh0aGlzLl9xdWV1ZS5sZW5ndGgoKSArIHRoaXMuX3F1ZXVlLnJ1bm5pbmcoKSk7XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSBidWZmZXIgaXQgdG8gYmUgYWRkZWQgdG8gdGhlIHF1ZXVlIGxhdGVyXG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2J1ZmZlci5wdXNoKHRoaXMucmVzb3VyY2VzW25hbWVdKTtcbiAgICAgICAgdGhpcy5fcHJvZ3Jlc3NDaHVuayA9IE1BWF9QUk9HUkVTUyAvIHRoaXMuX2J1ZmZlci5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldHMgdXAgYSBtaWRkbGV3YXJlIGZ1bmN0aW9uIHRoYXQgd2lsbCBydW4gKmJlZm9yZSogdGhlXG4gKiByZXNvdXJjZSBpcyBsb2FkZWQuXG4gKlxuICogQGFsaWFzIHByZVxuICogQG1ldGhvZCBiZWZvcmVcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gVGhlIG1pZGRsZXdhcmUgZnVuY3Rpb24gdG8gcmVnaXN0ZXIuXG4gKiBAcmV0dXJuIHtMb2FkZXJ9IFJldHVybnMgaXRzZWxmLlxuICovXG5Mb2FkZXIucHJvdG90eXBlLmJlZm9yZSA9IExvYWRlci5wcm90b3R5cGUucHJlID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgdGhpcy5fYmVmb3JlTWlkZGxld2FyZS5wdXNoKGZuKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXRzIHVwIGEgbWlkZGxld2FyZSBmdW5jdGlvbiB0aGF0IHdpbGwgcnVuICphZnRlciogdGhlXG4gKiByZXNvdXJjZSBpcyBsb2FkZWQuXG4gKlxuICogQGFsaWFzIHVzZVxuICogQG1ldGhvZCBhZnRlclxuICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBUaGUgbWlkZGxld2FyZSBmdW5jdGlvbiB0byByZWdpc3Rlci5cbiAqIEByZXR1cm4ge0xvYWRlcn0gUmV0dXJucyBpdHNlbGYuXG4gKi9cbkxvYWRlci5wcm90b3R5cGUuYWZ0ZXIgPSBMb2FkZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIChmbikge1xuICAgIHRoaXMuX2FmdGVyTWlkZGxld2FyZS5wdXNoKGZuKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXNldHMgdGhlIHF1ZXVlIG9mIHRoZSBsb2FkZXIgdG8gcHJlcGFyZSBmb3IgYSBuZXcgbG9hZC5cbiAqXG4gKiBAcmV0dXJuIHtMb2FkZXJ9IFJldHVybnMgaXRzZWxmLlxuICovXG5Mb2FkZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwgfHwgJyc7XG5cbiAgICB0aGlzLnByb2dyZXNzID0gMDtcblxuICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5fcHJvZ3Jlc3NDaHVuayA9IDA7XG5cbiAgICAvLyB0aGlzLl9iZWZvcmVNaWRkbGV3YXJlLmxlbmd0aCA9IDA7XG4gICAgLy8gdGhpcy5fYWZ0ZXJNaWRkbGV3YXJlLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLl9idWZmZXIubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuX251bVRvTG9hZCA9IDA7XG5cbiAgICB0aGlzLl9xdWV1ZS5raWxsKCk7XG4gICAgdGhpcy5fcXVldWUuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gYWJvcnQgYWxsIHJlc291cmNlIGxvYWRzXG4gICAgZm9yICh2YXIgayBpbiB0aGlzLnJlc291cmNlcykge1xuICAgICAgICB2YXIgcmVzID0gdGhpcy5yZXNvdXJjZXNba107XG5cbiAgICAgICAgcmVzLm9mZignY29tcGxldGUnLCB0aGlzLl9vbkxvYWQsIHRoaXMpO1xuXG4gICAgICAgIGlmIChyZXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICByZXMuYWJvcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVzb3VyY2VzID0ge307XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3RhcnRzIGxvYWRpbmcgdGhlIHF1ZXVlZCByZXNvdXJjZXMuXG4gKlxuICogQGZpcmVzIHN0YXJ0XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2JdIC0gT3B0aW9uYWwgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGJvdW5kIHRvIHRoZSBgY29tcGxldGVgIGV2ZW50LlxuICogQHJldHVybiB7TG9hZGVyfSBSZXR1cm5zIGl0c2VsZi5cbiAqL1xuTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgLy8gcmVnaXN0ZXIgY29tcGxldGUgY2FsbGJhY2sgaWYgdGhleSBwYXNzIG9uZVxuICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5vbmNlKCdjb21wbGV0ZScsIGNiKTtcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgcXVldWUgaGFzIGFscmVhZHkgc3RhcnRlZCB3ZSBhcmUgZG9uZSBoZXJlXG4gICAgaWYgKHRoaXMuX3F1ZXVlLnN0YXJ0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gbm90aWZ5IG9mIHN0YXJ0XG4gICAgdGhpcy5lbWl0KCdzdGFydCcsIHRoaXMpO1xuXG4gICAgLy8gdXBkYXRlIGxvYWRpbmcgc3RhdGVcbiAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuXG4gICAgLy8gc3RhcnQgdGhlIGludGVybmFsIHF1ZXVlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9idWZmZXIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaCh0aGlzLl9idWZmZXJbaV0pO1xuICAgIH1cblxuICAgIC8vIGVtcHR5IHRoZSBidWZmZXJcbiAgICB0aGlzLl9idWZmZXIubGVuZ3RoID0gMDtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcmVwYXJlcyBhIHVybCBmb3IgdXNhZ2UgYmFzZWQgb24gdGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhpcyBvYmplY3RcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSB1cmwgdG8gcHJlcGFyZS5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHByZXBhcmVkIHVybC5cbiAqL1xuTG9hZGVyLnByb3RvdHlwZS5fcHJlcGFyZVVybCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICB2YXIgcGFyc2VkVXJsID0gcGFyc2VVcmkodXJsLCB7IHN0cmljdE1vZGU6IHRydWUgfSk7XG5cbiAgICAvLyBhYnNvbHV0ZSB1cmwsIGp1c3QgdXNlIGl0IGFzIGlzLlxuICAgIGlmIChwYXJzZWRVcmwucHJvdG9jb2wgfHwgIXBhcnNlZFVybC5wYXRoIHx8IHBhcnNlZFVybC5wYXRoLmluZGV4T2YoJy8vJykgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICAvLyBpZiBiYXNlVXJsIGRvZXNuJ3QgZW5kIGluIHNsYXNoIGFuZCB1cmwgZG9lc24ndCBzdGFydCB3aXRoIHNsYXNoLCB0aGVuIGFkZCBhIHNsYXNoIGluYmV0d2VlblxuICAgIGlmICh0aGlzLmJhc2VVcmwubGVuZ3RoXG4gICAgICAgICYmIHRoaXMuYmFzZVVybC5sYXN0SW5kZXhPZignLycpICE9PSB0aGlzLmJhc2VVcmwubGVuZ3RoIC0gMVxuICAgICAgICAmJiB1cmwuY2hhckF0KDApICE9PSAnLydcbiAgICApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZVVybCArICcvJyArIHVybDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5iYXNlVXJsICsgdXJsO1xufTtcblxuLyoqXG4gKiBMb2FkcyBhIHNpbmdsZSByZXNvdXJjZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdG8gbG9hZC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGRlcXVldWUgLSBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHdlIG5lZWQgdG8gZGVxdWV1ZSB0aGlzIGl0ZW0uXG4gKi9cbkxvYWRlci5wcm90b3R5cGUuX2xvYWRSZXNvdXJjZSA9IGZ1bmN0aW9uIChyZXNvdXJjZSwgZGVxdWV1ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJlc291cmNlLl9kZXF1ZXVlID0gZGVxdWV1ZTtcblxuICAgIC8vIHJ1biBiZWZvcmUgbWlkZGxld2FyZVxuICAgIGFzeW5jLmVhY2hTZXJpZXMoXG4gICAgICAgIHRoaXMuX2JlZm9yZU1pZGRsZXdhcmUsXG4gICAgICAgIGZ1bmN0aW9uIChmbiwgbmV4dCkge1xuICAgICAgICAgICAgZm4uY2FsbChzZWxmLCByZXNvdXJjZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBiZWZvcmUgbWlkZGxld2FyZSBtYXJrcyB0aGUgcmVzb3VyY2UgYXMgY29tcGxldGUsXG4gICAgICAgICAgICAgICAgLy8gYnJlYWsgYW5kIGRvbid0IHByb2Nlc3MgYW55IG1vcmUgYmVmb3JlIG1pZGRsZXdhcmVcbiAgICAgICAgICAgICAgICBuZXh0KHJlc291cmNlLmlzQ29tcGxldGUgPyB7fSA6IG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIHJlc291cmNlLm9uKCdwcm9ncmVzcycsIHNlbGYuZW1pdC5iaW5kKHNlbGYsICdwcm9ncmVzcycpKTtcblxuICAgICAgICAgICAgaWYgKHJlc291cmNlLmlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vbkxvYWQocmVzb3VyY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2Uub25jZSgnY29tcGxldGUnLCBzZWxmLl9vbkxvYWQsIHNlbGYpO1xuICAgICAgICAgICAgICAgIHJlc291cmNlLmxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG59O1xuXG4vKipcbiAqIENhbGxlZCBvbmNlIGVhY2ggcmVzb3VyY2UgaGFzIGxvYWRlZC5cbiAqXG4gKiBAZmlyZXMgY29tcGxldGVcbiAqIEBwcml2YXRlXG4gKi9cbkxvYWRlci5wcm90b3R5cGUuX29uQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLmVtaXQoJ2NvbXBsZXRlJywgdGhpcywgdGhpcy5yZXNvdXJjZXMpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgZWFjaCB0aW1lIGEgcmVzb3VyY2VzIGlzIGxvYWRlZC5cbiAqXG4gKiBAZmlyZXMgcHJvZ3Jlc3NcbiAqIEBmaXJlcyBlcnJvclxuICogQGZpcmVzIGxvYWRcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1Jlc291cmNlfSByZXNvdXJjZSAtIFRoZSByZXNvdXJjZSB0aGF0IHdhcyBsb2FkZWRcbiAqL1xuTG9hZGVyLnByb3RvdHlwZS5fb25Mb2FkID0gZnVuY3Rpb24gKHJlc291cmNlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gcnVuIG1pZGRsZXdhcmUsIHRoaXMgKm11c3QqIGhhcHBlbiBiZWZvcmUgZGVxdWV1ZSBzbyBzdWItYXNzZXRzIGdldCBhZGRlZCBwcm9wZXJseVxuICAgIGFzeW5jLmVhY2hTZXJpZXMoXG4gICAgICAgIHRoaXMuX2FmdGVyTWlkZGxld2FyZSxcbiAgICAgICAgZnVuY3Rpb24gKGZuLCBuZXh0KSB7XG4gICAgICAgICAgICBmbi5jYWxsKHNlbGYsIHJlc291cmNlLCBuZXh0KTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVzb3VyY2UuZW1pdCgnYWZ0ZXJNaWRkbGV3YXJlJywgcmVzb3VyY2UpO1xuXG4gICAgICAgICAgICBzZWxmLl9udW1Ub0xvYWQtLTtcblxuICAgICAgICAgICAgc2VsZi5wcm9ncmVzcyArPSBzZWxmLl9wcm9ncmVzc0NodW5rO1xuICAgICAgICAgICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIHNlbGYsIHJlc291cmNlKTtcblxuICAgICAgICAgICAgaWYgKHJlc291cmNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5lbWl0KCdlcnJvcicsIHJlc291cmNlLmVycm9yLCBzZWxmLCByZXNvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmVtaXQoJ2xvYWQnLCBzZWxmLCByZXNvdXJjZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIGNvbXBsZXRpb24gY2hlY2tcbiAgICAgICAgICAgIGlmIChzZWxmLl9udW1Ub0xvYWQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgICAgICAgIHNlbGYuX29uQ29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyByZW1vdmUgdGhpcyByZXNvdXJjZSBmcm9tIHRoZSBhc3luYyBxdWV1ZVxuICAgIHJlc291cmNlLl9kZXF1ZXVlKCk7XG59O1xuXG5Mb2FkZXIuTE9BRF9UWVBFID0gUmVzb3VyY2UuTE9BRF9UWVBFO1xuTG9hZGVyLlhIUl9SRVNQT05TRV9UWVBFID0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEVtaXR0ZXIgICAgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyk7XG52YXIgcGFyc2VVcmkgICAgICAgID0gcmVxdWlyZSgncGFyc2UtdXJpJyk7XG5cbi8vIHRlc3RzIGlzIENPUlMgaXMgc3VwcG9ydGVkIGluIFhIUiwgaWYgbm90IHdlIG5lZWQgdG8gdXNlIFhEUlxudmFyIHVzZVhkciA9ICEhKHdpbmRvdy5YRG9tYWluUmVxdWVzdCAmJiAhKCd3aXRoQ3JlZGVudGlhbHMnIGluIChuZXcgWE1MSHR0cFJlcXVlc3QoKSkpKTtcbnZhciB0ZW1wQW5jaG9yID0gbnVsbDtcblxuLy8gc29tZSBzdGF0dXMgY29uc3RhbnRzXG52YXIgU1RBVFVTX05PTkUgPSAwO1xudmFyIFNUQVRVU19PSyA9IDIwMDtcbnZhciBTVEFUVVNfRU1QVFkgPSAyMDQ7XG5cbi8qKlxuICogTWFuYWdlcyB0aGUgc3RhdGUgYW5kIGxvYWRpbmcgb2YgYSBzaW5nbGUgcmVzb3VyY2UgcmVwcmVzZW50ZWQgYnlcbiAqIGEgc2luZ2xlIFVSTC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHJlc291cmNlIHRvIGxvYWQuXG4gKiBAcGFyYW0ge3N0cmluZ3xzdHJpbmdbXX0gdXJsIC0gVGhlIHVybCBmb3IgdGhpcyByZXNvdXJjZSwgZm9yIGF1ZGlvL3ZpZGVvIGxvYWRzIHlvdSBjYW4gcGFzcyBhbiBhcnJheSBvZiBzb3VyY2VzLlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIFRoZSBvcHRpb25zIGZvciB0aGUgbG9hZC5cbiAqIEBwYXJhbSB7c3RyaW5nfGJvb2xlYW59IFtvcHRpb25zLmNyb3NzT3JpZ2luXSAtIElzIHRoaXMgcmVxdWVzdCBjcm9zcy1vcmlnaW4/IERlZmF1bHQgaXMgdG8gZGV0ZXJtaW5lIGF1dG9tYXRpY2FsbHkuXG4gKiBAcGFyYW0ge1Jlc291cmNlLkxPQURfVFlQRX0gW29wdGlvbnMubG9hZFR5cGU9UmVzb3VyY2UuTE9BRF9UWVBFLlhIUl0gLSBIb3cgc2hvdWxkIHRoaXMgcmVzb3VyY2UgYmUgbG9hZGVkP1xuICogQHBhcmFtIHtSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRX0gW29wdGlvbnMueGhyVHlwZT1SZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ERUZBVUxUXSAtIEhvdyBzaG91bGQgdGhlIGRhdGEgYmVpbmdcbiAqICAgICAgbG9hZGVkIGJlIGludGVycHJldGVkIHdoZW4gdXNpbmcgWEhSP1xuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLm1ldGFkYXRhXSAtIEV4dHJhIGluZm8gZm9yIG1pZGRsZXdhcmUuXG4gKi9cbmZ1bmN0aW9uIFJlc291cmNlKG5hbWUsIHVybCwgb3B0aW9ucykge1xuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQm90aCBuYW1lIGFuZCB1cmwgYXJlIHJlcXVpcmVkIGZvciBjb25zdHJ1Y3RpbmcgYSByZXNvdXJjZS4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGlzIHJlc291cmNlLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7c3RyaW5nfVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdXJsIHVzZWQgdG8gbG9hZCB0aGlzIHJlc291cmNlLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7c3RyaW5nfVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHRoaXMudXJsID0gdXJsO1xuXG4gICAgLyoqXG4gICAgICogU3RvcmVzIHdoZXRoZXIgb3Igbm90IHRoaXMgdXJsIGlzIGEgZGF0YSB1cmwuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHRoaXMuaXNEYXRhVXJsID0gdGhpcy51cmwuaW5kZXhPZignZGF0YTonKSA9PT0gMDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBkYXRhIHRoYXQgd2FzIGxvYWRlZCBieSB0aGUgcmVzb3VyY2UuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHthbnl9XG4gICAgICovXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIElzIHRoaXMgcmVxdWVzdCBjcm9zcy1vcmlnaW4/IElmIHVuc2V0LCBkZXRlcm1pbmVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5jcm9zc09yaWdpbiA9IG9wdGlvbnMuY3Jvc3NPcmlnaW4gPT09IHRydWUgPyAnYW5vbnltb3VzJyA6IG9wdGlvbnMuY3Jvc3NPcmlnaW47XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWV0aG9kIG9mIGxvYWRpbmcgdG8gdXNlIGZvciB0aGlzIHJlc291cmNlLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7UmVzb3VyY2UuTE9BRF9UWVBFfVxuICAgICAqL1xuICAgIHRoaXMubG9hZFR5cGUgPSBvcHRpb25zLmxvYWRUeXBlIHx8IHRoaXMuX2RldGVybWluZUxvYWRUeXBlKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdHlwZSB1c2VkIHRvIGxvYWQgdGhlIHJlc291cmNlIHZpYSBYSFIuIElmIHVuc2V0LCBkZXRlcm1pbmVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy54aHJUeXBlID0gb3B0aW9ucy54aHJUeXBlO1xuXG4gICAgLyoqXG4gICAgICogRXh0cmEgaW5mbyBmb3IgbWlkZGxld2FyZSwgYW5kIGNvbnRyb2xsaW5nIHNwZWNpZmljcyBhYm91dCBob3cgdGhlIHJlc291cmNlIGxvYWRzLlxuICAgICAqXG4gICAgICogTm90ZSB0aGF0IGlmIHlvdSBwYXNzIGluIGEgYGxvYWRFbGVtZW50YCwgdGhlIFJlc291cmNlIGNsYXNzIHRha2VzIG93bmVyc2hpcCBvZiBpdC5cbiAgICAgKiBNZWFuaW5nIGl0IHdpbGwgbW9kaWZ5IGl0IGFzIGl0IHNlZXMgZml0LlxuICAgICAqXG4gICAgICogQG1lbWJlciB7b2JqZWN0fVxuICAgICAqIEBwcm9wZXJ0eSB7SFRNTEltYWdlRWxlbWVudHxIVE1MQXVkaW9FbGVtZW50fEhUTUxWaWRlb0VsZW1lbnR9IFtsb2FkRWxlbWVudD1udWxsXSAtIFRoZVxuICAgICAqICBlbGVtZW50IHRvIHVzZSBmb3IgbG9hZGluZywgaW5zdGVhZCBvZiBjcmVhdGluZyBvbmUuXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBbc2tpcFNvdXJjZT1mYWxzZV0gLSBTa2lwcyBhZGRpbmcgc291cmNlKHMpIHRvIHRoZSBsb2FkIGVsZW1lbnQuIFRoaXNcbiAgICAgKiAgaXMgdXNlZnVsIGlmIHlvdSB3YW50IHRvIHBhc3MgaW4gYSBgbG9hZEVsZW1lbnRgIHRoYXQgeW91IGFscmVhZHkgYWRkZWQgbG9hZCBzb3VyY2VzXG4gICAgICogIHRvLlxuICAgICAqL1xuICAgIHRoaXMubWV0YWRhdGEgPSBvcHRpb25zLm1ldGFkYXRhIHx8IHt9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGVycm9yIHRoYXQgb2NjdXJyZWQgd2hpbGUgbG9hZGluZyAoaWYgYW55KS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge0Vycm9yfVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIFhIUiBvYmplY3QgdGhhdCB3YXMgdXNlZCB0byBsb2FkIHRoaXMgcmVzb3VyY2UuIFRoaXMgaXMgb25seSBzZXRcbiAgICAgKiB3aGVuIGBsb2FkVHlwZWAgaXMgYFJlc291cmNlLkxPQURfVFlQRS5YSFJgLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7WE1MSHR0cFJlcXVlc3R9XG4gICAgICovXG4gICAgdGhpcy54aHIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogRGVzY3JpYmVzIGlmIHRoaXMgcmVzb3VyY2Ugd2FzIGxvYWRlZCBhcyBqc29uLiBPbmx5IHZhbGlkIGFmdGVyIHRoZSByZXNvdXJjZVxuICAgICAqIGhhcyBjb21wbGV0ZWx5IGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc0pzb24gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIERlc2NyaWJlcyBpZiB0aGlzIHJlc291cmNlIHdhcyBsb2FkZWQgYXMgeG1sLiBPbmx5IHZhbGlkIGFmdGVyIHRoZSByZXNvdXJjZVxuICAgICAqIGhhcyBjb21wbGV0ZWx5IGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc1htbCA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogRGVzY3JpYmVzIGlmIHRoaXMgcmVzb3VyY2Ugd2FzIGxvYWRlZCBhcyBhbiBpbWFnZSB0YWcuIE9ubHkgdmFsaWQgYWZ0ZXIgdGhlIHJlc291cmNlXG4gICAgICogaGFzIGNvbXBsZXRlbHkgbG9hZGVkLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmlzSW1hZ2UgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIERlc2NyaWJlcyBpZiB0aGlzIHJlc291cmNlIHdhcyBsb2FkZWQgYXMgYW4gYXVkaW8gdGFnLiBPbmx5IHZhbGlkIGFmdGVyIHRoZSByZXNvdXJjZVxuICAgICAqIGhhcyBjb21wbGV0ZWx5IGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc0F1ZGlvID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmliZXMgaWYgdGhpcyByZXNvdXJjZSB3YXMgbG9hZGVkIGFzIGEgdmlkZW8gdGFnLiBPbmx5IHZhbGlkIGFmdGVyIHRoZSByZXNvdXJjZVxuICAgICAqIGhhcyBjb21wbGV0ZWx5IGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc1ZpZGVvID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmliZXMgaWYgdGhpcyByZXNvdXJjZSBoYXMgZmluaXNoZWQgbG9hZGluZy4gSXMgdHJ1ZSB3aGVuIHRoZSByZXNvdXJjZSBoYXMgY29tcGxldGVseVxuICAgICAqIGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc0NvbXBsZXRlID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmliZXMgaWYgdGhpcyByZXNvdXJjZSBpcyBjdXJyZW50bHkgbG9hZGluZy4gSXMgdHJ1ZSB3aGVuIHRoZSByZXNvdXJjZSBzdGFydHMgbG9hZGluZyxcbiAgICAgKiBhbmQgaXMgZmFsc2UgYWdhaW4gd2hlbiBjb21wbGV0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBgZGVxdWV1ZWAgbWV0aG9kIHRoYXQgd2lsbCBiZSB1c2VkIGEgc3RvcmFnZSBwbGFjZSBmb3IgdGhlIGFzeW5jIHF1ZXVlIGRlcXVldWUgbWV0aG9kXG4gICAgICogdXNlZCBwcml2YXRlbHkgYnkgdGhlIGxvYWRlci5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgdGhpcy5fZGVxdWV1ZSA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYGNvbXBsZXRlYCBmdW5jdGlvbiBib3VuZCB0byB0aGlzIHJlc291cmNlJ3MgY29udGV4dC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgdGhpcy5fYm91bmRDb21wbGV0ZSA9IHRoaXMuY29tcGxldGUuYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBgX29uRXJyb3JgIGZ1bmN0aW9uIGJvdW5kIHRvIHRoaXMgcmVzb3VyY2UncyBjb250ZXh0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbn1cbiAgICAgKi9cbiAgICB0aGlzLl9ib3VuZE9uRXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYF9vblByb2dyZXNzYCBmdW5jdGlvbiBib3VuZCB0byB0aGlzIHJlc291cmNlJ3MgY29udGV4dC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgdGhpcy5fYm91bmRPblByb2dyZXNzID0gdGhpcy5fb25Qcm9ncmVzcy5iaW5kKHRoaXMpO1xuXG4gICAgLy8geGhyIGNhbGxiYWNrc1xuICAgIHRoaXMuX2JvdW5kWGhyT25FcnJvciA9IHRoaXMuX3hock9uRXJyb3IuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZFhock9uQWJvcnQgPSB0aGlzLl94aHJPbkFib3J0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRYaHJPbkxvYWQgPSB0aGlzLl94aHJPbkxvYWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZFhkck9uVGltZW91dCA9IHRoaXMuX3hkck9uVGltZW91dC5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogRW1pdHRlZCB3aGVuIHRoZSByZXNvdXJjZSBiZWluZ3MgdG8gbG9hZC5cbiAgICAgKlxuICAgICAqIEBldmVudCBzdGFydFxuICAgICAqIEBtZW1iZXJvZiBSZXNvdXJjZSNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEVtaXR0ZWQgZWFjaCB0aW1lIHByb2dyZXNzIG9mIHRoaXMgcmVzb3VyY2UgbG9hZCB1cGRhdGVzLlxuICAgICAqIE5vdCBhbGwgcmVzb3VyY2VzIHR5cGVzIGFuZCBsb2FkZXIgc3lzdGVtcyBjYW4gc3VwcG9ydCB0aGlzIGV2ZW50XG4gICAgICogc28gc29tZXRpbWVzIGl0IG1heSBub3QgYmUgYXZhaWxhYmxlLiBJZiB0aGUgcmVzb3VyY2VcbiAgICAgKiBpcyBiZWluZyBsb2FkZWQgb24gYSBtb2Rlcm4gYnJvd3NlciwgdXNpbmcgWEhSLCBhbmQgdGhlIHJlbW90ZSBzZXJ2ZXJcbiAgICAgKiBwcm9wZXJseSBzZXRzIENvbnRlbnQtTGVuZ3RoIGhlYWRlcnMsIHRoZW4gdGhpcyB3aWxsIGJlIGF2YWlsYWJsZS5cbiAgICAgKlxuICAgICAqIEBldmVudCBwcm9ncmVzc1xuICAgICAqIEBtZW1iZXJvZiBSZXNvdXJjZSNcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEVtaXR0ZWQgb25jZSB0aGlzIHJlc291cmNlIGhhcyBsb2FkZWQsIGlmIHRoZXJlIHdhcyBhbiBlcnJvciBpdCB3aWxsXG4gICAgICogYmUgaW4gdGhlIGBlcnJvcmAgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAZXZlbnQgY29tcGxldGVcbiAgICAgKiBAbWVtYmVyb2YgUmVzb3VyY2UjXG4gICAgICovXG59XG5cblJlc291cmNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSk7XG5SZXNvdXJjZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZXNvdXJjZTtcbm1vZHVsZS5leHBvcnRzID0gUmVzb3VyY2U7XG5cbi8qKlxuICogTWFya3MgdGhlIHJlc291cmNlIGFzIGNvbXBsZXRlLlxuICpcbiAqIEBmaXJlcyBjb21wbGV0ZVxuICovXG5SZXNvdXJjZS5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gVE9ETzogQ2xlYW4gdGhpcyB1cCBpbiBhIHdyYXBwZXIgb3Igc29tZXRoaW5nLi4uZ3Jvc3MuLi4uXG4gICAgaWYgKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGEucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICB0aGlzLmRhdGEucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLl9ib3VuZE9uRXJyb3IsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kYXRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZENvbXBsZXRlLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZGF0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIHRoaXMuX2JvdW5kT25Qcm9ncmVzcywgZmFsc2UpO1xuICAgICAgICB0aGlzLmRhdGEucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCB0aGlzLl9ib3VuZENvbXBsZXRlLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMueGhyKSB7XG4gICAgICAgIGlmICh0aGlzLnhoci5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0aGlzLnhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2JvdW5kWGhyT25FcnJvciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy54aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCB0aGlzLl9ib3VuZFhock9uQWJvcnQsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMueGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgdGhpcy5fYm91bmRPblByb2dyZXNzLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRYaHJPbkxvYWQsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMueGhyLm9uZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy54aHIub250aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMueGhyLm9ucHJvZ3Jlc3MgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy54aHIub25sb2FkID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQ29tcGxldGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wbGV0ZSBjYWxsZWQgYWdhaW4gZm9yIGFuIGFscmVhZHkgY29tcGxldGVkIHJlc291cmNlLicpO1xuICAgIH1cblxuICAgIHRoaXMuaXNDb21wbGV0ZSA9IHRydWU7XG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcblxuICAgIHRoaXMuZW1pdCgnY29tcGxldGUnLCB0aGlzKTtcbn07XG5cbi8qKlxuICogQWJvcnRzIHRoZSBsb2FkaW5nIG9mIHRoaXMgcmVzb3VyY2UsIHdpdGggYW4gb3B0aW9uYWwgbWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIHVzZSBmb3IgdGhlIGVycm9yXG4gKi9cblJlc291cmNlLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgLy8gYWJvcnQgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcywgaWdub3JlIHN1YnNlcXVlbnQgY2FsbHMuXG4gICAgaWYgKHRoaXMuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHN0b3JlIGVycm9yXG4gICAgdGhpcy5lcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcblxuICAgIC8vIGFib3J0IHRoZSBhY3R1YWwgbG9hZGluZ1xuICAgIGlmICh0aGlzLnhocikge1xuICAgICAgICB0aGlzLnhoci5hYm9ydCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLnhkcikge1xuICAgICAgICB0aGlzLnhkci5hYm9ydCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgICAgLy8gc2luZ2xlIHNvdXJjZVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZGF0YS5zcmMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEuc3JjID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbXVsdGktc291cmNlXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0YS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLnJlbW92ZUNoaWxkKHRoaXMuZGF0YS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRvbmUgbm93LlxuICAgIHRoaXMuY29tcGxldGUoKTtcbn07XG5cbi8qKlxuICogS2lja3Mgb2ZmIGxvYWRpbmcgb2YgdGhpcyByZXNvdXJjZS4gVGhpcyBtZXRob2QgaXMgYXN5bmNocm9ub3VzLlxuICpcbiAqIEBmaXJlcyBzdGFydFxuICogQHBhcmFtIHtmdW5jdGlvbn0gW2NiXSAtIE9wdGlvbmFsIGNhbGxiYWNrIHRvIGNhbGwgb25jZSB0aGUgcmVzb3VyY2UgaXMgbG9hZGVkLlxuICovXG5SZXNvdXJjZS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIChjYikge1xuICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNDb21wbGV0ZSkge1xuICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2Ioc2VsZik7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmNlKCdjb21wbGV0ZScsIGNiKTtcbiAgICB9XG5cbiAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XG5cbiAgICB0aGlzLmVtaXQoJ3N0YXJ0JywgdGhpcyk7XG5cbiAgICAvLyBpZiB1bnNldCwgZGV0ZXJtaW5lIHRoZSB2YWx1ZVxuICAgIGlmICh0aGlzLmNyb3NzT3JpZ2luID09PSBmYWxzZSB8fCB0eXBlb2YgdGhpcy5jcm9zc09yaWdpbiAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5jcm9zc09yaWdpbiA9IHRoaXMuX2RldGVybWluZUNyb3NzT3JpZ2luKHRoaXMudXJsKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRoaXMubG9hZFR5cGUpIHtcbiAgICAgICAgY2FzZSBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0U6XG4gICAgICAgICAgICB0aGlzLl9sb2FkRWxlbWVudCgnaW1hZ2UnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgUmVzb3VyY2UuTE9BRF9UWVBFLkFVRElPOlxuICAgICAgICAgICAgdGhpcy5fbG9hZFNvdXJjZUVsZW1lbnQoJ2F1ZGlvJyk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5WSURFTzpcbiAgICAgICAgICAgIHRoaXMuX2xvYWRTb3VyY2VFbGVtZW50KCd2aWRlbycpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBSZXNvdXJjZS5MT0FEX1RZUEUuWEhSOlxuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKHVzZVhkciAmJiB0aGlzLmNyb3NzT3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFhkcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZFhocigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxuLyoqXG4gKiBMb2FkcyB0aGlzIHJlc291cmNlcyB1c2luZyBhbiBlbGVtZW50IHRoYXQgaGFzIGEgc2luZ2xlIHNvdXJjZSxcbiAqIGxpa2UgYW4gSFRNTEltYWdlRWxlbWVudC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgdHlwZSBvZiBlbGVtZW50IHRvIHVzZS5cbiAqL1xuUmVzb3VyY2UucHJvdG90eXBlLl9sb2FkRWxlbWVudCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgaWYgKHRoaXMubWV0YWRhdGEubG9hZEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5tZXRhZGF0YS5sb2FkRWxlbWVudDtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ltYWdlJyAmJiB0eXBlb2Ygd2luZG93LkltYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgSW1hZ2UoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY3Jvc3NPcmlnaW4pIHtcbiAgICAgICAgdGhpcy5kYXRhLmNyb3NzT3JpZ2luID0gdGhpcy5jcm9zc09yaWdpbjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubWV0YWRhdGEuc2tpcFNvdXJjZSkge1xuICAgICAgICB0aGlzLmRhdGEuc3JjID0gdGhpcy51cmw7XG4gICAgfVxuXG4gICAgdmFyIHR5cGVOYW1lID0gJ2lzJyArIHR5cGVbMF0udG9VcHBlckNhc2UoKSArIHR5cGUuc3Vic3RyaW5nKDEpO1xuXG4gICAgaWYgKHRoaXNbdHlwZU5hbWVdID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzW3R5cGVOYW1lXSA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fYm91bmRPbkVycm9yLCBmYWxzZSk7XG4gICAgdGhpcy5kYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZENvbXBsZXRlLCBmYWxzZSk7XG4gICAgdGhpcy5kYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgdGhpcy5fYm91bmRPblByb2dyZXNzLCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIExvYWRzIHRoaXMgcmVzb3VyY2VzIHVzaW5nIGFuIGVsZW1lbnQgdGhhdCBoYXMgbXVsdGlwbGUgc291cmNlcyxcbiAqIGxpa2UgYW4gSFRNTEF1ZGlvRWxlbWVudCBvciBIVE1MVmlkZW9FbGVtZW50LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG9mIGVsZW1lbnQgdG8gdXNlLlxuICovXG5SZXNvdXJjZS5wcm90b3R5cGUuX2xvYWRTb3VyY2VFbGVtZW50ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICBpZiAodGhpcy5tZXRhZGF0YS5sb2FkRWxlbWVudCkge1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLm1ldGFkYXRhLmxvYWRFbGVtZW50O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAnYXVkaW8nICYmIHR5cGVvZiB3aW5kb3cuQXVkaW8gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBdWRpbygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kYXRhID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuYWJvcnQoJ1Vuc3VwcG9ydGVkIGVsZW1lbnQgJyArIHR5cGUpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubWV0YWRhdGEuc2tpcFNvdXJjZSkge1xuICAgICAgICAvLyBzdXBwb3J0IGZvciBDb2Nvb25KUyBDYW52YXMrIHJ1bnRpbWUsIGxhY2tzIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpXG4gICAgICAgIGlmIChuYXZpZ2F0b3IuaXNDb2Nvb25KUykge1xuICAgICAgICAgICAgdGhpcy5kYXRhLnNyYyA9IEFycmF5LmlzQXJyYXkodGhpcy51cmwpID8gdGhpcy51cmxbMF0gOiB0aGlzLnVybDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMudXJsKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnVybC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5hcHBlbmRDaGlsZCh0aGlzLl9jcmVhdGVTb3VyY2UodHlwZSwgdGhpcy51cmxbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5hcHBlbmRDaGlsZCh0aGlzLl9jcmVhdGVTb3VyY2UodHlwZSwgdGhpcy51cmwpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXNbJ2lzJyArIHR5cGVbMF0udG9VcHBlckNhc2UoKSArIHR5cGUuc3Vic3RyaW5nKDEpXSA9IHRydWU7XG5cbiAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLl9ib3VuZE9uRXJyb3IsIGZhbHNlKTtcbiAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcbiAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCB0aGlzLl9ib3VuZE9uUHJvZ3Jlc3MsIGZhbHNlKTtcbiAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCB0aGlzLl9ib3VuZENvbXBsZXRlLCBmYWxzZSk7XG5cbiAgICB0aGlzLmRhdGEubG9hZCgpO1xufTtcblxuLyoqXG4gKiBMb2FkcyB0aGlzIHJlc291cmNlcyB1c2luZyBhbiBYTUxIdHRwUmVxdWVzdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5SZXNvdXJjZS5wcm90b3R5cGUuX2xvYWRYaHIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gaWYgdW5zZXQsIGRldGVybWluZSB0aGUgdmFsdWVcbiAgICBpZiAodHlwZW9mIHRoaXMueGhyVHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy54aHJUeXBlID0gdGhpcy5fZGV0ZXJtaW5lWGhyVHlwZSgpO1xuICAgIH1cblxuICAgIHZhciB4aHIgPSB0aGlzLnhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gc2V0IHRoZSByZXF1ZXN0IHR5cGUgYW5kIHVybFxuICAgIHhoci5vcGVuKCdHRVQnLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgICAvLyBsb2FkIGpzb24gYXMgdGV4dCBhbmQgcGFyc2UgaXQgb3Vyc2VsdmVzLiBXZSBkbyB0aGlzIGJlY2F1c2Ugc29tZSBicm93c2Vyc1xuICAgIC8vICpjb3VnaCogc2FmYXJpICpjb3VnaCogY2FuJ3QgZGVhbCB3aXRoIGl0LlxuICAgIGlmICh0aGlzLnhoclR5cGUgPT09IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkpTT04gfHwgdGhpcy54aHJUeXBlID09PSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCkge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLnhoclR5cGU7XG4gICAgfVxuXG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fYm91bmRYaHJPbkVycm9yLCBmYWxzZSk7XG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgdGhpcy5fYm91bmRYaHJPbkFib3J0LCBmYWxzZSk7XG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgdGhpcy5fYm91bmRPblByb2dyZXNzLCBmYWxzZSk7XG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZFhock9uTG9hZCwgZmFsc2UpO1xuXG4gICAgeGhyLnNlbmQoKTtcbn07XG5cbi8qKlxuICogTG9hZHMgdGhpcyByZXNvdXJjZXMgdXNpbmcgYW4gWERvbWFpblJlcXVlc3QuIFRoaXMgaXMgaGVyZSBiZWNhdXNlIHdlIG5lZWQgdG8gc3VwcG9ydCBJRTkgKGdyb3NzKS5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5SZXNvdXJjZS5wcm90b3R5cGUuX2xvYWRYZHIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gaWYgdW5zZXQsIGRldGVybWluZSB0aGUgdmFsdWVcbiAgICBpZiAodHlwZW9mIHRoaXMueGhyVHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy54aHJUeXBlID0gdGhpcy5fZGV0ZXJtaW5lWGhyVHlwZSgpO1xuICAgIH1cblxuICAgIHZhciB4ZHIgPSB0aGlzLnhociA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuXG4gICAgLy8gWERvbWFpblJlcXVlc3QgaGFzIGEgZmV3IHF1aXJrcy4gT2NjYXNpb25hbGx5IGl0IHdpbGwgYWJvcnQgcmVxdWVzdHNcbiAgICAvLyBBIHdheSB0byBhdm9pZCB0aGlzIGlzIHRvIG1ha2Ugc3VyZSBBTEwgY2FsbGJhY2tzIGFyZSBzZXQgZXZlbiBpZiBub3QgdXNlZFxuICAgIC8vIE1vcmUgaW5mbyBoZXJlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1Nzg2OTY2L3hkb21haW5yZXF1ZXN0LWFib3J0cy1wb3N0LW9uLWllLTlcbiAgICB4ZHIudGltZW91dCA9IDUwMDA7XG5cbiAgICB4ZHIub25lcnJvciA9IHRoaXMuX2JvdW5kWGhyT25FcnJvcjtcbiAgICB4ZHIub250aW1lb3V0ID0gdGhpcy5fYm91bmRYZHJPblRpbWVvdXQ7XG4gICAgeGRyLm9ucHJvZ3Jlc3MgPSB0aGlzLl9ib3VuZE9uUHJvZ3Jlc3M7XG4gICAgeGRyLm9ubG9hZCA9IHRoaXMuX2JvdW5kWGhyT25Mb2FkO1xuXG4gICAgeGRyLm9wZW4oJ0dFVCcsIHRoaXMudXJsLCB0cnVlKTtcblxuICAgIC8vIE5vdGU6IFRoZSB4ZHIuc2VuZCgpIGNhbGwgaXMgd3JhcHBlZCBpbiBhIHRpbWVvdXQgdG8gcHJldmVudCBhblxuICAgIC8vIGlzc3VlIHdpdGggdGhlIGludGVyZmFjZSB3aGVyZSBzb21lIHJlcXVlc3RzIGFyZSBsb3N0IGlmIG11bHRpcGxlXG4gICAgLy8gWERvbWFpblJlcXVlc3RzIGFyZSBiZWluZyBzZW50IGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgLy8gU29tZSBpbmZvIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9waG90b25zdG9ybS9waGFzZXIvaXNzdWVzLzEyNDhcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgeGRyLnNlbmQoKTtcbiAgICB9LCAwKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHNvdXJjZSB1c2VkIGluIGxvYWRpbmcgdmlhIGFuIGVsZW1lbnQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIGVsZW1lbnQgdHlwZSAodmlkZW8gb3IgYXVkaW8pLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSBzb3VyY2UgVVJMIHRvIGxvYWQgZnJvbS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbbWltZV0gLSBUaGUgbWltZSB0eXBlIG9mIHRoZSB2aWRlb1xuICogQHJldHVybiB7SFRNTFNvdXJjZUVsZW1lbnR9IFRoZSBzb3VyY2UgZWxlbWVudC5cbiAqL1xuUmVzb3VyY2UucHJvdG90eXBlLl9jcmVhdGVTb3VyY2UgPSBmdW5jdGlvbiAodHlwZSwgdXJsLCBtaW1lKSB7XG4gICAgaWYgKCFtaW1lKSB7XG4gICAgICAgIG1pbWUgPSB0eXBlICsgJy8nICsgdXJsLnN1YnN0cih1cmwubGFzdEluZGV4T2YoJy4nKSArIDEpO1xuICAgIH1cblxuICAgIHZhciBzb3VyY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcblxuICAgIHNvdXJjZS5zcmMgPSB1cmw7XG4gICAgc291cmNlLnR5cGUgPSBtaW1lO1xuXG4gICAgcmV0dXJuIHNvdXJjZTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIGlmIGEgbG9hZCBlcnJvcnMgb3V0LlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gVGhlIGVycm9yIGV2ZW50IGZyb20gdGhlIGVsZW1lbnQgdGhhdCBlbWl0cyBpdC5cbiAqIEBwcml2YXRlXG4gKi9cblJlc291cmNlLnByb3RvdHlwZS5fb25FcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMuYWJvcnQoJ0ZhaWxlZCB0byBsb2FkIGVsZW1lbnQgdXNpbmcgJyArIGV2ZW50LnRhcmdldC5ub2RlTmFtZSk7XG59O1xuXG4vKipcbiAqIENhbGxlZCBpZiBhIGxvYWQgcHJvZ3Jlc3MgZXZlbnQgZmlyZXMgZm9yIHhoci94ZHIuXG4gKlxuICogQGZpcmVzIHByb2dyZXNzXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdFByb2dyZXNzRXZlbnR8RXZlbnR9IGV2ZW50IC0gUHJvZ3Jlc3MgZXZlbnQuXG4gKi9cblJlc291cmNlLnByb3RvdHlwZS5fb25Qcm9ncmVzcyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudCAmJiBldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgIHRoaXMuZW1pdCgncHJvZ3Jlc3MnLCB0aGlzLCBldmVudC5sb2FkZWQgLyBldmVudC50b3RhbCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDYWxsZWQgaWYgYW4gZXJyb3IgZXZlbnQgZmlyZXMgZm9yIHhoci94ZHIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3RFcnJvckV2ZW50fEV2ZW50fSBldmVudCAtIEVycm9yIGV2ZW50LlxuICovXG5SZXNvdXJjZS5wcm90b3R5cGUuX3hock9uRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHhociA9IHRoaXMueGhyO1xuXG4gICAgdGhpcy5hYm9ydChyZXFUeXBlKHhocikgKyAnIFJlcXVlc3QgZmFpbGVkLiBTdGF0dXM6ICcgKyB4aHIuc3RhdHVzICsgJywgdGV4dDogXCInICsgeGhyLnN0YXR1c1RleHQgKyAnXCInKTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIGlmIGFuIGFib3J0IGV2ZW50IGZpcmVzIGZvciB4aHIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3RBYm9ydEV2ZW50fSBldmVudCAtIEFib3J0IEV2ZW50XG4gKi9cblJlc291cmNlLnByb3RvdHlwZS5feGhyT25BYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFib3J0KHJlcVR5cGUodGhpcy54aHIpICsgJyBSZXF1ZXN0IHdhcyBhYm9ydGVkIGJ5IHRoZSB1c2VyLicpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgaWYgYSB0aW1lb3V0IGV2ZW50IGZpcmVzIGZvciB4ZHIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gVGltZW91dCBldmVudC5cbiAqL1xuUmVzb3VyY2UucHJvdG90eXBlLl94ZHJPblRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hYm9ydChyZXFUeXBlKHRoaXMueGhyKSArICcgUmVxdWVzdCB0aW1lZCBvdXQuJyk7XG59O1xuXG4vKipcbiAqIENhbGxlZCB3aGVuIGRhdGEgc3VjY2Vzc2Z1bGx5IGxvYWRzIGZyb20gYW4geGhyL3hkciByZXF1ZXN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0TG9hZEV2ZW50fEV2ZW50fSBldmVudCAtIExvYWQgZXZlbnRcbiAqL1xuUmVzb3VyY2UucHJvdG90eXBlLl94aHJPbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHhociA9IHRoaXMueGhyO1xuICAgIHZhciBzdGF0dXMgPSB0eXBlb2YgeGhyLnN0YXR1cyA9PT0gJ3VuZGVmaW5lZCcgPyB4aHIuc3RhdHVzIDogU1RBVFVTX09LOyAvLyBYRFIgaGFzIG5vIGAuc3RhdHVzYCwgYXNzdW1lIDIwMC5cblxuICAgIC8vIHN0YXR1cyBjYW4gYmUgMCB3aGVuIHVzaW5nIHRoZSBmaWxlOi8vIHByb3RvY29sLCBhbHNvIGNoZWNrIGlmIGEgcmVzcG9uc2Ugd2FzIGZvdW5kXG4gICAgaWYgKHN0YXR1cyA9PT0gU1RBVFVTX09LIHx8IHN0YXR1cyA9PT0gU1RBVFVTX0VNUFRZIHx8IChzdGF0dXMgPT09IFNUQVRVU19OT05FICYmIHhoci5yZXNwb25zZVRleHQubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgLy8gaWYgdGV4dCwganVzdCByZXR1cm4gaXRcbiAgICAgICAgaWYgKHRoaXMueGhyVHlwZSA9PT0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiBqc29uLCBwYXJzZSBpbnRvIGpzb24gb2JqZWN0XG4gICAgICAgIGVsc2UgaWYgKHRoaXMueGhyVHlwZSA9PT0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNKc29uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hYm9ydCgnRXJyb3IgdHJ5aW5nIHRvIHBhcnNlIGxvYWRlZCBqc29uOicsIGUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHhtbCwgcGFyc2UgaW50byBhbiB4bWwgZG9jdW1lbnQgb3IgZGl2IGVsZW1lbnRcbiAgICAgICAgZWxzZSBpZiAodGhpcy54aHJUeXBlID09PSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAod2luZG93LkRPTVBhcnNlcikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZG9tcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRvbXBhcnNlci5wYXJzZUZyb21TdHJpbmcoeGhyLnJlc3BvbnNlVGV4dCwgJ3RleHQveG1sJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRpdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5pc1htbCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWJvcnQoJ0Vycm9yIHRyeWluZyB0byBwYXJzZSBsb2FkZWQgeG1sOicsIGUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIG90aGVyIHR5cGVzIGp1c3QgcmV0dXJuIHRoZSByZXNwb25zZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHhoci5yZXNwb25zZSB8fCB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmFib3J0KCdbJyArIHhoci5zdGF0dXMgKyAnXScgKyB4aHIuc3RhdHVzVGV4dCArICc6JyArIHhoci5yZXNwb25zZVVSTCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY29tcGxldGUoKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgYGNyb3NzT3JpZ2luYCBwcm9wZXJ0eSBmb3IgdGhpcyByZXNvdXJjZSBiYXNlZCBvbiBpZiB0aGUgdXJsXG4gKiBmb3IgdGhpcyByZXNvdXJjZSBpcyBjcm9zcy1vcmlnaW4uIElmIGNyb3NzT3JpZ2luIHdhcyBtYW51YWxseSBzZXQsIHRoaXNcbiAqIGZ1bmN0aW9uIGRvZXMgbm90aGluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSB1cmwgdG8gdGVzdC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbbG9jPXdpbmRvdy5sb2NhdGlvbl0gLSBUaGUgbG9jYXRpb24gb2JqZWN0IHRvIHRlc3QgYWdhaW5zdC5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGNyb3NzT3JpZ2luIHZhbHVlIHRvIHVzZSAob3IgZW1wdHkgc3RyaW5nIGZvciBub25lKS5cbiAqL1xuUmVzb3VyY2UucHJvdG90eXBlLl9kZXRlcm1pbmVDcm9zc09yaWdpbiA9IGZ1bmN0aW9uICh1cmwsIGxvYykge1xuICAgIC8vIGRhdGE6IGFuZCBqYXZhc2NyaXB0OiB1cmxzIGFyZSBjb25zaWRlcmVkIHNhbWUtb3JpZ2luXG4gICAgaWYgKHVybC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICAvLyBkZWZhdWx0IGlzIHdpbmRvdy5sb2NhdGlvblxuICAgIGxvYyA9IGxvYyB8fCB3aW5kb3cubG9jYXRpb247XG5cbiAgICBpZiAoIXRlbXBBbmNob3IpIHtcbiAgICAgICAgdGVtcEFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB9XG5cbiAgICAvLyBsZXQgdGhlIGJyb3dzZXIgZGV0ZXJtaW5lIHRoZSBmdWxsIGhyZWYgZm9yIHRoZSB1cmwgb2YgdGhpcyByZXNvdXJjZSBhbmQgdGhlblxuICAgIC8vIHBhcnNlIHdpdGggdGhlIG5vZGUgdXJsIGxpYiwgd2UgY2FuJ3QgdXNlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBhbmNob3IgZWxlbWVudFxuICAgIC8vIGJlY2F1c2UgdGhleSBkb24ndCB3b3JrIGluIElFOSA6KFxuICAgIHRlbXBBbmNob3IuaHJlZiA9IHVybDtcbiAgICB1cmwgPSBwYXJzZVVyaSh0ZW1wQW5jaG9yLmhyZWYsIHsgc3RyaWN0TW9kZTogdHJ1ZSB9KTtcblxuICAgIHZhciBzYW1lUG9ydCA9ICghdXJsLnBvcnQgJiYgbG9jLnBvcnQgPT09ICcnKSB8fCAodXJsLnBvcnQgPT09IGxvYy5wb3J0KTtcbiAgICB2YXIgcHJvdG9jb2wgPSB1cmwucHJvdG9jb2wgPyB1cmwucHJvdG9jb2wgKyAnOicgOiAnJztcblxuICAgIC8vIGlmIGNyb3NzIG9yaWdpblxuICAgIGlmICh1cmwuaG9zdCAhPT0gbG9jLmhvc3RuYW1lIHx8ICFzYW1lUG9ydCB8fCBwcm90b2NvbCAhPT0gbG9jLnByb3RvY29sKSB7XG4gICAgICAgIHJldHVybiAnYW5vbnltb3VzJztcbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG59O1xuXG4vKipcbiAqIERldGVybWluZXMgdGhlIHJlc3BvbnNlVHlwZSBvZiBhbiBYSFIgcmVxdWVzdCBiYXNlZCBvbiB0aGUgZXh0ZW5zaW9uIG9mIHRoZVxuICogcmVzb3VyY2UgYmVpbmcgbG9hZGVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcmV0dXJuIHtSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRX0gVGhlIHJlc3BvbnNlVHlwZSB0byB1c2UuXG4gKi9cblJlc291cmNlLnByb3RvdHlwZS5fZGV0ZXJtaW5lWGhyVHlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVzb3VyY2UuX3hoclR5cGVNYXBbdGhpcy5fZ2V0RXh0ZW5zaW9uKCldIHx8IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLlRFWFQ7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuX2RldGVybWluZUxvYWRUeXBlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZXNvdXJjZS5fbG9hZFR5cGVNYXBbdGhpcy5fZ2V0RXh0ZW5zaW9uKCldIHx8IFJlc291cmNlLkxPQURfVFlQRS5YSFI7XG59O1xuXG5SZXNvdXJjZS5wcm90b3R5cGUuX2dldEV4dGVuc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdXJsID0gdGhpcy51cmw7XG4gICAgdmFyIGV4dCA9ICcnO1xuXG4gICAgaWYgKHRoaXMuaXNEYXRhVXJsKSB7XG4gICAgICAgIHZhciBzbGFzaEluZGV4ID0gdXJsLmluZGV4T2YoJy8nKTtcblxuICAgICAgICBleHQgPSB1cmwuc3Vic3RyaW5nKHNsYXNoSW5kZXggKyAxLCB1cmwuaW5kZXhPZignOycsIHNsYXNoSW5kZXgpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBxdWVyeVN0YXJ0ID0gdXJsLmluZGV4T2YoJz8nKTtcblxuICAgICAgICBpZiAocXVlcnlTdGFydCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHVybCA9IHVybC5zdWJzdHJpbmcoMCwgcXVlcnlTdGFydCk7XG4gICAgICAgIH1cblxuICAgICAgICBleHQgPSB1cmwuc3Vic3RyaW5nKHVybC5sYXN0SW5kZXhPZignLicpICsgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dC50b0xvd2VyQ2FzZSgpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBtaW1lIHR5cGUgb2YgYW4gWEhSIHJlcXVlc3QgYmFzZWQgb24gdGhlIHJlc3BvbnNlVHlwZSBvZlxuICogcmVzb3VyY2UgYmVpbmcgbG9hZGVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1Jlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFfSB0eXBlIC0gVGhlIHR5cGUgdG8gZ2V0IGEgbWltZSB0eXBlIGZvci5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIG1pbWUgdHlwZSB0byB1c2UuXG4gKi9cblJlc291cmNlLnByb3RvdHlwZS5fZ2V0TWltZUZyb21YaHJUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CVUZGRVI6XG4gICAgICAgICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL29jdGV0LWJpbmFyeSc7XG5cbiAgICAgICAgY2FzZSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CTE9COlxuICAgICAgICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi9ibG9iJztcblxuICAgICAgICBjYXNlIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5UOlxuICAgICAgICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi94bWwnO1xuXG4gICAgICAgIGNhc2UgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTjpcbiAgICAgICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vanNvbic7XG5cbiAgICAgICAgY2FzZSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ERUZBVUxUOlxuICAgICAgICBjYXNlIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLlRFWFQ6XG4gICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ3RleHQvcGxhaW4nO1xuXG4gICAgfVxufTtcblxuLyoqXG4gKiBRdWljayBoZWxwZXIgdG8gZ2V0IHN0cmluZyB4aHIgdHlwZS5cbiAqXG4gKiBAaWdub3JlXG4gKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0fFhEb21haW5SZXF1ZXN0fSB4aHIgLSBUaGUgcmVxdWVzdCB0byBjaGVjay5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIHJlcVR5cGUoeGhyKSB7XG4gICAgcmV0dXJuIHhoci50b1N0cmluZygpLnJlcGxhY2UoJ29iamVjdCAnLCAnJyk7XG59XG5cbi8qKlxuICogVGhlIHR5cGVzIG9mIGxvYWRpbmcgYSByZXNvdXJjZSBjYW4gdXNlLlxuICpcbiAqIEBzdGF0aWNcbiAqIEByZWFkb25seVxuICogQGVudW0ge251bWJlcn1cbiAqL1xuUmVzb3VyY2UuTE9BRF9UWVBFID0ge1xuICAgIC8qKiBVc2VzIFhNTEh0dHBSZXF1ZXN0IHRvIGxvYWQgdGhlIHJlc291cmNlLiAqL1xuICAgIFhIUjogICAgMSxcbiAgICAvKiogVXNlcyBhbiBgSW1hZ2VgIG9iamVjdCB0byBsb2FkIHRoZSByZXNvdXJjZS4gKi9cbiAgICBJTUFHRTogIDIsXG4gICAgLyoqIFVzZXMgYW4gYEF1ZGlvYCBvYmplY3QgdG8gbG9hZCB0aGUgcmVzb3VyY2UuICovXG4gICAgQVVESU86ICAzLFxuICAgIC8qKiBVc2VzIGEgYFZpZGVvYCBvYmplY3QgdG8gbG9hZCB0aGUgcmVzb3VyY2UuICovXG4gICAgVklERU86ICA0XG59O1xuXG4vKipcbiAqIFRoZSBYSFIgcmVhZHkgc3RhdGVzLCB1c2VkIGludGVybmFsbHkuXG4gKlxuICogQHN0YXRpY1xuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5SZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRSA9IHtcbiAgICAvKiogZGVmYXVsdHMgdG8gdGV4dCAqL1xuICAgIERFRkFVTFQ6ICAgICd0ZXh0JyxcbiAgICAvKiogQXJyYXlCdWZmZXIgKi9cbiAgICBCVUZGRVI6ICAgICAnYXJyYXlidWZmZXInLFxuICAgIC8qKiBCbG9iICovXG4gICAgQkxPQjogICAgICAgJ2Jsb2InLFxuICAgIC8qKiBEb2N1bWVudCAqL1xuICAgIERPQ1VNRU5UOiAgICdkb2N1bWVudCcsXG4gICAgLyoqIE9iamVjdCAqL1xuICAgIEpTT046ICAgICAgICdqc29uJyxcbiAgICAvKiogU3RyaW5nICovXG4gICAgVEVYVDogICAgICAgJ3RleHQnXG59O1xuXG5SZXNvdXJjZS5fbG9hZFR5cGVNYXAgPSB7XG4gICAgZ2lmOiAgICAgIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBwbmc6ICAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFLFxuICAgIGJtcDogICAgICBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAganBnOiAgICAgIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBqcGVnOiAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFLFxuICAgIHRpZjogICAgICBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAgdGlmZjogICAgIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICB3ZWJwOiAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFLFxuICAgIHRnYTogICAgICBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAgJ3N2Zyt4bWwnOiAgUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFXG59O1xuXG5SZXNvdXJjZS5feGhyVHlwZU1hcCA9IHtcbiAgICAvLyB4bWxcbiAgICB4aHRtbDogICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuRE9DVU1FTlQsXG4gICAgaHRtbDogICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIGh0bTogICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCxcbiAgICB4bWw6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuRE9DVU1FTlQsXG4gICAgdG14OiAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIHRzeDogICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCxcbiAgICBzdmc6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuRE9DVU1FTlQsXG5cbiAgICAvLyBpbWFnZXNcbiAgICBnaWY6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICBwbmc6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICBibXA6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICBqcGc6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICBqcGVnOiAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICB0aWY6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICB0aWZmOiAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICB3ZWJwOiAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICB0Z2E6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcblxuICAgIC8vIGpzb25cbiAgICBqc29uOiAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTixcblxuICAgIC8vIHRleHRcbiAgICB0ZXh0OiAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVCxcbiAgICB0eHQ6ICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVFxufTtcblxuLyoqXG4gKiBTZXRzIHRoZSBsb2FkIHR5cGUgdG8gYmUgdXNlZCBmb3IgYSBzcGVjaWZpYyBleHRlbnNpb24uXG4gKlxuICogQHN0YXRpY1xuICogQHBhcmFtIHtzdHJpbmd9IGV4dG5hbWUgLSBUaGUgZXh0ZW5zaW9uIHRvIHNldCB0aGUgdHlwZSBmb3IsIGUuZy4gXCJwbmdcIiBvciBcImZudFwiXG4gKiBAcGFyYW0ge1Jlc291cmNlLkxPQURfVFlQRX0gbG9hZFR5cGUgLSBUaGUgbG9hZCB0eXBlIHRvIHNldCBpdCB0by5cbiAqL1xuUmVzb3VyY2Uuc2V0RXh0ZW5zaW9uTG9hZFR5cGUgPSBmdW5jdGlvbiAoZXh0bmFtZSwgbG9hZFR5cGUpIHtcbiAgICBzZXRFeHRNYXAoUmVzb3VyY2UuX2xvYWRUeXBlTWFwLCBleHRuYW1lLCBsb2FkVHlwZSk7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGxvYWQgdHlwZSB0byBiZSB1c2VkIGZvciBhIHNwZWNpZmljIGV4dGVuc2lvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0ge3N0cmluZ30gZXh0bmFtZSAtIFRoZSBleHRlbnNpb24gdG8gc2V0IHRoZSB0eXBlIGZvciwgZS5nLiBcInBuZ1wiIG9yIFwiZm50XCJcbiAqIEBwYXJhbSB7UmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEV9IHhoclR5cGUgLSBUaGUgeGhyIHR5cGUgdG8gc2V0IGl0IHRvLlxuICovXG5SZXNvdXJjZS5zZXRFeHRlbnNpb25YaHJUeXBlID0gZnVuY3Rpb24gKGV4dG5hbWUsIHhoclR5cGUpIHtcbiAgICBzZXRFeHRNYXAoUmVzb3VyY2UuX3hoclR5cGVNYXAsIGV4dG5hbWUsIHhoclR5cGUpO1xufTtcblxuZnVuY3Rpb24gc2V0RXh0TWFwKG1hcCwgZXh0bmFtZSwgdmFsKSB7XG4gICAgaWYgKGV4dG5hbWUgJiYgZXh0bmFtZS5pbmRleE9mKCcuJykgPT09IDApIHtcbiAgICAgICAgZXh0bmFtZSA9IGV4dG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIGlmICghZXh0bmFtZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWFwW2V4dG5hbWVdID0gdmFsO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFNtYWxsZXIgdmVyc2lvbiBvZiB0aGUgYXN5bmMgbGlicmFyeSBjb25zdHJ1Y3RzLlxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBlYWNoU2VyaWVzOiBhc3luY0VhY2hTZXJpZXMsXG4gICAgcXVldWU6IGFzeW5jUXVldWVcbn07XG5cbmZ1bmN0aW9uIF9ub29wKCkgeyAvKiBlbXB0eSAqLyB9XG5cbi8qKlxuICogSXRlcmF0ZXMgYW4gYXJyYXkgaW4gc2VyaWVzLlxuICpcbiAqIEBwYXJhbSB7KltdfSBhcnJheSAtIEFycmF5IHRvIGl0ZXJhdGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVyYXRvciAtIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggZWxlbWVudC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGRvbmUsIG9yIG9uIGVycm9yLlxuICovXG5mdW5jdGlvbiBhc3luY0VhY2hTZXJpZXMoYXJyYXksIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbGVuID0gYXJyYXkubGVuZ3RoO1xuXG4gICAgKGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgIGlmIChlcnIgfHwgaSA9PT0gbGVuKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpdGVyYXRvcihhcnJheVtpKytdLCBuZXh0KTtcbiAgICB9KSgpO1xufVxuXG4vKipcbiAqIEVuc3VyZXMgYSBmdW5jdGlvbiBpcyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIHdyYXBwaW5nIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvbmx5T25jZShmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgICAgICAgaWYgKGZuID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxiYWNrIHdhcyBhbHJlYWR5IGNhbGxlZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjYWxsRm4gPSBmbjtcblxuICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIGNhbGxGbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8qKlxuICogQXN5bmMgcXVldWUgaW1wbGVtZW50YXRpb24sXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gd29ya2VyIC0gVGhlIHdvcmtlciBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHRhc2suXG4gKiBAcGFyYW0ge251bWJlcn0gY29uY3VycmVuY3kgLSBIb3cgbWFueSB3b3JrZXJzIHRvIHJ1biBpbiBwYXJyYWxsZWwuXG4gKiBAcmV0dXJuIHsqfSBUaGUgYXN5bmMgcXVldWUgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBhc3luY1F1ZXVlKHdvcmtlciwgY29uY3VycmVuY3kpIHtcbiAgICBpZiAoY29uY3VycmVuY3kgPT0gbnVsbCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVxLW51bGwsZXFlcWVxXG4gICAgICAgIGNvbmN1cnJlbmN5ID0gMTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgfVxuXG4gICAgdmFyIHdvcmtlcnMgPSAwO1xuICAgIHZhciBxID0ge1xuICAgICAgICBfdGFza3M6IFtdLFxuICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgIHNhdHVyYXRlZDogX25vb3AsXG4gICAgICAgIHVuc2F0dXJhdGVkOiBfbm9vcCxcbiAgICAgICAgYnVmZmVyOiBjb25jdXJyZW5jeSAvIDQsXG4gICAgICAgIGVtcHR5OiBfbm9vcCxcbiAgICAgICAgZHJhaW46IF9ub29wLFxuICAgICAgICBlcnJvcjogX25vb3AsXG4gICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICBwdXNoOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQoZGF0YSwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgfSxcbiAgICAgICAga2lsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcS5kcmFpbiA9IF9ub29wO1xuICAgICAgICAgICAgcS5fdGFza3MgPSBbXTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2hpbGUgKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLl90YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFzayA9IHEuX3Rhc2tzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS5fdGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3b3JrZXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAod29ya2VycyA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdvcmtlcih0YXNrLmRhdGEsIG9ubHlPbmNlKF9uZXh0KHRhc2spKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHEuX3Rhc2tzLmxlbmd0aDtcbiAgICAgICAgfSxcbiAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnM7XG4gICAgICAgIH0sXG4gICAgICAgIGlkbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBxLl90YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICB9LFxuICAgICAgICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gTmVlZCB0byBjYWxsIHEucHJvY2VzcyBvbmNlIHBlciBjb25jdXJyZW50XG4gICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgZm9yICh2YXIgdyA9IDE7IHcgPD0gcS5jb25jdXJyZW5jeTsgdysrKSB7XG4gICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2luc2VydChkYXRhLCBpbnNlcnRBdEZyb250LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lcS1udWxsLGVxZXFlcVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoZGF0YSA9PSBudWxsICYmIHEuaWRsZSgpKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCxlcWVxZXFcbiAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICB9LCAxKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogX25vb3BcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaW5zZXJ0QXRGcm9udCkge1xuICAgICAgICAgICAgcS5fdGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHEuX3Rhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICB9LCAxKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbmV4dCh0YXNrKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3b3JrZXJzIC09IDE7XG5cbiAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1swXSAhPSBudWxsKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCxlcWVxZXFcbiAgICAgICAgICAgICAgICBxLmVycm9yKGFyZ3VtZW50c1swXSwgdGFzay5kYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHdvcmtlcnMgPD0gKHEuY29uY3VycmVuY3kgLSBxLmJ1ZmZlcikpIHtcbiAgICAgICAgICAgICAgICBxLnVuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChxLmlkbGUoKSkge1xuICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHE7XG59XG4iLCIvKiBlc2xpbnQgbm8tbWFnaWMtbnVtYmVyczogMCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBwcml2YXRlIHByb3BlcnR5XG4gICAgX2tleVN0cjogJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcblxuICAgIGVuY29kZUJpbmFyeTogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIHZhciBvdXRwdXQgPSAnJztcbiAgICAgICAgdmFyIGJ5dGVidWZmZXI7XG4gICAgICAgIHZhciBlbmNvZGVkQ2hhckluZGV4ZXMgPSBuZXcgQXJyYXkoNCk7XG4gICAgICAgIHZhciBpbnggPSAwO1xuICAgICAgICB2YXIgam54ID0gMDtcbiAgICAgICAgdmFyIHBhZGRpbmdCeXRlcyA9IDA7XG5cbiAgICAgICAgd2hpbGUgKGlueCA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gRmlsbCBieXRlIGJ1ZmZlciBhcnJheVxuICAgICAgICAgICAgYnl0ZWJ1ZmZlciA9IG5ldyBBcnJheSgzKTtcblxuICAgICAgICAgICAgZm9yIChqbnggPSAwOyBqbnggPCBieXRlYnVmZmVyLmxlbmd0aDsgam54KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW54IDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRocm93IGF3YXkgaGlnaC1vcmRlciBieXRlLCBhcyBkb2N1bWVudGVkIGF0OlxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9Fbi9Vc2luZ19YTUxIdHRwUmVxdWVzdCNIYW5kbGluZ19iaW5hcnlfZGF0YVxuICAgICAgICAgICAgICAgICAgICBieXRlYnVmZmVyW2pueF0gPSBpbnB1dC5jaGFyQ29kZUF0KGlueCsrKSAmIDB4ZmY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBieXRlYnVmZmVyW2pueF0gPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gR2V0IGVhY2ggZW5jb2RlZCBjaGFyYWN0ZXIsIDYgYml0cyBhdCBhIHRpbWVcbiAgICAgICAgICAgIC8vIGluZGV4IDE6IGZpcnN0IDYgYml0c1xuICAgICAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzBdID0gYnl0ZWJ1ZmZlclswXSA+PiAyO1xuICAgICAgICAgICAgLy8gaW5kZXggMjogc2Vjb25kIDYgYml0cyAoMiBsZWFzdCBzaWduaWZpY2FudCBiaXRzIGZyb20gaW5wdXQgYnl0ZSAxICsgNCBtb3N0IHNpZ25pZmljYW50IGJpdHMgZnJvbSBieXRlIDIpXG4gICAgICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbMV0gPSAoKGJ5dGVidWZmZXJbMF0gJiAweDMpIDw8IDQpIHwgKGJ5dGVidWZmZXJbMV0gPj4gNCk7XG4gICAgICAgICAgICAvLyBpbmRleCAzOiB0aGlyZCA2IGJpdHMgKDQgbGVhc3Qgc2lnbmlmaWNhbnQgYml0cyBmcm9tIGlucHV0IGJ5dGUgMiArIDIgbW9zdCBzaWduaWZpY2FudCBiaXRzIGZyb20gYnl0ZSAzKVxuICAgICAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzJdID0gKChieXRlYnVmZmVyWzFdICYgMHgwZikgPDwgMikgfCAoYnl0ZWJ1ZmZlclsyXSA+PiA2KTtcbiAgICAgICAgICAgIC8vIGluZGV4IDM6IGZvcnRoIDYgYml0cyAoNiBsZWFzdCBzaWduaWZpY2FudCBiaXRzIGZyb20gaW5wdXQgYnl0ZSAzKVxuICAgICAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzNdID0gYnl0ZWJ1ZmZlclsyXSAmIDB4M2Y7XG5cbiAgICAgICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHBhZGRpbmcgaGFwcGVuZWQsIGFuZCBhZGp1c3QgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIHBhZGRpbmdCeXRlcyA9IGlueCAtIChpbnB1dC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHN3aXRjaCAocGFkZGluZ0J5dGVzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgbGFzdCAyIGNoYXJhY3RlcnMgdG8gcGFkZGluZyBjaGFyXG4gICAgICAgICAgICAgICAgICAgIGVuY29kZWRDaGFySW5kZXhlc1szXSA9IDY0O1xuICAgICAgICAgICAgICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbMl0gPSA2NDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBsYXN0IGNoYXJhY3RlciB0byBwYWRkaW5nIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzNdID0gNjQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIE5vIHBhZGRpbmcgLSBwcm9jZWVkXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdyB3ZSB3aWxsIGdyYWIgZWFjaCBhcHByb3ByaWF0ZSBjaGFyYWN0ZXIgb3V0IG9mIG91ciBrZXlzdHJpbmdcbiAgICAgICAgICAgIC8vIGJhc2VkIG9uIG91ciBpbmRleCBhcnJheSBhbmQgYXBwZW5kIGl0IHRvIHRoZSBvdXRwdXQgc3RyaW5nXG4gICAgICAgICAgICBmb3IgKGpueCA9IDA7IGpueCA8IGVuY29kZWRDaGFySW5kZXhlcy5sZW5ndGg7IGpueCsrKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRoaXMuX2tleVN0ci5jaGFyQXQoZW5jb2RlZENoYXJJbmRleGVzW2pueF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG59O1xuIiwiLyogZXNsaW50IGdsb2JhbC1yZXF1aXJlOiAwICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9Mb2FkZXInKTtcbm1vZHVsZS5leHBvcnRzLlJlc291cmNlID0gcmVxdWlyZSgnLi9SZXNvdXJjZScpO1xubW9kdWxlLmV4cG9ydHMubWlkZGxld2FyZSA9IHtcbiAgICBjYWNoaW5nOiB7XG4gICAgICAgIG1lbW9yeTogcmVxdWlyZSgnLi9taWRkbGV3YXJlcy9jYWNoaW5nL21lbW9yeScpXG4gICAgfSxcbiAgICBwYXJzaW5nOiB7XG4gICAgICAgIGJsb2I6IHJlcXVpcmUoJy4vbWlkZGxld2FyZXMvcGFyc2luZy9ibG9iJylcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5hc3luYyA9IHJlcXVpcmUoJy4vYXN5bmMnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gYSBzaW1wbGUgaW4tbWVtb3J5IGNhY2hlIGZvciByZXNvdXJjZXNcbnZhciBjYWNoZSA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlc291cmNlLCBuZXh0KSB7XG4gICAgICAgIC8vIGlmIGNhY2hlZCwgdGhlbiBzZXQgZGF0YSBhbmQgY29tcGxldGUgdGhlIHJlc291cmNlXG4gICAgICAgIGlmIChjYWNoZVtyZXNvdXJjZS51cmxdKSB7XG4gICAgICAgICAgICByZXNvdXJjZS5kYXRhID0gY2FjaGVbcmVzb3VyY2UudXJsXTtcbiAgICAgICAgICAgIHJlc291cmNlLmNvbXBsZXRlKCk7IC8vIG1hcmtzIHJlc291cmNlIGxvYWQgY29tcGxldGUgYW5kIHN0b3BzIHByb2Nlc3NpbmcgYmVmb3JlIG1pZGRsZXdhcmVzXG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgbm90IGNhY2hlZCwgd2FpdCBmb3IgY29tcGxldGUgYW5kIHN0b3JlIGl0IGluIHRoZSBjYWNoZS5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXNvdXJjZS5vbmNlKCdjb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWNoZVt0aGlzLnVybF0gPSB0aGlzLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQoKTtcbiAgICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlc291cmNlID0gcmVxdWlyZSgnLi4vLi4vUmVzb3VyY2UnKTtcbnZhciBiNjQgPSByZXF1aXJlKCcuLi8uLi9iNjQnKTtcblxudmFyIFVybCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTDtcblxuLy8gYSBtaWRkbGV3YXJlIGZvciB0cmFuc2Zvcm1pbmcgWEhSIGxvYWRlZCBCbG9icyBpbnRvIG1vcmUgdXNlZnVsIG9iamVjdHNcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyZXNvdXJjZSwgbmV4dCkge1xuICAgICAgICBpZiAoIXJlc291cmNlLmRhdGEpIHtcbiAgICAgICAgICAgIG5leHQoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhpcyB3YXMgYW4gWEhSIGxvYWQgb2YgYSBibG9iXG4gICAgICAgIGlmIChyZXNvdXJjZS54aHIgJiYgcmVzb3VyY2UueGhyVHlwZSA9PT0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQikge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYmxvYiBzdXBwb3J0IHdlIHByb2JhYmx5IGdvdCBhIGJpbmFyeSBzdHJpbmcgYmFja1xuICAgICAgICAgICAgaWYgKCF3aW5kb3cuQmxvYiB8fCB0eXBlb2YgcmVzb3VyY2UuZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZSA9IHJlc291cmNlLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGltYWdlLCBjb252ZXJ0IHRoZSBiaW5hcnkgc3RyaW5nIGludG8gYSBkYXRhIHVybFxuICAgICAgICAgICAgICAgIGlmICh0eXBlICYmIHR5cGUuaW5kZXhPZignaW1hZ2UnKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEuc3JjID0gJ2RhdGE6JyArIHR5cGUgKyAnO2Jhc2U2NCwnICsgYjY0LmVuY29kZUJpbmFyeShyZXNvdXJjZS54aHIucmVzcG9uc2VUZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5pc0ltYWdlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB3YWl0IHVudGlsIHRoZSBpbWFnZSBsb2FkcyBhbmQgdGhlbiBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEub25sb2FkID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIG5leHQgd2lsbCBiZSBjYWxsZWQgb24gbG9hZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgY29udGVudCB0eXBlIHNheXMgdGhpcyBpcyBhbiBpbWFnZSwgdGhlbiB3ZSBzaG91bGQgdHJhbnNmb3JtIHRoZSBibG9iIGludG8gYW4gSW1hZ2Ugb2JqZWN0XG4gICAgICAgICAgICBlbHNlIGlmIChyZXNvdXJjZS5kYXRhLnR5cGUuaW5kZXhPZignaW1hZ2UnKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzcmMgPSBVcmwuY3JlYXRlT2JqZWN0VVJMKHJlc291cmNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UuYmxvYiA9IHJlc291cmNlLmRhdGE7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2UuZGF0YSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEuc3JjID0gc3JjO1xuXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UuaXNJbWFnZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvLyBjbGVhbnVwIHRoZSBubyBsb25nZXIgdXNlZCBibG9iIGFmdGVyIHRoZSBpbWFnZSBsb2Fkc1xuICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBVcmwucmV2b2tlT2JqZWN0VVJMKHNyYyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEub25sb2FkID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIG5leHQgd2lsbCBiZSBjYWxsZWQgb24gbG9hZC5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcbn07XG4iXX0=
