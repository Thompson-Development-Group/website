
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.26.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.26.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.26.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.26.0 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(12, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(13, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16448) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 32769) {
    			 $$invalidate(12, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 32769) {
    			 $$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 45569) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/Navbars/IndexNavbar.svelte generated by Svelte v3.26.0 */

    const file$1 = "src/components/Navbars/IndexNavbar.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let div;
    	let h1;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let nav;
    	let ul;
    	let li0;
    	let a1;
    	let t2;
    	let li1;
    	let a2;
    	let t4;
    	let li2;
    	let a3;
    	let t6;
    	let li3;
    	let a4;
    	let t8;
    	let li4;
    	let a5;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			h1 = element("h1");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t2 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "About";
    			t4 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Services";
    			t6 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Team";
    			t8 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Contact";
    			attr_dev(img, "class", "header-logo");
    			if (img.src !== (img_src_value = "/assets/img/gray.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$1, 6, 18, 159);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$1, 6, 6, 147);
    			attr_dev(h1, "class", "logo me-auto");
    			add_location(h1, file$1, 5, 4, 115);
    			attr_dev(a1, "href", "index.html");
    			add_location(a1, file$1, 13, 27, 352);
    			attr_dev(li0, "class", "active");
    			add_location(li0, file$1, 13, 8, 333);
    			attr_dev(a2, "href", "#about");
    			add_location(a2, file$1, 14, 12, 399);
    			add_location(li1, file$1, 14, 8, 395);
    			attr_dev(a3, "href", "#services");
    			add_location(a3, file$1, 15, 12, 443);
    			add_location(li2, file$1, 15, 8, 439);
    			attr_dev(a4, "href", "#team");
    			add_location(a4, file$1, 16, 12, 493);
    			add_location(li3, file$1, 16, 8, 489);
    			attr_dev(a5, "href", "#contact");
    			add_location(a5, file$1, 17, 12, 535);
    			add_location(li4, file$1, 17, 8, 531);
    			add_location(ul, file$1, 12, 6, 320);
    			attr_dev(nav, "class", "nav-menu d-none d-lg-block");
    			add_location(nav, file$1, 11, 4, 273);
    			attr_dev(div, "class", "container d-flex align-items-center");
    			add_location(div, file$1, 4, 2, 61);
    			attr_dev(header, "id", "header");
    			attr_dev(header, "class", "fixed-top");
    			add_location(header, file$1, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);
    			append_dev(div, h1);
    			append_dev(h1, a0);
    			append_dev(a0, img);
    			append_dev(div, t0);
    			append_dev(div, nav);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t4);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(ul, t6);
    			append_dev(ul, li3);
    			append_dev(li3, a4);
    			append_dev(ul, t8);
    			append_dev(ul, li4);
    			append_dev(li4, a5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IndexNavbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IndexNavbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IndexNavbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IndexNavbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Footers/Footer.svelte generated by Svelte v3.26.0 */

    const file$2 = "src/components/Footers/Footer.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let div6;
    	let div5;
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t1;
    	let br0;
    	let br1;
    	let t2;
    	let strong0;
    	let t4;
    	let br2;
    	let t5;
    	let div1;
    	let h40;
    	let t7;
    	let ul0;
    	let li0;
    	let i0;
    	let t8;
    	let a0;
    	let t10;
    	let li1;
    	let i1;
    	let t11;
    	let a1;
    	let t13;
    	let li2;
    	let i2;
    	let t14;
    	let a2;
    	let t16;
    	let li3;
    	let i3;
    	let t17;
    	let a3;
    	let t19;
    	let li4;
    	let i4;
    	let t20;
    	let a4;
    	let t22;
    	let div2;
    	let h41;
    	let t24;
    	let ul1;
    	let li5;
    	let i5;
    	let t25;
    	let a5;
    	let t27;
    	let li6;
    	let i6;
    	let t28;
    	let a6;
    	let t30;
    	let li7;
    	let i7;
    	let t31;
    	let a7;
    	let t33;
    	let li8;
    	let i8;
    	let t34;
    	let a8;
    	let t36;
    	let li9;
    	let i9;
    	let t37;
    	let a9;
    	let t39;
    	let div3;
    	let h42;
    	let t41;
    	let p1;
    	let t43;
    	let form;
    	let input0;
    	let input1;
    	let t44;
    	let div11;
    	let div9;
    	let div7;
    	let t45;
    	let t46;
    	let strong1;
    	let span;
    	let t48;
    	let t49;
    	let div8;
    	let t50;
    	let a10;
    	let t52;
    	let div10;
    	let a11;
    	let i10;
    	let t53;
    	let a12;
    	let i11;
    	let t54;
    	let a13;
    	let i12;
    	let t55;
    	let a14;
    	let i13;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text("Madison, WI 53713, United States\n            ");
    			br0 = element("br");
    			br1 = element("br");
    			t2 = space();
    			strong0 = element("strong");
    			strong0.textContent = "Email:";
    			t4 = text("\n            contact@thompsondevgroup.com");
    			br2 = element("br");
    			t5 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Useful Links";
    			t7 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			i0 = element("i");
    			t8 = space();
    			a0 = element("a");
    			a0.textContent = "Home";
    			t10 = space();
    			li1 = element("li");
    			i1 = element("i");
    			t11 = space();
    			a1 = element("a");
    			a1.textContent = "About us";
    			t13 = space();
    			li2 = element("li");
    			i2 = element("i");
    			t14 = space();
    			a2 = element("a");
    			a2.textContent = "Services";
    			t16 = space();
    			li3 = element("li");
    			i3 = element("i");
    			t17 = space();
    			a3 = element("a");
    			a3.textContent = "Terms of service";
    			t19 = space();
    			li4 = element("li");
    			i4 = element("i");
    			t20 = space();
    			a4 = element("a");
    			a4.textContent = "Privacy policy";
    			t22 = space();
    			div2 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Our Services";
    			t24 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			i5 = element("i");
    			t25 = space();
    			a5 = element("a");
    			a5.textContent = "Automation Testing";
    			t27 = space();
    			li6 = element("li");
    			i6 = element("i");
    			t28 = space();
    			a6 = element("a");
    			a6.textContent = "Web Development";
    			t30 = space();
    			li7 = element("li");
    			i7 = element("i");
    			t31 = space();
    			a7 = element("a");
    			a7.textContent = "Product Management";
    			t33 = space();
    			li8 = element("li");
    			i8 = element("i");
    			t34 = space();
    			a8 = element("a");
    			a8.textContent = "Marketing";
    			t36 = space();
    			li9 = element("li");
    			i9 = element("i");
    			t37 = space();
    			a9 = element("a");
    			a9.textContent = "Graphic Design";
    			t39 = space();
    			div3 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Join Our Newsletter";
    			t41 = space();
    			p1 = element("p");
    			p1.textContent = "Keep up to date with holiday sales, new products, services and so\n            much more!";
    			t43 = space();
    			form = element("form");
    			input0 = element("input");
    			input1 = element("input");
    			t44 = space();
    			div11 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			t45 = text(/*date*/ ctx[0]);
    			t46 = text("\n        ©\n        ");
    			strong1 = element("strong");
    			span = element("span");
    			span.textContent = "Thompson Development Group LLC";
    			t48 = text(". All Rights\n        Reserved");
    			t49 = space();
    			div8 = element("div");
    			t50 = text("Designed by\n        ");
    			a10 = element("a");
    			a10.textContent = "Thompson Development Group";
    			t52 = space();
    			div10 = element("div");
    			a11 = element("a");
    			i10 = element("i");
    			t53 = space();
    			a12 = element("a");
    			i11 = element("i");
    			t54 = space();
    			a13 = element("a");
    			i12 = element("i");
    			t55 = space();
    			a14 = element("a");
    			i13 = element("i");
    			attr_dev(img, "class", "footer-logo");
    			if (img.src !== (img_src_value = "/assets/img/blue.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Thompson Logo");
    			add_location(img, file$2, 13, 10, 287);
    			add_location(br0, file$2, 19, 12, 469);
    			add_location(br1, file$2, 19, 18, 475);
    			add_location(strong0, file$2, 20, 12, 494);
    			add_location(br2, file$2, 21, 40, 558);
    			add_location(p0, file$2, 17, 10, 408);
    			attr_dev(div0, "class", "col-lg-3 col-md-6 footer-contact");
    			add_location(div0, file$2, 12, 8, 230);
    			add_location(h40, file$2, 26, 10, 659);
    			attr_dev(i0, "class", "bx bx-chevron-right");
    			add_location(i0, file$2, 28, 16, 712);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$2, 28, 50, 746);
    			add_location(li0, file$2, 28, 12, 708);
    			attr_dev(i1, "class", "bx bx-chevron-right");
    			add_location(i1, file$2, 30, 14, 803);
    			attr_dev(a1, "href", "/#about");
    			add_location(a1, file$2, 31, 14, 851);
    			add_location(li1, file$2, 29, 12, 784);
    			attr_dev(i2, "class", "bx bx-chevron-right");
    			add_location(i2, file$2, 34, 14, 931);
    			attr_dev(a2, "href", "/#services");
    			add_location(a2, file$2, 35, 14, 979);
    			add_location(li2, file$2, 33, 12, 912);
    			attr_dev(i3, "class", "bx bx-chevron-right");
    			add_location(i3, file$2, 38, 14, 1062);
    			attr_dev(a3, "href", "/terms");
    			add_location(a3, file$2, 39, 14, 1110);
    			add_location(li3, file$2, 37, 12, 1043);
    			attr_dev(i4, "class", "bx bx-chevron-right");
    			add_location(i4, file$2, 42, 14, 1197);
    			attr_dev(a4, "href", "/privacy");
    			add_location(a4, file$2, 43, 14, 1245);
    			add_location(li4, file$2, 41, 12, 1178);
    			add_location(ul0, file$2, 27, 10, 691);
    			attr_dev(div1, "class", "col-lg-2 col-md-6 footer-links");
    			add_location(div1, file$2, 25, 8, 604);
    			add_location(h41, file$2, 49, 10, 1396);
    			attr_dev(i5, "class", "bx bx-chevron-right");
    			add_location(i5, file$2, 52, 14, 1464);
    			attr_dev(a5, "href", "/");
    			add_location(a5, file$2, 53, 14, 1512);
    			add_location(li5, file$2, 51, 12, 1445);
    			attr_dev(i6, "class", "bx bx-chevron-right");
    			add_location(i6, file$2, 56, 14, 1596);
    			attr_dev(a6, "href", "/");
    			add_location(a6, file$2, 57, 14, 1644);
    			add_location(li6, file$2, 55, 12, 1577);
    			attr_dev(i7, "class", "bx bx-chevron-right");
    			add_location(i7, file$2, 60, 14, 1725);
    			attr_dev(a7, "href", "/");
    			add_location(a7, file$2, 61, 14, 1773);
    			add_location(li7, file$2, 59, 12, 1706);
    			attr_dev(i8, "class", "bx bx-chevron-right");
    			add_location(i8, file$2, 63, 16, 1842);
    			attr_dev(a8, "href", "/");
    			add_location(a8, file$2, 63, 50, 1876);
    			add_location(li8, file$2, 63, 12, 1838);
    			attr_dev(i9, "class", "bx bx-chevron-right");
    			add_location(i9, file$2, 65, 14, 1938);
    			attr_dev(a9, "href", "/");
    			add_location(a9, file$2, 66, 14, 1986);
    			add_location(li9, file$2, 64, 12, 1919);
    			add_location(ul1, file$2, 50, 10, 1428);
    			attr_dev(div2, "class", "col-lg-3 col-md-6 footer-links");
    			add_location(div2, file$2, 48, 8, 1341);
    			add_location(h42, file$2, 72, 10, 2135);
    			add_location(p1, file$2, 73, 10, 2174);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "name", "email");
    			add_location(input0, file$2, 78, 12, 2347);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Subscribe";
    			add_location(input1, file$2, 78, 47, 2382);
    			attr_dev(form, "action", "");
    			attr_dev(form, "method", "post");
    			add_location(form, file$2, 77, 10, 2304);
    			attr_dev(div3, "class", "col-lg-4 col-md-6 footer-newsletter");
    			add_location(div3, file$2, 71, 8, 2075);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$2, 11, 6, 204);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$2, 10, 4, 174);
    			attr_dev(div6, "class", "footer-top");
    			add_location(div6, file$2, 9, 2, 145);
    			add_location(span, file$2, 94, 16, 2730);
    			add_location(strong1, file$2, 94, 8, 2722);
    			attr_dev(div7, "class", "copyright");
    			add_location(div7, file$2, 91, 6, 2660);
    			attr_dev(a10, "href", "https://www.thompsondevgroup.com/");
    			add_location(a10, file$2, 99, 8, 2881);
    			attr_dev(div8, "class", "credits");
    			add_location(div8, file$2, 97, 6, 2831);
    			attr_dev(div9, "class", "me-md-auto text-center text-md-center");
    			set_style(div9, "margin-left", "auto");
    			add_location(div9, file$2, 88, 4, 2564);
    			attr_dev(i10, "class", "bx bxl-twitter");
    			add_location(i10, file$2, 103, 34, 3084);
    			attr_dev(a11, "href", "/");
    			attr_dev(a11, "class", "twitter");
    			add_location(a11, file$2, 103, 6, 3056);
    			attr_dev(i11, "class", "bx bxl-facebook");
    			add_location(i11, file$2, 104, 35, 3152);
    			attr_dev(a12, "href", "/");
    			attr_dev(a12, "class", "facebook");
    			add_location(a12, file$2, 104, 6, 3123);
    			attr_dev(i12, "class", "bx bxl-instagram");
    			add_location(i12, file$2, 105, 36, 3222);
    			attr_dev(a13, "href", "/");
    			attr_dev(a13, "class", "instagram");
    			add_location(a13, file$2, 105, 6, 3192);
    			attr_dev(i13, "class", "bx bxl-linkedin");
    			add_location(i13, file$2, 106, 35, 3292);
    			attr_dev(a14, "href", "/");
    			attr_dev(a14, "class", "linkedin");
    			add_location(a14, file$2, 106, 6, 3263);
    			attr_dev(div10, "class", "social-links text-center text-md-right pt-3 pt-md-0");
    			add_location(div10, file$2, 102, 4, 2984);
    			attr_dev(div11, "class", "container d-md-flex py-4");
    			add_location(div11, file$2, 87, 2, 2521);
    			attr_dev(footer, "id", "footer");
    			add_location(footer, file$2, 8, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(p0, br0);
    			append_dev(p0, br1);
    			append_dev(p0, t2);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(p0, br2);
    			append_dev(div4, t5);
    			append_dev(div4, div1);
    			append_dev(div1, h40);
    			append_dev(div1, t7);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, i0);
    			append_dev(li0, t8);
    			append_dev(li0, a0);
    			append_dev(ul0, t10);
    			append_dev(ul0, li1);
    			append_dev(li1, i1);
    			append_dev(li1, t11);
    			append_dev(li1, a1);
    			append_dev(ul0, t13);
    			append_dev(ul0, li2);
    			append_dev(li2, i2);
    			append_dev(li2, t14);
    			append_dev(li2, a2);
    			append_dev(ul0, t16);
    			append_dev(ul0, li3);
    			append_dev(li3, i3);
    			append_dev(li3, t17);
    			append_dev(li3, a3);
    			append_dev(ul0, t19);
    			append_dev(ul0, li4);
    			append_dev(li4, i4);
    			append_dev(li4, t20);
    			append_dev(li4, a4);
    			append_dev(div4, t22);
    			append_dev(div4, div2);
    			append_dev(div2, h41);
    			append_dev(div2, t24);
    			append_dev(div2, ul1);
    			append_dev(ul1, li5);
    			append_dev(li5, i5);
    			append_dev(li5, t25);
    			append_dev(li5, a5);
    			append_dev(ul1, t27);
    			append_dev(ul1, li6);
    			append_dev(li6, i6);
    			append_dev(li6, t28);
    			append_dev(li6, a6);
    			append_dev(ul1, t30);
    			append_dev(ul1, li7);
    			append_dev(li7, i7);
    			append_dev(li7, t31);
    			append_dev(li7, a7);
    			append_dev(ul1, t33);
    			append_dev(ul1, li8);
    			append_dev(li8, i8);
    			append_dev(li8, t34);
    			append_dev(li8, a8);
    			append_dev(ul1, t36);
    			append_dev(ul1, li9);
    			append_dev(li9, i9);
    			append_dev(li9, t37);
    			append_dev(li9, a9);
    			append_dev(div4, t39);
    			append_dev(div4, div3);
    			append_dev(div3, h42);
    			append_dev(div3, t41);
    			append_dev(div3, p1);
    			append_dev(div3, t43);
    			append_dev(div3, form);
    			append_dev(form, input0);
    			append_dev(form, input1);
    			append_dev(footer, t44);
    			append_dev(footer, div11);
    			append_dev(div11, div9);
    			append_dev(div9, div7);
    			append_dev(div7, t45);
    			append_dev(div7, t46);
    			append_dev(div7, strong1);
    			append_dev(strong1, span);
    			append_dev(div7, t48);
    			append_dev(div9, t49);
    			append_dev(div9, div8);
    			append_dev(div8, t50);
    			append_dev(div8, a10);
    			append_dev(div11, t52);
    			append_dev(div11, div10);
    			append_dev(div10, a11);
    			append_dev(a11, i10);
    			append_dev(div10, t53);
    			append_dev(div10, a12);
    			append_dev(a12, i11);
    			append_dev(div10, t54);
    			append_dev(div10, a13);
    			append_dev(a13, i12);
    			append_dev(div10, t55);
    			append_dev(div10, a14);
    			append_dev(a14, i13);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	let date = new Date().getFullYear();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ date });

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [date];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Hero/Hero.svelte generated by Svelte v3.26.0 */

    const file$3 = "src/components/Hero/Hero.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div;
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let a;
    	let t5;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Build Better Products With Us!";
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "We are team of talented professionals making apps, websites, and\n            product brands!";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Learn More";
    			t5 = space();
    			img = element("img");
    			add_location(h1, file$3, 4, 8, 186);
    			add_location(h2, file$3, 5, 8, 234);
    			attr_dev(a, "href", "#about");
    			attr_dev(a, "class", "btn-get-started scrollto");
    			add_location(a, file$3, 9, 8, 366);
    			if (img.src !== (img_src_value = "assets/img/hero-img.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-fluid hero-img");
    			attr_dev(img, "alt", "");
    			attr_dev(img, "data-aos", "zoom-in");
    			attr_dev(img, "data-aos-delay", "150");
    			add_location(img, file$3, 10, 8, 439);
    			attr_dev(div, "class", "container d-flex flex-column align-items-center justify-content-center");
    			attr_dev(div, "data-aos", "fade-up");
    			add_location(div, file$3, 1, 4, 58);
    			attr_dev(section, "id", "hero");
    			attr_dev(section, "class", "d-flex align-items-center");
    			add_location(section, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h2);
    			append_dev(div, t3);
    			append_dev(div, a);
    			append_dev(div, t5);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/views/Index.svelte generated by Svelte v3.26.0 */
    const file$4 = "src/views/Index.svelte";

    function create_fragment$6(ctx) {
    	let indexnavbar;
    	let t0;
    	let hero;
    	let t1;
    	let main;
    	let section0;
    	let div10;
    	let div9;
    	let div1;
    	let div0;
    	let h30;
    	let t3;
    	let p0;
    	let t5;
    	let div8;
    	let div7;
    	let div6;
    	let div2;
    	let i0;
    	let t6;
    	let h40;
    	let t8;
    	let p1;
    	let t10;
    	let div3;
    	let i1;
    	let t11;
    	let h41;
    	let t13;
    	let p2;
    	let t15;
    	let div4;
    	let i2;
    	let t16;
    	let h42;
    	let t18;
    	let p3;
    	let t20;
    	let div5;
    	let i3;
    	let t21;
    	let h43;
    	let t23;
    	let p4;
    	let t25;
    	let section1;
    	let div24;
    	let div11;
    	let h20;
    	let t27;
    	let p5;
    	let t29;
    	let div14;
    	let div12;
    	let img0;
    	let img0_src_value;
    	let t30;
    	let div13;
    	let h31;
    	let t32;
    	let p6;
    	let t34;
    	let ul0;
    	let li0;
    	let i4;
    	let t35;
    	let t36;
    	let li1;
    	let i5;
    	let t37;
    	let t38;
    	let li2;
    	let i6;
    	let t39;
    	let t40;
    	let div17;
    	let div15;
    	let img1;
    	let img1_src_value;
    	let t41;
    	let div16;
    	let h32;
    	let t43;
    	let p7;
    	let t45;
    	let p8;
    	let t47;
    	let div20;
    	let div18;
    	let img2;
    	let img2_src_value;
    	let t48;
    	let div19;
    	let h33;
    	let t50;
    	let p9;
    	let t52;
    	let p10;
    	let t54;
    	let ul1;
    	let li3;
    	let i7;
    	let t55;
    	let t56;
    	let li4;
    	let i8;
    	let t57;
    	let t58;
    	let li5;
    	let i9;
    	let t59;
    	let t60;
    	let div23;
    	let div21;
    	let img3;
    	let img3_src_value;
    	let t61;
    	let div22;
    	let h34;
    	let t63;
    	let p11;
    	let t65;
    	let p12;
    	let t67;
    	let section2;
    	let div29;
    	let div28;
    	let div25;
    	let span0;
    	let img4;
    	let img4_src_value;
    	let t68;
    	let h44;
    	let t70;
    	let p13;
    	let t72;
    	let div26;
    	let span1;
    	let img5;
    	let img5_src_value;
    	let t73;
    	let h45;
    	let t75;
    	let p14;
    	let t77;
    	let div27;
    	let span2;
    	let img6;
    	let img6_src_value;
    	let t78;
    	let h46;
    	let t80;
    	let p15;
    	let t82;
    	let section3;
    	let div44;
    	let div30;
    	let h21;
    	let t84;
    	let p16;
    	let t86;
    	let div43;
    	let div33;
    	let div32;
    	let div31;
    	let i10;
    	let t87;
    	let h47;
    	let a0;
    	let t89;
    	let p17;
    	let t91;
    	let div36;
    	let div35;
    	let div34;
    	let i11;
    	let t92;
    	let h48;
    	let a1;
    	let t94;
    	let p18;
    	let t96;
    	let div39;
    	let div38;
    	let div37;
    	let i12;
    	let t97;
    	let h49;
    	let a2;
    	let t99;
    	let p19;
    	let t101;
    	let div42;
    	let div41;
    	let div40;
    	let i13;
    	let t102;
    	let h410;
    	let a3;
    	let t104;
    	let p20;
    	let t106;
    	let section4;
    	let div57;
    	let div45;
    	let h22;
    	let t108;
    	let p21;
    	let t110;
    	let div56;
    	let div50;
    	let div49;
    	let img7;
    	let img7_src_value;
    	let t111;
    	let div48;
    	let div46;
    	let h411;
    	let t113;
    	let span3;
    	let t115;
    	let div47;
    	let a4;
    	let i14;
    	let t116;
    	let a5;
    	let i15;
    	let t117;
    	let a6;
    	let i16;
    	let t118;
    	let a7;
    	let i17;
    	let t119;
    	let div55;
    	let div54;
    	let img8;
    	let img8_src_value;
    	let t120;
    	let div53;
    	let div51;
    	let h412;
    	let t122;
    	let span4;
    	let t124;
    	let div52;
    	let a8;
    	let i18;
    	let t125;
    	let a9;
    	let i19;
    	let t126;
    	let a10;
    	let i20;
    	let t127;
    	let a11;
    	let i21;
    	let t128;
    	let section5;
    	let div83;
    	let div58;
    	let h23;
    	let t130;
    	let p22;
    	let t132;
    	let div82;
    	let div66;
    	let div65;
    	let div60;
    	let div59;
    	let i22;
    	let t133;
    	let h35;
    	let t135;
    	let p23;
    	let t137;
    	let div62;
    	let div61;
    	let i23;
    	let t138;
    	let h36;
    	let t140;
    	let p24;
    	let t141;
    	let br0;
    	let t142;
    	let t143;
    	let div64;
    	let div63;
    	let i24;
    	let t144;
    	let h37;
    	let t146;
    	let p25;
    	let br1;
    	let t147;
    	let t148;
    	let div81;
    	let form;
    	let div71;
    	let div68;
    	let input0;
    	let t149;
    	let div67;
    	let t150;
    	let div70;
    	let input1;
    	let t151;
    	let div69;
    	let t152;
    	let div73;
    	let input2;
    	let t153;
    	let div72;
    	let t154;
    	let div75;
    	let textarea;
    	let t155;
    	let div74;
    	let t156;
    	let div79;
    	let div76;
    	let t158;
    	let div77;
    	let t159;
    	let div78;
    	let t161;
    	let div80;
    	let button;
    	let t163;
    	let footer;
    	let current;
    	indexnavbar = new IndexNavbar({ $$inline: true });
    	hero = new Hero({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(indexnavbar.$$.fragment);
    			t0 = space();
    			create_component(hero.$$.fragment);
    			t1 = space();
    			main = element("main");
    			section0 = element("section");
    			div10 = element("div");
    			div9 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Our Values";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "At Thompson Development Group, we strive to incorporate our values\n              into our daily practice. We operate our company and brands based\n              on these values, and hope to share similar values with our\n              customers.";
    			t5 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div2 = element("div");
    			i0 = element("i");
    			t6 = space();
    			h40 = element("h4");
    			h40.textContent = "Quality Products";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Thompson Development Group is dedicated to creating quality\n                  products to ensure we are providing top-of-the-line services.";
    			t10 = space();
    			div3 = element("div");
    			i1 = element("i");
    			t11 = space();
    			h41 = element("h4");
    			h41.textContent = "Attention to Detail";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Thompson Development Group focuses on maintaining a\n                  detail-oriented approach. We like to consider each avenue to\n                  produce the best possible outcome.";
    			t15 = space();
    			div4 = element("div");
    			i2 = element("i");
    			t16 = space();
    			h42 = element("h4");
    			h42.textContent = "Positive Message";
    			t18 = space();
    			p3 = element("p");
    			p3.textContent = "Thompson Development Group strives to improve the world around\n                  us with each an every one of our products. We aim to spread\n                  positivity, hope, and compassion.";
    			t20 = space();
    			div5 = element("div");
    			i3 = element("i");
    			t21 = space();
    			h43 = element("h4");
    			h43.textContent = "Commitment to Customers";
    			t23 = space();
    			p4 = element("p");
    			p4.textContent = "Thompson Development Group advocates strongly on behalf of our\n                  customers and strives to ensure quality service. Our\n                  client-focused model reminds us, and our customers, that our\n                  brand is driven by partnership.";
    			t25 = space();
    			section1 = element("section");
    			div24 = element("div");
    			div11 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Company Features";
    			t27 = space();
    			p5 = element("p");
    			p5.textContent = "Thompson Development Group prides itself in the way that we provide a\n          variety of services with a variety of services. Ranging from\n          programming to graphic design and marketing to handmade craft creation\n          to digital illustration - we've got it all.";
    			t29 = space();
    			div14 = element("div");
    			div12 = element("div");
    			img0 = element("img");
    			t30 = space();
    			div13 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Software Architecture";
    			t32 = space();
    			p6 = element("p");
    			p6.textContent = "We build each of the applications that we work on to scale. We\n            specialize in micro-services, custom frameworks, and full server\n            stacks";
    			t34 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			i4 = element("i");
    			t35 = text("\n              Languages we have used: NodeJS, Java, Dart, Svelte, PHP");
    			t36 = space();
    			li1 = element("li");
    			i5 = element("i");
    			t37 = text("\n              Datastores we use: MongoDB, and various SQL options");
    			t38 = space();
    			li2 = element("li");
    			i6 = element("i");
    			t39 = text("\n              Infrastructures we use: AWS, Heroku, Azure, and Google Cloud");
    			t40 = space();
    			div17 = element("div");
    			div15 = element("div");
    			img1 = element("img");
    			t41 = space();
    			div16 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Graphic Design & Marketing";
    			t43 = space();
    			p7 = element("p");
    			p7.textContent = "Creating specialized graphic designs and developing marketing tools\n            is one of our specialties at Thompson Development Group.";
    			t45 = space();
    			p8 = element("p");
    			p8.textContent = "We strive to create eye-catching, meaningful, detail-oriented, and\n            one-of-a-kind spreads to help our customers display the brands they\n            know and love. We hope to make personalized marketing plans and\n            offer custom content creation.";
    			t47 = space();
    			div20 = element("div");
    			div18 = element("div");
    			img2 = element("img");
    			t48 = space();
    			div19 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Handmade Products";
    			t50 = space();
    			p9 = element("p");
    			p9.textContent = "Thompson Development Group works hard to provide quality products to\n            its customers. That’s why we like to create as many of our products\n            as we can by hand.";
    			t52 = space();
    			p10 = element("p");
    			p10.textContent = "We hope to ensure the highest quality products and we enjoy putting\n            our own blood, sweat, and tears into our product development";
    			t54 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			i7 = element("i");
    			t55 = text("\n              Handmade Candles: 100% Soy Wax, hand-poured, hand-stirred, and\n              hand-packaged");
    			t56 = space();
    			li4 = element("li");
    			i8 = element("i");
    			t57 = text("\n              Handmade Apparel: High-quality clothing and accessors,\n              hand-pressed with the finest materials");
    			t58 = space();
    			li5 = element("li");
    			i9 = element("i");
    			t59 = text("\n              Hand-drawn illustrations: Digital drawings and illustrations\n              crafted with the finest care");
    			t60 = space();
    			div23 = element("div");
    			div21 = element("div");
    			img3 = element("img");
    			t61 = space();
    			div22 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Digital Design & Illustration";
    			t63 = space();
    			p11 = element("p");
    			p11.textContent = "Thompson Development Groups aims to showcase many talents. Our own\n            Chief Operating Officer spends hours designing and drawing intricate\n            digital illustrations. Through following customer desires and\n            utilizing individual taste, our COO is able to create digital\n            masterpieces.";
    			t65 = space();
    			p12 = element("p");
    			p12.textContent = "With a specialty in digital portraits, designs, and communication,\n            Thompson Development Group is able to spread their mission, their\n            positivity, and their hope through digital esign and illustration.";
    			t67 = space();
    			section2 = element("section");
    			div29 = element("div");
    			div28 = element("div");
    			div25 = element("div");
    			span0 = element("span");
    			img4 = element("img");
    			t68 = space();
    			h44 = element("h4");
    			h44.textContent = "Errand Apparel";
    			t70 = space();
    			p13 = element("p");
    			p13.textContent = "Quality hand-made products ranging from t-shirts, sweatshirts,\n            backpacks, mugs, tumblers and more! Errand Apparel creates\n            customizable content for individual wear and use!";
    			t72 = space();
    			div26 = element("div");
    			span1 = element("span");
    			img5 = element("img");
    			t73 = space();
    			h45 = element("h4");
    			h45.textContent = "Hap-Bee Candle Co.";
    			t75 = space();
    			p14 = element("p");
    			p14.textContent = "Using 100% Soy-Wax, Hap-Bee Candle Co. hand-pours quality candles\n            with strong and soothing aromas. Hap-Bee Candle Co. offers a 12-oz\n            candle, a 6-oz candle, and wax melts with this custom brand!";
    			t77 = space();
    			div27 = element("div");
    			span2 = element("span");
    			img6 = element("img");
    			t78 = space();
    			h46 = element("h4");
    			h46.textContent = "Sassy Sister";
    			t80 = space();
    			p15 = element("p");
    			p15.textContent = "The Sassy Sister started as a hobby and has quickly turned into a\n            passion. While bringing reality to life with digital creations, this\n            brand aims to create customized snapshots into the lives and stories\n            of its customers.";
    			t82 = space();
    			section3 = element("section");
    			div44 = element("div");
    			div30 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Services";
    			t84 = space();
    			p16 = element("p");
    			p16.textContent = "We create a personal experience with a professional attitude. We will\n          go above and beyond to make your ideas come to life.";
    			t86 = space();
    			div43 = element("div");
    			div33 = element("div");
    			div32 = element("div");
    			div31 = element("div");
    			i10 = element("i");
    			t87 = space();
    			h47 = element("h4");
    			a0 = element("a");
    			a0.textContent = "Product Development";
    			t89 = space();
    			p17 = element("p");
    			p17.textContent = "We create awesome brands that people love and have fun doing so.";
    			t91 = space();
    			div36 = element("div");
    			div35 = element("div");
    			div34 = element("div");
    			i11 = element("i");
    			t92 = space();
    			h48 = element("h4");
    			a1 = element("a");
    			a1.textContent = "Testing Professionals";
    			t94 = space();
    			p18 = element("p");
    			p18.textContent = "We can provide clients with full-fledged unit tests, and various\n              automated frameworks which allow the company to thrive and provide\n              the ability to put engineers back on development";
    			t96 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div37 = element("div");
    			i12 = element("i");
    			t97 = space();
    			h49 = element("h4");
    			a2 = element("a");
    			a2.textContent = "Application Development";
    			t99 = space();
    			p19 = element("p");
    			p19.textContent = "We provide the ability to bring your ideas to the client's\n              browsers";
    			t101 = space();
    			div42 = element("div");
    			div41 = element("div");
    			div40 = element("div");
    			i13 = element("i");
    			t102 = space();
    			h410 = element("h4");
    			a3 = element("a");
    			a3.textContent = "Graphic Design";
    			t104 = space();
    			p20 = element("p");
    			p20.textContent = "We give your ideas a look and feel that everyone will love";
    			t106 = space();
    			section4 = element("section");
    			div57 = element("div");
    			div45 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Team";
    			t108 = space();
    			p21 = element("p");
    			p21.textContent = "Our team is made up of two goal-oriented entrepreneurs who are\n          dedicated to deliver the very best products. No matter what challenges\n          arise, we provide detail-driven results, from service conception to\n          production.";
    			t110 = space();
    			div56 = element("div");
    			div50 = element("div");
    			div49 = element("div");
    			img7 = element("img");
    			t111 = space();
    			div48 = element("div");
    			div46 = element("div");
    			h411 = element("h4");
    			h411.textContent = "Tyler Thompson";
    			t113 = space();
    			span3 = element("span");
    			span3.textContent = "Chief Executive Officer";
    			t115 = space();
    			div47 = element("div");
    			a4 = element("a");
    			i14 = element("i");
    			t116 = space();
    			a5 = element("a");
    			i15 = element("i");
    			t117 = space();
    			a6 = element("a");
    			i16 = element("i");
    			t118 = space();
    			a7 = element("a");
    			i17 = element("i");
    			t119 = space();
    			div55 = element("div");
    			div54 = element("div");
    			img8 = element("img");
    			t120 = space();
    			div53 = element("div");
    			div51 = element("div");
    			h412 = element("h4");
    			h412.textContent = "Hannah Anderson";
    			t122 = space();
    			span4 = element("span");
    			span4.textContent = "Cheif Operating Officer";
    			t124 = space();
    			div52 = element("div");
    			a8 = element("a");
    			i18 = element("i");
    			t125 = space();
    			a9 = element("a");
    			i19 = element("i");
    			t126 = space();
    			a10 = element("a");
    			i20 = element("i");
    			t127 = space();
    			a11 = element("a");
    			i21 = element("i");
    			t128 = space();
    			section5 = element("section");
    			div83 = element("div");
    			div58 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Contact";
    			t130 = space();
    			p22 = element("p");
    			p22.textContent = "Contact us if you have a need for one of our services! We will get\n          back to you in 1-2 business days. Please, No soliciting, We have a\n          very strict no Solicitation policy";
    			t132 = space();
    			div82 = element("div");
    			div66 = element("div");
    			div65 = element("div");
    			div60 = element("div");
    			div59 = element("div");
    			i22 = element("i");
    			t133 = space();
    			h35 = element("h3");
    			h35.textContent = "Our City";
    			t135 = space();
    			p23 = element("p");
    			p23.textContent = "Madison, WI 53713";
    			t137 = space();
    			div62 = element("div");
    			div61 = element("div");
    			i23 = element("i");
    			t138 = space();
    			h36 = element("h3");
    			h36.textContent = "Email Us";
    			t140 = space();
    			p24 = element("p");
    			t141 = text("info@thompsondevgroup.com");
    			br0 = element("br");
    			t142 = text("contact@thompsondevgroup.com");
    			t143 = space();
    			div64 = element("div");
    			div63 = element("div");
    			i24 = element("i");
    			t144 = space();
    			h37 = element("h3");
    			h37.textContent = "Call Us";
    			t146 = space();
    			p25 = element("p");
    			br1 = element("br");
    			t147 = text("+1 ‪(608) 313-4806‬");
    			t148 = space();
    			div81 = element("div");
    			form = element("form");
    			div71 = element("div");
    			div68 = element("div");
    			input0 = element("input");
    			t149 = space();
    			div67 = element("div");
    			t150 = space();
    			div70 = element("div");
    			input1 = element("input");
    			t151 = space();
    			div69 = element("div");
    			t152 = space();
    			div73 = element("div");
    			input2 = element("input");
    			t153 = space();
    			div72 = element("div");
    			t154 = space();
    			div75 = element("div");
    			textarea = element("textarea");
    			t155 = space();
    			div74 = element("div");
    			t156 = space();
    			div79 = element("div");
    			div76 = element("div");
    			div76.textContent = "Loading";
    			t158 = space();
    			div77 = element("div");
    			t159 = space();
    			div78 = element("div");
    			div78.textContent = "Your message has been sent. Thank you!";
    			t161 = space();
    			div80 = element("div");
    			button = element("button");
    			button.textContent = "Send Message";
    			t163 = space();
    			create_component(footer.$$.fragment);
    			add_location(h30, file$4, 30, 12, 691);
    			add_location(p0, file$4, 31, 12, 723);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$4, 29, 10, 657);
    			attr_dev(div1, "class", "content col-xl-5 d-flex align-items-stretch");
    			attr_dev(div1, "data-aos", "fade-right");
    			add_location(div1, file$4, 26, 8, 547);
    			attr_dev(i0, "class", "bx bx-receipt");
    			add_location(i0, file$4, 46, 16, 1370);
    			add_location(h40, file$4, 47, 16, 1414);
    			add_location(p1, file$4, 48, 16, 1456);
    			attr_dev(div2, "class", "col-md-6 icon-box");
    			attr_dev(div2, "data-aos", "fade-up");
    			attr_dev(div2, "data-aos-delay", "100");
    			add_location(div2, file$4, 42, 14, 1234);
    			attr_dev(i1, "class", "bx bx-cube-alt");
    			add_location(i1, file$4, 57, 16, 1810);
    			add_location(h41, file$4, 58, 16, 1855);
    			add_location(p2, file$4, 59, 16, 1900);
    			attr_dev(div3, "class", "col-md-6 icon-box");
    			attr_dev(div3, "data-aos", "fade-up");
    			attr_dev(div3, "data-aos-delay", "200");
    			add_location(div3, file$4, 53, 14, 1674);
    			attr_dev(i2, "class", "bx bx-images");
    			add_location(i2, file$4, 69, 16, 2298);
    			add_location(h42, file$4, 70, 16, 2341);
    			add_location(p3, file$4, 71, 16, 2383);
    			attr_dev(div4, "class", "col-md-6 icon-box");
    			attr_dev(div4, "data-aos", "fade-up");
    			attr_dev(div4, "data-aos-delay", "300");
    			add_location(div4, file$4, 65, 14, 2162);
    			attr_dev(i3, "class", "bx bx-shield");
    			add_location(i3, file$4, 81, 16, 2790);
    			add_location(h43, file$4, 82, 16, 2833);
    			add_location(p4, file$4, 83, 16, 2882);
    			attr_dev(div5, "class", "col-md-6 icon-box");
    			attr_dev(div5, "data-aos", "fade-up");
    			attr_dev(div5, "data-aos-delay", "400");
    			add_location(div5, file$4, 77, 14, 2654);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$4, 41, 12, 1202);
    			attr_dev(div7, "class", "icon-boxes d-flex flex-column justify-content-center");
    			add_location(div7, file$4, 40, 10, 1123);
    			attr_dev(div8, "class", "col-xl-7 d-flex align-items-stretch");
    			attr_dev(div8, "data-aos", "fade-left");
    			add_location(div8, file$4, 39, 8, 1042);
    			attr_dev(div9, "class", "row no-gutters");
    			add_location(div9, file$4, 25, 6, 510);
    			attr_dev(div10, "class", "container");
    			add_location(div10, file$4, 24, 4, 480);
    			attr_dev(section0, "id", "about");
    			attr_dev(section0, "class", "about");
    			add_location(section0, file$4, 23, 2, 441);
    			add_location(h20, file$4, 100, 8, 3430);
    			add_location(p5, file$4, 101, 8, 3464);
    			attr_dev(div11, "class", "section-title");
    			add_location(div11, file$4, 99, 6, 3394);
    			if (img0.src !== (img0_src_value = "assets/img/features-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "img-fluid");
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$4, 111, 10, 3897);
    			attr_dev(div12, "class", "col-md-5");
    			attr_dev(div12, "data-aos", "fade-right");
    			attr_dev(div12, "data-aos-delay", "100");
    			add_location(div12, file$4, 110, 8, 3821);
    			add_location(h31, file$4, 114, 10, 4065);
    			attr_dev(p6, "class", "font-italic");
    			add_location(p6, file$4, 115, 10, 4106);
    			attr_dev(i4, "class", "icofont-check");
    			add_location(i4, file$4, 122, 14, 4362);
    			add_location(li0, file$4, 121, 12, 4343);
    			attr_dev(i5, "class", "icofont-check");
    			add_location(i5, file$4, 126, 14, 4509);
    			add_location(li1, file$4, 125, 12, 4490);
    			attr_dev(i6, "class", "icofont-check");
    			add_location(i6, file$4, 130, 14, 4652);
    			add_location(li2, file$4, 129, 12, 4633);
    			add_location(ul0, file$4, 120, 10, 4326);
    			attr_dev(div13, "class", "col-md-7 pt-4");
    			attr_dev(div13, "data-aos", "fade-left");
    			attr_dev(div13, "data-aos-delay", "100");
    			add_location(div13, file$4, 113, 8, 3985);
    			attr_dev(div14, "class", "row content");
    			add_location(div14, file$4, 109, 6, 3787);
    			if (img1.src !== (img1_src_value = "assets/img/features-2.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "img-fluid");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$4, 139, 10, 4931);
    			attr_dev(div15, "class", "col-md-5 order-1 order-md-2");
    			attr_dev(div15, "data-aos", "fade-left");
    			add_location(div15, file$4, 138, 8, 4858);
    			add_location(h32, file$4, 142, 10, 5098);
    			attr_dev(p7, "class", "font-italic");
    			add_location(p7, file$4, 143, 10, 5144);
    			add_location(p8, file$4, 147, 10, 5342);
    			attr_dev(div16, "class", "col-md-7 pt-5 order-2 order-md-1");
    			attr_dev(div16, "data-aos", "fade-right");
    			add_location(div16, file$4, 141, 8, 5019);
    			attr_dev(div17, "class", "row content");
    			add_location(div17, file$4, 137, 6, 4824);
    			if (img2.src !== (img2_src_value = "assets/img/features-3.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "img-fluid");
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$4, 158, 10, 5763);
    			attr_dev(div18, "class", "col-md-5");
    			attr_dev(div18, "data-aos", "fade-right");
    			add_location(div18, file$4, 157, 8, 5708);
    			add_location(h33, file$4, 161, 10, 5910);
    			add_location(p9, file$4, 162, 10, 5947);
    			add_location(p10, file$4, 167, 10, 6168);
    			attr_dev(i7, "class", "icofont-check");
    			add_location(i7, file$4, 173, 14, 6386);
    			add_location(li3, file$4, 172, 12, 6367);
    			attr_dev(i8, "class", "icofont-check");
    			add_location(i8, file$4, 178, 14, 6568);
    			add_location(li4, file$4, 177, 12, 6549);
    			attr_dev(i9, "class", "icofont-check");
    			add_location(i9, file$4, 183, 14, 6767);
    			add_location(li5, file$4, 182, 12, 6748);
    			add_location(ul1, file$4, 171, 10, 6350);
    			attr_dev(div19, "class", "col-md-7 pt-5");
    			attr_dev(div19, "data-aos", "fade-left");
    			add_location(div19, file$4, 160, 8, 5851);
    			attr_dev(div20, "class", "row content");
    			add_location(div20, file$4, 156, 6, 5674);
    			if (img3.src !== (img3_src_value = "assets/img/features-4.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "img-fluid");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$4, 193, 10, 7089);
    			attr_dev(div21, "class", "col-md-5 order-1 order-md-2");
    			attr_dev(div21, "data-aos", "fade-left");
    			add_location(div21, file$4, 192, 8, 7016);
    			add_location(h34, file$4, 196, 10, 7256);
    			attr_dev(p11, "class", "font-italic");
    			add_location(p11, file$4, 197, 10, 7305);
    			add_location(p12, file$4, 204, 10, 7688);
    			attr_dev(div22, "class", "col-md-7 pt-5 order-2 order-md-1");
    			attr_dev(div22, "data-aos", "fade-right");
    			add_location(div22, file$4, 195, 8, 7177);
    			attr_dev(div23, "class", "row content");
    			add_location(div23, file$4, 191, 6, 6982);
    			attr_dev(div24, "class", "container");
    			add_location(div24, file$4, 98, 4, 3364);
    			attr_dev(section1, "id", "features");
    			attr_dev(section1, "class", "features");
    			attr_dev(section1, "data-aos", "fade-up");
    			add_location(section1, file$4, 97, 2, 3300);
    			if (img4.src !== (img4_src_value = "/assets/img/errand-logo.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Errand Apparel");
    			set_style(img4, "width", "80px");
    			set_style(img4, "margin-left", "auto");
    			set_style(img4, "margin-right", "auto");
    			set_style(img4, "zoom", "1.9");
    			add_location(img4, file$4, 221, 16, 8254);
    			add_location(span0, file$4, 221, 10, 8248);
    			set_style(h44, "text-align", "center");
    			add_location(h44, file$4, 225, 10, 8445);
    			add_location(p13, file$4, 226, 10, 8507);
    			attr_dev(div25, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div25, "data-aos", "fade-up");
    			attr_dev(div25, "data-aos-delay", "100");
    			add_location(div25, file$4, 217, 8, 8123);
    			if (img5.src !== (img5_src_value = "/assets/img/hapbee-logo.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Hap-Bee Candle Co.");
    			set_style(img5, "width", "120px");
    			set_style(img5, "margin-left", "auto");
    			set_style(img5, "margin-right", "auto");
    			set_style(img5, "zoom", "1.9");
    			add_location(img5, file$4, 238, 24, 8938);
    			set_style(span1, "overflow", "hidden");
    			set_style(span1, "max-height", "145px");
    			add_location(span1, file$4, 237, 10, 8883);
    			set_style(h45, "text-align", "center");
    			add_location(h45, file$4, 242, 10, 9135);
    			add_location(p14, file$4, 243, 10, 9201);
    			attr_dev(div26, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div26, "data-aos", "fade-up");
    			attr_dev(div26, "data-aos-delay", "200");
    			add_location(div26, file$4, 233, 8, 8758);
    			if (img6.src !== (img6_src_value = "/assets/img/sassy-logo.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Sassy Sis Illustrations");
    			set_style(img6, "width", "120px");
    			set_style(img6, "margin-left", "auto");
    			set_style(img6, "margin-right", "auto");
    			set_style(img6, "zoom", "1.9");
    			add_location(img6, file$4, 254, 16, 9605);
    			add_location(span2, file$4, 254, 10, 9599);
    			set_style(h46, "text-align", "center");
    			add_location(h46, file$4, 258, 10, 9806);
    			add_location(p15, file$4, 259, 10, 9866);
    			attr_dev(div27, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div27, "data-aos", "fade-up");
    			attr_dev(div27, "data-aos-delay", "300");
    			add_location(div27, file$4, 250, 8, 9474);
    			attr_dev(div28, "class", "row no-gutters");
    			attr_dev(div28, "data-aos", "fade-up");
    			add_location(div28, file$4, 216, 6, 8067);
    			attr_dev(div29, "class", "container");
    			add_location(div29, file$4, 215, 4, 8037);
    			attr_dev(section2, "id", "steps");
    			attr_dev(section2, "class", "steps");
    			add_location(section2, file$4, 214, 2, 7998);
    			add_location(h21, file$4, 273, 8, 10340);
    			add_location(p16, file$4, 274, 8, 10366);
    			attr_dev(div30, "class", "section-title");
    			add_location(div30, file$4, 272, 6, 10304);
    			attr_dev(i10, "class", "bx bxl-dribbble");
    			add_location(i10, file$4, 286, 30, 10777);
    			attr_dev(div31, "class", "icon");
    			add_location(div31, file$4, 286, 12, 10759);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$4, 287, 30, 10843);
    			attr_dev(h47, "class", "title");
    			add_location(h47, file$4, 287, 12, 10825);
    			attr_dev(p17, "class", "description");
    			add_location(p17, file$4, 288, 12, 10896);
    			attr_dev(div32, "class", "icon-box");
    			add_location(div32, file$4, 285, 10, 10724);
    			attr_dev(div33, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div33, "data-aos", "fade-up");
    			attr_dev(div33, "data-aos-delay", "100");
    			add_location(div33, file$4, 281, 8, 10572);
    			attr_dev(i11, "class", "bx bx-file");
    			add_location(i11, file$4, 299, 30, 11262);
    			attr_dev(div34, "class", "icon");
    			add_location(div34, file$4, 299, 12, 11244);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$4, 300, 30, 11323);
    			attr_dev(h48, "class", "title");
    			add_location(h48, file$4, 300, 12, 11305);
    			attr_dev(p18, "class", "description");
    			add_location(p18, file$4, 301, 12, 11378);
    			attr_dev(div35, "class", "icon-box");
    			add_location(div35, file$4, 298, 10, 11209);
    			attr_dev(div36, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div36, "data-aos", "fade-up");
    			attr_dev(div36, "data-aos-delay", "200");
    			add_location(div36, file$4, 294, 8, 11057);
    			attr_dev(i12, "class", "bx bx-tachometer");
    			add_location(i12, file$4, 314, 30, 11888);
    			attr_dev(div37, "class", "icon");
    			add_location(div37, file$4, 314, 12, 11870);
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$4, 315, 30, 11955);
    			attr_dev(h49, "class", "title");
    			add_location(h49, file$4, 315, 12, 11937);
    			attr_dev(p19, "class", "description");
    			add_location(p19, file$4, 316, 12, 12012);
    			attr_dev(div38, "class", "icon-box");
    			add_location(div38, file$4, 313, 10, 11835);
    			attr_dev(div39, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div39, "data-aos", "fade-up");
    			attr_dev(div39, "data-aos-delay", "300");
    			add_location(div39, file$4, 309, 8, 11683);
    			attr_dev(i13, "class", "bx bx-layer");
    			add_location(i13, file$4, 328, 30, 12395);
    			attr_dev(div40, "class", "icon");
    			add_location(div40, file$4, 328, 12, 12377);
    			attr_dev(a3, "href", "/");
    			add_location(a3, file$4, 329, 30, 12457);
    			attr_dev(h410, "class", "title");
    			add_location(h410, file$4, 329, 12, 12439);
    			attr_dev(p20, "class", "description");
    			add_location(p20, file$4, 330, 12, 12505);
    			attr_dev(div41, "class", "icon-box");
    			add_location(div41, file$4, 327, 10, 12342);
    			attr_dev(div42, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div42, "data-aos", "fade-up");
    			attr_dev(div42, "data-aos-delay", "400");
    			add_location(div42, file$4, 323, 8, 12190);
    			attr_dev(div43, "class", "row");
    			add_location(div43, file$4, 280, 6, 10546);
    			attr_dev(div44, "class", "container");
    			attr_dev(div44, "data-aos", "fade-up");
    			add_location(div44, file$4, 271, 4, 10255);
    			attr_dev(section3, "id", "services");
    			attr_dev(section3, "class", "services");
    			add_location(section3, file$4, 270, 2, 10210);
    			add_location(h22, file$4, 342, 8, 12813);
    			add_location(p21, file$4, 343, 8, 12835);
    			attr_dev(div45, "class", "section-title");
    			add_location(div45, file$4, 341, 6, 12777);
    			if (img7.src !== (img7_src_value = "assets/img/team/team-1.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "class", "img-fluid");
    			attr_dev(img7, "alt", "");
    			add_location(img7, file$4, 357, 12, 13318);
    			add_location(h411, file$4, 360, 16, 13486);
    			add_location(span3, file$4, 361, 16, 13526);
    			attr_dev(div46, "class", "member-info-content");
    			add_location(div46, file$4, 359, 14, 13436);
    			attr_dev(i14, "class", "icofont-twitter");
    			add_location(i14, file$4, 364, 28, 13647);
    			attr_dev(a4, "href", "/");
    			add_location(a4, file$4, 364, 16, 13635);
    			attr_dev(i15, "class", "icofont-facebook");
    			add_location(i15, file$4, 365, 28, 13709);
    			attr_dev(a5, "href", "/");
    			add_location(a5, file$4, 365, 16, 13697);
    			attr_dev(i16, "class", "icofont-instagram");
    			add_location(i16, file$4, 366, 28, 13772);
    			attr_dev(a6, "href", "/");
    			add_location(a6, file$4, 366, 16, 13760);
    			attr_dev(i17, "class", "icofont-linkedin");
    			add_location(i17, file$4, 367, 28, 13836);
    			attr_dev(a7, "href", "/");
    			add_location(a7, file$4, 367, 16, 13824);
    			attr_dev(div47, "class", "social");
    			add_location(div47, file$4, 363, 14, 13598);
    			attr_dev(div48, "class", "member-info");
    			add_location(div48, file$4, 358, 12, 13396);
    			attr_dev(div49, "class", "member team-member svelte-1y3bwu0");
    			add_location(div49, file$4, 356, 10, 13273);
    			attr_dev(div50, "class", "col-xl-3 col-lg-2 col-md-6");
    			attr_dev(div50, "data-aos", "fade-up");
    			attr_dev(div50, "data-aos-delay", "100");
    			add_location(div50, file$4, 352, 8, 13152);
    			if (img8.src !== (img8_src_value = "assets/img/team/team-2.jpg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "class", "img-fluid");
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$4, 378, 12, 14118);
    			add_location(h412, file$4, 381, 16, 14286);
    			add_location(span4, file$4, 382, 16, 14327);
    			attr_dev(div51, "class", "member-info-content");
    			add_location(div51, file$4, 380, 14, 14236);
    			attr_dev(i18, "class", "icofont-twitter");
    			add_location(i18, file$4, 385, 28, 14448);
    			attr_dev(a8, "href", "/");
    			add_location(a8, file$4, 385, 16, 14436);
    			attr_dev(i19, "class", "icofont-facebook");
    			add_location(i19, file$4, 386, 28, 14510);
    			attr_dev(a9, "href", "/");
    			add_location(a9, file$4, 386, 16, 14498);
    			attr_dev(i20, "class", "icofont-instagram");
    			add_location(i20, file$4, 387, 28, 14573);
    			attr_dev(a10, "href", "/");
    			add_location(a10, file$4, 387, 16, 14561);
    			attr_dev(i21, "class", "icofont-linkedin");
    			add_location(i21, file$4, 388, 28, 14637);
    			attr_dev(a11, "href", "/");
    			add_location(a11, file$4, 388, 16, 14625);
    			attr_dev(div52, "class", "social");
    			add_location(div52, file$4, 384, 14, 14399);
    			attr_dev(div53, "class", "member-info");
    			add_location(div53, file$4, 379, 12, 14196);
    			attr_dev(div54, "class", "member team-member svelte-1y3bwu0");
    			add_location(div54, file$4, 377, 10, 14073);
    			attr_dev(div55, "class", "col-xl-3 col-lg-2 col-md-6");
    			attr_dev(div55, "data-aos", "fade-up");
    			attr_dev(div55, "data-aos-delay", "200");
    			add_location(div55, file$4, 373, 8, 13952);
    			attr_dev(div56, "class", "row");
    			add_location(div56, file$4, 351, 6, 13126);
    			attr_dev(div57, "class", "container");
    			attr_dev(div57, "data-aos", "fade-up");
    			add_location(div57, file$4, 340, 4, 12728);
    			attr_dev(section4, "id", "team");
    			attr_dev(section4, "class", "team");
    			add_location(section4, file$4, 339, 2, 12691);
    			add_location(h23, file$4, 400, 8, 14923);
    			add_location(p22, file$4, 401, 8, 14948);
    			attr_dev(div58, "class", "section-title");
    			add_location(div58, file$4, 399, 6, 14887);
    			attr_dev(i22, "class", "bx bx-map");
    			add_location(i22, file$4, 413, 16, 15350);
    			add_location(h35, file$4, 414, 16, 15390);
    			add_location(p23, file$4, 415, 16, 15424);
    			attr_dev(div59, "class", "info-box");
    			add_location(div59, file$4, 412, 14, 15311);
    			attr_dev(div60, "class", "col-md-12");
    			add_location(div60, file$4, 411, 12, 15273);
    			attr_dev(i23, "class", "bx bx-envelope");
    			add_location(i23, file$4, 420, 16, 15582);
    			add_location(h36, file$4, 421, 16, 15627);
    			add_location(br0, file$4, 423, 43, 15708);
    			add_location(p24, file$4, 422, 16, 15661);
    			attr_dev(div61, "class", "info-box mt-4");
    			add_location(div61, file$4, 419, 14, 15538);
    			attr_dev(div62, "class", "col-md-6");
    			add_location(div62, file$4, 418, 12, 15501);
    			attr_dev(i24, "class", "bx bx-phone-call");
    			add_location(i24, file$4, 429, 16, 15897);
    			add_location(h37, file$4, 430, 16, 15944);
    			add_location(br1, file$4, 431, 19, 15980);
    			add_location(p25, file$4, 431, 16, 15977);
    			attr_dev(div63, "class", "info-box mt-4");
    			add_location(div63, file$4, 428, 14, 15853);
    			attr_dev(div64, "class", "col-md-6");
    			add_location(div64, file$4, 427, 12, 15816);
    			attr_dev(div65, "class", "row");
    			add_location(div65, file$4, 410, 10, 15243);
    			attr_dev(div66, "class", "col-lg-6");
    			add_location(div66, file$4, 409, 8, 15210);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "Your Name");
    			attr_dev(input0, "data-rule", "minlen:4");
    			attr_dev(input0, "data-msg", "Please enter at least 4 chars");
    			add_location(input0, file$4, 445, 16, 16362);
    			attr_dev(div67, "class", "validate");
    			add_location(div67, file$4, 453, 16, 16655);
    			attr_dev(div68, "class", "col-md-6 form-group");
    			add_location(div68, file$4, 444, 14, 16312);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "placeholder", "Your Email");
    			attr_dev(input1, "data-rule", "email");
    			attr_dev(input1, "data-msg", "Please enter a valid email");
    			add_location(input1, file$4, 456, 16, 16778);
    			attr_dev(div69, "class", "validate");
    			add_location(div69, file$4, 464, 16, 17069);
    			attr_dev(div70, "class", "col-md-6 form-group mt-3 mt-md-0");
    			add_location(div70, file$4, 455, 14, 16715);
    			attr_dev(div71, "class", "row");
    			add_location(div71, file$4, 443, 12, 16280);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "name", "subject");
    			attr_dev(input2, "id", "subject");
    			attr_dev(input2, "placeholder", "Subject");
    			attr_dev(input2, "data-rule", "minlen:4");
    			attr_dev(input2, "data-msg", "Please enter at least 8 chars of subject");
    			add_location(input2, file$4, 468, 14, 17190);
    			attr_dev(div72, "class", "validate");
    			add_location(div72, file$4, 476, 14, 17482);
    			attr_dev(div73, "class", "form-group mt-3");
    			add_location(div73, file$4, 467, 12, 17146);
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "data-rule", "required");
    			attr_dev(textarea, "data-msg", "Please write something for us");
    			attr_dev(textarea, "placeholder", "Message");
    			add_location(textarea, file$4, 479, 14, 17582);
    			attr_dev(div74, "class", "validate");
    			add_location(div74, file$4, 486, 14, 17834);
    			attr_dev(div75, "class", "form-group mt-3");
    			add_location(div75, file$4, 478, 12, 17538);
    			attr_dev(div76, "class", "loading");
    			add_location(div76, file$4, 489, 14, 17923);
    			attr_dev(div77, "class", "error-message");
    			add_location(div77, file$4, 490, 14, 17972);
    			attr_dev(div78, "class", "sent-message");
    			add_location(div78, file$4, 491, 14, 18016);
    			attr_dev(div79, "class", "mb-3");
    			add_location(div79, file$4, 488, 12, 17890);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$4, 496, 14, 18190);
    			attr_dev(div80, "class", "text-center");
    			add_location(div80, file$4, 495, 12, 18150);
    			attr_dev(form, "action", "forms/contact.php");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "role", "form");
    			attr_dev(form, "class", "php-email-form");
    			add_location(form, file$4, 438, 10, 16137);
    			attr_dev(div81, "class", "col-lg-6 mt-4 mt-md-0");
    			add_location(div81, file$4, 437, 8, 16091);
    			attr_dev(div82, "class", "row");
    			add_location(div82, file$4, 408, 6, 15184);
    			attr_dev(div83, "class", "container");
    			attr_dev(div83, "data-aos", "fade-up");
    			add_location(div83, file$4, 398, 4, 14838);
    			attr_dev(section5, "id", "contact");
    			attr_dev(section5, "class", "contact section-bg");
    			add_location(section5, file$4, 397, 2, 14784);
    			attr_dev(main, "id", "main");
    			add_location(main, file$4, 22, 0, 422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(indexnavbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(hero, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			append_dev(section0, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div9, t5);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, i0);
    			append_dev(div2, t6);
    			append_dev(div2, h40);
    			append_dev(div2, t8);
    			append_dev(div2, p1);
    			append_dev(div6, t10);
    			append_dev(div6, div3);
    			append_dev(div3, i1);
    			append_dev(div3, t11);
    			append_dev(div3, h41);
    			append_dev(div3, t13);
    			append_dev(div3, p2);
    			append_dev(div6, t15);
    			append_dev(div6, div4);
    			append_dev(div4, i2);
    			append_dev(div4, t16);
    			append_dev(div4, h42);
    			append_dev(div4, t18);
    			append_dev(div4, p3);
    			append_dev(div6, t20);
    			append_dev(div6, div5);
    			append_dev(div5, i3);
    			append_dev(div5, t21);
    			append_dev(div5, h43);
    			append_dev(div5, t23);
    			append_dev(div5, p4);
    			append_dev(main, t25);
    			append_dev(main, section1);
    			append_dev(section1, div24);
    			append_dev(div24, div11);
    			append_dev(div11, h20);
    			append_dev(div11, t27);
    			append_dev(div11, p5);
    			append_dev(div24, t29);
    			append_dev(div24, div14);
    			append_dev(div14, div12);
    			append_dev(div12, img0);
    			append_dev(div14, t30);
    			append_dev(div14, div13);
    			append_dev(div13, h31);
    			append_dev(div13, t32);
    			append_dev(div13, p6);
    			append_dev(div13, t34);
    			append_dev(div13, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, i4);
    			append_dev(li0, t35);
    			append_dev(ul0, t36);
    			append_dev(ul0, li1);
    			append_dev(li1, i5);
    			append_dev(li1, t37);
    			append_dev(ul0, t38);
    			append_dev(ul0, li2);
    			append_dev(li2, i6);
    			append_dev(li2, t39);
    			append_dev(div24, t40);
    			append_dev(div24, div17);
    			append_dev(div17, div15);
    			append_dev(div15, img1);
    			append_dev(div17, t41);
    			append_dev(div17, div16);
    			append_dev(div16, h32);
    			append_dev(div16, t43);
    			append_dev(div16, p7);
    			append_dev(div16, t45);
    			append_dev(div16, p8);
    			append_dev(div24, t47);
    			append_dev(div24, div20);
    			append_dev(div20, div18);
    			append_dev(div18, img2);
    			append_dev(div20, t48);
    			append_dev(div20, div19);
    			append_dev(div19, h33);
    			append_dev(div19, t50);
    			append_dev(div19, p9);
    			append_dev(div19, t52);
    			append_dev(div19, p10);
    			append_dev(div19, t54);
    			append_dev(div19, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, i7);
    			append_dev(li3, t55);
    			append_dev(ul1, t56);
    			append_dev(ul1, li4);
    			append_dev(li4, i8);
    			append_dev(li4, t57);
    			append_dev(ul1, t58);
    			append_dev(ul1, li5);
    			append_dev(li5, i9);
    			append_dev(li5, t59);
    			append_dev(div24, t60);
    			append_dev(div24, div23);
    			append_dev(div23, div21);
    			append_dev(div21, img3);
    			append_dev(div23, t61);
    			append_dev(div23, div22);
    			append_dev(div22, h34);
    			append_dev(div22, t63);
    			append_dev(div22, p11);
    			append_dev(div22, t65);
    			append_dev(div22, p12);
    			append_dev(main, t67);
    			append_dev(main, section2);
    			append_dev(section2, div29);
    			append_dev(div29, div28);
    			append_dev(div28, div25);
    			append_dev(div25, span0);
    			append_dev(span0, img4);
    			append_dev(div25, t68);
    			append_dev(div25, h44);
    			append_dev(div25, t70);
    			append_dev(div25, p13);
    			append_dev(div28, t72);
    			append_dev(div28, div26);
    			append_dev(div26, span1);
    			append_dev(span1, img5);
    			append_dev(div26, t73);
    			append_dev(div26, h45);
    			append_dev(div26, t75);
    			append_dev(div26, p14);
    			append_dev(div28, t77);
    			append_dev(div28, div27);
    			append_dev(div27, span2);
    			append_dev(span2, img6);
    			append_dev(div27, t78);
    			append_dev(div27, h46);
    			append_dev(div27, t80);
    			append_dev(div27, p15);
    			append_dev(main, t82);
    			append_dev(main, section3);
    			append_dev(section3, div44);
    			append_dev(div44, div30);
    			append_dev(div30, h21);
    			append_dev(div30, t84);
    			append_dev(div30, p16);
    			append_dev(div44, t86);
    			append_dev(div44, div43);
    			append_dev(div43, div33);
    			append_dev(div33, div32);
    			append_dev(div32, div31);
    			append_dev(div31, i10);
    			append_dev(div32, t87);
    			append_dev(div32, h47);
    			append_dev(h47, a0);
    			append_dev(div32, t89);
    			append_dev(div32, p17);
    			append_dev(div43, t91);
    			append_dev(div43, div36);
    			append_dev(div36, div35);
    			append_dev(div35, div34);
    			append_dev(div34, i11);
    			append_dev(div35, t92);
    			append_dev(div35, h48);
    			append_dev(h48, a1);
    			append_dev(div35, t94);
    			append_dev(div35, p18);
    			append_dev(div43, t96);
    			append_dev(div43, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div37);
    			append_dev(div37, i12);
    			append_dev(div38, t97);
    			append_dev(div38, h49);
    			append_dev(h49, a2);
    			append_dev(div38, t99);
    			append_dev(div38, p19);
    			append_dev(div43, t101);
    			append_dev(div43, div42);
    			append_dev(div42, div41);
    			append_dev(div41, div40);
    			append_dev(div40, i13);
    			append_dev(div41, t102);
    			append_dev(div41, h410);
    			append_dev(h410, a3);
    			append_dev(div41, t104);
    			append_dev(div41, p20);
    			append_dev(main, t106);
    			append_dev(main, section4);
    			append_dev(section4, div57);
    			append_dev(div57, div45);
    			append_dev(div45, h22);
    			append_dev(div45, t108);
    			append_dev(div45, p21);
    			append_dev(div57, t110);
    			append_dev(div57, div56);
    			append_dev(div56, div50);
    			append_dev(div50, div49);
    			append_dev(div49, img7);
    			append_dev(div49, t111);
    			append_dev(div49, div48);
    			append_dev(div48, div46);
    			append_dev(div46, h411);
    			append_dev(div46, t113);
    			append_dev(div46, span3);
    			append_dev(div48, t115);
    			append_dev(div48, div47);
    			append_dev(div47, a4);
    			append_dev(a4, i14);
    			append_dev(div47, t116);
    			append_dev(div47, a5);
    			append_dev(a5, i15);
    			append_dev(div47, t117);
    			append_dev(div47, a6);
    			append_dev(a6, i16);
    			append_dev(div47, t118);
    			append_dev(div47, a7);
    			append_dev(a7, i17);
    			append_dev(div56, t119);
    			append_dev(div56, div55);
    			append_dev(div55, div54);
    			append_dev(div54, img8);
    			append_dev(div54, t120);
    			append_dev(div54, div53);
    			append_dev(div53, div51);
    			append_dev(div51, h412);
    			append_dev(div51, t122);
    			append_dev(div51, span4);
    			append_dev(div53, t124);
    			append_dev(div53, div52);
    			append_dev(div52, a8);
    			append_dev(a8, i18);
    			append_dev(div52, t125);
    			append_dev(div52, a9);
    			append_dev(a9, i19);
    			append_dev(div52, t126);
    			append_dev(div52, a10);
    			append_dev(a10, i20);
    			append_dev(div52, t127);
    			append_dev(div52, a11);
    			append_dev(a11, i21);
    			append_dev(main, t128);
    			append_dev(main, section5);
    			append_dev(section5, div83);
    			append_dev(div83, div58);
    			append_dev(div58, h23);
    			append_dev(div58, t130);
    			append_dev(div58, p22);
    			append_dev(div83, t132);
    			append_dev(div83, div82);
    			append_dev(div82, div66);
    			append_dev(div66, div65);
    			append_dev(div65, div60);
    			append_dev(div60, div59);
    			append_dev(div59, i22);
    			append_dev(div59, t133);
    			append_dev(div59, h35);
    			append_dev(div59, t135);
    			append_dev(div59, p23);
    			append_dev(div65, t137);
    			append_dev(div65, div62);
    			append_dev(div62, div61);
    			append_dev(div61, i23);
    			append_dev(div61, t138);
    			append_dev(div61, h36);
    			append_dev(div61, t140);
    			append_dev(div61, p24);
    			append_dev(p24, t141);
    			append_dev(p24, br0);
    			append_dev(p24, t142);
    			append_dev(div65, t143);
    			append_dev(div65, div64);
    			append_dev(div64, div63);
    			append_dev(div63, i24);
    			append_dev(div63, t144);
    			append_dev(div63, h37);
    			append_dev(div63, t146);
    			append_dev(div63, p25);
    			append_dev(p25, br1);
    			append_dev(p25, t147);
    			append_dev(div82, t148);
    			append_dev(div82, div81);
    			append_dev(div81, form);
    			append_dev(form, div71);
    			append_dev(div71, div68);
    			append_dev(div68, input0);
    			append_dev(div68, t149);
    			append_dev(div68, div67);
    			append_dev(div71, t150);
    			append_dev(div71, div70);
    			append_dev(div70, input1);
    			append_dev(div70, t151);
    			append_dev(div70, div69);
    			append_dev(form, t152);
    			append_dev(form, div73);
    			append_dev(div73, input2);
    			append_dev(div73, t153);
    			append_dev(div73, div72);
    			append_dev(form, t154);
    			append_dev(form, div75);
    			append_dev(div75, textarea);
    			append_dev(div75, t155);
    			append_dev(div75, div74);
    			append_dev(form, t156);
    			append_dev(form, div79);
    			append_dev(div79, div76);
    			append_dev(div79, t158);
    			append_dev(div79, div77);
    			append_dev(div79, t159);
    			append_dev(div79, div78);
    			append_dev(form, t161);
    			append_dev(form, div80);
    			append_dev(div80, button);
    			insert_dev(target, t163, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(indexnavbar.$$.fragment, local);
    			transition_in(hero.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(indexnavbar.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(indexnavbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(hero, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t163);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link, IndexNavbar, Footer, Hero });
    	return [];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/views/Privacy.svelte generated by Svelte v3.26.0 */

    const file$5 = "src/views/Privacy.svelte";

    function create_fragment$7(ctx) {
    	let div11;
    	let main;
    	let div6;
    	let div0;
    	let span;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let p0;
    	let t4;
    	let div5;
    	let svg0;
    	let polygon;
    	let t5;
    	let section;
    	let svg1;
    	let defs;
    	let path;
    	let g0;
    	let use0;
    	let g1;
    	let use1;
    	let g2;
    	let use2;
    	let t6;
    	let div10;
    	let div9;
    	let div8;
    	let h20;
    	let t8;
    	let div7;
    	let p1;
    	let strong0;
    	let t10;
    	let h3;
    	let t12;
    	let p2;
    	let t13;
    	let a0;
    	let t15;
    	let t16;
    	let p3;
    	let t18;
    	let h21;
    	let t20;
    	let p4;
    	let t22;
    	let ol;
    	let li0;
    	let a1;
    	let strong1;
    	let t24;
    	let li1;
    	let a2;
    	let strong2;
    	let t26;
    	let li2;
    	let a3;
    	let strong3;
    	let t28;
    	let li3;
    	let a4;
    	let strong4;
    	let t30;
    	let li4;
    	let a5;
    	let strong5;
    	let t32;
    	let li5;
    	let a6;
    	let strong6;
    	let t34;
    	let li6;
    	let a7;
    	let strong7;
    	let t36;
    	let li7;
    	let a8;
    	let strong8;
    	let t38;
    	let li8;
    	let a9;
    	let strong9;
    	let t40;
    	let li9;
    	let a10;
    	let strong10;
    	let t42;
    	let li10;
    	let a11;
    	let strong11;
    	let t44;
    	let li11;
    	let a12;
    	let strong12;
    	let t46;
    	let li12;
    	let a13;
    	let strong13;
    	let t48;
    	let h22;
    	let t50;
    	let p5;
    	let t52;
    	let p6;
    	let t54;
    	let p7;
    	let a14;
    	let t56;
    	let h23;
    	let t58;
    	let p8;
    	let t60;
    	let p9;
    	let a15;
    	let t62;
    	let h24;
    	let t64;
    	let p10;
    	let t66;
    	let p11;
    	let a16;
    	let t68;
    	let h25;
    	let t70;
    	let p12;
    	let t72;
    	let p13;
    	let a17;
    	let t74;
    	let h26;
    	let t76;
    	let p14;
    	let t78;
    	let p15;
    	let t80;
    	let p16;
    	let a18;
    	let t82;
    	let h27;
    	let t84;
    	let p17;
    	let t86;
    	let p18;
    	let t88;
    	let p19;
    	let a19;
    	let t90;
    	let h28;
    	let t92;
    	let p20;
    	let t94;
    	let p21;
    	let t96;
    	let p22;
    	let a20;
    	let t98;
    	let h29;
    	let t100;
    	let p23;
    	let t102;
    	let p24;
    	let a21;
    	let t104;
    	let h210;
    	let t106;
    	let p25;
    	let t108;
    	let p26;
    	let a22;
    	let t110;
    	let h211;
    	let t112;
    	let p27;
    	let t114;
    	let p28;
    	let t116;
    	let p29;
    	let t118;
    	let p30;
    	let a23;
    	let t120;
    	let h212;
    	let t122;
    	let p31;
    	let t124;
    	let p32;
    	let a24;
    	let t126;
    	let h213;
    	let t128;
    	let p33;
    	let t130;
    	let p34;
    	let a25;
    	let t132;
    	let h214;
    	let t134;
    	let p35;
    	let t135;
    	let a26;
    	let t137;
    	let a27;
    	let t139;
    	let t140;
    	let footer;
    	let current;
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			main = element("main");
    			div6 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Tyler's Privacy Policy";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "This policy tells you how we manage privacy on\n                                our site.";
    			t4 = space();
    			div5 = element("div");
    			svg0 = svg_element("svg");
    			polygon = svg_element("polygon");
    			t5 = space();
    			section = element("section");
    			svg1 = svg_element("svg");
    			defs = svg_element("defs");
    			path = svg_element("path");
    			g0 = svg_element("g");
    			use0 = svg_element("use");
    			g1 = svg_element("g");
    			use1 = svg_element("use");
    			g2 = svg_element("g");
    			use2 = svg_element("use");
    			t6 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Privacy Policy";
    			t8 = space();
    			div7 = element("div");
    			p1 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Effective Date: 03-12-2020";
    			t10 = space();
    			h3 = element("h3");
    			h3.textContent = "Your privacy is important to us";
    			t12 = space();
    			p2 = element("p");
    			t13 = text("It is Thompson Development Group's policy to\n                                respect your privacy regarding any information\n                                we may collect while operating our website. This\n                                Privacy Policy applies to\n                                ");
    			a0 = element("a");
    			a0.textContent = "www.thompsondevgroup.com";
    			t15 = text("\n                                (hereinafter, \"us\", \"we\", or\n                                \"www.thompsondevgroup.com\"). We respect your\n                                privacy and are committed to protecting\n                                personally identifiable information you may\n                                provide us through the Website. We have adopted\n                                this privacy policy (\"Privacy Policy\") to\n                                explain what information may be collected on our\n                                Website, how we use this information, and under\n                                what circumstances we may disclose the\n                                information to third parties. This Privacy\n                                Policy applies only to information we collect\n                                through the Website and does not apply to our\n                                collection of information from other sources.");
    			t16 = space();
    			p3 = element("p");
    			p3.textContent = "This Privacy Policy, together with the Terms of\n                                service posted on our Website, set forth the\n                                general rules and policies governing your use of\n                                our Website. Depending on your activities when\n                                visiting our Website, you may be required to\n                                agree to additional terms of service.";
    			t18 = space();
    			h21 = element("h2");
    			h21.textContent = "Contents";
    			t20 = space();
    			p4 = element("p");
    			p4.textContent = "Click below to jump to any section of this\n                                privacy policy";
    			t22 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a1 = element("a");
    			strong1 = element("strong");
    			strong1.textContent = "Website\n                                            Visitors";
    			t24 = space();
    			li1 = element("li");
    			a2 = element("a");
    			strong2 = element("strong");
    			strong2.textContent = "Personally-Identifying\n                                            Information";
    			t26 = space();
    			li2 = element("li");
    			a3 = element("a");
    			strong3 = element("strong");
    			strong3.textContent = "Security";
    			t28 = space();
    			li3 = element("li");
    			a4 = element("a");
    			strong4 = element("strong");
    			strong4.textContent = "Advertisements";
    			t30 = space();
    			li4 = element("li");
    			a5 = element("a");
    			strong5 = element("strong");
    			strong5.textContent = "Links To\n                                            External Sites";
    			t32 = space();
    			li5 = element("li");
    			a6 = element("a");
    			strong6 = element("strong");
    			strong6.textContent = "Thompson\n                                            Development Group uses Google\n                                            AdWords for remarketing";
    			t34 = space();
    			li6 = element("li");
    			a7 = element("a");
    			strong7 = element("strong");
    			strong7.textContent = "Protection\n                                            of Certain Personally-Identifying\n                                            Information";
    			t36 = space();
    			li7 = element("li");
    			a8 = element("a");
    			strong8 = element("strong");
    			strong8.textContent = "Aggregated\n                                            Statistics";
    			t38 = space();
    			li8 = element("li");
    			a9 = element("a");
    			strong9 = element("strong");
    			strong9.textContent = "Affiliate\n                                            Disclosure";
    			t40 = space();
    			li9 = element("li");
    			a10 = element("a");
    			strong10 = element("strong");
    			strong10.textContent = "Cookies";
    			t42 = space();
    			li10 = element("li");
    			a11 = element("a");
    			strong11 = element("strong");
    			strong11.textContent = "E-commerce";
    			t44 = space();
    			li11 = element("li");
    			a12 = element("a");
    			strong12 = element("strong");
    			strong12.textContent = "Privacy Policy\n                                            Changes";
    			t46 = space();
    			li12 = element("li");
    			a13 = element("a");
    			strong13 = element("strong");
    			strong13.textContent = "Contact\n                                            Information & Credit";
    			t48 = space();
    			h22 = element("h2");
    			h22.textContent = "1. Website Visitors";
    			t50 = space();
    			p5 = element("p");
    			p5.textContent = "Like most website operators, Thompson\n                                Development Group collects\n                                non-personally-identifying information of the\n                                sort that web browsers and servers typically\n                                make available, such as the browser type,\n                                language preference, referring site, and the\n                                date and time of each visitor request. Thompson\n                                Development Group's purpose in collecting\n                                non-personally identifying information is to\n                                better understand how Thompson Development\n                                Group's visitors use its website. From time to\n                                time, Thompson Development Group may release\n                                non-personally-identifying information in the\n                                aggregate, e.g., by publishing a report on\n                                trends in the usage of its website.";
    			t52 = space();
    			p6 = element("p");
    			p6.textContent = "Thompson Development Group also collects\n                                potentially personally-identifying information\n                                like Internet Protocol (IP) addresses for logged\n                                in users and for users leaving comments on\n                                https://www.thompsondevgroup.com blog posts.\n                                Thompson Development Group only discloses logged\n                                in user and commenter IP addresses under the\n                                same circumstances that it uses and discloses\n                                personally-identifying information as described\n                                below.";
    			t54 = space();
    			p7 = element("p");
    			a14 = element("a");
    			a14.textContent = "Back to table of\n                                    contents";
    			t56 = space();
    			h23 = element("h2");
    			h23.textContent = "2. Personally-Identifying Information";
    			t58 = space();
    			p8 = element("p");
    			p8.textContent = "Certain visitors to Thompson Development Group's\n                                websites choose to interact with Thompson\n                                Development Group in ways that require Thompson\n                                Development Group to gather\n                                personally-identifying information. The amount\n                                and type of information that Thompson\n                                Development Group gathers depends on the nature\n                                of the interaction. For example, we ask visitors\n                                who leave a comment at\n                                https://www.thompsondevgroup.com to provide a\n                                username and email address.";
    			t60 = space();
    			p9 = element("p");
    			a15 = element("a");
    			a15.textContent = "Back to table of\n                                    contents";
    			t62 = space();
    			h24 = element("h2");
    			h24.textContent = "3. Security";
    			t64 = space();
    			p10 = element("p");
    			p10.textContent = "The security of your Personal Information is\n                                important to us, but remember that no method of\n                                transmission over the Internet, or method of\n                                electronic storage is 100% secure. While we\n                                strive to use commercially acceptable means to\n                                protect your Personal Information, we cannot\n                                guarantee its absolute security.";
    			t66 = space();
    			p11 = element("p");
    			a16 = element("a");
    			a16.textContent = "Back to table of\n                                    contents";
    			t68 = space();
    			h25 = element("h2");
    			h25.textContent = "4. Advertisements";
    			t70 = space();
    			p12 = element("p");
    			p12.textContent = "Ads appearing on our website may be delivered to\n                                users by advertising partners, who may set\n                                cookies. These cookies allow the ad server to\n                                recognize your computer each time they send you\n                                an online advertisement to compile information\n                                about you or others who use your computer. This\n                                information allows ad networks to, among other\n                                things, deliver targeted advertisements that\n                                they believe will be of most interest to you.\n                                This Privacy Policy covers the use of cookies by\n                                Thompson Development Group and does not cover\n                                the use of cookies by any advertisers.";
    			t72 = space();
    			p13 = element("p");
    			a17 = element("a");
    			a17.textContent = "Back to table of\n                                    contents";
    			t74 = space();
    			h26 = element("h2");
    			h26.textContent = "5. Links To External Sites";
    			t76 = space();
    			p14 = element("p");
    			p14.textContent = "Our Service may contain links to external sites\n                                that are not operated by us. If you click on a\n                                third party link, you will be directed to that\n                                third party's site. We strongly advise you to\n                                review the Privacy Policy and terms of service\n                                of every site you visit.";
    			t78 = space();
    			p15 = element("p");
    			p15.textContent = "We have no control over, and assume no\n                                responsibility for the content, privacy policies\n                                or practices of any third party sites, products\n                                or services.";
    			t80 = space();
    			p16 = element("p");
    			a18 = element("a");
    			a18.textContent = "Back to table of\n                                    contents";
    			t82 = space();
    			h27 = element("h2");
    			h27.textContent = "6. Thompson Development Group uses Google\n                                AdWords for remarketing";
    			t84 = space();
    			p17 = element("p");
    			p17.textContent = "Thompson Development Group uses the remarketing\n                                services to advertise on third party websites\n                                (including Google) to previous visitors to our\n                                site. It could mean that we advertise to\n                                previous visitors who haven't completed a task\n                                on our site, for example using the contact form\n                                to make an enquiry. This could be in the form of\n                                an advertisement on the Google search results\n                                page, or a site in the Google Display Network.\n                                Third-party vendors, including Google, use\n                                cookies to serve ads based on someone's past\n                                visits. Of course, any data collected will be\n                                used in accordance with our own privacy policy\n                                and Google's privacy policy.";
    			t86 = space();
    			p18 = element("p");
    			p18.textContent = "You can set preferences for how Google\n                                advertises to you using the Google Ad\n                                Preferences page, and if you want to you can opt\n                                out of interest-based advertising entirely by\n                                cookie settings or permanently using a browser\n                                plugin.";
    			t88 = space();
    			p19 = element("p");
    			a19 = element("a");
    			a19.textContent = "Back to table of\n                                    contents";
    			t90 = space();
    			h28 = element("h2");
    			h28.textContent = "7. Protection of Certain Personally-Identifying\n                                Information";
    			t92 = space();
    			p20 = element("p");
    			p20.textContent = "Thompson Development Group discloses potentially\n                                personally-identifying and\n                                personally-identifying information only to those\n                                of its employees, contractors and affiliated\n                                organizations that (i) need to know that\n                                information in order to process it on Thompson\n                                Development Group's behalf or to provide\n                                services available at Thompson Development\n                                Group's website, and (ii) that have agreed not\n                                to disclose it to others. Some of those\n                                employees, contractors and affiliated\n                                organizations may be located outside of your\n                                home country; by using Thompson Development\n                                Group's website, you consent to the transfer of\n                                such information to them. Thompson Development\n                                Group will not rent or sell potentially\n                                personally-identifying and\n                                personally-identifying information to anyone.\n                                Other than to its employees, contractors and\n                                affiliated organizations, as described above,\n                                Thompson Development Group discloses potentially\n                                personally-identifying and\n                                personally-identifying information only in\n                                response to a subpoena, court order or other\n                                governmental request, or when Thompson\n                                Development Group believes in good faith that\n                                disclosure is reasonably necessary to protect\n                                the property or rights of Thompson Development\n                                Group, third parties or the public at large.";
    			t94 = space();
    			p21 = element("p");
    			p21.textContent = "If you are a registered user of\n                                https://www.thompsondevgroup.com and have\n                                supplied your email address, Thompson\n                                Development Group may occasionally send you an\n                                email to tell you about new features, solicit\n                                your feedback, or just keep you up to date with\n                                what's going on with Thompson Development Group\n                                and our products. We primarily use our blog to\n                                communicate this type of information, so we\n                                expect to keep this type of email to a minimum.\n                                If you send us a request (for example via a\n                                support email or via one of our feedback\n                                mechanisms), we reserve the right to publish it\n                                in order to help us clarify or respond to your\n                                request or to help us support other users.\n                                Thompson Development Group takes all measures\n                                reasonably necessary to protect against the\n                                unauthorized access, use, alteration or\n                                destruction of potentially\n                                personally-identifying and\n                                personally-identifying information.";
    			t96 = space();
    			p22 = element("p");
    			a20 = element("a");
    			a20.textContent = "Back to table of\n                                    contents";
    			t98 = space();
    			h29 = element("h2");
    			h29.textContent = "8. Aggregated Statistics";
    			t100 = space();
    			p23 = element("p");
    			p23.textContent = "Thompson Development Group may collect\n                                statistics about the behavior of visitors to its\n                                website. Thompson Development Group may display\n                                this information publicly or provide it to\n                                others. However, Thompson Development Group does\n                                not disclose your personally-identifying\n                                information.";
    			t102 = space();
    			p24 = element("p");
    			a21 = element("a");
    			a21.textContent = "Back to table of\n                                    contents";
    			t104 = space();
    			h210 = element("h2");
    			h210.textContent = "9. Affiliate Disclosure";
    			t106 = space();
    			p25 = element("p");
    			p25.textContent = "This site uses affiliate links and does earn a\n                                commission from certain links. This does not\n                                affect your purchases or the price you may pay.";
    			t108 = space();
    			p26 = element("p");
    			a22 = element("a");
    			a22.textContent = "Back to table of\n                                    contents";
    			t110 = space();
    			h211 = element("h2");
    			h211.textContent = "10. Cookies";
    			t112 = space();
    			p27 = element("p");
    			p27.textContent = "To enrich and perfect your online experience,\n                                Thompson Development Group uses \"Cookies\",\n                                similar technologies and services provided by\n                                others to display personalized content,\n                                appropriate advertising and store your\n                                preferences on your computer.";
    			t114 = space();
    			p28 = element("p");
    			p28.textContent = "A cookie is a string of information that a\n                                website stores on a visitor's computer, and that\n                                the visitor's browser provides to the website\n                                each time the visitor returns. Thompson\n                                Development Group uses cookies to help Thompson\n                                Development Group identify and track visitors,\n                                their usage of https://www.thompsondevgroup.com,\n                                and their website access preferences. Thompson\n                                Development Group visitors who do not wish to\n                                have cookies placed on their computers should\n                                set their browsers to refuse cookies before\n                                using Thompson Development Group's websites,\n                                with the drawback that certain features of\n                                Thompson Development Group's websites may not\n                                function properly without the aid of cookies.";
    			t116 = space();
    			p29 = element("p");
    			p29.textContent = "By continuing to navigate our website without\n                                changing your cookie settings, you hereby\n                                acknowledge and agree to Thompson Development\n                                Group's use of cookies.";
    			t118 = space();
    			p30 = element("p");
    			a23 = element("a");
    			a23.textContent = "Back to table of\n                                    contents";
    			t120 = space();
    			h212 = element("h2");
    			h212.textContent = "11. E-commerce";
    			t122 = space();
    			p31 = element("p");
    			p31.textContent = "Those who engage in transactions with Thompson\n                                Development Group – by purchasing Thompson\n                                Development Group's services or products, are\n                                asked to provide additional information,\n                                including as necessary the personal and\n                                financial information required to process those\n                                transactions. In each case, Thompson Development\n                                Group collects such information only insofar as\n                                is necessary or appropriate to fulfill the\n                                purpose of the visitor's interaction with\n                                Thompson Development Group. Thompson Development\n                                Group does not disclose personally-identifying\n                                information other than as described below. And\n                                visitors can always refuse to supply\n                                personally-identifying information, with the\n                                caveat that it may prevent them from engaging in\n                                certain website-related activities.";
    			t124 = space();
    			p32 = element("p");
    			a24 = element("a");
    			a24.textContent = "Back to table of\n                                    contents";
    			t126 = space();
    			h213 = element("h2");
    			h213.textContent = "12. Privacy Policy Changes";
    			t128 = space();
    			p33 = element("p");
    			p33.textContent = "Although most changes are likely to be minor,\n                                Thompson Development Group may change its\n                                Privacy Policy from time to time, and in\n                                Thompson Development Group's sole discretion.\n                                Thompson Development Group encourages visitors\n                                to frequently check this page for any changes to\n                                its Privacy Policy. Your continued use of this\n                                site after any change in this Privacy Policy\n                                will constitute your acceptance of such change.";
    			t130 = space();
    			p34 = element("p");
    			a25 = element("a");
    			a25.textContent = "Back to table of\n                                    contents";
    			t132 = space();
    			h214 = element("h2");
    			h214.textContent = "13. Contact Information";
    			t134 = space();
    			p35 = element("p");
    			t135 = text("If you have any questions about our Privacy\n                                Policy, please contact us via\n                                ");
    			a26 = element("a");
    			a26.textContent = "email";
    			t137 = text("\n                                or\n                                ");
    			a27 = element("a");
    			a27.textContent = "phone";
    			t139 = text(".");
    			t140 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(span, "id", "blackOverlay");
    			attr_dev(span, "class", "w-full h-full absolute opacity-75 bg-black");
    			add_location(span, file$5, 78, 16, 1941);
    			attr_dev(div0, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div0, "background-image", "url(https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2088&q=80)");
    			add_location(div0, file$5, 73, 12, 1618);
    			attr_dev(h1, "class", "text-white font-semibold text-5xl");
    			add_location(h1, file$5, 87, 28, 2369);
    			attr_dev(p0, "class", "mt-4 text-lg text-gray-300");
    			add_location(p0, file$5, 90, 28, 2533);
    			attr_dev(div1, "class", "pr-12");
    			add_location(div1, file$5, 86, 24, 2321);
    			attr_dev(div2, "class", "w-full lg:w-6/12 px-4 ml-auto mr-auto text-center");
    			add_location(div2, file$5, 84, 20, 2209);
    			attr_dev(div3, "class", "items-center flex flex-wrap");
    			add_location(div3, file$5, 83, 16, 2147);
    			attr_dev(div4, "class", "container relative mx-auto");
    			add_location(div4, file$5, 82, 12, 2090);
    			attr_dev(polygon, "class", "text-white-300 fill-current");
    			set_style(polygon, "color", "rgba(255, 255, 255, var(--text-opacity))");
    			attr_dev(polygon, "points", "2560 0 2560 100 0 100");
    			add_location(polygon, file$5, 109, 20, 3346);
    			attr_dev(svg0, "class", "absolute bottom-0 overflow-hidden");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "preserveAspectRatio", "none");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "viewBox", "0 0 2560 100");
    			attr_dev(svg0, "x", "0");
    			attr_dev(svg0, "y", "0");
    			add_location(svg0, file$5, 101, 16, 3027);
    			attr_dev(div5, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div5, "transform", "translateZ(0)");
    			add_location(div5, file$5, 98, 12, 2838);
    			attr_dev(div6, "class", "relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75");
    			add_location(div6, file$5, 71, 8, 1495);
    			attr_dev(path, "id", "gentle-wave");
    			attr_dev(path, "d", "M-160 44c30 0 \n    58-18 88-18s\n    58 18 88 18 \n    58-18 88-18 \n    58 18 88 18\n    v44h-352z");
    			add_location(path, file$5, 125, 20, 3937);
    			add_location(defs, file$5, 124, 16, 3910);
    			xlink_attr(use0, "xlink:href", "#gentle-wave");
    			attr_dev(use0, "x", "50");
    			attr_dev(use0, "y", "3");
    			attr_dev(use0, "fill", "#fff");
    			attr_dev(use0, "class", "svelte-gsvxs");
    			add_location(use0, file$5, 135, 20, 4193);
    			attr_dev(g0, "class", "parallax1 svelte-gsvxs");
    			add_location(g0, file$5, 134, 16, 4151);
    			xlink_attr(use1, "xlink:href", "#gentle-wave");
    			attr_dev(use1, "x", "50");
    			attr_dev(use1, "y", "0");
    			attr_dev(use1, "fill", "#fff");
    			attr_dev(use1, "class", "svelte-gsvxs");
    			add_location(use1, file$5, 138, 20, 4331);
    			attr_dev(g1, "class", "parallax2 svelte-gsvxs");
    			add_location(g1, file$5, 137, 16, 4289);
    			xlink_attr(use2, "xlink:href", "#gentle-wave");
    			attr_dev(use2, "x", "50");
    			attr_dev(use2, "y", "6");
    			attr_dev(use2, "fill", "#fff");
    			attr_dev(use2, "class", "svelte-gsvxs");
    			add_location(use2, file$5, 142, 20, 4470);
    			attr_dev(g2, "class", "parallax4 svelte-gsvxs");
    			add_location(g2, file$5, 141, 16, 4428);
    			attr_dev(svg1, "class", "editorial svelte-gsvxs");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg1, "viewBox", "0 24 150 28 ");
    			attr_dev(svg1, "preserveAspectRatio", "none");
    			add_location(svg1, file$5, 118, 12, 3662);
    			attr_dev(h20, "class", "text-4xl font-semibold");
    			add_location(h20, file$5, 149, 24, 4777);
    			add_location(strong0, file$5, 151, 31, 4943);
    			add_location(p1, file$5, 151, 28, 4940);
    			attr_dev(h3, "id", "a");
    			add_location(h3, file$5, 152, 28, 5019);
    			attr_dev(a0, "href", "https://www.thompsondevgroup.com");
    			add_location(a0, file$5, 158, 32, 5426);
    			add_location(p2, file$5, 153, 28, 5095);
    			add_location(p3, file$5, 174, 28, 6577);
    			attr_dev(h21, "id", "tableofcontents");
    			add_location(h21, file$5, 182, 28, 7106);
    			add_location(p4, file$5, 183, 28, 7173);
    			add_location(strong1, file$5, 189, 63, 7474);
    			attr_dev(a1, "href", "#websitevisitors");
    			add_location(a1, file$5, 189, 36, 7447);
    			add_location(li0, file$5, 188, 32, 7406);
    			add_location(strong2, file$5, 194, 52, 7722);
    			attr_dev(a2, "href", "#PII");
    			add_location(a2, file$5, 193, 36, 7667);
    			add_location(li1, file$5, 192, 32, 7626);
    			add_location(strong3, file$5, 199, 57, 7993);
    			attr_dev(a3, "href", "#Security");
    			add_location(a3, file$5, 198, 36, 7933);
    			add_location(li2, file$5, 197, 32, 7892);
    			add_location(strong4, file$5, 203, 52, 8189);
    			attr_dev(a4, "href", "#Ads");
    			add_location(a4, file$5, 202, 36, 8134);
    			add_location(li3, file$5, 201, 32, 8093);
    			add_location(strong5, file$5, 206, 61, 8361);
    			attr_dev(a5, "href", "#ExternalLinks");
    			add_location(a5, file$5, 206, 36, 8336);
    			add_location(li4, file$5, 205, 32, 8295);
    			add_location(strong6, file$5, 210, 59, 8584);
    			attr_dev(a6, "href", "#Remarketing");
    			add_location(a6, file$5, 210, 36, 8561);
    			add_location(li5, file$5, 209, 32, 8520);
    			add_location(strong7, file$5, 215, 61, 8892);
    			attr_dev(a7, "href", "#PIIProtection");
    			add_location(a7, file$5, 215, 36, 8867);
    			add_location(li6, file$5, 214, 32, 8826);
    			add_location(strong8, file$5, 220, 53, 9186);
    			attr_dev(a8, "href", "#Stats");
    			add_location(a8, file$5, 220, 36, 9169);
    			add_location(li7, file$5, 219, 32, 9128);
    			add_location(strong9, file$5, 224, 58, 9406);
    			attr_dev(a9, "href", "#Affiliates");
    			add_location(a9, file$5, 224, 36, 9384);
    			add_location(li8, file$5, 223, 32, 9343);
    			add_location(strong10, file$5, 229, 56, 9662);
    			attr_dev(a10, "href", "#Cookies");
    			add_location(a10, file$5, 228, 36, 9603);
    			add_location(li9, file$5, 227, 32, 9562);
    			add_location(strong11, file$5, 233, 58, 9863);
    			attr_dev(a11, "href", "#Ecommerce");
    			add_location(a11, file$5, 232, 36, 9802);
    			add_location(li10, file$5, 231, 32, 9761);
    			add_location(strong12, file$5, 236, 55, 10025);
    			attr_dev(a12, "href", "#Changes");
    			add_location(a12, file$5, 236, 36, 10006);
    			add_location(li11, file$5, 235, 32, 9965);
    			add_location(strong13, file$5, 240, 54, 10242);
    			attr_dev(a13, "href", "#Credit");
    			add_location(a13, file$5, 240, 36, 10224);
    			add_location(li12, file$5, 239, 32, 10183);
    			attr_dev(ol, "type", "1");
    			add_location(ol, file$5, 187, 28, 7360);
    			attr_dev(h22, "id", "websitevisitors");
    			add_location(h22, file$5, 244, 28, 10440);
    			add_location(p5, file$5, 245, 28, 10518);
    			add_location(p6, file$5, 262, 28, 11701);
    			attr_dev(a14, "href", "#tableofcontents");
    			add_location(a14, file$5, 276, 32, 12543);
    			add_location(p7, file$5, 275, 28, 12507);
    			attr_dev(h23, "id", "PII");
    			add_location(h23, file$5, 279, 28, 12697);
    			add_location(p8, file$5, 282, 28, 12843);
    			attr_dev(a15, "href", "#tableofcontents");
    			add_location(a15, file$5, 297, 32, 13743);
    			add_location(p9, file$5, 296, 28, 13707);
    			attr_dev(h24, "id", "Security");
    			add_location(h24, file$5, 300, 28, 13897);
    			add_location(p10, file$5, 301, 28, 13960);
    			attr_dev(a16, "href", "#tableofcontents");
    			add_location(a16, file$5, 312, 32, 14593);
    			add_location(p11, file$5, 311, 28, 14557);
    			attr_dev(h25, "id", "Ads");
    			add_location(h25, file$5, 315, 28, 14747);
    			add_location(p12, file$5, 316, 28, 14811);
    			attr_dev(a17, "href", "#tableofcontents");
    			add_location(a17, file$5, 332, 32, 15850);
    			add_location(p13, file$5, 331, 28, 15814);
    			attr_dev(h26, "id", "ExternalLinks");
    			add_location(h26, file$5, 335, 28, 16004);
    			add_location(p14, file$5, 338, 28, 16149);
    			add_location(p15, file$5, 346, 28, 16666);
    			attr_dev(a18, "href", "#tableofcontents");
    			add_location(a18, file$5, 354, 32, 17045);
    			add_location(p16, file$5, 353, 28, 17009);
    			attr_dev(h27, "id", "Remarketing");
    			add_location(h27, file$5, 357, 28, 17199);
    			add_location(p17, file$5, 361, 28, 17413);
    			add_location(p18, file$5, 377, 28, 18555);
    			attr_dev(a19, "href", "#tableofcontents");
    			add_location(a19, file$5, 387, 32, 19076);
    			add_location(p19, file$5, 386, 28, 19040);
    			attr_dev(h28, "id", "PIIProtection");
    			add_location(h28, file$5, 390, 28, 19230);
    			add_location(p20, file$5, 394, 28, 19440);
    			add_location(p21, file$5, 425, 28, 21675);
    			attr_dev(a20, "href", "#tableofcontents");
    			add_location(a20, file$5, 450, 32, 23332);
    			add_location(p22, file$5, 449, 28, 23296);
    			attr_dev(h29, "id", "Stats");
    			add_location(h29, file$5, 453, 28, 23486);
    			add_location(p23, file$5, 454, 28, 23559);
    			attr_dev(a21, "href", "#tableofcontents");
    			add_location(a21, file$5, 465, 32, 24167);
    			add_location(p24, file$5, 464, 28, 24131);
    			attr_dev(h210, "id", "Affiliates");
    			add_location(h210, file$5, 468, 28, 24321);
    			add_location(p25, file$5, 469, 28, 24398);
    			attr_dev(a22, "href", "#tableofcontents");
    			add_location(a22, file$5, 476, 32, 24736);
    			add_location(p26, file$5, 475, 28, 24700);
    			attr_dev(h211, "id", "Cookies");
    			add_location(h211, file$5, 479, 28, 24890);
    			add_location(p27, file$5, 480, 28, 24952);
    			add_location(p28, file$5, 488, 28, 25453);
    			add_location(p29, file$5, 505, 28, 26683);
    			attr_dev(a23, "href", "#tableofcontents");
    			add_location(a23, file$5, 513, 32, 27071);
    			add_location(p30, file$5, 512, 28, 27035);
    			attr_dev(h212, "id", "Ecommerce");
    			add_location(h212, file$5, 516, 28, 27225);
    			add_location(p31, file$5, 517, 28, 27292);
    			attr_dev(a24, "href", "#tableofcontents");
    			add_location(a24, file$5, 538, 32, 28695);
    			add_location(p32, file$5, 537, 28, 28659);
    			attr_dev(h213, "id", "Changes");
    			add_location(h213, file$5, 541, 28, 28849);
    			add_location(p33, file$5, 542, 28, 28926);
    			attr_dev(a25, "href", "#tableofcontents");
    			add_location(a25, file$5, 554, 32, 29726);
    			add_location(p34, file$5, 553, 28, 29690);
    			attr_dev(h214, "id", "Credit");
    			add_location(h214, file$5, 557, 28, 29880);
    			attr_dev(a26, "href", "mailto:contact@thompsondevgroup.com");
    			add_location(a26, file$5, 561, 32, 30127);
    			attr_dev(a27, "href", "tel:");
    			add_location(a27, file$5, 564, 32, 30286);
    			add_location(p35, file$5, 558, 28, 29953);
    			attr_dev(div7, "class", "text-lg leading-relaxed m-4 text-gray-600");
    			add_location(div7, file$5, 150, 24, 4856);
    			attr_dev(div8, "class", "w-full lg:w-6/12 px-4");
    			add_location(div8, file$5, 148, 20, 4717);
    			attr_dev(div9, "class", "flex flex-wrap justify-center text-center mb-24");
    			add_location(div9, file$5, 147, 16, 4635);
    			attr_dev(div10, "class", "container mx-auto px-4");
    			add_location(div10, file$5, 146, 12, 4582);
    			attr_dev(section, "class", "pt-20 pb-48");
    			add_location(section, file$5, 117, 8, 3620);
    			add_location(main, file$5, 70, 4, 1480);
    			add_location(div11, file$5, 69, 0, 1470);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, main);
    			append_dev(main, div6);
    			append_dev(div6, div0);
    			append_dev(div0, span);
    			append_dev(div6, t0);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, svg0);
    			append_dev(svg0, polygon);
    			append_dev(main, t5);
    			append_dev(main, section);
    			append_dev(section, svg1);
    			append_dev(svg1, defs);
    			append_dev(defs, path);
    			append_dev(svg1, g0);
    			append_dev(g0, use0);
    			append_dev(svg1, g1);
    			append_dev(g1, use1);
    			append_dev(svg1, g2);
    			append_dev(g2, use2);
    			append_dev(section, t6);
    			append_dev(section, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h20);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, p1);
    			append_dev(p1, strong0);
    			append_dev(div7, t10);
    			append_dev(div7, h3);
    			append_dev(div7, t12);
    			append_dev(div7, p2);
    			append_dev(p2, t13);
    			append_dev(p2, a0);
    			append_dev(p2, t15);
    			append_dev(div7, t16);
    			append_dev(div7, p3);
    			append_dev(div7, t18);
    			append_dev(div7, h21);
    			append_dev(div7, t20);
    			append_dev(div7, p4);
    			append_dev(div7, t22);
    			append_dev(div7, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a1);
    			append_dev(a1, strong1);
    			append_dev(ol, t24);
    			append_dev(ol, li1);
    			append_dev(li1, a2);
    			append_dev(a2, strong2);
    			append_dev(ol, t26);
    			append_dev(ol, li2);
    			append_dev(li2, a3);
    			append_dev(a3, strong3);
    			append_dev(ol, t28);
    			append_dev(ol, li3);
    			append_dev(li3, a4);
    			append_dev(a4, strong4);
    			append_dev(ol, t30);
    			append_dev(ol, li4);
    			append_dev(li4, a5);
    			append_dev(a5, strong5);
    			append_dev(ol, t32);
    			append_dev(ol, li5);
    			append_dev(li5, a6);
    			append_dev(a6, strong6);
    			append_dev(ol, t34);
    			append_dev(ol, li6);
    			append_dev(li6, a7);
    			append_dev(a7, strong7);
    			append_dev(ol, t36);
    			append_dev(ol, li7);
    			append_dev(li7, a8);
    			append_dev(a8, strong8);
    			append_dev(ol, t38);
    			append_dev(ol, li8);
    			append_dev(li8, a9);
    			append_dev(a9, strong9);
    			append_dev(ol, t40);
    			append_dev(ol, li9);
    			append_dev(li9, a10);
    			append_dev(a10, strong10);
    			append_dev(ol, t42);
    			append_dev(ol, li10);
    			append_dev(li10, a11);
    			append_dev(a11, strong11);
    			append_dev(ol, t44);
    			append_dev(ol, li11);
    			append_dev(li11, a12);
    			append_dev(a12, strong12);
    			append_dev(ol, t46);
    			append_dev(ol, li12);
    			append_dev(li12, a13);
    			append_dev(a13, strong13);
    			append_dev(div7, t48);
    			append_dev(div7, h22);
    			append_dev(div7, t50);
    			append_dev(div7, p5);
    			append_dev(div7, t52);
    			append_dev(div7, p6);
    			append_dev(div7, t54);
    			append_dev(div7, p7);
    			append_dev(p7, a14);
    			append_dev(div7, t56);
    			append_dev(div7, h23);
    			append_dev(div7, t58);
    			append_dev(div7, p8);
    			append_dev(div7, t60);
    			append_dev(div7, p9);
    			append_dev(p9, a15);
    			append_dev(div7, t62);
    			append_dev(div7, h24);
    			append_dev(div7, t64);
    			append_dev(div7, p10);
    			append_dev(div7, t66);
    			append_dev(div7, p11);
    			append_dev(p11, a16);
    			append_dev(div7, t68);
    			append_dev(div7, h25);
    			append_dev(div7, t70);
    			append_dev(div7, p12);
    			append_dev(div7, t72);
    			append_dev(div7, p13);
    			append_dev(p13, a17);
    			append_dev(div7, t74);
    			append_dev(div7, h26);
    			append_dev(div7, t76);
    			append_dev(div7, p14);
    			append_dev(div7, t78);
    			append_dev(div7, p15);
    			append_dev(div7, t80);
    			append_dev(div7, p16);
    			append_dev(p16, a18);
    			append_dev(div7, t82);
    			append_dev(div7, h27);
    			append_dev(div7, t84);
    			append_dev(div7, p17);
    			append_dev(div7, t86);
    			append_dev(div7, p18);
    			append_dev(div7, t88);
    			append_dev(div7, p19);
    			append_dev(p19, a19);
    			append_dev(div7, t90);
    			append_dev(div7, h28);
    			append_dev(div7, t92);
    			append_dev(div7, p20);
    			append_dev(div7, t94);
    			append_dev(div7, p21);
    			append_dev(div7, t96);
    			append_dev(div7, p22);
    			append_dev(p22, a20);
    			append_dev(div7, t98);
    			append_dev(div7, h29);
    			append_dev(div7, t100);
    			append_dev(div7, p23);
    			append_dev(div7, t102);
    			append_dev(div7, p24);
    			append_dev(p24, a21);
    			append_dev(div7, t104);
    			append_dev(div7, h210);
    			append_dev(div7, t106);
    			append_dev(div7, p25);
    			append_dev(div7, t108);
    			append_dev(div7, p26);
    			append_dev(p26, a22);
    			append_dev(div7, t110);
    			append_dev(div7, h211);
    			append_dev(div7, t112);
    			append_dev(div7, p27);
    			append_dev(div7, t114);
    			append_dev(div7, p28);
    			append_dev(div7, t116);
    			append_dev(div7, p29);
    			append_dev(div7, t118);
    			append_dev(div7, p30);
    			append_dev(p30, a23);
    			append_dev(div7, t120);
    			append_dev(div7, h212);
    			append_dev(div7, t122);
    			append_dev(div7, p31);
    			append_dev(div7, t124);
    			append_dev(div7, p32);
    			append_dev(p32, a24);
    			append_dev(div7, t126);
    			append_dev(div7, h213);
    			append_dev(div7, t128);
    			append_dev(div7, p33);
    			append_dev(div7, t130);
    			append_dev(div7, p34);
    			append_dev(p34, a25);
    			append_dev(div7, t132);
    			append_dev(div7, h214);
    			append_dev(div7, t134);
    			append_dev(div7, p35);
    			append_dev(p35, t135);
    			append_dev(p35, a26);
    			append_dev(p35, t137);
    			append_dev(p35, a27);
    			append_dev(p35, t139);
    			append_dev(div11, t140);
    			mount_component(footer, div11, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Privacy", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Privacy> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link, Footer });
    	return [];
    }

    class Privacy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Privacy",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/views/Terms.svelte generated by Svelte v3.26.0 */

    const file$6 = "src/views/Terms.svelte";

    function create_fragment$8(ctx) {
    	let div11;
    	let main;
    	let div6;
    	let div0;
    	let span;
    	let t0;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let p0;
    	let t4;
    	let div5;
    	let svg;
    	let polygon;
    	let t5;
    	let section;
    	let div10;
    	let div9;
    	let div8;
    	let h20;
    	let t7;
    	let div7;
    	let p1;
    	let t9;
    	let p2;
    	let t11;
    	let p3;
    	let t13;
    	let h21;
    	let t15;
    	let p4;
    	let t17;
    	let p5;
    	let t19;
    	let h22;
    	let t21;
    	let p6;
    	let t23;
    	let p7;
    	let t25;
    	let ol0;
    	let li0;
    	let t27;
    	let li1;
    	let t29;
    	let li2;
    	let t31;
    	let p8;
    	let t33;
    	let h23;
    	let t35;
    	let ol2;
    	let li3;
    	let t37;
    	let li4;
    	let t39;
    	let li5;
    	let t41;
    	let li10;
    	let t42;
    	let ol1;
    	let li6;
    	let t44;
    	let li7;
    	let t46;
    	let li8;
    	let t48;
    	let li9;
    	let t50;
    	let li11;
    	let t51;
    	let strong;
    	let t53;
    	let t54;
    	let h24;
    	let t56;
    	let ol4;
    	let li17;
    	let t57;
    	let ol3;
    	let li12;
    	let t59;
    	let li13;
    	let t61;
    	let li14;
    	let t63;
    	let li15;
    	let t65;
    	let li16;
    	let t67;
    	let ol6;
    	let li18;
    	let t69;
    	let li26;
    	let t70;
    	let ol5;
    	let li19;
    	let t72;
    	let li20;
    	let t74;
    	let li21;
    	let t76;
    	let li22;
    	let t78;
    	let li23;
    	let t80;
    	let li24;
    	let t82;
    	let li25;
    	let t84;
    	let p9;
    	let t86;
    	let p10;
    	let t88;
    	let p11;
    	let t89;
    	let a;
    	let t91;
    	let t92;
    	let p12;
    	let t94;
    	let ol7;
    	let li27;
    	let t96;
    	let li28;
    	let t98;
    	let li29;
    	let t100;
    	let p13;
    	let t102;
    	let h25;
    	let t104;
    	let p14;
    	let t106;
    	let h26;
    	let t108;
    	let p15;
    	let t110;
    	let h27;
    	let t112;
    	let p16;
    	let t114;
    	let h28;
    	let t116;
    	let p17;
    	let t118;
    	let p18;
    	let t120;
    	let h29;
    	let t122;
    	let p19;
    	let t124;
    	let ol8;
    	let li30;
    	let t126;
    	let li31;
    	let t128;
    	let li32;
    	let t130;
    	let li33;
    	let t132;
    	let p20;
    	let t134;
    	let p21;
    	let t136;
    	let h210;
    	let t138;
    	let p22;
    	let t140;
    	let footer;
    	let current;
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			main = element("main");
    			div6 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Thompson Dev Group's Terms of Use";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "This tells how you can use our site";
    			t4 = space();
    			div5 = element("div");
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			t5 = space();
    			section = element("section");
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Terms of Service";
    			t7 = space();
    			div7 = element("div");
    			p1 = element("p");
    			p1.textContent = "These terms of service outline the rules and\n                                regulations for the use of Thompson Development\n                                Group's Website.";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "By accessing this website we assume you accept\n                                these terms of service in full. Do not continue\n                                to use Thompson Development Group's website if\n                                you do not accept all of the terms of service\n                                stated on this page.";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "The following terminology applies to these Terms\n                                of Service, Privacy Statement and Disclaimer\n                                Notice and any or all Agreements: \"Client\",\n                                \"You\" and \"Your\" refers to you, the person\n                                accessing this website and accepting the\n                                Company's terms of service. \"The Company\",\n                                \"Ourselves\", \"We\", \"Our\" and \"Us\", refers to our\n                                Company. \"Party\", \"Parties\", or \"Us\", refers to\n                                both the Client and ourselves, or either the\n                                Client or ourselves. All terms refer to the\n                                offer, acceptance and consideration of payment\n                                necessary to undertake the process of our\n                                assistance to the Client in the most appropriate\n                                manner, whether by formal meetings of a fixed\n                                duration, or any other means, for the express\n                                purpose of meeting the Client's needs in respect\n                                of provision of the Company's stated\n                                services/products, in accordance with and\n                                subject to, prevailing law of . Any use of the\n                                above terminology or other words in the\n                                singular, plural, capitalisation and/or he/she\n                                or they, are taken as interchangeable and\n                                therefore as referring to same.";
    			t13 = space();
    			h21 = element("h2");
    			h21.textContent = "Cookies";
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "We employ the use of cookies. By using Thompson\n                                Development Group's website you consent to the\n                                use of cookies in accordance with Thompson\n                                Development Group's privacy policy.";
    			t17 = space();
    			p5 = element("p");
    			p5.textContent = "Most of the modern day interactive web sites use\n                                cookies to enable us to retrieve user details\n                                for each visit. Cookies are used in some areas\n                                of our site to enable the functionality of this\n                                area and ease of use for those people visiting.\n                                Some of our affiliate / advertising partners may\n                                also use cookies.";
    			t19 = space();
    			h22 = element("h2");
    			h22.textContent = "License";
    			t21 = space();
    			p6 = element("p");
    			p6.textContent = "Unless otherwise stated, Thompson Development\n                                Group and/or it's licensors own the intellectual\n                                property rights for all material on Thompson\n                                Development Group. All intellectual property\n                                rights are reserved. You may view and/or print\n                                pages from www.thompsondevgroup.com for your own\n                                personal use subject to restrictions set in\n                                these terms of service.";
    			t23 = space();
    			p7 = element("p");
    			p7.textContent = "You must not:";
    			t25 = space();
    			ol0 = element("ol");
    			li0 = element("li");
    			li0.textContent = "Republish material from\n                                    www.thompsondevgroup.com";
    			t27 = space();
    			li1 = element("li");
    			li1.textContent = "Sell, rent or sub-license material from\n                                    www.thompsondevgroup.com";
    			t29 = space();
    			li2 = element("li");
    			li2.textContent = "Reproduce, duplicate or copy material from\n                                    www.thompsondevgroup.com";
    			t31 = space();
    			p8 = element("p");
    			p8.textContent = "Redistribute content from Thompson Development\n                                Group (unless content is specifically made for\n                                redistribution).";
    			t33 = space();
    			h23 = element("h2");
    			h23.textContent = "User Comments";
    			t35 = space();
    			ol2 = element("ol");
    			li3 = element("li");
    			li3.textContent = "This Agreement shall begin on the date\n                                    hereof.";
    			t37 = space();
    			li4 = element("li");
    			li4.textContent = "Certain parts of this website offer the\n                                    opportunity for users to post and exchange\n                                    opinions, information, material and data\n                                    ('Comments') in areas of the website.\n                                    Thompson Development Group does not screen,\n                                    edit, publish or review Comments prior to\n                                    their appearance on the website and Comments\n                                    do not reflect the views or opinions of\n                                    Thompson Development Group, its agents or\n                                    affiliates. Comments reflect the view and\n                                    opinion of the person who posts such view or\n                                    opinion. To the extent permitted by\n                                    applicable laws Thompson Development Group\n                                    shall not be responsible or liable for the\n                                    Comments or for any loss cost, liability,\n                                    damages or expenses caused and or suffered\n                                    as a result of any use of and/or posting of\n                                    and/or appearance of the Comments on this\n                                    website.";
    			t39 = space();
    			li5 = element("li");
    			li5.textContent = "Thompson Development Group reserves the\n                                    right to monitor all Comments and to remove\n                                    any Comments which it considers in its\n                                    absolute discretion to be inappropriate,\n                                    offensive or otherwise in breach of these\n                                    Terms of Service.";
    			t41 = space();
    			li10 = element("li");
    			t42 = text("You warrant and represent that:\n                                    ");
    			ol1 = element("ol");
    			li6 = element("li");
    			li6.textContent = "You are entitled to post the\n                                            Comments on our website and have all\n                                            necessary licenses and consents to\n                                            do so;";
    			t44 = space();
    			li7 = element("li");
    			li7.textContent = "The Comments do not infringe any\n                                            intellectual property right,\n                                            including without limitation\n                                            copyright, patent or trademark, or\n                                            other proprietary right of any third\n                                            party;";
    			t46 = space();
    			li8 = element("li");
    			li8.textContent = "The Comments do not contain any\n                                            defamatory, libelous, offensive,\n                                            indecent or otherwise unlawful\n                                            material or material which is an\n                                            invasion of privacy";
    			t48 = space();
    			li9 = element("li");
    			li9.textContent = "The Comments will not be used to\n                                            solicit or promote business or\n                                            custom or present commercial\n                                            activities or unlawful activity.";
    			t50 = space();
    			li11 = element("li");
    			t51 = text("You hereby grant to\n                                    ");
    			strong = element("strong");
    			strong.textContent = "Thompson Development Group";
    			t53 = text("\n                                    a non-exclusive royalty-free license to use,\n                                    reproduce, edit and authorize others to use,\n                                    reproduce and edit any of your Comments in\n                                    any and all forms, formats or media.");
    			t54 = space();
    			h24 = element("h2");
    			h24.textContent = "Hyperlinking to our Content";
    			t56 = space();
    			ol4 = element("ol");
    			li17 = element("li");
    			t57 = text("The following organizations may link to our\n                                    Web site without prior written approval:\n                                    ");
    			ol3 = element("ol");
    			li12 = element("li");
    			li12.textContent = "Government agencies;";
    			t59 = space();
    			li13 = element("li");
    			li13.textContent = "Search engines;";
    			t61 = space();
    			li14 = element("li");
    			li14.textContent = "News organizations;";
    			t63 = space();
    			li15 = element("li");
    			li15.textContent = "Online directory distributors when\n                                            they list us in the directory may\n                                            link to our Web site in the same\n                                            manner as they hyperlink to the Web\n                                            sites of other listed businesses;\n                                            and";
    			t65 = space();
    			li16 = element("li");
    			li16.textContent = "Systemwide Accredited Businesses\n                                            except soliciting non-profit\n                                            organizations, charity shopping\n                                            malls, and charity fundraising\n                                            groups which may not hyperlink to\n                                            our Web site.";
    			t67 = space();
    			ol6 = element("ol");
    			li18 = element("li");
    			li18.textContent = "These organizations may link to our home\n                                    page, to publications or to other Web site\n                                    information so long as the link: (a) is not\n                                    in any way misleading; (b) does not falsely\n                                    imply sponsorship, endorsement or approval\n                                    of the linking party and its products or\n                                    services; and (c) fits within the context of\n                                    the linking party's site.";
    			t69 = space();
    			li26 = element("li");
    			t70 = text("We may consider and approve in our sole\n                                    discretion other link requests from the\n                                    following types of organizations:\n                                    ");
    			ol5 = element("ol");
    			li19 = element("li");
    			li19.textContent = "commonly-known consumer and/or\n                                            business information sources such as\n                                            Chambers of Commerce, American\n                                            Automobile Association, AARP and\n                                            Consumers Union;";
    			t72 = space();
    			li20 = element("li");
    			li20.textContent = "dot.com community sites;";
    			t74 = space();
    			li21 = element("li");
    			li21.textContent = "associations or other groups\n                                            representing charities, including\n                                            charity giving sites,";
    			t76 = space();
    			li22 = element("li");
    			li22.textContent = "online directory distributors;";
    			t78 = space();
    			li23 = element("li");
    			li23.textContent = "internet portals;";
    			t80 = space();
    			li24 = element("li");
    			li24.textContent = "accounting, law and consulting firms\n                                            whose primary clients are\n                                            businesses; and";
    			t82 = space();
    			li25 = element("li");
    			li25.textContent = "educational institutions and trade\n                                            associations.";
    			t84 = space();
    			p9 = element("p");
    			p9.textContent = "We will approve link requests from these\n                                organizations if we determine that: (a) the link\n                                would not reflect unfavorably on us or our\n                                accredited businesses (for example, trade\n                                associations or other organizations representing\n                                inherently suspect types of business, such as\n                                work-at-home opportunities, shall not be allowed\n                                to link); (b)the organization does not have an\n                                unsatisfactory record with us; (c) the benefit\n                                to us from the visibility associated with the\n                                hyperlink outweighs the absence of Thompson\n                                Development Group; and (d) where the link is in\n                                the context of general resource information or\n                                is otherwise consistent with editorial content\n                                in a newsletter or similar product furthering\n                                the mission of the organization.";
    			t86 = space();
    			p10 = element("p");
    			p10.textContent = "These organizations may link to our home page,\n                                to publications or to other Web site information\n                                so long as the link: (a) is not in any way\n                                misleading; (b) does not falsely imply\n                                sponsorship, endorsement or approval of the\n                                linking party and it products or services; and\n                                (c) fits within the context of the linking\n                                party's site.";
    			t88 = space();
    			p11 = element("p");
    			t89 = text("If you are among the organizations listed in\n                                paragraph 2 above and are interested in linking\n                                to our website, you must notify us by sending an\n                                e-mail to\n                                ");
    			a = element("a");
    			a.textContent = "contact@thompsondevgroup.com";
    			t91 = text(".\n                                Please include your name, your organization\n                                name, contact information (such as a phone\n                                number and/or e-mail address) as well as the URL\n                                of your site, a list of any URLs from which you\n                                intend to link to our Web site, and a list of\n                                the URL(s) on our site to which you would like\n                                to link. Allow 2-3 weeks for a response.");
    			t92 = space();
    			p12 = element("p");
    			p12.textContent = "Approved organizations may hyperlink to our Web\n                                site as follows:";
    			t94 = space();
    			ol7 = element("ol");
    			li27 = element("li");
    			li27.textContent = "By use of our corporate name; or";
    			t96 = space();
    			li28 = element("li");
    			li28.textContent = "By use of the uniform resource locator (Web\n                                    address) being linked to; or";
    			t98 = space();
    			li29 = element("li");
    			li29.textContent = "By use of any other description of our Web\n                                    site or material being linked to that makes\n                                    sense within the context and format of\n                                    content on the linking party's site.";
    			t100 = space();
    			p13 = element("p");
    			p13.textContent = "No use of Thompson Development Group's logo or\n                                other artwork will be allowed for linking absent\n                                a trademark license agreement.";
    			t102 = space();
    			h25 = element("h2");
    			h25.textContent = "Iframes";
    			t104 = space();
    			p14 = element("p");
    			p14.textContent = "Without prior approval and express written\n                                permission, you may not create frames around our\n                                Web pages or use other techniques that alter in\n                                any way the visual presentation or appearance of\n                                our Web site.";
    			t106 = space();
    			h26 = element("h2");
    			h26.textContent = "Content Liability";
    			t108 = space();
    			p15 = element("p");
    			p15.textContent = "We shall have no responsibility or liability for\n                                any content appearing on your Web site. You\n                                agree to indemnify and defend us against all\n                                claims arising out of or based upon your\n                                Website. No link(s) may appear on any page on\n                                your Web site or within any context containing\n                                content or materials that may be interpreted as\n                                libelous, obscene or criminal, or which\n                                infringes, otherwise violates, or advocates the\n                                infringement or other violation of, any third\n                                party rights.";
    			t110 = space();
    			h27 = element("h2");
    			h27.textContent = "Reservation of Rights";
    			t112 = space();
    			p16 = element("p");
    			p16.textContent = "We reserve the right at any time and in its sole\n                                discretion to request that you remove all links\n                                or any particular link to our Web site. You\n                                agree to immediately remove all links to our Web\n                                site upon such request. We also reserve the\n                                right to amend these terms of service and its\n                                linking policy at any time. By continuing to\n                                link to our Web site, you agree to be bound to\n                                and abide by these linking terms of service.";
    			t114 = space();
    			h28 = element("h2");
    			h28.textContent = "Removal of links from our website";
    			t116 = space();
    			p17 = element("p");
    			p17.textContent = "If you find any link on our Web site or any\n                                linked web site objectionable for any reason,\n                                you may contact us about this. We will consider\n                                requests to remove links but will have no\n                                obligation to do so or to respond directly to\n                                you.";
    			t118 = space();
    			p18 = element("p");
    			p18.textContent = "Whilst we endeavour to ensure that the\n                                information on this website is correct, we do\n                                not warrant its completeness or accuracy; nor do\n                                we commit to ensuring that the website remains\n                                available or that the material on the website is\n                                kept up to date.";
    			t120 = space();
    			h29 = element("h2");
    			h29.textContent = "Disclaimer";
    			t122 = space();
    			p19 = element("p");
    			p19.textContent = "To the maximum extent permitted by applicable\n                                law, we exclude all representations, warranties\n                                and conditions relating to our website and the\n                                use of this website (including, without\n                                limitation, any warranties implied by law in\n                                respect of satisfactory quality, fitness for\n                                purpose and/or the use of reasonable care and\n                                skill). Nothing in this disclaimer will:";
    			t124 = space();
    			ol8 = element("ol");
    			li30 = element("li");
    			li30.textContent = "limit or exclude our or your liability for\n                                    death or personal injury resulting from\n                                    negligence;";
    			t126 = space();
    			li31 = element("li");
    			li31.textContent = "limit or exclude our or your liability for\n                                    fraud or fraudulent misrepresentation;";
    			t128 = space();
    			li32 = element("li");
    			li32.textContent = "limit any of our or your liabilities in any\n                                    way that is not permitted under applicable\n                                    law; or";
    			t130 = space();
    			li33 = element("li");
    			li33.textContent = "exclude any of our or your liabilities that\n                                    may not be excluded under applicable law.";
    			t132 = space();
    			p20 = element("p");
    			p20.textContent = "The limitations and exclusions of liability set\n                                out in this Section and elsewhere in this\n                                disclaimer: (a) are subject to the preceding\n                                paragraph; and (b) govern all liabilities\n                                arising under the disclaimer or in relation to\n                                the subject matter of this disclaimer, including\n                                liabilities arising in contract, in tort\n                                (including negligence) and for breach of\n                                statutory duty.";
    			t134 = space();
    			p21 = element("p");
    			p21.textContent = "To the extent that the website and the\n                                information and services on the website are\n                                provided free of charge, we will not be liable\n                                for any loss or damage of any nature.";
    			t136 = space();
    			h210 = element("h2");
    			h210.textContent = "Contact Information";
    			t138 = space();
    			p22 = element("p");
    			p22.textContent = "If you have any queries regarding any of our\n                                terms, please contact us.";
    			t140 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(span, "id", "blackOverlay");
    			attr_dev(span, "class", "w-full h-full absolute opacity-75 bg-black");
    			add_location(span, file$6, 18, 16, 645);
    			attr_dev(div0, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div0, "background-image", "url(https://images.unsplash.com/photo-1586253725765-24073e7f1e62?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)");
    			add_location(div0, file$6, 13, 12, 322);
    			attr_dev(h1, "class", "text-white font-semibold text-5xl");
    			add_location(h1, file$6, 27, 28, 1073);
    			attr_dev(p0, "class", "mt-4 text-lg text-gray-300");
    			add_location(p0, file$6, 30, 28, 1248);
    			attr_dev(div1, "class", "pr-12");
    			add_location(div1, file$6, 26, 24, 1025);
    			attr_dev(div2, "class", "w-full lg:w-6/12 px-4 ml-auto mr-auto text-center");
    			add_location(div2, file$6, 24, 20, 913);
    			attr_dev(div3, "class", "items-center flex flex-wrap");
    			add_location(div3, file$6, 23, 16, 851);
    			attr_dev(div4, "class", "container relative mx-auto");
    			add_location(div4, file$6, 22, 12, 794);
    			attr_dev(polygon, "class", "text-gray-300 fill-current");
    			set_style(polygon, "color", "rgba(255, 255, 255, var(--text-opacity))");
    			attr_dev(polygon, "points", "2560 0 2560 100 0 100");
    			add_location(polygon, file$6, 48, 20, 2008);
    			attr_dev(svg, "class", "absolute bottom-0 overflow-hidden");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 2560 100");
    			attr_dev(svg, "x", "0");
    			attr_dev(svg, "y", "0");
    			add_location(svg, file$6, 40, 16, 1689);
    			attr_dev(div5, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div5, "transform", "translateZ(0)");
    			add_location(div5, file$6, 37, 12, 1500);
    			attr_dev(div6, "class", "relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75");
    			add_location(div6, file$6, 11, 8, 199);
    			attr_dev(h20, "class", "text-4xl font-semibold");
    			add_location(h20, file$6, 60, 24, 2518);
    			add_location(p1, file$6, 62, 28, 2683);
    			add_location(p2, file$6, 68, 28, 2955);
    			add_location(p3, file$6, 75, 28, 3389);
    			add_location(h21, file$6, 101, 28, 5208);
    			add_location(p4, file$6, 102, 28, 5253);
    			add_location(p5, file$6, 108, 28, 5620);
    			add_location(h22, file$6, 118, 28, 6215);
    			add_location(p6, file$6, 119, 28, 6260);
    			add_location(p7, file$6, 129, 28, 6930);
    			add_location(li0, file$6, 131, 32, 7016);
    			add_location(li1, file$6, 135, 32, 7212);
    			add_location(li2, file$6, 139, 32, 7424);
    			add_location(ol0, file$6, 130, 28, 6979);
    			add_location(p8, file$6, 144, 28, 7669);
    			add_location(h23, file$6, 150, 28, 7942);
    			add_location(li3, file$6, 152, 32, 8030);
    			add_location(li4, file$6, 156, 32, 8224);
    			add_location(li5, file$6, 177, 32, 9747);
    			add_location(li6, file$6, 188, 40, 10416);
    			add_location(li7, file$6, 194, 40, 10791);
    			add_location(li8, file$6, 202, 40, 11316);
    			add_location(li9, file$6, 209, 40, 11776);
    			add_location(ol1, file$6, 187, 36, 10371);
    			add_location(li10, file$6, 185, 32, 10262);
    			add_location(strong, file$6, 219, 36, 12338);
    			add_location(li11, file$6, 217, 32, 12241);
    			add_location(ol2, file$6, 151, 28, 7993);
    			add_location(h24, file$6, 226, 28, 12796);
    			add_location(li12, file$6, 232, 40, 13141);
    			add_location(li13, file$6, 233, 40, 13211);
    			add_location(li14, file$6, 234, 40, 13276);
    			add_location(li15, file$6, 235, 40, 13345);
    			add_location(li16, file$6, 243, 40, 13876);
    			add_location(ol3, file$6, 231, 36, 13096);
    			add_location(li17, file$6, 228, 32, 12898);
    			add_location(ol4, file$6, 227, 28, 12861);
    			add_location(li18, file$6, 255, 32, 14553);
    			add_location(li19, file$6, 270, 40, 15551);
    			add_location(li20, file$6, 277, 40, 16011);
    			add_location(li21, file$6, 278, 40, 16085);
    			add_location(li22, file$6, 283, 40, 16393);
    			add_location(li23, file$6, 284, 40, 16473);
    			add_location(li24, file$6, 285, 40, 16540);
    			add_location(li25, file$6, 290, 40, 16842);
    			add_location(ol5, file$6, 269, 36, 15506);
    			add_location(li26, file$6, 265, 32, 15243);
    			attr_dev(ol6, "start", "2");
    			add_location(ol6, file$6, 254, 28, 14506);
    			add_location(p9, file$6, 297, 28, 17172);
    			add_location(p10, file$6, 316, 28, 18474);
    			attr_dev(a, "href", "mailto:contact@thompsondevgroup.com");
    			attr_dev(a, "title", "send an email to contact@thompsondevgroup.com");
    			add_location(a, file$6, 332, 32, 19438);
    			add_location(p11, file$6, 327, 28, 19122);
    			add_location(p12, file$6, 344, 28, 20248);
    			add_location(li27, file$6, 350, 32, 20480);
    			add_location(li28, file$6, 351, 32, 20554);
    			add_location(li29, file$6, 355, 32, 20774);
    			add_location(ol7, file$6, 349, 28, 20443);
    			add_location(p13, file$6, 362, 28, 21186);
    			add_location(h25, file$6, 367, 28, 21474);
    			add_location(p14, file$6, 368, 28, 21519);
    			add_location(h26, file$6, 375, 28, 21947);
    			add_location(p15, file$6, 376, 28, 22002);
    			add_location(h27, file$6, 389, 28, 22887);
    			add_location(p16, file$6, 390, 28, 22946);
    			add_location(h28, file$6, 401, 28, 23716);
    			add_location(p17, file$6, 402, 28, 23787);
    			add_location(p18, file$6, 410, 28, 24275);
    			add_location(h29, file$6, 418, 28, 24779);
    			add_location(p19, file$6, 419, 28, 24827);
    			add_location(li30, file$6, 430, 32, 25543);
    			add_location(li31, file$6, 435, 32, 25821);
    			add_location(li32, file$6, 439, 32, 26050);
    			add_location(li33, file$6, 444, 32, 26328);
    			add_location(ol8, file$6, 429, 28, 25506);
    			add_location(p20, file$6, 449, 28, 26591);
    			add_location(p21, file$6, 460, 28, 27315);
    			add_location(h210, file$6, 466, 28, 27676);
    			add_location(p22, file$6, 467, 28, 27733);
    			attr_dev(div7, "class", "text-lg leading-relaxed m-4 text-gray-600");
    			add_location(div7, file$6, 61, 24, 2599);
    			attr_dev(div8, "class", "w-full lg:w-6/12 px-4");
    			add_location(div8, file$6, 59, 20, 2458);
    			attr_dev(div9, "class", "flex flex-wrap justify-center text-center mb-24");
    			add_location(div9, file$6, 58, 16, 2376);
    			attr_dev(div10, "class", "container mx-auto px-4");
    			add_location(div10, file$6, 57, 12, 2323);
    			attr_dev(section, "class", "pt-20 pb-48");
    			add_location(section, file$6, 56, 8, 2281);
    			add_location(main, file$6, 10, 4, 184);
    			add_location(div11, file$6, 9, 0, 174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, main);
    			append_dev(main, div6);
    			append_dev(div6, div0);
    			append_dev(div0, span);
    			append_dev(div6, t0);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, svg);
    			append_dev(svg, polygon);
    			append_dev(main, t5);
    			append_dev(main, section);
    			append_dev(section, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h20);
    			append_dev(div8, t7);
    			append_dev(div8, div7);
    			append_dev(div7, p1);
    			append_dev(div7, t9);
    			append_dev(div7, p2);
    			append_dev(div7, t11);
    			append_dev(div7, p3);
    			append_dev(div7, t13);
    			append_dev(div7, h21);
    			append_dev(div7, t15);
    			append_dev(div7, p4);
    			append_dev(div7, t17);
    			append_dev(div7, p5);
    			append_dev(div7, t19);
    			append_dev(div7, h22);
    			append_dev(div7, t21);
    			append_dev(div7, p6);
    			append_dev(div7, t23);
    			append_dev(div7, p7);
    			append_dev(div7, t25);
    			append_dev(div7, ol0);
    			append_dev(ol0, li0);
    			append_dev(ol0, t27);
    			append_dev(ol0, li1);
    			append_dev(ol0, t29);
    			append_dev(ol0, li2);
    			append_dev(div7, t31);
    			append_dev(div7, p8);
    			append_dev(div7, t33);
    			append_dev(div7, h23);
    			append_dev(div7, t35);
    			append_dev(div7, ol2);
    			append_dev(ol2, li3);
    			append_dev(ol2, t37);
    			append_dev(ol2, li4);
    			append_dev(ol2, t39);
    			append_dev(ol2, li5);
    			append_dev(ol2, t41);
    			append_dev(ol2, li10);
    			append_dev(li10, t42);
    			append_dev(li10, ol1);
    			append_dev(ol1, li6);
    			append_dev(ol1, t44);
    			append_dev(ol1, li7);
    			append_dev(ol1, t46);
    			append_dev(ol1, li8);
    			append_dev(ol1, t48);
    			append_dev(ol1, li9);
    			append_dev(ol2, t50);
    			append_dev(ol2, li11);
    			append_dev(li11, t51);
    			append_dev(li11, strong);
    			append_dev(li11, t53);
    			append_dev(div7, t54);
    			append_dev(div7, h24);
    			append_dev(div7, t56);
    			append_dev(div7, ol4);
    			append_dev(ol4, li17);
    			append_dev(li17, t57);
    			append_dev(li17, ol3);
    			append_dev(ol3, li12);
    			append_dev(ol3, t59);
    			append_dev(ol3, li13);
    			append_dev(ol3, t61);
    			append_dev(ol3, li14);
    			append_dev(ol3, t63);
    			append_dev(ol3, li15);
    			append_dev(ol3, t65);
    			append_dev(ol3, li16);
    			append_dev(div7, t67);
    			append_dev(div7, ol6);
    			append_dev(ol6, li18);
    			append_dev(ol6, t69);
    			append_dev(ol6, li26);
    			append_dev(li26, t70);
    			append_dev(li26, ol5);
    			append_dev(ol5, li19);
    			append_dev(ol5, t72);
    			append_dev(ol5, li20);
    			append_dev(ol5, t74);
    			append_dev(ol5, li21);
    			append_dev(ol5, t76);
    			append_dev(ol5, li22);
    			append_dev(ol5, t78);
    			append_dev(ol5, li23);
    			append_dev(ol5, t80);
    			append_dev(ol5, li24);
    			append_dev(ol5, t82);
    			append_dev(ol5, li25);
    			append_dev(div7, t84);
    			append_dev(div7, p9);
    			append_dev(div7, t86);
    			append_dev(div7, p10);
    			append_dev(div7, t88);
    			append_dev(div7, p11);
    			append_dev(p11, t89);
    			append_dev(p11, a);
    			append_dev(p11, t91);
    			append_dev(div7, t92);
    			append_dev(div7, p12);
    			append_dev(div7, t94);
    			append_dev(div7, ol7);
    			append_dev(ol7, li27);
    			append_dev(ol7, t96);
    			append_dev(ol7, li28);
    			append_dev(ol7, t98);
    			append_dev(ol7, li29);
    			append_dev(div7, t100);
    			append_dev(div7, p13);
    			append_dev(div7, t102);
    			append_dev(div7, h25);
    			append_dev(div7, t104);
    			append_dev(div7, p14);
    			append_dev(div7, t106);
    			append_dev(div7, h26);
    			append_dev(div7, t108);
    			append_dev(div7, p15);
    			append_dev(div7, t110);
    			append_dev(div7, h27);
    			append_dev(div7, t112);
    			append_dev(div7, p16);
    			append_dev(div7, t114);
    			append_dev(div7, h28);
    			append_dev(div7, t116);
    			append_dev(div7, p17);
    			append_dev(div7, t118);
    			append_dev(div7, p18);
    			append_dev(div7, t120);
    			append_dev(div7, h29);
    			append_dev(div7, t122);
    			append_dev(div7, p19);
    			append_dev(div7, t124);
    			append_dev(div7, ol8);
    			append_dev(ol8, li30);
    			append_dev(ol8, t126);
    			append_dev(ol8, li31);
    			append_dev(ol8, t128);
    			append_dev(ol8, li32);
    			append_dev(ol8, t130);
    			append_dev(ol8, li33);
    			append_dev(div7, t132);
    			append_dev(div7, p20);
    			append_dev(div7, t134);
    			append_dev(div7, p21);
    			append_dev(div7, t136);
    			append_dev(div7, h210);
    			append_dev(div7, t138);
    			append_dev(div7, p22);
    			append_dev(div11, t140);
    			mount_component(footer, div11, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Terms", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Terms> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link, Footer });
    	return [];
    }

    class Terms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Terms",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/views/Error.svelte generated by Svelte v3.26.0 */

    const { Error: Error_1 } = globals;
    const file$7 = "src/views/Error.svelte";

    function create_fragment$9(ctx) {
    	let meta;
    	let link;
    	let t0;
    	let div2;
    	let section;
    	let div1;
    	let div0;
    	let svg;
    	let defs;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let path;
    	let t1;
    	let h2;
    	let t3;
    	let p;
    	let t5;
    	let a;

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			link = element("link");
    			t0 = space();
    			div2 = element("div");
    			section = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			path = svg_element("path");
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "We are sorry, Page not found!";
    			t3 = space();
    			p = element("p");
    			p.textContent = "The page you are looking for might have been removed had its\n                name changed or is temporarily unavailable.";
    			t5 = space();
    			a = element("a");
    			a.textContent = "Back To Homepage";
    			document.title = "The page you were looking for doesn't exist (404)";
    			attr_dev(meta, "name", "viewport");
    			attr_dev(meta, "content", "width=device-width,initial-scale=1");
    			add_location(meta, file$7, 8, 4, 147);
    			attr_dev(link, "href", "https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$7, 9, 4, 221);
    			attr_dev(stop0, "offset", "0%");
    			set_style(stop0, "stop-color", "rgb(98,179,237)");
    			set_style(stop0, "stop-opacity", "1");
    			add_location(stop0, file$7, 28, 28, 965);
    			attr_dev(stop1, "offset", "100%");
    			set_style(stop1, "stop-color", "rgb(245,101,101)");
    			set_style(stop1, "stop-opacity", "1");
    			add_location(stop1, file$7, 31, 28, 1128);
    			attr_dev(linearGradient, "id", "grad2");
    			attr_dev(linearGradient, "x1", "0%");
    			attr_dev(linearGradient, "y1", "0%");
    			attr_dev(linearGradient, "x2", "0%");
    			attr_dev(linearGradient, "y2", "100%");
    			add_location(linearGradient, file$7, 22, 24, 735);
    			add_location(defs, file$7, 21, 20, 704);
    			attr_dev(path, "d", "M137.587 154.953h-22.102V197h-37.6v-42.047H.53v-33.557L72.36 2.803h43.125V124.9h22.102v30.053zM77.886 124.9V40.537L28.966 124.9h48.92zm116.707-23.718c0 22.46 1.842 39.643 5.525 51.547 3.684 11.905 11.23 17.857 22.64 17.857 11.411 0 18.89-5.952 22.44-17.857 3.548-11.904 5.323-29.086 5.323-51.547 0-23.54-1.775-40.97-5.324-52.29s-11.028-16.98-22.438-16.98c-11.41 0-18.957 5.66-22.64 16.98-3.684 11.32-5.526 28.75-5.526 52.29zM222.759.242c24.887 0 42.339 8.76 52.356 26.28 10.018 17.52 15.027 42.406 15.027 74.66s-5.01 57.095-15.027 74.525c-10.017 17.43-27.47 26.145-52.356 26.145-24.887 0-42.339-8.715-52.357-26.145-10.017-17.43-15.026-42.271-15.026-74.525 0-32.254 5.009-57.14 15.026-74.66C180.42 9.001 197.872.241 222.76.241zm221.824 154.711h-22.102V197h-37.6v-42.047h-77.355v-33.557l71.83-118.593h43.125V124.9h22.102v30.053zM384.882 124.9V40.537l-48.92 84.363h48.92z");
    			attr_dev(path, "fill-rule", "nonzero");
    			attr_dev(path, "fill", "url(#grad2)");
    			add_location(path, file$7, 36, 20, 1356);
    			attr_dev(svg, "class", "fill-current text-gray-300");
    			attr_dev(svg, "viewBox", "0 0 445 202");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$7, 17, 16, 526);
    			attr_dev(div0, "class", "md:max-w-lg mx-auto");
    			add_location(div0, file$7, 16, 12, 476);
    			attr_dev(h2, "class", "mt-8 uppercase text-xl lg:text-5xl font-black");
    			add_location(h2, file$7, 42, 12, 2403);
    			attr_dev(p, "class", "mt-6 uppercase text-sm lg:text-base text-gray-900");
    			add_location(p, file$7, 45, 12, 2538);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "mt-6 bg-blue-500 hover:bg-blue-700 text-white font-light py-4 px-6 rounded-full inline-block uppercase shadow-md");
    			set_style(a, "background", "rgb(98,179,237)");
    			add_location(a, file$7, 49, 12, 2766);
    			attr_dev(div1, "class", "max-w-auto mx-auto");
    			add_location(div1, file$7, 15, 8, 431);
    			attr_dev(section, "class", "py-8 px-4 text-center svelte-whj3hi");
    			add_location(section, file$7, 14, 4, 383);
    			attr_dev(div2, "class", "container mx-auto px-4");
    			add_location(div2, file$7, 13, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta);
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, section);
    			append_dev(section, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(svg, path);
    			append_dev(div1, t1);
    			append_dev(div1, h2);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(div1, t5);
    			append_dev(div1, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Error", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.26.0 */

    // (14:0) <Router {url}>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let current;

    	route0 = new Route({
    			props: { path: "terms", component: Terms },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "privacy", component: Privacy },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "/", component: Index },
    			$$inline: true
    		});

    	route3 = new Route({
    			props: { path: "*", component: Error$1 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = text("\n  ]\n  ");
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:0) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Index,
    		Privacy,
    		Terms,
    		ErrorPage: Error$1,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.getElementById("app")
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
