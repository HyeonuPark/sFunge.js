'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function deepCheckCondition(target, condition) {
    if (condition && typeof condition.some === 'function') {
        return condition.some(function (elem) {
            return deepCheckCondition(target, elem);
        });
    } else if (typeof condition === 'object' && typeof target === 'object') {
        return Object.keys(condition).every(function (key) {
            return deepCheckCondition(target[key], condition[key]);
        });
    } else return target === condition;
}

var PromiseEmitter = (function () {
    function PromiseEmitter(eventEmitter, eventName) {
        var _this = this;

        _classCallCheck(this, PromiseEmitter);

        if (eventEmitter && typeof eventEmitter.on === 'function' && typeof eventEmitter.emit === 'function' && eventName && typeof eventName === 'string') {

            eventEmitter.on(eventName, function (data) {
                return process.nextTick(function () {
                    return _this.emit(data);
                });
            });
        }

        this.listeners = [];
    }

    _createClass(PromiseEmitter, [{
        key: 'emit',
        value: function emit(data) {
            var promisedData = Promise.resolve(data);
            this.listeners.forEach(function (each) {
                return each(promisedData);
            });
            return this;
        }
    }, {
        key: 'then',
        value: function then(onSuccess, onError, pipeTo) {
            var nextPromiseEmitter = pipeTo && pipeTo instanceof PromiseEmitter ? pipeTo : new PromiseEmitter();
            this.listeners.push(function (data) {
                return process.nextTick(nextPromiseEmitter.emit(data.then(onSuccess, onError)));
            });
            return nextPromiseEmitter;
        }
    }, {
        key: 'catch',
        value: function _catch(onError, pipeTo) {
            return this.then(null, onError, pipeTo);
        }
    }, {
        key: 'when',
        value: function when(conditio, pipeTo) {
            var nextPromiseEmitter = pipeTo && pipeTo instanceof PromiseEmitter ? pipeTo : new PromiseEmitter();
            this.listeners.push(function (promisedData) {
                return promisedData.then(function (data) {
                    if (deepCheckCondition(data, condition)) nextPromiseEmitter.emit(data);
                });
            });
            return nextPromiseEmitter;
        }
    }, {
        key: 'except',
        value: function except(condition, pipeTo) {
            var nextPromiseEmitter = pipeTo && pipeTo instanceof PromiseEmitter ? pipeTo : new PromiseEmitter();
            this.listeners.push(function (promisedData) {
                return promisedData.then(function (data) {
                    if (!deepCheckCondition(data, condition)) nextPromiseEmitter.emit(data);
                });
            });
            return nextPromiseEmitter;
        }
    }]);

    return PromiseEmitter;
})();

exports.PromiseEmitter = PromiseEmitter;
