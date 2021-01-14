
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
    	let ul2;
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
    	let t10;
    	let li15;
    	let a6;
    	let t12;
    	let ul1;
    	let li5;
    	let a7;
    	let t14;
    	let li11;
    	let a8;
    	let t16;
    	let ul0;
    	let li6;
    	let a9;
    	let t18;
    	let li7;
    	let a10;
    	let t20;
    	let li8;
    	let a11;
    	let t22;
    	let li9;
    	let a12;
    	let t24;
    	let li10;
    	let a13;
    	let t26;
    	let li12;
    	let a14;
    	let t28;
    	let li13;
    	let a15;
    	let t30;
    	let li14;
    	let a16;
    	let t32;
    	let li16;
    	let a17;
    	let t34;
    	let a18;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			h1 = element("h1");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			nav = element("nav");
    			ul2 = element("ul");
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
    			a5.textContent = "Pricing";
    			t10 = space();
    			li15 = element("li");
    			a6 = element("a");
    			a6.textContent = "Drop Down";
    			t12 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			a7 = element("a");
    			a7.textContent = "Drop Down 1";
    			t14 = space();
    			li11 = element("li");
    			a8 = element("a");
    			a8.textContent = "Deep Drop Down";
    			t16 = space();
    			ul0 = element("ul");
    			li6 = element("li");
    			a9 = element("a");
    			a9.textContent = "Deep Drop Down 1";
    			t18 = space();
    			li7 = element("li");
    			a10 = element("a");
    			a10.textContent = "Deep Drop Down 2";
    			t20 = space();
    			li8 = element("li");
    			a11 = element("a");
    			a11.textContent = "Deep Drop Down 3";
    			t22 = space();
    			li9 = element("li");
    			a12 = element("a");
    			a12.textContent = "Deep Drop Down 4";
    			t24 = space();
    			li10 = element("li");
    			a13 = element("a");
    			a13.textContent = "Deep Drop Down 5";
    			t26 = space();
    			li12 = element("li");
    			a14 = element("a");
    			a14.textContent = "Drop Down 2";
    			t28 = space();
    			li13 = element("li");
    			a15 = element("a");
    			a15.textContent = "Drop Down 3";
    			t30 = space();
    			li14 = element("li");
    			a16 = element("a");
    			a16.textContent = "Drop Down 4";
    			t32 = space();
    			li16 = element("li");
    			a17 = element("a");
    			a17.textContent = "Contact";
    			t34 = space();
    			a18 = element("a");
    			a18.textContent = "Get Started";
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
    			attr_dev(a5, "href", "#pricing");
    			add_location(a5, file$1, 17, 12, 535);
    			add_location(li4, file$1, 17, 8, 531);
    			attr_dev(a6, "href", "");
    			add_location(a6, file$1, 19, 10, 612);
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$1, 21, 16, 668);
    			add_location(li5, file$1, 21, 12, 664);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$1, 23, 14, 750);
    			attr_dev(a9, "href", "#");
    			add_location(a9, file$1, 25, 20, 820);
    			add_location(li6, file$1, 25, 16, 816);
    			attr_dev(a10, "href", "#");
    			add_location(a10, file$1, 26, 20, 878);
    			add_location(li7, file$1, 26, 16, 874);
    			attr_dev(a11, "href", "#");
    			add_location(a11, file$1, 27, 20, 936);
    			add_location(li8, file$1, 27, 16, 932);
    			attr_dev(a12, "href", "#");
    			add_location(a12, file$1, 28, 20, 994);
    			add_location(li9, file$1, 28, 16, 990);
    			attr_dev(a13, "href", "#");
    			add_location(a13, file$1, 29, 20, 1052);
    			add_location(li10, file$1, 29, 16, 1048);
    			add_location(ul0, file$1, 24, 14, 795);
    			attr_dev(li11, "class", "drop-down");
    			add_location(li11, file$1, 22, 12, 713);
    			attr_dev(a14, "href", "#");
    			add_location(a14, file$1, 32, 16, 1144);
    			add_location(li12, file$1, 32, 12, 1140);
    			attr_dev(a15, "href", "#");
    			add_location(a15, file$1, 33, 16, 1193);
    			add_location(li13, file$1, 33, 12, 1189);
    			attr_dev(a16, "href", "#");
    			add_location(a16, file$1, 34, 16, 1242);
    			add_location(li14, file$1, 34, 12, 1238);
    			add_location(ul1, file$1, 20, 10, 647);
    			attr_dev(li15, "class", "drop-down");
    			add_location(li15, file$1, 18, 8, 579);
    			attr_dev(a17, "href", "#contact");
    			add_location(a17, file$1, 37, 12, 1317);
    			add_location(li16, file$1, 37, 8, 1313);
    			add_location(ul2, file$1, 12, 6, 320);
    			attr_dev(nav, "class", "nav-menu d-none d-lg-block");
    			add_location(nav, file$1, 11, 4, 273);
    			attr_dev(a18, "href", "#about");
    			attr_dev(a18, "class", "get-started-btn scrollto");
    			add_location(a18, file$1, 40, 4, 1380);
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
    			append_dev(nav, ul2);
    			append_dev(ul2, li0);
    			append_dev(li0, a1);
    			append_dev(ul2, t2);
    			append_dev(ul2, li1);
    			append_dev(li1, a2);
    			append_dev(ul2, t4);
    			append_dev(ul2, li2);
    			append_dev(li2, a3);
    			append_dev(ul2, t6);
    			append_dev(ul2, li3);
    			append_dev(li3, a4);
    			append_dev(ul2, t8);
    			append_dev(ul2, li4);
    			append_dev(li4, a5);
    			append_dev(ul2, t10);
    			append_dev(ul2, li15);
    			append_dev(li15, a6);
    			append_dev(li15, t12);
    			append_dev(li15, ul1);
    			append_dev(ul1, li5);
    			append_dev(li5, a7);
    			append_dev(ul1, t14);
    			append_dev(ul1, li11);
    			append_dev(li11, a8);
    			append_dev(li11, t16);
    			append_dev(li11, ul0);
    			append_dev(ul0, li6);
    			append_dev(li6, a9);
    			append_dev(ul0, t18);
    			append_dev(ul0, li7);
    			append_dev(li7, a10);
    			append_dev(ul0, t20);
    			append_dev(ul0, li8);
    			append_dev(li8, a11);
    			append_dev(ul0, t22);
    			append_dev(ul0, li9);
    			append_dev(li9, a12);
    			append_dev(ul0, t24);
    			append_dev(ul0, li10);
    			append_dev(li10, a13);
    			append_dev(ul1, t26);
    			append_dev(ul1, li12);
    			append_dev(li12, a14);
    			append_dev(ul1, t28);
    			append_dev(ul1, li13);
    			append_dev(li13, a15);
    			append_dev(ul1, t30);
    			append_dev(ul1, li14);
    			append_dev(li14, a16);
    			append_dev(ul2, t32);
    			append_dev(ul2, li16);
    			append_dev(li16, a17);
    			append_dev(div, t34);
    			append_dev(div, a18);
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
    	let t2;
    	let br1;
    	let br2;
    	let t3;
    	let strong0;
    	let t5;
    	let br3;
    	let t6;
    	let div1;
    	let h40;
    	let t8;
    	let ul0;
    	let li0;
    	let i0;
    	let t9;
    	let a0;
    	let t11;
    	let li1;
    	let i1;
    	let t12;
    	let a1;
    	let t14;
    	let li2;
    	let i2;
    	let t15;
    	let a2;
    	let t17;
    	let li3;
    	let i3;
    	let t18;
    	let a3;
    	let t20;
    	let li4;
    	let i4;
    	let t21;
    	let a4;
    	let t23;
    	let div2;
    	let h41;
    	let t25;
    	let ul1;
    	let li5;
    	let i5;
    	let t26;
    	let a5;
    	let t28;
    	let li6;
    	let i6;
    	let t29;
    	let a6;
    	let t31;
    	let li7;
    	let i7;
    	let t32;
    	let a7;
    	let t34;
    	let li8;
    	let i8;
    	let t35;
    	let a8;
    	let t37;
    	let li9;
    	let i9;
    	let t38;
    	let a9;
    	let t40;
    	let div3;
    	let h42;
    	let t42;
    	let p1;
    	let t44;
    	let form;
    	let input0;
    	let input1;
    	let t45;
    	let div11;
    	let div9;
    	let div7;
    	let t46;
    	let t47;
    	let strong1;
    	let span;
    	let t49;
    	let t50;
    	let div8;
    	let t51;
    	let a10;
    	let t53;
    	let div10;
    	let a11;
    	let i10;
    	let t54;
    	let a12;
    	let i11;
    	let t55;
    	let a13;
    	let i12;
    	let t56;
    	let a14;
    	let i13;
    	let t57;
    	let a15;
    	let i14;

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
    			t1 = text("Madison, WI 53713");
    			br0 = element("br");
    			t2 = text("\n            United States\n            ");
    			br1 = element("br");
    			br2 = element("br");
    			t3 = space();
    			strong0 = element("strong");
    			strong0.textContent = "Email:";
    			t5 = text("\n            contact@thompsondevgroup.com");
    			br3 = element("br");
    			t6 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Useful Links";
    			t8 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			i0 = element("i");
    			t9 = space();
    			a0 = element("a");
    			a0.textContent = "Home";
    			t11 = space();
    			li1 = element("li");
    			i1 = element("i");
    			t12 = space();
    			a1 = element("a");
    			a1.textContent = "About us";
    			t14 = space();
    			li2 = element("li");
    			i2 = element("i");
    			t15 = space();
    			a2 = element("a");
    			a2.textContent = "Services";
    			t17 = space();
    			li3 = element("li");
    			i3 = element("i");
    			t18 = space();
    			a3 = element("a");
    			a3.textContent = "Terms of service";
    			t20 = space();
    			li4 = element("li");
    			i4 = element("i");
    			t21 = space();
    			a4 = element("a");
    			a4.textContent = "Privacy policy";
    			t23 = space();
    			div2 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Our Services";
    			t25 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			i5 = element("i");
    			t26 = space();
    			a5 = element("a");
    			a5.textContent = "Automation Testing";
    			t28 = space();
    			li6 = element("li");
    			i6 = element("i");
    			t29 = space();
    			a6 = element("a");
    			a6.textContent = "Web Development";
    			t31 = space();
    			li7 = element("li");
    			i7 = element("i");
    			t32 = space();
    			a7 = element("a");
    			a7.textContent = "Product Management";
    			t34 = space();
    			li8 = element("li");
    			i8 = element("i");
    			t35 = space();
    			a8 = element("a");
    			a8.textContent = "Marketing";
    			t37 = space();
    			li9 = element("li");
    			i9 = element("i");
    			t38 = space();
    			a9 = element("a");
    			a9.textContent = "Graphic Design";
    			t40 = space();
    			div3 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Join Our Newsletter";
    			t42 = space();
    			p1 = element("p");
    			p1.textContent = "Keep up to date with holiday sales, new products, services and so\n            much more!";
    			t44 = space();
    			form = element("form");
    			input0 = element("input");
    			input1 = element("input");
    			t45 = space();
    			div11 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			t46 = text(/*date*/ ctx[0]);
    			t47 = text("\n        ©\n        ");
    			strong1 = element("strong");
    			span = element("span");
    			span.textContent = "Thompson Development Group LLC";
    			t49 = text(". All Rights\n        Reserved");
    			t50 = space();
    			div8 = element("div");
    			t51 = text("Designed by\n        ");
    			a10 = element("a");
    			a10.textContent = "Thompson Development Group";
    			t53 = space();
    			div10 = element("div");
    			a11 = element("a");
    			i10 = element("i");
    			t54 = space();
    			a12 = element("a");
    			i11 = element("i");
    			t55 = space();
    			a13 = element("a");
    			i12 = element("i");
    			t56 = space();
    			a14 = element("a");
    			i13 = element("i");
    			t57 = space();
    			a15 = element("a");
    			i14 = element("i");
    			attr_dev(img, "class", "footer-logo");
    			if (img.src !== (img_src_value = "/assets/img/blue.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Thompson Logo");
    			add_location(img, file$2, 13, 10, 287);
    			add_location(br0, file$2, 18, 29, 441);
    			add_location(br1, file$2, 20, 12, 486);
    			add_location(br2, file$2, 20, 18, 492);
    			add_location(strong0, file$2, 21, 12, 511);
    			add_location(br3, file$2, 22, 40, 575);
    			add_location(p0, file$2, 17, 10, 408);
    			attr_dev(div0, "class", "col-lg-3 col-md-6 footer-contact");
    			add_location(div0, file$2, 12, 8, 230);
    			add_location(h40, file$2, 27, 10, 676);
    			attr_dev(i0, "class", "bx bx-chevron-right");
    			add_location(i0, file$2, 29, 16, 729);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$2, 29, 50, 763);
    			add_location(li0, file$2, 29, 12, 725);
    			attr_dev(i1, "class", "bx bx-chevron-right");
    			add_location(i1, file$2, 31, 14, 820);
    			attr_dev(a1, "href", "/#about");
    			add_location(a1, file$2, 32, 14, 868);
    			add_location(li1, file$2, 30, 12, 801);
    			attr_dev(i2, "class", "bx bx-chevron-right");
    			add_location(i2, file$2, 35, 14, 948);
    			attr_dev(a2, "href", "/#services");
    			add_location(a2, file$2, 36, 14, 996);
    			add_location(li2, file$2, 34, 12, 929);
    			attr_dev(i3, "class", "bx bx-chevron-right");
    			add_location(i3, file$2, 39, 14, 1079);
    			attr_dev(a3, "href", "/terms");
    			add_location(a3, file$2, 40, 14, 1127);
    			add_location(li3, file$2, 38, 12, 1060);
    			attr_dev(i4, "class", "bx bx-chevron-right");
    			add_location(i4, file$2, 43, 14, 1214);
    			attr_dev(a4, "href", "/privacy");
    			add_location(a4, file$2, 44, 14, 1262);
    			add_location(li4, file$2, 42, 12, 1195);
    			add_location(ul0, file$2, 28, 10, 708);
    			attr_dev(div1, "class", "col-lg-2 col-md-6 footer-links");
    			add_location(div1, file$2, 26, 8, 621);
    			add_location(h41, file$2, 50, 10, 1413);
    			attr_dev(i5, "class", "bx bx-chevron-right");
    			add_location(i5, file$2, 53, 14, 1481);
    			attr_dev(a5, "href", "#");
    			add_location(a5, file$2, 54, 14, 1529);
    			add_location(li5, file$2, 52, 12, 1462);
    			attr_dev(i6, "class", "bx bx-chevron-right");
    			add_location(i6, file$2, 57, 14, 1613);
    			attr_dev(a6, "href", "#");
    			add_location(a6, file$2, 58, 14, 1661);
    			add_location(li6, file$2, 56, 12, 1594);
    			attr_dev(i7, "class", "bx bx-chevron-right");
    			add_location(i7, file$2, 61, 14, 1742);
    			attr_dev(a7, "href", "#");
    			add_location(a7, file$2, 62, 14, 1790);
    			add_location(li7, file$2, 60, 12, 1723);
    			attr_dev(i8, "class", "bx bx-chevron-right");
    			add_location(i8, file$2, 64, 16, 1859);
    			attr_dev(a8, "href", "#");
    			add_location(a8, file$2, 64, 50, 1893);
    			add_location(li8, file$2, 64, 12, 1855);
    			attr_dev(i9, "class", "bx bx-chevron-right");
    			add_location(i9, file$2, 66, 14, 1955);
    			attr_dev(a9, "href", "#");
    			add_location(a9, file$2, 67, 14, 2003);
    			add_location(li9, file$2, 65, 12, 1936);
    			add_location(ul1, file$2, 51, 10, 1445);
    			attr_dev(div2, "class", "col-lg-3 col-md-6 footer-links");
    			add_location(div2, file$2, 49, 8, 1358);
    			add_location(h42, file$2, 73, 10, 2152);
    			add_location(p1, file$2, 74, 10, 2191);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "name", "email");
    			add_location(input0, file$2, 79, 12, 2364);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Subscribe";
    			add_location(input1, file$2, 79, 47, 2399);
    			attr_dev(form, "action", "");
    			attr_dev(form, "method", "post");
    			add_location(form, file$2, 78, 10, 2321);
    			attr_dev(div3, "class", "col-lg-4 col-md-6 footer-newsletter");
    			add_location(div3, file$2, 72, 8, 2092);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$2, 11, 6, 204);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$2, 10, 4, 174);
    			attr_dev(div6, "class", "footer-top");
    			add_location(div6, file$2, 9, 2, 145);
    			add_location(span, file$2, 93, 16, 2708);
    			add_location(strong1, file$2, 93, 8, 2700);
    			attr_dev(div7, "class", "copyright");
    			add_location(div7, file$2, 90, 6, 2638);
    			attr_dev(a10, "href", "https://www.thompsondevgroup.com/");
    			add_location(a10, file$2, 98, 8, 2859);
    			attr_dev(div8, "class", "credits");
    			add_location(div8, file$2, 96, 6, 2809);
    			attr_dev(div9, "class", "me-md-auto text-center text-md-start");
    			add_location(div9, file$2, 89, 4, 2581);
    			attr_dev(i10, "class", "bx bxl-twitter");
    			add_location(i10, file$2, 102, 34, 3062);
    			attr_dev(a11, "href", "#");
    			attr_dev(a11, "class", "twitter");
    			add_location(a11, file$2, 102, 6, 3034);
    			attr_dev(i11, "class", "bx bxl-facebook");
    			add_location(i11, file$2, 103, 35, 3130);
    			attr_dev(a12, "href", "#");
    			attr_dev(a12, "class", "facebook");
    			add_location(a12, file$2, 103, 6, 3101);
    			attr_dev(i12, "class", "bx bxl-instagram");
    			add_location(i12, file$2, 104, 36, 3200);
    			attr_dev(a13, "href", "#");
    			attr_dev(a13, "class", "instagram");
    			add_location(a13, file$2, 104, 6, 3170);
    			attr_dev(i13, "class", "bx bxl-skype");
    			add_location(i13, file$2, 105, 38, 3273);
    			attr_dev(a14, "href", "#");
    			attr_dev(a14, "class", "google-plus");
    			add_location(a14, file$2, 105, 6, 3241);
    			attr_dev(i14, "class", "bx bxl-linkedin");
    			add_location(i14, file$2, 106, 35, 3339);
    			attr_dev(a15, "href", "#");
    			attr_dev(a15, "class", "linkedin");
    			add_location(a15, file$2, 106, 6, 3310);
    			attr_dev(div10, "class", "social-links text-center text-md-right pt-3 pt-md-0");
    			add_location(div10, file$2, 101, 4, 2962);
    			attr_dev(div11, "class", "container d-md-flex py-4");
    			add_location(div11, file$2, 88, 2, 2538);
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
    			append_dev(p0, t2);
    			append_dev(p0, br1);
    			append_dev(p0, br2);
    			append_dev(p0, t3);
    			append_dev(p0, strong0);
    			append_dev(p0, t5);
    			append_dev(p0, br3);
    			append_dev(div4, t6);
    			append_dev(div4, div1);
    			append_dev(div1, h40);
    			append_dev(div1, t8);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, i0);
    			append_dev(li0, t9);
    			append_dev(li0, a0);
    			append_dev(ul0, t11);
    			append_dev(ul0, li1);
    			append_dev(li1, i1);
    			append_dev(li1, t12);
    			append_dev(li1, a1);
    			append_dev(ul0, t14);
    			append_dev(ul0, li2);
    			append_dev(li2, i2);
    			append_dev(li2, t15);
    			append_dev(li2, a2);
    			append_dev(ul0, t17);
    			append_dev(ul0, li3);
    			append_dev(li3, i3);
    			append_dev(li3, t18);
    			append_dev(li3, a3);
    			append_dev(ul0, t20);
    			append_dev(ul0, li4);
    			append_dev(li4, i4);
    			append_dev(li4, t21);
    			append_dev(li4, a4);
    			append_dev(div4, t23);
    			append_dev(div4, div2);
    			append_dev(div2, h41);
    			append_dev(div2, t25);
    			append_dev(div2, ul1);
    			append_dev(ul1, li5);
    			append_dev(li5, i5);
    			append_dev(li5, t26);
    			append_dev(li5, a5);
    			append_dev(ul1, t28);
    			append_dev(ul1, li6);
    			append_dev(li6, i6);
    			append_dev(li6, t29);
    			append_dev(li6, a6);
    			append_dev(ul1, t31);
    			append_dev(ul1, li7);
    			append_dev(li7, i7);
    			append_dev(li7, t32);
    			append_dev(li7, a7);
    			append_dev(ul1, t34);
    			append_dev(ul1, li8);
    			append_dev(li8, i8);
    			append_dev(li8, t35);
    			append_dev(li8, a8);
    			append_dev(ul1, t37);
    			append_dev(ul1, li9);
    			append_dev(li9, i9);
    			append_dev(li9, t38);
    			append_dev(li9, a9);
    			append_dev(div4, t40);
    			append_dev(div4, div3);
    			append_dev(div3, h42);
    			append_dev(div3, t42);
    			append_dev(div3, p1);
    			append_dev(div3, t44);
    			append_dev(div3, form);
    			append_dev(form, input0);
    			append_dev(form, input1);
    			append_dev(footer, t45);
    			append_dev(footer, div11);
    			append_dev(div11, div9);
    			append_dev(div9, div7);
    			append_dev(div7, t46);
    			append_dev(div7, t47);
    			append_dev(div7, strong1);
    			append_dev(strong1, span);
    			append_dev(div7, t49);
    			append_dev(div9, t50);
    			append_dev(div9, div8);
    			append_dev(div8, t51);
    			append_dev(div8, a10);
    			append_dev(div11, t53);
    			append_dev(div11, div10);
    			append_dev(div10, a11);
    			append_dev(a11, i10);
    			append_dev(div10, t54);
    			append_dev(div10, a12);
    			append_dev(a12, i11);
    			append_dev(div10, t55);
    			append_dev(div10, a13);
    			append_dev(a13, i12);
    			append_dev(div10, t56);
    			append_dev(div10, a14);
    			append_dev(a14, i13);
    			append_dev(div10, t57);
    			append_dev(div10, a15);
    			append_dev(a15, i14);
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
    			h2.textContent = "We are team of talanted professions making apps, websites and\n            products take off!";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Get Started";
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
    			add_location(img, file$3, 10, 8, 440);
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
    	let a0;
    	let t6;
    	let i0;
    	let t7;
    	let div8;
    	let div7;
    	let div6;
    	let div2;
    	let i1;
    	let t8;
    	let h40;
    	let t10;
    	let p1;
    	let t12;
    	let div3;
    	let i2;
    	let t13;
    	let h41;
    	let t15;
    	let p2;
    	let t17;
    	let div4;
    	let i3;
    	let t18;
    	let h42;
    	let t20;
    	let p3;
    	let t22;
    	let div5;
    	let i4;
    	let t23;
    	let h43;
    	let t25;
    	let p4;
    	let t27;
    	let section1;
    	let div18;
    	let div17;
    	let div11;
    	let img0;
    	let img0_src_value;
    	let t28;
    	let div12;
    	let img1;
    	let img1_src_value;
    	let t29;
    	let div13;
    	let img2;
    	let img2_src_value;
    	let t30;
    	let div14;
    	let img3;
    	let img3_src_value;
    	let t31;
    	let div15;
    	let img4;
    	let img4_src_value;
    	let t32;
    	let div16;
    	let img5;
    	let img5_src_value;
    	let t33;
    	let section2;
    	let div32;
    	let div19;
    	let h20;
    	let t35;
    	let p5;
    	let t37;
    	let div22;
    	let div20;
    	let img6;
    	let img6_src_value;
    	let t38;
    	let div21;
    	let h31;
    	let t40;
    	let p6;
    	let t42;
    	let ul0;
    	let li0;
    	let i5;
    	let t43;
    	let t44;
    	let li1;
    	let i6;
    	let t45;
    	let t46;
    	let li2;
    	let i7;
    	let t47;
    	let t48;
    	let div25;
    	let div23;
    	let img7;
    	let img7_src_value;
    	let t49;
    	let div24;
    	let h32;
    	let t51;
    	let p7;
    	let t53;
    	let p8;
    	let t55;
    	let div28;
    	let div26;
    	let img8;
    	let img8_src_value;
    	let t56;
    	let div27;
    	let h33;
    	let t58;
    	let p9;
    	let t60;
    	let ul1;
    	let li3;
    	let i8;
    	let t61;
    	let t62;
    	let li4;
    	let i9;
    	let t63;
    	let t64;
    	let li5;
    	let i10;
    	let t65;
    	let t66;
    	let div31;
    	let div29;
    	let img9;
    	let img9_src_value;
    	let t67;
    	let div30;
    	let h34;
    	let t69;
    	let p10;
    	let t71;
    	let p11;
    	let t73;
    	let section3;
    	let div40;
    	let div39;
    	let div33;
    	let span0;
    	let t75;
    	let h44;
    	let t77;
    	let p12;
    	let t79;
    	let div34;
    	let span1;
    	let t81;
    	let h45;
    	let t83;
    	let p13;
    	let t85;
    	let div35;
    	let span2;
    	let t87;
    	let h46;
    	let t89;
    	let p14;
    	let t91;
    	let div36;
    	let span3;
    	let t93;
    	let h47;
    	let t95;
    	let p15;
    	let t97;
    	let div37;
    	let span4;
    	let t99;
    	let h48;
    	let t101;
    	let p16;
    	let t103;
    	let div38;
    	let span5;
    	let t105;
    	let h49;
    	let t107;
    	let p17;
    	let t109;
    	let section4;
    	let div55;
    	let div41;
    	let h21;
    	let t111;
    	let p18;
    	let t113;
    	let div54;
    	let div44;
    	let div43;
    	let div42;
    	let i11;
    	let t114;
    	let h410;
    	let a1;
    	let t116;
    	let p19;
    	let t118;
    	let div47;
    	let div46;
    	let div45;
    	let i12;
    	let t119;
    	let h411;
    	let a2;
    	let t121;
    	let p20;
    	let t123;
    	let div50;
    	let div49;
    	let div48;
    	let i13;
    	let t124;
    	let h412;
    	let a3;
    	let t126;
    	let p21;
    	let t128;
    	let div53;
    	let div52;
    	let div51;
    	let i14;
    	let t129;
    	let h413;
    	let a4;
    	let t131;
    	let p22;
    	let t133;
    	let section5;
    	let div63;
    	let div56;
    	let h22;
    	let t135;
    	let p23;
    	let t137;
    	let div62;
    	let div57;
    	let p24;
    	let i15;
    	let t138;
    	let i16;
    	let t139;
    	let img10;
    	let img10_src_value;
    	let t140;
    	let h35;
    	let t142;
    	let h414;
    	let t144;
    	let div58;
    	let p25;
    	let i17;
    	let t145;
    	let i18;
    	let t146;
    	let img11;
    	let img11_src_value;
    	let t147;
    	let h36;
    	let t149;
    	let h415;
    	let t151;
    	let div59;
    	let p26;
    	let i19;
    	let t152;
    	let i20;
    	let t153;
    	let img12;
    	let img12_src_value;
    	let t154;
    	let h37;
    	let t156;
    	let h416;
    	let t158;
    	let div60;
    	let p27;
    	let i21;
    	let t159;
    	let i22;
    	let t160;
    	let img13;
    	let img13_src_value;
    	let t161;
    	let h38;
    	let t163;
    	let h417;
    	let t165;
    	let div61;
    	let p28;
    	let i23;
    	let t166;
    	let i24;
    	let t167;
    	let img14;
    	let img14_src_value;
    	let t168;
    	let h39;
    	let t170;
    	let h418;
    	let t172;
    	let section6;
    	let div86;
    	let div64;
    	let h23;
    	let t174;
    	let p29;
    	let t176;
    	let div85;
    	let div69;
    	let div68;
    	let img15;
    	let img15_src_value;
    	let t177;
    	let div67;
    	let div65;
    	let h419;
    	let t179;
    	let span6;
    	let t181;
    	let div66;
    	let a5;
    	let i25;
    	let t182;
    	let a6;
    	let i26;
    	let t183;
    	let a7;
    	let i27;
    	let t184;
    	let a8;
    	let i28;
    	let t185;
    	let div74;
    	let div73;
    	let img16;
    	let img16_src_value;
    	let t186;
    	let div72;
    	let div70;
    	let h420;
    	let t188;
    	let span7;
    	let t190;
    	let div71;
    	let a9;
    	let i29;
    	let t191;
    	let a10;
    	let i30;
    	let t192;
    	let a11;
    	let i31;
    	let t193;
    	let a12;
    	let i32;
    	let t194;
    	let div79;
    	let div78;
    	let img17;
    	let img17_src_value;
    	let t195;
    	let div77;
    	let div75;
    	let h421;
    	let t197;
    	let span8;
    	let t199;
    	let div76;
    	let a13;
    	let i33;
    	let t200;
    	let a14;
    	let i34;
    	let t201;
    	let a15;
    	let i35;
    	let t202;
    	let a16;
    	let i36;
    	let t203;
    	let div84;
    	let div83;
    	let img18;
    	let img18_src_value;
    	let t204;
    	let div82;
    	let div80;
    	let h422;
    	let t206;
    	let span9;
    	let t208;
    	let div81;
    	let a17;
    	let i37;
    	let t209;
    	let a18;
    	let i38;
    	let t210;
    	let a19;
    	let i39;
    	let t211;
    	let a20;
    	let i40;
    	let t212;
    	let section7;
    	let div98;
    	let div87;
    	let h24;
    	let t214;
    	let p30;
    	let t216;
    	let div97;
    	let div90;
    	let div89;
    	let h310;
    	let t218;
    	let h423;
    	let sup0;
    	let t220;
    	let span10;
    	let t222;
    	let ul2;
    	let li6;
    	let t224;
    	let li7;
    	let t226;
    	let li8;
    	let t228;
    	let li9;
    	let t230;
    	let li10;
    	let t232;
    	let div88;
    	let a21;
    	let t234;
    	let div93;
    	let div92;
    	let h311;
    	let t236;
    	let h424;
    	let sup1;
    	let t238;
    	let span11;
    	let t240;
    	let ul3;
    	let li11;
    	let t242;
    	let li12;
    	let t244;
    	let li13;
    	let t246;
    	let li14;
    	let t248;
    	let li15;
    	let t250;
    	let div91;
    	let a22;
    	let t252;
    	let div96;
    	let div95;
    	let h312;
    	let t254;
    	let h425;
    	let sup2;
    	let t256;
    	let span12;
    	let t258;
    	let ul4;
    	let li16;
    	let t260;
    	let li17;
    	let t262;
    	let li18;
    	let t264;
    	let li19;
    	let t266;
    	let li20;
    	let t268;
    	let div94;
    	let a23;
    	let t270;
    	let section8;
    	let div106;
    	let div99;
    	let h25;
    	let t272;
    	let ul5;
    	let li21;
    	let a24;
    	let t273;
    	let i41;
    	let t274;
    	let div100;
    	let p31;
    	let t276;
    	let li22;
    	let a25;
    	let t277;
    	let i42;
    	let t278;
    	let div101;
    	let p32;
    	let t280;
    	let li23;
    	let a26;
    	let t281;
    	let i43;
    	let t282;
    	let div102;
    	let p33;
    	let t284;
    	let li24;
    	let a27;
    	let t285;
    	let i44;
    	let t286;
    	let div103;
    	let p34;
    	let t288;
    	let li25;
    	let a28;
    	let t289;
    	let i45;
    	let t290;
    	let div104;
    	let p35;
    	let t292;
    	let li26;
    	let a29;
    	let t293;
    	let i46;
    	let t294;
    	let div105;
    	let p36;
    	let t296;
    	let section9;
    	let div132;
    	let div107;
    	let h26;
    	let t298;
    	let p37;
    	let t300;
    	let div131;
    	let div115;
    	let div114;
    	let div109;
    	let div108;
    	let i47;
    	let t301;
    	let h313;
    	let t303;
    	let p38;
    	let t305;
    	let div111;
    	let div110;
    	let i48;
    	let t306;
    	let h314;
    	let t308;
    	let p39;
    	let t309;
    	let br0;
    	let t310;
    	let t311;
    	let div113;
    	let div112;
    	let i49;
    	let t312;
    	let h315;
    	let t314;
    	let p40;
    	let t315;
    	let br1;
    	let t316;
    	let t317;
    	let div130;
    	let form;
    	let div120;
    	let div117;
    	let input0;
    	let t318;
    	let div116;
    	let t319;
    	let div119;
    	let input1;
    	let t320;
    	let div118;
    	let t321;
    	let div122;
    	let input2;
    	let t322;
    	let div121;
    	let t323;
    	let div124;
    	let textarea;
    	let t324;
    	let div123;
    	let t325;
    	let div128;
    	let div125;
    	let t327;
    	let div126;
    	let t328;
    	let div127;
    	let t330;
    	let div129;
    	let button;
    	let t332;
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
    			h30.textContent = "Voluptatem dignissimos provident quasi";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\n              eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis\n              aute irure dolor in reprehenderit";
    			t5 = space();
    			a0 = element("a");
    			t6 = text("About us\n              ");
    			i0 = element("i");
    			t7 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div2 = element("div");
    			i1 = element("i");
    			t8 = space();
    			h40 = element("h4");
    			h40.textContent = "Corporis voluptates sit";
    			t10 = space();
    			p1 = element("p");
    			p1.textContent = "Consequuntur sunt aut quasi enim aliquam quae harum pariatur\n                  laboris nisi ut aliquip";
    			t12 = space();
    			div3 = element("div");
    			i2 = element("i");
    			t13 = space();
    			h41 = element("h4");
    			h41.textContent = "Ullamco laboris nisi";
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "Excepteur sint occaecat cupidatat non proident, sunt in culpa\n                  qui officia deserunt";
    			t17 = space();
    			div4 = element("div");
    			i3 = element("i");
    			t18 = space();
    			h42 = element("h4");
    			h42.textContent = "Labore consequatur";
    			t20 = space();
    			p3 = element("p");
    			p3.textContent = "Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut\n                  maiores omnis facere";
    			t22 = space();
    			div5 = element("div");
    			i4 = element("i");
    			t23 = space();
    			h43 = element("h4");
    			h43.textContent = "Beatae veritatis";
    			t25 = space();
    			p4 = element("p");
    			p4.textContent = "Expedita veritatis consequuntur nihil tempore laudantium vitae\n                  denat pacta";
    			t27 = space();
    			section1 = element("section");
    			div18 = element("div");
    			div17 = element("div");
    			div11 = element("div");
    			img0 = element("img");
    			t28 = space();
    			div12 = element("div");
    			img1 = element("img");
    			t29 = space();
    			div13 = element("div");
    			img2 = element("img");
    			t30 = space();
    			div14 = element("div");
    			img3 = element("img");
    			t31 = space();
    			div15 = element("div");
    			img4 = element("img");
    			t32 = space();
    			div16 = element("div");
    			img5 = element("img");
    			t33 = space();
    			section2 = element("section");
    			div32 = element("div");
    			div19 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Features";
    			t35 = space();
    			p5 = element("p");
    			p5.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia\n          fugiat sit in iste officiis commodi quidem hic quas.";
    			t37 = space();
    			div22 = element("div");
    			div20 = element("div");
    			img6 = element("img");
    			t38 = space();
    			div21 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Voluptatem dignissimos provident quasi corporis voluptates sit\n            assumenda.";
    			t40 = space();
    			p6 = element("p");
    			p6.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\n            eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t42 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			i5 = element("i");
    			t43 = text("\n              Ullamco laboris nisi ut aliquip ex ea commodo consequat.");
    			t44 = space();
    			li1 = element("li");
    			i6 = element("i");
    			t45 = text("\n              Duis aute irure dolor in reprehenderit in voluptate velit.");
    			t46 = space();
    			li2 = element("li");
    			i7 = element("i");
    			t47 = text("\n              Ullam est qui quos consequatur eos accusamus.");
    			t48 = space();
    			div25 = element("div");
    			div23 = element("div");
    			img7 = element("img");
    			t49 = space();
    			div24 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Corporis temporibus maiores provident";
    			t51 = space();
    			p7 = element("p");
    			p7.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\n            eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t53 = space();
    			p8 = element("p");
    			p8.textContent = "Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute\n            irure dolor in reprehenderit in voluptate velit esse cillum dolore\n            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\n            proident, sunt in culpa qui officia deserunt mollit anim id est\n            laborum";
    			t55 = space();
    			div28 = element("div");
    			div26 = element("div");
    			img8 = element("img");
    			t56 = space();
    			div27 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Sunt consequatur ad ut est nulla consectetur reiciendis animi\n            voluptas";
    			t58 = space();
    			p9 = element("p");
    			p9.textContent = "Cupiditate placeat cupiditate placeat est ipsam culpa. Delectus quia\n            minima quod. Sunt saepe odit aut quia voluptatem hic voluptas dolor\n            doloremque.";
    			t60 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			i8 = element("i");
    			t61 = text("\n              Ullamco laboris nisi ut aliquip ex ea commodo consequat.");
    			t62 = space();
    			li4 = element("li");
    			i9 = element("i");
    			t63 = text("\n              Duis aute irure dolor in reprehenderit in voluptate velit.");
    			t64 = space();
    			li5 = element("li");
    			i10 = element("i");
    			t65 = text("\n              Facilis ut et voluptatem aperiam. Autem soluta ad fugiat.");
    			t66 = space();
    			div31 = element("div");
    			div29 = element("div");
    			img9 = element("img");
    			t67 = space();
    			div30 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Quas et necessitatibus eaque impedit ipsum animi consequatur\n            incidunt in";
    			t69 = space();
    			p10 = element("p");
    			p10.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\n            eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t71 = space();
    			p11 = element("p");
    			p11.textContent = "Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute\n            irure dolor in reprehenderit in voluptate velit esse cillum dolore\n            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\n            proident, sunt in culpa qui officia deserunt mollit anim id est\n            laborum";
    			t73 = space();
    			section3 = element("section");
    			div40 = element("div");
    			div39 = element("div");
    			div33 = element("div");
    			span0 = element("span");
    			span0.textContent = "01";
    			t75 = space();
    			h44 = element("h4");
    			h44.textContent = "Lorem Ipsum";
    			t77 = space();
    			p12 = element("p");
    			p12.textContent = "Ulamco laboris nisi ut aliquip ex ea commodo consequat. Et\n            consectetur ducimus vero placeat";
    			t79 = space();
    			div34 = element("div");
    			span1 = element("span");
    			span1.textContent = "02";
    			t81 = space();
    			h45 = element("h4");
    			h45.textContent = "Repellat Nihil";
    			t83 = space();
    			p13 = element("p");
    			p13.textContent = "Dolorem est fugiat occaecati voluptate velit esse. Dicta veritatis\n            dolor quod et vel dire leno para dest";
    			t85 = space();
    			div35 = element("div");
    			span2 = element("span");
    			span2.textContent = "03";
    			t87 = space();
    			h46 = element("h4");
    			h46.textContent = "Ad ad velit qui";
    			t89 = space();
    			p14 = element("p");
    			p14.textContent = "Molestiae officiis omnis illo asperiores. Aut doloribus vitae sunt\n            debitis quo vel nam quis";
    			t91 = space();
    			div36 = element("div");
    			span3 = element("span");
    			span3.textContent = "04";
    			t93 = space();
    			h47 = element("h4");
    			h47.textContent = "Repellendus molestiae";
    			t95 = space();
    			p15 = element("p");
    			p15.textContent = "Inventore quo sint a sint rerum. Distinctio blanditiis deserunt quod\n            soluta quod nam mider lando casa";
    			t97 = space();
    			div37 = element("div");
    			span4 = element("span");
    			span4.textContent = "05";
    			t99 = space();
    			h48 = element("h4");
    			h48.textContent = "Sapiente Magnam";
    			t101 = space();
    			p16 = element("p");
    			p16.textContent = "Vitae dolorem in deleniti ipsum omnis tempore voluptatem. Qui\n            possimus est repellendus est quibusdam";
    			t103 = space();
    			div38 = element("div");
    			span5 = element("span");
    			span5.textContent = "06";
    			t105 = space();
    			h49 = element("h4");
    			h49.textContent = "Facilis Impedit";
    			t107 = space();
    			p17 = element("p");
    			p17.textContent = "Quis eum numquam veniam ea voluptatibus voluptas. Excepturi aut\n            nostrum repudiandae voluptatibus corporis sequi";
    			t109 = space();
    			section4 = element("section");
    			div55 = element("div");
    			div41 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Services";
    			t111 = space();
    			p18 = element("p");
    			p18.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia\n          fugiat sit in iste officiis commodi quidem hic quas.";
    			t113 = space();
    			div54 = element("div");
    			div44 = element("div");
    			div43 = element("div");
    			div42 = element("div");
    			i11 = element("i");
    			t114 = space();
    			h410 = element("h4");
    			a1 = element("a");
    			a1.textContent = "Lorem Ipsum";
    			t116 = space();
    			p19 = element("p");
    			p19.textContent = "Voluptatum deleniti atque corrupti quos dolores et quas molestias\n              excepturi";
    			t118 = space();
    			div47 = element("div");
    			div46 = element("div");
    			div45 = element("div");
    			i12 = element("i");
    			t119 = space();
    			h411 = element("h4");
    			a2 = element("a");
    			a2.textContent = "Sed ut perspiciatis";
    			t121 = space();
    			p20 = element("p");
    			p20.textContent = "Duis aute irure dolor in reprehenderit in voluptate velit esse\n              cillum dolore";
    			t123 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div48 = element("div");
    			i13 = element("i");
    			t124 = space();
    			h412 = element("h4");
    			a3 = element("a");
    			a3.textContent = "Magni Dolores";
    			t126 = space();
    			p21 = element("p");
    			p21.textContent = "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui\n              officia";
    			t128 = space();
    			div53 = element("div");
    			div52 = element("div");
    			div51 = element("div");
    			i14 = element("i");
    			t129 = space();
    			h413 = element("h4");
    			a4 = element("a");
    			a4.textContent = "Nemo Enim";
    			t131 = space();
    			p22 = element("p");
    			p22.textContent = "At vero eos et accusamus et iusto odio dignissimos ducimus qui\n              blanditiis";
    			t133 = space();
    			section5 = element("section");
    			div63 = element("div");
    			div56 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Testimonials";
    			t135 = space();
    			p23 = element("p");
    			p23.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia\n          fugiat sit in iste officiis commodi quidem hic quas.";
    			t137 = space();
    			div62 = element("div");
    			div57 = element("div");
    			p24 = element("p");
    			i15 = element("i");
    			t138 = text("\n            Proin iaculis purus consequat sem cure digni ssim donec porttitora\n            entum suscipit rhoncus. Accusantium quam, ultricies eget id, aliquam\n            eget nibh et. Maecen aliquam, risus at semper.\n            ");
    			i16 = element("i");
    			t139 = space();
    			img10 = element("img");
    			t140 = space();
    			h35 = element("h3");
    			h35.textContent = "Saul Goodman";
    			t142 = space();
    			h414 = element("h4");
    			h414.textContent = "Ceo & Founder";
    			t144 = space();
    			div58 = element("div");
    			p25 = element("p");
    			i17 = element("i");
    			t145 = text("\n            Export tempor illum tamen malis malis eram quae irure esse labore\n            quem cillum quid cillum eram malis quorum velit fore eram velit sunt\n            aliqua noster fugiat irure amet legam anim culpa.\n            ");
    			i18 = element("i");
    			t146 = space();
    			img11 = element("img");
    			t147 = space();
    			h36 = element("h3");
    			h36.textContent = "Sara Wilsson";
    			t149 = space();
    			h415 = element("h4");
    			h415.textContent = "Designer";
    			t151 = space();
    			div59 = element("div");
    			p26 = element("p");
    			i19 = element("i");
    			t152 = text("\n            Enim nisi quem export duis labore cillum quae magna enim sint quorum\n            nulla quem veniam duis minim tempor labore quem eram duis noster\n            aute amet eram fore quis sint minim.\n            ");
    			i20 = element("i");
    			t153 = space();
    			img12 = element("img");
    			t154 = space();
    			h37 = element("h3");
    			h37.textContent = "Jena Karlis";
    			t156 = space();
    			h416 = element("h4");
    			h416.textContent = "Store Owner";
    			t158 = space();
    			div60 = element("div");
    			p27 = element("p");
    			i21 = element("i");
    			t159 = text("\n            Fugiat enim eram quae cillum dolore dolor amet nulla culpa multos\n            export minim fugiat minim velit minim dolor enim duis veniam ipsum\n            anim magna sunt elit fore quem dolore labore illum veniam.\n            ");
    			i22 = element("i");
    			t160 = space();
    			img13 = element("img");
    			t161 = space();
    			h38 = element("h3");
    			h38.textContent = "Matt Brandon";
    			t163 = space();
    			h417 = element("h4");
    			h417.textContent = "Freelancer";
    			t165 = space();
    			div61 = element("div");
    			p28 = element("p");
    			i23 = element("i");
    			t166 = text("\n            Quis quorum aliqua sint quem legam fore sunt eram irure aliqua\n            veniam tempor noster veniam enim culpa labore duis sunt culpa nulla\n            illum cillum fugiat legam esse veniam culpa fore nisi cillum quid.\n            ");
    			i24 = element("i");
    			t167 = space();
    			img14 = element("img");
    			t168 = space();
    			h39 = element("h3");
    			h39.textContent = "John Larson";
    			t170 = space();
    			h418 = element("h4");
    			h418.textContent = "Entrepreneur";
    			t172 = space();
    			section6 = element("section");
    			div86 = element("div");
    			div64 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Team";
    			t174 = space();
    			p29 = element("p");
    			p29.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia\n          fugiat sit in iste officiis commodi quidem hic quas.";
    			t176 = space();
    			div85 = element("div");
    			div69 = element("div");
    			div68 = element("div");
    			img15 = element("img");
    			t177 = space();
    			div67 = element("div");
    			div65 = element("div");
    			h419 = element("h4");
    			h419.textContent = "Walter White";
    			t179 = space();
    			span6 = element("span");
    			span6.textContent = "Chief Executive Officer";
    			t181 = space();
    			div66 = element("div");
    			a5 = element("a");
    			i25 = element("i");
    			t182 = space();
    			a6 = element("a");
    			i26 = element("i");
    			t183 = space();
    			a7 = element("a");
    			i27 = element("i");
    			t184 = space();
    			a8 = element("a");
    			i28 = element("i");
    			t185 = space();
    			div74 = element("div");
    			div73 = element("div");
    			img16 = element("img");
    			t186 = space();
    			div72 = element("div");
    			div70 = element("div");
    			h420 = element("h4");
    			h420.textContent = "Sarah Jhonson";
    			t188 = space();
    			span7 = element("span");
    			span7.textContent = "Product Manager";
    			t190 = space();
    			div71 = element("div");
    			a9 = element("a");
    			i29 = element("i");
    			t191 = space();
    			a10 = element("a");
    			i30 = element("i");
    			t192 = space();
    			a11 = element("a");
    			i31 = element("i");
    			t193 = space();
    			a12 = element("a");
    			i32 = element("i");
    			t194 = space();
    			div79 = element("div");
    			div78 = element("div");
    			img17 = element("img");
    			t195 = space();
    			div77 = element("div");
    			div75 = element("div");
    			h421 = element("h4");
    			h421.textContent = "William Anderson";
    			t197 = space();
    			span8 = element("span");
    			span8.textContent = "CTO";
    			t199 = space();
    			div76 = element("div");
    			a13 = element("a");
    			i33 = element("i");
    			t200 = space();
    			a14 = element("a");
    			i34 = element("i");
    			t201 = space();
    			a15 = element("a");
    			i35 = element("i");
    			t202 = space();
    			a16 = element("a");
    			i36 = element("i");
    			t203 = space();
    			div84 = element("div");
    			div83 = element("div");
    			img18 = element("img");
    			t204 = space();
    			div82 = element("div");
    			div80 = element("div");
    			h422 = element("h4");
    			h422.textContent = "Amanda Jepson";
    			t206 = space();
    			span9 = element("span");
    			span9.textContent = "Accountant";
    			t208 = space();
    			div81 = element("div");
    			a17 = element("a");
    			i37 = element("i");
    			t209 = space();
    			a18 = element("a");
    			i38 = element("i");
    			t210 = space();
    			a19 = element("a");
    			i39 = element("i");
    			t211 = space();
    			a20 = element("a");
    			i40 = element("i");
    			t212 = space();
    			section7 = element("section");
    			div98 = element("div");
    			div87 = element("div");
    			h24 = element("h2");
    			h24.textContent = "Pricing";
    			t214 = space();
    			p30 = element("p");
    			p30.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia\n          fugiat sit in iste officiis commodi quidem hic quas.";
    			t216 = space();
    			div97 = element("div");
    			div90 = element("div");
    			div89 = element("div");
    			h310 = element("h3");
    			h310.textContent = "Free";
    			t218 = space();
    			h423 = element("h4");
    			sup0 = element("sup");
    			sup0.textContent = "$";
    			t220 = text("0");
    			span10 = element("span");
    			span10.textContent = "/ month";
    			t222 = space();
    			ul2 = element("ul");
    			li6 = element("li");
    			li6.textContent = "Aida dere";
    			t224 = space();
    			li7 = element("li");
    			li7.textContent = "Nec feugiat nisl";
    			t226 = space();
    			li8 = element("li");
    			li8.textContent = "Nulla at volutpat dola";
    			t228 = space();
    			li9 = element("li");
    			li9.textContent = "Pharetra massa";
    			t230 = space();
    			li10 = element("li");
    			li10.textContent = "Massa ultricies mi";
    			t232 = space();
    			div88 = element("div");
    			a21 = element("a");
    			a21.textContent = "Buy Now";
    			t234 = space();
    			div93 = element("div");
    			div92 = element("div");
    			h311 = element("h3");
    			h311.textContent = "Business";
    			t236 = space();
    			h424 = element("h4");
    			sup1 = element("sup");
    			sup1.textContent = "$";
    			t238 = text("19");
    			span11 = element("span");
    			span11.textContent = "/ month";
    			t240 = space();
    			ul3 = element("ul");
    			li11 = element("li");
    			li11.textContent = "Aida dere";
    			t242 = space();
    			li12 = element("li");
    			li12.textContent = "Nec feugiat nisl";
    			t244 = space();
    			li13 = element("li");
    			li13.textContent = "Nulla at volutpat dola";
    			t246 = space();
    			li14 = element("li");
    			li14.textContent = "Pharetra massa";
    			t248 = space();
    			li15 = element("li");
    			li15.textContent = "Massa ultricies mi";
    			t250 = space();
    			div91 = element("div");
    			a22 = element("a");
    			a22.textContent = "Buy Now";
    			t252 = space();
    			div96 = element("div");
    			div95 = element("div");
    			h312 = element("h3");
    			h312.textContent = "Developer";
    			t254 = space();
    			h425 = element("h4");
    			sup2 = element("sup");
    			sup2.textContent = "$";
    			t256 = text("29");
    			span12 = element("span");
    			span12.textContent = "/ month";
    			t258 = space();
    			ul4 = element("ul");
    			li16 = element("li");
    			li16.textContent = "Aida dere";
    			t260 = space();
    			li17 = element("li");
    			li17.textContent = "Nec feugiat nisl";
    			t262 = space();
    			li18 = element("li");
    			li18.textContent = "Nulla at volutpat dola";
    			t264 = space();
    			li19 = element("li");
    			li19.textContent = "Pharetra massa";
    			t266 = space();
    			li20 = element("li");
    			li20.textContent = "Massa ultricies mi";
    			t268 = space();
    			div94 = element("div");
    			a23 = element("a");
    			a23.textContent = "Buy Now";
    			t270 = space();
    			section8 = element("section");
    			div106 = element("div");
    			div99 = element("div");
    			h25 = element("h2");
    			h25.textContent = "Frequently Asked Questions";
    			t272 = space();
    			ul5 = element("ul");
    			li21 = element("li");
    			a24 = element("a");
    			t273 = text("Non\n            consectetur a erat nam at lectus urna duis?\n            ");
    			i41 = element("i");
    			t274 = space();
    			div100 = element("div");
    			p31 = element("p");
    			p31.textContent = "Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id\n              volutpat lacus laoreet non curabitur gravida. Venenatis lectus\n              magna fringilla urna porttitor rhoncus dolor purus non.";
    			t276 = space();
    			li22 = element("li");
    			a25 = element("a");
    			t277 = text("Feugiat scelerisque varius morbi enim nunc\n            faucibus a pellentesque?\n            ");
    			i42 = element("i");
    			t278 = space();
    			div101 = element("div");
    			p32 = element("p");
    			p32.textContent = "Dolor sit amet consectetur adipiscing elit pellentesque habitant\n              morbi. Id interdum velit laoreet id donec ultrices. Fringilla\n              phasellus faucibus scelerisque eleifend donec pretium. Est\n              pellentesque elit ullamcorper dignissim. Mauris ultrices eros in\n              cursus turpis massa tincidunt dui.";
    			t280 = space();
    			li23 = element("li");
    			a26 = element("a");
    			t281 = text("Dolor sit amet consectetur adipiscing elit\n            pellentesque habitant morbi?\n            ");
    			i43 = element("i");
    			t282 = space();
    			div102 = element("div");
    			p33 = element("p");
    			p33.textContent = "Eleifend mi in nulla posuere sollicitudin aliquam ultrices\n              sagittis orci. Faucibus pulvinar elementum integer enim. Sem nulla\n              pharetra diam sit amet nisl suscipit. Rutrum tellus pellentesque\n              eu tincidunt. Lectus urna duis convallis convallis tellus. Urna\n              molestie at elementum eu facilisis sed odio morbi quis";
    			t284 = space();
    			li24 = element("li");
    			a27 = element("a");
    			t285 = text("Ac odio tempor orci dapibus. Aliquam eleifend mi\n            in nulla?\n            ");
    			i44 = element("i");
    			t286 = space();
    			div103 = element("div");
    			p34 = element("p");
    			p34.textContent = "Dolor sit amet consectetur adipiscing elit pellentesque habitant\n              morbi. Id interdum velit laoreet id donec ultrices. Fringilla\n              phasellus faucibus scelerisque eleifend donec pretium. Est\n              pellentesque elit ullamcorper dignissim. Mauris ultrices eros in\n              cursus turpis massa tincidunt dui.";
    			t288 = space();
    			li25 = element("li");
    			a28 = element("a");
    			t289 = text("Tempus quam pellentesque nec nam aliquam sem et\n            tortor consequat?\n            ");
    			i45 = element("i");
    			t290 = space();
    			div104 = element("div");
    			p35 = element("p");
    			p35.textContent = "Molestie a iaculis at erat pellentesque adipiscing commodo.\n              Dignissim suspendisse in est ante in. Nunc vel risus commodo\n              viverra maecenas accumsan. Sit amet nisl suscipit adipiscing\n              bibendum est. Purus gravida quis blandit turpis cursus in";
    			t292 = space();
    			li26 = element("li");
    			a29 = element("a");
    			t293 = text("Tortor vitae purus faucibus ornare. Varius vel\n            pharetra vel turpis nunc eget lorem dolor?\n            ");
    			i46 = element("i");
    			t294 = space();
    			div105 = element("div");
    			p36 = element("p");
    			p36.textContent = "Laoreet sit amet cursus sit amet dictum sit amet justo. Mauris\n              vitae ultricies leo integer malesuada nunc vel. Tincidunt eget\n              nullam non nisi est sit amet. Turpis nunc eget lorem dolor sed. Ut\n              venenatis tellus in metus vulputate eu scelerisque. Pellentesque\n              diam volutpat commodo sed egestas egestas fringilla phasellus\n              faucibus. Nibh tellus molestie nunc non blandit massa enim nec.";
    			t296 = space();
    			section9 = element("section");
    			div132 = element("div");
    			div107 = element("div");
    			h26 = element("h2");
    			h26.textContent = "Contact";
    			t298 = space();
    			p37 = element("p");
    			p37.textContent = "Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex\n          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos\n          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia\n          fugiat sit in iste officiis commodi quidem hic quas.";
    			t300 = space();
    			div131 = element("div");
    			div115 = element("div");
    			div114 = element("div");
    			div109 = element("div");
    			div108 = element("div");
    			i47 = element("i");
    			t301 = space();
    			h313 = element("h3");
    			h313.textContent = "Our City";
    			t303 = space();
    			p38 = element("p");
    			p38.textContent = "Madison, WI 53713";
    			t305 = space();
    			div111 = element("div");
    			div110 = element("div");
    			i48 = element("i");
    			t306 = space();
    			h314 = element("h3");
    			h314.textContent = "Email Us";
    			t308 = space();
    			p39 = element("p");
    			t309 = text("info@thompsondevgroup.com");
    			br0 = element("br");
    			t310 = text("contact@thompsondevgroup.com");
    			t311 = space();
    			div113 = element("div");
    			div112 = element("div");
    			i49 = element("i");
    			t312 = space();
    			h315 = element("h3");
    			h315.textContent = "Call Us";
    			t314 = space();
    			p40 = element("p");
    			t315 = text("+1 5589 55488 55");
    			br1 = element("br");
    			t316 = text("+1 6678 254445 41");
    			t317 = space();
    			div130 = element("div");
    			form = element("form");
    			div120 = element("div");
    			div117 = element("div");
    			input0 = element("input");
    			t318 = space();
    			div116 = element("div");
    			t319 = space();
    			div119 = element("div");
    			input1 = element("input");
    			t320 = space();
    			div118 = element("div");
    			t321 = space();
    			div122 = element("div");
    			input2 = element("input");
    			t322 = space();
    			div121 = element("div");
    			t323 = space();
    			div124 = element("div");
    			textarea = element("textarea");
    			t324 = space();
    			div123 = element("div");
    			t325 = space();
    			div128 = element("div");
    			div125 = element("div");
    			div125.textContent = "Loading";
    			t327 = space();
    			div126 = element("div");
    			t328 = space();
    			div127 = element("div");
    			div127.textContent = "Your message has been sent. Thank you!";
    			t330 = space();
    			div129 = element("div");
    			button = element("button");
    			button.textContent = "Send Message";
    			t332 = space();
    			create_component(footer.$$.fragment);
    			add_location(h30, file$4, 25, 12, 594);
    			add_location(p0, file$4, 26, 12, 654);
    			attr_dev(i0, "class", "bx bx-chevron-right");
    			add_location(i0, file$4, 32, 14, 945);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "about-btn");
    			add_location(a0, file$4, 31, 12, 892);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$4, 24, 10, 560);
    			attr_dev(div1, "class", "content col-xl-5 d-flex align-items-stretch");
    			attr_dev(div1, "data-aos", "fade-right");
    			add_location(div1, file$4, 21, 8, 450);
    			attr_dev(i1, "class", "bx bx-receipt");
    			add_location(i1, file$4, 42, 16, 1351);
    			add_location(h40, file$4, 43, 16, 1395);
    			add_location(p1, file$4, 44, 16, 1444);
    			attr_dev(div2, "class", "col-md-6 icon-box");
    			attr_dev(div2, "data-aos", "fade-up");
    			attr_dev(div2, "data-aos-delay", "100");
    			add_location(div2, file$4, 38, 14, 1215);
    			attr_dev(i2, "class", "bx bx-cube-alt");
    			add_location(i2, file$4, 53, 16, 1761);
    			add_location(h41, file$4, 54, 16, 1806);
    			add_location(p2, file$4, 55, 16, 1852);
    			attr_dev(div3, "class", "col-md-6 icon-box");
    			attr_dev(div3, "data-aos", "fade-up");
    			attr_dev(div3, "data-aos-delay", "200");
    			add_location(div3, file$4, 49, 14, 1625);
    			attr_dev(i3, "class", "bx bx-images");
    			add_location(i3, file$4, 64, 16, 2167);
    			add_location(h42, file$4, 65, 16, 2210);
    			add_location(p3, file$4, 66, 16, 2254);
    			attr_dev(div4, "class", "col-md-6 icon-box");
    			attr_dev(div4, "data-aos", "fade-up");
    			attr_dev(div4, "data-aos-delay", "300");
    			add_location(div4, file$4, 60, 14, 2031);
    			attr_dev(i4, "class", "bx bx-shield");
    			add_location(i4, file$4, 75, 16, 2566);
    			add_location(h43, file$4, 76, 16, 2609);
    			add_location(p4, file$4, 77, 16, 2651);
    			attr_dev(div5, "class", "col-md-6 icon-box");
    			attr_dev(div5, "data-aos", "fade-up");
    			attr_dev(div5, "data-aos-delay", "400");
    			add_location(div5, file$4, 71, 14, 2430);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$4, 37, 12, 1183);
    			attr_dev(div7, "class", "icon-boxes d-flex flex-column justify-content-center");
    			add_location(div7, file$4, 36, 10, 1104);
    			attr_dev(div8, "class", "col-xl-7 d-flex align-items-stretch");
    			attr_dev(div8, "data-aos", "fade-left");
    			add_location(div8, file$4, 35, 8, 1023);
    			attr_dev(div9, "class", "row no-gutters");
    			add_location(div9, file$4, 20, 6, 413);
    			attr_dev(div10, "class", "container");
    			add_location(div10, file$4, 19, 4, 383);
    			attr_dev(section0, "id", "about");
    			attr_dev(section0, "class", "about");
    			add_location(section0, file$4, 18, 2, 344);
    			if (img0.src !== (img0_src_value = "assets/img/clients/client-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "img-fluid");
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$4, 94, 10, 3124);
    			attr_dev(div11, "class", "col-lg-2 col-md-4 col-6 d-flex align-items-center justify-content-center");
    			add_location(div11, file$4, 92, 8, 3017);
    			if (img1.src !== (img1_src_value = "assets/img/clients/client-2.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "img-fluid");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$4, 99, 10, 3326);
    			attr_dev(div12, "class", "col-lg-2 col-md-4 col-6 d-flex align-items-center justify-content-center");
    			add_location(div12, file$4, 97, 8, 3219);
    			if (img2.src !== (img2_src_value = "assets/img/clients/client-3.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "img-fluid");
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$4, 104, 10, 3528);
    			attr_dev(div13, "class", "col-lg-2 col-md-4 col-6 d-flex align-items-center justify-content-center");
    			add_location(div13, file$4, 102, 8, 3421);
    			if (img3.src !== (img3_src_value = "assets/img/clients/client-4.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "img-fluid");
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$4, 109, 10, 3730);
    			attr_dev(div14, "class", "col-lg-2 col-md-4 col-6 d-flex align-items-center justify-content-center");
    			add_location(div14, file$4, 107, 8, 3623);
    			if (img4.src !== (img4_src_value = "assets/img/clients/client-5.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "class", "img-fluid");
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$4, 114, 10, 3932);
    			attr_dev(div15, "class", "col-lg-2 col-md-4 col-6 d-flex align-items-center justify-content-center");
    			add_location(div15, file$4, 112, 8, 3825);
    			if (img5.src !== (img5_src_value = "assets/img/clients/client-6.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "class", "img-fluid");
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$4, 119, 10, 4134);
    			attr_dev(div16, "class", "col-lg-2 col-md-4 col-6 d-flex align-items-center justify-content-center");
    			add_location(div16, file$4, 117, 8, 4027);
    			attr_dev(div17, "class", "row");
    			add_location(div17, file$4, 91, 6, 2991);
    			attr_dev(div18, "class", "container");
    			attr_dev(div18, "data-aos", "zoom-in");
    			add_location(div18, file$4, 90, 4, 2942);
    			attr_dev(section1, "id", "clients");
    			attr_dev(section1, "class", "clients");
    			add_location(section1, file$4, 89, 2, 2899);
    			add_location(h20, file$4, 128, 8, 4390);
    			add_location(p5, file$4, 129, 8, 4416);
    			attr_dev(div19, "class", "section-title");
    			add_location(div19, file$4, 127, 6, 4354);
    			if (img6.src !== (img6_src_value = "assets/img/features-1.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "class", "img-fluid");
    			attr_dev(img6, "alt", "");
    			add_location(img6, file$4, 139, 10, 4856);
    			attr_dev(div20, "class", "col-md-5");
    			attr_dev(div20, "data-aos", "fade-right");
    			attr_dev(div20, "data-aos-delay", "100");
    			add_location(div20, file$4, 138, 8, 4780);
    			add_location(h31, file$4, 142, 10, 5024);
    			attr_dev(p6, "class", "font-italic");
    			add_location(p6, file$4, 146, 10, 5153);
    			attr_dev(i5, "class", "icofont-check");
    			add_location(i5, file$4, 152, 14, 5386);
    			add_location(li0, file$4, 151, 12, 5367);
    			attr_dev(i6, "class", "icofont-check");
    			add_location(i6, file$4, 156, 14, 5534);
    			add_location(li1, file$4, 155, 12, 5515);
    			attr_dev(i7, "class", "icofont-check");
    			add_location(i7, file$4, 160, 14, 5684);
    			add_location(li2, file$4, 159, 12, 5665);
    			add_location(ul0, file$4, 150, 10, 5350);
    			attr_dev(div21, "class", "col-md-7 pt-4");
    			attr_dev(div21, "data-aos", "fade-left");
    			attr_dev(div21, "data-aos-delay", "100");
    			add_location(div21, file$4, 141, 8, 4944);
    			attr_dev(div22, "class", "row content");
    			add_location(div22, file$4, 137, 6, 4746);
    			if (img7.src !== (img7_src_value = "assets/img/features-2.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "class", "img-fluid");
    			attr_dev(img7, "alt", "");
    			add_location(img7, file$4, 169, 10, 5948);
    			attr_dev(div23, "class", "col-md-5 order-1 order-md-2");
    			attr_dev(div23, "data-aos", "fade-left");
    			add_location(div23, file$4, 168, 8, 5875);
    			add_location(h32, file$4, 172, 10, 6115);
    			attr_dev(p7, "class", "font-italic");
    			add_location(p7, file$4, 173, 10, 6172);
    			add_location(p8, file$4, 177, 10, 6369);
    			attr_dev(div24, "class", "col-md-7 pt-5 order-2 order-md-1");
    			attr_dev(div24, "data-aos", "fade-right");
    			add_location(div24, file$4, 171, 8, 6036);
    			attr_dev(div25, "class", "row content");
    			add_location(div25, file$4, 167, 6, 5841);
    			if (img8.src !== (img8_src_value = "assets/img/features-3.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "class", "img-fluid");
    			attr_dev(img8, "alt", "");
    			add_location(img8, file$4, 189, 10, 6842);
    			attr_dev(div26, "class", "col-md-5");
    			attr_dev(div26, "data-aos", "fade-right");
    			add_location(div26, file$4, 188, 8, 6787);
    			add_location(h33, file$4, 192, 10, 6989);
    			add_location(p9, file$4, 196, 10, 7115);
    			attr_dev(i8, "class", "icofont-check");
    			add_location(i8, file$4, 203, 14, 7365);
    			add_location(li3, file$4, 202, 12, 7346);
    			attr_dev(i9, "class", "icofont-check");
    			add_location(i9, file$4, 207, 14, 7513);
    			add_location(li4, file$4, 206, 12, 7494);
    			attr_dev(i10, "class", "icofont-check");
    			add_location(i10, file$4, 211, 14, 7663);
    			add_location(li5, file$4, 210, 12, 7644);
    			add_location(ul1, file$4, 201, 10, 7329);
    			attr_dev(div27, "class", "col-md-7 pt-5");
    			attr_dev(div27, "data-aos", "fade-left");
    			add_location(div27, file$4, 191, 8, 6930);
    			attr_dev(div28, "class", "row content");
    			add_location(div28, file$4, 187, 6, 6753);
    			if (img9.src !== (img9_src_value = "assets/img/features-4.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "class", "img-fluid");
    			attr_dev(img9, "alt", "");
    			add_location(img9, file$4, 220, 10, 7939);
    			attr_dev(div29, "class", "col-md-5 order-1 order-md-2");
    			attr_dev(div29, "data-aos", "fade-left");
    			add_location(div29, file$4, 219, 8, 7866);
    			add_location(h34, file$4, 223, 10, 8106);
    			attr_dev(p10, "class", "font-italic");
    			add_location(p10, file$4, 227, 10, 8234);
    			add_location(p11, file$4, 231, 10, 8431);
    			attr_dev(div30, "class", "col-md-7 pt-5 order-2 order-md-1");
    			attr_dev(div30, "data-aos", "fade-right");
    			add_location(div30, file$4, 222, 8, 8027);
    			attr_dev(div31, "class", "row content");
    			add_location(div31, file$4, 218, 6, 7832);
    			attr_dev(div32, "class", "container");
    			add_location(div32, file$4, 126, 4, 4324);
    			attr_dev(section2, "id", "features");
    			attr_dev(section2, "class", "features");
    			attr_dev(section2, "data-aos", "fade-up");
    			add_location(section2, file$4, 125, 2, 4260);
    			add_location(span0, file$4, 250, 10, 9085);
    			add_location(h44, file$4, 251, 10, 9111);
    			add_location(p12, file$4, 252, 10, 9142);
    			attr_dev(div33, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div33, "data-aos", "fade-up");
    			attr_dev(div33, "data-aos-delay", "100");
    			add_location(div33, file$4, 246, 8, 8960);
    			add_location(span1, file$4, 262, 10, 9426);
    			add_location(h45, file$4, 263, 10, 9452);
    			add_location(p13, file$4, 264, 10, 9486);
    			attr_dev(div34, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div34, "data-aos", "fade-up");
    			attr_dev(div34, "data-aos-delay", "200");
    			add_location(div34, file$4, 258, 8, 9301);
    			add_location(span2, file$4, 274, 10, 9783);
    			add_location(h46, file$4, 275, 10, 9809);
    			add_location(p14, file$4, 276, 10, 9844);
    			attr_dev(div35, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div35, "data-aos", "fade-up");
    			attr_dev(div35, "data-aos-delay", "300");
    			add_location(div35, file$4, 270, 8, 9658);
    			add_location(span3, file$4, 286, 10, 10128);
    			add_location(h47, file$4, 287, 10, 10154);
    			add_location(p15, file$4, 288, 10, 10195);
    			attr_dev(div36, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div36, "data-aos", "fade-up");
    			attr_dev(div36, "data-aos-delay", "100");
    			add_location(div36, file$4, 282, 8, 10003);
    			add_location(span4, file$4, 298, 10, 10489);
    			add_location(h48, file$4, 299, 10, 10515);
    			add_location(p16, file$4, 300, 10, 10550);
    			attr_dev(div37, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div37, "data-aos", "fade-up");
    			attr_dev(div37, "data-aos-delay", "200");
    			add_location(div37, file$4, 294, 8, 10364);
    			add_location(span5, file$4, 310, 10, 10843);
    			add_location(h49, file$4, 311, 10, 10869);
    			add_location(p17, file$4, 312, 10, 10904);
    			attr_dev(div38, "class", "col-lg-4 col-md-6 content-item");
    			attr_dev(div38, "data-aos", "fade-up");
    			attr_dev(div38, "data-aos-delay", "300");
    			add_location(div38, file$4, 306, 8, 10718);
    			attr_dev(div39, "class", "row no-gutters");
    			attr_dev(div39, "data-aos", "fade-up");
    			add_location(div39, file$4, 245, 6, 8904);
    			attr_dev(div40, "class", "container");
    			add_location(div40, file$4, 244, 4, 8874);
    			attr_dev(section3, "id", "steps");
    			attr_dev(section3, "class", "steps");
    			add_location(section3, file$4, 243, 2, 8835);
    			add_location(h21, file$4, 324, 8, 11244);
    			add_location(p18, file$4, 325, 8, 11270);
    			attr_dev(div41, "class", "section-title");
    			add_location(div41, file$4, 323, 6, 11208);
    			attr_dev(i11, "class", "bx bxl-dribbble");
    			add_location(i11, file$4, 339, 30, 11831);
    			attr_dev(div42, "class", "icon");
    			add_location(div42, file$4, 339, 12, 11813);
    			attr_dev(a1, "href", "");
    			add_location(a1, file$4, 340, 30, 11897);
    			attr_dev(h410, "class", "title");
    			add_location(h410, file$4, 340, 12, 11879);
    			attr_dev(p19, "class", "description");
    			add_location(p19, file$4, 341, 12, 11941);
    			attr_dev(div43, "class", "icon-box");
    			add_location(div43, file$4, 338, 10, 11778);
    			attr_dev(div44, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div44, "data-aos", "fade-up");
    			attr_dev(div44, "data-aos-delay", "100");
    			add_location(div44, file$4, 334, 8, 11626);
    			attr_dev(i12, "class", "bx bx-file");
    			add_location(i12, file$4, 353, 30, 12332);
    			attr_dev(div45, "class", "icon");
    			add_location(div45, file$4, 353, 12, 12314);
    			attr_dev(a2, "href", "");
    			add_location(a2, file$4, 354, 30, 12393);
    			attr_dev(h411, "class", "title");
    			add_location(h411, file$4, 354, 12, 12375);
    			attr_dev(p20, "class", "description");
    			add_location(p20, file$4, 355, 12, 12445);
    			attr_dev(div46, "class", "icon-box");
    			add_location(div46, file$4, 352, 10, 12279);
    			attr_dev(div47, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div47, "data-aos", "fade-up");
    			attr_dev(div47, "data-aos-delay", "200");
    			add_location(div47, file$4, 348, 8, 12127);
    			attr_dev(i13, "class", "bx bx-tachometer");
    			add_location(i13, file$4, 367, 30, 12837);
    			attr_dev(div48, "class", "icon");
    			add_location(div48, file$4, 367, 12, 12819);
    			attr_dev(a3, "href", "");
    			add_location(a3, file$4, 368, 30, 12904);
    			attr_dev(h412, "class", "title");
    			add_location(h412, file$4, 368, 12, 12886);
    			attr_dev(p21, "class", "description");
    			add_location(p21, file$4, 369, 12, 12950);
    			attr_dev(div49, "class", "icon-box");
    			add_location(div49, file$4, 366, 10, 12784);
    			attr_dev(div50, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div50, "data-aos", "fade-up");
    			attr_dev(div50, "data-aos-delay", "300");
    			add_location(div50, file$4, 362, 8, 12632);
    			attr_dev(i14, "class", "bx bx-layer");
    			add_location(i14, file$4, 381, 30, 13339);
    			attr_dev(div51, "class", "icon");
    			add_location(div51, file$4, 381, 12, 13321);
    			attr_dev(a4, "href", "");
    			add_location(a4, file$4, 382, 30, 13401);
    			attr_dev(h413, "class", "title");
    			add_location(h413, file$4, 382, 12, 13383);
    			attr_dev(p22, "class", "description");
    			add_location(p22, file$4, 383, 12, 13443);
    			attr_dev(div52, "class", "icon-box");
    			add_location(div52, file$4, 380, 10, 13286);
    			attr_dev(div53, "class", "col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0");
    			attr_dev(div53, "data-aos", "fade-up");
    			attr_dev(div53, "data-aos-delay", "400");
    			add_location(div53, file$4, 376, 8, 13134);
    			attr_dev(div54, "class", "row");
    			add_location(div54, file$4, 333, 6, 11600);
    			attr_dev(div55, "class", "container");
    			attr_dev(div55, "data-aos", "fade-up");
    			add_location(div55, file$4, 322, 4, 11159);
    			attr_dev(section4, "id", "services");
    			attr_dev(section4, "class", "services");
    			add_location(section4, file$4, 321, 2, 11114);
    			add_location(h22, file$4, 396, 8, 13807);
    			add_location(p23, file$4, 397, 8, 13837);
    			attr_dev(div56, "class", "section-title");
    			add_location(div56, file$4, 395, 6, 13771);
    			attr_dev(i15, "class", "bx bxs-quote-alt-left quote-icon-left");
    			add_location(i15, file$4, 408, 12, 14281);
    			attr_dev(i16, "class", "bx bxs-quote-alt-right quote-icon-right");
    			add_location(i16, file$4, 412, 12, 14564);
    			add_location(p24, file$4, 407, 10, 14265);
    			if (img10.src !== (img10_src_value = "assets/img/testimonials/testimonials-1.jpg")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "class", "testimonial-img");
    			attr_dev(img10, "alt", "");
    			add_location(img10, file$4, 414, 10, 14643);
    			add_location(h35, file$4, 418, 10, 14777);
    			add_location(h414, file$4, 419, 10, 14809);
    			attr_dev(div57, "class", "testimonial-item");
    			add_location(div57, file$4, 406, 8, 14224);
    			attr_dev(i17, "class", "bx bxs-quote-alt-left quote-icon-left");
    			add_location(i17, file$4, 424, 12, 14917);
    			attr_dev(i18, "class", "bx bxs-quote-alt-right quote-icon-right");
    			add_location(i18, file$4, 428, 12, 15202);
    			add_location(p25, file$4, 423, 10, 14901);
    			if (img11.src !== (img11_src_value = "assets/img/testimonials/testimonials-2.jpg")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "class", "testimonial-img");
    			attr_dev(img11, "alt", "");
    			add_location(img11, file$4, 430, 10, 15281);
    			add_location(h36, file$4, 434, 10, 15415);
    			add_location(h415, file$4, 435, 10, 15447);
    			attr_dev(div58, "class", "testimonial-item");
    			add_location(div58, file$4, 422, 8, 14860);
    			attr_dev(i19, "class", "bx bxs-quote-alt-left quote-icon-left");
    			add_location(i19, file$4, 440, 12, 15546);
    			attr_dev(i20, "class", "bx bxs-quote-alt-right quote-icon-right");
    			add_location(i20, file$4, 444, 12, 15817);
    			add_location(p26, file$4, 439, 10, 15530);
    			if (img12.src !== (img12_src_value = "assets/img/testimonials/testimonials-3.jpg")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "class", "testimonial-img");
    			attr_dev(img12, "alt", "");
    			add_location(img12, file$4, 446, 10, 15896);
    			add_location(h37, file$4, 450, 10, 16030);
    			add_location(h416, file$4, 451, 10, 16061);
    			attr_dev(div59, "class", "testimonial-item");
    			add_location(div59, file$4, 438, 8, 15489);
    			attr_dev(i21, "class", "bx bxs-quote-alt-left quote-icon-left");
    			add_location(i21, file$4, 456, 12, 16163);
    			attr_dev(i22, "class", "bx bxs-quote-alt-right quote-icon-right");
    			add_location(i22, file$4, 460, 12, 16455);
    			add_location(p27, file$4, 455, 10, 16147);
    			if (img13.src !== (img13_src_value = "assets/img/testimonials/testimonials-4.jpg")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "class", "testimonial-img");
    			attr_dev(img13, "alt", "");
    			add_location(img13, file$4, 462, 10, 16534);
    			add_location(h38, file$4, 466, 10, 16668);
    			add_location(h417, file$4, 467, 10, 16700);
    			attr_dev(div60, "class", "testimonial-item");
    			add_location(div60, file$4, 454, 8, 16106);
    			attr_dev(i23, "class", "bx bxs-quote-alt-left quote-icon-left");
    			add_location(i23, file$4, 472, 12, 16801);
    			attr_dev(i24, "class", "bx bxs-quote-alt-right quote-icon-right");
    			add_location(i24, file$4, 476, 12, 17099);
    			add_location(p28, file$4, 471, 10, 16785);
    			if (img14.src !== (img14_src_value = "assets/img/testimonials/testimonials-5.jpg")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "class", "testimonial-img");
    			attr_dev(img14, "alt", "");
    			add_location(img14, file$4, 478, 10, 17178);
    			add_location(h39, file$4, 482, 10, 17312);
    			add_location(h418, file$4, 483, 10, 17343);
    			attr_dev(div61, "class", "testimonial-item");
    			add_location(div61, file$4, 470, 8, 16744);
    			attr_dev(div62, "class", "owl-carousel testimonials-carousel");
    			add_location(div62, file$4, 405, 6, 14167);
    			attr_dev(div63, "class", "container");
    			attr_dev(div63, "data-aos", "fade-up");
    			add_location(div63, file$4, 394, 4, 13722);
    			attr_dev(section5, "id", "testimonials");
    			attr_dev(section5, "class", "testimonials section-bg");
    			add_location(section5, file$4, 393, 2, 13658);
    			add_location(h23, file$4, 492, 8, 17542);
    			add_location(p29, file$4, 493, 8, 17564);
    			attr_dev(div64, "class", "section-title");
    			add_location(div64, file$4, 491, 6, 17506);
    			if (img15.src !== (img15_src_value = "assets/img/team/team-1.jpg")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "class", "img-fluid");
    			attr_dev(img15, "alt", "");
    			add_location(img15, file$4, 507, 12, 18074);
    			add_location(h419, file$4, 510, 16, 18242);
    			add_location(span6, file$4, 511, 16, 18280);
    			attr_dev(div65, "class", "member-info-content");
    			add_location(div65, file$4, 509, 14, 18192);
    			attr_dev(i25, "class", "icofont-twitter");
    			add_location(i25, file$4, 514, 27, 18400);
    			attr_dev(a5, "href", "");
    			add_location(a5, file$4, 514, 16, 18389);
    			attr_dev(i26, "class", "icofont-facebook");
    			add_location(i26, file$4, 515, 27, 18461);
    			attr_dev(a6, "href", "");
    			add_location(a6, file$4, 515, 16, 18450);
    			attr_dev(i27, "class", "icofont-instagram");
    			add_location(i27, file$4, 516, 27, 18523);
    			attr_dev(a7, "href", "");
    			add_location(a7, file$4, 516, 16, 18512);
    			attr_dev(i28, "class", "icofont-linkedin");
    			add_location(i28, file$4, 517, 27, 18586);
    			attr_dev(a8, "href", "");
    			add_location(a8, file$4, 517, 16, 18575);
    			attr_dev(div66, "class", "social");
    			add_location(div66, file$4, 513, 14, 18352);
    			attr_dev(div67, "class", "member-info");
    			add_location(div67, file$4, 508, 12, 18152);
    			attr_dev(div68, "class", "member");
    			add_location(div68, file$4, 506, 10, 18041);
    			attr_dev(div69, "class", "col-xl-3 col-lg-4 col-md-6");
    			attr_dev(div69, "data-aos", "fade-up");
    			attr_dev(div69, "data-aos-delay", "100");
    			add_location(div69, file$4, 502, 8, 17920);
    			if (img16.src !== (img16_src_value = "assets/img/team/team-2.jpg")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "class", "img-fluid");
    			attr_dev(img16, "alt", "");
    			add_location(img16, file$4, 528, 12, 18856);
    			add_location(h420, file$4, 531, 16, 19024);
    			add_location(span7, file$4, 532, 16, 19063);
    			attr_dev(div70, "class", "member-info-content");
    			add_location(div70, file$4, 530, 14, 18974);
    			attr_dev(i29, "class", "icofont-twitter");
    			add_location(i29, file$4, 535, 27, 19175);
    			attr_dev(a9, "href", "");
    			add_location(a9, file$4, 535, 16, 19164);
    			attr_dev(i30, "class", "icofont-facebook");
    			add_location(i30, file$4, 536, 27, 19236);
    			attr_dev(a10, "href", "");
    			add_location(a10, file$4, 536, 16, 19225);
    			attr_dev(i31, "class", "icofont-instagram");
    			add_location(i31, file$4, 537, 27, 19298);
    			attr_dev(a11, "href", "");
    			add_location(a11, file$4, 537, 16, 19287);
    			attr_dev(i32, "class", "icofont-linkedin");
    			add_location(i32, file$4, 538, 27, 19361);
    			attr_dev(a12, "href", "");
    			add_location(a12, file$4, 538, 16, 19350);
    			attr_dev(div71, "class", "social");
    			add_location(div71, file$4, 534, 14, 19127);
    			attr_dev(div72, "class", "member-info");
    			add_location(div72, file$4, 529, 12, 18934);
    			attr_dev(div73, "class", "member");
    			add_location(div73, file$4, 527, 10, 18823);
    			attr_dev(div74, "class", "col-xl-3 col-lg-4 col-md-6");
    			attr_dev(div74, "data-aos", "fade-up");
    			attr_dev(div74, "data-aos-delay", "200");
    			add_location(div74, file$4, 523, 8, 18702);
    			if (img17.src !== (img17_src_value = "assets/img/team/team-3.jpg")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "class", "img-fluid");
    			attr_dev(img17, "alt", "");
    			add_location(img17, file$4, 549, 12, 19631);
    			add_location(h421, file$4, 552, 16, 19799);
    			add_location(span8, file$4, 553, 16, 19841);
    			attr_dev(div75, "class", "member-info-content");
    			add_location(div75, file$4, 551, 14, 19749);
    			attr_dev(i33, "class", "icofont-twitter");
    			add_location(i33, file$4, 556, 27, 19941);
    			attr_dev(a13, "href", "");
    			add_location(a13, file$4, 556, 16, 19930);
    			attr_dev(i34, "class", "icofont-facebook");
    			add_location(i34, file$4, 557, 27, 20002);
    			attr_dev(a14, "href", "");
    			add_location(a14, file$4, 557, 16, 19991);
    			attr_dev(i35, "class", "icofont-instagram");
    			add_location(i35, file$4, 558, 27, 20064);
    			attr_dev(a15, "href", "");
    			add_location(a15, file$4, 558, 16, 20053);
    			attr_dev(i36, "class", "icofont-linkedin");
    			add_location(i36, file$4, 559, 27, 20127);
    			attr_dev(a16, "href", "");
    			add_location(a16, file$4, 559, 16, 20116);
    			attr_dev(div76, "class", "social");
    			add_location(div76, file$4, 555, 14, 19893);
    			attr_dev(div77, "class", "member-info");
    			add_location(div77, file$4, 550, 12, 19709);
    			attr_dev(div78, "class", "member");
    			add_location(div78, file$4, 548, 10, 19598);
    			attr_dev(div79, "class", "col-xl-3 col-lg-4 col-md-6");
    			attr_dev(div79, "data-aos", "fade-up");
    			attr_dev(div79, "data-aos-delay", "300");
    			add_location(div79, file$4, 544, 8, 19477);
    			if (img18.src !== (img18_src_value = "assets/img/team/team-4.jpg")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "class", "img-fluid");
    			attr_dev(img18, "alt", "");
    			add_location(img18, file$4, 570, 12, 20397);
    			add_location(h422, file$4, 573, 16, 20565);
    			add_location(span9, file$4, 574, 16, 20604);
    			attr_dev(div80, "class", "member-info-content");
    			add_location(div80, file$4, 572, 14, 20515);
    			attr_dev(i37, "class", "icofont-twitter");
    			add_location(i37, file$4, 577, 27, 20711);
    			attr_dev(a17, "href", "");
    			add_location(a17, file$4, 577, 16, 20700);
    			attr_dev(i38, "class", "icofont-facebook");
    			add_location(i38, file$4, 578, 27, 20772);
    			attr_dev(a18, "href", "");
    			add_location(a18, file$4, 578, 16, 20761);
    			attr_dev(i39, "class", "icofont-instagram");
    			add_location(i39, file$4, 579, 27, 20834);
    			attr_dev(a19, "href", "");
    			add_location(a19, file$4, 579, 16, 20823);
    			attr_dev(i40, "class", "icofont-linkedin");
    			add_location(i40, file$4, 580, 27, 20897);
    			attr_dev(a20, "href", "");
    			add_location(a20, file$4, 580, 16, 20886);
    			attr_dev(div81, "class", "social");
    			add_location(div81, file$4, 576, 14, 20663);
    			attr_dev(div82, "class", "member-info");
    			add_location(div82, file$4, 571, 12, 20475);
    			attr_dev(div83, "class", "member");
    			add_location(div83, file$4, 569, 10, 20364);
    			attr_dev(div84, "class", "col-xl-3 col-lg-4 col-md-6");
    			attr_dev(div84, "data-aos", "fade-up");
    			attr_dev(div84, "data-aos-delay", "400");
    			add_location(div84, file$4, 565, 8, 20243);
    			attr_dev(div85, "class", "row");
    			add_location(div85, file$4, 501, 6, 17894);
    			attr_dev(div86, "class", "container");
    			attr_dev(div86, "data-aos", "fade-up");
    			add_location(div86, file$4, 490, 4, 17457);
    			attr_dev(section6, "id", "team");
    			attr_dev(section6, "class", "team");
    			add_location(section6, file$4, 489, 2, 17420);
    			add_location(h24, file$4, 592, 8, 21183);
    			add_location(p30, file$4, 593, 8, 21208);
    			attr_dev(div87, "class", "section-title");
    			add_location(div87, file$4, 591, 6, 21147);
    			add_location(h310, file$4, 604, 12, 21676);
    			add_location(sup0, file$4, 605, 16, 21706);
    			add_location(span10, file$4, 605, 29, 21719);
    			add_location(h423, file$4, 605, 12, 21702);
    			add_location(li6, file$4, 607, 14, 21777);
    			add_location(li7, file$4, 608, 14, 21810);
    			add_location(li8, file$4, 609, 14, 21850);
    			attr_dev(li9, "class", "na");
    			add_location(li9, file$4, 610, 14, 21896);
    			attr_dev(li10, "class", "na");
    			add_location(li10, file$4, 611, 14, 21945);
    			add_location(ul2, file$4, 606, 12, 21758);
    			attr_dev(a21, "href", "#");
    			attr_dev(a21, "class", "btn-buy");
    			add_location(a21, file$4, 613, 34, 22036);
    			attr_dev(div88, "class", "btn-wrap");
    			add_location(div88, file$4, 613, 12, 22014);
    			attr_dev(div89, "class", "box");
    			add_location(div89, file$4, 603, 10, 21646);
    			attr_dev(div90, "class", "col-lg-4 col-md-6");
    			attr_dev(div90, "data-aos", "zoom-in");
    			attr_dev(div90, "data-aos-delay", "200");
    			add_location(div90, file$4, 602, 8, 21564);
    			add_location(h311, file$4, 622, 12, 22287);
    			add_location(sup1, file$4, 623, 16, 22321);
    			add_location(span11, file$4, 623, 30, 22335);
    			add_location(h424, file$4, 623, 12, 22317);
    			add_location(li11, file$4, 625, 14, 22393);
    			add_location(li12, file$4, 626, 14, 22426);
    			add_location(li13, file$4, 627, 14, 22466);
    			add_location(li14, file$4, 628, 14, 22512);
    			attr_dev(li15, "class", "na");
    			add_location(li15, file$4, 629, 14, 22550);
    			add_location(ul3, file$4, 624, 12, 22374);
    			attr_dev(a22, "href", "#");
    			attr_dev(a22, "class", "btn-buy");
    			add_location(a22, file$4, 631, 34, 22641);
    			attr_dev(div91, "class", "btn-wrap");
    			add_location(div91, file$4, 631, 12, 22619);
    			attr_dev(div92, "class", "box featured");
    			add_location(div92, file$4, 621, 10, 22248);
    			attr_dev(div93, "class", "col-lg-4 col-md-6 mt-4 mt-md-0");
    			attr_dev(div93, "data-aos", "zoom-in");
    			attr_dev(div93, "data-aos-delay", "100");
    			add_location(div93, file$4, 617, 8, 22123);
    			add_location(h312, file$4, 640, 12, 22883);
    			add_location(sup2, file$4, 641, 16, 22918);
    			add_location(span12, file$4, 641, 30, 22932);
    			add_location(h425, file$4, 641, 12, 22914);
    			add_location(li16, file$4, 643, 14, 22990);
    			add_location(li17, file$4, 644, 14, 23023);
    			add_location(li18, file$4, 645, 14, 23063);
    			add_location(li19, file$4, 646, 14, 23109);
    			add_location(li20, file$4, 647, 14, 23147);
    			add_location(ul4, file$4, 642, 12, 22971);
    			attr_dev(a23, "href", "#");
    			attr_dev(a23, "class", "btn-buy");
    			add_location(a23, file$4, 649, 34, 23227);
    			attr_dev(div94, "class", "btn-wrap");
    			add_location(div94, file$4, 649, 12, 23205);
    			attr_dev(div95, "class", "box");
    			add_location(div95, file$4, 639, 10, 22853);
    			attr_dev(div96, "class", "col-lg-4 col-md-6 mt-4 mt-lg-0");
    			attr_dev(div96, "data-aos", "zoom-in");
    			attr_dev(div96, "data-aos-delay", "200");
    			add_location(div96, file$4, 635, 8, 22728);
    			attr_dev(div97, "class", "row");
    			add_location(div97, file$4, 601, 6, 21538);
    			attr_dev(div98, "class", "container");
    			attr_dev(div98, "data-aos", "fade-up");
    			add_location(div98, file$4, 590, 4, 21098);
    			attr_dev(section7, "id", "pricing");
    			attr_dev(section7, "class", "pricing section-bg");
    			add_location(section7, file$4, 589, 2, 21044);
    			add_location(h25, file$4, 659, 8, 23465);
    			attr_dev(div99, "class", "section-title");
    			add_location(div99, file$4, 658, 6, 23429);
    			attr_dev(i41, "class", "icofont-simple-up");
    			add_location(i41, file$4, 666, 12, 23739);
    			attr_dev(a24, "data-bs-toggle", "collapse");
    			attr_dev(a24, "class", "");
    			attr_dev(a24, "data-bs-target", "#faq1");
    			add_location(a24, file$4, 664, 10, 23606);
    			add_location(p31, file$4, 668, 12, 23862);
    			attr_dev(div100, "id", "faq1");
    			attr_dev(div100, "class", "collapse show");
    			attr_dev(div100, "data-bs-parent", ".faq-list");
    			add_location(div100, file$4, 667, 10, 23785);
    			attr_dev(li21, "data-aos", "fade-up");
    			attr_dev(li21, "data-aos-delay", "100");
    			add_location(li21, file$4, 663, 8, 23551);
    			attr_dev(i42, "class", "icofont-simple-up");
    			add_location(i42, file$4, 682, 12, 24398);
    			attr_dev(a25, "data-bs-toggle", "collapse");
    			attr_dev(a25, "data-bs-target", "#faq2");
    			attr_dev(a25, "class", "collapsed");
    			add_location(a25, file$4, 677, 10, 24200);
    			add_location(p32, file$4, 684, 12, 24516);
    			attr_dev(div101, "id", "faq2");
    			attr_dev(div101, "class", "collapse");
    			attr_dev(div101, "data-bs-parent", ".faq-list");
    			add_location(div101, file$4, 683, 10, 24444);
    			attr_dev(li22, "data-aos", "fade-up");
    			attr_dev(li22, "data-aos-delay", "200");
    			add_location(li22, file$4, 676, 8, 24145);
    			attr_dev(i43, "class", "icofont-simple-up");
    			add_location(i43, file$4, 700, 12, 25190);
    			attr_dev(a26, "data-bs-toggle", "collapse");
    			attr_dev(a26, "data-bs-target", "#faq3");
    			attr_dev(a26, "class", "collapsed");
    			add_location(a26, file$4, 695, 10, 24988);
    			add_location(p33, file$4, 702, 12, 25308);
    			attr_dev(div102, "id", "faq3");
    			attr_dev(div102, "class", "collapse");
    			attr_dev(div102, "data-bs-parent", ".faq-list");
    			add_location(div102, file$4, 701, 10, 25236);
    			attr_dev(li23, "data-aos", "fade-up");
    			attr_dev(li23, "data-aos-delay", "300");
    			add_location(li23, file$4, 694, 8, 24933);
    			attr_dev(i44, "class", "icofont-simple-up");
    			add_location(i44, file$4, 718, 12, 25993);
    			attr_dev(a27, "data-bs-toggle", "collapse");
    			attr_dev(a27, "data-bs-target", "#faq4");
    			attr_dev(a27, "class", "collapsed");
    			add_location(a27, file$4, 713, 10, 25804);
    			add_location(p34, file$4, 720, 12, 26111);
    			attr_dev(div103, "id", "faq4");
    			attr_dev(div103, "class", "collapse");
    			attr_dev(div103, "data-bs-parent", ".faq-list");
    			add_location(div103, file$4, 719, 10, 26039);
    			attr_dev(li24, "data-aos", "fade-up");
    			attr_dev(li24, "data-aos-delay", "400");
    			add_location(li24, file$4, 712, 8, 25749);
    			attr_dev(i45, "class", "icofont-simple-up");
    			add_location(i45, file$4, 736, 12, 26779);
    			attr_dev(a28, "data-bs-toggle", "collapse");
    			attr_dev(a28, "data-bs-target", "#faq5");
    			attr_dev(a28, "class", "collapsed");
    			add_location(a28, file$4, 731, 10, 26583);
    			add_location(p35, file$4, 738, 12, 26897);
    			attr_dev(div104, "id", "faq5");
    			attr_dev(div104, "class", "collapse");
    			attr_dev(div104, "data-bs-parent", ".faq-list");
    			add_location(div104, file$4, 737, 10, 26825);
    			attr_dev(li25, "data-aos", "fade-up");
    			attr_dev(li25, "data-aos-delay", "500");
    			add_location(li25, file$4, 730, 8, 26528);
    			attr_dev(i46, "class", "icofont-simple-up");
    			add_location(i46, file$4, 753, 12, 27529);
    			attr_dev(a29, "data-bs-toggle", "collapse");
    			attr_dev(a29, "data-bs-target", "#faq6");
    			attr_dev(a29, "class", "collapsed");
    			add_location(a29, file$4, 748, 10, 27309);
    			add_location(p36, file$4, 755, 12, 27647);
    			attr_dev(div105, "id", "faq6");
    			attr_dev(div105, "class", "collapse");
    			attr_dev(div105, "data-bs-parent", ".faq-list");
    			add_location(div105, file$4, 754, 10, 27575);
    			attr_dev(li26, "data-aos", "fade-up");
    			attr_dev(li26, "data-aos-delay", "600");
    			add_location(li26, file$4, 747, 8, 27254);
    			attr_dev(ul5, "class", "faq-list");
    			add_location(ul5, file$4, 662, 6, 23521);
    			attr_dev(div106, "class", "container");
    			attr_dev(div106, "data-aos", "fade-up");
    			add_location(div106, file$4, 657, 4, 23380);
    			attr_dev(section8, "id", "faq");
    			attr_dev(section8, "class", "faq");
    			add_location(section8, file$4, 656, 2, 23345);
    			add_location(h26, file$4, 772, 8, 28345);
    			add_location(p37, file$4, 773, 8, 28370);
    			attr_dev(div107, "class", "section-title");
    			add_location(div107, file$4, 771, 6, 28309);
    			attr_dev(i47, "class", "bx bx-map");
    			add_location(i47, file$4, 786, 16, 28866);
    			add_location(h313, file$4, 787, 16, 28906);
    			add_location(p38, file$4, 788, 16, 28940);
    			attr_dev(div108, "class", "info-box");
    			add_location(div108, file$4, 785, 14, 28827);
    			attr_dev(div109, "class", "col-md-12");
    			add_location(div109, file$4, 784, 12, 28789);
    			attr_dev(i48, "class", "bx bx-envelope");
    			add_location(i48, file$4, 793, 16, 29098);
    			add_location(h314, file$4, 794, 16, 29143);
    			add_location(br0, file$4, 796, 43, 29224);
    			add_location(p39, file$4, 795, 16, 29177);
    			attr_dev(div110, "class", "info-box mt-4");
    			add_location(div110, file$4, 792, 14, 29054);
    			attr_dev(div111, "class", "col-md-6");
    			add_location(div111, file$4, 791, 12, 29017);
    			attr_dev(i49, "class", "bx bx-phone-call");
    			add_location(i49, file$4, 802, 16, 29413);
    			add_location(h315, file$4, 803, 16, 29460);
    			add_location(br1, file$4, 804, 35, 29512);
    			add_location(p40, file$4, 804, 16, 29493);
    			attr_dev(div112, "class", "info-box mt-4");
    			add_location(div112, file$4, 801, 14, 29369);
    			attr_dev(div113, "class", "col-md-6");
    			add_location(div113, file$4, 800, 12, 29332);
    			attr_dev(div114, "class", "row");
    			add_location(div114, file$4, 783, 10, 28759);
    			attr_dev(div115, "class", "col-lg-6");
    			add_location(div115, file$4, 782, 8, 28726);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "Your Name");
    			attr_dev(input0, "data-rule", "minlen:4");
    			attr_dev(input0, "data-msg", "Please enter at least 4 chars");
    			add_location(input0, file$4, 818, 16, 29892);
    			attr_dev(div116, "class", "validate");
    			add_location(div116, file$4, 826, 16, 30185);
    			attr_dev(div117, "class", "col-md-6 form-group");
    			add_location(div117, file$4, 817, 14, 29842);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "placeholder", "Your Email");
    			attr_dev(input1, "data-rule", "email");
    			attr_dev(input1, "data-msg", "Please enter a valid email");
    			add_location(input1, file$4, 829, 16, 30308);
    			attr_dev(div118, "class", "validate");
    			add_location(div118, file$4, 837, 16, 30599);
    			attr_dev(div119, "class", "col-md-6 form-group mt-3 mt-md-0");
    			add_location(div119, file$4, 828, 14, 30245);
    			attr_dev(div120, "class", "row");
    			add_location(div120, file$4, 816, 12, 29810);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "name", "subject");
    			attr_dev(input2, "id", "subject");
    			attr_dev(input2, "placeholder", "Subject");
    			attr_dev(input2, "data-rule", "minlen:4");
    			attr_dev(input2, "data-msg", "Please enter at least 8 chars of subject");
    			add_location(input2, file$4, 841, 14, 30720);
    			attr_dev(div121, "class", "validate");
    			add_location(div121, file$4, 849, 14, 31012);
    			attr_dev(div122, "class", "form-group mt-3");
    			add_location(div122, file$4, 840, 12, 30676);
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "data-rule", "required");
    			attr_dev(textarea, "data-msg", "Please write something for us");
    			attr_dev(textarea, "placeholder", "Message");
    			add_location(textarea, file$4, 852, 14, 31112);
    			attr_dev(div123, "class", "validate");
    			add_location(div123, file$4, 859, 14, 31364);
    			attr_dev(div124, "class", "form-group mt-3");
    			add_location(div124, file$4, 851, 12, 31068);
    			attr_dev(div125, "class", "loading");
    			add_location(div125, file$4, 862, 14, 31453);
    			attr_dev(div126, "class", "error-message");
    			add_location(div126, file$4, 863, 14, 31502);
    			attr_dev(div127, "class", "sent-message");
    			add_location(div127, file$4, 864, 14, 31546);
    			attr_dev(div128, "class", "mb-3");
    			add_location(div128, file$4, 861, 12, 31420);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$4, 869, 14, 31720);
    			attr_dev(div129, "class", "text-center");
    			add_location(div129, file$4, 868, 12, 31680);
    			attr_dev(form, "action", "forms/contact.php");
    			attr_dev(form, "method", "post");
    			attr_dev(form, "role", "form");
    			attr_dev(form, "class", "php-email-form");
    			add_location(form, file$4, 811, 10, 29667);
    			attr_dev(div130, "class", "col-lg-6 mt-4 mt-md-0");
    			add_location(div130, file$4, 810, 8, 29621);
    			attr_dev(div131, "class", "row");
    			add_location(div131, file$4, 781, 6, 28700);
    			attr_dev(div132, "class", "container");
    			attr_dev(div132, "data-aos", "fade-up");
    			add_location(div132, file$4, 770, 4, 28260);
    			attr_dev(section9, "id", "contact");
    			attr_dev(section9, "class", "contact section-bg");
    			add_location(section9, file$4, 769, 2, 28206);
    			attr_dev(main, "id", "main");
    			add_location(main, file$4, 17, 0, 325);
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
    			append_dev(div0, t5);
    			append_dev(div0, a0);
    			append_dev(a0, t6);
    			append_dev(a0, i0);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, i1);
    			append_dev(div2, t8);
    			append_dev(div2, h40);
    			append_dev(div2, t10);
    			append_dev(div2, p1);
    			append_dev(div6, t12);
    			append_dev(div6, div3);
    			append_dev(div3, i2);
    			append_dev(div3, t13);
    			append_dev(div3, h41);
    			append_dev(div3, t15);
    			append_dev(div3, p2);
    			append_dev(div6, t17);
    			append_dev(div6, div4);
    			append_dev(div4, i3);
    			append_dev(div4, t18);
    			append_dev(div4, h42);
    			append_dev(div4, t20);
    			append_dev(div4, p3);
    			append_dev(div6, t22);
    			append_dev(div6, div5);
    			append_dev(div5, i4);
    			append_dev(div5, t23);
    			append_dev(div5, h43);
    			append_dev(div5, t25);
    			append_dev(div5, p4);
    			append_dev(main, t27);
    			append_dev(main, section1);
    			append_dev(section1, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div11);
    			append_dev(div11, img0);
    			append_dev(div17, t28);
    			append_dev(div17, div12);
    			append_dev(div12, img1);
    			append_dev(div17, t29);
    			append_dev(div17, div13);
    			append_dev(div13, img2);
    			append_dev(div17, t30);
    			append_dev(div17, div14);
    			append_dev(div14, img3);
    			append_dev(div17, t31);
    			append_dev(div17, div15);
    			append_dev(div15, img4);
    			append_dev(div17, t32);
    			append_dev(div17, div16);
    			append_dev(div16, img5);
    			append_dev(main, t33);
    			append_dev(main, section2);
    			append_dev(section2, div32);
    			append_dev(div32, div19);
    			append_dev(div19, h20);
    			append_dev(div19, t35);
    			append_dev(div19, p5);
    			append_dev(div32, t37);
    			append_dev(div32, div22);
    			append_dev(div22, div20);
    			append_dev(div20, img6);
    			append_dev(div22, t38);
    			append_dev(div22, div21);
    			append_dev(div21, h31);
    			append_dev(div21, t40);
    			append_dev(div21, p6);
    			append_dev(div21, t42);
    			append_dev(div21, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, i5);
    			append_dev(li0, t43);
    			append_dev(ul0, t44);
    			append_dev(ul0, li1);
    			append_dev(li1, i6);
    			append_dev(li1, t45);
    			append_dev(ul0, t46);
    			append_dev(ul0, li2);
    			append_dev(li2, i7);
    			append_dev(li2, t47);
    			append_dev(div32, t48);
    			append_dev(div32, div25);
    			append_dev(div25, div23);
    			append_dev(div23, img7);
    			append_dev(div25, t49);
    			append_dev(div25, div24);
    			append_dev(div24, h32);
    			append_dev(div24, t51);
    			append_dev(div24, p7);
    			append_dev(div24, t53);
    			append_dev(div24, p8);
    			append_dev(div32, t55);
    			append_dev(div32, div28);
    			append_dev(div28, div26);
    			append_dev(div26, img8);
    			append_dev(div28, t56);
    			append_dev(div28, div27);
    			append_dev(div27, h33);
    			append_dev(div27, t58);
    			append_dev(div27, p9);
    			append_dev(div27, t60);
    			append_dev(div27, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, i8);
    			append_dev(li3, t61);
    			append_dev(ul1, t62);
    			append_dev(ul1, li4);
    			append_dev(li4, i9);
    			append_dev(li4, t63);
    			append_dev(ul1, t64);
    			append_dev(ul1, li5);
    			append_dev(li5, i10);
    			append_dev(li5, t65);
    			append_dev(div32, t66);
    			append_dev(div32, div31);
    			append_dev(div31, div29);
    			append_dev(div29, img9);
    			append_dev(div31, t67);
    			append_dev(div31, div30);
    			append_dev(div30, h34);
    			append_dev(div30, t69);
    			append_dev(div30, p10);
    			append_dev(div30, t71);
    			append_dev(div30, p11);
    			append_dev(main, t73);
    			append_dev(main, section3);
    			append_dev(section3, div40);
    			append_dev(div40, div39);
    			append_dev(div39, div33);
    			append_dev(div33, span0);
    			append_dev(div33, t75);
    			append_dev(div33, h44);
    			append_dev(div33, t77);
    			append_dev(div33, p12);
    			append_dev(div39, t79);
    			append_dev(div39, div34);
    			append_dev(div34, span1);
    			append_dev(div34, t81);
    			append_dev(div34, h45);
    			append_dev(div34, t83);
    			append_dev(div34, p13);
    			append_dev(div39, t85);
    			append_dev(div39, div35);
    			append_dev(div35, span2);
    			append_dev(div35, t87);
    			append_dev(div35, h46);
    			append_dev(div35, t89);
    			append_dev(div35, p14);
    			append_dev(div39, t91);
    			append_dev(div39, div36);
    			append_dev(div36, span3);
    			append_dev(div36, t93);
    			append_dev(div36, h47);
    			append_dev(div36, t95);
    			append_dev(div36, p15);
    			append_dev(div39, t97);
    			append_dev(div39, div37);
    			append_dev(div37, span4);
    			append_dev(div37, t99);
    			append_dev(div37, h48);
    			append_dev(div37, t101);
    			append_dev(div37, p16);
    			append_dev(div39, t103);
    			append_dev(div39, div38);
    			append_dev(div38, span5);
    			append_dev(div38, t105);
    			append_dev(div38, h49);
    			append_dev(div38, t107);
    			append_dev(div38, p17);
    			append_dev(main, t109);
    			append_dev(main, section4);
    			append_dev(section4, div55);
    			append_dev(div55, div41);
    			append_dev(div41, h21);
    			append_dev(div41, t111);
    			append_dev(div41, p18);
    			append_dev(div55, t113);
    			append_dev(div55, div54);
    			append_dev(div54, div44);
    			append_dev(div44, div43);
    			append_dev(div43, div42);
    			append_dev(div42, i11);
    			append_dev(div43, t114);
    			append_dev(div43, h410);
    			append_dev(h410, a1);
    			append_dev(div43, t116);
    			append_dev(div43, p19);
    			append_dev(div54, t118);
    			append_dev(div54, div47);
    			append_dev(div47, div46);
    			append_dev(div46, div45);
    			append_dev(div45, i12);
    			append_dev(div46, t119);
    			append_dev(div46, h411);
    			append_dev(h411, a2);
    			append_dev(div46, t121);
    			append_dev(div46, p20);
    			append_dev(div54, t123);
    			append_dev(div54, div50);
    			append_dev(div50, div49);
    			append_dev(div49, div48);
    			append_dev(div48, i13);
    			append_dev(div49, t124);
    			append_dev(div49, h412);
    			append_dev(h412, a3);
    			append_dev(div49, t126);
    			append_dev(div49, p21);
    			append_dev(div54, t128);
    			append_dev(div54, div53);
    			append_dev(div53, div52);
    			append_dev(div52, div51);
    			append_dev(div51, i14);
    			append_dev(div52, t129);
    			append_dev(div52, h413);
    			append_dev(h413, a4);
    			append_dev(div52, t131);
    			append_dev(div52, p22);
    			append_dev(main, t133);
    			append_dev(main, section5);
    			append_dev(section5, div63);
    			append_dev(div63, div56);
    			append_dev(div56, h22);
    			append_dev(div56, t135);
    			append_dev(div56, p23);
    			append_dev(div63, t137);
    			append_dev(div63, div62);
    			append_dev(div62, div57);
    			append_dev(div57, p24);
    			append_dev(p24, i15);
    			append_dev(p24, t138);
    			append_dev(p24, i16);
    			append_dev(div57, t139);
    			append_dev(div57, img10);
    			append_dev(div57, t140);
    			append_dev(div57, h35);
    			append_dev(div57, t142);
    			append_dev(div57, h414);
    			append_dev(div62, t144);
    			append_dev(div62, div58);
    			append_dev(div58, p25);
    			append_dev(p25, i17);
    			append_dev(p25, t145);
    			append_dev(p25, i18);
    			append_dev(div58, t146);
    			append_dev(div58, img11);
    			append_dev(div58, t147);
    			append_dev(div58, h36);
    			append_dev(div58, t149);
    			append_dev(div58, h415);
    			append_dev(div62, t151);
    			append_dev(div62, div59);
    			append_dev(div59, p26);
    			append_dev(p26, i19);
    			append_dev(p26, t152);
    			append_dev(p26, i20);
    			append_dev(div59, t153);
    			append_dev(div59, img12);
    			append_dev(div59, t154);
    			append_dev(div59, h37);
    			append_dev(div59, t156);
    			append_dev(div59, h416);
    			append_dev(div62, t158);
    			append_dev(div62, div60);
    			append_dev(div60, p27);
    			append_dev(p27, i21);
    			append_dev(p27, t159);
    			append_dev(p27, i22);
    			append_dev(div60, t160);
    			append_dev(div60, img13);
    			append_dev(div60, t161);
    			append_dev(div60, h38);
    			append_dev(div60, t163);
    			append_dev(div60, h417);
    			append_dev(div62, t165);
    			append_dev(div62, div61);
    			append_dev(div61, p28);
    			append_dev(p28, i23);
    			append_dev(p28, t166);
    			append_dev(p28, i24);
    			append_dev(div61, t167);
    			append_dev(div61, img14);
    			append_dev(div61, t168);
    			append_dev(div61, h39);
    			append_dev(div61, t170);
    			append_dev(div61, h418);
    			append_dev(main, t172);
    			append_dev(main, section6);
    			append_dev(section6, div86);
    			append_dev(div86, div64);
    			append_dev(div64, h23);
    			append_dev(div64, t174);
    			append_dev(div64, p29);
    			append_dev(div86, t176);
    			append_dev(div86, div85);
    			append_dev(div85, div69);
    			append_dev(div69, div68);
    			append_dev(div68, img15);
    			append_dev(div68, t177);
    			append_dev(div68, div67);
    			append_dev(div67, div65);
    			append_dev(div65, h419);
    			append_dev(div65, t179);
    			append_dev(div65, span6);
    			append_dev(div67, t181);
    			append_dev(div67, div66);
    			append_dev(div66, a5);
    			append_dev(a5, i25);
    			append_dev(div66, t182);
    			append_dev(div66, a6);
    			append_dev(a6, i26);
    			append_dev(div66, t183);
    			append_dev(div66, a7);
    			append_dev(a7, i27);
    			append_dev(div66, t184);
    			append_dev(div66, a8);
    			append_dev(a8, i28);
    			append_dev(div85, t185);
    			append_dev(div85, div74);
    			append_dev(div74, div73);
    			append_dev(div73, img16);
    			append_dev(div73, t186);
    			append_dev(div73, div72);
    			append_dev(div72, div70);
    			append_dev(div70, h420);
    			append_dev(div70, t188);
    			append_dev(div70, span7);
    			append_dev(div72, t190);
    			append_dev(div72, div71);
    			append_dev(div71, a9);
    			append_dev(a9, i29);
    			append_dev(div71, t191);
    			append_dev(div71, a10);
    			append_dev(a10, i30);
    			append_dev(div71, t192);
    			append_dev(div71, a11);
    			append_dev(a11, i31);
    			append_dev(div71, t193);
    			append_dev(div71, a12);
    			append_dev(a12, i32);
    			append_dev(div85, t194);
    			append_dev(div85, div79);
    			append_dev(div79, div78);
    			append_dev(div78, img17);
    			append_dev(div78, t195);
    			append_dev(div78, div77);
    			append_dev(div77, div75);
    			append_dev(div75, h421);
    			append_dev(div75, t197);
    			append_dev(div75, span8);
    			append_dev(div77, t199);
    			append_dev(div77, div76);
    			append_dev(div76, a13);
    			append_dev(a13, i33);
    			append_dev(div76, t200);
    			append_dev(div76, a14);
    			append_dev(a14, i34);
    			append_dev(div76, t201);
    			append_dev(div76, a15);
    			append_dev(a15, i35);
    			append_dev(div76, t202);
    			append_dev(div76, a16);
    			append_dev(a16, i36);
    			append_dev(div85, t203);
    			append_dev(div85, div84);
    			append_dev(div84, div83);
    			append_dev(div83, img18);
    			append_dev(div83, t204);
    			append_dev(div83, div82);
    			append_dev(div82, div80);
    			append_dev(div80, h422);
    			append_dev(div80, t206);
    			append_dev(div80, span9);
    			append_dev(div82, t208);
    			append_dev(div82, div81);
    			append_dev(div81, a17);
    			append_dev(a17, i37);
    			append_dev(div81, t209);
    			append_dev(div81, a18);
    			append_dev(a18, i38);
    			append_dev(div81, t210);
    			append_dev(div81, a19);
    			append_dev(a19, i39);
    			append_dev(div81, t211);
    			append_dev(div81, a20);
    			append_dev(a20, i40);
    			append_dev(main, t212);
    			append_dev(main, section7);
    			append_dev(section7, div98);
    			append_dev(div98, div87);
    			append_dev(div87, h24);
    			append_dev(div87, t214);
    			append_dev(div87, p30);
    			append_dev(div98, t216);
    			append_dev(div98, div97);
    			append_dev(div97, div90);
    			append_dev(div90, div89);
    			append_dev(div89, h310);
    			append_dev(div89, t218);
    			append_dev(div89, h423);
    			append_dev(h423, sup0);
    			append_dev(h423, t220);
    			append_dev(h423, span10);
    			append_dev(div89, t222);
    			append_dev(div89, ul2);
    			append_dev(ul2, li6);
    			append_dev(ul2, t224);
    			append_dev(ul2, li7);
    			append_dev(ul2, t226);
    			append_dev(ul2, li8);
    			append_dev(ul2, t228);
    			append_dev(ul2, li9);
    			append_dev(ul2, t230);
    			append_dev(ul2, li10);
    			append_dev(div89, t232);
    			append_dev(div89, div88);
    			append_dev(div88, a21);
    			append_dev(div97, t234);
    			append_dev(div97, div93);
    			append_dev(div93, div92);
    			append_dev(div92, h311);
    			append_dev(div92, t236);
    			append_dev(div92, h424);
    			append_dev(h424, sup1);
    			append_dev(h424, t238);
    			append_dev(h424, span11);
    			append_dev(div92, t240);
    			append_dev(div92, ul3);
    			append_dev(ul3, li11);
    			append_dev(ul3, t242);
    			append_dev(ul3, li12);
    			append_dev(ul3, t244);
    			append_dev(ul3, li13);
    			append_dev(ul3, t246);
    			append_dev(ul3, li14);
    			append_dev(ul3, t248);
    			append_dev(ul3, li15);
    			append_dev(div92, t250);
    			append_dev(div92, div91);
    			append_dev(div91, a22);
    			append_dev(div97, t252);
    			append_dev(div97, div96);
    			append_dev(div96, div95);
    			append_dev(div95, h312);
    			append_dev(div95, t254);
    			append_dev(div95, h425);
    			append_dev(h425, sup2);
    			append_dev(h425, t256);
    			append_dev(h425, span12);
    			append_dev(div95, t258);
    			append_dev(div95, ul4);
    			append_dev(ul4, li16);
    			append_dev(ul4, t260);
    			append_dev(ul4, li17);
    			append_dev(ul4, t262);
    			append_dev(ul4, li18);
    			append_dev(ul4, t264);
    			append_dev(ul4, li19);
    			append_dev(ul4, t266);
    			append_dev(ul4, li20);
    			append_dev(div95, t268);
    			append_dev(div95, div94);
    			append_dev(div94, a23);
    			append_dev(main, t270);
    			append_dev(main, section8);
    			append_dev(section8, div106);
    			append_dev(div106, div99);
    			append_dev(div99, h25);
    			append_dev(div106, t272);
    			append_dev(div106, ul5);
    			append_dev(ul5, li21);
    			append_dev(li21, a24);
    			append_dev(a24, t273);
    			append_dev(a24, i41);
    			append_dev(li21, t274);
    			append_dev(li21, div100);
    			append_dev(div100, p31);
    			append_dev(ul5, t276);
    			append_dev(ul5, li22);
    			append_dev(li22, a25);
    			append_dev(a25, t277);
    			append_dev(a25, i42);
    			append_dev(li22, t278);
    			append_dev(li22, div101);
    			append_dev(div101, p32);
    			append_dev(ul5, t280);
    			append_dev(ul5, li23);
    			append_dev(li23, a26);
    			append_dev(a26, t281);
    			append_dev(a26, i43);
    			append_dev(li23, t282);
    			append_dev(li23, div102);
    			append_dev(div102, p33);
    			append_dev(ul5, t284);
    			append_dev(ul5, li24);
    			append_dev(li24, a27);
    			append_dev(a27, t285);
    			append_dev(a27, i44);
    			append_dev(li24, t286);
    			append_dev(li24, div103);
    			append_dev(div103, p34);
    			append_dev(ul5, t288);
    			append_dev(ul5, li25);
    			append_dev(li25, a28);
    			append_dev(a28, t289);
    			append_dev(a28, i45);
    			append_dev(li25, t290);
    			append_dev(li25, div104);
    			append_dev(div104, p35);
    			append_dev(ul5, t292);
    			append_dev(ul5, li26);
    			append_dev(li26, a29);
    			append_dev(a29, t293);
    			append_dev(a29, i46);
    			append_dev(li26, t294);
    			append_dev(li26, div105);
    			append_dev(div105, p36);
    			append_dev(main, t296);
    			append_dev(main, section9);
    			append_dev(section9, div132);
    			append_dev(div132, div107);
    			append_dev(div107, h26);
    			append_dev(div107, t298);
    			append_dev(div107, p37);
    			append_dev(div132, t300);
    			append_dev(div132, div131);
    			append_dev(div131, div115);
    			append_dev(div115, div114);
    			append_dev(div114, div109);
    			append_dev(div109, div108);
    			append_dev(div108, i47);
    			append_dev(div108, t301);
    			append_dev(div108, h313);
    			append_dev(div108, t303);
    			append_dev(div108, p38);
    			append_dev(div114, t305);
    			append_dev(div114, div111);
    			append_dev(div111, div110);
    			append_dev(div110, i48);
    			append_dev(div110, t306);
    			append_dev(div110, h314);
    			append_dev(div110, t308);
    			append_dev(div110, p39);
    			append_dev(p39, t309);
    			append_dev(p39, br0);
    			append_dev(p39, t310);
    			append_dev(div114, t311);
    			append_dev(div114, div113);
    			append_dev(div113, div112);
    			append_dev(div112, i49);
    			append_dev(div112, t312);
    			append_dev(div112, h315);
    			append_dev(div112, t314);
    			append_dev(div112, p40);
    			append_dev(p40, t315);
    			append_dev(p40, br1);
    			append_dev(p40, t316);
    			append_dev(div131, t317);
    			append_dev(div131, div130);
    			append_dev(div130, form);
    			append_dev(form, div120);
    			append_dev(div120, div117);
    			append_dev(div117, input0);
    			append_dev(div117, t318);
    			append_dev(div117, div116);
    			append_dev(div120, t319);
    			append_dev(div120, div119);
    			append_dev(div119, input1);
    			append_dev(div119, t320);
    			append_dev(div119, div118);
    			append_dev(form, t321);
    			append_dev(form, div122);
    			append_dev(div122, input2);
    			append_dev(div122, t322);
    			append_dev(div122, div121);
    			append_dev(form, t323);
    			append_dev(form, div124);
    			append_dev(div124, textarea);
    			append_dev(div124, t324);
    			append_dev(div124, div123);
    			append_dev(form, t325);
    			append_dev(form, div128);
    			append_dev(div128, div125);
    			append_dev(div128, t327);
    			append_dev(div128, div126);
    			append_dev(div128, t328);
    			append_dev(div128, div127);
    			append_dev(form, t330);
    			append_dev(form, div129);
    			append_dev(div129, button);
    			insert_dev(target, t332, anchor);
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
    			if (detaching) detach_dev(t332);
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
    	let { location } = $$props;
    	const writable_props = ["location"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({
    		Link,
    		IndexNavbar,
    		Footer,
    		Hero,
    		location
    	});

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { location: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !("location" in props)) {
    			console.warn("<Index> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/Privacy.svelte generated by Svelte v3.26.0 */

    const file$5 = "src/views/Privacy.svelte";

    function create_fragment$7(ctx) {
    	let div11;
    	let authnavbar;
    	let t0;
    	let main;
    	let div6;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let h1;
    	let t3;
    	let p0;
    	let t5;
    	let div5;
    	let svg0;
    	let polygon;
    	let t6;
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
    	let t7;
    	let div10;
    	let div9;
    	let div8;
    	let h20;
    	let t9;
    	let div7;
    	let p1;
    	let strong0;
    	let t11;
    	let h3;
    	let t13;
    	let p2;
    	let t14;
    	let a0;
    	let t16;
    	let t17;
    	let p3;
    	let t19;
    	let h21;
    	let t21;
    	let p4;
    	let t23;
    	let ol;
    	let li0;
    	let a1;
    	let strong1;
    	let t25;
    	let li1;
    	let a2;
    	let strong2;
    	let t27;
    	let li2;
    	let a3;
    	let strong3;
    	let t29;
    	let li3;
    	let a4;
    	let strong4;
    	let t31;
    	let li4;
    	let a5;
    	let strong5;
    	let t33;
    	let li5;
    	let a6;
    	let strong6;
    	let t35;
    	let li6;
    	let a7;
    	let strong7;
    	let t37;
    	let li7;
    	let a8;
    	let strong8;
    	let t39;
    	let li8;
    	let a9;
    	let strong9;
    	let t41;
    	let li9;
    	let a10;
    	let strong10;
    	let t43;
    	let li10;
    	let a11;
    	let strong11;
    	let t45;
    	let li11;
    	let a12;
    	let strong12;
    	let t47;
    	let li12;
    	let a13;
    	let strong13;
    	let t49;
    	let h22;
    	let t51;
    	let p5;
    	let t53;
    	let p6;
    	let t55;
    	let p7;
    	let a14;
    	let t57;
    	let h23;
    	let t59;
    	let p8;
    	let t61;
    	let p9;
    	let a15;
    	let t63;
    	let h24;
    	let t65;
    	let p10;
    	let t67;
    	let p11;
    	let a16;
    	let t69;
    	let h25;
    	let t71;
    	let p12;
    	let t73;
    	let p13;
    	let a17;
    	let t75;
    	let h26;
    	let t77;
    	let p14;
    	let t79;
    	let p15;
    	let t81;
    	let p16;
    	let a18;
    	let t83;
    	let h27;
    	let t85;
    	let p17;
    	let t87;
    	let p18;
    	let t89;
    	let p19;
    	let a19;
    	let t91;
    	let h28;
    	let t93;
    	let p20;
    	let t95;
    	let p21;
    	let t97;
    	let p22;
    	let a20;
    	let t99;
    	let h29;
    	let t101;
    	let p23;
    	let t103;
    	let p24;
    	let a21;
    	let t105;
    	let h210;
    	let t107;
    	let p25;
    	let t109;
    	let p26;
    	let a22;
    	let t111;
    	let h211;
    	let t113;
    	let p27;
    	let t115;
    	let p28;
    	let t117;
    	let p29;
    	let t119;
    	let p30;
    	let a23;
    	let t121;
    	let h212;
    	let t123;
    	let p31;
    	let t125;
    	let p32;
    	let a24;
    	let t127;
    	let h213;
    	let t129;
    	let p33;
    	let t131;
    	let p34;
    	let a25;
    	let t133;
    	let h214;
    	let t135;
    	let p35;
    	let t136;
    	let a26;
    	let t138;
    	let a27;
    	let t140;
    	let t141;
    	let footer;
    	let current;
    	authnavbar = new AuthNavbar({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			create_component(authnavbar.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div6 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Tyler's Privacy Policy";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "This policy tells you how we manage privacy on\n                                our site.";
    			t5 = space();
    			div5 = element("div");
    			svg0 = svg_element("svg");
    			polygon = svg_element("polygon");
    			t6 = space();
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
    			t7 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Privacy Policy";
    			t9 = space();
    			div7 = element("div");
    			p1 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Effective Date: 03-12-2020";
    			t11 = space();
    			h3 = element("h3");
    			h3.textContent = "Your privacy is important to us";
    			t13 = space();
    			p2 = element("p");
    			t14 = text("It is Thompson Development Group's policy to\n                                respect your privacy regarding any information\n                                we may collect while operating our website. This\n                                Privacy Policy applies to\n                                ");
    			a0 = element("a");
    			a0.textContent = "www.thompsondevgroup.com";
    			t16 = text("\n                                (hereinafter, \"us\", \"we\", or\n                                \"www.thompsondevgroup.com\"). We respect your\n                                privacy and are committed to protecting\n                                personally identifiable information you may\n                                provide us through the Website. We have adopted\n                                this privacy policy (\"Privacy Policy\") to\n                                explain what information may be collected on our\n                                Website, how we use this information, and under\n                                what circumstances we may disclose the\n                                information to third parties. This Privacy\n                                Policy applies only to information we collect\n                                through the Website and does not apply to our\n                                collection of information from other sources.");
    			t17 = space();
    			p3 = element("p");
    			p3.textContent = "This Privacy Policy, together with the Terms of\n                                service posted on our Website, set forth the\n                                general rules and policies governing your use of\n                                our Website. Depending on your activities when\n                                visiting our Website, you may be required to\n                                agree to additional terms of service.";
    			t19 = space();
    			h21 = element("h2");
    			h21.textContent = "Contents";
    			t21 = space();
    			p4 = element("p");
    			p4.textContent = "Click below to jump to any section of this\n                                privacy policy";
    			t23 = space();
    			ol = element("ol");
    			li0 = element("li");
    			a1 = element("a");
    			strong1 = element("strong");
    			strong1.textContent = "Website\n                                            Visitors";
    			t25 = space();
    			li1 = element("li");
    			a2 = element("a");
    			strong2 = element("strong");
    			strong2.textContent = "Personally-Identifying\n                                            Information";
    			t27 = space();
    			li2 = element("li");
    			a3 = element("a");
    			strong3 = element("strong");
    			strong3.textContent = "Security";
    			t29 = space();
    			li3 = element("li");
    			a4 = element("a");
    			strong4 = element("strong");
    			strong4.textContent = "Advertisements";
    			t31 = space();
    			li4 = element("li");
    			a5 = element("a");
    			strong5 = element("strong");
    			strong5.textContent = "Links To\n                                            External Sites";
    			t33 = space();
    			li5 = element("li");
    			a6 = element("a");
    			strong6 = element("strong");
    			strong6.textContent = "Thompson\n                                            Development Group uses Google\n                                            AdWords for remarketing";
    			t35 = space();
    			li6 = element("li");
    			a7 = element("a");
    			strong7 = element("strong");
    			strong7.textContent = "Protection\n                                            of Certain Personally-Identifying\n                                            Information";
    			t37 = space();
    			li7 = element("li");
    			a8 = element("a");
    			strong8 = element("strong");
    			strong8.textContent = "Aggregated\n                                            Statistics";
    			t39 = space();
    			li8 = element("li");
    			a9 = element("a");
    			strong9 = element("strong");
    			strong9.textContent = "Affiliate\n                                            Disclosure";
    			t41 = space();
    			li9 = element("li");
    			a10 = element("a");
    			strong10 = element("strong");
    			strong10.textContent = "Cookies";
    			t43 = space();
    			li10 = element("li");
    			a11 = element("a");
    			strong11 = element("strong");
    			strong11.textContent = "E-commerce";
    			t45 = space();
    			li11 = element("li");
    			a12 = element("a");
    			strong12 = element("strong");
    			strong12.textContent = "Privacy Policy\n                                            Changes";
    			t47 = space();
    			li12 = element("li");
    			a13 = element("a");
    			strong13 = element("strong");
    			strong13.textContent = "Contact\n                                            Information & Credit";
    			t49 = space();
    			h22 = element("h2");
    			h22.textContent = "1. Website Visitors";
    			t51 = space();
    			p5 = element("p");
    			p5.textContent = "Like most website operators, Thompson\n                                Development Group collects\n                                non-personally-identifying information of the\n                                sort that web browsers and servers typically\n                                make available, such as the browser type,\n                                language preference, referring site, and the\n                                date and time of each visitor request. Thompson\n                                Development Group's purpose in collecting\n                                non-personally identifying information is to\n                                better understand how Thompson Development\n                                Group's visitors use its website. From time to\n                                time, Thompson Development Group may release\n                                non-personally-identifying information in the\n                                aggregate, e.g., by publishing a report on\n                                trends in the usage of its website.";
    			t53 = space();
    			p6 = element("p");
    			p6.textContent = "Thompson Development Group also collects\n                                potentially personally-identifying information\n                                like Internet Protocol (IP) addresses for logged\n                                in users and for users leaving comments on\n                                https://www.thompsondevgroup.com blog posts.\n                                Thompson Development Group only discloses logged\n                                in user and commenter IP addresses under the\n                                same circumstances that it uses and discloses\n                                personally-identifying information as described\n                                below.";
    			t55 = space();
    			p7 = element("p");
    			a14 = element("a");
    			a14.textContent = "Back to table of\n                                    contents";
    			t57 = space();
    			h23 = element("h2");
    			h23.textContent = "2. Personally-Identifying Information";
    			t59 = space();
    			p8 = element("p");
    			p8.textContent = "Certain visitors to Thompson Development Group's\n                                websites choose to interact with Thompson\n                                Development Group in ways that require Thompson\n                                Development Group to gather\n                                personally-identifying information. The amount\n                                and type of information that Thompson\n                                Development Group gathers depends on the nature\n                                of the interaction. For example, we ask visitors\n                                who leave a comment at\n                                https://www.thompsondevgroup.com to provide a\n                                username and email address.";
    			t61 = space();
    			p9 = element("p");
    			a15 = element("a");
    			a15.textContent = "Back to table of\n                                    contents";
    			t63 = space();
    			h24 = element("h2");
    			h24.textContent = "3. Security";
    			t65 = space();
    			p10 = element("p");
    			p10.textContent = "The security of your Personal Information is\n                                important to us, but remember that no method of\n                                transmission over the Internet, or method of\n                                electronic storage is 100% secure. While we\n                                strive to use commercially acceptable means to\n                                protect your Personal Information, we cannot\n                                guarantee its absolute security.";
    			t67 = space();
    			p11 = element("p");
    			a16 = element("a");
    			a16.textContent = "Back to table of\n                                    contents";
    			t69 = space();
    			h25 = element("h2");
    			h25.textContent = "4. Advertisements";
    			t71 = space();
    			p12 = element("p");
    			p12.textContent = "Ads appearing on our website may be delivered to\n                                users by advertising partners, who may set\n                                cookies. These cookies allow the ad server to\n                                recognize your computer each time they send you\n                                an online advertisement to compile information\n                                about you or others who use your computer. This\n                                information allows ad networks to, among other\n                                things, deliver targeted advertisements that\n                                they believe will be of most interest to you.\n                                This Privacy Policy covers the use of cookies by\n                                Thompson Development Group and does not cover\n                                the use of cookies by any advertisers.";
    			t73 = space();
    			p13 = element("p");
    			a17 = element("a");
    			a17.textContent = "Back to table of\n                                    contents";
    			t75 = space();
    			h26 = element("h2");
    			h26.textContent = "5. Links To External Sites";
    			t77 = space();
    			p14 = element("p");
    			p14.textContent = "Our Service may contain links to external sites\n                                that are not operated by us. If you click on a\n                                third party link, you will be directed to that\n                                third party's site. We strongly advise you to\n                                review the Privacy Policy and terms of service\n                                of every site you visit.";
    			t79 = space();
    			p15 = element("p");
    			p15.textContent = "We have no control over, and assume no\n                                responsibility for the content, privacy policies\n                                or practices of any third party sites, products\n                                or services.";
    			t81 = space();
    			p16 = element("p");
    			a18 = element("a");
    			a18.textContent = "Back to table of\n                                    contents";
    			t83 = space();
    			h27 = element("h2");
    			h27.textContent = "6. Thompson Development Group uses Google\n                                AdWords for remarketing";
    			t85 = space();
    			p17 = element("p");
    			p17.textContent = "Thompson Development Group uses the remarketing\n                                services to advertise on third party websites\n                                (including Google) to previous visitors to our\n                                site. It could mean that we advertise to\n                                previous visitors who haven't completed a task\n                                on our site, for example using the contact form\n                                to make an enquiry. This could be in the form of\n                                an advertisement on the Google search results\n                                page, or a site in the Google Display Network.\n                                Third-party vendors, including Google, use\n                                cookies to serve ads based on someone's past\n                                visits. Of course, any data collected will be\n                                used in accordance with our own privacy policy\n                                and Google's privacy policy.";
    			t87 = space();
    			p18 = element("p");
    			p18.textContent = "You can set preferences for how Google\n                                advertises to you using the Google Ad\n                                Preferences page, and if you want to you can opt\n                                out of interest-based advertising entirely by\n                                cookie settings or permanently using a browser\n                                plugin.";
    			t89 = space();
    			p19 = element("p");
    			a19 = element("a");
    			a19.textContent = "Back to table of\n                                    contents";
    			t91 = space();
    			h28 = element("h2");
    			h28.textContent = "7. Protection of Certain Personally-Identifying\n                                Information";
    			t93 = space();
    			p20 = element("p");
    			p20.textContent = "Thompson Development Group discloses potentially\n                                personally-identifying and\n                                personally-identifying information only to those\n                                of its employees, contractors and affiliated\n                                organizations that (i) need to know that\n                                information in order to process it on Thompson\n                                Development Group's behalf or to provide\n                                services available at Thompson Development\n                                Group's website, and (ii) that have agreed not\n                                to disclose it to others. Some of those\n                                employees, contractors and affiliated\n                                organizations may be located outside of your\n                                home country; by using Thompson Development\n                                Group's website, you consent to the transfer of\n                                such information to them. Thompson Development\n                                Group will not rent or sell potentially\n                                personally-identifying and\n                                personally-identifying information to anyone.\n                                Other than to its employees, contractors and\n                                affiliated organizations, as described above,\n                                Thompson Development Group discloses potentially\n                                personally-identifying and\n                                personally-identifying information only in\n                                response to a subpoena, court order or other\n                                governmental request, or when Thompson\n                                Development Group believes in good faith that\n                                disclosure is reasonably necessary to protect\n                                the property or rights of Thompson Development\n                                Group, third parties or the public at large.";
    			t95 = space();
    			p21 = element("p");
    			p21.textContent = "If you are a registered user of\n                                https://www.thompsondevgroup.com and have\n                                supplied your email address, Thompson\n                                Development Group may occasionally send you an\n                                email to tell you about new features, solicit\n                                your feedback, or just keep you up to date with\n                                what's going on with Thompson Development Group\n                                and our products. We primarily use our blog to\n                                communicate this type of information, so we\n                                expect to keep this type of email to a minimum.\n                                If you send us a request (for example via a\n                                support email or via one of our feedback\n                                mechanisms), we reserve the right to publish it\n                                in order to help us clarify or respond to your\n                                request or to help us support other users.\n                                Thompson Development Group takes all measures\n                                reasonably necessary to protect against the\n                                unauthorized access, use, alteration or\n                                destruction of potentially\n                                personally-identifying and\n                                personally-identifying information.";
    			t97 = space();
    			p22 = element("p");
    			a20 = element("a");
    			a20.textContent = "Back to table of\n                                    contents";
    			t99 = space();
    			h29 = element("h2");
    			h29.textContent = "8. Aggregated Statistics";
    			t101 = space();
    			p23 = element("p");
    			p23.textContent = "Thompson Development Group may collect\n                                statistics about the behavior of visitors to its\n                                website. Thompson Development Group may display\n                                this information publicly or provide it to\n                                others. However, Thompson Development Group does\n                                not disclose your personally-identifying\n                                information.";
    			t103 = space();
    			p24 = element("p");
    			a21 = element("a");
    			a21.textContent = "Back to table of\n                                    contents";
    			t105 = space();
    			h210 = element("h2");
    			h210.textContent = "9. Affiliate Disclosure";
    			t107 = space();
    			p25 = element("p");
    			p25.textContent = "This site uses affiliate links and does earn a\n                                commission from certain links. This does not\n                                affect your purchases or the price you may pay.";
    			t109 = space();
    			p26 = element("p");
    			a22 = element("a");
    			a22.textContent = "Back to table of\n                                    contents";
    			t111 = space();
    			h211 = element("h2");
    			h211.textContent = "10. Cookies";
    			t113 = space();
    			p27 = element("p");
    			p27.textContent = "To enrich and perfect your online experience,\n                                Thompson Development Group uses \"Cookies\",\n                                similar technologies and services provided by\n                                others to display personalized content,\n                                appropriate advertising and store your\n                                preferences on your computer.";
    			t115 = space();
    			p28 = element("p");
    			p28.textContent = "A cookie is a string of information that a\n                                website stores on a visitor's computer, and that\n                                the visitor's browser provides to the website\n                                each time the visitor returns. Thompson\n                                Development Group uses cookies to help Thompson\n                                Development Group identify and track visitors,\n                                their usage of https://www.thompsondevgroup.com,\n                                and their website access preferences. Thompson\n                                Development Group visitors who do not wish to\n                                have cookies placed on their computers should\n                                set their browsers to refuse cookies before\n                                using Thompson Development Group's websites,\n                                with the drawback that certain features of\n                                Thompson Development Group's websites may not\n                                function properly without the aid of cookies.";
    			t117 = space();
    			p29 = element("p");
    			p29.textContent = "By continuing to navigate our website without\n                                changing your cookie settings, you hereby\n                                acknowledge and agree to Thompson Development\n                                Group's use of cookies.";
    			t119 = space();
    			p30 = element("p");
    			a23 = element("a");
    			a23.textContent = "Back to table of\n                                    contents";
    			t121 = space();
    			h212 = element("h2");
    			h212.textContent = "11. E-commerce";
    			t123 = space();
    			p31 = element("p");
    			p31.textContent = "Those who engage in transactions with Thompson\n                                Development Group – by purchasing Thompson\n                                Development Group's services or products, are\n                                asked to provide additional information,\n                                including as necessary the personal and\n                                financial information required to process those\n                                transactions. In each case, Thompson Development\n                                Group collects such information only insofar as\n                                is necessary or appropriate to fulfill the\n                                purpose of the visitor's interaction with\n                                Thompson Development Group. Thompson Development\n                                Group does not disclose personally-identifying\n                                information other than as described below. And\n                                visitors can always refuse to supply\n                                personally-identifying information, with the\n                                caveat that it may prevent them from engaging in\n                                certain website-related activities.";
    			t125 = space();
    			p32 = element("p");
    			a24 = element("a");
    			a24.textContent = "Back to table of\n                                    contents";
    			t127 = space();
    			h213 = element("h2");
    			h213.textContent = "12. Privacy Policy Changes";
    			t129 = space();
    			p33 = element("p");
    			p33.textContent = "Although most changes are likely to be minor,\n                                Thompson Development Group may change its\n                                Privacy Policy from time to time, and in\n                                Thompson Development Group's sole discretion.\n                                Thompson Development Group encourages visitors\n                                to frequently check this page for any changes to\n                                its Privacy Policy. Your continued use of this\n                                site after any change in this Privacy Policy\n                                will constitute your acceptance of such change.";
    			t131 = space();
    			p34 = element("p");
    			a25 = element("a");
    			a25.textContent = "Back to table of\n                                    contents";
    			t133 = space();
    			h214 = element("h2");
    			h214.textContent = "13. Contact Information";
    			t135 = space();
    			p35 = element("p");
    			t136 = text("If you have any questions about our Privacy\n                                Policy, please contact us via\n                                ");
    			a26 = element("a");
    			a26.textContent = "email";
    			t138 = text("\n                                or\n                                ");
    			a27 = element("a");
    			a27.textContent = "phone";
    			t140 = text(".");
    			t141 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(span, "id", "blackOverlay");
    			attr_dev(span, "class", "w-full h-full absolute opacity-75 bg-black");
    			add_location(span, file$5, 80, 16, 2027);
    			attr_dev(div0, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div0, "background-image", "url(https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2088&q=80)");
    			add_location(div0, file$5, 75, 12, 1704);
    			attr_dev(h1, "class", "text-white font-semibold text-5xl");
    			add_location(h1, file$5, 89, 28, 2455);
    			attr_dev(p0, "class", "mt-4 text-lg text-gray-300");
    			add_location(p0, file$5, 92, 28, 2619);
    			attr_dev(div1, "class", "pr-12");
    			add_location(div1, file$5, 88, 24, 2407);
    			attr_dev(div2, "class", "w-full lg:w-6/12 px-4 ml-auto mr-auto text-center");
    			add_location(div2, file$5, 86, 20, 2295);
    			attr_dev(div3, "class", "items-center flex flex-wrap");
    			add_location(div3, file$5, 85, 16, 2233);
    			attr_dev(div4, "class", "container relative mx-auto");
    			add_location(div4, file$5, 84, 12, 2176);
    			attr_dev(polygon, "class", "text-white-300 fill-current");
    			set_style(polygon, "color", "rgba(255, 255, 255, var(--text-opacity))");
    			attr_dev(polygon, "points", "2560 0 2560 100 0 100");
    			add_location(polygon, file$5, 111, 20, 3432);
    			attr_dev(svg0, "class", "absolute bottom-0 overflow-hidden");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "preserveAspectRatio", "none");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "viewBox", "0 0 2560 100");
    			attr_dev(svg0, "x", "0");
    			attr_dev(svg0, "y", "0");
    			add_location(svg0, file$5, 103, 16, 3113);
    			attr_dev(div5, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div5, "transform", "translateZ(0)");
    			add_location(div5, file$5, 100, 12, 2924);
    			attr_dev(div6, "class", "relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75");
    			add_location(div6, file$5, 73, 8, 1581);
    			attr_dev(path, "id", "gentle-wave");
    			attr_dev(path, "d", "M-160 44c30 0 \n    58-18 88-18s\n    58 18 88 18 \n    58-18 88-18 \n    58 18 88 18\n    v44h-352z");
    			add_location(path, file$5, 127, 20, 4023);
    			add_location(defs, file$5, 126, 16, 3996);
    			xlink_attr(use0, "xlink:href", "#gentle-wave");
    			attr_dev(use0, "x", "50");
    			attr_dev(use0, "y", "3");
    			attr_dev(use0, "fill", "#fff");
    			attr_dev(use0, "class", "svelte-gsvxs");
    			add_location(use0, file$5, 137, 20, 4279);
    			attr_dev(g0, "class", "parallax1 svelte-gsvxs");
    			add_location(g0, file$5, 136, 16, 4237);
    			xlink_attr(use1, "xlink:href", "#gentle-wave");
    			attr_dev(use1, "x", "50");
    			attr_dev(use1, "y", "0");
    			attr_dev(use1, "fill", "#fff");
    			attr_dev(use1, "class", "svelte-gsvxs");
    			add_location(use1, file$5, 140, 20, 4417);
    			attr_dev(g1, "class", "parallax2 svelte-gsvxs");
    			add_location(g1, file$5, 139, 16, 4375);
    			xlink_attr(use2, "xlink:href", "#gentle-wave");
    			attr_dev(use2, "x", "50");
    			attr_dev(use2, "y", "6");
    			attr_dev(use2, "fill", "#fff");
    			attr_dev(use2, "class", "svelte-gsvxs");
    			add_location(use2, file$5, 144, 20, 4556);
    			attr_dev(g2, "class", "parallax4 svelte-gsvxs");
    			add_location(g2, file$5, 143, 16, 4514);
    			attr_dev(svg1, "class", "editorial svelte-gsvxs");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg1, "viewBox", "0 24 150 28 ");
    			attr_dev(svg1, "preserveAspectRatio", "none");
    			add_location(svg1, file$5, 120, 12, 3748);
    			attr_dev(h20, "class", "text-4xl font-semibold");
    			add_location(h20, file$5, 151, 24, 4863);
    			add_location(strong0, file$5, 153, 31, 5029);
    			add_location(p1, file$5, 153, 28, 5026);
    			attr_dev(h3, "id", "a");
    			add_location(h3, file$5, 154, 28, 5105);
    			attr_dev(a0, "href", "https://www.thompsondevgroup.com");
    			add_location(a0, file$5, 160, 32, 5512);
    			add_location(p2, file$5, 155, 28, 5181);
    			add_location(p3, file$5, 176, 28, 6663);
    			attr_dev(h21, "id", "tableofcontents");
    			add_location(h21, file$5, 184, 28, 7192);
    			add_location(p4, file$5, 185, 28, 7259);
    			add_location(strong1, file$5, 191, 63, 7560);
    			attr_dev(a1, "href", "#websitevisitors");
    			add_location(a1, file$5, 191, 36, 7533);
    			add_location(li0, file$5, 190, 32, 7492);
    			add_location(strong2, file$5, 196, 52, 7808);
    			attr_dev(a2, "href", "#PII");
    			add_location(a2, file$5, 195, 36, 7753);
    			add_location(li1, file$5, 194, 32, 7712);
    			add_location(strong3, file$5, 201, 57, 8079);
    			attr_dev(a3, "href", "#Security");
    			add_location(a3, file$5, 200, 36, 8019);
    			add_location(li2, file$5, 199, 32, 7978);
    			add_location(strong4, file$5, 205, 52, 8275);
    			attr_dev(a4, "href", "#Ads");
    			add_location(a4, file$5, 204, 36, 8220);
    			add_location(li3, file$5, 203, 32, 8179);
    			add_location(strong5, file$5, 208, 61, 8447);
    			attr_dev(a5, "href", "#ExternalLinks");
    			add_location(a5, file$5, 208, 36, 8422);
    			add_location(li4, file$5, 207, 32, 8381);
    			add_location(strong6, file$5, 212, 59, 8670);
    			attr_dev(a6, "href", "#Remarketing");
    			add_location(a6, file$5, 212, 36, 8647);
    			add_location(li5, file$5, 211, 32, 8606);
    			add_location(strong7, file$5, 217, 61, 8978);
    			attr_dev(a7, "href", "#PIIProtection");
    			add_location(a7, file$5, 217, 36, 8953);
    			add_location(li6, file$5, 216, 32, 8912);
    			add_location(strong8, file$5, 222, 53, 9272);
    			attr_dev(a8, "href", "#Stats");
    			add_location(a8, file$5, 222, 36, 9255);
    			add_location(li7, file$5, 221, 32, 9214);
    			add_location(strong9, file$5, 226, 58, 9492);
    			attr_dev(a9, "href", "#Affiliates");
    			add_location(a9, file$5, 226, 36, 9470);
    			add_location(li8, file$5, 225, 32, 9429);
    			add_location(strong10, file$5, 231, 56, 9748);
    			attr_dev(a10, "href", "#Cookies");
    			add_location(a10, file$5, 230, 36, 9689);
    			add_location(li9, file$5, 229, 32, 9648);
    			add_location(strong11, file$5, 235, 58, 9949);
    			attr_dev(a11, "href", "#Ecommerce");
    			add_location(a11, file$5, 234, 36, 9888);
    			add_location(li10, file$5, 233, 32, 9847);
    			add_location(strong12, file$5, 238, 55, 10111);
    			attr_dev(a12, "href", "#Changes");
    			add_location(a12, file$5, 238, 36, 10092);
    			add_location(li11, file$5, 237, 32, 10051);
    			add_location(strong13, file$5, 242, 54, 10328);
    			attr_dev(a13, "href", "#Credit");
    			add_location(a13, file$5, 242, 36, 10310);
    			add_location(li12, file$5, 241, 32, 10269);
    			attr_dev(ol, "type", "1");
    			add_location(ol, file$5, 189, 28, 7446);
    			attr_dev(h22, "id", "websitevisitors");
    			add_location(h22, file$5, 246, 28, 10526);
    			add_location(p5, file$5, 247, 28, 10604);
    			add_location(p6, file$5, 264, 28, 11787);
    			attr_dev(a14, "href", "#tableofcontents");
    			add_location(a14, file$5, 278, 32, 12629);
    			add_location(p7, file$5, 277, 28, 12593);
    			attr_dev(h23, "id", "PII");
    			add_location(h23, file$5, 281, 28, 12783);
    			add_location(p8, file$5, 284, 28, 12929);
    			attr_dev(a15, "href", "#tableofcontents");
    			add_location(a15, file$5, 299, 32, 13829);
    			add_location(p9, file$5, 298, 28, 13793);
    			attr_dev(h24, "id", "Security");
    			add_location(h24, file$5, 302, 28, 13983);
    			add_location(p10, file$5, 303, 28, 14046);
    			attr_dev(a16, "href", "#tableofcontents");
    			add_location(a16, file$5, 314, 32, 14679);
    			add_location(p11, file$5, 313, 28, 14643);
    			attr_dev(h25, "id", "Ads");
    			add_location(h25, file$5, 317, 28, 14833);
    			add_location(p12, file$5, 318, 28, 14897);
    			attr_dev(a17, "href", "#tableofcontents");
    			add_location(a17, file$5, 334, 32, 15936);
    			add_location(p13, file$5, 333, 28, 15900);
    			attr_dev(h26, "id", "ExternalLinks");
    			add_location(h26, file$5, 337, 28, 16090);
    			add_location(p14, file$5, 340, 28, 16235);
    			add_location(p15, file$5, 348, 28, 16752);
    			attr_dev(a18, "href", "#tableofcontents");
    			add_location(a18, file$5, 356, 32, 17131);
    			add_location(p16, file$5, 355, 28, 17095);
    			attr_dev(h27, "id", "Remarketing");
    			add_location(h27, file$5, 359, 28, 17285);
    			add_location(p17, file$5, 363, 28, 17499);
    			add_location(p18, file$5, 379, 28, 18641);
    			attr_dev(a19, "href", "#tableofcontents");
    			add_location(a19, file$5, 389, 32, 19162);
    			add_location(p19, file$5, 388, 28, 19126);
    			attr_dev(h28, "id", "PIIProtection");
    			add_location(h28, file$5, 392, 28, 19316);
    			add_location(p20, file$5, 396, 28, 19526);
    			add_location(p21, file$5, 427, 28, 21761);
    			attr_dev(a20, "href", "#tableofcontents");
    			add_location(a20, file$5, 452, 32, 23418);
    			add_location(p22, file$5, 451, 28, 23382);
    			attr_dev(h29, "id", "Stats");
    			add_location(h29, file$5, 455, 28, 23572);
    			add_location(p23, file$5, 456, 28, 23645);
    			attr_dev(a21, "href", "#tableofcontents");
    			add_location(a21, file$5, 467, 32, 24253);
    			add_location(p24, file$5, 466, 28, 24217);
    			attr_dev(h210, "id", "Affiliates");
    			add_location(h210, file$5, 470, 28, 24407);
    			add_location(p25, file$5, 471, 28, 24484);
    			attr_dev(a22, "href", "#tableofcontents");
    			add_location(a22, file$5, 478, 32, 24822);
    			add_location(p26, file$5, 477, 28, 24786);
    			attr_dev(h211, "id", "Cookies");
    			add_location(h211, file$5, 481, 28, 24976);
    			add_location(p27, file$5, 482, 28, 25038);
    			add_location(p28, file$5, 490, 28, 25539);
    			add_location(p29, file$5, 507, 28, 26769);
    			attr_dev(a23, "href", "#tableofcontents");
    			add_location(a23, file$5, 515, 32, 27157);
    			add_location(p30, file$5, 514, 28, 27121);
    			attr_dev(h212, "id", "Ecommerce");
    			add_location(h212, file$5, 518, 28, 27311);
    			add_location(p31, file$5, 519, 28, 27378);
    			attr_dev(a24, "href", "#tableofcontents");
    			add_location(a24, file$5, 540, 32, 28781);
    			add_location(p32, file$5, 539, 28, 28745);
    			attr_dev(h213, "id", "Changes");
    			add_location(h213, file$5, 543, 28, 28935);
    			add_location(p33, file$5, 544, 28, 29012);
    			attr_dev(a25, "href", "#tableofcontents");
    			add_location(a25, file$5, 556, 32, 29812);
    			add_location(p34, file$5, 555, 28, 29776);
    			attr_dev(h214, "id", "Credit");
    			add_location(h214, file$5, 559, 28, 29966);
    			attr_dev(a26, "href", "mailto:contact@thompsondevgroup.com");
    			add_location(a26, file$5, 563, 32, 30213);
    			attr_dev(a27, "href", "tel:");
    			add_location(a27, file$5, 566, 32, 30372);
    			add_location(p35, file$5, 560, 28, 30039);
    			attr_dev(div7, "class", "text-lg leading-relaxed m-4 text-gray-600");
    			add_location(div7, file$5, 152, 24, 4942);
    			attr_dev(div8, "class", "w-full lg:w-6/12 px-4");
    			add_location(div8, file$5, 150, 20, 4803);
    			attr_dev(div9, "class", "flex flex-wrap justify-center text-center mb-24");
    			add_location(div9, file$5, 149, 16, 4721);
    			attr_dev(div10, "class", "container mx-auto px-4");
    			add_location(div10, file$5, 148, 12, 4668);
    			attr_dev(section, "class", "pt-20 pb-48");
    			add_location(section, file$5, 119, 8, 3706);
    			add_location(main, file$5, 72, 4, 1566);
    			add_location(div11, file$5, 70, 0, 1537);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			mount_component(authnavbar, div11, null);
    			append_dev(div11, t0);
    			append_dev(div11, main);
    			append_dev(main, div6);
    			append_dev(div6, div0);
    			append_dev(div0, span);
    			append_dev(div6, t1);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, svg0);
    			append_dev(svg0, polygon);
    			append_dev(main, t6);
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
    			append_dev(section, t7);
    			append_dev(section, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h20);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, p1);
    			append_dev(p1, strong0);
    			append_dev(div7, t11);
    			append_dev(div7, h3);
    			append_dev(div7, t13);
    			append_dev(div7, p2);
    			append_dev(p2, t14);
    			append_dev(p2, a0);
    			append_dev(p2, t16);
    			append_dev(div7, t17);
    			append_dev(div7, p3);
    			append_dev(div7, t19);
    			append_dev(div7, h21);
    			append_dev(div7, t21);
    			append_dev(div7, p4);
    			append_dev(div7, t23);
    			append_dev(div7, ol);
    			append_dev(ol, li0);
    			append_dev(li0, a1);
    			append_dev(a1, strong1);
    			append_dev(ol, t25);
    			append_dev(ol, li1);
    			append_dev(li1, a2);
    			append_dev(a2, strong2);
    			append_dev(ol, t27);
    			append_dev(ol, li2);
    			append_dev(li2, a3);
    			append_dev(a3, strong3);
    			append_dev(ol, t29);
    			append_dev(ol, li3);
    			append_dev(li3, a4);
    			append_dev(a4, strong4);
    			append_dev(ol, t31);
    			append_dev(ol, li4);
    			append_dev(li4, a5);
    			append_dev(a5, strong5);
    			append_dev(ol, t33);
    			append_dev(ol, li5);
    			append_dev(li5, a6);
    			append_dev(a6, strong6);
    			append_dev(ol, t35);
    			append_dev(ol, li6);
    			append_dev(li6, a7);
    			append_dev(a7, strong7);
    			append_dev(ol, t37);
    			append_dev(ol, li7);
    			append_dev(li7, a8);
    			append_dev(a8, strong8);
    			append_dev(ol, t39);
    			append_dev(ol, li8);
    			append_dev(li8, a9);
    			append_dev(a9, strong9);
    			append_dev(ol, t41);
    			append_dev(ol, li9);
    			append_dev(li9, a10);
    			append_dev(a10, strong10);
    			append_dev(ol, t43);
    			append_dev(ol, li10);
    			append_dev(li10, a11);
    			append_dev(a11, strong11);
    			append_dev(ol, t45);
    			append_dev(ol, li11);
    			append_dev(li11, a12);
    			append_dev(a12, strong12);
    			append_dev(ol, t47);
    			append_dev(ol, li12);
    			append_dev(li12, a13);
    			append_dev(a13, strong13);
    			append_dev(div7, t49);
    			append_dev(div7, h22);
    			append_dev(div7, t51);
    			append_dev(div7, p5);
    			append_dev(div7, t53);
    			append_dev(div7, p6);
    			append_dev(div7, t55);
    			append_dev(div7, p7);
    			append_dev(p7, a14);
    			append_dev(div7, t57);
    			append_dev(div7, h23);
    			append_dev(div7, t59);
    			append_dev(div7, p8);
    			append_dev(div7, t61);
    			append_dev(div7, p9);
    			append_dev(p9, a15);
    			append_dev(div7, t63);
    			append_dev(div7, h24);
    			append_dev(div7, t65);
    			append_dev(div7, p10);
    			append_dev(div7, t67);
    			append_dev(div7, p11);
    			append_dev(p11, a16);
    			append_dev(div7, t69);
    			append_dev(div7, h25);
    			append_dev(div7, t71);
    			append_dev(div7, p12);
    			append_dev(div7, t73);
    			append_dev(div7, p13);
    			append_dev(p13, a17);
    			append_dev(div7, t75);
    			append_dev(div7, h26);
    			append_dev(div7, t77);
    			append_dev(div7, p14);
    			append_dev(div7, t79);
    			append_dev(div7, p15);
    			append_dev(div7, t81);
    			append_dev(div7, p16);
    			append_dev(p16, a18);
    			append_dev(div7, t83);
    			append_dev(div7, h27);
    			append_dev(div7, t85);
    			append_dev(div7, p17);
    			append_dev(div7, t87);
    			append_dev(div7, p18);
    			append_dev(div7, t89);
    			append_dev(div7, p19);
    			append_dev(p19, a19);
    			append_dev(div7, t91);
    			append_dev(div7, h28);
    			append_dev(div7, t93);
    			append_dev(div7, p20);
    			append_dev(div7, t95);
    			append_dev(div7, p21);
    			append_dev(div7, t97);
    			append_dev(div7, p22);
    			append_dev(p22, a20);
    			append_dev(div7, t99);
    			append_dev(div7, h29);
    			append_dev(div7, t101);
    			append_dev(div7, p23);
    			append_dev(div7, t103);
    			append_dev(div7, p24);
    			append_dev(p24, a21);
    			append_dev(div7, t105);
    			append_dev(div7, h210);
    			append_dev(div7, t107);
    			append_dev(div7, p25);
    			append_dev(div7, t109);
    			append_dev(div7, p26);
    			append_dev(p26, a22);
    			append_dev(div7, t111);
    			append_dev(div7, h211);
    			append_dev(div7, t113);
    			append_dev(div7, p27);
    			append_dev(div7, t115);
    			append_dev(div7, p28);
    			append_dev(div7, t117);
    			append_dev(div7, p29);
    			append_dev(div7, t119);
    			append_dev(div7, p30);
    			append_dev(p30, a23);
    			append_dev(div7, t121);
    			append_dev(div7, h212);
    			append_dev(div7, t123);
    			append_dev(div7, p31);
    			append_dev(div7, t125);
    			append_dev(div7, p32);
    			append_dev(p32, a24);
    			append_dev(div7, t127);
    			append_dev(div7, h213);
    			append_dev(div7, t129);
    			append_dev(div7, p33);
    			append_dev(div7, t131);
    			append_dev(div7, p34);
    			append_dev(p34, a25);
    			append_dev(div7, t133);
    			append_dev(div7, h214);
    			append_dev(div7, t135);
    			append_dev(div7, p35);
    			append_dev(p35, t136);
    			append_dev(p35, a26);
    			append_dev(p35, t138);
    			append_dev(p35, a27);
    			append_dev(p35, t140);
    			append_dev(div11, t141);
    			mount_component(footer, div11, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(authnavbar.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(authnavbar.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			destroy_component(authnavbar);
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
    	let { location } = $$props;
    	const writable_props = ["location"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Privacy> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({ link, Footer, location });

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location];
    }

    class Privacy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { location: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Privacy",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !("location" in props)) {
    			console.warn("<Privacy> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<Privacy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Privacy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
    			h1.textContent = "Tyler's Terms of Use";
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
    			p1.textContent = "These terms of service outline the rules and\n                                regulations for the use of TylerThompson's\n                                Website.";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "By accessing this website we assume you accept\n                                these terms of service in full. Do not continue\n                                to use TylerThompson's website if you do not\n                                accept all of the terms of service stated on\n                                this page.";
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "The following terminology applies to these Terms\n                                of Service, Privacy Statement and Disclaimer\n                                Notice and any or all Agreements: \"Client\",\n                                \"You\" and \"Your\" refers to you, the person\n                                accessing this website and accepting the\n                                Company's terms of service. \"The Company\",\n                                \"Ourselves\", \"We\", \"Our\" and \"Us\", refers to our\n                                Company. \"Party\", \"Parties\", or \"Us\", refers to\n                                both the Client and ourselves, or either the\n                                Client or ourselves. All terms refer to the\n                                offer, acceptance and consideration of payment\n                                necessary to undertake the process of our\n                                assistance to the Client in the most appropriate\n                                manner, whether by formal meetings of a fixed\n                                duration, or any other means, for the express\n                                purpose of meeting the Client's needs in respect\n                                of provision of the Company's stated\n                                services/products, in accordance with and\n                                subject to, prevailing law of . Any use of the\n                                above terminology or other words in the\n                                singular, plural, capitalisation and/or he/she\n                                or they, are taken as interchangeable and\n                                therefore as referring to same.";
    			t13 = space();
    			h21 = element("h2");
    			h21.textContent = "Cookies";
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "We employ the use of cookies. By using\n                                TylerThompson's website you consent to the use\n                                of cookies in accordance with TylerThompson's\n                                privacy policy.";
    			t17 = space();
    			p5 = element("p");
    			p5.textContent = "Most of the modern day interactive web sites use\n                                cookies to enable us to retrieve user details\n                                for each visit. Cookies are used in some areas\n                                of our site to enable the functionality of this\n                                area and ease of use for those people visiting.\n                                Some of our affiliate / advertising partners may\n                                also use cookies.";
    			t19 = space();
    			h22 = element("h2");
    			h22.textContent = "License";
    			t21 = space();
    			p6 = element("p");
    			p6.textContent = "Unless otherwise stated, TylerThompson and/or\n                                it's licensors own the intellectual property\n                                rights for all material on TylerThompson. All\n                                intellectual property rights are reserved. You\n                                may view and/or print pages from\n                                www.thompsondevgroup.com for your own personal\n                                use subject to restrictions set in these terms\n                                of service.";
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
    			p8.textContent = "Redistribute content from TylerThompson (unless\n                                content is specifically made for\n                                redistribution).";
    			t33 = space();
    			h23 = element("h2");
    			h23.textContent = "User Comments";
    			t35 = space();
    			ol2 = element("ol");
    			li3 = element("li");
    			li3.textContent = "This Agreement shall begin on the date\n                                    hereof.";
    			t37 = space();
    			li4 = element("li");
    			li4.textContent = "Certain parts of this website offer the\n                                    opportunity for users to post and exchange\n                                    opinions, information, material and data\n                                    ('Comments') in areas of the website.\n                                    TylerThompson does not screen, edit, publish\n                                    or review Comments prior to their appearance\n                                    on the website and Comments do not reflect\n                                    the views or opinions of TylerThompson, its\n                                    agents or affiliates. Comments reflect the\n                                    view and opinion of the person who posts\n                                    such view or opinion. To the extent\n                                    permitted by applicable laws TylerThompson\n                                    shall not be responsible or liable for the\n                                    Comments or for any loss cost, liability,\n                                    damages or expenses caused and or suffered\n                                    as a result of any use of and/or posting of\n                                    and/or appearance of the Comments on this\n                                    website.";
    			t39 = space();
    			li5 = element("li");
    			li5.textContent = "TylerThompson reserves the right to monitor\n                                    all Comments and to remove any Comments\n                                    which it considers in its absolute\n                                    discretion to be inappropriate, offensive or\n                                    otherwise in breach of these Terms of\n                                    Service.";
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
    			strong.textContent = "TylerThompson";
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
    			p9.textContent = "We will approve link requests from these\n                                organizations if we determine that: (a) the link\n                                would not reflect unfavorably on us or our\n                                accredited businesses (for example, trade\n                                associations or other organizations representing\n                                inherently suspect types of business, such as\n                                work-at-home opportunities, shall not be allowed\n                                to link); (b)the organization does not have an\n                                unsatisfactory record with us; (c) the benefit\n                                to us from the visibility associated with the\n                                hyperlink outweighs the absence of\n                                TylerThompson; and (d) where the link is in the\n                                context of general resource information or is\n                                otherwise consistent with editorial content in a\n                                newsletter or similar product furthering the\n                                mission of the organization.";
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
    			p13.textContent = "No use of TylerThompson's logo or other artwork\n                                will be allowed for linking absent a trademark\n                                license agreement.";
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
    			add_location(span, file$6, 19, 16, 712);
    			attr_dev(div0, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div0, "background-image", "url(https://images.unsplash.com/photo-1586253725765-24073e7f1e62?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)");
    			add_location(div0, file$6, 14, 12, 389);
    			attr_dev(h1, "class", "text-white font-semibold text-5xl");
    			add_location(h1, file$6, 28, 28, 1140);
    			attr_dev(p0, "class", "mt-4 text-lg text-gray-300");
    			add_location(p0, file$6, 31, 28, 1302);
    			attr_dev(div1, "class", "pr-12");
    			add_location(div1, file$6, 27, 24, 1092);
    			attr_dev(div2, "class", "w-full lg:w-6/12 px-4 ml-auto mr-auto text-center");
    			add_location(div2, file$6, 25, 20, 980);
    			attr_dev(div3, "class", "items-center flex flex-wrap");
    			add_location(div3, file$6, 24, 16, 918);
    			attr_dev(div4, "class", "container relative mx-auto");
    			add_location(div4, file$6, 23, 12, 861);
    			attr_dev(polygon, "class", "text-gray-300 fill-current");
    			set_style(polygon, "color", "rgba(255, 255, 255, var(--text-opacity))");
    			attr_dev(polygon, "points", "2560 0 2560 100 0 100");
    			add_location(polygon, file$6, 49, 20, 2062);
    			attr_dev(svg, "class", "absolute bottom-0 overflow-hidden");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "viewBox", "0 0 2560 100");
    			attr_dev(svg, "x", "0");
    			attr_dev(svg, "y", "0");
    			add_location(svg, file$6, 41, 16, 1743);
    			attr_dev(div5, "class", "top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px");
    			set_style(div5, "transform", "translateZ(0)");
    			add_location(div5, file$6, 38, 12, 1554);
    			attr_dev(div6, "class", "relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75");
    			add_location(div6, file$6, 12, 8, 266);
    			attr_dev(h20, "class", "text-4xl font-semibold");
    			add_location(h20, file$6, 61, 24, 2572);
    			add_location(p1, file$6, 63, 28, 2737);
    			add_location(p2, file$6, 69, 28, 2996);
    			add_location(p3, file$6, 76, 28, 3417);
    			add_location(h21, file$6, 102, 28, 5236);
    			add_location(p4, file$6, 103, 28, 5281);
    			add_location(p5, file$6, 109, 28, 5622);
    			add_location(h22, file$6, 119, 28, 6217);
    			add_location(p6, file$6, 120, 28, 6262);
    			add_location(p7, file$6, 130, 28, 6906);
    			add_location(li0, file$6, 132, 32, 6992);
    			add_location(li1, file$6, 136, 32, 7188);
    			add_location(li2, file$6, 140, 32, 7400);
    			add_location(ol0, file$6, 131, 28, 6955);
    			add_location(p8, file$6, 145, 28, 7645);
    			add_location(h23, file$6, 151, 28, 7905);
    			add_location(li3, file$6, 153, 32, 7993);
    			add_location(li4, file$6, 157, 32, 8187);
    			add_location(li5, file$6, 177, 32, 9635);
    			add_location(li6, file$6, 188, 40, 10291);
    			add_location(li7, file$6, 194, 40, 10666);
    			add_location(li8, file$6, 202, 40, 11191);
    			add_location(li9, file$6, 209, 40, 11651);
    			add_location(ol1, file$6, 187, 36, 10246);
    			add_location(li10, file$6, 185, 32, 10137);
    			add_location(strong, file$6, 219, 36, 12213);
    			add_location(li11, file$6, 217, 32, 12116);
    			add_location(ol2, file$6, 152, 28, 7956);
    			add_location(h24, file$6, 226, 28, 12658);
    			add_location(li12, file$6, 232, 40, 13003);
    			add_location(li13, file$6, 233, 40, 13073);
    			add_location(li14, file$6, 234, 40, 13138);
    			add_location(li15, file$6, 235, 40, 13207);
    			add_location(li16, file$6, 243, 40, 13738);
    			add_location(ol3, file$6, 231, 36, 12958);
    			add_location(li17, file$6, 228, 32, 12760);
    			add_location(ol4, file$6, 227, 28, 12723);
    			add_location(li18, file$6, 255, 32, 14415);
    			add_location(li19, file$6, 270, 40, 15413);
    			add_location(li20, file$6, 277, 40, 15873);
    			add_location(li21, file$6, 278, 40, 15947);
    			add_location(li22, file$6, 283, 40, 16255);
    			add_location(li23, file$6, 284, 40, 16335);
    			add_location(li24, file$6, 285, 40, 16402);
    			add_location(li25, file$6, 290, 40, 16704);
    			add_location(ol5, file$6, 269, 36, 15368);
    			add_location(li26, file$6, 265, 32, 15105);
    			attr_dev(ol6, "start", "2");
    			add_location(ol6, file$6, 254, 28, 14368);
    			add_location(p9, file$6, 297, 28, 17034);
    			add_location(p10, file$6, 316, 28, 18323);
    			attr_dev(a, "href", "mailto:contact@thompsondevgroup.com");
    			attr_dev(a, "title", "send an email to contact@thompsondevgroup.com");
    			add_location(a, file$6, 332, 32, 19287);
    			add_location(p11, file$6, 327, 28, 18971);
    			add_location(p12, file$6, 344, 28, 20097);
    			add_location(li27, file$6, 350, 32, 20329);
    			add_location(li28, file$6, 351, 32, 20403);
    			add_location(li29, file$6, 355, 32, 20623);
    			add_location(ol7, file$6, 349, 28, 20292);
    			add_location(p13, file$6, 362, 28, 21035);
    			add_location(h25, file$6, 367, 28, 21310);
    			add_location(p14, file$6, 368, 28, 21355);
    			add_location(h26, file$6, 375, 28, 21783);
    			add_location(p15, file$6, 376, 28, 21838);
    			add_location(h27, file$6, 389, 28, 22723);
    			add_location(p16, file$6, 390, 28, 22782);
    			add_location(h28, file$6, 401, 28, 23552);
    			add_location(p17, file$6, 402, 28, 23623);
    			add_location(p18, file$6, 410, 28, 24111);
    			add_location(h29, file$6, 418, 28, 24615);
    			add_location(p19, file$6, 419, 28, 24663);
    			add_location(li30, file$6, 430, 32, 25379);
    			add_location(li31, file$6, 435, 32, 25657);
    			add_location(li32, file$6, 439, 32, 25886);
    			add_location(li33, file$6, 444, 32, 26164);
    			add_location(ol8, file$6, 429, 28, 25342);
    			add_location(p20, file$6, 449, 28, 26427);
    			add_location(p21, file$6, 460, 28, 27151);
    			add_location(h210, file$6, 466, 28, 27512);
    			add_location(p22, file$6, 467, 28, 27569);
    			attr_dev(div7, "class", "text-lg leading-relaxed m-4 text-gray-600");
    			add_location(div7, file$6, 62, 24, 2653);
    			attr_dev(div8, "class", "w-full lg:w-6/12 px-4");
    			add_location(div8, file$6, 60, 20, 2512);
    			attr_dev(div9, "class", "flex flex-wrap justify-center text-center mb-24");
    			add_location(div9, file$6, 59, 16, 2430);
    			attr_dev(div10, "class", "container mx-auto px-4");
    			add_location(div10, file$6, 58, 12, 2377);
    			attr_dev(section, "class", "pt-20 pb-48");
    			add_location(section, file$6, 57, 8, 2335);
    			add_location(main, file$6, 11, 4, 251);
    			add_location(div11, file$6, 10, 0, 241);
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
    	let { location } = $$props;
    	const writable_props = ["location"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Terms> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	$$self.$capture_state = () => ({ link, Footer, location });

    	$$self.$inject_state = $$props => {
    		if ("location" in $$props) $$invalidate(0, location = $$props.location);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [location];
    }

    class Terms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { location: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Terms",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*location*/ ctx[0] === undefined && !("location" in props)) {
    			console.warn("<Terms> was created without expected prop 'location'");
    		}
    	}

    	get location() {
    		throw new Error("<Terms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Terms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
