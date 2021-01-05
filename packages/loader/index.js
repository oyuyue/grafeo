var global = typeof self !== 'undefined' ? self : global
var hasDocument = typeof document !== 'undefined'
var ENTRY = '__ENTRY'

function SystemJS () {
  this.registry = {};
  this.urlMap = {};
}

var systemJSPrototype = SystemJS.prototype;

systemJSPrototype.processScripts = function () {
  [].forEach.call(document.querySelectorAll('script'), (script) => {
    if (script.sp) return;
    if (script.type === 'importmap') {
      script.sp = true;
      this.set(JSON.parse(script.innerHTML).imports)
    }
  })
}

systemJSPrototype.resolve = function(name) {
  return this.urlMap[name]
}

var firstRegister = true;
var lastRegister;
systemJSPrototype.register = function (deps, declare, registry) {
  if (registry) this.set(registry)
  lastRegister = [deps, declare];

  if (firstRegister) {
    firstRegister = false;
    this.import();
  }
};

systemJSPrototype.import = function (id, field) {
  var loader = this;
  this.processScripts();
  var loadId;
  return Promise.resolve().then(function () {
    var url = loader.resolve(id)
    if (id && !url) return Promise.reject('cannot resolve id');
    var load = getOrCreateLoad(loader, url);
    loadId = load.id;
    return load.C || topLevelLoad(loader, load);
  }).then(m => {
    if (field === false) return m;
    m = m.default
    if (!m) return m;
    return Promise.resolve(m).then(m => {
      if (loadId === ENTRY && typeof m.default === 'function') return m.default(undefined, true)
      if (typeof field === 'string') return m[field]
      return m.default
    })
  })
};

systemJSPrototype.set = function(name, loc) {
  if (typeof name === 'object') {
    Object.assign(this.urlMap, name)
  } else if (typeof name === 'string') {
    this.urlMap[name] = loc;
  }
}

systemJSPrototype.importmap = function() {
  return this.urlMap
}

systemJSPrototype.isLoaded = function(id) {
  return !!this.registry[this.resolve(id) || id || ENTRY]
}

/*
 * getRegister provides the last anonymous System.register call
 */
systemJSPrototype.getRegister = function () {
  var _lastRegister = lastRegister;
  lastRegister = undefined;
  return _lastRegister;
};

function getOrCreateLoad(loader, id = ENTRY) {
  var load = loader.registry[id];
  if (load) return load;

  var importerSetters = [];
  var ns = Object.create(null);

  var instantiatePromise = Promise.resolve()
  .then(function () {
    if (id === ENTRY) return loader.getRegister();
    return loader.instantiate(id);
  })
  .then(function (registration) {
    if (!registration) throw Error('no registration');
    function _export (name, value) {
      // note if we have hoisted exports (including reexports)
      load.h = true;
      var changed = false;
      if (typeof name === 'string') {
        if (!(name in ns) || ns[name] !== value) {
          ns[name] = value;
          changed = true;
        }
      }
      else {
        for (var p in name) {
          var value = name[p];
          if (!(p in ns) || ns[p] !== value) {
            ns[p] = value;
            changed = true;
          }
        }

        ns.__esModule = true;
      }
      if (changed)
        for (var i = 0; i < importerSetters.length; i++) {
          var setter = importerSetters[i];
          if (setter) setter(ns);
        }
      return value;
    }
    var declared = registration[1](_export, registration[1].length === 2 ? {
      import: function (importId) {
        return loader.import(importId, id);
      }
    } : undefined);
    load.e = declared.execute || function () {};
    return [registration[0], declared.setters || []];
  });

  var linkPromise = instantiatePromise
  .then(function (instantiation) {
    return Promise.all(instantiation[0].map(function (dep, i) {
      var setter = instantiation[1][i];
      return Promise.resolve(loader.resolve(dep) || dep)
      .then(function (depId) {
        var depLoad = getOrCreateLoad(loader, depId);
        // depLoad.I may be undefined for already-evaluated
        return Promise.resolve(depLoad.I)
        .then(function () {
          if (setter) {
            depLoad.i.push(setter);
            // only run early setters when there are hoisted exports of that module
            // the timing works here as pending hoisted export calls will trigger through importerSetters
            if (depLoad.h || !depLoad.I) setter(depLoad.n);
          }
          return depLoad;
        });
      })
    }))
    .then(
      function (depLoads) {
        load.d = depLoads;
      },
      !true 
    )
  });

  linkPromise.catch(function (err) {
    load.e = null;
    load.er = err;
  });

  // Capital letter = a promise function
  return load = loader.registry[id] = {
    id: id,
    // importerSetters, the setters functions registered to this dependency
    // we retain this to add more later
    i: importerSetters,
    // module namespace object
    n: ns,

    // instantiate
    I: instantiatePromise,
    // link
    L: linkPromise,
    // whether it has hoisted exports
    h: false,

    // On instantiate completion we have populated:
    // dependency load records
    d: undefined,
    // execution function
    // set to NULL immediately after execution (or on any failure) to indicate execution has happened
    // in such a case, C should be used, and E, I, L will be emptied
    e: undefined,

    // On execution we have populated:
    // the execution error if any
    er: undefined,
    // in the case of TLA, the execution promise
    E: undefined,

    // On execution, L, I, E cleared

    // Promise for top-level completion
    C: undefined
  };
}

function instantiateAll (loader, load, loaded) {
  if (!loaded[load.id]) {
    loaded[load.id] = true;
    // load.L may be undefined for already-instantiated
    return Promise.resolve(load.L)
    .then(function () {
      return Promise.all(load.d.map(function (dep) {
        return instantiateAll(loader, dep, loaded);
      }));
    })
  }
}

function topLevelLoad (loader, load) {
  return load.C = instantiateAll(loader, load, {})
  .then(function () {
    return postOrderExec(loader, load, {});
  })
  .then(function () {
    return load.n;
  });
}

// the closest we can get to call(undefined)
var nullContext = Object.freeze(Object.create(null));

// returns a promise if and only if a top-level await subgraph
// throws on sync errors
function postOrderExec (loader, load, seen) {
  if (seen[load.id])
    return;
  seen[load.id] = true;

  if (!load.e) {
    if (load.er)
      throw load.er;
    if (load.E)
      return load.E;
    return;
  }

  // deps execute first, unless circular
  var depLoadPromises;
  load.d.forEach(function (depLoad) {
      try {
        var depLoadPromise = postOrderExec(loader, depLoad, seen);
        if (depLoadPromise) 
          (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
      }
      catch (err) {
        load.e = null;
        load.er = err;
        throw err;
      }
  });
  if (depLoadPromises)
    return Promise.all(depLoadPromises).then(doExec, function (err) {
      load.e = null;
      load.er = err;
      throw err;
    });

  return doExec();

  function doExec () {
    try {
      var execPromise = load.e.call(nullContext);
      if (execPromise) {
          execPromise = execPromise.then(function () {
            load.C = load.n;
            load.E = null; // indicates completion
            if (!true) ;
          }, function (err) {
            load.er = err;
            load.E = null;
            if (!true) ;
            else throw err;
          });
        return load.E = load.E || execPromise;
      }
      // (should be a promise, but a minify optimization to leave out Promise.resolve)
      load.C = load.n;
      if (!true) ;
    }
    catch (err) {
      load.er = err;
      throw err;
    }
    finally {
      load.L = load.I = undefined;
      load.e = null;
    }
  }
}

/*
 * Script instantiation loading
 */
var lastWindowErrorUrl, lastWindowError;
if (hasDocument) {
  window.addEventListener('error', function (evt) {
    lastWindowErrorUrl = evt.filename;
    lastWindowError = evt.error;
  });
}

systemJSPrototype.instantiate = function (url) {
  var loader = this;
  return new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.async = true;
    if (url.indexOf(location.origin)) script.crossOrigin = 'anonymous';
    script.src = url;
    script.addEventListener('error', () => {
      document.head.removeChild(script);
      reject()
    })
    script.addEventListener('load', () => {
      document.head.removeChild(script);
      // Note that if an error occurs that isn't caught by this if statement,
      // that getRegister will return null and a "did not instantiate" error will be thrown.
      if (lastWindowErrorUrl === url) {
        reject(lastWindowError);
      }
      else {
        resolve(loader.getRegister());
      }
    })
    document.head.appendChild(script);
  });
};



// AMD

var emptyInstantiation = [[], function () { return {} }];

function unsupportedRequire () {
  throw Error('AMD require not supported');
}

var tmpRegister, firstNamedDefine;

function emptyFn () {}

var requireExportsModule = ['require', 'exports', 'module'];

function createAMDRegister (amdDefineDeps, amdDefineExec) {
  var exports = {};
  var module = { exports: exports };
  var depModules = [];
  var setters = [];
  var splice = 0;
  for (var i = 0; i < amdDefineDeps.length; i++) {
    var id = amdDefineDeps[i];
    var index = setters.length;
    if (id === 'require') {
      depModules[i] = unsupportedRequire;
      splice++;
    }
    else if (id === 'module') {
      depModules[i] = module;
      splice++;
    }
    else if (id === 'exports') {
      depModules[i] = exports;
      splice++;
    }
    else {
      createSetter(i);
    }
    if (splice)
      amdDefineDeps[index] = id;
  }
  if (splice)
    amdDefineDeps.length -= splice;
  var amdExec = amdDefineExec;
  return [amdDefineDeps, function (_export) {
    _export({ default: exports, __useDefault: true });
    return {
      setters: setters,
      execute: function () {
        var amdResult = amdExec.apply(exports, depModules);
        if (amdResult !== undefined) module.exports = amdResult;
        _export(module.exports);
        _export('default', module.exports);
      }
    };
  }];

  // needed to avoid iteration scope issues
  function createSetter(idx) {
    setters.push(function (ns) {
      depModules[idx] = ns.__useDefault ? ns.default : ns;
    });
  }
}

// hook System.register to know the last declaration binding
var lastRegisterDeclare;
var systemAmdRegister = systemJSPrototype.register;
systemJSPrototype.register = function (name, deps, declare) {
  lastRegisterDeclare = typeof name === 'string' ? declare : deps;
  systemAmdRegister.apply(this, arguments);
};

var instantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function() {
  // Reset "currently executing script"
  amdDefineDeps = null;
  return instantiate.apply(this, arguments);
};

var getRegister = systemJSPrototype.getRegister;
systemJSPrototype.getRegister = function () {
  if (tmpRegister)
    return tmpRegister;

  var _firstNamedDefine = firstNamedDefine;
  firstNamedDefine = null;

  var register = getRegister.call(this);
  // if its an actual System.register leave it
  if (register && register[1] === lastRegisterDeclare)
    return register;

  var _amdDefineDeps = amdDefineDeps;
  amdDefineDeps = null;

  // If the script registered a named module, return that module instead of re-instantiating it.
  if (_firstNamedDefine)
    return _firstNamedDefine;

  // otherwise AMD takes priority
  // no registration -> attempt AMD detection
  if (!_amdDefineDeps)
    return register || emptyInstantiation;

  return createAMDRegister(_amdDefineDeps, amdDefineExec);
};
var amdDefineDeps, amdDefineExec;
global.define = function (name, deps, execute) {
  var depsAndExec;
  // define('', [], function () {})
  if (typeof name === 'string') {
    depsAndExec = getDepsAndExec(deps, execute);
    if (amdDefineDeps) {
      if (!System.registerRegistry) {
        throw Error('Include the named register extension for SystemJS named AMD support');
      }
      addToRegisterRegistry(name, createAMDRegister(depsAndExec[0], depsAndExec[1]));
      amdDefineDeps = [];
      amdDefineExec = emptyFn;
      return;
    }
    else {
      if (System.registerRegistry)
        addToRegisterRegistry(name, createAMDRegister([].concat(depsAndExec[0]), depsAndExec[1]));
      name = deps;
      deps = execute;
    }
  }
  depsAndExec = getDepsAndExec(name, deps);
  amdDefineDeps = depsAndExec[0];
  amdDefineExec = depsAndExec[1];
};
global.define.amd = {};

function getDepsAndExec(arg1, arg2) {
  // define([], function () {})
  if (arg1 instanceof Array) {
    return [arg1, arg2];
  }
  // define({})
  else if (typeof arg1 === 'object') {
    return [[], function () { return arg1 }];
  }
  // define(function () {})
  else if (typeof arg1 === 'function') {
    return [requireExportsModule, arg1];
  }
}

function addToRegisterRegistry(name, define) {
  if (!firstNamedDefine) {
    firstNamedDefine = define;
    Promise.resolve().then(function () {
      firstNamedDefine = null;
    });
  }

  // We must call System.getRegister() here to give other extras, such as the named-exports extra,
  // a chance to modify the define before it's put into the registerRegistry.
  // See https://github.com/systemjs/systemjs/issues/2073
  tmpRegister = define;
  System.registerRegistry[name] = System.getRegister();
  tmpRegister = null;
}

global.System = new SystemJS()
