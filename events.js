(function () {
  console.log('event.js is working');

  const events = [];
  Element.prototype._addEventListener = Element.prototype.addEventListener;
  Element.prototype._removeEventListener = Element.prototype.removeEventListener;

  Element.prototype.addEventListener = function (type, event, useCapture = false) {
    if (events) {
      events.push({
        target: this,
        type,
        event,
        useCapture,
      });
    }
    return this._addEventListener(type, event, useCapture);
  };

  Element.prototype.removeEventListener = function (type, event, useCapture) {
    if (events && events.length !== 0) {
      for (let i in events) {
        let temp = events[i];
        if (
          temp.target === this &&
          temp.type === type &&
          temp.event === event &&
          temp.useCapture === useCapture
        ) {
          events.splice(i, 1);
          break;
        }
      }
    }
    return this._removeEventListener(type, event, useCapture);
  };
  //
  function dealevents(target, proto, value) {
    let temp = target.filter(e => e[proto] === value);
    return temp;
  }

  function simplifyobj(target, proto) {
    target.forEach(e => {
      delete e[proto];
    });
  }

  function clone(obj) {
    let result = obj.map(e => Object.assign({}, e));
    return result;
  }
  const DefaultSimple = true;
  //
  window.getAllEvents = function () {
    return clone(events);
  };
  window.getEventsByTarget = function (target, simplify = DefaultSimple, origin = events) {
    let result = clone(origin);

    function dealresult(targets) {
      let temp = [];
      targets.forEach(tgt => {
        temp.push(...dealevents(result, 'target', tgt));
      });
      let len = targets.length;
      let map = new Map();
      temp.forEach(x => {
        let fit = [...map.keys()].filter(
          y => y.type === x.type && y.event === x.event && y.useCapture === x.useCapture
        );
        if (fit.length !== 0) {
          let num = map.get(fit[0]) + 1;
          map.set(fit[0], num);
        } else {
          map.set(x, 1);
        }
      });
      let resulting = [];
      for (let [k, v] of map) {
        if (v === len) {
          let { type, event, useCapture } = k;
          if (simplify) {
            resulting.push({
              type,
              event,
              useCapture,
            });
          } else {
            targets.forEach(e => {
              resulting.push({
                type,
                event,
                useCapture,
                target: e,
              });
            });
          }
        }
      }
      return resulting;
    }
    if (target) {
      if (typeof target === 'string') {
        let targets = document.querySelectorAll(target);
        dealresult(targets);
      } else if (target[Symbol.toStringTag] === 'NodeList') {
        let targets = target;
        dealresult(targets);
      } else if (target[Symbol.toStringTag].search(/HTML\w+Element/g) !== -1) {
        result = dealevents(result, 'target', target);
      }
    }
    if (simplify) {
      simplifyobj(result, 'target');
    }
    return result;
  };
  window.getEventsByType = function (type, simplify = DefaultSimple, origin = events) {
    let result = clone(origin);
    if (type) {
      result = dealevents(result, 'type', type);
    }
    if (simplify) {
      simplifyobj(result, 'type');
    }
    return result;
  };
  window.getEventsByEvent = function (event, simplify = DefaultSimple, origin = events) {
    let result = clone(origin);
    if (event) {
      result = dealevents(origin, 'event', event);
    }
    if (simplify) {
      simplifyobj(result, 'event');
    }
    return result;
  };
  function getEventsByUse(useCapture, simplify = DefaultSimple, origin = events) {
    let result = clone(origin);
    if (useCapture) {
      result = dealevents(origin, 'useCapture', useCapture);
    }
    if (simplify) {
      simplifyobj(result, 'useCapture');
    }
    return result;
  }
  window.getEvents = function (obj, simplify = DefaultSimple, origin = events) {
    let result = clone(origin);
    Object.keys(obj).forEach(key => {
      switch (key) {
        case 'target':
          result = window.getEventsByTarget(obj[key], simplify, result);
          break;
        case 'type':
          result = window.getEventsByType(obj[key], simplify, result);
          break;
        case 'event':
          result = window.getEventsByEvent(obj[key], simplify, result);
          break;
        case 'useCapture':
          result = getEventsByUse(obj[key], simplify, result);
        default:
          throw new Error(key + ' is not exist');
      }
    });
    return result;
  };

  Element.prototype.getAllEvents = function (simplify = DefaultSimple) {
    return window.getEvents(
      {
        target: this,
      },
      simplify
    );
  };
  Element.prototype.getEventsByType = function (type, simplify = DefaultSimple) {
    return window.getEvents(
      {
        type,
        target: this,
      },
      simplify
    );
  };
  Element.prototype.getEventsByEvent = function (event, simplify = DefaultSimple) {
    return window.getEvents(
      {
        event,
        target: this,
      },
      simplify
    );
  };
  Element.prototype.getEvents = function (obj, simplify = DefaultSimple) {
    return window.getEvents(
      {
        ...obj,
        target: this,
      },
      simplify
    );
  };
})();
