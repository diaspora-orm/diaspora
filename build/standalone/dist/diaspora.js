/**
* @file diaspora
*
* Multi-Layer ORM for Javascript Client+Server
* Standalone build compiled on 2017-11-07 14:47:42
*
* @license GPL-3.0
* @version 0.2.0-rc.3
* @author Gerkin
*/
var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (f) {
	if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
		module.exports = f();
	} else if (typeof define === "function" && define.amd) {
		define([], f);
	} else {
		var g;if (typeof window !== "undefined") {
			g = window;
		} else if (typeof global !== "undefined") {
			g = global;
		} else if (typeof self !== "undefined") {
			g = self;
		} else {
			g = this;
		}g.Diaspora = f();
	}
})(function () {
	var define, module, exports;return function e(t, n, r) {
		function s(o, u) {
			if (!n[o]) {
				if (!t[o]) {
					var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
				}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
					var n = t[o][1][e];return s(n ? n : e);
				}, l, l.exports, e, t, n, r);
			}return n[o].exports;
		}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
			s(r[o]);
		}return s;
	}({ 1: [function (require, module, exports) {
			(function (global) {
				"use strict";
				var _typeof2 = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (t) {
					return typeof t === "undefined" ? "undefined" : _typeof(t);
				} : function (t) {
					return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t === "undefined" ? "undefined" : _typeof(t);
				};!function t(e, n, r) {
					function i(u, a) {
						if (!n[u]) {
							if (!e[u]) {
								var c = "function" == typeof require && require;if (!a && c) return c(u, !0);if (o) return o(u, !0);var s = new Error("Cannot find module '" + u + "'");throw s.code = "MODULE_NOT_FOUND", s;
							}var l = n[u] = { exports: {} };e[u][0].call(l.exports, function (t) {
								var n = e[u][1][t];return i(n || t);
							}, l, l.exports, t, e, n, r);
						}return n[u].exports;
					}for (var o = "function" == typeof require && require, u = 0; u < r.length; u++) {
						i(r[u]);
					}return i;
				}({ 1: [function (t, e, n) {
						(function (t, r) {
							/* @preserve
       * The MIT License (MIT)
       * 
       * Copyright (c) 2013-2017 Petka Antonov
       * 
       * Permission is hereby granted, free of charge, to any person obtaining a copy
       * of this software and associated documentation files (the "Software"), to deal
       * in the Software without restriction, including without limitation the rights
       * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
       * copies of the Software, and to permit persons to whom the Software is
       * furnished to do so, subject to the following conditions:
       * 
       * The above copyright notice and this permission notice shall be included in
       * all copies or substantial portions of the Software.
       * 
       * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
       * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
       * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
       * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
       * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
       * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
       * THE SOFTWARE.
       * 
       */
							!function (t) {
								if ("object" == (void 0 === n ? "undefined" : _typeof2(n)) && void 0 !== e) e.exports = t();else if ("function" == typeof define && define.amd) define([], t);else {
									var i;"undefined" != typeof window ? i = window : void 0 !== r ? i = r : "undefined" != typeof self && (i = self), i.Promise = t();
								}
							}(function () {
								return function t(e, n, r) {
									function i(u, a) {
										if (!n[u]) {
											if (!e[u]) {
												var c = "function" == typeof _dereq_ && _dereq_;if (!a && c) return c(u, !0);if (o) return o(u, !0);var s = new Error("Cannot find module '" + u + "'");throw s.code = "MODULE_NOT_FOUND", s;
											}var l = n[u] = { exports: {} };e[u][0].call(l.exports, function (t) {
												var n = e[u][1][t];return i(n || t);
											}, l, l.exports, t, e, n, r);
										}return n[u].exports;
									}for (var o = "function" == typeof _dereq_ && _dereq_, u = 0; u < r.length; u++) {
										i(r[u]);
									}return i;
								}({ 1: [function (t, e, n) {
										e.exports = function (t) {
											function e(t) {
												var e = new n(t),
												    r = e.promise();return e.setHowMany(1), e.setUnwrap(), e.init(), r;
											}var n = t._SomePromiseArray;t.any = function (t) {
												return e(t);
											}, t.prototype.any = function () {
												return e(this);
											};
										};
									}, {}], 2: [function (e, n, r) {
										function i() {
											this._customScheduler = !1, this._isTickUsed = !1, this._lateQueue = new l(16), this._normalQueue = new l(16), this._haveDrainedQueues = !1, this._trampolineEnabled = !0;var t = this;this.drainQueues = function () {
												t._drainQueues();
											}, this._schedule = s;
										}function o(t, e, n) {
											this._lateQueue.push(t, e, n), this._queueTick();
										}function u(t, e, n) {
											this._normalQueue.push(t, e, n), this._queueTick();
										}function a(t) {
											this._normalQueue._pushOne(t), this._queueTick();
										}var c;try {
											throw new Error();
										} catch (t) {
											c = t;
										}var s = e("./schedule"),
										    l = e("./queue"),
										    f = e("./util");i.prototype.setScheduler = function (t) {
											var e = this._schedule;return this._schedule = t, this._customScheduler = !0, e;
										}, i.prototype.hasCustomScheduler = function () {
											return this._customScheduler;
										}, i.prototype.enableTrampoline = function () {
											this._trampolineEnabled = !0;
										}, i.prototype.disableTrampolineIfNecessary = function () {
											f.hasDevTools && (this._trampolineEnabled = !1);
										}, i.prototype.haveItemsQueued = function () {
											return this._isTickUsed || this._haveDrainedQueues;
										}, i.prototype.fatalError = function (e, n) {
											n ? (t.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) + "\n"), t.exit(2)) : this.throwLater(e);
										}, i.prototype.throwLater = function (t, e) {
											if (1 === arguments.length && (e = t, t = function t() {
												throw e;
											}), "undefined" != typeof setTimeout) setTimeout(function () {
												t(e);
											}, 0);else try {
												this._schedule(function () {
													t(e);
												});
											} catch (t) {
												throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
											}
										}, f.hasDevTools ? (i.prototype.invokeLater = function (t, e, n) {
											this._trampolineEnabled ? o.call(this, t, e, n) : this._schedule(function () {
												setTimeout(function () {
													t.call(e, n);
												}, 100);
											});
										}, i.prototype.invoke = function (t, e, n) {
											this._trampolineEnabled ? u.call(this, t, e, n) : this._schedule(function () {
												t.call(e, n);
											});
										}, i.prototype.settlePromises = function (t) {
											this._trampolineEnabled ? a.call(this, t) : this._schedule(function () {
												t._settlePromises();
											});
										}) : (i.prototype.invokeLater = o, i.prototype.invoke = u, i.prototype.settlePromises = a), i.prototype._drainQueue = function (t) {
											for (; t.length() > 0;) {
												var e = t.shift();if ("function" == typeof e) {
													var n = t.shift(),
													    r = t.shift();e.call(n, r);
												} else e._settlePromises();
											}
										}, i.prototype._drainQueues = function () {
											this._drainQueue(this._normalQueue), this._reset(), this._haveDrainedQueues = !0, this._drainQueue(this._lateQueue);
										}, i.prototype._queueTick = function () {
											this._isTickUsed || (this._isTickUsed = !0, this._schedule(this.drainQueues));
										}, i.prototype._reset = function () {
											this._isTickUsed = !1;
										}, n.exports = i, n.exports.firstLineError = c;
									}, { "./queue": 26, "./schedule": 29, "./util": 36 }], 3: [function (t, e, n) {
										e.exports = function (t, e, n, r) {
											var i = !1,
											    o = function o(t, e) {
												this._reject(e);
											},
											    u = function u(t, e) {
												e.promiseRejectionQueued = !0, e.bindingPromise._then(o, o, null, this, t);
											},
											    a = function a(t, e) {
												0 == (50397184 & this._bitField) && this._resolveCallback(e.target);
											},
											    c = function c(t, e) {
												e.promiseRejectionQueued || this._reject(t);
											};t.prototype.bind = function (o) {
												i || (i = !0, t.prototype._propagateFrom = r.propagateFromFunction(), t.prototype._boundValue = r.boundValueFunction());var s = n(o),
												    l = new t(e);l._propagateFrom(this, 1);var f = this._target();if (l._setBoundTo(s), s instanceof t) {
													var h = { promiseRejectionQueued: !1, promise: l, target: f, bindingPromise: s };f._then(e, u, void 0, l, h), s._then(a, c, void 0, l, h), l._setOnCancel(s);
												} else l._resolveCallback(f);return l;
											}, t.prototype._setBoundTo = function (t) {
												void 0 !== t ? (this._bitField = 2097152 | this._bitField, this._boundTo = t) : this._bitField = -2097153 & this._bitField;
											}, t.prototype._isBound = function () {
												return 2097152 == (2097152 & this._bitField);
											}, t.bind = function (e, n) {
												return t.resolve(n).bind(e);
											};
										};
									}, {}], 4: [function (t, e, n) {
										var r;"undefined" != typeof Promise && (r = Promise);var i = t("./promise")();i.noConflict = function () {
											try {
												Promise === i && (Promise = r);
											} catch (t) {}return i;
										}, e.exports = i;
									}, { "./promise": 22 }], 5: [function (t, e, n) {
										var r = Object.create;if (r) {
											var i = r(null),
											    o = r(null);i[" size"] = o[" size"] = 0;
										}e.exports = function (e) {
											function n(t, n) {
												var r;if (null != t && (r = t[n]), "function" != typeof r) {
													var i = "Object " + u.classString(t) + " has no method '" + u.toString(n) + "'";throw new e.TypeError(i);
												}return r;
											}function r(t) {
												return n(t, this.pop()).apply(t, this);
											}function i(t) {
												return t[this];
											}function o(t) {
												var e = +this;return 0 > e && (e = Math.max(0, e + t.length)), t[e];
											}var u = t("./util"),
											    a = u.canEvaluate;u.isIdentifier, e.prototype.call = function (t) {
												var e = [].slice.call(arguments, 1);return e.push(t), this._then(r, void 0, void 0, e, void 0);
											}, e.prototype.get = function (t) {
												var e;if ("number" == typeof t) e = o;else if (a) {
													var n = (void 0)(t);e = null !== n ? n : i;
												} else e = i;return this._then(e, void 0, void 0, t, void 0);
											};
										};
									}, { "./util": 36 }], 6: [function (t, e, n) {
										e.exports = function (e, n, r, i) {
											var o = t("./util"),
											    u = o.tryCatch,
											    a = o.errorObj,
											    c = e._async;e.prototype.break = e.prototype.cancel = function () {
												if (!i.cancellation()) return this._warn("cancellation is disabled");for (var t = this, e = t; t._isCancellable();) {
													if (!t._cancelBy(e)) {
														e._isFollowing() ? e._followee().cancel() : e._cancelBranched();break;
													}var n = t._cancellationParent;if (null == n || !n._isCancellable()) {
														t._isFollowing() ? t._followee().cancel() : t._cancelBranched();break;
													}t._isFollowing() && t._followee().cancel(), t._setWillBeCancelled(), e = t, t = n;
												}
											}, e.prototype._branchHasCancelled = function () {
												this._branchesRemainingToCancel--;
											}, e.prototype._enoughBranchesHaveCancelled = function () {
												return void 0 === this._branchesRemainingToCancel || this._branchesRemainingToCancel <= 0;
											}, e.prototype._cancelBy = function (t) {
												return t === this ? (this._branchesRemainingToCancel = 0, this._invokeOnCancel(), !0) : (this._branchHasCancelled(), !!this._enoughBranchesHaveCancelled() && (this._invokeOnCancel(), !0));
											}, e.prototype._cancelBranched = function () {
												this._enoughBranchesHaveCancelled() && this._cancel();
											}, e.prototype._cancel = function () {
												this._isCancellable() && (this._setCancelled(), c.invoke(this._cancelPromises, this, void 0));
											}, e.prototype._cancelPromises = function () {
												this._length() > 0 && this._settlePromises();
											}, e.prototype._unsetOnCancel = function () {
												this._onCancelField = void 0;
											}, e.prototype._isCancellable = function () {
												return this.isPending() && !this._isCancelled();
											}, e.prototype.isCancellable = function () {
												return this.isPending() && !this.isCancelled();
											}, e.prototype._doInvokeOnCancel = function (t, e) {
												if (o.isArray(t)) for (var n = 0; n < t.length; ++n) {
													this._doInvokeOnCancel(t[n], e);
												} else if (void 0 !== t) if ("function" == typeof t) {
													if (!e) {
														var r = u(t).call(this._boundValue());r === a && (this._attachExtraTrace(r.e), c.throwLater(r.e));
													}
												} else t._resultCancelled(this);
											}, e.prototype._invokeOnCancel = function () {
												var t = this._onCancel();this._unsetOnCancel(), c.invoke(this._doInvokeOnCancel, this, t);
											}, e.prototype._invokeInternalOnCancel = function () {
												this._isCancellable() && (this._doInvokeOnCancel(this._onCancel(), !0), this._unsetOnCancel());
											}, e.prototype._resultCancelled = function () {
												this.cancel();
											};
										};
									}, { "./util": 36 }], 7: [function (t, e, n) {
										e.exports = function (e) {
											var n = t("./util"),
											    r = t("./es5").keys,
											    i = n.tryCatch,
											    o = n.errorObj;return function (t, u, a) {
												return function (c) {
													var s = a._boundValue();t: for (var l = 0; l < t.length; ++l) {
														var f = t[l];if (f === Error || null != f && f.prototype instanceof Error) {
															if (c instanceof f) return i(u).call(s, c);
														} else if ("function" == typeof f) {
															var h = i(f).call(s, c);if (h === o) return h;if (h) return i(u).call(s, c);
														} else if (n.isObject(c)) {
															for (var p = r(f), _ = 0; _ < p.length; ++_) {
																var d = p[_];if (f[d] != c[d]) continue t;
															}return i(u).call(s, c);
														}
													}return e;
												};
											};
										};
									}, { "./es5": 13, "./util": 36 }], 8: [function (t, e, n) {
										e.exports = function (t) {
											function e() {
												this._trace = new e.CapturedTrace(n());
											}function n() {
												var t = i.length - 1;return t >= 0 ? i[t] : void 0;
											}var r = !1,
											    i = [];return t.prototype._promiseCreated = function () {}, t.prototype._pushContext = function () {}, t.prototype._popContext = function () {
												return null;
											}, t._peekContext = t.prototype._peekContext = function () {}, e.prototype._pushContext = function () {
												void 0 !== this._trace && (this._trace._promiseCreated = null, i.push(this._trace));
											}, e.prototype._popContext = function () {
												if (void 0 !== this._trace) {
													var t = i.pop(),
													    e = t._promiseCreated;return t._promiseCreated = null, e;
												}return null;
											}, e.CapturedTrace = null, e.create = function () {
												return r ? new e() : void 0;
											}, e.deactivateLongStackTraces = function () {}, e.activateLongStackTraces = function () {
												var i = t.prototype._pushContext,
												    o = t.prototype._popContext,
												    u = t._peekContext,
												    a = t.prototype._peekContext,
												    c = t.prototype._promiseCreated;e.deactivateLongStackTraces = function () {
													t.prototype._pushContext = i, t.prototype._popContext = o, t._peekContext = u, t.prototype._peekContext = a, t.prototype._promiseCreated = c, r = !1;
												}, r = !0, t.prototype._pushContext = e.prototype._pushContext, t.prototype._popContext = e.prototype._popContext, t._peekContext = t.prototype._peekContext = n, t.prototype._promiseCreated = function () {
													var t = this._peekContext();t && null == t._promiseCreated && (t._promiseCreated = this);
												};
											}, e;
										};
									}, {}], 9: [function (e, n, r) {
										n.exports = function (n, r) {
											function i(t, e) {
												return { promise: e };
											}function o() {
												return !1;
											}function u(t, e, n) {
												var r = this;try {
													t(e, n, function (t) {
														if ("function" != typeof t) throw new TypeError("onCancel must be a function, got: " + I.toString(t));r._attachCancellationCallback(t);
													});
												} catch (t) {
													return t;
												}
											}function a(t) {
												if (!this._isCancellable()) return this;var e = this._onCancel();void 0 !== e ? I.isArray(e) ? e.push(t) : this._setOnCancel([e, t]) : this._setOnCancel(t);
											}function c() {
												return this._onCancelField;
											}function s(t) {
												this._onCancelField = t;
											}function l() {
												this._cancellationParent = void 0, this._onCancelField = void 0;
											}function f(t, e) {
												if (0 != (1 & e)) {
													this._cancellationParent = t;var n = t._branchesRemainingToCancel;void 0 === n && (n = 0), t._branchesRemainingToCancel = n + 1;
												}0 != (2 & e) && t._isBound() && this._setBoundTo(t._boundTo);
											}function h() {
												var t = this._boundTo;return void 0 !== t && t instanceof n ? t.isFulfilled() ? t.value() : void 0 : t;
											}function p() {
												this._trace = new T(this._peekContext());
											}function _(t, e) {
												if (D(t)) {
													var n = this._trace;if (void 0 !== n && e && (n = n._parent), void 0 !== n) n.attachExtraTrace(t);else if (!t.__stackCleaned__) {
														var r = w(t);I.notEnumerableProp(t, "stack", r.message + "\n" + r.stack.join("\n")), I.notEnumerableProp(t, "__stackCleaned__", !0);
													}
												}
											}function d(t, e, r) {
												if (nt.warnings) {
													var i,
													    o = new L(t);if (e) r._attachExtraTrace(o);else if (nt.longStackTraces && (i = n._peekContext())) i.attachExtraTrace(o);else {
														var u = w(o);o.stack = u.message + "\n" + u.stack.join("\n");
													}K("warning", o) || j(o, "", !0);
												}
											}function v(t, e) {
												for (var n = 0; n < e.length - 1; ++n) {
													e[n].push("From previous event:"), e[n] = e[n].join("\n");
												}return n < e.length && (e[n] = e[n].join("\n")), t + "\n" + e.join("\n");
											}function y(t) {
												for (var e = 0; e < t.length; ++e) {
													(0 === t[e].length || e + 1 < t.length && t[e][0] === t[e + 1][0]) && (t.splice(e, 1), e--);
												}
											}function g(t) {
												for (var e = t[0], n = 1; n < t.length; ++n) {
													for (var r = t[n], i = e.length - 1, o = e[i], u = -1, a = r.length - 1; a >= 0; --a) {
														if (r[a] === o) {
															u = a;break;
														}
													}for (a = u; a >= 0; --a) {
														var c = r[a];if (e[i] !== c) break;e.pop(), i--;
													}e = r;
												}
											}function m(t) {
												for (var e = [], n = 0; n < t.length; ++n) {
													var r = t[n],
													    i = "    (No stack trace)" === r || M.test(r),
													    o = i && Y(r);i && !o && (z && " " !== r.charAt(0) && (r = "    " + r), e.push(r));
												}return e;
											}function b(t) {
												for (var e = t.stack.replace(/\s+$/g, "").split("\n"), n = 0; n < e.length; ++n) {
													var r = e[n];if ("    (No stack trace)" === r || M.test(r)) break;
												}return n > 0 && "SyntaxError" != t.name && (e = e.slice(n)), e;
											}function w(t) {
												var e = t.stack,
												    n = t.toString();return e = "string" == typeof e && e.length > 0 ? b(t) : ["    (No stack trace)"], { message: n, stack: "SyntaxError" == t.name ? e : m(e) };
											}function j(t, e, n) {
												if ("undefined" != typeof console) {
													var r;if (I.isObject(t)) {
														var i = t.stack;r = e + V(i, t);
													} else r = e + String(t);"function" == typeof O ? O(r, n) : ("function" == typeof console.log || "object" == _typeof2(console.log)) && console.log(r);
												}
											}function x(t, e, n, r) {
												var i = !1;try {
													"function" == typeof e && (i = !0, "rejectionHandled" === t ? e(r) : e(n, r));
												} catch (t) {
													P.throwLater(t);
												}"unhandledRejection" === t ? K(t, n, r) || i || j(n, "Unhandled rejection ") : K(t, r);
											}function E(t) {
												var e;if ("function" == typeof t) e = "[function " + (t.name || "anonymous") + "]";else {
													if (e = t && "function" == typeof t.toString ? t.toString() : I.toString(t), /\[object [a-zA-Z0-9$_]+\]/.test(e)) try {
														e = JSON.stringify(t);
													} catch (t) {}0 === e.length && (e = "(empty array)");
												}return "(<" + C(e) + ">, no stack trace)";
											}function C(t) {
												return t.length < 41 ? t : t.substr(0, 38) + "...";
											}function k() {
												return "function" == typeof et;
											}function F(t) {
												var e = t.match(tt);return e ? { fileName: e[1], line: parseInt(e[2], 10) } : void 0;
											}function T(t) {
												this._parent = t, this._promisesCreated = 0;var e = this._length = 1 + (void 0 === t ? 0 : t._length);et(this, T), e > 32 && this.uncycle();
											}var A,
											    S,
											    O,
											    R = n._getDomain,
											    P = n._async,
											    L = e("./errors").Warning,
											    I = e("./util"),
											    D = I.canAttachTrace,
											    U = /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/,
											    B = /\((?:timers\.js):\d+:\d+\)/,
											    N = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/,
											    M = null,
											    V = null,
											    z = !1,
											    H = !(0 == I.env("BLUEBIRD_DEBUG") || !I.env("BLUEBIRD_DEBUG") && "development" !== I.env("NODE_ENV")),
											    W = !(0 == I.env("BLUEBIRD_WARNINGS") || !H && !I.env("BLUEBIRD_WARNINGS")),
											    $ = !(0 == I.env("BLUEBIRD_LONG_STACK_TRACES") || !H && !I.env("BLUEBIRD_LONG_STACK_TRACES")),
											    q = 0 != I.env("BLUEBIRD_W_FORGOTTEN_RETURN") && (W || !!I.env("BLUEBIRD_W_FORGOTTEN_RETURN"));n.prototype.suppressUnhandledRejections = function () {
												var t = this._target();t._bitField = -1048577 & t._bitField | 524288;
											}, n.prototype._ensurePossibleRejectionHandled = function () {
												0 == (524288 & this._bitField) && (this._setRejectionIsUnhandled(), P.invokeLater(this._notifyUnhandledRejection, this, void 0));
											}, n.prototype._notifyUnhandledRejectionIsHandled = function () {
												x("rejectionHandled", A, void 0, this);
											}, n.prototype._setReturnedNonUndefined = function () {
												this._bitField = 268435456 | this._bitField;
											}, n.prototype._returnedNonUndefined = function () {
												return 0 != (268435456 & this._bitField);
											}, n.prototype._notifyUnhandledRejection = function () {
												if (this._isRejectionUnhandled()) {
													var t = this._settledValue();this._setUnhandledRejectionIsNotified(), x("unhandledRejection", S, t, this);
												}
											}, n.prototype._setUnhandledRejectionIsNotified = function () {
												this._bitField = 262144 | this._bitField;
											}, n.prototype._unsetUnhandledRejectionIsNotified = function () {
												this._bitField = -262145 & this._bitField;
											}, n.prototype._isUnhandledRejectionNotified = function () {
												return (262144 & this._bitField) > 0;
											}, n.prototype._setRejectionIsUnhandled = function () {
												this._bitField = 1048576 | this._bitField;
											}, n.prototype._unsetRejectionIsUnhandled = function () {
												this._bitField = -1048577 & this._bitField, this._isUnhandledRejectionNotified() && (this._unsetUnhandledRejectionIsNotified(), this._notifyUnhandledRejectionIsHandled());
											}, n.prototype._isRejectionUnhandled = function () {
												return (1048576 & this._bitField) > 0;
											}, n.prototype._warn = function (t, e, n) {
												return d(t, e, n || this);
											}, n.onPossiblyUnhandledRejection = function (t) {
												var e = R();S = "function" == typeof t ? null === e ? t : I.domainBind(e, t) : void 0;
											}, n.onUnhandledRejectionHandled = function (t) {
												var e = R();A = "function" == typeof t ? null === e ? t : I.domainBind(e, t) : void 0;
											};var Q = function Q() {};n.longStackTraces = function () {
												if (P.haveItemsQueued() && !nt.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");if (!nt.longStackTraces && k()) {
													var t = n.prototype._captureStackTrace,
													    e = n.prototype._attachExtraTrace;nt.longStackTraces = !0, Q = function Q() {
														if (P.haveItemsQueued() && !nt.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");n.prototype._captureStackTrace = t, n.prototype._attachExtraTrace = e, r.deactivateLongStackTraces(), P.enableTrampoline(), nt.longStackTraces = !1;
													}, n.prototype._captureStackTrace = p, n.prototype._attachExtraTrace = _, r.activateLongStackTraces(), P.disableTrampolineIfNecessary();
												}
											}, n.hasLongStackTraces = function () {
												return nt.longStackTraces && k();
											};var G = function () {
												try {
													if ("function" == typeof CustomEvent) {
														t = new CustomEvent("CustomEvent");return I.global.dispatchEvent(t), function (t, e) {
															var n = new CustomEvent(t.toLowerCase(), { detail: e, cancelable: !0 });return !I.global.dispatchEvent(n);
														};
													}if ("function" == typeof Event) {
														var t = new Event("CustomEvent");return I.global.dispatchEvent(t), function (t, e) {
															var n = new Event(t.toLowerCase(), { cancelable: !0 });return n.detail = e, !I.global.dispatchEvent(n);
														};
													}return (t = document.createEvent("CustomEvent")).initCustomEvent("testingtheevent", !1, !0, {}), I.global.dispatchEvent(t), function (t, e) {
														var n = document.createEvent("CustomEvent");return n.initCustomEvent(t.toLowerCase(), !1, !0, e), !I.global.dispatchEvent(n);
													};
												} catch (t) {}return function () {
													return !1;
												};
											}(),
											    Z = I.isNode ? function () {
												return t.emit.apply(t, arguments);
											} : I.global ? function (t) {
												var e = "on" + t.toLowerCase(),
												    n = I.global[e];return !!n && (n.apply(I.global, [].slice.call(arguments, 1)), !0);
											} : function () {
												return !1;
											},
											    X = { promiseCreated: i, promiseFulfilled: i, promiseRejected: i, promiseResolved: i, promiseCancelled: i, promiseChained: function promiseChained(t, e, n) {
													return { promise: e, child: n };
												}, warning: function warning(t, e) {
													return { warning: e };
												}, unhandledRejection: function unhandledRejection(t, e, n) {
													return { reason: e, promise: n };
												}, rejectionHandled: i },
											    K = function K(t) {
												var e = !1;try {
													e = Z.apply(null, arguments);
												} catch (t) {
													P.throwLater(t), e = !0;
												}var n = !1;try {
													n = G(t, X[t].apply(null, arguments));
												} catch (t) {
													P.throwLater(t), n = !0;
												}return n || e;
											};n.config = function (t) {
												if ("longStackTraces" in (t = Object(t)) && (t.longStackTraces ? n.longStackTraces() : !t.longStackTraces && n.hasLongStackTraces() && Q()), "warnings" in t) {
													var e = t.warnings;nt.warnings = !!e, q = nt.warnings, I.isObject(e) && "wForgottenReturn" in e && (q = !!e.wForgottenReturn);
												}if ("cancellation" in t && t.cancellation && !nt.cancellation) {
													if (P.haveItemsQueued()) throw new Error("cannot enable cancellation after promises are in use");n.prototype._clearCancellationData = l, n.prototype._propagateFrom = f, n.prototype._onCancel = c, n.prototype._setOnCancel = s, n.prototype._attachCancellationCallback = a, n.prototype._execute = u, J = f, nt.cancellation = !0;
												}return "monitoring" in t && (t.monitoring && !nt.monitoring ? (nt.monitoring = !0, n.prototype._fireEvent = K) : !t.monitoring && nt.monitoring && (nt.monitoring = !1, n.prototype._fireEvent = o)), n;
											}, n.prototype._fireEvent = o, n.prototype._execute = function (t, e, n) {
												try {
													t(e, n);
												} catch (t) {
													return t;
												}
											}, n.prototype._onCancel = function () {}, n.prototype._setOnCancel = function (t) {}, n.prototype._attachCancellationCallback = function (t) {}, n.prototype._captureStackTrace = function () {}, n.prototype._attachExtraTrace = function () {}, n.prototype._clearCancellationData = function () {}, n.prototype._propagateFrom = function (t, e) {};var J = function J(t, e) {
												0 != (2 & e) && t._isBound() && this._setBoundTo(t._boundTo);
											},
											    Y = function Y() {
												return !1;
											},
											    tt = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;I.inherits(T, Error), r.CapturedTrace = T, T.prototype.uncycle = function () {
												var t = this._length;if (!(2 > t)) {
													for (var e = [], n = {}, r = 0, i = this; void 0 !== i; ++r) {
														e.push(i), i = i._parent;
													}for (r = (t = this._length = r) - 1; r >= 0; --r) {
														var o = e[r].stack;void 0 === n[o] && (n[o] = r);
													}for (r = 0; t > r; ++r) {
														var u = n[e[r].stack];if (void 0 !== u && u !== r) {
															u > 0 && (e[u - 1]._parent = void 0, e[u - 1]._length = 1), e[r]._parent = void 0, e[r]._length = 1;var a = r > 0 ? e[r - 1] : this;t - 1 > u ? (a._parent = e[u + 1], a._parent.uncycle(), a._length = a._parent._length + 1) : (a._parent = void 0, a._length = 1);for (var c = a._length + 1, s = r - 2; s >= 0; --s) {
																e[s]._length = c, c++;
															}return;
														}
													}
												}
											}, T.prototype.attachExtraTrace = function (t) {
												if (!t.__stackCleaned__) {
													this.uncycle();for (var e = w(t), n = e.message, r = [e.stack], i = this; void 0 !== i;) {
														r.push(m(i.stack.split("\n"))), i = i._parent;
													}g(r), y(r), I.notEnumerableProp(t, "stack", v(n, r)), I.notEnumerableProp(t, "__stackCleaned__", !0);
												}
											};var et = function () {
												var t = /^\s*at\s*/,
												    e = function e(t, _e2) {
													return "string" == typeof t ? t : void 0 !== _e2.name && void 0 !== _e2.message ? _e2.toString() : E(_e2);
												};if ("number" == typeof Error.stackTraceLimit && "function" == typeof Error.captureStackTrace) {
													Error.stackTraceLimit += 6, M = t, V = e;var n = Error.captureStackTrace;return Y = function Y(t) {
														return U.test(t);
													}, function (t, e) {
														Error.stackTraceLimit += 6, n(t, e), Error.stackTraceLimit -= 6;
													};
												}var r = new Error();if ("string" == typeof r.stack && r.stack.split("\n")[0].indexOf("stackDetection@") >= 0) return M = /@/, V = e, z = !0, function (t) {
													t.stack = new Error().stack;
												};var i;try {
													throw new Error();
												} catch (t) {
													i = "stack" in t;
												}return "stack" in r || !i || "number" != typeof Error.stackTraceLimit ? (V = function V(t, e) {
													return "string" == typeof t ? t : "object" != (void 0 === e ? "undefined" : _typeof2(e)) && "function" != typeof e || void 0 === e.name || void 0 === e.message ? E(e) : e.toString();
												}, null) : (M = t, V = e, function (t) {
													Error.stackTraceLimit += 6;try {
														throw new Error();
													} catch (e) {
														t.stack = e.stack;
													}Error.stackTraceLimit -= 6;
												});
											}();"undefined" != typeof console && void 0 !== console.warn && (O = function O(t) {
												console.warn(t);
											}, I.isNode && t.stderr.isTTY ? O = function O(t, e) {
												var n = e ? "[33m" : "[31m";console.warn(n + t + "[0m\n");
											} : I.isNode || "string" != typeof new Error().stack || (O = function O(t, e) {
												console.warn("%c" + t, e ? "color: darkorange" : "color: red");
											}));var nt = { warnings: W, longStackTraces: !1, cancellation: !1, monitoring: !1 };return $ && n.longStackTraces(), { longStackTraces: function longStackTraces() {
													return nt.longStackTraces;
												}, warnings: function warnings() {
													return nt.warnings;
												}, cancellation: function cancellation() {
													return nt.cancellation;
												}, monitoring: function monitoring() {
													return nt.monitoring;
												}, propagateFromFunction: function propagateFromFunction() {
													return J;
												}, boundValueFunction: function boundValueFunction() {
													return h;
												}, checkForgottenReturns: function checkForgottenReturns(t, e, n, r, i) {
													if (void 0 === t && null !== e && q) {
														if (void 0 !== i && i._returnedNonUndefined()) return;if (0 == (65535 & r._bitField)) return;n && (n += " ");var o = "",
														    u = "";if (e._trace) {
															for (var a = e._trace.stack.split("\n"), c = m(a), s = c.length - 1; s >= 0; --s) {
																var l = c[s];if (!B.test(l)) {
																	var f = l.match(N);f && (o = "at " + f[1] + ":" + f[2] + ":" + f[3] + " ");break;
																}
															}if (c.length > 0) for (var h = c[0], s = 0; s < a.length; ++s) {
																if (a[s] === h) {
																	s > 0 && (u = "\n" + a[s - 1]);break;
																}
															}
														}var p = "a promise was created in a " + n + "handler " + o + "but was not returned from it, see http://goo.gl/rRqMUw" + u;r._warn(p, !0, e);
													}
												}, setBounds: function setBounds(t, e) {
													if (k()) {
														for (var n, r, i = t.stack.split("\n"), o = e.stack.split("\n"), u = -1, a = -1, c = 0; c < i.length; ++c) {
															if (s = F(i[c])) {
																n = s.fileName, u = s.line;break;
															}
														}for (c = 0; c < o.length; ++c) {
															var s = F(o[c]);if (s) {
																r = s.fileName, a = s.line;break;
															}
														}0 > u || 0 > a || !n || !r || n !== r || u >= a || (Y = function Y(t) {
															if (U.test(t)) return !0;var e = F(t);return !!(e && e.fileName === n && u <= e.line && e.line <= a);
														});
													}
												}, warn: d, deprecated: function deprecated(t, e) {
													var n = t + " is deprecated and will be removed in a future version.";return e && (n += " Use " + e + " instead."), d(n);
												}, CapturedTrace: T, fireDomEvent: G, fireGlobalEvent: Z };
										};
									}, { "./errors": 12, "./util": 36 }], 10: [function (t, e, n) {
										e.exports = function (t) {
											function e() {
												return this.value;
											}function n() {
												throw this.reason;
											}t.prototype.return = t.prototype.thenReturn = function (n) {
												return n instanceof t && n.suppressUnhandledRejections(), this._then(e, void 0, void 0, { value: n }, void 0);
											}, t.prototype.throw = t.prototype.thenThrow = function (t) {
												return this._then(n, void 0, void 0, { reason: t }, void 0);
											}, t.prototype.catchThrow = function (t) {
												if (arguments.length <= 1) return this._then(void 0, n, void 0, { reason: t }, void 0);var e = arguments[1];return this.caught(t, function () {
													throw e;
												});
											}, t.prototype.catchReturn = function (n) {
												if (arguments.length <= 1) return n instanceof t && n.suppressUnhandledRejections(), this._then(void 0, e, void 0, { value: n }, void 0);var r = arguments[1];r instanceof t && r.suppressUnhandledRejections();return this.caught(n, function () {
													return r;
												});
											};
										};
									}, {}], 11: [function (t, e, n) {
										e.exports = function (t, e) {
											function n() {
												return i(this);
											}var r = t.reduce,
											    i = t.all;t.prototype.each = function (t) {
												return r(this, t, e, 0)._then(n, void 0, void 0, this, void 0);
											}, t.prototype.mapSeries = function (t) {
												return r(this, t, e, e);
											}, t.each = function (t, i) {
												return r(t, i, e, 0)._then(n, void 0, void 0, t, void 0);
											}, t.mapSeries = function (t, n) {
												return r(t, n, e, e);
											};
										};
									}, {}], 12: [function (t, e, n) {
										function r(t, e) {
											function n(r) {
												return this instanceof n ? (f(this, "message", "string" == typeof r ? r : e), f(this, "name", t), void (Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : Error.call(this))) : new n(r);
											}return l(n, Error), n;
										}function i(t) {
											return this instanceof i ? (f(this, "name", "OperationalError"), f(this, "message", t), this.cause = t, this.isOperational = !0, void (t instanceof Error ? (f(this, "message", t.message), f(this, "stack", t.stack)) : Error.captureStackTrace && Error.captureStackTrace(this, this.constructor))) : new i(t);
										}var o,
										    u,
										    a = t("./es5"),
										    c = a.freeze,
										    s = t("./util"),
										    l = s.inherits,
										    f = s.notEnumerableProp,
										    h = r("Warning", "warning"),
										    p = r("CancellationError", "cancellation error"),
										    _ = r("TimeoutError", "timeout error"),
										    d = r("AggregateError", "aggregate error");try {
											o = TypeError, u = RangeError;
										} catch (t) {
											o = r("TypeError", "type error"), u = r("RangeError", "range error");
										}for (var v = "join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "), y = 0; y < v.length; ++y) {
											"function" == typeof Array.prototype[v[y]] && (d.prototype[v[y]] = Array.prototype[v[y]]);
										}a.defineProperty(d.prototype, "length", { value: 0, configurable: !1, writable: !0, enumerable: !0 }), d.prototype.isOperational = !0;var g = 0;d.prototype.toString = function () {
											var t = Array(4 * g + 1).join(" "),
											    e = "\n" + t + "AggregateError of:\n";g++, t = Array(4 * g + 1).join(" ");for (var n = 0; n < this.length; ++n) {
												for (var r = this[n] === this ? "[Circular AggregateError]" : this[n] + "", i = r.split("\n"), o = 0; o < i.length; ++o) {
													i[o] = t + i[o];
												}e += (r = i.join("\n")) + "\n";
											}return g--, e;
										}, l(i, Error);var m = Error.__BluebirdErrorTypes__;m || (m = c({ CancellationError: p, TimeoutError: _, OperationalError: i, RejectionError: i, AggregateError: d }), a.defineProperty(Error, "__BluebirdErrorTypes__", { value: m, writable: !1, enumerable: !1, configurable: !1 })), e.exports = { Error: Error, TypeError: o, RangeError: u, CancellationError: m.CancellationError, OperationalError: m.OperationalError, TimeoutError: m.TimeoutError, AggregateError: m.AggregateError, Warning: h };
									}, { "./es5": 13, "./util": 36 }], 13: [function (t, e, n) {
										var r = function () {
											return void 0 === this;
										}();if (r) e.exports = { freeze: Object.freeze, defineProperty: Object.defineProperty, getDescriptor: Object.getOwnPropertyDescriptor, keys: Object.keys, names: Object.getOwnPropertyNames, getPrototypeOf: Object.getPrototypeOf, isArray: Array.isArray, isES5: r, propertyIsWritable: function propertyIsWritable(t, e) {
												var n = Object.getOwnPropertyDescriptor(t, e);return !(n && !n.writable && !n.set);
											} };else {
											var i = {}.hasOwnProperty,
											    o = {}.toString,
											    u = {}.constructor.prototype,
											    a = function a(t) {
												var e = [];for (var n in t) {
													i.call(t, n) && e.push(n);
												}return e;
											};e.exports = { isArray: function isArray(t) {
													try {
														return "[object Array]" === o.call(t);
													} catch (t) {
														return !1;
													}
												}, keys: a, names: a, defineProperty: function defineProperty(t, e, n) {
													return t[e] = n.value, t;
												}, getDescriptor: function getDescriptor(t, e) {
													return { value: t[e] };
												}, freeze: function freeze(t) {
													return t;
												}, getPrototypeOf: function getPrototypeOf(t) {
													try {
														return Object(t).constructor.prototype;
													} catch (t) {
														return u;
													}
												}, isES5: r, propertyIsWritable: function propertyIsWritable() {
													return !0;
												} };
										}
									}, {}], 14: [function (t, e, n) {
										e.exports = function (t, e) {
											var n = t.map;t.prototype.filter = function (t, r) {
												return n(this, t, r, e);
											}, t.filter = function (t, r, i) {
												return n(t, r, i, e);
											};
										};
									}, {}], 15: [function (t, e, n) {
										e.exports = function (e, n, r) {
											function i(t, e, n) {
												this.promise = t, this.type = e, this.handler = n, this.called = !1, this.cancelPromise = null;
											}function o(t) {
												this.finallyHandler = t;
											}function u(t, e) {
												return null != t.cancelPromise && (arguments.length > 1 ? t.cancelPromise._reject(e) : t.cancelPromise._cancel(), t.cancelPromise = null, !0);
											}function a() {
												return s.call(this, this.promise._target()._settledValue());
											}function c(t) {
												return u(this, t) ? void 0 : (h.e = t, h);
											}function s(t) {
												var i = this.promise,
												    s = this.handler;if (!this.called) {
													this.called = !0;var l = this.isFinallyHandler() ? s.call(i._boundValue()) : s.call(i._boundValue(), t);if (l === r) return l;if (void 0 !== l) {
														i._setReturnedNonUndefined();var p = n(l, i);if (p instanceof e) {
															if (null != this.cancelPromise) {
																if (p._isCancelled()) {
																	var _ = new f("late cancellation observer");return i._attachExtraTrace(_), h.e = _, h;
																}p.isPending() && p._attachCancellationCallback(new o(this));
															}return p._then(a, c, void 0, this, void 0);
														}
													}
												}return i.isRejected() ? (u(this), h.e = t, h) : (u(this), t);
											}var l = t("./util"),
											    f = e.CancellationError,
											    h = l.errorObj,
											    p = t("./catch_filter")(r);return i.prototype.isFinallyHandler = function () {
												return 0 === this.type;
											}, o.prototype._resultCancelled = function () {
												u(this.finallyHandler);
											}, e.prototype._passThrough = function (t, e, n, r) {
												return "function" != typeof t ? this.then() : this._then(n, r, void 0, new i(this, e, t), void 0);
											}, e.prototype.lastly = e.prototype.finally = function (t) {
												return this._passThrough(t, 0, s, s);
											}, e.prototype.tap = function (t) {
												return this._passThrough(t, 1, s);
											}, e.prototype.tapCatch = function (t) {
												var n = arguments.length;if (1 === n) return this._passThrough(t, 1, void 0, s);var r,
												    i = new Array(n - 1),
												    o = 0;for (r = 0; n - 1 > r; ++r) {
													var u = arguments[r];if (!l.isObject(u)) return e.reject(new TypeError("tapCatch statement predicate: expecting an object but got " + l.classString(u)));i[o++] = u;
												}i.length = o;var a = arguments[r];return this._passThrough(p(i, a, this), 1, void 0, s);
											}, i;
										};
									}, { "./catch_filter": 7, "./util": 36 }], 16: [function (t, e, n) {
										e.exports = function (e, n, r, i, o, u) {
											function a(t, n, r) {
												for (var o = 0; o < n.length; ++o) {
													r._pushContext();var u = h(n[o])(t);if (r._popContext(), u === f) {
														r._pushContext();var a = e.reject(f.e);return r._popContext(), a;
													}var c = i(u, r);if (c instanceof e) return c;
												}return null;
											}function c(t, n, i, o) {
												if (u.cancellation()) {
													var a = new e(r),
													    c = this._finallyPromise = new e(r);this._promise = a.lastly(function () {
														return c;
													}), a._captureStackTrace(), a._setOnCancel(this);
												} else (this._promise = new e(r))._captureStackTrace();this._stack = o, this._generatorFunction = t, this._receiver = n, this._generator = void 0, this._yieldHandlers = "function" == typeof i ? [i].concat(p) : p, this._yieldedPromise = null, this._cancellationPhase = !1;
											}var s = t("./errors").TypeError,
											    l = t("./util"),
											    f = l.errorObj,
											    h = l.tryCatch,
											    p = [];l.inherits(c, o), c.prototype._isResolved = function () {
												return null === this._promise;
											}, c.prototype._cleanup = function () {
												this._promise = this._generator = null, u.cancellation() && null !== this._finallyPromise && (this._finallyPromise._fulfill(), this._finallyPromise = null);
											}, c.prototype._promiseCancelled = function () {
												if (!this._isResolved()) {
													var t;if (void 0 !== this._generator.return) this._promise._pushContext(), t = h(this._generator.return).call(this._generator, void 0), this._promise._popContext();else {
														var n = new e.CancellationError("generator .return() sentinel");e.coroutine.returnSentinel = n, this._promise._attachExtraTrace(n), this._promise._pushContext(), t = h(this._generator.throw).call(this._generator, n), this._promise._popContext();
													}this._cancellationPhase = !0, this._yieldedPromise = null, this._continue(t);
												}
											}, c.prototype._promiseFulfilled = function (t) {
												this._yieldedPromise = null, this._promise._pushContext();var e = h(this._generator.next).call(this._generator, t);this._promise._popContext(), this._continue(e);
											}, c.prototype._promiseRejected = function (t) {
												this._yieldedPromise = null, this._promise._attachExtraTrace(t), this._promise._pushContext();var e = h(this._generator.throw).call(this._generator, t);this._promise._popContext(), this._continue(e);
											}, c.prototype._resultCancelled = function () {
												if (this._yieldedPromise instanceof e) {
													var t = this._yieldedPromise;this._yieldedPromise = null, t.cancel();
												}
											}, c.prototype.promise = function () {
												return this._promise;
											}, c.prototype._run = function () {
												this._generator = this._generatorFunction.call(this._receiver), this._receiver = this._generatorFunction = void 0, this._promiseFulfilled(void 0);
											}, c.prototype._continue = function (t) {
												var n = this._promise;if (t === f) return this._cleanup(), this._cancellationPhase ? n.cancel() : n._rejectCallback(t.e, !1);var r = t.value;if (!0 === t.done) return this._cleanup(), this._cancellationPhase ? n.cancel() : n._resolveCallback(r);var o = i(r, this._promise);if (o instanceof e || null !== (o = a(o, this._yieldHandlers, this._promise))) {
													var u = (o = o._target())._bitField;0 == (50397184 & u) ? (this._yieldedPromise = o, o._proxy(this, null)) : 0 != (33554432 & u) ? e._async.invoke(this._promiseFulfilled, this, o._value()) : 0 != (16777216 & u) ? e._async.invoke(this._promiseRejected, this, o._reason()) : this._promiseCancelled();
												} else this._promiseRejected(new s("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s", String(r)) + "From coroutine:\n" + this._stack.split("\n").slice(1, -7).join("\n")));
											}, e.coroutine = function (t, e) {
												if ("function" != typeof t) throw new s("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");var n = Object(e).yieldHandler,
												    r = c,
												    i = new Error().stack;return function () {
													var e = t.apply(this, arguments),
													    o = new r(void 0, void 0, n, i),
													    u = o.promise();return o._generator = e, o._promiseFulfilled(void 0), u;
												};
											}, e.coroutine.addYieldHandler = function (t) {
												if ("function" != typeof t) throw new s("expecting a function but got " + l.classString(t));p.push(t);
											}, e.spawn = function (t) {
												if (u.deprecated("Promise.spawn()", "Promise.coroutine()"), "function" != typeof t) return n("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");var r = new c(t, this),
												    i = r.promise();return r._run(e.spawn), i;
											};
										};
									}, { "./errors": 12, "./util": 36 }], 17: [function (t, e, n) {
										e.exports = function (e, n, r, i, o, u) {
											var a = t("./util");a.canEvaluate, a.tryCatch, a.errorObj, e.join = function () {
												var t,
												    e = arguments.length - 1;if (e > 0 && "function" == typeof arguments[e]) {
													t = arguments[e];
												}var r = [].slice.call(arguments);t && r.pop();var i = new n(r).promise();return void 0 !== t ? i.spread(t) : i;
											};
										};
									}, { "./util": 36 }], 18: [function (t, e, n) {
										e.exports = function (e, n, r, i, o, u) {
											function a(t, e, n, r) {
												this.constructor$(t), this._promise._captureStackTrace();var i = s();this._callback = null === i ? e : l.domainBind(i, e), this._preservedValues = r === o ? new Array(this.length()) : null, this._limit = n, this._inFlight = 0, this._queue = [], p.invoke(this._asyncInit, this, void 0);
											}function c(t, n, i, o) {
												if ("function" != typeof n) return r("expecting a function but got " + l.classString(n));var u = 0;if (void 0 !== i) {
													if ("object" != (void 0 === i ? "undefined" : _typeof2(i)) || null === i) return e.reject(new TypeError("options argument must be an object but it is " + l.classString(i)));if ("number" != typeof i.concurrency) return e.reject(new TypeError("'concurrency' must be a number but it is " + l.classString(i.concurrency)));u = i.concurrency;
												}return u = "number" == typeof u && isFinite(u) && u >= 1 ? u : 0, new a(t, n, u, o).promise();
											}var s = e._getDomain,
											    l = t("./util"),
											    f = l.tryCatch,
											    h = l.errorObj,
											    p = e._async;l.inherits(a, n), a.prototype._asyncInit = function () {
												this._init$(void 0, -2);
											}, a.prototype._init = function () {}, a.prototype._promiseFulfilled = function (t, n) {
												var r = this._values,
												    o = this.length(),
												    a = this._preservedValues,
												    c = this._limit;if (0 > n) {
													if (n = -1 * n - 1, r[n] = t, c >= 1 && (this._inFlight--, this._drainQueue(), this._isResolved())) return !0;
												} else {
													if (c >= 1 && this._inFlight >= c) return r[n] = t, this._queue.push(n), !1;null !== a && (a[n] = t);var s = this._promise,
													    l = this._callback,
													    p = s._boundValue();s._pushContext();var _ = f(l).call(p, t, n, o),
													    d = s._popContext();if (u.checkForgottenReturns(_, d, null !== a ? "Promise.filter" : "Promise.map", s), _ === h) return this._reject(_.e), !0;var v = i(_, this._promise);if (v instanceof e) {
														var y = (v = v._target())._bitField;if (0 == (50397184 & y)) return c >= 1 && this._inFlight++, r[n] = v, v._proxy(this, -1 * (n + 1)), !1;if (0 == (33554432 & y)) return 0 != (16777216 & y) ? (this._reject(v._reason()), !0) : (this._cancel(), !0);_ = v._value();
													}r[n] = _;
												}return ++this._totalResolved >= o && (null !== a ? this._filter(r, a) : this._resolve(r), !0);
											}, a.prototype._drainQueue = function () {
												for (var t = this._queue, e = this._limit, n = this._values; t.length > 0 && this._inFlight < e;) {
													if (this._isResolved()) return;var r = t.pop();this._promiseFulfilled(n[r], r);
												}
											}, a.prototype._filter = function (t, e) {
												for (var n = e.length, r = new Array(n), i = 0, o = 0; n > o; ++o) {
													t[o] && (r[i++] = e[o]);
												}r.length = i, this._resolve(r);
											}, a.prototype.preservedValues = function () {
												return this._preservedValues;
											}, e.prototype.map = function (t, e) {
												return c(this, t, e, null);
											}, e.map = function (t, e, n, r) {
												return c(t, e, n, r);
											};
										};
									}, { "./util": 36 }], 19: [function (t, e, n) {
										e.exports = function (e, n, r, i, o) {
											var u = t("./util"),
											    a = u.tryCatch;e.method = function (t) {
												if ("function" != typeof t) throw new e.TypeError("expecting a function but got " + u.classString(t));return function () {
													var r = new e(n);r._captureStackTrace(), r._pushContext();var i = a(t).apply(this, arguments),
													    u = r._popContext();return o.checkForgottenReturns(i, u, "Promise.method", r), r._resolveFromSyncValue(i), r;
												};
											}, e.attempt = e.try = function (t) {
												if ("function" != typeof t) return i("expecting a function but got " + u.classString(t));var r = new e(n);r._captureStackTrace(), r._pushContext();var c;if (arguments.length > 1) {
													o.deprecated("calling Promise.try with more than 1 argument");var s = arguments[1],
													    l = arguments[2];c = u.isArray(s) ? a(t).apply(l, s) : a(t).call(l, s);
												} else c = a(t)();var f = r._popContext();return o.checkForgottenReturns(c, f, "Promise.try", r), r._resolveFromSyncValue(c), r;
											}, e.prototype._resolveFromSyncValue = function (t) {
												t === u.errorObj ? this._rejectCallback(t.e, !1) : this._resolveCallback(t, !0);
											};
										};
									}, { "./util": 36 }], 20: [function (t, e, n) {
										function r(t) {
											return t instanceof Error && c.getPrototypeOf(t) === Error.prototype;
										}function i(t) {
											var e;if (r(t)) {
												(e = new a(t)).name = t.name, e.message = t.message, e.stack = t.stack;for (var n = c.keys(t), i = 0; i < n.length; ++i) {
													var u = n[i];s.test(u) || (e[u] = t[u]);
												}return e;
											}return o.markAsOriginatingFromRejection(t), t;
										}var o = t("./util"),
										    u = o.maybeWrapAsError,
										    a = t("./errors").OperationalError,
										    c = t("./es5"),
										    s = /^(?:name|message|stack|cause)$/;e.exports = function (t, e) {
											return function (n, r) {
												if (null !== t) {
													if (n) {
														var o = i(u(n));t._attachExtraTrace(o), t._reject(o);
													} else if (e) {
														var a = [].slice.call(arguments, 1);t._fulfill(a);
													} else t._fulfill(r);t = null;
												}
											};
										};
									}, { "./errors": 12, "./es5": 13, "./util": 36 }], 21: [function (t, e, n) {
										e.exports = function (e) {
											function n(t, e) {
												var n = this;if (!o.isArray(t)) return r.call(n, t, e);var i = a(e).apply(n._boundValue(), [null].concat(t));i === c && u.throwLater(i.e);
											}function r(t, e) {
												var n = this._boundValue(),
												    r = void 0 === t ? a(e).call(n, null) : a(e).call(n, null, t);r === c && u.throwLater(r.e);
											}function i(t, e) {
												var n = this;if (!t) {
													var r = new Error(t + "");r.cause = t, t = r;
												}var i = a(e).call(n._boundValue(), t);i === c && u.throwLater(i.e);
											}var o = t("./util"),
											    u = e._async,
											    a = o.tryCatch,
											    c = o.errorObj;e.prototype.asCallback = e.prototype.nodeify = function (t, e) {
												if ("function" == typeof t) {
													var o = r;void 0 !== e && Object(e).spread && (o = n), this._then(o, i, void 0, this, t);
												}return this;
											};
										};
									}, { "./util": 36 }], 22: [function (e, n, r) {
										n.exports = function () {
											function r() {}function i(t, e) {
												if (null == t || t.constructor !== o) throw new m("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n");if ("function" != typeof e) throw new m("expecting a function but got " + _.classString(e));
											}function o(t) {
												t !== w && i(this, t), this._bitField = 0, this._fulfillmentHandler0 = void 0, this._rejectionHandler0 = void 0, this._promise0 = void 0, this._receiver0 = void 0, this._resolveFromExecutor(t), this._promiseCreated(), this._fireEvent("promiseCreated", this);
											}function u(t) {
												this.promise._resolveCallback(t);
											}function a(t) {
												this.promise._rejectCallback(t, !1);
											}function c(t) {
												var e = new o(w);e._fulfillmentHandler0 = t, e._rejectionHandler0 = t, e._promise0 = t, e._receiver0 = t;
											}var s,
											    l = function l() {
												return new m("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n");
											},
											    f = function f() {
												return new o.PromiseInspection(this._target());
											},
											    h = function h(t) {
												return o.reject(new m(t));
											},
											    p = {},
											    _ = e("./util");s = _.isNode ? function () {
												var e = t.domain;return void 0 === e && (e = null), e;
											} : function () {
												return null;
											}, _.notEnumerableProp(o, "_getDomain", s);var d = e("./es5"),
											    v = e("./async"),
											    y = new v();d.defineProperty(o, "_async", { value: y });var g = e("./errors"),
											    m = o.TypeError = g.TypeError;o.RangeError = g.RangeError;var b = o.CancellationError = g.CancellationError;o.TimeoutError = g.TimeoutError, o.OperationalError = g.OperationalError, o.RejectionError = g.OperationalError, o.AggregateError = g.AggregateError;var w = function w() {},
											    j = {},
											    x = {},
											    E = e("./thenables")(o, w),
											    C = e("./promise_array")(o, w, E, h, r),
											    k = e("./context")(o),
											    F = k.create,
											    T = e("./debuggability")(o, k),
											    A = (T.CapturedTrace, e("./finally")(o, E, x)),
											    S = e("./catch_filter")(x),
											    O = e("./nodeback"),
											    R = _.errorObj,
											    P = _.tryCatch;return o.prototype.toString = function () {
												return "[object Promise]";
											}, o.prototype.caught = o.prototype.catch = function (t) {
												var e = arguments.length;if (e > 1) {
													var n,
													    r = new Array(e - 1),
													    i = 0;for (n = 0; e - 1 > n; ++n) {
														var o = arguments[n];if (!_.isObject(o)) return h("Catch statement predicate: expecting an object but got " + _.classString(o));r[i++] = o;
													}return r.length = i, t = arguments[n], this.then(void 0, S(r, t, this));
												}return this.then(void 0, t);
											}, o.prototype.reflect = function () {
												return this._then(f, f, void 0, this, void 0);
											}, o.prototype.then = function (t, e) {
												if (T.warnings() && arguments.length > 0 && "function" != typeof t && "function" != typeof e) {
													var n = ".then() only accepts functions but was passed: " + _.classString(t);arguments.length > 1 && (n += ", " + _.classString(e)), this._warn(n);
												}return this._then(t, e, void 0, void 0, void 0);
											}, o.prototype.done = function (t, e) {
												this._then(t, e, void 0, void 0, void 0)._setIsFinal();
											}, o.prototype.spread = function (t) {
												return "function" != typeof t ? h("expecting a function but got " + _.classString(t)) : this.all()._then(t, void 0, void 0, j, void 0);
											}, o.prototype.toJSON = function () {
												var t = { isFulfilled: !1, isRejected: !1, fulfillmentValue: void 0, rejectionReason: void 0 };return this.isFulfilled() ? (t.fulfillmentValue = this.value(), t.isFulfilled = !0) : this.isRejected() && (t.rejectionReason = this.reason(), t.isRejected = !0), t;
											}, o.prototype.all = function () {
												return arguments.length > 0 && this._warn(".all() was passed arguments but it does not take any"), new C(this).promise();
											}, o.prototype.error = function (t) {
												return this.caught(_.originatesFromRejection, t);
											}, o.getNewLibraryCopy = n.exports, o.is = function (t) {
												return t instanceof o;
											}, o.fromNode = o.fromCallback = function (t) {
												var e = new o(w);e._captureStackTrace();var n = arguments.length > 1 && !!Object(arguments[1]).multiArgs,
												    r = P(t)(O(e, n));return r === R && e._rejectCallback(r.e, !0), e._isFateSealed() || e._setAsyncGuaranteed(), e;
											}, o.all = function (t) {
												return new C(t).promise();
											}, o.cast = function (t) {
												var e = E(t);return e instanceof o || ((e = new o(w))._captureStackTrace(), e._setFulfilled(), e._rejectionHandler0 = t), e;
											}, o.resolve = o.fulfilled = o.cast, o.reject = o.rejected = function (t) {
												var e = new o(w);return e._captureStackTrace(), e._rejectCallback(t, !0), e;
											}, o.setScheduler = function (t) {
												if ("function" != typeof t) throw new m("expecting a function but got " + _.classString(t));return y.setScheduler(t);
											}, o.prototype._then = function (t, e, n, r, i) {
												var u = void 0 !== i,
												    a = u ? i : new o(w),
												    c = this._target(),
												    l = c._bitField;u || (a._propagateFrom(this, 3), a._captureStackTrace(), void 0 === r && 0 != (2097152 & this._bitField) && (r = 0 != (50397184 & l) ? this._boundValue() : c === this ? void 0 : this._boundTo), this._fireEvent("promiseChained", this, a));var f = s();if (0 != (50397184 & l)) {
													var h,
													    p,
													    d = c._settlePromiseCtx;0 != (33554432 & l) ? (p = c._rejectionHandler0, h = t) : 0 != (16777216 & l) ? (p = c._fulfillmentHandler0, h = e, c._unsetRejectionIsUnhandled()) : (d = c._settlePromiseLateCancellationObserver, p = new b("late cancellation observer"), c._attachExtraTrace(p), h = e), y.invoke(d, c, { handler: null === f ? h : "function" == typeof h && _.domainBind(f, h), promise: a, receiver: r, value: p });
												} else c._addCallbacks(t, e, a, r, f);return a;
											}, o.prototype._length = function () {
												return 65535 & this._bitField;
											}, o.prototype._isFateSealed = function () {
												return 0 != (117506048 & this._bitField);
											}, o.prototype._isFollowing = function () {
												return 67108864 == (67108864 & this._bitField);
											}, o.prototype._setLength = function (t) {
												this._bitField = -65536 & this._bitField | 65535 & t;
											}, o.prototype._setFulfilled = function () {
												this._bitField = 33554432 | this._bitField, this._fireEvent("promiseFulfilled", this);
											}, o.prototype._setRejected = function () {
												this._bitField = 16777216 | this._bitField, this._fireEvent("promiseRejected", this);
											}, o.prototype._setFollowing = function () {
												this._bitField = 67108864 | this._bitField, this._fireEvent("promiseResolved", this);
											}, o.prototype._setIsFinal = function () {
												this._bitField = 4194304 | this._bitField;
											}, o.prototype._isFinal = function () {
												return (4194304 & this._bitField) > 0;
											}, o.prototype._unsetCancelled = function () {
												this._bitField = -65537 & this._bitField;
											}, o.prototype._setCancelled = function () {
												this._bitField = 65536 | this._bitField, this._fireEvent("promiseCancelled", this);
											}, o.prototype._setWillBeCancelled = function () {
												this._bitField = 8388608 | this._bitField;
											}, o.prototype._setAsyncGuaranteed = function () {
												y.hasCustomScheduler() || (this._bitField = 134217728 | this._bitField);
											}, o.prototype._receiverAt = function (t) {
												var e = 0 === t ? this._receiver0 : this[4 * t - 4 + 3];return e === p ? void 0 : void 0 === e && this._isBound() ? this._boundValue() : e;
											}, o.prototype._promiseAt = function (t) {
												return this[4 * t - 4 + 2];
											}, o.prototype._fulfillmentHandlerAt = function (t) {
												return this[4 * t - 4 + 0];
											}, o.prototype._rejectionHandlerAt = function (t) {
												return this[4 * t - 4 + 1];
											}, o.prototype._boundValue = function () {}, o.prototype._migrateCallback0 = function (t) {
												var e = (t._bitField, t._fulfillmentHandler0),
												    n = t._rejectionHandler0,
												    r = t._promise0,
												    i = t._receiverAt(0);void 0 === i && (i = p), this._addCallbacks(e, n, r, i, null);
											}, o.prototype._migrateCallbackAt = function (t, e) {
												var n = t._fulfillmentHandlerAt(e),
												    r = t._rejectionHandlerAt(e),
												    i = t._promiseAt(e),
												    o = t._receiverAt(e);void 0 === o && (o = p), this._addCallbacks(n, r, i, o, null);
											}, o.prototype._addCallbacks = function (t, e, n, r, i) {
												var o = this._length();if (o >= 65531 && (o = 0, this._setLength(0)), 0 === o) this._promise0 = n, this._receiver0 = r, "function" == typeof t && (this._fulfillmentHandler0 = null === i ? t : _.domainBind(i, t)), "function" == typeof e && (this._rejectionHandler0 = null === i ? e : _.domainBind(i, e));else {
													var u = 4 * o - 4;this[u + 2] = n, this[u + 3] = r, "function" == typeof t && (this[u + 0] = null === i ? t : _.domainBind(i, t)), "function" == typeof e && (this[u + 1] = null === i ? e : _.domainBind(i, e));
												}return this._setLength(o + 1), o;
											}, o.prototype._proxy = function (t, e) {
												this._addCallbacks(void 0, void 0, e, t, null);
											}, o.prototype._resolveCallback = function (t, e) {
												if (0 == (117506048 & this._bitField)) {
													if (t === this) return this._rejectCallback(l(), !1);var n = E(t, this);if (!(n instanceof o)) return this._fulfill(t);e && this._propagateFrom(n, 2);var r = n._target();if (r === this) return void this._reject(l());var i = r._bitField;if (0 == (50397184 & i)) {
														var u = this._length();u > 0 && r._migrateCallback0(this);for (var a = 1; u > a; ++a) {
															r._migrateCallbackAt(this, a);
														}this._setFollowing(), this._setLength(0), this._setFollowee(r);
													} else if (0 != (33554432 & i)) this._fulfill(r._value());else if (0 != (16777216 & i)) this._reject(r._reason());else {
														var c = new b("late cancellation observer");r._attachExtraTrace(c), this._reject(c);
													}
												}
											}, o.prototype._rejectCallback = function (t, e, n) {
												var r = _.ensureErrorObject(t),
												    i = r === t;if (!i && !n && T.warnings()) {
													var o = "a promise was rejected with a non-error: " + _.classString(t);this._warn(o, !0);
												}this._attachExtraTrace(r, !!e && i), this._reject(t);
											}, o.prototype._resolveFromExecutor = function (t) {
												if (t !== w) {
													var e = this;this._captureStackTrace(), this._pushContext();var n = !0,
													    r = this._execute(t, function (t) {
														e._resolveCallback(t);
													}, function (t) {
														e._rejectCallback(t, n);
													});n = !1, this._popContext(), void 0 !== r && e._rejectCallback(r, !0);
												}
											}, o.prototype._settlePromiseFromHandler = function (t, e, n, r) {
												var i = r._bitField;if (0 == (65536 & i)) {
													r._pushContext();var o;e === j ? n && "number" == typeof n.length ? o = P(t).apply(this._boundValue(), n) : (o = R, o.e = new m("cannot .spread() a non-array: " + _.classString(n))) : o = P(t).call(e, n);var u = r._popContext();0 == (65536 & (i = r._bitField)) && (o === x ? r._reject(n) : o === R ? r._rejectCallback(o.e, !1) : (T.checkForgottenReturns(o, u, "", r, this), r._resolveCallback(o)));
												}
											}, o.prototype._target = function () {
												for (var t = this; t._isFollowing();) {
													t = t._followee();
												}return t;
											}, o.prototype._followee = function () {
												return this._rejectionHandler0;
											}, o.prototype._setFollowee = function (t) {
												this._rejectionHandler0 = t;
											}, o.prototype._settlePromise = function (t, e, n, i) {
												var u = t instanceof o,
												    a = this._bitField,
												    c = 0 != (134217728 & a);0 != (65536 & a) ? (u && t._invokeInternalOnCancel(), n instanceof A && n.isFinallyHandler() ? (n.cancelPromise = t, P(e).call(n, i) === R && t._reject(R.e)) : e === f ? t._fulfill(f.call(n)) : n instanceof r ? n._promiseCancelled(t) : u || t instanceof C ? t._cancel() : n.cancel()) : "function" == typeof e ? u ? (c && t._setAsyncGuaranteed(), this._settlePromiseFromHandler(e, n, i, t)) : e.call(n, i, t) : n instanceof r ? n._isResolved() || (0 != (33554432 & a) ? n._promiseFulfilled(i, t) : n._promiseRejected(i, t)) : u && (c && t._setAsyncGuaranteed(), 0 != (33554432 & a) ? t._fulfill(i) : t._reject(i));
											}, o.prototype._settlePromiseLateCancellationObserver = function (t) {
												var e = t.handler,
												    n = t.promise,
												    r = t.receiver,
												    i = t.value;"function" == typeof e ? n instanceof o ? this._settlePromiseFromHandler(e, r, i, n) : e.call(r, i, n) : n instanceof o && n._reject(i);
											}, o.prototype._settlePromiseCtx = function (t) {
												this._settlePromise(t.promise, t.handler, t.receiver, t.value);
											}, o.prototype._settlePromise0 = function (t, e, n) {
												var r = this._promise0,
												    i = this._receiverAt(0);this._promise0 = void 0, this._receiver0 = void 0, this._settlePromise(r, t, i, e);
											}, o.prototype._clearCallbackDataAtIndex = function (t) {
												var e = 4 * t - 4;this[e + 2] = this[e + 3] = this[e + 0] = this[e + 1] = void 0;
											}, o.prototype._fulfill = function (t) {
												var e = this._bitField;if (!((117506048 & e) >>> 16)) {
													if (t === this) {
														var n = l();return this._attachExtraTrace(n), this._reject(n);
													}this._setFulfilled(), this._rejectionHandler0 = t, (65535 & e) > 0 && (0 != (134217728 & e) ? this._settlePromises() : y.settlePromises(this));
												}
											}, o.prototype._reject = function (t) {
												var e = this._bitField;if (!((117506048 & e) >>> 16)) return this._setRejected(), this._fulfillmentHandler0 = t, this._isFinal() ? y.fatalError(t, _.isNode) : void ((65535 & e) > 0 ? y.settlePromises(this) : this._ensurePossibleRejectionHandled());
											}, o.prototype._fulfillPromises = function (t, e) {
												for (var n = 1; t > n; n++) {
													var r = this._fulfillmentHandlerAt(n),
													    i = this._promiseAt(n),
													    o = this._receiverAt(n);this._clearCallbackDataAtIndex(n), this._settlePromise(i, r, o, e);
												}
											}, o.prototype._rejectPromises = function (t, e) {
												for (var n = 1; t > n; n++) {
													var r = this._rejectionHandlerAt(n),
													    i = this._promiseAt(n),
													    o = this._receiverAt(n);this._clearCallbackDataAtIndex(n), this._settlePromise(i, r, o, e);
												}
											}, o.prototype._settlePromises = function () {
												var t = this._bitField,
												    e = 65535 & t;if (e > 0) {
													if (0 != (16842752 & t)) {
														var n = this._fulfillmentHandler0;this._settlePromise0(this._rejectionHandler0, n, t), this._rejectPromises(e, n);
													} else {
														var r = this._rejectionHandler0;this._settlePromise0(this._fulfillmentHandler0, r, t), this._fulfillPromises(e, r);
													}this._setLength(0);
												}this._clearCancellationData();
											}, o.prototype._settledValue = function () {
												var t = this._bitField;return 0 != (33554432 & t) ? this._rejectionHandler0 : 0 != (16777216 & t) ? this._fulfillmentHandler0 : void 0;
											}, o.defer = o.pending = function () {
												return T.deprecated("Promise.defer", "new Promise"), { promise: new o(w), resolve: u, reject: a };
											}, _.notEnumerableProp(o, "_makeSelfResolutionError", l), e("./method")(o, w, E, h, T), e("./bind")(o, w, E, T), e("./cancel")(o, C, h, T), e("./direct_resolve")(o), e("./synchronous_inspection")(o), e("./join")(o, C, E, w, y, s), o.Promise = o, o.version = "3.5.0", e("./map.js")(o, C, h, E, w, T), e("./call_get.js")(o), e("./using.js")(o, h, E, F, w, T), e("./timers.js")(o, w, T), e("./generators.js")(o, h, w, E, r, T), e("./nodeify.js")(o), e("./promisify.js")(o, w), e("./props.js")(o, C, E, h), e("./race.js")(o, w, E, h), e("./reduce.js")(o, C, h, E, w, T), e("./settle.js")(o, C, T), e("./some.js")(o, C, h), e("./filter.js")(o, w), e("./each.js")(o, w), e("./any.js")(o), _.toFastProperties(o), _.toFastProperties(o.prototype), c({ a: 1 }), c({ b: 2 }), c({ c: 3 }), c(1), c(function () {}), c(void 0), c(!1), c(new o(w)), T.setBounds(v.firstLineError, _.lastLineError), o;
										};
									}, { "./any.js": 1, "./async": 2, "./bind": 3, "./call_get.js": 5, "./cancel": 6, "./catch_filter": 7, "./context": 8, "./debuggability": 9, "./direct_resolve": 10, "./each.js": 11, "./errors": 12, "./es5": 13, "./filter.js": 14, "./finally": 15, "./generators.js": 16, "./join": 17, "./map.js": 18, "./method": 19, "./nodeback": 20, "./nodeify.js": 21, "./promise_array": 23, "./promisify.js": 24, "./props.js": 25, "./race.js": 27, "./reduce.js": 28, "./settle.js": 30, "./some.js": 31, "./synchronous_inspection": 32, "./thenables": 33, "./timers.js": 34, "./using.js": 35, "./util": 36 }], 23: [function (t, e, n) {
										e.exports = function (e, n, r, i, o) {
											function u(t) {
												switch (t) {case -2:
														return [];case -3:
														return {};case -6:
														return new Map();}
											}function a(t) {
												var r = this._promise = new e(n);t instanceof e && r._propagateFrom(t, 3), r._setOnCancel(this), this._values = t, this._length = 0, this._totalResolved = 0, this._init(void 0, -2);
											}var c = t("./util");return c.isArray, c.inherits(a, o), a.prototype.length = function () {
												return this._length;
											}, a.prototype.promise = function () {
												return this._promise;
											}, a.prototype._init = function t(n, o) {
												var a = r(this._values, this._promise);if (a instanceof e) {
													var s = (a = a._target())._bitField;if (this._values = a, 0 == (50397184 & s)) return this._promise._setAsyncGuaranteed(), a._then(t, this._reject, void 0, this, o);if (0 == (33554432 & s)) return 0 != (16777216 & s) ? this._reject(a._reason()) : this._cancel();a = a._value();
												}{
													if (null !== (a = c.asArray(a))) return 0 === a.length ? void (-5 === o ? this._resolveEmptyArray() : this._resolve(u(o))) : void this._iterate(a);var l = i("expecting an array or an iterable object but got " + c.classString(a)).reason();this._promise._rejectCallback(l, !1);
												}
											}, a.prototype._iterate = function (t) {
												var n = this.getActualLength(t.length);this._length = n, this._values = this.shouldCopyValues() ? new Array(n) : this._values;for (var i = this._promise, o = !1, u = null, a = 0; n > a; ++a) {
													var c = r(t[a], i);c instanceof e ? (c = c._target(), u = c._bitField) : u = null, o ? null !== u && c.suppressUnhandledRejections() : null !== u ? 0 == (50397184 & u) ? (c._proxy(this, a), this._values[a] = c) : o = 0 != (33554432 & u) ? this._promiseFulfilled(c._value(), a) : 0 != (16777216 & u) ? this._promiseRejected(c._reason(), a) : this._promiseCancelled(a) : o = this._promiseFulfilled(c, a);
												}o || i._setAsyncGuaranteed();
											}, a.prototype._isResolved = function () {
												return null === this._values;
											}, a.prototype._resolve = function (t) {
												this._values = null, this._promise._fulfill(t);
											}, a.prototype._cancel = function () {
												!this._isResolved() && this._promise._isCancellable() && (this._values = null, this._promise._cancel());
											}, a.prototype._reject = function (t) {
												this._values = null, this._promise._rejectCallback(t, !1);
											}, a.prototype._promiseFulfilled = function (t, e) {
												return this._values[e] = t, ++this._totalResolved >= this._length && (this._resolve(this._values), !0);
											}, a.prototype._promiseCancelled = function () {
												return this._cancel(), !0;
											}, a.prototype._promiseRejected = function (t) {
												return this._totalResolved++, this._reject(t), !0;
											}, a.prototype._resultCancelled = function () {
												if (!this._isResolved()) {
													var t = this._values;if (this._cancel(), t instanceof e) t.cancel();else for (var n = 0; n < t.length; ++n) {
														t[n] instanceof e && t[n].cancel();
													}
												}
											}, a.prototype.shouldCopyValues = function () {
												return !0;
											}, a.prototype.getActualLength = function (t) {
												return t;
											}, a;
										};
									}, { "./util": 36 }], 24: [function (t, e, n) {
										e.exports = function (e, n) {
											function r(t) {
												return !m.test(t);
											}function i(t) {
												try {
													return !0 === t.__isPromisified__;
												} catch (t) {
													return !1;
												}
											}function o(t, e, n) {
												var r = f.getDataPropertyOrDefault(t, e + n, y);return !!r && i(r);
											}function u(t, e, n) {
												for (var r = 0; r < t.length; r += 2) {
													var i = t[r];if (n.test(i)) for (var o = i.replace(n, ""), u = 0; u < t.length; u += 2) {
														if (t[u] === o) throw new v("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s", e));
													}
												}
											}function a(t, e, n, r) {
												for (var a = f.inheritedDataKeys(t), c = [], s = 0; s < a.length; ++s) {
													var l = a[s],
													    h = t[l],
													    p = r === b || b(l, h, t);"function" != typeof h || i(h) || o(t, l, e) || !r(l, h, t, p) || c.push(l, h);
												}return u(c, e, n), c;
											}function c(t, e, n, r, i) {
												for (var o = new RegExp(w(e) + "$"), u = a(t, e, o, n), c = 0, s = u.length; s > c; c += 2) {
													var h = u[c],
													    p = u[c + 1],
													    _ = h + e;if (r === j) t[_] = j(h, l, h, p, e, i);else {
														var d = r(p, function () {
															return j(h, l, h, p, e, i);
														});f.notEnumerableProp(d, "__isPromisified__", !0), t[_] = d;
													}
												}return f.toFastProperties(t), t;
											}function s(t, e, n) {
												return j(t, e, void 0, t, null, n);
											}var l = {},
											    f = t("./util"),
											    h = t("./nodeback"),
											    p = f.withAppended,
											    _ = f.maybeWrapAsError,
											    d = f.canEvaluate,
											    v = t("./errors").TypeError,
											    y = { __isPromisified__: !0 },
											    g = ["arity", "length", "name", "arguments", "caller", "callee", "prototype", "__isPromisified__"],
											    m = new RegExp("^(?:" + g.join("|") + ")$"),
											    b = function b(t) {
												return f.isIdentifier(t) && "_" !== t.charAt(0) && "constructor" !== t;
											},
											    w = function w(t) {
												return t.replace(/([$])/, "\\$");
											},
											    j = d ? void 0 : function (t, r, i, o, u, a) {
												function c() {
													var i = r;r === l && (i = this);var o = new e(n);o._captureStackTrace();var u = "string" == typeof d && this !== s ? this[d] : t,
													    c = h(o, a);try {
														u.apply(i, p(arguments, c));
													} catch (t) {
														o._rejectCallback(_(t), !0, !0);
													}return o._isFateSealed() || o._setAsyncGuaranteed(), o;
												}var s = function () {
													return this;
												}(),
												    d = t;return "string" == typeof d && (t = o), f.notEnumerableProp(c, "__isPromisified__", !0), c;
											};e.promisify = function (t, e) {
												if ("function" != typeof t) throw new v("expecting a function but got " + f.classString(t));if (i(t)) return t;var n = s(t, void 0 === (e = Object(e)).context ? l : e.context, !!e.multiArgs);return f.copyDescriptors(t, n, r), n;
											}, e.promisifyAll = function (t, e) {
												if ("function" != typeof t && "object" != (void 0 === t ? "undefined" : _typeof2(t))) throw new v("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");var n = !!(e = Object(e)).multiArgs,
												    r = e.suffix;"string" != typeof r && (r = "Async");var i = e.filter;"function" != typeof i && (i = b);var o = e.promisifier;if ("function" != typeof o && (o = j), !f.isIdentifier(r)) throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");for (var u = f.inheritedDataKeys(t), a = 0; a < u.length; ++a) {
													var s = t[u[a]];"constructor" !== u[a] && f.isClass(s) && (c(s.prototype, r, i, o, n), c(s, r, i, o, n));
												}return c(t, r, i, o, n);
											};
										};
									}, { "./errors": 12, "./nodeback": 20, "./util": 36 }], 25: [function (t, e, n) {
										e.exports = function (e, n, r, i) {
											function o(t) {
												var e,
												    n = !1;if (void 0 !== a && t instanceof a) e = f(t), n = !0;else {
													var r = l.keys(t),
													    i = r.length;e = new Array(2 * i);for (var o = 0; i > o; ++o) {
														var u = r[o];e[o] = t[u], e[o + i] = u;
													}
												}this.constructor$(e), this._isMap = n, this._init$(void 0, n ? -6 : -3);
											}function u(t) {
												var n,
												    u = r(t);return s(u) ? (n = u instanceof e ? u._then(e.props, void 0, void 0, void 0, void 0) : new o(u).promise(), u instanceof e && n._propagateFrom(u, 2), n) : i("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n");
											}var a,
											    c = t("./util"),
											    s = c.isObject,
											    l = t("./es5");"function" == typeof Map && (a = Map);var f = function () {
												function t(t, r) {
													this[e] = t, this[e + n] = r, e++;
												}var e = 0,
												    n = 0;return function (r) {
													n = r.size, e = 0;var i = new Array(2 * r.size);return r.forEach(t, i), i;
												};
											}(),
											    h = function h(t) {
												for (var e = new a(), n = t.length / 2 | 0, r = 0; n > r; ++r) {
													var i = t[n + r],
													    o = t[r];e.set(i, o);
												}return e;
											};c.inherits(o, n), o.prototype._init = function () {}, o.prototype._promiseFulfilled = function (t, e) {
												if (this._values[e] = t, ++this._totalResolved >= this._length) {
													var n;if (this._isMap) n = h(this._values);else {
														n = {};for (var r = this.length(), i = 0, o = this.length(); o > i; ++i) {
															n[this._values[i + r]] = this._values[i];
														}
													}return this._resolve(n), !0;
												}return !1;
											}, o.prototype.shouldCopyValues = function () {
												return !1;
											}, o.prototype.getActualLength = function (t) {
												return t >> 1;
											}, e.prototype.props = function () {
												return u(this);
											}, e.props = function (t) {
												return u(t);
											};
										};
									}, { "./es5": 13, "./util": 36 }], 26: [function (t, e, n) {
										function r(t, e, n, r, i) {
											for (var o = 0; i > o; ++o) {
												n[o + r] = t[o + e], t[o + e] = void 0;
											}
										}function i(t) {
											this._capacity = t, this._length = 0, this._front = 0;
										}i.prototype._willBeOverCapacity = function (t) {
											return this._capacity < t;
										}, i.prototype._pushOne = function (t) {
											var e = this.length();this._checkCapacity(e + 1), this[this._front + e & this._capacity - 1] = t, this._length = e + 1;
										}, i.prototype.push = function (t, e, n) {
											var r = this.length() + 3;if (this._willBeOverCapacity(r)) return this._pushOne(t), this._pushOne(e), void this._pushOne(n);var i = this._front + r - 3;this._checkCapacity(r);var o = this._capacity - 1;this[i + 0 & o] = t, this[i + 1 & o] = e, this[i + 2 & o] = n, this._length = r;
										}, i.prototype.shift = function () {
											var t = this._front,
											    e = this[t];return this[t] = void 0, this._front = t + 1 & this._capacity - 1, this._length--, e;
										}, i.prototype.length = function () {
											return this._length;
										}, i.prototype._checkCapacity = function (t) {
											this._capacity < t && this._resizeTo(this._capacity << 1);
										}, i.prototype._resizeTo = function (t) {
											var e = this._capacity;this._capacity = t, r(this, 0, this, e, this._front + this._length & e - 1);
										}, e.exports = i;
									}, {}], 27: [function (t, e, n) {
										e.exports = function (e, n, r, i) {
											function o(t, o) {
												var c = r(t);if (c instanceof e) return a(c);if (null === (t = u.asArray(t))) return i("expecting an array or an iterable object but got " + u.classString(t));var s = new e(n);void 0 !== o && s._propagateFrom(o, 3);for (var l = s._fulfill, f = s._reject, h = 0, p = t.length; p > h; ++h) {
													var _ = t[h];(void 0 !== _ || h in t) && e.cast(_)._then(l, f, void 0, s, null);
												}return s;
											}var u = t("./util"),
											    a = function a(t) {
												return t.then(function (e) {
													return o(e, t);
												});
											};e.race = function (t) {
												return o(t, void 0);
											}, e.prototype.race = function () {
												return o(this, void 0);
											};
										};
									}, { "./util": 36 }], 28: [function (t, e, n) {
										e.exports = function (e, n, r, i, o, u) {
											function a(t, n, r, i) {
												this.constructor$(t);var u = h();this._fn = null === u ? n : p.domainBind(u, n), void 0 !== r && (r = e.resolve(r))._attachCancellationCallback(this), this._initialValue = r, this._currentCancellable = null, this._eachValues = i === o ? Array(this._length) : 0 === i ? null : void 0, this._promise._captureStackTrace(), this._init$(void 0, -5);
											}function c(t, e) {
												this.isFulfilled() ? e._resolve(t) : e._reject(t);
											}function s(t, e, n, i) {
												return "function" != typeof e ? r("expecting a function but got " + p.classString(e)) : new a(t, e, n, i).promise();
											}function l(t) {
												this.accum = t, this.array._gotAccum(t);var n = i(this.value, this.array._promise);return n instanceof e ? (this.array._currentCancellable = n, n._then(f, void 0, void 0, this, void 0)) : f.call(this, n);
											}function f(t) {
												var n = this.array,
												    r = n._promise,
												    i = _(n._fn);r._pushContext();var o;(o = void 0 !== n._eachValues ? i.call(r._boundValue(), t, this.index, this.length) : i.call(r._boundValue(), this.accum, t, this.index, this.length)) instanceof e && (n._currentCancellable = o);var a = r._popContext();return u.checkForgottenReturns(o, a, void 0 !== n._eachValues ? "Promise.each" : "Promise.reduce", r), o;
											}var h = e._getDomain,
											    p = t("./util"),
											    _ = p.tryCatch;p.inherits(a, n), a.prototype._gotAccum = function (t) {
												void 0 !== this._eachValues && null !== this._eachValues && t !== o && this._eachValues.push(t);
											}, a.prototype._eachComplete = function (t) {
												return null !== this._eachValues && this._eachValues.push(t), this._eachValues;
											}, a.prototype._init = function () {}, a.prototype._resolveEmptyArray = function () {
												this._resolve(void 0 !== this._eachValues ? this._eachValues : this._initialValue);
											}, a.prototype.shouldCopyValues = function () {
												return !1;
											}, a.prototype._resolve = function (t) {
												this._promise._resolveCallback(t), this._values = null;
											}, a.prototype._resultCancelled = function (t) {
												return t === this._initialValue ? this._cancel() : void (this._isResolved() || (this._resultCancelled$(), this._currentCancellable instanceof e && this._currentCancellable.cancel(), this._initialValue instanceof e && this._initialValue.cancel()));
											}, a.prototype._iterate = function (t) {
												this._values = t;var n,
												    r,
												    i = t.length;if (void 0 !== this._initialValue ? (n = this._initialValue, r = 0) : (n = e.resolve(t[0]), r = 1), this._currentCancellable = n, !n.isRejected()) for (; i > r; ++r) {
													var o = { accum: null, value: t[r], index: r, length: i, array: this };n = n._then(l, void 0, void 0, o, void 0);
												}void 0 !== this._eachValues && (n = n._then(this._eachComplete, void 0, void 0, this, void 0)), n._then(c, c, void 0, n, this);
											}, e.prototype.reduce = function (t, e) {
												return s(this, t, e, null);
											}, e.reduce = function (t, e, n, r) {
												return s(t, e, n, r);
											};
										};
									}, { "./util": 36 }], 29: [function (e, n, i) {
										var o,
										    u = e("./util"),
										    a = u.getNativePromise();if (u.isNode && "undefined" == typeof MutationObserver) {
											var c = r.setImmediate,
											    s = t.nextTick;o = u.isRecentNode ? function (t) {
												c.call(r, t);
											} : function (e) {
												s.call(t, e);
											};
										} else if ("function" == typeof a && "function" == typeof a.resolve) {
											var l = a.resolve();o = function o(t) {
												l.then(t);
											};
										} else o = "undefined" == typeof MutationObserver || "undefined" != typeof window && window.navigator && (window.navigator.standalone || window.cordova) ? "undefined" != typeof setImmediate ? function (t) {
											setImmediate(t);
										} : "undefined" != typeof setTimeout ? function (t) {
											setTimeout(t, 0);
										} : function () {
											throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n");
										} : function () {
											var t = document.createElement("div"),
											    e = { attributes: !0 },
											    n = !1,
											    r = document.createElement("div");new MutationObserver(function () {
												t.classList.toggle("foo"), n = !1;
											}).observe(r, e);var i = function i() {
												n || (n = !0, r.classList.toggle("foo"));
											};return function (n) {
												var r = new MutationObserver(function () {
													r.disconnect(), n();
												});r.observe(t, e), i();
											};
										}();n.exports = o;
									}, { "./util": 36 }], 30: [function (t, e, n) {
										e.exports = function (e, n, r) {
											function i(t) {
												this.constructor$(t);
											}var o = e.PromiseInspection;t("./util").inherits(i, n), i.prototype._promiseResolved = function (t, e) {
												return this._values[t] = e, ++this._totalResolved >= this._length && (this._resolve(this._values), !0);
											}, i.prototype._promiseFulfilled = function (t, e) {
												var n = new o();return n._bitField = 33554432, n._settledValueField = t, this._promiseResolved(e, n);
											}, i.prototype._promiseRejected = function (t, e) {
												var n = new o();return n._bitField = 16777216, n._settledValueField = t, this._promiseResolved(e, n);
											}, e.settle = function (t) {
												return r.deprecated(".settle()", ".reflect()"), new i(t).promise();
											}, e.prototype.settle = function () {
												return e.settle(this);
											};
										};
									}, { "./util": 36 }], 31: [function (t, e, n) {
										e.exports = function (e, n, r) {
											function i(t) {
												this.constructor$(t), this._howMany = 0, this._unwrap = !1, this._initialized = !1;
											}function o(t, e) {
												if ((0 | e) !== e || 0 > e) return r("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");var n = new i(t),
												    o = n.promise();return n.setHowMany(e), n.init(), o;
											}var u = t("./util"),
											    a = t("./errors").RangeError,
											    c = t("./errors").AggregateError,
											    s = u.isArray,
											    l = {};u.inherits(i, n), i.prototype._init = function () {
												if (this._initialized) {
													if (0 === this._howMany) return void this._resolve([]);this._init$(void 0, -5);var t = s(this._values);!this._isResolved() && t && this._howMany > this._canPossiblyFulfill() && this._reject(this._getRangeError(this.length()));
												}
											}, i.prototype.init = function () {
												this._initialized = !0, this._init();
											}, i.prototype.setUnwrap = function () {
												this._unwrap = !0;
											}, i.prototype.howMany = function () {
												return this._howMany;
											}, i.prototype.setHowMany = function (t) {
												this._howMany = t;
											}, i.prototype._promiseFulfilled = function (t) {
												return this._addFulfilled(t), this._fulfilled() === this.howMany() && (this._values.length = this.howMany(), 1 === this.howMany() && this._unwrap ? this._resolve(this._values[0]) : this._resolve(this._values), !0);
											}, i.prototype._promiseRejected = function (t) {
												return this._addRejected(t), this._checkOutcome();
											}, i.prototype._promiseCancelled = function () {
												return this._values instanceof e || null == this._values ? this._cancel() : (this._addRejected(l), this._checkOutcome());
											}, i.prototype._checkOutcome = function () {
												if (this.howMany() > this._canPossiblyFulfill()) {
													for (var t = new c(), e = this.length(); e < this._values.length; ++e) {
														this._values[e] !== l && t.push(this._values[e]);
													}return t.length > 0 ? this._reject(t) : this._cancel(), !0;
												}return !1;
											}, i.prototype._fulfilled = function () {
												return this._totalResolved;
											}, i.prototype._rejected = function () {
												return this._values.length - this.length();
											}, i.prototype._addRejected = function (t) {
												this._values.push(t);
											}, i.prototype._addFulfilled = function (t) {
												this._values[this._totalResolved++] = t;
											}, i.prototype._canPossiblyFulfill = function () {
												return this.length() - this._rejected();
											}, i.prototype._getRangeError = function (t) {
												var e = "Input array must contain at least " + this._howMany + " items but contains only " + t + " items";return new a(e);
											}, i.prototype._resolveEmptyArray = function () {
												this._reject(this._getRangeError(0));
											}, e.some = function (t, e) {
												return o(t, e);
											}, e.prototype.some = function (t) {
												return o(this, t);
											}, e._SomePromiseArray = i;
										};
									}, { "./errors": 12, "./util": 36 }], 32: [function (t, e, n) {
										e.exports = function (t) {
											function e(t) {
												void 0 !== t ? (t = t._target(), this._bitField = t._bitField, this._settledValueField = t._isFateSealed() ? t._settledValue() : void 0) : (this._bitField = 0, this._settledValueField = void 0);
											}e.prototype._settledValue = function () {
												return this._settledValueField;
											};var n = e.prototype.value = function () {
												if (!this.isFulfilled()) throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");return this._settledValue();
											},
											    r = e.prototype.error = e.prototype.reason = function () {
												if (!this.isRejected()) throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");return this._settledValue();
											},
											    i = e.prototype.isFulfilled = function () {
												return 0 != (33554432 & this._bitField);
											},
											    o = e.prototype.isRejected = function () {
												return 0 != (16777216 & this._bitField);
											},
											    u = e.prototype.isPending = function () {
												return 0 == (50397184 & this._bitField);
											},
											    a = e.prototype.isResolved = function () {
												return 0 != (50331648 & this._bitField);
											};e.prototype.isCancelled = function () {
												return 0 != (8454144 & this._bitField);
											}, t.prototype.__isCancelled = function () {
												return 65536 == (65536 & this._bitField);
											}, t.prototype._isCancelled = function () {
												return this._target().__isCancelled();
											}, t.prototype.isCancelled = function () {
												return 0 != (8454144 & this._target()._bitField);
											}, t.prototype.isPending = function () {
												return u.call(this._target());
											}, t.prototype.isRejected = function () {
												return o.call(this._target());
											}, t.prototype.isFulfilled = function () {
												return i.call(this._target());
											}, t.prototype.isResolved = function () {
												return a.call(this._target());
											}, t.prototype.value = function () {
												return n.call(this._target());
											}, t.prototype.reason = function () {
												var t = this._target();return t._unsetRejectionIsUnhandled(), r.call(t);
											}, t.prototype._value = function () {
												return this._settledValue();
											}, t.prototype._reason = function () {
												return this._unsetRejectionIsUnhandled(), this._settledValue();
											}, t.PromiseInspection = e;
										};
									}, {}], 33: [function (t, e, n) {
										e.exports = function (e, n) {
											function r(t) {
												return t.then;
											}function i(t) {
												try {
													return r(t);
												} catch (t) {
													return c.e = t, c;
												}
											}function o(t) {
												try {
													return l.call(t, "_promise0");
												} catch (t) {
													return !1;
												}
											}function u(t, r, i) {
												var o = new e(n),
												    u = o;i && i._pushContext(), o._captureStackTrace(), i && i._popContext();var s = !0,
												    l = a.tryCatch(r).call(t, function (t) {
													o && (o._resolveCallback(t), o = null);
												}, function (t) {
													o && (o._rejectCallback(t, s, !0), o = null);
												});return s = !1, o && l === c && (o._rejectCallback(l.e, !0, !0), o = null), u;
											}var a = t("./util"),
											    c = a.errorObj,
											    s = a.isObject,
											    l = {}.hasOwnProperty;return function (t, r) {
												if (s(t)) {
													if (t instanceof e) return t;var a = i(t);if (a === c) return r && r._pushContext(), l = e.reject(a.e), r && r._popContext(), l;if ("function" == typeof a) {
														if (o(t)) {
															var l = new e(n);return t._then(l._fulfill, l._reject, void 0, l, null), l;
														}return u(t, a, r);
													}
												}return t;
											};
										};
									}, { "./util": 36 }], 34: [function (t, e, n) {
										e.exports = function (e, n, r) {
											function i(t) {
												this.handle = t;
											}function o(t) {
												return clearTimeout(this.handle), t;
											}function u(t) {
												throw clearTimeout(this.handle), t;
											}var a = t("./util"),
											    c = e.TimeoutError;i.prototype._resultCancelled = function () {
												clearTimeout(this.handle);
											};var s = function s(t) {
												return l(+this).thenReturn(t);
											},
											    l = e.delay = function (t, o) {
												var u, a;return void 0 !== o ? (u = e.resolve(o)._then(s, null, null, t, void 0), r.cancellation() && o instanceof e && u._setOnCancel(o)) : (u = new e(n), a = setTimeout(function () {
													u._fulfill();
												}, +t), r.cancellation() && u._setOnCancel(new i(a)), u._captureStackTrace()), u._setAsyncGuaranteed(), u;
											};e.prototype.delay = function (t) {
												return l(t, this);
											};var f = function f(t, e, n) {
												var r;r = "string" != typeof e ? e instanceof Error ? e : new c("operation timed out") : new c(e), a.markAsOriginatingFromRejection(r), t._attachExtraTrace(r), t._reject(r), null != n && n.cancel();
											};e.prototype.timeout = function (t, e) {
												t = +t;var n,
												    a,
												    c = new i(setTimeout(function () {
													n.isPending() && f(n, e, a);
												}, t));return r.cancellation() ? (a = this.then(), (n = a._then(o, u, void 0, c, void 0))._setOnCancel(c)) : n = this._then(o, u, void 0, c, void 0), n;
											};
										};
									}, { "./util": 36 }], 35: [function (t, e, n) {
										e.exports = function (e, n, r, i, o, u) {
											function a(t) {
												setTimeout(function () {
													throw t;
												}, 0);
											}function c(t) {
												var e = r(t);return e !== t && "function" == typeof t._isDisposable && "function" == typeof t._getDisposer && t._isDisposable() && e._setDisposable(t._getDisposer()), e;
											}function s(t, n) {
												function i() {
													if (u >= s) return l._fulfill();var o = c(t[u++]);if (o instanceof e && o._isDisposable()) {
														try {
															o = r(o._getDisposer().tryDispose(n), t.promise);
														} catch (t) {
															return a(t);
														}if (o instanceof e) return o._then(i, a, null, null, null);
													}i();
												}var u = 0,
												    s = t.length,
												    l = new e(o);return i(), l;
											}function l(t, e, n) {
												this._data = t, this._promise = e, this._context = n;
											}function f(t, e, n) {
												this.constructor$(t, e, n);
											}function h(t) {
												return l.isDisposer(t) ? (this.resources[this.index]._setDisposable(t), t.promise()) : t;
											}function p(t) {
												this.length = t, this.promise = null, this[t - 1] = null;
											}var _ = t("./util"),
											    d = t("./errors").TypeError,
											    v = t("./util").inherits,
											    y = _.errorObj,
											    g = _.tryCatch,
											    m = {};l.prototype.data = function () {
												return this._data;
											}, l.prototype.promise = function () {
												return this._promise;
											}, l.prototype.resource = function () {
												return this.promise().isFulfilled() ? this.promise().value() : m;
											}, l.prototype.tryDispose = function (t) {
												var e = this.resource(),
												    n = this._context;void 0 !== n && n._pushContext();var r = e !== m ? this.doDispose(e, t) : null;return void 0 !== n && n._popContext(), this._promise._unsetDisposable(), this._data = null, r;
											}, l.isDisposer = function (t) {
												return null != t && "function" == typeof t.resource && "function" == typeof t.tryDispose;
											}, v(f, l), f.prototype.doDispose = function (t, e) {
												return this.data().call(t, t, e);
											}, p.prototype._resultCancelled = function () {
												for (var t = this.length, n = 0; t > n; ++n) {
													var r = this[n];r instanceof e && r.cancel();
												}
											}, e.using = function () {
												var t = arguments.length;if (2 > t) return n("you must pass at least 2 arguments to Promise.using");var i = arguments[t - 1];if ("function" != typeof i) return n("expecting a function but got " + _.classString(i));var o,
												    a = !0;2 === t && Array.isArray(arguments[0]) ? (o = arguments[0], t = o.length, a = !1) : (o = arguments, t--);for (var c = new p(t), f = 0; t > f; ++f) {
													var d = o[f];if (l.isDisposer(d)) {
														var v = d;(d = d.promise())._setDisposable(v);
													} else {
														var m = r(d);m instanceof e && (d = m._then(h, null, null, { resources: c, index: f }, void 0));
													}c[f] = d;
												}for (var b = new Array(c.length), f = 0; f < b.length; ++f) {
													b[f] = e.resolve(c[f]).reflect();
												}var w = e.all(b).then(function (t) {
													for (var e = 0; e < t.length; ++e) {
														var n = t[e];if (n.isRejected()) return y.e = n.error(), y;if (!n.isFulfilled()) return void w.cancel();t[e] = n.value();
													}j._pushContext(), i = g(i);var r = a ? i.apply(void 0, t) : i(t),
													    o = j._popContext();return u.checkForgottenReturns(r, o, "Promise.using", j), r;
												}),
												    j = w.lastly(function () {
													var t = new e.PromiseInspection(w);return s(c, t);
												});return c.promise = j, j._setOnCancel(c), j;
											}, e.prototype._setDisposable = function (t) {
												this._bitField = 131072 | this._bitField, this._disposer = t;
											}, e.prototype._isDisposable = function () {
												return (131072 & this._bitField) > 0;
											}, e.prototype._getDisposer = function () {
												return this._disposer;
											}, e.prototype._unsetDisposable = function () {
												this._bitField = -131073 & this._bitField, this._disposer = void 0;
											}, e.prototype.disposer = function (t) {
												if ("function" == typeof t) return new f(t, this, i());throw new d();
											};
										};
									}, { "./errors": 12, "./util": 36 }], 36: [function (e, n, i) {
										function o() {
											try {
												var t = h;return h = null, t.apply(this, arguments);
											} catch (t) {
												return d.e = t, d;
											}
										}function u(t) {
											return null == t || !0 === t || !1 === t || "string" == typeof t || "number" == typeof t;
										}function a(t, e, n) {
											if (u(t)) return t;var r = { value: n, configurable: !0, enumerable: !1, writable: !0 };return p.defineProperty(t, e, r), t;
										}function c(t) {
											try {
												return t + "";
											} catch (t) {
												return "[no string representation]";
											}
										}function s(t) {
											return null !== t && "object" == (void 0 === t ? "undefined" : _typeof2(t)) && "string" == typeof t.message && "string" == typeof t.name;
										}function l(t) {
											return s(t) && p.propertyIsWritable(t, "stack");
										}function f(t) {
											return {}.toString.call(t);
										}var h,
										    p = e("./es5"),
										    _ = "undefined" == typeof navigator,
										    d = { e: {} },
										    v = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== r ? r : void 0 !== this ? this : null,
										    y = function () {
											var t = [Array.prototype, Object.prototype, Function.prototype],
											    e = function e(_e3) {
												for (var n = 0; n < t.length; ++n) {
													if (t[n] === _e3) return !0;
												}return !1;
											};if (p.isES5) {
												var n = Object.getOwnPropertyNames;return function (t) {
													for (var r = [], i = Object.create(null); null != t && !e(t);) {
														var o;try {
															o = n(t);
														} catch (t) {
															return r;
														}for (var u = 0; u < o.length; ++u) {
															var a = o[u];if (!i[a]) {
																i[a] = !0;var c = Object.getOwnPropertyDescriptor(t, a);null != c && null == c.get && null == c.set && r.push(a);
															}
														}t = p.getPrototypeOf(t);
													}return r;
												};
											}var r = {}.hasOwnProperty;return function (n) {
												if (e(n)) return [];var i = [];t: for (var o in n) {
													if (r.call(n, o)) i.push(o);else {
														for (var u = 0; u < t.length; ++u) {
															if (r.call(t[u], o)) continue t;
														}i.push(o);
													}
												}return i;
											};
										}(),
										    g = /this\s*\.\s*\S+\s*=/,
										    m = /^[a-z$_][a-z$_0-9]*$/i,
										    b = "stack" in new Error() ? function (t) {
											return l(t) ? t : new Error(c(t));
										} : function (t) {
											if (l(t)) return t;try {
												throw new Error(c(t));
											} catch (t) {
												return t;
											}
										},
										    w = function w(t) {
											return p.isArray(t) ? t : null;
										};if ("undefined" != typeof Symbol && Symbol.iterator) {
											var j = "function" == typeof Array.from ? function (t) {
												return Array.from(t);
											} : function (t) {
												for (var e, n = [], r = t[Symbol.iterator](); !(e = r.next()).done;) {
													n.push(e.value);
												}return n;
											};w = function w(t) {
												return p.isArray(t) ? t : null != t && "function" == typeof t[Symbol.iterator] ? j(t) : null;
											};
										}var x = void 0 !== t && "[object process]" === f(t).toLowerCase(),
										    E = void 0 !== t && void 0 !== t.env,
										    C = { isClass: function isClass(t) {
												try {
													if ("function" == typeof t) {
														var e = p.names(t.prototype),
														    n = p.isES5 && e.length > 1,
														    r = e.length > 0 && !(1 === e.length && "constructor" === e[0]),
														    i = g.test(t + "") && p.names(t).length > 0;if (n || r || i) return !0;
													}return !1;
												} catch (t) {
													return !1;
												}
											}, isIdentifier: function isIdentifier(t) {
												return m.test(t);
											}, inheritedDataKeys: y, getDataPropertyOrDefault: function getDataPropertyOrDefault(t, e, n) {
												if (!p.isES5) return {}.hasOwnProperty.call(t, e) ? t[e] : void 0;var r = Object.getOwnPropertyDescriptor(t, e);return null != r ? null == r.get && null == r.set ? r.value : n : void 0;
											}, thrower: function thrower(t) {
												throw t;
											}, isArray: p.isArray, asArray: w, notEnumerableProp: a, isPrimitive: u, isObject: function isObject(t) {
												return "function" == typeof t || "object" == (void 0 === t ? "undefined" : _typeof2(t)) && null !== t;
											}, isError: s, canEvaluate: _, errorObj: d, tryCatch: function tryCatch(t) {
												return h = t, o;
											}, inherits: function inherits(t, e) {
												function n() {
													this.constructor = t, this.constructor$ = e;for (var n in e.prototype) {
														r.call(e.prototype, n) && "$" !== n.charAt(n.length - 1) && (this[n + "$"] = e.prototype[n]);
													}
												}var r = {}.hasOwnProperty;return n.prototype = e.prototype, t.prototype = new n(), t.prototype;
											}, withAppended: function withAppended(t, e) {
												var n,
												    r = t.length,
												    i = new Array(r + 1);for (n = 0; r > n; ++n) {
													i[n] = t[n];
												}return i[n] = e, i;
											}, maybeWrapAsError: function maybeWrapAsError(t) {
												return u(t) ? new Error(c(t)) : t;
											}, toFastProperties: function toFastProperties(t) {
												function e() {}e.prototype = t;for (var n = 8; n--;) {
													new e();
												}return t;
											}, filledRange: function filledRange(t, e, n) {
												for (var r = new Array(t), i = 0; t > i; ++i) {
													r[i] = e + i + n;
												}return r;
											}, toString: c, canAttachTrace: l, ensureErrorObject: b, originatesFromRejection: function originatesFromRejection(t) {
												return null != t && (t instanceof Error.__BluebirdErrorTypes__.OperationalError || !0 === t.isOperational);
											}, markAsOriginatingFromRejection: function markAsOriginatingFromRejection(t) {
												try {
													a(t, "isOperational", !0);
												} catch (t) {}
											}, classString: f, copyDescriptors: function copyDescriptors(t, e, n) {
												for (var r = p.names(t), i = 0; i < r.length; ++i) {
													var o = r[i];if (n(o)) try {
														p.defineProperty(e, o, p.getDescriptor(t, o));
													} catch (t) {}
												}
											}, hasDevTools: "undefined" != typeof chrome && chrome && "function" == typeof chrome.loadTimes, isNode: x, hasEnvVariables: E, env: function env(e) {
												return E ? t.env[e] : void 0;
											}, global: v, getNativePromise: function getNativePromise() {
												if ("function" == typeof Promise) try {
													var t = new Promise(function () {});if ("[object Promise]" === {}.toString.call(t)) return Promise;
												} catch (t) {}
											}, domainBind: function domainBind(t, e) {
												return t.bind(e);
											} };C.isRecentNode = C.isNode && function () {
											var e = t.versions.node.split(".").map(Number);return 0 === e[0] && e[1] > 10 || e[0] > 0;
										}(), C.isNode && C.toFastProperties(t);try {
											throw new Error();
										} catch (t) {
											C.lastLineError = t;
										}n.exports = C;
									}, { "./es5": 13 }] }, {}, [4])(4);
							}), "undefined" != typeof window && null !== window ? window.P = window.Promise : "undefined" != typeof self && null !== self && (self.P = self.Promise);
						}).call(this, t("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
					}, { _process: 3 }], 2: [function (t, e, n) {
						(function (t) {
							(function () {
								function r(t, e) {
									return t.set(e[0], e[1]), t;
								}function i(t, e) {
									return t.add(e), t;
								}function o(t, e, n) {
									switch (n.length) {case 0:
											return t.call(e);case 1:
											return t.call(e, n[0]);case 2:
											return t.call(e, n[0], n[1]);case 3:
											return t.call(e, n[0], n[1], n[2]);}return t.apply(e, n);
								}function u(t, e, n, r) {
									for (var i = -1, o = null == t ? 0 : t.length; ++i < o;) {
										var u = t[i];e(r, u, n(u), t);
									}return r;
								}function a(t, e) {
									for (var n = -1, r = null == t ? 0 : t.length; ++n < r && !1 !== e(t[n], n, t);) {}return t;
								}function c(t, e) {
									for (var n = null == t ? 0 : t.length; n-- && !1 !== e(t[n], n, t);) {}return t;
								}function s(t, e) {
									for (var n = -1, r = null == t ? 0 : t.length; ++n < r;) {
										if (!e(t[n], n, t)) return !1;
									}return !0;
								}function l(t, e) {
									for (var n = -1, r = null == t ? 0 : t.length, i = 0, o = []; ++n < r;) {
										var u = t[n];e(u, n, t) && (o[i++] = u);
									}return o;
								}function f(t, e) {
									return !(null == t || !t.length) && -1 < b(t, e, 0);
								}function h(t, e, n) {
									for (var r = -1, i = null == t ? 0 : t.length; ++r < i;) {
										if (n(e, t[r])) return !0;
									}return !1;
								}function p(t, e) {
									for (var n = -1, r = null == t ? 0 : t.length, i = Array(r); ++n < r;) {
										i[n] = e(t[n], n, t);
									}return i;
								}function _(t, e) {
									for (var n = -1, r = e.length, i = t.length; ++n < r;) {
										t[i + n] = e[n];
									}return t;
								}function d(t, e, n, r) {
									var i = -1,
									    o = null == t ? 0 : t.length;for (r && o && (n = t[++i]); ++i < o;) {
										n = e(n, t[i], i, t);
									}return n;
								}function v(t, e, n, r) {
									var i = null == t ? 0 : t.length;for (r && i && (n = t[--i]); i--;) {
										n = e(n, t[i], i, t);
									}return n;
								}function y(t, e) {
									for (var n = -1, r = null == t ? 0 : t.length; ++n < r;) {
										if (e(t[n], n, t)) return !0;
									}return !1;
								}function g(t, e, n) {
									var r;return n(t, function (t, n, i) {
										if (e(t, n, i)) return r = n, !1;
									}), r;
								}function m(t, e, n, r) {
									var i = t.length;for (n += r ? 1 : -1; r ? n-- : ++n < i;) {
										if (e(t[n], n, t)) return n;
									}return -1;
								}function b(t, e, n) {
									if (e === e) t: {
										--n;for (var r = t.length; ++n < r;) {
											if (t[n] === e) {
												t = n;break t;
											}
										}t = -1;
									} else t = m(t, j, n);return t;
								}function w(t, e, n, r) {
									--n;for (var i = t.length; ++n < i;) {
										if (r(t[n], e)) return n;
									}return -1;
								}function j(t) {
									return t !== t;
								}function x(t, e) {
									var n = null == t ? 0 : t.length;return n ? T(t, e) / n : q;
								}function E(t) {
									return function (e) {
										return null == e ? W : e[t];
									};
								}function C(t) {
									return function (e) {
										return null == t ? W : t[e];
									};
								}function k(t, e, n, r, i) {
									return i(t, function (t, i, o) {
										n = r ? (r = !1, t) : e(n, t, i, o);
									}), n;
								}function F(t, e) {
									var n = t.length;for (t.sort(e); n--;) {
										t[n] = t[n].c;
									}return t;
								}function T(t, e) {
									for (var n, r = -1, i = t.length; ++r < i;) {
										var o = e(t[r]);o !== W && (n = n === W ? o : n + o);
									}return n;
								}function A(t, e) {
									for (var n = -1, r = Array(t); ++n < t;) {
										r[n] = e(n);
									}return r;
								}function S(t, e) {
									return p(e, function (e) {
										return [e, t[e]];
									});
								}function O(t) {
									return function (e) {
										return t(e);
									};
								}function R(t, e) {
									return p(e, function (e) {
										return t[e];
									});
								}function P(t, e) {
									return t.has(e);
								}function L(t, e) {
									for (var n = -1, r = t.length; ++n < r && -1 < b(e, t[n], 0);) {}return n;
								}function I(t, e) {
									for (var n = t.length; n-- && -1 < b(e, t[n], 0);) {}return n;
								}function D(t) {
									return "\\" + Nt[t];
								}function U(t) {
									var e = -1,
									    n = Array(t.size);return t.forEach(function (t, r) {
										n[++e] = [r, t];
									}), n;
								}function B(t, e) {
									return function (n) {
										return t(e(n));
									};
								}function N(t, e) {
									for (var n = -1, r = t.length, i = 0, o = []; ++n < r;) {
										var u = t[n];u !== e && "__lodash_placeholder__" !== u || (t[n] = "__lodash_placeholder__", o[i++] = n);
									}return o;
								}function M(t) {
									var e = -1,
									    n = Array(t.size);return t.forEach(function (t) {
										n[++e] = t;
									}), n;
								}function V(t) {
									var e = -1,
									    n = Array(t.size);return t.forEach(function (t) {
										n[++e] = [t, t];
									}), n;
								}function z(t) {
									if (Pt.test(t)) {
										for (var e = Ot.lastIndex = 0; Ot.test(t);) {
											++e;
										}t = e;
									} else t = ee(t);return t;
								}function H(t) {
									return Pt.test(t) ? t.match(Ot) || [] : t.split("");
								}var W,
								    $ = 1 / 0,
								    q = NaN,
								    Q = [["ary", 128], ["bind", 1], ["bindKey", 2], ["curry", 8], ["curryRight", 16], ["flip", 512], ["partial", 32], ["partialRight", 64], ["rearg", 256]],
								    G = /\b__p\+='';/g,
								    Z = /\b(__p\+=)''\+/g,
								    X = /(__e\(.*?\)|\b__t\))\+'';/g,
								    K = /&(?:amp|lt|gt|quot|#39);/g,
								    J = /[&<>"']/g,
								    Y = RegExp(K.source),
								    tt = RegExp(J.source),
								    et = /<%-([\s\S]+?)%>/g,
								    nt = /<%([\s\S]+?)%>/g,
								    rt = /<%=([\s\S]+?)%>/g,
								    it = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
								    ot = /^\w*$/,
								    ut = /^\./,
								    at = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
								    ct = /[\\^$.*+?()[\]{}|]/g,
								    st = RegExp(ct.source),
								    lt = /^\s+|\s+$/g,
								    ft = /^\s+/,
								    ht = /\s+$/,
								    pt = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
								    _t = /\{\n\/\* \[wrapped with (.+)\] \*/,
								    dt = /,? & /,
								    vt = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,
								    yt = /\\(\\)?/g,
								    gt = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,
								    mt = /\w*$/,
								    bt = /^[-+]0x[0-9a-f]+$/i,
								    wt = /^0b[01]+$/i,
								    jt = /^\[object .+?Constructor\]$/,
								    xt = /^0o[0-7]+$/i,
								    Et = /^(?:0|[1-9]\d*)$/,
								    Ct = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,
								    kt = /($^)/,
								    Ft = /['\n\r\u2028\u2029\\]/g,
								    Tt = "[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?(?:\\u200d(?:[^\\ud800-\\udfff]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff])[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?)*",
								    At = RegExp("['’]", "g"),
								    St = RegExp("[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]", "g"),
								    Ot = RegExp("\\ud83c[\\udffb-\\udfff](?=\\ud83c[\\udffb-\\udfff])|(?:[^\\ud800-\\udfff][\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]?|[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\ud800-\\udfff])" + Tt, "g"),
								    Rt = RegExp(["[A-Z\\xc0-\\xd6\\xd8-\\xde]?[a-z\\xdf-\\xf6\\xf8-\\xff]+(?:['\u2019](?:d|ll|m|re|s|t|ve))?(?=[\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000]|[A-Z\\xc0-\\xd6\\xd8-\\xde]|$)|(?:[A-Z\\xc0-\\xd6\\xd8-\\xde]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])+(?:['\u2019](?:D|LL|M|RE|S|T|VE))?(?=[\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000]|[A-Z\\xc0-\\xd6\\xd8-\\xde](?:[a-z\\xdf-\\xf6\\xf8-\\xff]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])|$)|[A-Z\\xc0-\\xd6\\xd8-\\xde]?(?:[a-z\\xdf-\\xf6\\xf8-\\xff]|[^\\ud800-\\udfff\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\d+\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde])+(?:['\u2019](?:d|ll|m|re|s|t|ve))?|[A-Z\\xc0-\\xd6\\xd8-\\xde]+(?:['\u2019](?:D|LL|M|RE|S|T|VE))?|\\d*(?:(?:1ST|2ND|3RD|(?![123])\\dTH)\\b)|\\d*(?:(?:1st|2nd|3rd|(?![123])\\dth)\\b)|\\d+", "(?:[\\u2700-\\u27bf]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff])[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?(?:\\u200d(?:[^\\ud800-\\udfff]|(?:\\ud83c[\\udde6-\\uddff]){2}|[\\ud800-\\udbff][\\udc00-\\udfff])[\\ufe0e\\ufe0f]?(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?)*"].join("|"), "g"),
								    Pt = RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]"),
								    Lt = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
								    It = "Array Buffer DataView Date Error Float32Array Float64Array Function Int8Array Int16Array Int32Array Map Math Object Promise RegExp Set String Symbol TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array WeakMap _ clearTimeout isFinite parseInt setTimeout".split(" "),
								    Dt = {};Dt["[object Float32Array]"] = Dt["[object Float64Array]"] = Dt["[object Int8Array]"] = Dt["[object Int16Array]"] = Dt["[object Int32Array]"] = Dt["[object Uint8Array]"] = Dt["[object Uint8ClampedArray]"] = Dt["[object Uint16Array]"] = Dt["[object Uint32Array]"] = !0, Dt["[object Arguments]"] = Dt["[object Array]"] = Dt["[object ArrayBuffer]"] = Dt["[object Boolean]"] = Dt["[object DataView]"] = Dt["[object Date]"] = Dt["[object Error]"] = Dt["[object Function]"] = Dt["[object Map]"] = Dt["[object Number]"] = Dt["[object Object]"] = Dt["[object RegExp]"] = Dt["[object Set]"] = Dt["[object String]"] = Dt["[object WeakMap]"] = !1;var Ut = {};Ut["[object Arguments]"] = Ut["[object Array]"] = Ut["[object ArrayBuffer]"] = Ut["[object DataView]"] = Ut["[object Boolean]"] = Ut["[object Date]"] = Ut["[object Float32Array]"] = Ut["[object Float64Array]"] = Ut["[object Int8Array]"] = Ut["[object Int16Array]"] = Ut["[object Int32Array]"] = Ut["[object Map]"] = Ut["[object Number]"] = Ut["[object Object]"] = Ut["[object RegExp]"] = Ut["[object Set]"] = Ut["[object String]"] = Ut["[object Symbol]"] = Ut["[object Uint8Array]"] = Ut["[object Uint8ClampedArray]"] = Ut["[object Uint16Array]"] = Ut["[object Uint32Array]"] = !0, Ut["[object Error]"] = Ut["[object Function]"] = Ut["[object WeakMap]"] = !1;var Bt,
								    Nt = { "\\": "\\", "'": "'", "\n": "n", "\r": "r", "\u2028": "u2028", "\u2029": "u2029" },
								    Mt = parseFloat,
								    Vt = parseInt,
								    zt = "object" == (void 0 === t ? "undefined" : _typeof2(t)) && t && t.Object === Object && t,
								    Ht = "object" == ("undefined" == typeof self ? "undefined" : _typeof2(self)) && self && self.Object === Object && self,
								    Wt = zt || Ht || Function("return this")(),
								    $t = "object" == (void 0 === n ? "undefined" : _typeof2(n)) && n && !n.nodeType && n,
								    qt = $t && "object" == (void 0 === e ? "undefined" : _typeof2(e)) && e && !e.nodeType && e,
								    Qt = qt && qt.exports === $t,
								    Gt = Qt && zt.process;t: {
									try {
										Bt = Gt && Gt.binding && Gt.binding("util");break t;
									} catch (r) {}Bt = void 0;
								}var Zt = Bt && Bt.isArrayBuffer,
								    Xt = Bt && Bt.isDate,
								    Kt = Bt && Bt.isMap,
								    Jt = Bt && Bt.isRegExp,
								    Yt = Bt && Bt.isSet,
								    te = Bt && Bt.isTypedArray,
								    ee = E("length"),
								    ne = C({ "À": "A", "Á": "A", "Â": "A", "Ã": "A", "Ä": "A", "Å": "A", "à": "a", "á": "a", "â": "a", "ã": "a", "ä": "a", "å": "a", "Ç": "C", "ç": "c", "Ð": "D", "ð": "d", "È": "E", "É": "E", "Ê": "E", "Ë": "E", "è": "e", "é": "e", "ê": "e", "ë": "e", "Ì": "I", "Í": "I", "Î": "I", "Ï": "I", "ì": "i", "í": "i", "î": "i", "ï": "i", "Ñ": "N", "ñ": "n", "Ò": "O", "Ó": "O", "Ô": "O", "Õ": "O", "Ö": "O", "Ø": "O", "ò": "o", "ó": "o", "ô": "o", "õ": "o", "ö": "o", "ø": "o", "Ù": "U", "Ú": "U", "Û": "U", "Ü": "U", "ù": "u", "ú": "u", "û": "u", "ü": "u", "Ý": "Y", "ý": "y", "ÿ": "y", "Æ": "Ae", "æ": "ae", "Þ": "Th", "þ": "th", "ß": "ss", "Ā": "A", "Ă": "A", "Ą": "A", "ā": "a", "ă": "a", "ą": "a", "Ć": "C", "Ĉ": "C", "Ċ": "C", "Č": "C", "ć": "c", "ĉ": "c", "ċ": "c", "č": "c", "Ď": "D", "Đ": "D", "ď": "d", "đ": "d", "Ē": "E", "Ĕ": "E", "Ė": "E", "Ę": "E", "Ě": "E", "ē": "e", "ĕ": "e", "ė": "e", "ę": "e", "ě": "e", "Ĝ": "G", "Ğ": "G", "Ġ": "G", "Ģ": "G", "ĝ": "g", "ğ": "g", "ġ": "g", "ģ": "g", "Ĥ": "H", "Ħ": "H", "ĥ": "h", "ħ": "h", "Ĩ": "I", "Ī": "I", "Ĭ": "I", "Į": "I", "İ": "I", "ĩ": "i", "ī": "i", "ĭ": "i", "į": "i", "ı": "i", "Ĵ": "J", "ĵ": "j", "Ķ": "K", "ķ": "k", "ĸ": "k", "Ĺ": "L", "Ļ": "L", "Ľ": "L", "Ŀ": "L", "Ł": "L", "ĺ": "l", "ļ": "l", "ľ": "l", "ŀ": "l", "ł": "l", "Ń": "N", "Ņ": "N", "Ň": "N", "Ŋ": "N", "ń": "n", "ņ": "n", "ň": "n", "ŋ": "n", "Ō": "O", "Ŏ": "O", "Ő": "O", "ō": "o", "ŏ": "o", "ő": "o", "Ŕ": "R", "Ŗ": "R", "Ř": "R", "ŕ": "r", "ŗ": "r", "ř": "r", "Ś": "S", "Ŝ": "S", "Ş": "S", "Š": "S", "ś": "s", "ŝ": "s", "ş": "s", "š": "s", "Ţ": "T", "Ť": "T", "Ŧ": "T", "ţ": "t", "ť": "t", "ŧ": "t", "Ũ": "U", "Ū": "U", "Ŭ": "U", "Ů": "U", "Ű": "U", "Ų": "U", "ũ": "u", "ū": "u", "ŭ": "u", "ů": "u", "ű": "u", "ų": "u", "Ŵ": "W", "ŵ": "w", "Ŷ": "Y", "ŷ": "y", "Ÿ": "Y", "Ź": "Z", "Ż": "Z", "Ž": "Z", "ź": "z", "ż": "z", "ž": "z", "Ĳ": "IJ", "ĳ": "ij", "Œ": "Oe", "œ": "oe", "ŉ": "'n", "ſ": "s" }),
								    re = C({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }),
								    ie = C({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }),
								    oe = function t(e) {
									function n(t) {
										if (pi(t) && !ea(t) && !(t instanceof Ot)) {
											if (t instanceof Tt) return t;if (eo.call(t, "__wrapped__")) return Ur(t);
										}return new Tt(t);
									}function C() {}function Tt(t, e) {
										this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!e, this.__index__ = 0, this.__values__ = W;
									}function Ot(t) {
										this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = 4294967295, this.__views__ = [];
									}function Bt(t) {
										var e = -1,
										    n = null == t ? 0 : t.length;for (this.clear(); ++e < n;) {
											var r = t[e];this.set(r[0], r[1]);
										}
									}function Nt(t) {
										var e = -1,
										    n = null == t ? 0 : t.length;for (this.clear(); ++e < n;) {
											var r = t[e];this.set(r[0], r[1]);
										}
									}function zt(t) {
										var e = -1,
										    n = null == t ? 0 : t.length;for (this.clear(); ++e < n;) {
											var r = t[e];this.set(r[0], r[1]);
										}
									}function Ht(t) {
										var e = -1,
										    n = null == t ? 0 : t.length;for (this.__data__ = new zt(); ++e < n;) {
											this.add(t[e]);
										}
									}function $t(t) {
										this.size = (this.__data__ = new Nt(t)).size;
									}function qt(t, e) {
										var n,
										    r = ea(t),
										    i = !r && ta(t),
										    o = !r && !i && ra(t),
										    u = !r && !i && !o && ca(t),
										    a = (i = (r = r || i || o || u) ? A(t.length, Zi) : []).length;for (n in t) {
											!e && !eo.call(t, n) || r && ("length" == n || o && ("offset" == n || "parent" == n) || u && ("buffer" == n || "byteLength" == n || "byteOffset" == n) || Er(n, a)) || i.push(n);
										}return i;
									}function Gt(t) {
										var e = t.length;return e ? t[en(0, e - 1)] : W;
									}function ee(t, e) {
										return Pr(Rn(t), de(e, 0, t.length));
									}function ue(t) {
										return Pr(Rn(t));
									}function ae(t, e, n) {
										(n === W || oi(t[e], n)) && (n !== W || e in t) || pe(t, e, n);
									}function ce(t, e, n) {
										var r = t[e];eo.call(t, e) && oi(r, n) && (n !== W || e in t) || pe(t, e, n);
									}function se(t, e) {
										for (var n = t.length; n--;) {
											if (oi(t[n][0], e)) return n;
										}return -1;
									}function le(t, e, n, r) {
										return tu(t, function (t, i, o) {
											e(r, t, n(t), o);
										}), r;
									}function fe(t, e) {
										return t && Pn(e, Fi(e), t);
									}function he(t, e) {
										return t && Pn(e, Ti(e), t);
									}function pe(t, e, n) {
										"__proto__" == e && bo ? bo(t, e, { configurable: !0, enumerable: !0, value: n, writable: !0 }) : t[e] = n;
									}function _e(t, e) {
										for (var n = -1, r = e.length, i = zi(r), o = null == t; ++n < r;) {
											i[n] = o ? W : Ci(t, e[n]);
										}return i;
									}function de(t, e, n) {
										return t === t && (n !== W && (t = t <= n ? t : n), e !== W && (t = t >= e ? t : e)), t;
									}function ve(t, e, n, r, i, o) {
										var u,
										    c = 1 & e,
										    s = 2 & e,
										    l = 4 & e;if (n && (u = i ? n(t, r, i, o) : n(t)), u !== W) return u;if (!hi(t)) return t;if (r = ea(t)) {
											if (u = br(t), !c) return Rn(t, u);
										} else {
											var f = fu(t),
											    h = "[object Function]" == f || "[object GeneratorFunction]" == f;if (ra(t)) return kn(t, c);if ("[object Object]" == f || "[object Arguments]" == f || h && !i) {
												if (u = s || h ? {} : wr(t), !c) return s ? In(t, he(u, t)) : Ln(t, fe(u, t));
											} else {
												if (!Ut[f]) return i ? t : {};u = jr(t, f, ve, c);
											}
										}if (o || (o = new $t()), i = o.get(t)) return i;o.set(t, u);var s = l ? s ? hr : fr : s ? Ti : Fi,
										    p = r ? W : s(t);return a(p || t, function (r, i) {
											p && (i = r, r = t[i]), ce(u, i, ve(r, e, n, i, t, o));
										}), u;
									}function ye(t) {
										var e = Fi(t);return function (n) {
											return ge(n, t, e);
										};
									}function ge(t, e, n) {
										var r = n.length;if (null == t) return !r;for (t = Qi(t); r--;) {
											var i = n[r],
											    o = e[i],
											    u = t[i];if (u === W && !(i in t) || !o(u)) return !1;
										}return !0;
									}function me(t, e, n) {
										if ("function" != typeof t) throw new Xi("Expected a function");return _u(function () {
											t.apply(W, n);
										}, e);
									}function be(t, e, n, r) {
										var i = -1,
										    o = f,
										    u = !0,
										    a = t.length,
										    c = [],
										    s = e.length;if (!a) return c;n && (e = p(e, O(n))), r ? (o = h, u = !1) : 200 <= e.length && (o = P, u = !1, e = new Ht(e));t: for (; ++i < a;) {
											var l = t[i],
											    _ = null == n ? l : n(l),
											    l = r || 0 !== l ? l : 0;if (u && _ === _) {
												for (var d = s; d--;) {
													if (e[d] === _) continue t;
												}c.push(l);
											} else o(e, _, r) || c.push(l);
										}return c;
									}function we(t, e) {
										var n = !0;return tu(t, function (t, r, i) {
											return n = !!e(t, r, i);
										}), n;
									}function je(t, e, n) {
										for (var r = -1, i = t.length; ++r < i;) {
											var o = t[r],
											    u = e(o);if (null != u && (a === W ? u === u && !yi(u) : n(u, a))) var a = u,
											    c = o;
										}return c;
									}function xe(t, e) {
										var n = [];return tu(t, function (t, r, i) {
											e(t, r, i) && n.push(t);
										}), n;
									}function Ee(t, e, n, r, i) {
										var o = -1,
										    u = t.length;for (n || (n = xr), i || (i = []); ++o < u;) {
											var a = t[o];0 < e && n(a) ? 1 < e ? Ee(a, e - 1, n, r, i) : _(i, a) : r || (i[i.length] = a);
										}return i;
									}function Ce(t, e) {
										return t && nu(t, e, Fi);
									}function ke(t, e) {
										return t && ru(t, e, Fi);
									}function Fe(t, e) {
										return l(e, function (e) {
											return si(t[e]);
										});
									}function Te(t, e) {
										for (var n = 0, r = (e = En(e, t)).length; null != t && n < r;) {
											t = t[Lr(e[n++])];
										}return n && n == r ? t : W;
									}function Ae(t, e, n) {
										return e = e(t), ea(t) ? e : _(e, n(t));
									}function Se(t) {
										if (null == t) t = t === W ? "[object Undefined]" : "[object Null]";else if (mo && mo in Qi(t)) {
											var e = eo.call(t, mo),
											    n = t[mo];try {
												t[mo] = W;var r = !0;
											} catch (t) {}var i = io.call(t);r && (e ? t[mo] = n : delete t[mo]), t = i;
										} else t = io.call(t);return t;
									}function Oe(t, e) {
										return t > e;
									}function Re(t, e) {
										return null != t && eo.call(t, e);
									}function Pe(t, e) {
										return null != t && e in Qi(t);
									}function Le(t, e, n) {
										for (var r = n ? h : f, i = t[0].length, o = t.length, u = o, a = zi(o), c = 1 / 0, s = []; u--;) {
											l = t[u];u && e && (l = p(l, O(e))), c = Ro(l.length, c), a[u] = !n && (e || 120 <= i && 120 <= l.length) ? new Ht(u && l) : W;
										}var l = t[0],
										    _ = -1,
										    d = a[0];t: for (; ++_ < i && s.length < c;) {
											var v = l[_],
											    y = e ? e(v) : v,
											    v = n || 0 !== v ? v : 0;if (d ? !P(d, y) : !r(s, y, n)) {
												for (u = o; --u;) {
													var g = a[u];if (g ? !P(g, y) : !r(t[u], y, n)) continue t;
												}d && d.push(y), s.push(v);
											}
										}return s;
									}function Ie(t, e, n) {
										var r = {};return Ce(t, function (t, i, o) {
											e(r, n(t), i, o);
										}), r;
									}function De(t, e, n) {
										return e = En(e, t), t = 2 > e.length ? t : Te(t, sn(e, 0, -1)), null == (e = null == t ? t : t[Lr(zr(e))]) ? W : o(e, t, n);
									}function Ue(t) {
										return pi(t) && "[object Arguments]" == Se(t);
									}function Be(t, e, n, r, i) {
										if (t === e) e = !0;else if (null == t || null == e || !pi(t) && !pi(e)) e = t !== t && e !== e;else t: {
											var o = ea(t),
											    u = ea(e),
											    a = o ? "[object Array]" : fu(t),
											    c = u ? "[object Array]" : fu(e),
											    s = "[object Object]" == (a = "[object Arguments]" == a ? "[object Object]" : a),
											    u = "[object Object]" == (c = "[object Arguments]" == c ? "[object Object]" : c);if ((c = a == c) && ra(t)) {
												if (!ra(e)) {
													e = !1;break t;
												}o = !0, s = !1;
											}if (c && !s) i || (i = new $t()), e = o || ca(t) ? cr(t, e, n, r, Be, i) : sr(t, e, a, n, r, Be, i);else {
												if (!(1 & n) && (o = s && eo.call(t, "__wrapped__"), a = u && eo.call(e, "__wrapped__"), o || a)) {
													t = o ? t.value() : t, e = a ? e.value() : e, i || (i = new $t()), e = Be(t, e, n, r, i);break t;
												}if (c) {
													e: if (i || (i = new $t()), o = 1 & n, a = fr(t), u = a.length, c = fr(e).length, u == c || o) {
														for (s = u; s--;) {
															var l = a[s];if (!(o ? l in e : eo.call(e, l))) {
																e = !1;break e;
															}
														}if ((c = i.get(t)) && i.get(e)) e = c == e;else {
															c = !0, i.set(t, e), i.set(e, t);for (var f = o; ++s < u;) {
																var h = t[l = a[s]],
																    p = e[l];if (r) var _ = o ? r(p, h, l, e, t, i) : r(h, p, l, t, e, i);if (_ === W ? h !== p && !Be(h, p, n, r, i) : !_) {
																	c = !1;break;
																}f || (f = "constructor" == l);
															}c && !f && (n = t.constructor, r = e.constructor, n != r && "constructor" in t && "constructor" in e && !("function" == typeof n && n instanceof n && "function" == typeof r && r instanceof r) && (c = !1)), i.delete(t), i.delete(e), e = c;
														}
													} else e = !1;
												} else e = !1;
											}
										}return e;
									}function Ne(t, e, n, r) {
										var i = n.length,
										    o = i,
										    u = !r;if (null == t) return !o;for (t = Qi(t); i--;) {
											var a = n[i];if (u && a[2] ? a[1] !== t[a[0]] : !(a[0] in t)) return !1;
										}for (; ++i < o;) {
											var c = (a = n[i])[0],
											    s = t[c],
											    l = a[1];if (u && a[2]) {
												if (s === W && !(c in t)) return !1;
											} else {
												if (a = new $t(), r) var f = r(s, l, c, t, e, a);if (f === W ? !Be(l, s, 3, r, a) : !f) return !1;
											}
										}return !0;
									}function Me(t) {
										return !(!hi(t) || ro && ro in t) && (si(t) ? ao : jt).test(Ir(t));
									}function Ve(t) {
										return "function" == typeof t ? t : null == t ? Ii : "object" == (void 0 === t ? "undefined" : _typeof2(t)) ? ea(t) ? qe(t[0], t[1]) : $e(t) : Ni(t);
									}function ze(t) {
										if (!Tr(t)) return So(t);var e,
										    n = [];for (e in Qi(t)) {
											eo.call(t, e) && "constructor" != e && n.push(e);
										}return n;
									}function He(t, e) {
										return t < e;
									}function We(t, e) {
										var n = -1,
										    r = ui(t) ? zi(t.length) : [];return tu(t, function (t, i, o) {
											r[++n] = e(t, i, o);
										}), r;
									}function $e(t) {
										var e = yr(t);return 1 == e.length && e[0][2] ? Ar(e[0][0], e[0][1]) : function (n) {
											return n === t || Ne(n, t, e);
										};
									}function qe(t, e) {
										return kr(t) && e === e && !hi(e) ? Ar(Lr(t), e) : function (n) {
											var r = Ci(n, t);return r === W && r === e ? ki(n, t) : Be(e, r, 3);
										};
									}function Qe(t, e, n, r, i) {
										t !== e && nu(e, function (o, u) {
											if (hi(o)) {
												i || (i = new $t());var a = i,
												    c = t[u],
												    s = e[u];if (_ = a.get(s)) ae(t, u, _);else {
													var l = (_ = r ? r(c, s, u + "", t, e, a) : W) === W;if (l) {
														var f = ea(s),
														    h = !f && ra(s),
														    p = !f && !h && ca(s),
														    _ = s;f || h || p ? ea(c) ? _ = c : ai(c) ? _ = Rn(c) : h ? (l = !1, _ = kn(s, !0)) : p ? (l = !1, _ = Tn(s, !0)) : _ = [] : di(s) || ta(s) ? (_ = c, ta(c) ? _ = xi(c) : (!hi(c) || n && si(c)) && (_ = wr(s))) : l = !1;
													}l && (a.set(s, _), Qe(_, s, n, r, a), a.delete(s)), ae(t, u, _);
												}
											} else (a = r ? r(t[u], o, u + "", t, e, i) : W) === W && (a = o), ae(t, u, a);
										}, Ti);
									}function Ge(t, e) {
										var n = t.length;if (n) return e += 0 > e ? n : 0, Er(e, n) ? t[e] : W;
									}function Ze(t, e, n) {
										var r = -1;return e = p(e.length ? e : [Ii], O(dr())), t = We(t, function (t) {
											return { a: p(e, function (e) {
													return e(t);
												}), b: ++r, c: t };
										}), F(t, function (t, e) {
											var r;t: {
												r = -1;for (var i = t.a, o = e.a, u = i.length, a = n.length; ++r < u;) {
													var c = An(i[r], o[r]);if (c) {
														r = r >= a ? c : c * ("desc" == n[r] ? -1 : 1);break t;
													}
												}r = t.b - e.b;
											}return r;
										});
									}function Xe(t, e) {
										return Ke(t, e, function (e, n) {
											return ki(t, n);
										});
									}function Ke(t, e, n) {
										for (var r = -1, i = e.length, o = {}; ++r < i;) {
											var u = e[r],
											    a = Te(t, u);n(a, u) && an(o, En(u, t), a);
										}return o;
									}function Je(t) {
										return function (e) {
											return Te(e, t);
										};
									}function Ye(t, e, n, r) {
										var i = r ? w : b,
										    o = -1,
										    u = e.length,
										    a = t;for (t === e && (e = Rn(e)), n && (a = p(t, O(n))); ++o < u;) {
											for (var c = 0, s = e[o], s = n ? n(s) : s; -1 < (c = i(a, s, c, r));) {
												a !== t && vo.call(a, c, 1), vo.call(t, c, 1);
											}
										}return t;
									}function tn(t, e) {
										for (var n = t ? e.length : 0, r = n - 1; n--;) {
											var i = e[n];if (n == r || i !== o) {
												var o = i;Er(i) ? vo.call(t, i, 1) : yn(t, i);
											}
										}
									}function en(t, e) {
										return t + Co(Io() * (e - t + 1));
									}function nn(t, e) {
										var n = "";if (!t || 1 > e || 9007199254740991 < e) return n;do {
											e % 2 && (n += t), (e = Co(e / 2)) && (t += t);
										} while (e);return n;
									}function rn(t, e) {
										return du(Sr(t, e, Ii), t + "");
									}function on(t) {
										return Gt(Si(t));
									}function un(t, e) {
										var n = Si(t);return Pr(n, de(e, 0, n.length));
									}function an(t, e, n, r) {
										if (!hi(t)) return t;for (var i = -1, o = (e = En(e, t)).length, u = o - 1, a = t; null != a && ++i < o;) {
											var c = Lr(e[i]),
											    s = n;if (i != u) {
												var l = a[c];(s = r ? r(l, c, a) : W) === W && (s = hi(l) ? l : Er(e[i + 1]) ? [] : {});
											}ce(a, c, s), a = a[c];
										}return t;
									}function cn(t) {
										return Pr(Si(t));
									}function sn(t, e, n) {
										var r = -1,
										    i = t.length;for (0 > e && (e = -e > i ? 0 : i + e), 0 > (n = n > i ? i : n) && (n += i), i = e > n ? 0 : n - e >>> 0, e >>>= 0, n = zi(i); ++r < i;) {
											n[r] = t[r + e];
										}return n;
									}function ln(t, e) {
										var n;return tu(t, function (t, r, i) {
											return !(n = e(t, r, i));
										}), !!n;
									}function fn(t, e, n) {
										var r = 0,
										    i = null == t ? r : t.length;if ("number" == typeof e && e === e && 2147483647 >= i) {
											for (; r < i;) {
												var o = r + i >>> 1,
												    u = t[o];null !== u && !yi(u) && (n ? u <= e : u < e) ? r = o + 1 : i = o;
											}return i;
										}return hn(t, e, Ii, n);
									}function hn(t, e, n, r) {
										e = n(e);for (var i = 0, o = null == t ? 0 : t.length, u = e !== e, a = null === e, c = yi(e), s = e === W; i < o;) {
											var l = Co((i + o) / 2),
											    f = n(t[l]),
											    h = f !== W,
											    p = null === f,
											    _ = f === f,
											    d = yi(f);(u ? r || _ : s ? _ && (r || h) : a ? _ && h && (r || !p) : c ? _ && h && !p && (r || !d) : p || d ? 0 : r ? f <= e : f < e) ? i = l + 1 : o = l;
										}return Ro(o, 4294967294);
									}function pn(t, e) {
										for (var n = -1, r = t.length, i = 0, o = []; ++n < r;) {
											var u = t[n],
											    a = e ? e(u) : u;if (!n || !oi(a, c)) {
												var c = a;o[i++] = 0 === u ? 0 : u;
											}
										}return o;
									}function _n(t) {
										return "number" == typeof t ? t : yi(t) ? q : +t;
									}function dn(t) {
										if ("string" == typeof t) return t;if (ea(t)) return p(t, dn) + "";if (yi(t)) return Jo ? Jo.call(t) : "";var e = t + "";return "0" == e && 1 / t == -$ ? "-0" : e;
									}function vn(t, e, n) {
										var r = -1,
										    i = f,
										    o = t.length,
										    u = !0,
										    a = [],
										    c = a;if (n) u = !1, i = h;else if (200 <= o) {
											if (i = e ? null : au(t)) return M(i);u = !1, i = P, c = new Ht();
										} else c = e ? [] : a;t: for (; ++r < o;) {
											var s = t[r],
											    l = e ? e(s) : s,
											    s = n || 0 !== s ? s : 0;if (u && l === l) {
												for (var p = c.length; p--;) {
													if (c[p] === l) continue t;
												}e && c.push(l), a.push(s);
											} else i(c, l, n) || (c !== a && c.push(l), a.push(s));
										}return a;
									}function yn(t, e) {
										return e = En(e, t), null == (t = 2 > e.length ? t : Te(t, sn(e, 0, -1))) || delete t[Lr(zr(e))];
									}function gn(t, e, n, r) {
										for (var i = t.length, o = r ? i : -1; (r ? o-- : ++o < i) && e(t[o], o, t);) {}return n ? sn(t, r ? 0 : o, r ? o + 1 : i) : sn(t, r ? o + 1 : 0, r ? i : o);
									}function mn(t, e) {
										var n = t;return n instanceof Ot && (n = n.value()), d(e, function (t, e) {
											return e.func.apply(e.thisArg, _([t], e.args));
										}, n);
									}function bn(t, e, n) {
										var r = t.length;if (2 > r) return r ? vn(t[0]) : [];for (var i = -1, o = zi(r); ++i < r;) {
											for (var u = t[i], a = -1; ++a < r;) {
												a != i && (o[i] = be(o[i] || u, t[a], e, n));
											}
										}return vn(Ee(o, 1), e, n);
									}function wn(t, e, n) {
										for (var r = -1, i = t.length, o = e.length, u = {}; ++r < i;) {
											n(u, t[r], r < o ? e[r] : W);
										}return u;
									}function jn(t) {
										return ai(t) ? t : [];
									}function xn(t) {
										return "function" == typeof t ? t : Ii;
									}function En(t, e) {
										return ea(t) ? t : kr(t, e) ? [t] : vu(Ei(t));
									}function Cn(t, e, n) {
										var r = t.length;return n = n === W ? r : n, !e && n >= r ? t : sn(t, e, n);
									}function kn(t, e) {
										if (e) return t.slice();var n = t.length,
										    n = fo ? fo(n) : new t.constructor(n);return t.copy(n), n;
									}function Fn(t) {
										var e = new t.constructor(t.byteLength);return new lo(e).set(new lo(t)), e;
									}function Tn(t, e) {
										return new t.constructor(e ? Fn(t.buffer) : t.buffer, t.byteOffset, t.length);
									}function An(t, e) {
										if (t !== e) {
											var n = t !== W,
											    r = null === t,
											    i = t === t,
											    o = yi(t),
											    u = e !== W,
											    a = null === e,
											    c = e === e,
											    s = yi(e);if (!a && !s && !o && t > e || o && u && c && !a && !s || r && u && c || !n && c || !i) return 1;if (!r && !o && !s && t < e || s && n && i && !r && !o || a && n && i || !u && i || !c) return -1;
										}return 0;
									}function Sn(t, e, n, r) {
										var i = -1,
										    o = t.length,
										    u = n.length,
										    a = -1,
										    c = e.length,
										    s = Oo(o - u, 0),
										    l = zi(c + s);for (r = !r; ++a < c;) {
											l[a] = e[a];
										}for (; ++i < u;) {
											(r || i < o) && (l[n[i]] = t[i]);
										}for (; s--;) {
											l[a++] = t[i++];
										}return l;
									}function On(t, e, n, r) {
										var i = -1,
										    o = t.length,
										    u = -1,
										    a = n.length,
										    c = -1,
										    s = e.length,
										    l = Oo(o - a, 0),
										    f = zi(l + s);for (r = !r; ++i < l;) {
											f[i] = t[i];
										}for (l = i; ++c < s;) {
											f[l + c] = e[c];
										}for (; ++u < a;) {
											(r || i < o) && (f[l + n[u]] = t[i++]);
										}return f;
									}function Rn(t, e) {
										var n = -1,
										    r = t.length;for (e || (e = zi(r)); ++n < r;) {
											e[n] = t[n];
										}return e;
									}function Pn(t, e, n, r) {
										var i = !n;n || (n = {});for (var o = -1, u = e.length; ++o < u;) {
											var a = e[o],
											    c = r ? r(n[a], t[a], a, n, t) : W;c === W && (c = t[a]), i ? pe(n, a, c) : ce(n, a, c);
										}return n;
									}function Ln(t, e) {
										return Pn(t, su(t), e);
									}function In(t, e) {
										return Pn(t, lu(t), e);
									}function Dn(t, e) {
										return function (n, r) {
											var i = ea(n) ? u : le,
											    o = e ? e() : {};return i(n, t, dr(r, 2), o);
										};
									}function Un(t) {
										return rn(function (e, n) {
											var r = -1,
											    i = n.length,
											    o = 1 < i ? n[i - 1] : W,
											    u = 2 < i ? n[2] : W,
											    o = 3 < t.length && "function" == typeof o ? (i--, o) : W;for (u && Cr(n[0], n[1], u) && (o = 3 > i ? W : o, i = 1), e = Qi(e); ++r < i;) {
												(u = n[r]) && t(e, u, r, o);
											}return e;
										});
									}function Bn(t, e) {
										return function (n, r) {
											if (null == n) return n;if (!ui(n)) return t(n, r);for (var i = n.length, o = e ? i : -1, u = Qi(n); (e ? o-- : ++o < i) && !1 !== r(u[o], o, u);) {}return n;
										};
									}function Nn(t) {
										return function (e, n, r) {
											for (var i = -1, o = Qi(e), u = (r = r(e)).length; u--;) {
												var a = r[t ? u : ++i];if (!1 === n(o[a], a, o)) break;
											}return e;
										};
									}function Mn(t, e, n) {
										function r() {
											return (this && this !== Wt && this instanceof r ? o : t).apply(i ? n : this, arguments);
										}var i = 1 & e,
										    o = Hn(t);return r;
									}function Vn(t) {
										return function (e) {
											e = Ei(e);var n = Pt.test(e) ? H(e) : W,
											    r = n ? n[0] : e.charAt(0);return e = n ? Cn(n, 1).join("") : e.slice(1), r[t]() + e;
										};
									}function zn(t) {
										return function (e) {
											return d(Pi(Ri(e).replace(At, "")), t, "");
										};
									}function Hn(t) {
										return function () {
											var e = arguments;switch (e.length) {case 0:
													return new t();case 1:
													return new t(e[0]);case 2:
													return new t(e[0], e[1]);case 3:
													return new t(e[0], e[1], e[2]);case 4:
													return new t(e[0], e[1], e[2], e[3]);case 5:
													return new t(e[0], e[1], e[2], e[3], e[4]);case 6:
													return new t(e[0], e[1], e[2], e[3], e[4], e[5]);case 7:
													return new t(e[0], e[1], e[2], e[3], e[4], e[5], e[6]);}var n = Yo(t.prototype);return hi(e = t.apply(n, e)) ? e : n;
										};
									}function Wn(t, e, n) {
										function r() {
											for (var u = arguments.length, a = zi(u), c = u, s = _r(r); c--;) {
												a[c] = arguments[c];
											}return c = 3 > u && a[0] !== s && a[u - 1] !== s ? [] : N(a, s), (u -= c.length) < n ? er(t, e, Qn, r.placeholder, W, a, c, W, W, n - u) : o(this && this !== Wt && this instanceof r ? i : t, this, a);
										}var i = Hn(t);return r;
									}function $n(t) {
										return function (e, n, r) {
											var i = Qi(e);if (!ui(e)) {
												var o = dr(n, 3);e = Fi(e), n = function n(t) {
													return o(i[t], t, i);
												};
											}return -1 < (n = t(e, n, r)) ? i[o ? e[n] : n] : W;
										};
									}function qn(t) {
										return lr(function (e) {
											var n = e.length,
											    r = n,
											    i = Tt.prototype.thru;for (t && e.reverse(); r--;) {
												if ("function" != typeof (o = e[r])) throw new Xi("Expected a function");if (i && !a && "wrapper" == pr(o)) a = new Tt([], !0);
											}for (r = a ? r : n; ++r < n;) {
												var o = e[r],
												    u = "wrapper" == (i = pr(o)) ? cu(o) : W,
												    a = u && Fr(u[0]) && 424 == u[1] && !u[4].length && 1 == u[9] ? a[pr(u[0])].apply(a, u[3]) : 1 == o.length && Fr(o) ? a[i]() : a.thru(o);
											}return function () {
												var t = (i = arguments)[0];if (a && 1 == i.length && ea(t)) return a.plant(t).value();for (var r = 0, i = n ? e[r].apply(this, i) : t; ++r < n;) {
													i = e[r].call(this, i);
												}return i;
											};
										});
									}function Qn(t, e, n, r, i, o, u, a, c, s) {
										function l() {
											for (var y = arguments.length, g = zi(y), m = y; m--;) {
												g[m] = arguments[m];
											}if (_) {
												var b,
												    w = _r(l),
												    m = g.length;for (b = 0; m--;) {
													g[m] === w && ++b;
												}
											}if (r && (g = Sn(g, r, i, _)), o && (g = On(g, o, u, _)), y -= b, _ && y < s) return w = N(g, w), er(t, e, Qn, l.placeholder, n, g, w, a, c, s - y);if (w = h ? n : this, m = p ? w[t] : t, y = g.length, a) {
												b = g.length;for (var j = Ro(a.length, b), x = Rn(g); j--;) {
													var E = a[j];g[j] = Er(E, b) ? x[E] : W;
												}
											} else d && 1 < y && g.reverse();return f && c < y && (g.length = c), this && this !== Wt && this instanceof l && (m = v || Hn(m)), m.apply(w, g);
										}var f = 128 & e,
										    h = 1 & e,
										    p = 2 & e,
										    _ = 24 & e,
										    d = 512 & e,
										    v = p ? W : Hn(t);return l;
									}function Gn(t, e) {
										return function (n, r) {
											return Ie(n, t, e(r));
										};
									}function Zn(t, e) {
										return function (n, r) {
											var i;if (n === W && r === W) return e;if (n !== W && (i = n), r !== W) {
												if (i === W) return r;"string" == typeof n || "string" == typeof r ? (n = dn(n), r = dn(r)) : (n = _n(n), r = _n(r)), i = t(n, r);
											}return i;
										};
									}function Xn(t) {
										return lr(function (e) {
											return e = p(e, O(dr())), rn(function (n) {
												var r = this;return t(e, function (t) {
													return o(t, r, n);
												});
											});
										});
									}function Kn(t, e) {
										var n = (e = e === W ? " " : dn(e)).length;return 2 > n ? n ? nn(e, t) : e : (n = nn(e, Eo(t / z(e))), Pt.test(e) ? Cn(H(n), 0, t).join("") : n.slice(0, t));
									}function Jn(t, e, n, r) {
										function i() {
											for (var e = -1, c = arguments.length, s = -1, l = r.length, f = zi(l + c), h = this && this !== Wt && this instanceof i ? a : t; ++s < l;) {
												f[s] = r[s];
											}for (; c--;) {
												f[s++] = arguments[++e];
											}return o(h, u ? n : this, f);
										}var u = 1 & e,
										    a = Hn(t);return i;
									}function Yn(t) {
										return function (e, n, r) {
											r && "number" != typeof r && Cr(e, n, r) && (n = r = W), e = mi(e), n === W ? (n = e, e = 0) : n = mi(n), r = r === W ? e < n ? 1 : -1 : mi(r);var i = -1;n = Oo(Eo((n - e) / (r || 1)), 0);for (var o = zi(n); n--;) {
												o[t ? n : ++i] = e, e += r;
											}return o;
										};
									}function tr(t) {
										return function (e, n) {
											return "string" == typeof e && "string" == typeof n || (e = ji(e), n = ji(n)), t(e, n);
										};
									}function er(t, e, n, r, i, o, u, a, c, s) {
										var l = 8 & e,
										    f = l ? u : W;u = l ? W : u;var h = l ? o : W;return o = l ? W : o, 4 & (e = (e | (l ? 32 : 64)) & ~(l ? 64 : 32)) || (e &= -4), i = [t, e, i, h, f, o, u, a, c, s], n = n.apply(W, i), Fr(t) && pu(n, i), n.placeholder = r, Or(n, t, e);
									}function nr(t) {
										var e = qi[t];return function (t, n) {
											if (t = ji(t), n = null == n ? 0 : Ro(bi(n), 292)) {
												var r = (Ei(t) + "e").split("e");return +((r = (Ei(r = e(r[0] + "e" + (+r[1] + n))) + "e").split("e"))[0] + "e" + (+r[1] - n));
											}return e(t);
										};
									}function rr(t) {
										return function (e) {
											var n = fu(e);return "[object Map]" == n ? U(e) : "[object Set]" == n ? V(e) : S(e, t(e));
										};
									}function ir(t, e, n, r, i, o, u, a) {
										var c = 2 & e;if (!c && "function" != typeof t) throw new Xi("Expected a function");var s = r ? r.length : 0;if (s || (e &= -97, r = i = W), u = u === W ? u : Oo(bi(u), 0), a = a === W ? a : bi(a), s -= i ? i.length : 0, 64 & e) {
											var l = r,
											    f = i;r = i = W;
										}var h = c ? W : cu(t);return o = [t, e, n, r, i, l, f, o, u, a], h && (n = o[1], t = h[1], e = n | t, r = 128 == t && 8 == n || 128 == t && 256 == n && o[7].length <= h[8] || 384 == t && h[7].length <= h[8] && 8 == n, 131 > e || r) && (1 & t && (o[2] = h[2], e |= 1 & n ? 0 : 4), (n = h[3]) && (r = o[3], o[3] = r ? Sn(r, n, h[4]) : n, o[4] = r ? N(o[3], "__lodash_placeholder__") : h[4]), (n = h[5]) && (r = o[5], o[5] = r ? On(r, n, h[6]) : n, o[6] = r ? N(o[5], "__lodash_placeholder__") : h[6]), (n = h[7]) && (o[7] = n), 128 & t && (o[8] = null == o[8] ? h[8] : Ro(o[8], h[8])), null == o[9] && (o[9] = h[9]), o[0] = h[0], o[1] = e), t = o[0], e = o[1], n = o[2], r = o[3], i = o[4], !(a = o[9] = o[9] === W ? c ? 0 : t.length : Oo(o[9] - s, 0)) && 24 & e && (e &= -25), Or((h ? iu : pu)(e && 1 != e ? 8 == e || 16 == e ? Wn(t, e, a) : 32 != e && 33 != e || i.length ? Qn.apply(W, o) : Jn(t, e, n, r) : Mn(t, e, n), o), t, e);
									}function or(t, e, n, r) {
										return t === W || oi(t, Ji[n]) && !eo.call(r, n) ? e : t;
									}function ur(t, e, n, r, i, o) {
										return hi(t) && hi(e) && (o.set(e, t), Qe(t, e, W, ur, o), o.delete(e)), t;
									}function ar(t) {
										return di(t) ? W : t;
									}function cr(t, e, n, r, i, o) {
										var u = 1 & n,
										    a = t.length;if (a != (c = e.length) && !(u && c > a)) return !1;if ((c = o.get(t)) && o.get(e)) return c == e;var c = -1,
										    s = !0,
										    l = 2 & n ? new Ht() : W;for (o.set(t, e), o.set(e, t); ++c < a;) {
											var f = t[c],
											    h = e[c];if (r) var p = u ? r(h, f, c, e, t, o) : r(f, h, c, t, e, o);if (p !== W) {
												if (p) continue;s = !1;break;
											}if (l) {
												if (!y(e, function (t, e) {
													if (!P(l, e) && (f === t || i(f, t, n, r, o))) return l.push(e);
												})) {
													s = !1;break;
												}
											} else if (f !== h && !i(f, h, n, r, o)) {
												s = !1;break;
											}
										}return o.delete(t), o.delete(e), s;
									}function sr(t, e, n, r, i, o, u) {
										switch (n) {case "[object DataView]":
												if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset) break;t = t.buffer, e = e.buffer;case "[object ArrayBuffer]":
												if (t.byteLength != e.byteLength || !o(new lo(t), new lo(e))) break;return !0;case "[object Boolean]":case "[object Date]":case "[object Number]":
												return oi(+t, +e);case "[object Error]":
												return t.name == e.name && t.message == e.message;case "[object RegExp]":case "[object String]":
												return t == e + "";case "[object Map]":
												var a = U;case "[object Set]":
												if (a || (a = M), t.size != e.size && !(1 & r)) break;return (n = u.get(t)) ? n == e : (r |= 2, u.set(t, e), e = cr(a(t), a(e), r, i, o, u), u.delete(t), e);case "[object Symbol]":
												if (Ko) return Ko.call(t) == Ko.call(e);}return !1;
									}function lr(t) {
										return du(Sr(t, W, Mr), t + "");
									}function fr(t) {
										return Ae(t, Fi, su);
									}function hr(t) {
										return Ae(t, Ti, lu);
									}function pr(t) {
										for (var e = t.name + "", n = Wo[e], r = eo.call(Wo, e) ? n.length : 0; r--;) {
											var i = n[r],
											    o = i.func;if (null == o || o == t) return i.name;
										}return e;
									}function _r(t) {
										return (eo.call(n, "placeholder") ? n : t).placeholder;
									}function dr() {
										var t = (t = n.iteratee || Di) === Di ? Ve : t;return arguments.length ? t(arguments[0], arguments[1]) : t;
									}function vr(t, e) {
										var n = t.__data__,
										    r = void 0 === e ? "undefined" : _typeof2(e);return ("string" == r || "number" == r || "symbol" == r || "boolean" == r ? "__proto__" !== e : null === e) ? n["string" == typeof e ? "string" : "hash"] : n.map;
									}function yr(t) {
										for (var e = Fi(t), n = e.length; n--;) {
											var r = e[n],
											    i = t[r];e[n] = [r, i, i === i && !hi(i)];
										}return e;
									}function gr(t, e) {
										var n = null == t ? W : t[e];return Me(n) ? n : W;
									}function mr(t, e, n) {
										for (var r = -1, i = (e = En(e, t)).length, o = !1; ++r < i;) {
											var u = Lr(e[r]);if (!(o = null != t && n(t, u))) break;t = t[u];
										}return o || ++r != i ? o : !!(i = null == t ? 0 : t.length) && fi(i) && Er(u, i) && (ea(t) || ta(t));
									}function br(t) {
										var e = t.length,
										    n = t.constructor(e);return e && "string" == typeof t[0] && eo.call(t, "index") && (n.index = t.index, n.input = t.input), n;
									}function wr(t) {
										return "function" != typeof t.constructor || Tr(t) ? {} : Yo(ho(t));
									}function jr(t, e, n, o) {
										var u = t.constructor;switch (e) {case "[object ArrayBuffer]":
												return Fn(t);case "[object Boolean]":case "[object Date]":
												return new u(+t);case "[object DataView]":
												return e = o ? Fn(t.buffer) : t.buffer, new t.constructor(e, t.byteOffset, t.byteLength);case "[object Float32Array]":case "[object Float64Array]":case "[object Int8Array]":case "[object Int16Array]":case "[object Int32Array]":case "[object Uint8Array]":case "[object Uint8ClampedArray]":case "[object Uint16Array]":case "[object Uint32Array]":
												return Tn(t, o);case "[object Map]":
												return e = o ? n(U(t), 1) : U(t), d(e, r, new t.constructor());case "[object Number]":case "[object String]":
												return new u(t);case "[object RegExp]":
												return e = new t.constructor(t.source, mt.exec(t)), e.lastIndex = t.lastIndex, e;case "[object Set]":
												return e = o ? n(M(t), 1) : M(t), d(e, i, new t.constructor());case "[object Symbol]":
												return Ko ? Qi(Ko.call(t)) : {};}
									}function xr(t) {
										return ea(t) || ta(t) || !!(yo && t && t[yo]);
									}function Er(t, e) {
										return !!(e = null == e ? 9007199254740991 : e) && ("number" == typeof t || Et.test(t)) && -1 < t && 0 == t % 1 && t < e;
									}function Cr(t, e, n) {
										if (!hi(n)) return !1;var r = void 0 === e ? "undefined" : _typeof2(e);return !!("number" == r ? ui(n) && Er(e, n.length) : "string" == r && e in n) && oi(n[e], t);
									}function kr(t, e) {
										if (ea(t)) return !1;var n = void 0 === t ? "undefined" : _typeof2(t);return !("number" != n && "symbol" != n && "boolean" != n && null != t && !yi(t)) || ot.test(t) || !it.test(t) || null != e && t in Qi(e);
									}function Fr(t) {
										var e = pr(t),
										    r = n[e];return "function" == typeof r && e in Ot.prototype && (t === r || !!(e = cu(r)) && t === e[0]);
									}function Tr(t) {
										var e = t && t.constructor;return t === ("function" == typeof e && e.prototype || Ji);
									}function Ar(t, e) {
										return function (n) {
											return null != n && n[t] === e && (e !== W || t in Qi(n));
										};
									}function Sr(t, e, n) {
										return e = Oo(e === W ? t.length - 1 : e, 0), function () {
											for (var r = arguments, i = -1, u = Oo(r.length - e, 0), a = zi(u); ++i < u;) {
												a[i] = r[e + i];
											}for (i = -1, u = zi(e + 1); ++i < e;) {
												u[i] = r[i];
											}return u[e] = n(a), o(t, this, u);
										};
									}function Or(t, e, n) {
										var r = e + "";e = du;var i,
										    o = Dr;return i = (i = r.match(_t)) ? i[1].split(dt) : [], n = o(i, n), (o = n.length) && (i = o - 1, n[i] = (1 < o ? "& " : "") + n[i], n = n.join(2 < o ? ", " : " "), r = r.replace(pt, "{\n/* [wrapped with " + n + "] */\n")), e(t, r);
									}function Rr(t) {
										var e = 0,
										    n = 0;return function () {
											var r = Po(),
											    i = 16 - (r - n);if (n = r, 0 < i) {
												if (800 <= ++e) return arguments[0];
											} else e = 0;return t.apply(W, arguments);
										};
									}function Pr(t, e) {
										var n = -1,
										    r = t.length,
										    i = r - 1;for (e = e === W ? r : e; ++n < e;) {
											var o = t[r = en(n, i)];t[r] = t[n], t[n] = o;
										}return t.length = e, t;
									}function Lr(t) {
										if ("string" == typeof t || yi(t)) return t;var e = t + "";return "0" == e && 1 / t == -$ ? "-0" : e;
									}function Ir(t) {
										if (null != t) {
											try {
												return to.call(t);
											} catch (t) {}return t + "";
										}return "";
									}function Dr(t, e) {
										return a(Q, function (n) {
											var r = "_." + n[0];e & n[1] && !f(t, r) && t.push(r);
										}), t.sort();
									}function Ur(t) {
										if (t instanceof Ot) return t.clone();var e = new Tt(t.__wrapped__, t.__chain__);return e.__actions__ = Rn(t.__actions__), e.__index__ = t.__index__, e.__values__ = t.__values__, e;
									}function Br(t, e, n) {
										var r = null == t ? 0 : t.length;return r ? (0 > (n = null == n ? 0 : bi(n)) && (n = Oo(r + n, 0)), m(t, dr(e, 3), n)) : -1;
									}function Nr(t, e, n) {
										var r = null == t ? 0 : t.length;if (!r) return -1;var i = r - 1;return n !== W && (i = bi(n), i = 0 > n ? Oo(r + i, 0) : Ro(i, r - 1)), m(t, dr(e, 3), i, !0);
									}function Mr(t) {
										return (null == t ? 0 : t.length) ? Ee(t, 1) : [];
									}function Vr(t) {
										return t && t.length ? t[0] : W;
									}function zr(t) {
										var e = null == t ? 0 : t.length;return e ? t[e - 1] : W;
									}function Hr(t, e) {
										return t && t.length && e && e.length ? Ye(t, e) : t;
									}function Wr(t) {
										return null == t ? t : Do.call(t);
									}function $r(t) {
										if (!t || !t.length) return [];var e = 0;return t = l(t, function (t) {
											if (ai(t)) return e = Oo(t.length, e), !0;
										}), A(e, function (e) {
											return p(t, E(e));
										});
									}function qr(t, e) {
										if (!t || !t.length) return [];var n = $r(t);return null == e ? n : p(n, function (t) {
											return o(e, W, t);
										});
									}function Qr(t) {
										return t = n(t), t.__chain__ = !0, t;
									}function Gr(t, e) {
										return e(t);
									}function Zr(t, e) {
										return (ea(t) ? a : tu)(t, dr(e, 3));
									}function Xr(t, e) {
										return (ea(t) ? c : eu)(t, dr(e, 3));
									}function Kr(t, e) {
										return (ea(t) ? p : We)(t, dr(e, 3));
									}function Jr(t, e, n) {
										return e = n ? W : e, e = t && null == e ? t.length : e, ir(t, 128, W, W, W, W, e);
									}function Yr(t, e) {
										var n;if ("function" != typeof e) throw new Xi("Expected a function");return t = bi(t), function () {
											return 0 < --t && (n = e.apply(this, arguments)), 1 >= t && (e = W), n;
										};
									}function ti(t, e, n) {
										return e = n ? W : e, t = ir(t, 8, W, W, W, W, W, e), t.placeholder = ti.placeholder, t;
									}function ei(t, e, n) {
										return e = n ? W : e, t = ir(t, 16, W, W, W, W, W, e), t.placeholder = ei.placeholder, t;
									}function ni(t, e, n) {
										function r(e) {
											var n = c,
											    r = s;return c = s = W, _ = e, f = t.apply(r, n);
										}function i(t) {
											var n = t - p;return t -= _, p === W || n >= e || 0 > n || v && t >= l;
										}function o() {
											var t = Hu();if (i(t)) return u(t);var n,
											    r = _u;n = t - _, t = e - (t - p), n = v ? Ro(t, l - n) : t, h = r(o, n);
										}function u(t) {
											return h = W, y && c ? r(t) : (c = s = W, f);
										}function a() {
											var t = Hu(),
											    n = i(t);if (c = arguments, s = this, p = t, n) {
												if (h === W) return _ = t = p, h = _u(o, e), d ? r(t) : f;if (v) return h = _u(o, e), r(p);
											}return h === W && (h = _u(o, e)), f;
										}var c,
										    s,
										    l,
										    f,
										    h,
										    p,
										    _ = 0,
										    d = !1,
										    v = !1,
										    y = !0;if ("function" != typeof t) throw new Xi("Expected a function");return e = ji(e) || 0, hi(n) && (d = !!n.leading, l = (v = "maxWait" in n) ? Oo(ji(n.maxWait) || 0, e) : l, y = "trailing" in n ? !!n.trailing : y), a.cancel = function () {
											h !== W && uu(h), _ = 0, c = p = s = h = W;
										}, a.flush = function () {
											return h === W ? f : u(Hu());
										}, a;
									}function ri(t, e) {
										function n() {
											var r = arguments,
											    i = e ? e.apply(this, r) : r[0],
											    o = n.cache;return o.has(i) ? o.get(i) : (r = t.apply(this, r), n.cache = o.set(i, r) || o, r);
										}if ("function" != typeof t || null != e && "function" != typeof e) throw new Xi("Expected a function");return n.cache = new (ri.Cache || zt)(), n;
									}function ii(t) {
										if ("function" != typeof t) throw new Xi("Expected a function");return function () {
											var e = arguments;switch (e.length) {case 0:
													return !t.call(this);case 1:
													return !t.call(this, e[0]);case 2:
													return !t.call(this, e[0], e[1]);case 3:
													return !t.call(this, e[0], e[1], e[2]);}return !t.apply(this, e);
										};
									}function oi(t, e) {
										return t === e || t !== t && e !== e;
									}function ui(t) {
										return null != t && fi(t.length) && !si(t);
									}function ai(t) {
										return pi(t) && ui(t);
									}function ci(t) {
										if (!pi(t)) return !1;var e = Se(t);return "[object Error]" == e || "[object DOMException]" == e || "string" == typeof t.message && "string" == typeof t.name && !di(t);
									}function si(t) {
										return !!hi(t) && ("[object Function]" == (t = Se(t)) || "[object GeneratorFunction]" == t || "[object AsyncFunction]" == t || "[object Proxy]" == t);
									}function li(t) {
										return "number" == typeof t && t == bi(t);
									}function fi(t) {
										return "number" == typeof t && -1 < t && 0 == t % 1 && 9007199254740991 >= t;
									}function hi(t) {
										var e = void 0 === t ? "undefined" : _typeof2(t);return null != t && ("object" == e || "function" == e);
									}function pi(t) {
										return null != t && "object" == (void 0 === t ? "undefined" : _typeof2(t));
									}function _i(t) {
										return "number" == typeof t || pi(t) && "[object Number]" == Se(t);
									}function di(t) {
										return !(!pi(t) || "[object Object]" != Se(t)) && (null === (t = ho(t)) || "function" == typeof (t = eo.call(t, "constructor") && t.constructor) && t instanceof t && to.call(t) == oo);
									}function vi(t) {
										return "string" == typeof t || !ea(t) && pi(t) && "[object String]" == Se(t);
									}function yi(t) {
										return "symbol" == (void 0 === t ? "undefined" : _typeof2(t)) || pi(t) && "[object Symbol]" == Se(t);
									}function gi(t) {
										if (!t) return [];if (ui(t)) return vi(t) ? H(t) : Rn(t);if (go && t[go]) {
											t = t[go]();for (var e, n = []; !(e = t.next()).done;) {
												n.push(e.value);
											}return n;
										}return ("[object Map]" == (e = fu(t)) ? U : "[object Set]" == e ? M : Si)(t);
									}function mi(t) {
										return t ? (t = ji(t)) === $ || t === -$ ? 1.7976931348623157e308 * (0 > t ? -1 : 1) : t === t ? t : 0 : 0 === t ? t : 0;
									}function bi(t) {
										var e = (t = mi(t)) % 1;return t === t ? e ? t - e : t : 0;
									}function wi(t) {
										return t ? de(bi(t), 0, 4294967295) : 0;
									}function ji(t) {
										if ("number" == typeof t) return t;if (yi(t)) return q;if (hi(t) && (t = "function" == typeof t.valueOf ? t.valueOf() : t, t = hi(t) ? t + "" : t), "string" != typeof t) return 0 === t ? t : +t;t = t.replace(lt, "");var e = wt.test(t);return e || xt.test(t) ? Vt(t.slice(2), e ? 2 : 8) : bt.test(t) ? q : +t;
									}function xi(t) {
										return Pn(t, Ti(t));
									}function Ei(t) {
										return null == t ? "" : dn(t);
									}function Ci(t, e, n) {
										return (t = null == t ? W : Te(t, e)) === W ? n : t;
									}function ki(t, e) {
										return null != t && mr(t, e, Pe);
									}function Fi(t) {
										return ui(t) ? qt(t) : ze(t);
									}function Ti(t) {
										if (ui(t)) t = qt(t, !0);else if (hi(t)) {
											var e,
											    n = Tr(t),
											    r = [];for (e in t) {
												("constructor" != e || !n && eo.call(t, e)) && r.push(e);
											}t = r;
										} else {
											if (e = [], null != t) for (n in Qi(t)) {
												e.push(n);
											}t = e;
										}return t;
									}function Ai(t, e) {
										if (null == t) return {};var n = p(hr(t), function (t) {
											return [t];
										});return e = dr(e), Ke(t, n, function (t, n) {
											return e(t, n[0]);
										});
									}function Si(t) {
										return null == t ? [] : R(t, Fi(t));
									}function Oi(t) {
										return La(Ei(t).toLowerCase());
									}function Ri(t) {
										return (t = Ei(t)) && t.replace(Ct, ne).replace(St, "");
									}function Pi(t, e, n) {
										return t = Ei(t), (e = n ? W : e) === W ? Lt.test(t) ? t.match(Rt) || [] : t.match(vt) || [] : t.match(e) || [];
									}function Li(t) {
										return function () {
											return t;
										};
									}function Ii(t) {
										return t;
									}function Di(t) {
										return Ve("function" == typeof t ? t : ve(t, 1));
									}function Ui(t, e, n) {
										var r = Fi(e),
										    i = Fe(e, r);null != n || hi(e) && (i.length || !r.length) || (n = e, e = t, t = this, i = Fe(e, Fi(e)));var o = !(hi(n) && "chain" in n && !n.chain),
										    u = si(t);return a(i, function (n) {
											var r = e[n];t[n] = r, u && (t.prototype[n] = function () {
												var e = this.__chain__;if (o || e) {
													var n = t(this.__wrapped__);return (n.__actions__ = Rn(this.__actions__)).push({ func: r, args: arguments, thisArg: t }), n.__chain__ = e, n;
												}return r.apply(t, _([this.value()], arguments));
											});
										}), t;
									}function Bi() {}function Ni(t) {
										return kr(t) ? E(Lr(t)) : Je(t);
									}function Mi() {
										return [];
									}function Vi() {
										return !1;
									}var zi = (e = null == e ? Wt : oe.defaults(Wt.Object(), e, oe.pick(Wt, It))).Array,
									    Hi = e.Date,
									    Wi = e.Error,
									    $i = e.Function,
									    qi = e.Math,
									    Qi = e.Object,
									    Gi = e.RegExp,
									    Zi = e.String,
									    Xi = e.TypeError,
									    Ki = zi.prototype,
									    Ji = Qi.prototype,
									    Yi = e["__core-js_shared__"],
									    to = $i.prototype.toString,
									    eo = Ji.hasOwnProperty,
									    no = 0,
									    ro = function () {
										var t = /[^.]+$/.exec(Yi && Yi.keys && Yi.keys.IE_PROTO || "");return t ? "Symbol(src)_1." + t : "";
									}(),
									    io = Ji.toString,
									    oo = to.call(Qi),
									    uo = Wt._,
									    ao = Gi("^" + to.call(eo).replace(ct, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"),
									    co = Qt ? e.Buffer : W,
									    so = e.Symbol,
									    lo = e.Uint8Array,
									    fo = co ? co.f : W,
									    ho = B(Qi.getPrototypeOf, Qi),
									    po = Qi.create,
									    _o = Ji.propertyIsEnumerable,
									    vo = Ki.splice,
									    yo = so ? so.isConcatSpreadable : W,
									    go = so ? so.iterator : W,
									    mo = so ? so.toStringTag : W,
									    bo = function () {
										try {
											var t = gr(Qi, "defineProperty");return t({}, "", {}), t;
										} catch (t) {}
									}(),
									    wo = e.clearTimeout !== Wt.clearTimeout && e.clearTimeout,
									    jo = Hi && Hi.now !== Wt.Date.now && Hi.now,
									    xo = e.setTimeout !== Wt.setTimeout && e.setTimeout,
									    Eo = qi.ceil,
									    Co = qi.floor,
									    ko = Qi.getOwnPropertySymbols,
									    Fo = co ? co.isBuffer : W,
									    To = e.isFinite,
									    Ao = Ki.join,
									    So = B(Qi.keys, Qi),
									    Oo = qi.max,
									    Ro = qi.min,
									    Po = Hi.now,
									    Lo = e.parseInt,
									    Io = qi.random,
									    Do = Ki.reverse,
									    Uo = gr(e, "DataView"),
									    Bo = gr(e, "Map"),
									    No = gr(e, "Promise"),
									    Mo = gr(e, "Set"),
									    Vo = gr(e, "WeakMap"),
									    zo = gr(Qi, "create"),
									    Ho = Vo && new Vo(),
									    Wo = {},
									    $o = Ir(Uo),
									    qo = Ir(Bo),
									    Qo = Ir(No),
									    Go = Ir(Mo),
									    Zo = Ir(Vo),
									    Xo = so ? so.prototype : W,
									    Ko = Xo ? Xo.valueOf : W,
									    Jo = Xo ? Xo.toString : W,
									    Yo = function () {
										function t() {}return function (e) {
											return hi(e) ? po ? po(e) : (t.prototype = e, e = new t(), t.prototype = W, e) : {};
										};
									}();n.templateSettings = { escape: et, evaluate: nt, interpolate: rt, variable: "", imports: { _: n } }, n.prototype = C.prototype, n.prototype.constructor = n, Tt.prototype = Yo(C.prototype), Tt.prototype.constructor = Tt, Ot.prototype = Yo(C.prototype), Ot.prototype.constructor = Ot, Bt.prototype.clear = function () {
										this.__data__ = zo ? zo(null) : {}, this.size = 0;
									}, Bt.prototype.delete = function (t) {
										return t = this.has(t) && delete this.__data__[t], this.size -= t ? 1 : 0, t;
									}, Bt.prototype.get = function (t) {
										var e = this.__data__;return zo ? "__lodash_hash_undefined__" === (t = e[t]) ? W : t : eo.call(e, t) ? e[t] : W;
									}, Bt.prototype.has = function (t) {
										var e = this.__data__;return zo ? e[t] !== W : eo.call(e, t);
									}, Bt.prototype.set = function (t, e) {
										var n = this.__data__;return this.size += this.has(t) ? 0 : 1, n[t] = zo && e === W ? "__lodash_hash_undefined__" : e, this;
									}, Nt.prototype.clear = function () {
										this.__data__ = [], this.size = 0;
									}, Nt.prototype.delete = function (t) {
										var e = this.__data__;return !(0 > (t = se(e, t)) || (t == e.length - 1 ? e.pop() : vo.call(e, t, 1), --this.size, 0));
									}, Nt.prototype.get = function (t) {
										var e = this.__data__;return 0 > (t = se(e, t)) ? W : e[t][1];
									}, Nt.prototype.has = function (t) {
										return -1 < se(this.__data__, t);
									}, Nt.prototype.set = function (t, e) {
										var n = this.__data__,
										    r = se(n, t);return 0 > r ? (++this.size, n.push([t, e])) : n[r][1] = e, this;
									}, zt.prototype.clear = function () {
										this.size = 0, this.__data__ = { hash: new Bt(), map: new (Bo || Nt)(), string: new Bt() };
									}, zt.prototype.delete = function (t) {
										return t = vr(this, t).delete(t), this.size -= t ? 1 : 0, t;
									}, zt.prototype.get = function (t) {
										return vr(this, t).get(t);
									}, zt.prototype.has = function (t) {
										return vr(this, t).has(t);
									}, zt.prototype.set = function (t, e) {
										var n = vr(this, t),
										    r = n.size;return n.set(t, e), this.size += n.size == r ? 0 : 1, this;
									}, Ht.prototype.add = Ht.prototype.push = function (t) {
										return this.__data__.set(t, "__lodash_hash_undefined__"), this;
									}, Ht.prototype.has = function (t) {
										return this.__data__.has(t);
									}, $t.prototype.clear = function () {
										this.__data__ = new Nt(), this.size = 0;
									}, $t.prototype.delete = function (t) {
										var e = this.__data__;return t = e.delete(t), this.size = e.size, t;
									}, $t.prototype.get = function (t) {
										return this.__data__.get(t);
									}, $t.prototype.has = function (t) {
										return this.__data__.has(t);
									}, $t.prototype.set = function (t, e) {
										var n = this.__data__;if (n instanceof Nt) {
											var r = n.__data__;if (!Bo || 199 > r.length) return r.push([t, e]), this.size = ++n.size, this;n = this.__data__ = new zt(r);
										}return n.set(t, e), this.size = n.size, this;
									};var tu = Bn(Ce),
									    eu = Bn(ke, !0),
									    nu = Nn(),
									    ru = Nn(!0),
									    iu = Ho ? function (t, e) {
										return Ho.set(t, e), t;
									} : Ii,
									    ou = bo ? function (t, e) {
										return bo(t, "toString", { configurable: !0, enumerable: !1, value: Li(e), writable: !0 });
									} : Ii,
									    uu = wo || function (t) {
										return Wt.clearTimeout(t);
									},
									    au = Mo && 1 / M(new Mo([, -0]))[1] == $ ? function (t) {
										return new Mo(t);
									} : Bi,
									    cu = Ho ? function (t) {
										return Ho.get(t);
									} : Bi,
									    su = ko ? function (t) {
										return null == t ? [] : (t = Qi(t), l(ko(t), function (e) {
											return _o.call(t, e);
										}));
									} : Mi,
									    lu = ko ? function (t) {
										for (var e = []; t;) {
											_(e, su(t)), t = ho(t);
										}return e;
									} : Mi,
									    fu = Se;(Uo && "[object DataView]" != fu(new Uo(new ArrayBuffer(1))) || Bo && "[object Map]" != fu(new Bo()) || No && "[object Promise]" != fu(No.resolve()) || Mo && "[object Set]" != fu(new Mo()) || Vo && "[object WeakMap]" != fu(new Vo())) && (fu = function fu(t) {
										var e = Se(t);if (t = (t = "[object Object]" == e ? t.constructor : W) ? Ir(t) : "") switch (t) {case $o:
												return "[object DataView]";case qo:
												return "[object Map]";case Qo:
												return "[object Promise]";case Go:
												return "[object Set]";case Zo:
												return "[object WeakMap]";}return e;
									});var hu = Yi ? si : Vi,
									    pu = Rr(iu),
									    _u = xo || function (t, e) {
										return Wt.setTimeout(t, e);
									},
									    du = Rr(ou),
									    vu = function (t) {
										var e = (t = ri(t, function (t) {
											return 500 === e.size && e.clear(), t;
										})).cache;return t;
									}(function (t) {
										var e = [];return ut.test(t) && e.push(""), t.replace(at, function (t, n, r, i) {
											e.push(r ? i.replace(yt, "$1") : n || t);
										}), e;
									}),
									    yu = rn(function (t, e) {
										return ai(t) ? be(t, Ee(e, 1, ai, !0)) : [];
									}),
									    gu = rn(function (t, e) {
										var n = zr(e);return ai(n) && (n = W), ai(t) ? be(t, Ee(e, 1, ai, !0), dr(n, 2)) : [];
									}),
									    mu = rn(function (t, e) {
										var n = zr(e);return ai(n) && (n = W), ai(t) ? be(t, Ee(e, 1, ai, !0), W, n) : [];
									}),
									    bu = rn(function (t) {
										var e = p(t, jn);return e.length && e[0] === t[0] ? Le(e) : [];
									}),
									    wu = rn(function (t) {
										var e = zr(t),
										    n = p(t, jn);return e === zr(n) ? e = W : n.pop(), n.length && n[0] === t[0] ? Le(n, dr(e, 2)) : [];
									}),
									    ju = rn(function (t) {
										var e = zr(t),
										    n = p(t, jn);return (e = "function" == typeof e ? e : W) && n.pop(), n.length && n[0] === t[0] ? Le(n, W, e) : [];
									}),
									    xu = rn(Hr),
									    Eu = lr(function (t, e) {
										var n = null == t ? 0 : t.length,
										    r = _e(t, e);return tn(t, p(e, function (t) {
											return Er(t, n) ? +t : t;
										}).sort(An)), r;
									}),
									    Cu = rn(function (t) {
										return vn(Ee(t, 1, ai, !0));
									}),
									    ku = rn(function (t) {
										var e = zr(t);return ai(e) && (e = W), vn(Ee(t, 1, ai, !0), dr(e, 2));
									}),
									    Fu = rn(function (t) {
										var e = "function" == typeof (e = zr(t)) ? e : W;return vn(Ee(t, 1, ai, !0), W, e);
									}),
									    Tu = rn(function (t, e) {
										return ai(t) ? be(t, e) : [];
									}),
									    Au = rn(function (t) {
										return bn(l(t, ai));
									}),
									    Su = rn(function (t) {
										var e = zr(t);return ai(e) && (e = W), bn(l(t, ai), dr(e, 2));
									}),
									    Ou = rn(function (t) {
										var e = "function" == typeof (e = zr(t)) ? e : W;return bn(l(t, ai), W, e);
									}),
									    Ru = rn($r),
									    Pu = rn(function (t) {
										var e = t.length;return qr(t, e = "function" == typeof (e = 1 < e ? t[e - 1] : W) ? (t.pop(), e) : W);
									}),
									    Lu = lr(function (t) {
										function e(e) {
											return _e(e, t);
										}var n = t.length,
										    r = n ? t[0] : 0,
										    i = this.__wrapped__;return !(1 < n || this.__actions__.length) && i instanceof Ot && Er(r) ? ((i = i.slice(r, +r + (n ? 1 : 0))).__actions__.push({ func: Gr, args: [e], thisArg: W }), new Tt(i, this.__chain__).thru(function (t) {
											return n && !t.length && t.push(W), t;
										})) : this.thru(e);
									}),
									    Iu = Dn(function (t, e, n) {
										eo.call(t, n) ? ++t[n] : pe(t, n, 1);
									}),
									    Du = $n(Br),
									    Uu = $n(Nr),
									    Bu = Dn(function (t, e, n) {
										eo.call(t, n) ? t[n].push(e) : pe(t, n, [e]);
									}),
									    Nu = rn(function (t, e, n) {
										var r = -1,
										    i = "function" == typeof e,
										    u = ui(t) ? zi(t.length) : [];return tu(t, function (t) {
											u[++r] = i ? o(e, t, n) : De(t, e, n);
										}), u;
									}),
									    Mu = Dn(function (t, e, n) {
										pe(t, n, e);
									}),
									    Vu = Dn(function (t, e, n) {
										t[n ? 0 : 1].push(e);
									}, function () {
										return [[], []];
									}),
									    zu = rn(function (t, e) {
										if (null == t) return [];var n = e.length;return 1 < n && Cr(t, e[0], e[1]) ? e = [] : 2 < n && Cr(e[0], e[1], e[2]) && (e = [e[0]]), Ze(t, Ee(e, 1), []);
									}),
									    Hu = jo || function () {
										return Wt.Date.now();
									},
									    Wu = rn(function (t, e, n) {
										i = 1;if (n.length) var r = N(n, _r(Wu)),
										    i = 32 | i;return ir(t, i, e, n, r);
									}),
									    $u = rn(function (t, e, n) {
										i = 3;if (n.length) var r = N(n, _r($u)),
										    i = 32 | i;return ir(e, i, t, n, r);
									}),
									    qu = rn(function (t, e) {
										return me(t, 1, e);
									}),
									    Qu = rn(function (t, e, n) {
										return me(t, ji(e) || 0, n);
									});ri.Cache = zt;var Gu = rn(function (t, e) {
										var n = (e = 1 == e.length && ea(e[0]) ? p(e[0], O(dr())) : p(Ee(e, 1), O(dr()))).length;return rn(function (r) {
											for (var i = -1, u = Ro(r.length, n); ++i < u;) {
												r[i] = e[i].call(this, r[i]);
											}return o(t, this, r);
										});
									}),
									    Zu = rn(function (t, e) {
										return ir(t, 32, W, e, N(e, _r(Zu)));
									}),
									    Xu = rn(function (t, e) {
										return ir(t, 64, W, e, N(e, _r(Xu)));
									}),
									    Ku = lr(function (t, e) {
										return ir(t, 256, W, W, W, e);
									}),
									    Ju = tr(Oe),
									    Yu = tr(function (t, e) {
										return t >= e;
									}),
									    ta = Ue(function () {
										return arguments;
									}()) ? Ue : function (t) {
										return pi(t) && eo.call(t, "callee") && !_o.call(t, "callee");
									},
									    ea = zi.isArray,
									    na = Zt ? O(Zt) : function (t) {
										return pi(t) && "[object ArrayBuffer]" == Se(t);
									},
									    ra = Fo || Vi,
									    ia = Xt ? O(Xt) : function (t) {
										return pi(t) && "[object Date]" == Se(t);
									},
									    oa = Kt ? O(Kt) : function (t) {
										return pi(t) && "[object Map]" == fu(t);
									},
									    ua = Jt ? O(Jt) : function (t) {
										return pi(t) && "[object RegExp]" == Se(t);
									},
									    aa = Yt ? O(Yt) : function (t) {
										return pi(t) && "[object Set]" == fu(t);
									},
									    ca = te ? O(te) : function (t) {
										return pi(t) && fi(t.length) && !!Dt[Se(t)];
									},
									    sa = tr(He),
									    la = tr(function (t, e) {
										return t <= e;
									}),
									    fa = Un(function (t, e) {
										if (Tr(e) || ui(e)) Pn(e, Fi(e), t);else for (var n in e) {
											eo.call(e, n) && ce(t, n, e[n]);
										}
									}),
									    ha = Un(function (t, e) {
										Pn(e, Ti(e), t);
									}),
									    pa = Un(function (t, e, n, r) {
										Pn(e, Ti(e), t, r);
									}),
									    _a = Un(function (t, e, n, r) {
										Pn(e, Fi(e), t, r);
									}),
									    da = lr(_e),
									    va = rn(function (t) {
										return t.push(W, or), o(pa, W, t);
									}),
									    ya = rn(function (t) {
										return t.push(W, ur), o(ja, W, t);
									}),
									    ga = Gn(function (t, e, n) {
										t[e] = n;
									}, Li(Ii)),
									    ma = Gn(function (t, e, n) {
										eo.call(t, e) ? t[e].push(n) : t[e] = [n];
									}, dr),
									    ba = rn(De),
									    wa = Un(function (t, e, n) {
										Qe(t, e, n);
									}),
									    ja = Un(function (t, e, n, r) {
										Qe(t, e, n, r);
									}),
									    xa = lr(function (t, e) {
										var n = {};if (null == t) return n;var r = !1;e = p(e, function (e) {
											return e = En(e, t), r || (r = 1 < e.length), e;
										}), Pn(t, hr(t), n), r && (n = ve(n, 7, ar));for (var i = e.length; i--;) {
											yn(n, e[i]);
										}return n;
									}),
									    Ea = lr(function (t, e) {
										return null == t ? {} : Xe(t, e);
									}),
									    Ca = rr(Fi),
									    ka = rr(Ti),
									    Fa = zn(function (t, e, n) {
										return e = e.toLowerCase(), t + (n ? Oi(e) : e);
									}),
									    Ta = zn(function (t, e, n) {
										return t + (n ? "-" : "") + e.toLowerCase();
									}),
									    Aa = zn(function (t, e, n) {
										return t + (n ? " " : "") + e.toLowerCase();
									}),
									    Sa = Vn("toLowerCase"),
									    Oa = zn(function (t, e, n) {
										return t + (n ? "_" : "") + e.toLowerCase();
									}),
									    Ra = zn(function (t, e, n) {
										return t + (n ? " " : "") + La(e);
									}),
									    Pa = zn(function (t, e, n) {
										return t + (n ? " " : "") + e.toUpperCase();
									}),
									    La = Vn("toUpperCase"),
									    Ia = rn(function (t, e) {
										try {
											return o(t, W, e);
										} catch (t) {
											return ci(t) ? t : new Wi(t);
										}
									}),
									    Da = lr(function (t, e) {
										return a(e, function (e) {
											e = Lr(e), pe(t, e, Wu(t[e], t));
										}), t;
									}),
									    Ua = qn(),
									    Ba = qn(!0),
									    Na = rn(function (t, e) {
										return function (n) {
											return De(n, t, e);
										};
									}),
									    Ma = rn(function (t, e) {
										return function (n) {
											return De(t, n, e);
										};
									}),
									    Va = Xn(p),
									    za = Xn(s),
									    Ha = Xn(y),
									    Wa = Yn(),
									    $a = Yn(!0),
									    qa = Zn(function (t, e) {
										return t + e;
									}, 0),
									    Qa = nr("ceil"),
									    Ga = Zn(function (t, e) {
										return t / e;
									}, 1),
									    Za = nr("floor"),
									    Xa = Zn(function (t, e) {
										return t * e;
									}, 1),
									    Ka = nr("round"),
									    Ja = Zn(function (t, e) {
										return t - e;
									}, 0);return n.after = function (t, e) {
										if ("function" != typeof e) throw new Xi("Expected a function");return t = bi(t), function () {
											if (1 > --t) return e.apply(this, arguments);
										};
									}, n.ary = Jr, n.assign = fa, n.assignIn = ha, n.assignInWith = pa, n.assignWith = _a, n.at = da, n.before = Yr, n.bind = Wu, n.bindAll = Da, n.bindKey = $u, n.castArray = function () {
										if (!arguments.length) return [];var t = arguments[0];return ea(t) ? t : [t];
									}, n.chain = Qr, n.chunk = function (t, e, n) {
										if (e = (n ? Cr(t, e, n) : e === W) ? 1 : Oo(bi(e), 0), !(n = null == t ? 0 : t.length) || 1 > e) return [];for (var r = 0, i = 0, o = zi(Eo(n / e)); r < n;) {
											o[i++] = sn(t, r, r += e);
										}return o;
									}, n.compact = function (t) {
										for (var e = -1, n = null == t ? 0 : t.length, r = 0, i = []; ++e < n;) {
											var o = t[e];o && (i[r++] = o);
										}return i;
									}, n.concat = function () {
										var t = arguments.length;if (!t) return [];for (var e = zi(t - 1), n = arguments[0]; t--;) {
											e[t - 1] = arguments[t];
										}return _(ea(n) ? Rn(n) : [n], Ee(e, 1));
									}, n.cond = function (t) {
										var e = null == t ? 0 : t.length,
										    n = dr();return t = e ? p(t, function (t) {
											if ("function" != typeof t[1]) throw new Xi("Expected a function");return [n(t[0]), t[1]];
										}) : [], rn(function (n) {
											for (var r = -1; ++r < e;) {
												var i = t[r];if (o(i[0], this, n)) return o(i[1], this, n);
											}
										});
									}, n.conforms = function (t) {
										return ye(ve(t, 1));
									}, n.constant = Li, n.countBy = Iu, n.create = function (t, e) {
										var n = Yo(t);return null == e ? n : fe(n, e);
									}, n.curry = ti, n.curryRight = ei, n.debounce = ni, n.defaults = va, n.defaultsDeep = ya, n.defer = qu, n.delay = Qu, n.difference = yu, n.differenceBy = gu, n.differenceWith = mu, n.drop = function (t, e, n) {
										var r = null == t ? 0 : t.length;return r ? (e = n || e === W ? 1 : bi(e), sn(t, 0 > e ? 0 : e, r)) : [];
									}, n.dropRight = function (t, e, n) {
										var r = null == t ? 0 : t.length;return r ? (e = n || e === W ? 1 : bi(e), e = r - e, sn(t, 0, 0 > e ? 0 : e)) : [];
									}, n.dropRightWhile = function (t, e) {
										return t && t.length ? gn(t, dr(e, 3), !0, !0) : [];
									}, n.dropWhile = function (t, e) {
										return t && t.length ? gn(t, dr(e, 3), !0) : [];
									}, n.fill = function (t, e, n, r) {
										var i = null == t ? 0 : t.length;if (!i) return [];for (n && "number" != typeof n && Cr(t, e, n) && (n = 0, r = i), i = t.length, 0 > (n = bi(n)) && (n = -n > i ? 0 : i + n), 0 > (r = r === W || r > i ? i : bi(r)) && (r += i), r = n > r ? 0 : wi(r); n < r;) {
											t[n++] = e;
										}return t;
									}, n.filter = function (t, e) {
										return (ea(t) ? l : xe)(t, dr(e, 3));
									}, n.flatMap = function (t, e) {
										return Ee(Kr(t, e), 1);
									}, n.flatMapDeep = function (t, e) {
										return Ee(Kr(t, e), $);
									}, n.flatMapDepth = function (t, e, n) {
										return n = n === W ? 1 : bi(n), Ee(Kr(t, e), n);
									}, n.flatten = Mr, n.flattenDeep = function (t) {
										return (null == t ? 0 : t.length) ? Ee(t, $) : [];
									}, n.flattenDepth = function (t, e) {
										return null != t && t.length ? (e = e === W ? 1 : bi(e), Ee(t, e)) : [];
									}, n.flip = function (t) {
										return ir(t, 512);
									}, n.flow = Ua, n.flowRight = Ba, n.fromPairs = function (t) {
										for (var e = -1, n = null == t ? 0 : t.length, r = {}; ++e < n;) {
											var i = t[e];r[i[0]] = i[1];
										}return r;
									}, n.functions = function (t) {
										return null == t ? [] : Fe(t, Fi(t));
									}, n.functionsIn = function (t) {
										return null == t ? [] : Fe(t, Ti(t));
									}, n.groupBy = Bu, n.initial = function (t) {
										return (null == t ? 0 : t.length) ? sn(t, 0, -1) : [];
									}, n.intersection = bu, n.intersectionBy = wu, n.intersectionWith = ju, n.invert = ga, n.invertBy = ma, n.invokeMap = Nu, n.iteratee = Di, n.keyBy = Mu, n.keys = Fi, n.keysIn = Ti, n.map = Kr, n.mapKeys = function (t, e) {
										var n = {};return e = dr(e, 3), Ce(t, function (t, r, i) {
											pe(n, e(t, r, i), t);
										}), n;
									}, n.mapValues = function (t, e) {
										var n = {};return e = dr(e, 3), Ce(t, function (t, r, i) {
											pe(n, r, e(t, r, i));
										}), n;
									}, n.matches = function (t) {
										return $e(ve(t, 1));
									}, n.matchesProperty = function (t, e) {
										return qe(t, ve(e, 1));
									}, n.memoize = ri, n.merge = wa, n.mergeWith = ja, n.method = Na, n.methodOf = Ma, n.mixin = Ui, n.negate = ii, n.nthArg = function (t) {
										return t = bi(t), rn(function (e) {
											return Ge(e, t);
										});
									}, n.omit = xa, n.omitBy = function (t, e) {
										return Ai(t, ii(dr(e)));
									}, n.once = function (t) {
										return Yr(2, t);
									}, n.orderBy = function (t, e, n, r) {
										return null == t ? [] : (ea(e) || (e = null == e ? [] : [e]), n = r ? W : n, ea(n) || (n = null == n ? [] : [n]), Ze(t, e, n));
									}, n.over = Va, n.overArgs = Gu, n.overEvery = za, n.overSome = Ha, n.partial = Zu, n.partialRight = Xu, n.partition = Vu, n.pick = Ea, n.pickBy = Ai, n.property = Ni, n.propertyOf = function (t) {
										return function (e) {
											return null == t ? W : Te(t, e);
										};
									}, n.pull = xu, n.pullAll = Hr, n.pullAllBy = function (t, e, n) {
										return t && t.length && e && e.length ? Ye(t, e, dr(n, 2)) : t;
									}, n.pullAllWith = function (t, e, n) {
										return t && t.length && e && e.length ? Ye(t, e, W, n) : t;
									}, n.pullAt = Eu, n.range = Wa, n.rangeRight = $a, n.rearg = Ku, n.reject = function (t, e) {
										return (ea(t) ? l : xe)(t, ii(dr(e, 3)));
									}, n.remove = function (t, e) {
										var n = [];if (!t || !t.length) return n;var r = -1,
										    i = [],
										    o = t.length;for (e = dr(e, 3); ++r < o;) {
											var u = t[r];e(u, r, t) && (n.push(u), i.push(r));
										}return tn(t, i), n;
									}, n.rest = function (t, e) {
										if ("function" != typeof t) throw new Xi("Expected a function");return e = e === W ? e : bi(e), rn(t, e);
									}, n.reverse = Wr, n.sampleSize = function (t, e, n) {
										return e = (n ? Cr(t, e, n) : e === W) ? 1 : bi(e), (ea(t) ? ee : un)(t, e);
									}, n.set = function (t, e, n) {
										return null == t ? t : an(t, e, n);
									}, n.setWith = function (t, e, n, r) {
										return r = "function" == typeof r ? r : W, null == t ? t : an(t, e, n, r);
									}, n.shuffle = function (t) {
										return (ea(t) ? ue : cn)(t);
									}, n.slice = function (t, e, n) {
										var r = null == t ? 0 : t.length;return r ? (n && "number" != typeof n && Cr(t, e, n) ? (e = 0, n = r) : (e = null == e ? 0 : bi(e), n = n === W ? r : bi(n)), sn(t, e, n)) : [];
									}, n.sortBy = zu, n.sortedUniq = function (t) {
										return t && t.length ? pn(t) : [];
									}, n.sortedUniqBy = function (t, e) {
										return t && t.length ? pn(t, dr(e, 2)) : [];
									}, n.split = function (t, e, n) {
										return n && "number" != typeof n && Cr(t, e, n) && (e = n = W), (n = n === W ? 4294967295 : n >>> 0) ? (t = Ei(t)) && ("string" == typeof e || null != e && !ua(e)) && !(e = dn(e)) && Pt.test(t) ? Cn(H(t), 0, n) : t.split(e, n) : [];
									}, n.spread = function (t, e) {
										if ("function" != typeof t) throw new Xi("Expected a function");return e = null == e ? 0 : Oo(bi(e), 0), rn(function (n) {
											var r = n[e];return n = Cn(n, 0, e), r && _(n, r), o(t, this, n);
										});
									}, n.tail = function (t) {
										var e = null == t ? 0 : t.length;return e ? sn(t, 1, e) : [];
									}, n.take = function (t, e, n) {
										return t && t.length ? (e = n || e === W ? 1 : bi(e), sn(t, 0, 0 > e ? 0 : e)) : [];
									}, n.takeRight = function (t, e, n) {
										var r = null == t ? 0 : t.length;return r ? (e = n || e === W ? 1 : bi(e), e = r - e, sn(t, 0 > e ? 0 : e, r)) : [];
									}, n.takeRightWhile = function (t, e) {
										return t && t.length ? gn(t, dr(e, 3), !1, !0) : [];
									}, n.takeWhile = function (t, e) {
										return t && t.length ? gn(t, dr(e, 3)) : [];
									}, n.tap = function (t, e) {
										return e(t), t;
									}, n.throttle = function (t, e, n) {
										var r = !0,
										    i = !0;if ("function" != typeof t) throw new Xi("Expected a function");return hi(n) && (r = "leading" in n ? !!n.leading : r, i = "trailing" in n ? !!n.trailing : i), ni(t, e, { leading: r, maxWait: e, trailing: i });
									}, n.thru = Gr, n.toArray = gi, n.toPairs = Ca, n.toPairsIn = ka, n.toPath = function (t) {
										return ea(t) ? p(t, Lr) : yi(t) ? [t] : Rn(vu(Ei(t)));
									}, n.toPlainObject = xi, n.transform = function (t, e, n) {
										var r = ea(t),
										    i = r || ra(t) || ca(t);if (e = dr(e, 4), null == n) {
											var o = t && t.constructor;n = i ? r ? new o() : [] : hi(t) && si(o) ? Yo(ho(t)) : {};
										}return (i ? a : Ce)(t, function (t, r, i) {
											return e(n, t, r, i);
										}), n;
									}, n.unary = function (t) {
										return Jr(t, 1);
									}, n.union = Cu, n.unionBy = ku, n.unionWith = Fu, n.uniq = function (t) {
										return t && t.length ? vn(t) : [];
									}, n.uniqBy = function (t, e) {
										return t && t.length ? vn(t, dr(e, 2)) : [];
									}, n.uniqWith = function (t, e) {
										return e = "function" == typeof e ? e : W, t && t.length ? vn(t, W, e) : [];
									}, n.unset = function (t, e) {
										return null == t || yn(t, e);
									}, n.unzip = $r, n.unzipWith = qr, n.update = function (t, e, n) {
										return null == t ? t : an(t, e, xn(n)(Te(t, e)), void 0);
									}, n.updateWith = function (t, e, n, r) {
										return r = "function" == typeof r ? r : W, null != t && (t = an(t, e, xn(n)(Te(t, e)), r)), t;
									}, n.values = Si, n.valuesIn = function (t) {
										return null == t ? [] : R(t, Ti(t));
									}, n.without = Tu, n.words = Pi, n.wrap = function (t, e) {
										return Zu(xn(e), t);
									}, n.xor = Au, n.xorBy = Su, n.xorWith = Ou, n.zip = Ru, n.zipObject = function (t, e) {
										return wn(t || [], e || [], ce);
									}, n.zipObjectDeep = function (t, e) {
										return wn(t || [], e || [], an);
									}, n.zipWith = Pu, n.entries = Ca, n.entriesIn = ka, n.extend = ha, n.extendWith = pa, Ui(n, n), n.add = qa, n.attempt = Ia, n.camelCase = Fa, n.capitalize = Oi, n.ceil = Qa, n.clamp = function (t, e, n) {
										return n === W && (n = e, e = W), n !== W && (n = ji(n), n = n === n ? n : 0), e !== W && (e = ji(e), e = e === e ? e : 0), de(ji(t), e, n);
									}, n.clone = function (t) {
										return ve(t, 4);
									}, n.cloneDeep = function (t) {
										return ve(t, 5);
									}, n.cloneDeepWith = function (t, e) {
										return e = "function" == typeof e ? e : W, ve(t, 5, e);
									}, n.cloneWith = function (t, e) {
										return e = "function" == typeof e ? e : W, ve(t, 4, e);
									}, n.conformsTo = function (t, e) {
										return null == e || ge(t, e, Fi(e));
									}, n.deburr = Ri, n.defaultTo = function (t, e) {
										return null == t || t !== t ? e : t;
									}, n.divide = Ga, n.endsWith = function (t, e, n) {
										t = Ei(t), e = dn(e);var r = t.length,
										    r = n = n === W ? r : de(bi(n), 0, r);return 0 <= (n -= e.length) && t.slice(n, r) == e;
									}, n.eq = oi, n.escape = function (t) {
										return (t = Ei(t)) && tt.test(t) ? t.replace(J, re) : t;
									}, n.escapeRegExp = function (t) {
										return (t = Ei(t)) && st.test(t) ? t.replace(ct, "\\$&") : t;
									}, n.every = function (t, e, n) {
										var r = ea(t) ? s : we;return n && Cr(t, e, n) && (e = W), r(t, dr(e, 3));
									}, n.find = Du, n.findIndex = Br, n.findKey = function (t, e) {
										return g(t, dr(e, 3), Ce);
									}, n.findLast = Uu, n.findLastIndex = Nr, n.findLastKey = function (t, e) {
										return g(t, dr(e, 3), ke);
									}, n.floor = Za, n.forEach = Zr, n.forEachRight = Xr, n.forIn = function (t, e) {
										return null == t ? t : nu(t, dr(e, 3), Ti);
									}, n.forInRight = function (t, e) {
										return null == t ? t : ru(t, dr(e, 3), Ti);
									}, n.forOwn = function (t, e) {
										return t && Ce(t, dr(e, 3));
									}, n.forOwnRight = function (t, e) {
										return t && ke(t, dr(e, 3));
									}, n.get = Ci, n.gt = Ju, n.gte = Yu, n.has = function (t, e) {
										return null != t && mr(t, e, Re);
									}, n.hasIn = ki, n.head = Vr, n.identity = Ii, n.includes = function (t, e, n, r) {
										return t = ui(t) ? t : Si(t), n = n && !r ? bi(n) : 0, r = t.length, 0 > n && (n = Oo(r + n, 0)), vi(t) ? n <= r && -1 < t.indexOf(e, n) : !!r && -1 < b(t, e, n);
									}, n.indexOf = function (t, e, n) {
										var r = null == t ? 0 : t.length;return r ? (0 > (n = null == n ? 0 : bi(n)) && (n = Oo(r + n, 0)), b(t, e, n)) : -1;
									}, n.inRange = function (t, e, n) {
										return e = mi(e), n === W ? (n = e, e = 0) : n = mi(n), (t = ji(t)) >= Ro(e, n) && t < Oo(e, n);
									}, n.invoke = ba, n.isArguments = ta, n.isArray = ea, n.isArrayBuffer = na, n.isArrayLike = ui, n.isArrayLikeObject = ai, n.isBoolean = function (t) {
										return !0 === t || !1 === t || pi(t) && "[object Boolean]" == Se(t);
									}, n.isBuffer = ra, n.isDate = ia, n.isElement = function (t) {
										return pi(t) && 1 === t.nodeType && !di(t);
									}, n.isEmpty = function (t) {
										if (null == t) return !0;if (ui(t) && (ea(t) || "string" == typeof t || "function" == typeof t.splice || ra(t) || ca(t) || ta(t))) return !t.length;var e = fu(t);if ("[object Map]" == e || "[object Set]" == e) return !t.size;if (Tr(t)) return !ze(t).length;for (var n in t) {
											if (eo.call(t, n)) return !1;
										}return !0;
									}, n.isEqual = function (t, e) {
										return Be(t, e);
									}, n.isEqualWith = function (t, e, n) {
										var r = (n = "function" == typeof n ? n : W) ? n(t, e) : W;return r === W ? Be(t, e, W, n) : !!r;
									}, n.isError = ci, n.isFinite = function (t) {
										return "number" == typeof t && To(t);
									}, n.isFunction = si, n.isInteger = li, n.isLength = fi, n.isMap = oa, n.isMatch = function (t, e) {
										return t === e || Ne(t, e, yr(e));
									}, n.isMatchWith = function (t, e, n) {
										return n = "function" == typeof n ? n : W, Ne(t, e, yr(e), n);
									}, n.isNaN = function (t) {
										return _i(t) && t != +t;
									}, n.isNative = function (t) {
										if (hu(t)) throw new Wi("Unsupported core-js use. Try https://npms.io/search?q=ponyfill.");return Me(t);
									}, n.isNil = function (t) {
										return null == t;
									}, n.isNull = function (t) {
										return null === t;
									}, n.isNumber = _i, n.isObject = hi, n.isObjectLike = pi, n.isPlainObject = di, n.isRegExp = ua, n.isSafeInteger = function (t) {
										return li(t) && -9007199254740991 <= t && 9007199254740991 >= t;
									}, n.isSet = aa, n.isString = vi, n.isSymbol = yi, n.isTypedArray = ca, n.isUndefined = function (t) {
										return t === W;
									}, n.isWeakMap = function (t) {
										return pi(t) && "[object WeakMap]" == fu(t);
									}, n.isWeakSet = function (t) {
										return pi(t) && "[object WeakSet]" == Se(t);
									}, n.join = function (t, e) {
										return null == t ? "" : Ao.call(t, e);
									}, n.kebabCase = Ta, n.last = zr, n.lastIndexOf = function (t, e, n) {
										var r = null == t ? 0 : t.length;if (!r) return -1;var i = r;if (n !== W && (i = bi(n), i = 0 > i ? Oo(r + i, 0) : Ro(i, r - 1)), e === e) {
											for (n = i + 1; n-- && t[n] !== e;) {}t = n;
										} else t = m(t, j, i, !0);return t;
									}, n.lowerCase = Aa, n.lowerFirst = Sa, n.lt = sa, n.lte = la, n.max = function (t) {
										return t && t.length ? je(t, Ii, Oe) : W;
									}, n.maxBy = function (t, e) {
										return t && t.length ? je(t, dr(e, 2), Oe) : W;
									}, n.mean = function (t) {
										return x(t, Ii);
									}, n.meanBy = function (t, e) {
										return x(t, dr(e, 2));
									}, n.min = function (t) {
										return t && t.length ? je(t, Ii, He) : W;
									}, n.minBy = function (t, e) {
										return t && t.length ? je(t, dr(e, 2), He) : W;
									}, n.stubArray = Mi, n.stubFalse = Vi, n.stubObject = function () {
										return {};
									}, n.stubString = function () {
										return "";
									}, n.stubTrue = function () {
										return !0;
									}, n.multiply = Xa, n.nth = function (t, e) {
										return t && t.length ? Ge(t, bi(e)) : W;
									}, n.noConflict = function () {
										return Wt._ === this && (Wt._ = uo), this;
									}, n.noop = Bi, n.now = Hu, n.pad = function (t, e, n) {
										t = Ei(t);var r = (e = bi(e)) ? z(t) : 0;return !e || r >= e ? t : (e = (e - r) / 2, Kn(Co(e), n) + t + Kn(Eo(e), n));
									}, n.padEnd = function (t, e, n) {
										t = Ei(t);var r = (e = bi(e)) ? z(t) : 0;return e && r < e ? t + Kn(e - r, n) : t;
									}, n.padStart = function (t, e, n) {
										t = Ei(t);var r = (e = bi(e)) ? z(t) : 0;return e && r < e ? Kn(e - r, n) + t : t;
									}, n.parseInt = function (t, e, n) {
										return n || null == e ? e = 0 : e && (e = +e), Lo(Ei(t).replace(ft, ""), e || 0);
									}, n.random = function (t, e, n) {
										if (n && "boolean" != typeof n && Cr(t, e, n) && (e = n = W), n === W && ("boolean" == typeof e ? (n = e, e = W) : "boolean" == typeof t && (n = t, t = W)), t === W && e === W ? (t = 0, e = 1) : (t = mi(t), e === W ? (e = t, t = 0) : e = mi(e)), t > e) {
											var r = t;t = e, e = r;
										}return n || t % 1 || e % 1 ? (n = Io(), Ro(t + n * (e - t + Mt("1e-" + ((n + "").length - 1))), e)) : en(t, e);
									}, n.reduce = function (t, e, n) {
										var r = ea(t) ? d : k,
										    i = 3 > arguments.length;return r(t, dr(e, 4), n, i, tu);
									}, n.reduceRight = function (t, e, n) {
										var r = ea(t) ? v : k,
										    i = 3 > arguments.length;return r(t, dr(e, 4), n, i, eu);
									}, n.repeat = function (t, e, n) {
										return e = (n ? Cr(t, e, n) : e === W) ? 1 : bi(e), nn(Ei(t), e);
									}, n.replace = function () {
										var t = arguments,
										    e = Ei(t[0]);return 3 > t.length ? e : e.replace(t[1], t[2]);
									}, n.result = function (t, e, n) {
										var r = -1,
										    i = (e = En(e, t)).length;for (i || (i = 1, t = W); ++r < i;) {
											var o = null == t ? W : t[Lr(e[r])];o === W && (r = i, o = n), t = si(o) ? o.call(t) : o;
										}return t;
									}, n.round = Ka, n.runInContext = t, n.sample = function (t) {
										return (ea(t) ? Gt : on)(t);
									}, n.size = function (t) {
										if (null == t) return 0;if (ui(t)) return vi(t) ? z(t) : t.length;var e = fu(t);return "[object Map]" == e || "[object Set]" == e ? t.size : ze(t).length;
									}, n.snakeCase = Oa, n.some = function (t, e, n) {
										var r = ea(t) ? y : ln;return n && Cr(t, e, n) && (e = W), r(t, dr(e, 3));
									}, n.sortedIndex = function (t, e) {
										return fn(t, e);
									}, n.sortedIndexBy = function (t, e, n) {
										return hn(t, e, dr(n, 2));
									}, n.sortedIndexOf = function (t, e) {
										var n = null == t ? 0 : t.length;if (n) {
											var r = fn(t, e);if (r < n && oi(t[r], e)) return r;
										}return -1;
									}, n.sortedLastIndex = function (t, e) {
										return fn(t, e, !0);
									}, n.sortedLastIndexBy = function (t, e, n) {
										return hn(t, e, dr(n, 2), !0);
									}, n.sortedLastIndexOf = function (t, e) {
										if (null == t ? 0 : t.length) {
											var n = fn(t, e, !0) - 1;if (oi(t[n], e)) return n;
										}return -1;
									}, n.startCase = Ra, n.startsWith = function (t, e, n) {
										return t = Ei(t), n = null == n ? 0 : de(bi(n), 0, t.length), e = dn(e), t.slice(n, n + e.length) == e;
									}, n.subtract = Ja, n.sum = function (t) {
										return t && t.length ? T(t, Ii) : 0;
									}, n.sumBy = function (t, e) {
										return t && t.length ? T(t, dr(e, 2)) : 0;
									}, n.template = function (t, e, r) {
										var i = n.templateSettings;r && Cr(t, e, r) && (e = W), t = Ei(t), e = pa({}, e, i, or);var o,
										    u,
										    a = Fi(r = pa({}, e.imports, i.imports, or)),
										    c = R(r, a),
										    s = 0;r = e.interpolate || kt;var l = "__p+='";r = Gi((e.escape || kt).source + "|" + r.source + "|" + (r === rt ? gt : kt).source + "|" + (e.evaluate || kt).source + "|$", "g");var f = "sourceURL" in e ? "//# sourceURL=" + e.sourceURL + "\n" : "";if (t.replace(r, function (e, n, r, i, a, c) {
											return r || (r = i), l += t.slice(s, c).replace(Ft, D), n && (o = !0, l += "'+__e(" + n + ")+'"), a && (u = !0, l += "';" + a + ";\n__p+='"), r && (l += "'+((__t=(" + r + "))==null?'':__t)+'"), s = c + e.length, e;
										}), l += "';", (e = e.variable) || (l = "with(obj){" + l + "}"), l = (u ? l.replace(G, "") : l).replace(Z, "$1").replace(X, "$1;"), l = "function(" + (e || "obj") + "){" + (e ? "" : "obj||(obj={});") + "var __t,__p=''" + (o ? ",__e=_.escape" : "") + (u ? ",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}" : ";") + l + "return __p}", e = Ia(function () {
											return $i(a, f + "return " + l).apply(W, c);
										}), e.source = l, ci(e)) throw e;return e;
									}, n.times = function (t, e) {
										if (1 > (t = bi(t)) || 9007199254740991 < t) return [];var n = 4294967295,
										    r = Ro(t, 4294967295);for (t -= 4294967295, r = A(r, e = dr(e)); ++n < t;) {
											e(n);
										}return r;
									}, n.toFinite = mi, n.toInteger = bi, n.toLength = wi, n.toLower = function (t) {
										return Ei(t).toLowerCase();
									}, n.toNumber = ji, n.toSafeInteger = function (t) {
										return t ? de(bi(t), -9007199254740991, 9007199254740991) : 0 === t ? t : 0;
									}, n.toString = Ei, n.toUpper = function (t) {
										return Ei(t).toUpperCase();
									}, n.trim = function (t, e, n) {
										return (t = Ei(t)) && (n || e === W) ? t.replace(lt, "") : t && (e = dn(e)) ? (t = H(t), n = H(e), e = L(t, n), n = I(t, n) + 1, Cn(t, e, n).join("")) : t;
									}, n.trimEnd = function (t, e, n) {
										return (t = Ei(t)) && (n || e === W) ? t.replace(ht, "") : t && (e = dn(e)) ? (t = H(t), e = I(t, H(e)) + 1, Cn(t, 0, e).join("")) : t;
									}, n.trimStart = function (t, e, n) {
										return (t = Ei(t)) && (n || e === W) ? t.replace(ft, "") : t && (e = dn(e)) ? (t = H(t), e = L(t, H(e)), Cn(t, e).join("")) : t;
									}, n.truncate = function (t, e) {
										var n = 30,
										    r = "...";if (hi(e)) var i = "separator" in e ? e.separator : i,
										    n = "length" in e ? bi(e.length) : n,
										    r = "omission" in e ? dn(e.omission) : r;u = (t = Ei(t)).length;if (Pt.test(t)) var o = H(t),
										    u = o.length;if (n >= u) return t;if (1 > (u = n - z(r))) return r;if (n = o ? Cn(o, 0, u).join("") : t.slice(0, u), i === W) return n + r;if (o && (u += n.length - u), ua(i)) {
											if (t.slice(u).search(i)) {
												var a = n;for (i.global || (i = Gi(i.source, Ei(mt.exec(i)) + "g")), i.lastIndex = 0; o = i.exec(a);) {
													var c = o.index;
												}n = n.slice(0, c === W ? u : c);
											}
										} else t.indexOf(dn(i), u) != u && -1 < (i = n.lastIndexOf(i)) && (n = n.slice(0, i));return n + r;
									}, n.unescape = function (t) {
										return (t = Ei(t)) && Y.test(t) ? t.replace(K, ie) : t;
									}, n.uniqueId = function (t) {
										var e = ++no;return Ei(t) + e;
									}, n.upperCase = Pa, n.upperFirst = La, n.each = Zr, n.eachRight = Xr, n.first = Vr, Ui(n, function () {
										var t = {};return Ce(n, function (e, r) {
											eo.call(n.prototype, r) || (t[r] = e);
										}), t;
									}(), { chain: !1 }), n.VERSION = "4.17.4", a("bind bindKey curry curryRight partial partialRight".split(" "), function (t) {
										n[t].placeholder = n;
									}), a(["drop", "take"], function (t, e) {
										Ot.prototype[t] = function (n) {
											n = n === W ? 1 : Oo(bi(n), 0);var r = this.__filtered__ && !e ? new Ot(this) : this.clone();return r.__filtered__ ? r.__takeCount__ = Ro(n, r.__takeCount__) : r.__views__.push({ size: Ro(n, 4294967295), type: t + (0 > r.__dir__ ? "Right" : "") }), r;
										}, Ot.prototype[t + "Right"] = function (e) {
											return this.reverse()[t](e).reverse();
										};
									}), a(["filter", "map", "takeWhile"], function (t, e) {
										var n = e + 1,
										    r = 1 == n || 3 == n;Ot.prototype[t] = function (t) {
											var e = this.clone();return e.__iteratees__.push({ iteratee: dr(t, 3), type: n }), e.__filtered__ = e.__filtered__ || r, e;
										};
									}), a(["head", "last"], function (t, e) {
										var n = "take" + (e ? "Right" : "");Ot.prototype[t] = function () {
											return this[n](1).value()[0];
										};
									}), a(["initial", "tail"], function (t, e) {
										var n = "drop" + (e ? "" : "Right");Ot.prototype[t] = function () {
											return this.__filtered__ ? new Ot(this) : this[n](1);
										};
									}), Ot.prototype.compact = function () {
										return this.filter(Ii);
									}, Ot.prototype.find = function (t) {
										return this.filter(t).head();
									}, Ot.prototype.findLast = function (t) {
										return this.reverse().find(t);
									}, Ot.prototype.invokeMap = rn(function (t, e) {
										return "function" == typeof t ? new Ot(this) : this.map(function (n) {
											return De(n, t, e);
										});
									}), Ot.prototype.reject = function (t) {
										return this.filter(ii(dr(t)));
									}, Ot.prototype.slice = function (t, e) {
										t = bi(t);var n = this;return n.__filtered__ && (0 < t || 0 > e) ? new Ot(n) : (0 > t ? n = n.takeRight(-t) : t && (n = n.drop(t)), e !== W && (e = bi(e), n = 0 > e ? n.dropRight(-e) : n.take(e - t)), n);
									}, Ot.prototype.takeRightWhile = function (t) {
										return this.reverse().takeWhile(t).reverse();
									}, Ot.prototype.toArray = function () {
										return this.take(4294967295);
									}, Ce(Ot.prototype, function (t, e) {
										var r = /^(?:filter|find|map|reject)|While$/.test(e),
										    i = /^(?:head|last)$/.test(e),
										    o = n[i ? "take" + ("last" == e ? "Right" : "") : e],
										    u = i || /^find/.test(e);o && (n.prototype[e] = function () {
											function e(t) {
												return t = o.apply(n, _([t], c)), i && h ? t[0] : t;
											}var a = this.__wrapped__,
											    c = i ? [1] : arguments,
											    s = a instanceof Ot,
											    l = c[0],
											    f = s || ea(a);f && r && "function" == typeof l && 1 != l.length && (s = f = !1);var h = this.__chain__,
											    p = !!this.__actions__.length,
											    l = u && !h,
											    s = s && !p;return !u && f ? (a = s ? a : new Ot(this), (a = t.apply(a, c)).__actions__.push({ func: Gr, args: [e], thisArg: W }), new Tt(a, h)) : l && s ? t.apply(this, c) : (a = this.thru(e), l ? i ? a.value()[0] : a.value() : a);
										});
									}), a("pop push shift sort splice unshift".split(" "), function (t) {
										var e = Ki[t],
										    r = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru",
										    i = /^(?:pop|shift)$/.test(t);n.prototype[t] = function () {
											var t = arguments;if (i && !this.__chain__) {
												var n = this.value();return e.apply(ea(n) ? n : [], t);
											}return this[r](function (n) {
												return e.apply(ea(n) ? n : [], t);
											});
										};
									}), Ce(Ot.prototype, function (t, e) {
										var r = n[e];if (r) {
											var i = r.name + "";(Wo[i] || (Wo[i] = [])).push({ name: e, func: r });
										}
									}), Wo[Qn(W, 2).name] = [{ name: "wrapper", func: W }], Ot.prototype.clone = function () {
										var t = new Ot(this.__wrapped__);return t.__actions__ = Rn(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = Rn(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = Rn(this.__views__), t;
									}, Ot.prototype.reverse = function () {
										if (this.__filtered__) {
											var t = new Ot(this);t.__dir__ = -1, t.__filtered__ = !0;
										} else t = this.clone(), t.__dir__ *= -1;return t;
									}, Ot.prototype.value = function () {
										var t,
										    e = this.__wrapped__.value(),
										    n = this.__dir__,
										    r = ea(e),
										    i = 0 > n,
										    o = r ? e.length : 0;t = o;for (var u = this.__views__, a = 0, c = -1, s = u.length; ++c < s;) {
											var l = u[c],
											    f = l.size;switch (l.type) {case "drop":
													a += f;break;case "dropRight":
													t -= f;break;case "take":
													t = Ro(t, a + f);break;case "takeRight":
													a = Oo(a, t - f);}
										}if (t = { start: a, end: t }, u = t.start, a = t.end, t = a - u, u = i ? a : u - 1, a = this.__iteratees__, c = a.length, s = 0, l = Ro(t, this.__takeCount__), !r || !i && o == t && l == t) return mn(e, this.__actions__);r = [];t: for (; t-- && s < l;) {
											for (i = -1, o = e[u += n]; ++i < c;) {
												var f = (h = a[i]).type,
												    h = (0, h.iteratee)(o);if (2 == f) o = h;else if (!h) {
													if (1 == f) continue t;break t;
												}
											}r[s++] = o;
										}return r;
									}, n.prototype.at = Lu, n.prototype.chain = function () {
										return Qr(this);
									}, n.prototype.commit = function () {
										return new Tt(this.value(), this.__chain__);
									}, n.prototype.next = function () {
										this.__values__ === W && (this.__values__ = gi(this.value()));var t = this.__index__ >= this.__values__.length;return { done: t, value: t ? W : this.__values__[this.__index__++] };
									}, n.prototype.plant = function (t) {
										for (var e, n = this; n instanceof C;) {
											var r = Ur(n);r.__index__ = 0, r.__values__ = W, e ? i.__wrapped__ = r : e = r;var i = r,
											    n = n.__wrapped__;
										}return i.__wrapped__ = t, e;
									}, n.prototype.reverse = function () {
										var t = this.__wrapped__;return t instanceof Ot ? (this.__actions__.length && (t = new Ot(this)), (t = t.reverse()).__actions__.push({ func: Gr, args: [Wr], thisArg: W }), new Tt(t, this.__chain__)) : this.thru(Wr);
									}, n.prototype.toJSON = n.prototype.valueOf = n.prototype.value = function () {
										return mn(this.__wrapped__, this.__actions__);
									}, n.prototype.first = n.prototype.head, go && (n.prototype[go] = function () {
										return this;
									}), n;
								}();"function" == typeof define && "object" == _typeof2(define.amd) && define.amd ? (Wt._ = oe, define(function () {
									return oe;
								})) : qt ? ((qt.exports = oe)._ = oe, $t._ = oe) : Wt._ = oe;
							}).call(this);
						}).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
					}, {}], 3: [function (t, e, n) {
						function r() {
							throw new Error("setTimeout has not been defined");
						}function i() {
							throw new Error("clearTimeout has not been defined");
						}function o(t) {
							if (f === setTimeout) return setTimeout(t, 0);if ((f === r || !f) && setTimeout) return f = setTimeout, setTimeout(t, 0);try {
								return f(t, 0);
							} catch (e) {
								try {
									return f.call(null, t, 0);
								} catch (e) {
									return f.call(this, t, 0);
								}
							}
						}function u(t) {
							if (h === clearTimeout) return clearTimeout(t);if ((h === i || !h) && clearTimeout) return h = clearTimeout, clearTimeout(t);try {
								return h(t);
							} catch (e) {
								try {
									return h.call(null, t);
								} catch (e) {
									return h.call(this, t);
								}
							}
						}function a() {
							v && _ && (v = !1, _.length ? d = _.concat(d) : y = -1, d.length && c());
						}function c() {
							if (!v) {
								var t = o(a);v = !0;for (var e = d.length; e;) {
									for (_ = d, d = []; ++y < e;) {
										_ && _[y].run();
									}y = -1, e = d.length;
								}_ = null, v = !1, u(t);
							}
						}function s(t, e) {
							this.fun = t, this.array = e;
						}function l() {}var f,
						    h,
						    p = e.exports = {};!function () {
							try {
								f = "function" == typeof setTimeout ? setTimeout : r;
							} catch (t) {
								f = r;
							}try {
								h = "function" == typeof clearTimeout ? clearTimeout : i;
							} catch (t) {
								h = i;
							}
						}();var _,
						    d = [],
						    v = !1,
						    y = -1;p.nextTick = function (t) {
							var e = new Array(arguments.length - 1);if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) {
								e[n - 1] = arguments[n];
							}d.push(new s(t, e)), 1 !== d.length || v || o(c);
						}, s.prototype.run = function () {
							this.fun.apply(null, this.array);
						}, p.title = "browser", p.browser = !0, p.env = {}, p.argv = [], p.version = "", p.versions = {}, p.on = l, p.addListener = l, p.once = l, p.off = l, p.removeListener = l, p.removeAllListeners = l, p.emit = l, p.prependListener = l, p.prependOnceListener = l, p.listeners = function (t) {
							return [];
						}, p.binding = function (t) {
							throw new Error("process.binding is not supported");
						}, p.cwd = function () {
							return "/";
						}, p.chdir = function (t) {
							throw new Error("process.chdir is not supported");
						}, p.umask = function () {
							return 0;
						};
					}, {}], 4: [function (t, e, n) {
						(function (r) {
							function i(t, e) {
								if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
							}function o(t, e) {
								if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e || "object" != (void 0 === e ? "undefined" : _typeof2(e)) && "function" != typeof e ? t : e;
							}function u(t, e) {
								if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + (void 0 === e ? "undefined" : _typeof2(e)));t.prototype = Object.create(e && e.prototype, { constructor: { value: t, enumerable: !1, writable: !0, configurable: !0 } }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e);
							}var a = function () {
								function t(t, e) {
									for (var n = 0; n < e.length; n++) {
										var r = e[n];r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, r.key, r);
									}
								}return function (e, n, r) {
									return n && t(e.prototype, n), r && t(e, r), e;
								};
							}(),
							    c = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function (t) {
								return void 0 === t ? "undefined" : _typeof2(t);
							} : function (t) {
								return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : void 0 === t ? "undefined" : _typeof2(t);
							};!function (t) {
								"object" === (void 0 === n ? "undefined" : c(n)) && void 0 !== e ? e.exports = t() : "function" == typeof define && define.amd ? define([], t) : ("undefined" != typeof window ? window : void 0 !== r ? r : "undefined" != typeof self ? self : this).SequentialEvent = t();
							}(function () {
								return function e(n, r, i) {
									function o(a, c) {
										if (!r[a]) {
											if (!n[a]) {
												var s = "function" == typeof t && t;if (!c && s) return s(a, !0);if (u) return u(a, !0);var l = new Error("Cannot find module '" + a + "'");throw l.code = "MODULE_NOT_FOUND", l;
											}var f = r[a] = { exports: {} };n[a][0].call(f.exports, function (t) {
												return o(n[a][1][t] || t);
											}, f, f.exports, e, n, r, i);
										}return r[a].exports;
									}for (var u = "function" == typeof t && t, a = 0; a < i.length; a++) {
										o(i[a]);
									}return o;
								}({ 1: [function (t, e, n) {
										(function (n) {
											function r(t, e, n) {
												if ("function" == typeof t) return s(t, e, n);var r = 0,
												    i = t.length;return new Promise(function (o, u) {
													function a(c) {
														if (!(r < i)) return o.call(null, c);var l = void 0 !== c ? n.concat([c]) : n.slice(0);s(t[r], e, l).then(a).catch(u), r++;
													}a();
												});
											}function s(t, e, n) {
												try {
													var r = t.apply(e, n);return "object" === (void 0 === r ? "undefined" : c(r)) && "function" == typeof r.then ? r : Promise.resolve(r);
												} catch (t) {
													return Promise.reject(t);
												}
											}var l = t("events").EventEmitter,
											    f = function (t) {
												function e() {
													return i(this, e), o(this, (e.__proto__ || Object.getPrototypeOf(e)).call(this));
												}return u(e, l), a(e, [{ key: "emit", value: function value(t) {
														for (var e = arguments.length, i = Array(e > 1 ? e - 1 : 0), o = 1; o < e; o++) {
															i[o - 1] = arguments[o];
														}var u = !1,
														    a = "error" === t,
														    s = this._events;if (s) a = a && null == s.error;else if (!a) return !1;var l = this.domain;if (a) {
															var f = void 0;if (arguments.length > 1 && (f = arguments[1]), !l) {
																if (f instanceof Error) throw f;var h = new Error('Unhandled "error" event. (' + f + ")");throw h.context = f, h;
															}return f || (f = new Error('Unhandled "error" event')), "object" === (void 0 === f ? "undefined" : c(f)) && null !== f && (f.domainEmitter = this, f.domain = l, f.domainThrown = !1), l.emit("error", f), !1;
														}var p = s[t];if (!p) return Promise.resolve();void 0 !== n && l && this !== n && (l.enter(), u = !0);var _ = r(p, this, i);return u && l.exit(), _;
													} }]), e;
											}();e.exports = f;
										}).call(this, t("_process"));
									}, { _process: 3, events: 2 }], 2: [function (t, e, n) {
										function r() {
											this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0;
										}function i(t) {
											return "function" == typeof t;
										}function o(t) {
											return "number" == typeof t;
										}function u(t) {
											return "object" === (void 0 === t ? "undefined" : c(t)) && null !== t;
										}function a(t) {
											return void 0 === t;
										}e.exports = r, r.EventEmitter = r, r.prototype._events = void 0, r.prototype._maxListeners = void 0, r.defaultMaxListeners = 10, r.prototype.setMaxListeners = function (t) {
											if (!o(t) || t < 0 || isNaN(t)) throw TypeError("n must be a positive number");return this._maxListeners = t, this;
										}, r.prototype.emit = function (t) {
											var e, n, r, o, c, s;if (this._events || (this._events = {}), "error" === t && (!this._events.error || u(this._events.error) && !this._events.error.length)) {
												if ((e = arguments[1]) instanceof Error) throw e;var l = new Error('Uncaught, unspecified "error" event. (' + e + ")");throw l.context = e, l;
											}if (n = this._events[t], a(n)) return !1;if (i(n)) switch (arguments.length) {case 1:
													n.call(this);break;case 2:
													n.call(this, arguments[1]);break;case 3:
													n.call(this, arguments[1], arguments[2]);break;default:
													o = Array.prototype.slice.call(arguments, 1), n.apply(this, o);} else if (u(n)) for (o = Array.prototype.slice.call(arguments, 1), r = (s = n.slice()).length, c = 0; c < r; c++) {
												s[c].apply(this, o);
											}return !0;
										}, r.prototype.addListener = function (t, e) {
											var n;if (!i(e)) throw TypeError("listener must be a function");return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", t, i(e.listener) ? e.listener : e), this._events[t] ? u(this._events[t]) ? this._events[t].push(e) : this._events[t] = [this._events[t], e] : this._events[t] = e, u(this._events[t]) && !this._events[t].warned && (n = a(this._maxListeners) ? r.defaultMaxListeners : this._maxListeners) && n > 0 && this._events[t].length > n && (this._events[t].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[t].length), "function" == typeof console.trace && console.trace()), this;
										}, r.prototype.on = r.prototype.addListener, r.prototype.once = function (t, e) {
											function n() {
												this.removeListener(t, n), r || (r = !0, e.apply(this, arguments));
											}if (!i(e)) throw TypeError("listener must be a function");var r = !1;return n.listener = e, this.on(t, n), this;
										}, r.prototype.removeListener = function (t, e) {
											var n, r, o, a;if (!i(e)) throw TypeError("listener must be a function");if (!this._events || !this._events[t]) return this;if (n = this._events[t], o = n.length, r = -1, n === e || i(n.listener) && n.listener === e) delete this._events[t], this._events.removeListener && this.emit("removeListener", t, e);else if (u(n)) {
												for (a = o; a-- > 0;) {
													if (n[a] === e || n[a].listener && n[a].listener === e) {
														r = a;break;
													}
												}if (r < 0) return this;1 === n.length ? (n.length = 0, delete this._events[t]) : n.splice(r, 1), this._events.removeListener && this.emit("removeListener", t, e);
											}return this;
										}, r.prototype.removeAllListeners = function (t) {
											var e, n;if (!this._events) return this;if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[t] && delete this._events[t], this;if (0 === arguments.length) {
												for (e in this._events) {
													"removeListener" !== e && this.removeAllListeners(e);
												}return this.removeAllListeners("removeListener"), this._events = {}, this;
											}if (n = this._events[t], i(n)) this.removeListener(t, n);else if (n) for (; n.length;) {
												this.removeListener(t, n[n.length - 1]);
											}return delete this._events[t], this;
										}, r.prototype.listeners = function (t) {
											return this._events && this._events[t] ? i(this._events[t]) ? [this._events[t]] : this._events[t].slice() : [];
										}, r.prototype.listenerCount = function (t) {
											if (this._events) {
												var e = this._events[t];if (i(e)) return 1;if (e) return e.length;
											}return 0;
										}, r.listenerCount = function (t, e) {
											return t.listenerCount(e);
										};
									}, {}], 3: [function (t, e, n) {
										function r() {
											throw new Error("setTimeout has not been defined");
										}function i() {
											throw new Error("clearTimeout has not been defined");
										}function o(t) {
											if (f === setTimeout) return setTimeout(t, 0);if ((f === r || !f) && setTimeout) return f = setTimeout, setTimeout(t, 0);try {
												return f(t, 0);
											} catch (e) {
												try {
													return f.call(null, t, 0);
												} catch (e) {
													return f.call(this, t, 0);
												}
											}
										}function u(t) {
											if (h === clearTimeout) return clearTimeout(t);if ((h === i || !h) && clearTimeout) return h = clearTimeout, clearTimeout(t);try {
												return h(t);
											} catch (e) {
												try {
													return h.call(null, t);
												} catch (e) {
													return h.call(this, t);
												}
											}
										}function a() {
											v && _ && (v = !1, _.length ? d = _.concat(d) : y = -1, d.length && c());
										}function c() {
											if (!v) {
												var t = o(a);v = !0;for (var e = d.length; e;) {
													for (_ = d, d = []; ++y < e;) {
														_ && _[y].run();
													}y = -1, e = d.length;
												}_ = null, v = !1, u(t);
											}
										}function s(t, e) {
											this.fun = t, this.array = e;
										}function l() {}var f,
										    h,
										    p = e.exports = {};!function () {
											try {
												f = "function" == typeof setTimeout ? setTimeout : r;
											} catch (t) {
												f = r;
											}try {
												h = "function" == typeof clearTimeout ? clearTimeout : i;
											} catch (t) {
												h = i;
											}
										}();var _,
										    d = [],
										    v = !1,
										    y = -1;p.nextTick = function (t) {
											var e = new Array(arguments.length - 1);if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) {
												e[n - 1] = arguments[n];
											}d.push(new s(t, e)), 1 !== d.length || v || o(c);
										}, s.prototype.run = function () {
											this.fun.apply(null, this.array);
										}, p.title = "browser", p.browser = !0, p.env = {}, p.argv = [], p.version = "", p.versions = {}, p.on = l, p.addListener = l, p.once = l, p.off = l, p.removeListener = l, p.removeAllListeners = l, p.emit = l, p.prependListener = l, p.prependOnceListener = l, p.listeners = function (t) {
											return [];
										}, p.binding = function (t) {
											throw new Error("process.binding is not supported");
										}, p.cwd = function () {
											return "/";
										}, p.chdir = function (t) {
											throw new Error("process.chdir is not supported");
										}, p.umask = function () {
											return 0;
										};
									}, {}] }, {}, [1])(1);
							});
						}).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
					}, {}] }, {}, [2, 4, 1]);
			}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		}, {}], 2: [function (require, module, exports) {
			'use strict';

			var Diaspora = require('./lib/diaspora');

			module.exports = Diaspora;
		}, { "./lib/diaspora": 11 }], 3: [function (require, module, exports) {
			'use strict';

			var _require = require('../../dependencies'),
			    _ = _require._;

			module.exports = {
				OPERATORS: {
					$exists: function $exists(entityVal, targetVal) {
						return targetVal === !_.isUndefined(entityVal);
					},
					$equal: function $equal(entityVal, targetVal) {
						return !_.isUndefined(entityVal) && entityVal === targetVal;
					},
					$diff: function $diff(entityVal, targetVal) {
						return !_.isUndefined(entityVal) && entityVal !== targetVal;
					},
					$less: function $less(entityVal, targetVal) {
						return !_.isUndefined(entityVal) && entityVal < targetVal;
					},
					$lessEqual: function $lessEqual(entityVal, targetVal) {
						return !_.isUndefined(entityVal) && entityVal <= targetVal;
					},
					$greater: function $greater(entityVal, targetVal) {
						return !_.isUndefined(entityVal) && entityVal > targetVal;
					},
					$greaterEqual: function $greaterEqual(entityVal, targetVal) {
						return !_.isUndefined(entityVal) && entityVal >= targetVal;
					}
				},
				CANONICAL_OPERATORS: {
					'~': '$exists',
					'==': '$equal',
					'!=': '$diff',
					'<': '$less',
					'<=': '$lessEqual',
					'>': '$greater',
					'>=': '$greaterEqual'
				},
				QUERY_OPTIONS_TRANSFORMS: {
					limit: function limit(opts) {
						var limitOpt = opts.limit;
						if (_.isString(limitOpt)) {
							limitOpt = parseInt(limitOpt);
						}
						if (!(_.isInteger(limitOpt) || Infinity === limitOpt) || limitOpt < 0) {
							throw new TypeError("Expect \"options.limit\" to be an integer equal to or above 0, have " + limitOpt);
						}
						opts.limit = limitOpt;
					},
					skip: function skip(opts) {
						var skipOpt = opts.skip;
						if (_.isString(skipOpt)) {
							skipOpt = parseInt(skipOpt);
						}
						if (!_.isInteger(skipOpt) || skipOpt < 0 || !isFinite(skipOpt)) {
							throw new TypeError("Expect \"options.skip\" to be a finite integer equal to or above 0, have " + skipOpt);
						}
						opts.skip = skipOpt;
					},
					page: function page(opts) {
						if (!opts.hasOwnProperty('limit')) {
							throw new ReferenceError('Usage of "options.page" requires "options.limit" to be defined.');
						}
						if (!isFinite(opts.limit)) {
							throw new ReferenceError('Usage of "options.page" requires "options.limit" to not be infinite');
						}
						if (opts.hasOwnProperty('skip')) {
							throw new Error('Use either "options.page" or "options.skip"');
						}
						var pageOpt = opts.page;
						if (_.isString(pageOpt)) {
							pageOpt = parseInt(pageOpt);
						}
						if (!_.isInteger(pageOpt) || pageOpt < 0) {
							throw new TypeError("Expect \"options.page\" to be an integer equal to or above 0, have " + pageOpt);
						}
						opts.skip = pageOpt * opts.limit;
						delete opts.page;
					}
				}
			};
		}, { "../../dependencies": 10 }], 4: [function (require, module, exports) {
			'use strict';

			var _require2 = require('../../dependencies'),
			    _ = _require2._,
			    Promise = _require2.Promise,
			    SequentialEvent = _require2.SequentialEvent;

			/**
    * @namespace ConstrainedTypes
    * @description Namespace for types with constraints, like <code>[0, Infinity]</code>, <code>]0, Infinity[</code>, etc etc
    */

			/**
    * @typedef {Integer} AbsInt0
    * @memberof ConstrainedTypes
    * @description Integer equal or above 0
    */

			/**
    * @typedef {Integer} AbsInt
    * @memberof ConstrainedTypes
    * @description Integer above 0
    */

			/**
    * @typedef {Integer} AbsIntInf
    * @memberof ConstrainedTypes
    * @description Integer above 0, may be integer
    */

			/**
    * @typedef {Integer} AbsIntInf0
    * @memberof ConstrainedTypes
    * @description Integer equal or above 0, may be integer
    */

			/**
    * @namespace QueryLanguage
    */

			/**
    * @typedef {Object} QueryOptions
    * @description All properties are optional
    * @memberof QueryLanguage
    * @public
    * @instance
    * @author gerkin
    * @property {ConstrainedTypes.AbsInt0} skip=0 Number of items to skip
    * @property {ConstrainedTypes.AbsIntInf0} limit=Infinity Number of items to get
    * @property {ConstrainedTypes.AbsInt0} page To use with {@link QueryOptions.limit `limit`} and without {@link QueryOptions.skip `skip`}. Skips `page` pages of `limit` elements
    * @property {Boolean} remapInput=true Flag indicating if adapter input should be remapped or not. TODO Remapping doc
    * @property {Boolean} remapOutput=true Flag indicating if adapter output should be remapped or not. TODO Remapping doc
    */

			/**
    * @typedef {Object} SelectQuery
    * @memberof QueryLanguage
    * @public
    * @instance
    * @author gerkin
    * @property {Any|SelectQueryCondition} * Fields to search. If not providing an object, find items with a property value that equals this value
    */

			/**
    * By default, all conditions in a single SelectQueryCondition are combined with an `AND` operator.
    *
    * @typedef {Object} QueryLanguage.SelectQueryCondition
    * @author gerkin
    * @property {Any}                                      $equals       - Match if item value is equal to this. Objects and array are compared deeply. **Alias: `==`**
    * @property {Any}                                      $diff         - Match if item value is different to this. Objects and array are compared deeply. **Alias: `!=`**
    * @property {boolean}                                  $exists       - If `true`, match items where this prop is defined. If `false`, match when prop is null or not set. **Alias: `~`**
    * @property {integer}                                  $less         - Match if item value is less than this. **Alias: `<`**
    * @property {integer}                                  $lessEqual    - Match if item value is less than this or equals to this. **Alias: `<=`**
    * @property {integer}                                  $greater      - Match if item value is greater than this. **Alias: `>`**
    * @property {integer}                                  $greaterEqual - Match if item value is greater than this or equals to this. **Alias: `>=`**
    * @property {QueryLanguage#SelectQueryOrCondition[]}   $or           - Match if *one of* the conditions in the array is true. **Alias: `||`** **NOT IMPLEMENTED YET**
    * @property {QueryLanguage#SelectQueryOrCondition[]}   $and          - Match if *all* the conditions in the array are true. Optional, because several conditions in a single SelectQueryCondition are combined with an `AND` operator. **Alias: `&&`** **NOT IMPLEMENTED YET**
    * @property {QueryLanguage#SelectQueryOrCondition[]}   $xor          - Match if *a single* of the conditions in the array is true. **Alias: `^^`** **NOT IMPLEMENTED YET**
    * @property {QueryLanguage#SelectQueryOrCondition}     $not          - Invert the condition **Alias: `!`** **NOT IMPLEMENTED YET**
    * @property {string}                                   $contains     - On *string*, it will check if query is included in item using GLOB. **NOT IMPLEMENTED YET**
    * @property {QueryLanguage#SelectQueryOrCondition|Any} $contains     - On *array*, it will check if item contains the query. **NOT IMPLEMENTED YET**
    * @property {Any[]}                                    $in           - Check if item value is contained (using deep comparaison) in query. **NOT IMPLEMENTED YET**
    */

			/**
    * @typedef {QueryLanguage#SelectQuery|QueryLanguage#SelectQueryCondition} SelectQueryOrCondition
    * @memberof QueryLanguage
    * @public
    * @instance
    * @author gerkin
    */

			/**
    * @namespace Adapters
    */

			var iterateLimit = function iterateLimit(options, query) {
				var foundEntities = [];
				var foundCount = 0;
				var origSkip = options.skip;

				// We are going to loop until we find enough items
				var loopFind = function loopFind(found) {
					// If the search returned nothing, then just finish the findMany
					if (_.isNil(found)) {
						return Promise.resolve(foundEntities);
						// Else, if this is a value and not the initial `true`, add it to the list
					} else if (found !== true) {
						foundEntities.push(found);
					}
					// If we found enough items, return them
					if (foundCount === options.limit) {
						return Promise.resolve(foundEntities);
					}
					options.skip = origSkip + foundCount;
					// Next time we'll skip 1 more item
					foundCount++;
					// Do the query & loop
					return query(options).then(loopFind);
				};
				return loopFind;
			};

			var _require3 = require('./adapter-utils'),
			    OPERATORS = _require3.OPERATORS,
			    CANONICAL_OPERATORS = _require3.CANONICAL_OPERATORS,
			    QUERY_OPTIONS_TRANSFORMS = _require3.QUERY_OPTIONS_TRANSFORMS;

			/**
    * DiasporaAdapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
    * @extends SequentialEvent
    * @memberof Adapters
    * @author gerkin
    */


			var DiasporaAdapter = function (_SequentialEvent) {
				_inherits(DiasporaAdapter, _SequentialEvent);

				// -----
				// ### Initialization

				/**
     * Create a new instance of adapter. This base class should be used by all other adapters.
     *
     * @public
     * @author gerkin
     * @param {DataStoreEntities.DataStoreEntity} classEntity - Entity to spawn with this adapter.
     */
				function DiasporaAdapter(classEntity) {
					_classCallCheck(this, DiasporaAdapter);

					/**
      * Describe current adapter status.
      *
      * @type {string}
      * @author Gerkin
      */
					var _this2 = _possibleConstructorReturn(this, (DiasporaAdapter.__proto__ || Object.getPrototypeOf(DiasporaAdapter)).call(this));

					_this2.state = 'preparing';
					/**
      * Hash to transform entity fields to data store fields.
      *
      * @type {Object}
      * @property {string} * - Data store field associated with this entity field.
      * @author Gerkin
      */
					_this2.remaps = {};
					/**
      * Hash to transform data store fields to entity fields.
      *
      * @type {Object}
      * @property {string} * - Entity field associated with this data store field.
      * @author Gerkin
      */
					_this2.remapsInverted = {};
					/**
      * Hash of functions to cast data store values to JSON standard values in entity.
      *
      * @type {Object}
      * @property {Function} * - Filter to execute to get standard JSON value.
      * @author Gerkin
      */
					_this2.filters = {};
					/**
      * Link to the constructor of the class generated by this adapter.
      *
      * @type {DataStoreEntities.DataStoreEntity}
      * @author Gerkin
      */
					_this2.classEntity = classEntity;
					/**
      * Error triggered by adapter initialization.
      *
      * @type {Error}
      * @author Gerkin
      */
					_this2.error = undefined;

					// Bind events
					_this2.on('ready', function () {
						_this2.state = 'ready';
					}).on('error', function (err) {
						_this2.state = 'error';
						_this2.error = err;
					});
					return _this2;
				}

				/**
     * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
     *
     * @author gerkin
     * @param   {string} tableName    - Name of the table (usually, model name).
     * @param   {Object} remaps       - Associative hash that links entity field names with data source field names.
     * @param   {Object} [filters={}] - Not used yet...
     * @returns {undefined} This function does not return anything.
     */


				_createClass(DiasporaAdapter, [{
					key: "configureCollection",
					value: function configureCollection(tableName, remaps) {
						var filters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						this.remaps[tableName] = {
							normal: remaps,
							inverted: _.invert(remaps)
						};
						this.filters[tableName] = filters;
					}

					// -----
					// ### Events

					/**
      * Fired when the adapter is ready to use. You should not try to use the adapter before this event is emitted.
      *
      * @event Adapters.DiasporaAdapter#ready
      * @type {undefined}
      * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
      */

					/**
      * Fired if the adapter failed to initialize or changed to `error` state. Called with the triggering `error`.
      *
      * @event Adapters.DiasporaAdapter#error
      * @type {Error}
      * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
      */

					// -----
					// ### Utils

					/**
      * Returns a promise resolved once adapter state is ready.
      *
      * @author gerkin
      * @listens Adapters.DiasporaAdapter#error
      * @listens Adapters.DiasporaAdapter#ready
      * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured.
      */

				}, {
					key: "waitReady",
					value: function waitReady() {
						var _this3 = this;

						return new Promise(function (resolve, reject) {
							if ('ready' === _this3.state) {
								return resolve(_this3);
							} else if ('error' === _this3.state) {
								return reject(_this3.error);
							}
							_this3.on('ready', function () {
								return resolve(_this3);
							}).on('error', function (err) {
								return reject(err);
							});
						});
					}

					/**
      * TODO.
      *
      * @author gerkin
      * @see TODO remapping.
      * @see {@link Adapters.DiasporaAdapter#remapIO remapIO}
      * @param   {string} tableName - Name of the table for which we remap.
      * @param   {Object} query     - Hash representing the entity to remap.
      * @returns {Object} Remapped object.
      */

				}, {
					key: "remapInput",
					value: function remapInput(tableName, query) {
						return this.remapIO(tableName, query, true);
					}

					/**
      * TODO.
      *
      * @author gerkin
      * @see TODO remapping.
      * @see {@link Adapters.DiasporaAdapter#remapIO remapIO}
      * @param   {string} tableName - Name of the table for which we remap.
      * @param   {Object} query     - Hash representing the entity to remap.
      * @returns {Object} Remapped object.
      */

				}, {
					key: "remapOutput",
					value: function remapOutput(tableName, query) {
						return this.remapIO(tableName, query, false);
					}

					/**
      * TODO.
      *
      * @author gerkin
      * @see TODO remapping.
      * @param   {string}  tableName - Name of the table for which we remap.
      * @param   {Object}  query     - Hash representing the entity to remap.
      * @param   {boolean} input     - Set to `true` if handling input, `false`to output.
      * @returns {Object} Remapped object.
      */

				}, {
					key: "remapIO",
					value: function remapIO(tableName, query, input) {
						var _this4 = this;

						if (_.isNil(query)) {
							return query;
						}
						var direction = true === input ? 'input' : 'output';
						var filtered = _.mapValues(query, function (value, key) {
							var filter = _.get(_this4, ['filters', tableName, direction, key], undefined);
							if (_.isFunction(filter)) {
								return filter(value);
							}
							return value;
						});
						var remapType = true === input ? 'normal' : 'inverted';
						var remaped = _.mapKeys(filtered, function (value, key) {
							return _.get(_this4, ['remaps', tableName, remapType, key], key);
						});
						return remaped;
					}

					/**
      * Refresh the `idHash` with current adapter's `id` injected.
      *
      * @author gerkin
      * @param   {Object} entity          - Object containing attributes of the entity.
      * @param   {string} [propName='id'] - Name of the `id` field.
      * @returns {Object} Modified entity (for chaining).
      */

				}, {
					key: "setIdHash",
					value: function setIdHash(entity) {
						var propName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'id';

						entity.idHash = _.assign({}, entity.idHash, _defineProperty({}, this.name, entity[propName]));
						return entity;
					}

					/**
      * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQuery} query  - Query to match against.
      * @param   {Object}                    entity - Entity to test.
      * @returns {boolean} Returns `true` if query matches, `false` otherwise.
      */

				}, {
					key: "matchEntity",
					value: function matchEntity(query, entity) {
						var matchResult = _.every(_.toPairs(query), function (_ref) {
							var _ref2 = _slicedToArray(_ref, 2),
							    key = _ref2[0],
							    desc = _ref2[1];

							if (_.isObject(desc)) {
								var entityVal = entity[key];
								return _.every(desc, function (val, operation) {
									if (OPERATORS.hasOwnProperty(operation)) {
										return OPERATORS[operation](entityVal, val);
									} else {
										return false;
									}
								});
							}
							return false;
						});
						return matchResult;
					}

					/**
      * Transform options to their canonical form. This function must be applied before calling adapters' methods.
      *
      * @author gerkin
      * @throws  {TypeError} Thrown if an option does not have an acceptable type.
      * @throws  {ReferenceError} Thrown if a required option is not present.
      * @throws  {Error} Thrown when there isn't more precise description of the error is available (eg. when conflicts occurs) .
      * @param   {Object} [opts={}] - Options to transform.
      * @returns {Object} Transformed options (also called `canonical options`).
      */

				}, {
					key: "normalizeOptions",
					value: function normalizeOptions() {
						var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						opts = _.cloneDeep(opts);

						_.forEach(QUERY_OPTIONS_TRANSFORMS, function (transform, optionName) {
							if (opts.hasOwnProperty(optionName)) {
								QUERY_OPTIONS_TRANSFORMS[optionName](opts);
							}
						});

						_.defaults(opts, {
							skip: 0,
							remapInput: true,
							remapOutput: true
						});
						return opts;
					}

					/**
      * Transform a search query to its canonical form, replacing aliases or shorthands by full query.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQueryOrCondition} originalQuery - Query to cast to its canonical form.
      * @param   {QueryLanguage#Options}                options       - Options for this query.
      * @returns {QueryLanguage#SelectQueryOrCondition} Query in its canonical form.
      */

				}, {
					key: "normalizeQuery",
					value: function normalizeQuery(originalQuery, options) {
						var normalizedQuery = true === options.remapInput ? _(_.cloneDeep(originalQuery)).mapValues(function (attrSearch) {
							if (_.isUndefined(attrSearch)) {
								return { $exists: false };
							} else if (!(attrSearch instanceof Object)) {
								return { $equal: attrSearch };
							} else {
								// Replace operations alias by canonical expressions
								attrSearch = _.mapKeys(attrSearch, function (val, operator, obj) {
									if (CANONICAL_OPERATORS.hasOwnProperty(operator)) {
										// ... check for conflict with canonical operation name...
										if (obj.hasOwnProperty(CANONICAL_OPERATORS[operator])) {
											throw new Error("Search can't have both \"" + operator + "\" and \"" + CANONICAL_OPERATORS[operator] + "\" keys, as they are synonyms");
										}
										return CANONICAL_OPERATORS[operator];
									}
									return operator;
								});
								// For arithmetic comparison, check if values are numeric (TODO later: support date)
								_.forEach(['$less', '$lessEqual', '$greater', '$greaterEqual'], function (operation) {
									if (attrSearch.hasOwnProperty(operation) && !_.isNumber(attrSearch[operation])) {
										throw new TypeError("Expect \"" + operation + "\" in " + JSON.stringify(attrSearch) + " to be a numeric value");
									}
								});
								return attrSearch;
							}
						}).value() : _.cloneDeep(originalQuery);
						return normalizedQuery;
					}

					// -----
					// ### Insert

					/**
      * Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself.
      *
      * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string} table  - Name of the table to insert data in.
      * @param   {Object} entity - Hash representing the entity to insert.
      * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}* entity).
      */

				}, {
					key: "insertOne",
					value: function insertOne(table, entity) {
						return this.insertMany(table, [entity]).then(function (entities) {
							return Promise.resolve(_.first(entities));
						});
					}

					/**
      * Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself.
      *
      * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string}   table    - Name of the table to insert data in.
      * @param   {Object[]} entities - Array of hashs representing the entities to insert.
      * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}[]* entities).
      */

				}, {
					key: "insertMany",
					value: function insertMany(table, entities) {
						var _this5 = this;

						return Promise.mapSeries(entities, function (entity) {
							return _this5.insertOne(table, entity || {});
						});
					}

					// -----
					// ### Find

					/**
      * Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself.
      *
      * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to retrieve data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
      */

				}, {
					key: "findOne",
					value: function findOne(table, queryFind) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						options.limit = 1;
						return this.findMany(table, queryFind, options).then(function (entities) {
							return Promise.resolve(_.first(entities));
						});
					}

					/**
      * Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself.
      *
      * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to retrieve data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
      */

				}, {
					key: "findMany",
					value: function findMany(table, queryFind) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						options = this.normalizeOptions(options);
						return iterateLimit(options, this.findOne.bind(this, table, queryFind))(true);
					}

					// -----
					// ### Update

					/**
      * Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself.
      *
      * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to retrieve data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
      * @param   {Object}                               update       - Object properties to set.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
      */

				}, {
					key: "updateOne",
					value: function updateOne(table, queryFind, update) {
						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						options = this.normalizeOptions(options);
						options.limit = 1;
						return this.updateMany(table, queryFind, update, options).then(function (entities) {
							return Promise.resolve(_.first(entities));
						});
					}

					/**
      * Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself.
      *
      * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to retrieve data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
      * @param   {Object}                               update       - Object properties to set.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
      */

				}, {
					key: "updateMany",
					value: function updateMany(table, queryFind, update) {
						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						options = this.normalizeOptions(options);
						return iterateLimit(options, this.updateOne.bind(this, table, queryFind, update))(true);
					}

					// -----
					// ### Delete

					/**
      * Delete a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself.
      *
      * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to delete data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entities to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
      */

				}, {
					key: "deleteOne",
					value: function deleteOne(table, queryFind) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						options.limit = 1;
						return this.deleteMany(table, queryFind, options);
					}

					/**
      * Delete several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself.
      *
      * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to delete data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entities to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
      */

				}, {
					key: "deleteMany",
					value: function deleteMany(table, queryFind) {
						var _this6 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var count = 0;

						// We are going to loop until we find enough items
						var loopFind = function loopFind() {
							// First, search for the item.
							return _this6.findOne(table, queryFind, options).then(function (found) {
								// If the search returned nothing, then just finish the findMany
								if (_.isNil(found)) {
									return Promise.resolve();
									// Else, if this is a value and not the initial `true`, add it to the list
								}
								// If we found enough items, return them
								if (count === options.limit) {
									return Promise.resolve();
								}
								// Increase our counter
								count++;
								// Do the deletion & loop
								return _this6.deleteOne(table, queryFind, options).then(loopFind);
							});
						};
						return loopFind(true);
					}
				}]);

				return DiasporaAdapter;
			}(SequentialEvent);

			module.exports = DiasporaAdapter;
		}, { "../../dependencies": 10, "./adapter-utils": 3 }], 5: [function (require, module, exports) {
			'use strict';

			var _require4 = require('../../dependencies'),
			    _ = _require4._;

			/**
    * @namespace DataStoreEntities
    */

			/**
    * DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
    * @memberof DataStoreEntities
    */


			var DataStoreEntity = function () {
				/**
     * Construct a new data source entity with specified content & parent.
     * 
     * @author gerkin
     * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
     * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
     */
				function DataStoreEntity(entity, dataSource) {
					_classCallCheck(this, DataStoreEntity);

					if (_.isNil(entity)) {
						return undefined;
					}
					if (_.isNil(dataSource)) {
						throw new TypeError("Expect 2nd argument to be the parent of this entity, have \"" + dataSource + "\"");
					}
					Object.defineProperties(this, {
						dataSource: {
							value: dataSource,
							enumerable: false,
							configurable: false
						}
					});
					_.assign(this, entity);
				}

				/**
     * Returns a plain object corresponding to this entity attributes.
     * 
     * @author gerkin
     * @returns {Object} Plain object representing this entity.
     */


				_createClass(DataStoreEntity, [{
					key: "toObject",
					value: function toObject() {
						return _.omit(this, ['dataSource', 'id']);
					}
				}]);

				return DataStoreEntity;
			}();

			module.exports = DataStoreEntity;
		}, { "../../dependencies": 10 }], 6: [function (require, module, exports) {
			'use strict';

			var _require5 = require('../../dependencies'),
			    _ = _require5._,
			    Promise = _require5.Promise;

			var Utils = require('../../utils');

			var Diaspora = require('../../diaspora');
			var DiasporaAdapter = Diaspora.components.Adapters.Adapter;
			var InMemoryEntity = require('./entity.js');

			/**
    * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
    *
    * @extends Adapters.DiasporaAdapter
    * @memberof Adapters
    */

			var InMemoryDiasporaAdapter = function (_DiasporaAdapter) {
				_inherits(InMemoryDiasporaAdapter, _DiasporaAdapter);

				/**
     * Create a new instance of in memory adapter.
     *
     * @author gerkin
     */
				function InMemoryDiasporaAdapter() {
					_classCallCheck(this, InMemoryDiasporaAdapter);

					var _this7 = _possibleConstructorReturn(this, (InMemoryDiasporaAdapter.__proto__ || Object.getPrototypeOf(InMemoryDiasporaAdapter)).call(this, InMemoryEntity));
					/**
      * Link to the InMemoryEntity.
      *
      * @name classEntity
      * @type {DataStoreEntities.InMemoryEntity}
      * @memberof Adapters.InMemoryDiasporaAdapter
      * @instance
      * @author Gerkin
      */


					_this7.state = 'ready';
					/**
      * Plain old javascript object used as data store.
      *
      * @author Gerkin
      */
					_this7.store = {};
					return _this7;
				}

				/**
     * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
     *
     * @author gerkin
     * @param   {string} tableName - Name of the table (usually, model name).
     * @param   {Object} remaps    - Associative hash that links entity field names with data source field names.
     * @returns {undefined} This function does not return anything.
     */


				_createClass(InMemoryDiasporaAdapter, [{
					key: "configureCollection",
					value: function configureCollection(tableName, remaps) {
						_get(InMemoryDiasporaAdapter.prototype.__proto__ || Object.getPrototypeOf(InMemoryDiasporaAdapter.prototype), "configureCollection", this).call(this, tableName, remaps);
						this.ensureCollectionExists(tableName);
					}

					// -----
					// ### Utils

					/**
      * Get or create the store hash.
      *
      * @author gerkin
      * @param   {string} table - Name of the table.
      * @returns {DataStoreTable} In memory table to use.
      */

				}, {
					key: "ensureCollectionExists",
					value: function ensureCollectionExists(table) {
						if (this.store.hasOwnProperty(table)) {
							return this.store[table];
						} else {
							return this.store[table] = {
								items: []
							};
						}
					}

					// -----
					// ### Insert

					/**
      * Insert a single entity in the memory store.
      *
      * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
      * @author gerkin
      * @param   {string} table  - Name of the table to insert data in.
      * @param   {Object} entity - Hash representing the entity to insert.
      * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`).
      */

				}, {
					key: "insertOne",
					value: function insertOne(table, entity) {
						entity = _.cloneDeep(entity);
						var storeTable = this.ensureCollectionExists(table);
						entity.id = Utils.generateUUID();
						this.setIdHash(entity);
						storeTable.items.push(entity);
						return Promise.resolve(new this.classEntity(entity, this));
					}

					// -----
					// ### Find

					/**
      * Retrieve a single entity from the memory.
      *
      * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to retrieve data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
      */

				}, {
					key: "findOne",
					value: function findOne(table, queryFind) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var storeTable = this.ensureCollectionExists(table);
						var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));
						var reducedMatches = Utils.applyOptionsToSet(matches, options);
						return Promise.resolve(reducedMatches.length > 0 ? new this.classEntity(_.first(reducedMatches), this) : undefined);
					}

					/**
      * Retrieve several entities from the memory.
      *
      * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for in-memory interactions.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to retrieve data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
      */

				}, {
					key: "findMany",
					value: function findMany(table, queryFind) {
						var _this8 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var storeTable = this.ensureCollectionExists(table);
						var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));
						var reducedMatches = Utils.applyOptionsToSet(matches, options);
						return Promise.resolve(_.map(reducedMatches, function (entity) {
							return new _this8.classEntity(entity, _this8);
						}));
					}

					// -----
					// ### Update

					/**
      * Update a single entity in the memory.
      *
      * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to update data in.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
      * @param   {Object}                               update       - Object properties to set.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
      */

				}, {
					key: "updateOne",
					value: function updateOne(table, queryFind, update) {
						var _this9 = this;

						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						return this.findOne(table, queryFind, options).then(function (found) {
							if (!_.isNil(found)) {
								var storeTable = _this9.ensureCollectionExists(table);
								var match = _.find(storeTable.items, {
									id: found.id
								});
								Utils.applyUpdateEntity(update, match);
								return Promise.resolve(new _this9.classEntity(match, _this9));
							} else {
								return Promise.resolve();
							}
						});
					}

					/**
      * Update several entities in the memory.
      *
      * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for in-memory interactions.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to update data in.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
      * @param   {Object}                               update       - Object properties to set.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
      */

				}, {
					key: "updateMany",
					value: function updateMany(table, queryFind, update) {
						var _this10 = this;

						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						return this.findMany(table, queryFind, options).then(function (found) {
							if (!_.isNil(found) && found.length > 0) {
								var storeTable = _this10.ensureCollectionExists(table);
								var foundIds = _.map(found, 'id');
								var matches = _.filter(storeTable.items, function (item) {
									return -1 !== foundIds.indexOf(item.id);
								});
								return Promise.resolve(_.map(matches, function (item) {
									Utils.applyUpdateEntity(update, item);
									return new _this10.classEntity(item, _this10);
								}));
							} else {
								return Promise.resolve();
							}
						});
					}

					// -----
					// ### Delete

					/**
      * Delete a single entity from the memory.
      *
      * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to delete data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
      */

				}, {
					key: "deleteOne",
					value: function deleteOne(table, queryFind) {
						var _this11 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var storeTable = this.ensureCollectionExists(table);
						return this.findOne(table, queryFind, options).then(function (entityToDelete) {
							storeTable.items = _.reject(storeTable.items, function (entity) {
								return entity.id === entityToDelete.idHash[_this11.name];
							});
							return Promise.resolve();
						});
					}

					/**
      * Delete several entities from the memory.
      *
      * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for in-memory interactions.
      * @author gerkin
      * @param   {string}                               table        - Name of the table to delete data from.
      * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
      * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
      * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
      */

				}, {
					key: "deleteMany",
					value: function deleteMany(table, queryFind) {
						var _this12 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var storeTable = this.ensureCollectionExists(table);
						return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
							var entitiesIds = _.map(entitiesToDelete, function (entity) {
								return _.get(entity, "idHash." + _this12.name);
							});
							storeTable.items = _.reject(storeTable.items, function (entity) {
								return _.includes(entitiesIds, entity.id);
							});
							return Promise.resolve();
						});
					}
				}]);

				return InMemoryDiasporaAdapter;
			}(DiasporaAdapter);

			module.exports = InMemoryDiasporaAdapter;
		}, { "../../dependencies": 10, "../../diaspora": 11, "../../utils": 19, "./entity.js": 7 }], 7: [function (require, module, exports) {
			'use strict';

			var DataStoreEntity = require('../base/entity.js');

			/**
    * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
    * @extends DataStoreEntities.DataStoreEntity
    * @memberof DataStoreEntities
    */

			var InMemoryEntity = function (_DataStoreEntity) {
				_inherits(InMemoryEntity, _DataStoreEntity);

				/**
     * Construct a in memory entity with specified content & parent.
     * 
     * @author gerkin
     * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
     * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
     */
				function InMemoryEntity(entity, dataSource) {
					_classCallCheck(this, InMemoryEntity);

					return _possibleConstructorReturn(this, (InMemoryEntity.__proto__ || Object.getPrototypeOf(InMemoryEntity)).call(this, entity, dataSource));
				}

				return InMemoryEntity;
			}(DataStoreEntity);

			module.exports = InMemoryEntity;
		}, { "../base/entity.js": 5 }], 8: [function (require, module, exports) {
			(function (global) {
				'use strict';

				var _require6 = require('../../dependencies'),
				    _ = _require6._,
				    Promise = _require6.Promise;

				var Utils = require('../../utils');

				var Diaspora = require('../../diaspora');
				var DiasporaAdapter = Diaspora.components.Adapters.Adapter;
				var WebStorageEntity = require('./entity');

				/**
     * This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser.
     *
     * @extends Adapters.DiasporaAdapter
     * @memberof Adapters
     */

				var WebStorageDiasporaAdapter = function (_DiasporaAdapter2) {
					_inherits(WebStorageDiasporaAdapter, _DiasporaAdapter2);

					/**
      * Create a new instance of local storage adapter.
      *
      * @author gerkin
      * @param {Object}  config                 - Configuration object.
      * @param {boolean} [config.session=false] - Set to true to use sessionStorage instead of localStorage.
      */
					function WebStorageDiasporaAdapter(config) {
						_classCallCheck(this, WebStorageDiasporaAdapter);

						var _this14 = _possibleConstructorReturn(this, (WebStorageDiasporaAdapter.__proto__ || Object.getPrototypeOf(WebStorageDiasporaAdapter)).call(this, WebStorageEntity));
						/**
       * Link to the WebStorageEntity.
       *
       * @name classEntity
       * @type {DataStoreEntities.WebStorageEntity}
       * @memberof Adapters.WebStorageDiasporaAdapter
       * @instance
       * @author Gerkin
       */


						_.defaults(config, {
							session: false
						});
						_this14.state = 'ready';
						/**
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage api} where to store data.
       *
       * @type {Storage}
       * @author Gerkin
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} and {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage sessionStorage} on MDN web docs.
       * @see {@link Adapters.WebStorageDiasporaAdapter}:config.session parameter.
       */
						_this14.source = true === config.session ? global.sessionStorage : global.localStorage;
						return _this14;
					}

					/**
      * Create the collection index and call {@link Adapters.DiasporaAdapter#configureCollection}.
      *
      * @author gerkin
      * @param {string} tableName - Name of the table (usually, model name).
      * @param {Object} remaps    - Associative hash that links entity field names with data source field names.
      * @returns {undefined} This function does not return anything.
      */


					_createClass(WebStorageDiasporaAdapter, [{
						key: "configureCollection",
						value: function configureCollection(tableName, remaps) {
							_get(WebStorageDiasporaAdapter.prototype.__proto__ || Object.getPrototypeOf(WebStorageDiasporaAdapter.prototype), "configureCollection", this).call(this, tableName, remaps);
							this.ensureCollectionExists(tableName);
						}

						// -----
						// ### Utils

						/**
       * Create the table key if it does not exist.
       *
       * @author gerkin
       * @param   {string} table - Name of the table.
       * @returns {string[]} Index of the collection.
       */

					}, {
						key: "ensureCollectionExists",
						value: function ensureCollectionExists(table) {
							var index = this.source.getItem(table);
							if (_.isNil(index)) {
								index = [];
								this.source.setItem(table, JSON.stringify(index));
							} else {
								index = JSON.parse(index);
							}
							return index;
						}

						/**
       * Deduce the item name from table name and item ID.
       *
       * @author gerkin
       * @param   {string} table - Name of the table to construct name for.
       * @param   {string} id    - Id of the item to find.
       * @returns {string} Name of the item.
       */

					}, {
						key: "getItemName",
						value: function getItemName(table, id) {
							return table + ".id=" + id;
						}

						// -----
						// ### Insert

						/**
       * Insert a single entity in the local storage.
       *
       * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for local storage or session storage interactions.
       * @author gerkin
       * @param   {string} table  - Name of the table to insert data in.
       * @param   {Object} entity - Hash representing the entity to insert.
       * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
       */

					}, {
						key: "insertOne",
						value: function insertOne(table, entity) {
							entity = _.cloneDeep(entity || {});
							entity.id = Utils.generateUUID();
							this.setIdHash(entity);
							try {
								var tableIndex = this.ensureCollectionExists(table);
								tableIndex.push(entity.id);
								this.source.setItem(table, JSON.stringify(tableIndex));
								this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
							} catch (error) {
								return Promise.reject(error);
							}
							return Promise.resolve(new this.classEntity(entity, this));
						}

						/**
       * Insert several entities in the local storage.
       *
       * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for local storage or session storage interactions.
       * @author gerkin
       * @param   {string}   table    - Name of the table to insert data in.
       * @param   {Object[]} entities - Array of hashes representing entities to insert.
       * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}[]* `entities`).
       */

					}, {
						key: "insertMany",
						value: function insertMany(table, entities) {
							var _this15 = this;

							entities = _.cloneDeep(entities);
							try {
								var tableIndex = this.ensureCollectionExists(table);
								entities = entities.map(function () {
									var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

									entity.id = Utils.generateUUID();
									_this15.setIdHash(entity);
									tableIndex.push(entity.id);
									_this15.source.setItem(_this15.getItemName(table, entity.id), JSON.stringify(entity));
									return new _this15.classEntity(entity, _this15);
								});
								this.source.setItem(table, JSON.stringify(tableIndex));
							} catch (error) {
								return Promise.reject(error);
							}
							return Promise.resolve(entities);
						}

						// -----
						// ### Find

						/**
       * Find a single local storage entity using its id.
       *
       * @author gerkin
       * @param   {string} table - Name of the collection to search entity in.
       * @param   {string} id    - Id of the entity to search.
       * @returns {DataStoreEntities.WebStorageEntity|undefined} Found entity, or undefined if not found.
       */

					}, {
						key: "findOneById",
						value: function findOneById(table, id) {
							var item = this.source.getItem(this.getItemName(table, id));
							if (!_.isNil(item)) {
								return Promise.resolve(new this.classEntity(JSON.parse(item), this));
							}
							return Promise.resolve();
						}

						/**
       * Retrieve a single entity from the local storage.
       *
       * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for local storage or session storage interactions.
       * @author gerkin
       * @param   {string}                               table        - Name of the model to retrieve data from.
       * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
       * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
       * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
       */

					}, {
						key: "findOne",
						value: function findOne(table, queryFind) {
							var _this16 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							_.defaults(options, {
								skip: 0
							});
							if (!_.isObject(queryFind)) {
								return this.findOneById(table, queryFind);
							} else if (_.isEqual(_.keys(queryFind), ['id']) && _.isEqual(_.keys(queryFind.id), ['$equal'])) {
								return this.findOneById(table, queryFind.id.$equal);
							}
							var items = this.ensureCollectionExists(table);
							var returnedItem = void 0;
							var matched = 0;
							_.each(items, function (itemId) {
								var item = JSON.parse(_this16.source.getItem(_this16.getItemName(table, itemId)));
								if (_this16.matchEntity(queryFind, item)) {
									matched++;
									// If we matched enough items
									if (matched > options.skip) {
										returnedItem = item;
										return false;
									}
								}
							});
							return Promise.resolve(!_.isNil(returnedItem) ? new this.classEntity(returnedItem, this) : undefined);
						}

						// -----
						// ### Update

						/**
       * Update a single entity in the memory.
       *
       * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for local storage or session storage interactions.
       * @author gerkin
       * @param   {string}                               table        - Name of the table to update data in.
       * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
       * @param   {Object}                               update       - Object properties to set.
       * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
       * @returns {Promise} Promise resolved once update is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
       */

					}, {
						key: "updateOne",
						value: function updateOne(table, queryFind, update, options) {
							var _this17 = this;

							_.defaults(options, {
								skip: 0
							});
							return this.findOne(table, queryFind, options).then(function (entity) {
								if (_.isNil(entity)) {
									return Promise.resolve();
								}
								Utils.applyUpdateEntity(update, entity);
								try {
									_this17.source.setItem(_this17.getItemName(table, entity.id), JSON.stringify(entity));
									return Promise.resolve(entity);
								} catch (error) {
									return Promise.reject(error);
								}
							});
						}

						// -----
						// ### Delete

						/**
       * Delete a single entity from the local storage.
       *
       * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for local storage or session storage interactions.
       * @author gerkin
       * @param   {string}                               table        - Name of the table to delete data from.
       * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
       * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
       * @returns {Promise} Promise resolved once item is deleted. Called with (*undefined*).
       */

					}, {
						key: "deleteOne",
						value: function deleteOne(table, queryFind) {
							var _this18 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							return this.findOne(table, queryFind, options).then(function (entityToDelete) {
								try {
									var tableIndex = _this18.ensureCollectionExists(table);
									_.pull(tableIndex, entityToDelete.id);
									_this18.source.setItem(table, JSON.stringify(tableIndex));
									_this18.source.removeItem(_this18.getItemName(table, entityToDelete.id));
								} catch (error) {
									return Promise.reject(error);
								}
								return Promise.resolve();
							});
						}

						/**
       * Delete several entities from the local storage.
       *
       * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for local storage or session storage interactions.
       * @author gerkin
       * @param   {string}                               table        - Name of the table to delete data from.
       * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
       * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
       * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
       */

					}, {
						key: "deleteMany",
						value: function deleteMany(table, queryFind) {
							var _this19 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							try {
								return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
									var tableIndex = _this19.ensureCollectionExists(table);
									_.pullAll(tableIndex, _.map(entitiesToDelete, 'id'));
									_this19.source.setItem(table, JSON.stringify(tableIndex));
									_.forEach(entitiesToDelete, function (entityToDelete) {
										_this19.source.removeItem(_this19.getItemName(table, entityToDelete.id));
									});
									return Promise.resolve();
								});
							} catch (error) {
								return Promise.reject(error);
							}
						}
					}]);

					return WebStorageDiasporaAdapter;
				}(DiasporaAdapter);

				module.exports = WebStorageDiasporaAdapter;
			}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		}, { "../../dependencies": 10, "../../diaspora": 11, "../../utils": 19, "./entity": 9 }], 9: [function (require, module, exports) {
			'use strict';

			var DataStoreEntity = require('../base/entity.js');

			/**
    * Entity stored in {@link Adapters.WebStorageDiasporaAdapter the local storage adapter}.
    * 
    * @extends DataStoreEntities.DataStoreEntity
    * @memberof DataStoreEntities
    */

			var WebStorageEntity = function (_DataStoreEntity2) {
				_inherits(WebStorageEntity, _DataStoreEntity2);

				/**
     * Construct a local storage entity with specified content & parent.
     * 
     * @author gerkin
     * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
     * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
     */
				function WebStorageEntity(entity, dataSource) {
					_classCallCheck(this, WebStorageEntity);

					return _possibleConstructorReturn(this, (WebStorageEntity.__proto__ || Object.getPrototypeOf(WebStorageEntity)).call(this, entity, dataSource));
				}

				return WebStorageEntity;
			}(DataStoreEntity);

			module.exports = WebStorageEntity;
		}, { "../base/entity.js": 5 }], 10: [function (require, module, exports) {
			(function (global) {
				'use strict';

				module.exports = {
					_: function () {
						return global._ || require('lodash');
					}(),
					SequentialEvent: function () {
						return global.SequentialEvent || require('sequential-event');
					}(),
					Promise: function () {
						return global.Promise && global.Promise.version ? global.Promise : require('bluebird');
					}()
				};
			}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		}, { "bluebird": "bluebird", "lodash": "lodash", "sequential-event": "sequential-event" }], 11: [function (require, module, exports) {
			(function (process) {
				'use strict';

				var dependencies = require('./dependencies');
				var _ = dependencies._,
				    Promise = dependencies.Promise;

				/**
     * Event emitter that can execute async handlers in sequence
     *
     * @typedef {Object} SequentialEvent
     * @author Gerkin
     * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
     */

				/**
     * @module Diaspora
     */

				var logger = function () {
					if (!process.browser) {
						var winston = require('winston');
						var log = winston.createLogger({
							level: 'silly',
							format: winston.format.json(),
							transports: [
								//
								// - Write to all logs with level `info` and below to `combined.log`
								// - Write all logs error (and below) to `error.log`.
								//
							]
						});

						//
						// If we're not in production then log to the `console` with the format:
						// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
						//
						if (process.env.NODE_ENV !== 'production') {
							log.add(new winston.transports.Console({
								format: winston.format.simple()
							}));
						}
						return log;
					} else {
						return console;
					}
				}();

				var adapters = {};
				var dataSources = {};
				var models = {};

				var ensureAllEntities = function ensureAllEntities(adapter, table) {
					// Filter our results
					var filterResults = function filterResults(entity) {
						// Remap fields
						entity = adapter.remapOutput(table, entity);
						// Force results to be class instances
						if (!(entity instanceof adapter.classEntity) && !_.isNil(entity)) {
							return new adapter.classEntity(entity, adapter);
						}
						return entity;
					};

					return function (results) {
						if (_.isNil(results)) {
							return Promise.resolve();
						} else if (_.isArrayLike(results)) {
							return Promise.resolve(_.map(results, filterResults));
						} else {
							return Promise.resolve(filterResults(results));
						}
					};
				};

				var remapArgs = function remapArgs(args, optIndex, update, queryType, remapFunction) {
					if (false !== optIndex) {
						// Remap input objects
						if (true === args[optIndex].remapInput) {
							args[0] = remapFunction(args[0]);

							if (true === update) {
								args[1] = remapFunction(args[1]);
							}
						}
						args[optIndex].remapInput = false;
					} else if ('insert' === queryType.query) {
						// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
						if ('many' === queryType.number) {
							// If inserting *several* entities, map the array to remap each entity objects...
							args[0] = _.map(args[0], function (insertion) {
								return remapFunction(insertion);
							});
						} else {
							// ... or we are inserting a *single* one. We still need to remap entity.
							args[0] = remapFunction(args[0]);
						}
					}
				};

				var getRemapFunction = function getRemapFunction(adapter, table) {
					return function (query) {
						return adapter.remapInput(table, query);
					};
				};

				var wrapDataSourceAction = function wrapDataSourceAction(callback, queryType, adapter) {
					return function (table) {
						for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
							args[_key - 1] = arguments[_key];
						}

						// Transform arguments for find, update & delete
						var optIndex = false;
						var upd = false;
						if (['find', 'delete'].indexOf(queryType.query) >= 0) {
							// For find & delete, options are 3rd argument (so 2nd item in `args`)
							optIndex = 1;
						} else if ('update' === queryType.query) {
							// For update, options are 4th argument (so 3nd item in `args`), and `upd` flag is toggled on.
							optIndex = 2;
							upd = true;
						}
						try {
							if (false !== optIndex) {
								// Options to canonical
								args[optIndex] = adapter.normalizeOptions(args[optIndex]);
								// Query search to cannonical
								args[0] = adapter.normalizeQuery(args[0], args[optIndex]);
							}
							remapArgs(args, optIndex, upd, queryType, getRemapFunction(adapter, table));
						} catch (err) {
							return Promise.reject(err);
						}

						// Hook after promise resolution
						return callback.call.apply(callback, [adapter, table].concat(args)).then(ensureAllEntities(adapter, table));
					};
				};

				var ERRORS = {
					NON_EMPTY_STR: _.template('<%= c %> <%= p %> must be a non empty string, had "<%= v %>"')
				};

				var requireName = function requireName(classname, value) {
					if (!_.isString(value) && value.length > 0) {
						throw new Error(ERRORS.NON_EMPTY_STR({
							c: classname,
							p: 'name',
							v: value
						}));
					}
				};

				/**
     * Diaspora main namespace
     * @namespace Diaspora
     * @public
     * @author gerkin
     */
				var Diaspora = {
					/**
      * Set default values if required.
      *
      * @author gerkin
      * @param   {Object}         entity    - Entity to set defaults in.
      * @param   {ModelPrototype} modelDesc - Model description.
      * @returns {Object} Entity merged with default values.
      */
					default: function _default(entity, modelDesc) {
						var _this21 = this;

						console.log(entity);
						// Apply method `defaultField` on each field described
						return _.defaults(entity, _.mapValues(modelDesc, function (fieldDesc, field) {
							return _this21.defaultField(entity[field], fieldDesc);
						}));
					},


					/**
      * Set the default on a single field according to its description.
      *
      * @author gerkin
      * @param   {Any}             value     - Value to default.
      * @param   {FieldDescriptor} fieldDesc - Description of the field to default.
      * @returns {Any} Defaulted value.
      */
					defaultField: function defaultField(value, fieldDesc) {
						var out = void 0;
						if (!_.isUndefined(value)) {
							out = value;
						} else {
							out = _.isFunction(fieldDesc.default) ? fieldDesc.default() : fieldDesc.default;
						}
						if ('object' === fieldDesc.type && _.isObject(fieldDesc.attributes) && _.keys(fieldDesc.attributes).length > 0 && !_.isNil(out)) {
							return this.default(out, fieldDesc.attributes);
						} else {
							return out;
						}
					},


					/**
      * Create a data source (usually, a database connection) that may be used by models.
      *
      * @author gerkin
      * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
      * @param   {string} adapterLabel - Label of the adapter used to create the data source.
      * @param   {Object} config       - Configuration hash. This configuration hash depends on the adapter we want to use.
      * @returns {Adapters.DiasporaAdapter} New adapter spawned.
      */
					createDataSource: function createDataSource(adapterLabel, config) {
						if (!adapters.hasOwnProperty(adapterLabel)) {
							try {
								require("diaspora-" + adapterLabel);
							} catch (e) {
								throw new Error("Unknown adapter \"" + adapterLabel + "\". Available currently are " + Object.keys(adapters).join(', ') + ". Additionnaly, an error was thrown: " + e);
							}
						}
						var baseAdapter = new adapters[adapterLabel](config);
						var newDataSource = new Proxy(baseAdapter, {
							get: function get(target, key) {
								// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
								if (_.isString(key)) {
									var method = key.match(/^(find|update|insert|delete)(Many|One)$/);
									if (null !== method) {
										method[2] = method[2].toLowerCase();
										method = _.mapKeys(method.slice(0, 3), function (val, key) {
											return ['full', 'query', 'number'][key];
										});
										return wrapDataSourceAction(target[key], method, target);
									}
								}
								return target[key];
							}
						});
						return newDataSource;
					},


					/**
      * Stores the data source with provided label.
      *
      * @author gerkin
      * @throws  {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
      * @param   {string}          name       - Name associated with this datasource.
      * @param   {DiasporaAdapter} dataSource - Datasource itself.
      * @returns {undefined} This function does not return anything.
      */
					registerDataSource: function registerDataSource(name, dataSource) {
						requireName('DataSource', name);
						if (dataSources.hasOwnProperty(name)) {
							throw new Error("DataSource name already used, had \"" + name + "\"");
						}
						/*		if ( !( dataSource instanceof Diaspora.components.Adapters.Adapter )) {
      	throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
      }*/
						dataSource.name = name;
						_.merge(dataSources, _defineProperty({}, name, dataSource));
						return dataSource;
					},


					/**
      * Create a data source (usually, a database connection) that may be used by models.
      *
      * @author gerkin
      * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
      * @param   {string} sourceName   - Name associated with this datasource.
      * @param   {string} adapterLabel - Label of the adapter used to create the data source.
      * @param   {Object} configHash   - Configuration hash. This configuration hash depends on the adapter we want to use.
      * @returns {Adapters.DiasporaAdapter} New adapter spawned.
      */
					createNamedDataSource: function createNamedDataSource(sourceName, adapterLabel, configHash) {
						var dataSource = Diaspora.createDataSource(adapterLabel, configHash);
						return Diaspora.registerDataSource(sourceName, dataSource);
					},


					/**
      * Create a new Model with provided description.
      *
      * @author gerkin
      * @throws  {Error} Thrown if parameters are incorrect.
      * @param   {string} name      - Name associated with this datasource.
      * @param   {Object} modelDesc - Description of the model to define.
      * @returns {Model} Model created.
      */
					declareModel: function declareModel(name, modelDesc) {
						if (!_.isString(name) && name.length > 0) {
							requireName('Model', name);
						}
						if (!_.isObject(modelDesc)) {
							throw new Error('"modelDesc" must be an object');
						}
						var model = new Diaspora.components.Model(name, modelDesc);
						_.assign(models, _defineProperty({}, name, model));
						return model;
					},


					/**
      * Register a new adapter and make it available to use by models.
      *
      * @author gerkin
      * @throws  {Error} Thrown if an adapter already exists with same label.
      * @throws  {TypeError} Thrown if adapter does not extends {@link Adapters.DiasporaAdapter}.
      * @param   {string}                   label   - Label of the adapter to register.
      * @param   {Adapters.DiasporaAdapter} adapter - The adapter to register.
      * @returns {undefined} This function does not return anything.
      */
					registerAdapter: function registerAdapter(label, adapter) {
						if (adapters.hasOwnProperty(label)) {
							throw new Error("Adapter with label \"" + label + "\" already exists.");
						}
						// Check inheritance of adapter
						/*if ( !( adapter.prototype instanceof Diaspora.components.Adapters.Adapter )) {
      	throw new TypeError( `Trying to register an adapter with label "${ label }", but it does not extends DiasporaAdapter.` );
      }*/
						adapters[label] = adapter;
					},


					/**
      * Hash containing all available models.
      *
      * @type {Object}
      * @property {Model} * - Model associated with that name.
      * @memberof Diaspora
      * @public
      * @author gerkin
      * @see Use {@link Diaspora.declareModel} to add models.
      */
					models: models,

					/**
      * Hash containing all available data sources.
      *
      * @type {Object}
      * @property {Adapters.DiasporaAdapter} * - Instances of adapters declared.
      * @memberof Diaspora
      * @private
      * @author gerkin
      * @see Use {@link Diaspora.createNamedDataSource} or {@link Diaspora.registerDataSource} to make data sources available for models.
      */
					dataSources: dataSources,

					/**
      * Hash containing all available adapters. The only universal adapter is `inMemory`.
      *
      * @type {Object}
      * @property {Adapters.DiasporaAdapter}        *        - Adapter constructor. Those constructors must be subclasses of DiasporaAdapter.
      * @property {Adapters.InMemorDiasporaAdapter} inMemory - InMemoryDiasporaAdapter constructor.
      * @memberof Diaspora
      * @private
      * @author gerkin
      * @see Use {@link Diaspora.registerAdapter} to add adapters.
      */
					adapters: adapters,

					/**
      * Dependencies of Diaspora.
      *
      * @type {Object}
      * @property {Bluebird}        Promise          - Bluebird lib.
      * @property {Lodash}          _                - Lodash lib.
      * @property {SequentialEvent} sequential-event - SequentialEvent lib.
      * @memberof Diaspora
      * @private
      * @author gerkin
      */
					dependencies: dependencies,

					/**
      * Logger used by Diaspora and its adapters. You can use this property to configure winston. On brower environment, this is replaced by a reference to global {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/console Console}.
      *
      * @type {Winston|Console}
      * @memberof Diaspora
      * @public
      * @author gerkin
      */
					logger: logger
				};

				module.exports = Diaspora;

				// Load components after export, so requires of Diaspora returns a complete object
				/**
     * Hash of components exposed by Diaspora.
     *
     * @type {Object}
     * @memberof Diaspora
     * @private
     * @author gerkin
     */
				Diaspora.components = {
					Errors: {
						ExtendableError: require('./errors/extendableError'),
						EntityValidationError: require('./errors/entityValidationError'),
						SetValidationError: require('./errors/setValidationError'),
						EntityStateError: require('./errors/entityStateError')
					}
				};
				_.assign(Diaspora.components, {
					Adapters: {
						Adapter: require('./adapters/base/adapter'),
						Entity: require('./adapters/base/entity')
					}
				});
				_.assign(Diaspora.components, {
					Model: require('./model'),
					EntityFactory: require('./entityFactory'),
					Entity: require('./entityFactory').Entity,
					Set: require('./set'),
					Validator: require('./validator')
				});

				// Register available built-in adapters
				Diaspora.registerAdapter('inMemory', require('./adapters/inMemory/adapter'));
				// Register webStorage only if in browser
				if (process.browser) {
					Diaspora.registerAdapter('webStorage', require('./adapters/webStorage/adapter'));
				}
			}).call(this, require('_process'));
		}, { "./adapters/base/adapter": 4, "./adapters/base/entity": 5, "./adapters/inMemory/adapter": 6, "./adapters/webStorage/adapter": 8, "./dependencies": 10, "./entityFactory": 12, "./errors/entityStateError": 13, "./errors/entityValidationError": 14, "./errors/extendableError": 15, "./errors/setValidationError": 16, "./model": 17, "./set": 18, "./validator": 20, "_process": 21, "winston": undefined }], 12: [function (require, module, exports) {
			'use strict';

			var _require7 = require('./dependencies'),
			    _ = _require7._,
			    Promise = _require7.Promise,
			    SequentialEvent = _require7.SequentialEvent;

			var Diaspora = require('./diaspora');
			var DataStoreEntity = Diaspora.components.Adapters.Entity;
			var EntityStateError = require('./errors/entityStateError');

			/**
    * @module EntityFactory
    */

			var DEFAULT_OPTIONS = { skipEvents: false };
			var PRIVATE = Symbol('PRIVATE');

			var maybeEmit = function maybeEmit(entity, options, eventsArgs, events) {
				events = _.castArray(events);
				if (options.skipEvents) {
					return Promise.resolve(entity);
				} else {
					return entity.emit.apply(entity, [events[0]].concat(_toConsumableArray(eventsArgs))).then(function () {
						if (events.length > 1) {
							return maybeEmit(entity, options, eventsArgs, _.slice(events, 1));
						} else {
							return Promise.resolve(entity);
						}
					});
				}
			};
			var maybeThrowInvalidEntityState = function maybeThrowInvalidEntityState(entity, beforeState, dataSource, method) {
				return function () {
					// Depending on state, we are going to perform a different operation
					if ('orphan' === beforeState) {
						return Promise.reject(new EntityStateError('Can\'t fetch an orphan entity.'));
					} else {
						entity[PRIVATE].lastDataSource = dataSource.name;
						return dataSource[method](entity.table(dataSource.name), entity.uidQuery(dataSource));
					}
				};
			};

			var entityCtrSteps = {
				bindLifecycleEvents: function bindLifecycleEvents(entity, modelDesc) {
					// Bind lifecycle events
					_.forEach(modelDesc.lifecycleEvents, function (eventFunctions, eventName) {
						// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
						_.forEach(_.castArray(eventFunctions), function (eventFunction) {
							entity.on(eventName, eventFunction);
						});
					});
				},
				loadSource: function loadSource(entity, source) {
					// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
					if (source instanceof DataStoreEntity) {
						var _entity = entity[PRIVATE];
						_.assign(_entity, {
							state: 'sync',
							lastDataSource: source.dataSource.name
						});
						_entity.dataSources[_entity.lastDataSource] = source;
						source = entity.deserialize(_.omit(source.toObject(), ['id']));
					}
					return source;
				}
			};

			/**
    * The entity is the class you use to manage a single document in all data sources managed by your model.
    * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
    *
    * @extends SequentialEvent
    */

			var Entity = function (_SequentialEvent2) {
				_inherits(Entity, _SequentialEvent2);

				/**
     * Create a new entity.
     *
     * @author gerkin
     * @param {string}                                   name        - Name of this model.
     * @param {ModelDescription}                         modelDesc   - Model configuration that generated the associated `model`.
     * @param {Model}                                    model       - Model that will spawn entities.
     * @param {Object|DataStoreEntities.DataStoreEntity} [source={}] - Hash with properties to copy on the new object.
     *        If provided object inherits DataStoreEntity, the constructed entity is built in `sync` state.
     */
				function Entity(name, modelDesc, model) {
					var source = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

					_classCallCheck(this, Entity);

					var modelAttrsKeys = _.keys(modelDesc.attributes);

					// ### Init defaults
					var _this22 = _possibleConstructorReturn(this, (Entity.__proto__ || Object.getPrototypeOf(Entity)).call(this));

					var dataSources = Object.seal(_.mapValues(model.dataSources, function () {
						return undefined;
					}));
					var _this = {
						state: 'orphan',
						lastDataSource: null,
						dataSources: dataSources,
						name: name,
						modelDesc: modelDesc,
						model: model
					};
					_this22[PRIVATE] = _this;
					// ### Load datas from source
					source = entityCtrSteps.loadSource(_this22, source);
					// ### Final validation
					// Check keys provided in source
					var sourceDModel = _.difference(source, modelAttrsKeys);
					if (0 !== sourceDModel.length) {
						// Later, add a criteria for schemaless models
						throw new Error("Source has unknown keys: " + JSON.stringify(sourceDModel) + " in " + JSON.stringify(source));
					}
					// ### Generate prototype & attributes
					// Now we know that the source is valid. Deep clone to detach object values from entity then Default model attributes with our model desc
					_this.attributes = Diaspora.default(_.cloneDeep(source), modelDesc.attributes);
					source = null;

					// ### Load events
					entityCtrSteps.bindLifecycleEvents(_this22, modelDesc);
					return _this22;
				}

				/**
     * Generate the query to get this unique entity in the desired data source.
     *
     * @author gerkin
     * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
     * @returns {Object} Query to find this entity.
     */


				_createClass(Entity, [{
					key: "uidQuery",
					value: function uidQuery(dataSource) {
						return {
							id: this[PRIVATE].attributes.idHash[dataSource.name]
						};
					}

					/**
      * Return the table of this entity in the specified data source.
      *
      * @author gerkin
      * @returns {string} Name of the table.
      */

				}, {
					key: "table",
					value: function table() /*sourceName*/{
						// Will be used later
						return this[PRIVATE].name;
					}

					/**
      * Check if the entity matches model description.
      *
      * @author gerkin
      * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
      * @returns {undefined} This function does not return anything.
      * @see Validator.Validator#validate
      */

				}, {
					key: "validate",
					value: function validate() {
						this.constructor.model.validator.validate(this[PRIVATE].attributes);
					}

					/**
      * Remove all editable properties & replace them with provided object.
      *
      * @author gerkin
      * @param   {Object} [newContent={}] - Replacement content.
      * @returns {module:EntityFactory~Entity} Returns `this`.
      */

				}, {
					key: "replaceAttributes",
					value: function replaceAttributes() {
						var newContent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						newContent.idHash = this[PRIVATE].attributes.idHash;
						this[PRIVATE].attributes = newContent;
						return this;
					}

					/**
      * Generate a diff update query by checking deltas with last source interaction.
      *
      * @author gerkin
      * @param   {Adapters.DiasporaAdapter} dataSource - Data source to diff with.
      * @returns {Object} Diff query.
      */

				}, {
					key: "getDiff",
					value: function getDiff(dataSource) {
						var _this23 = this;

						var dataStoreEntity = this[PRIVATE].dataSources[dataSource.name];
						var dataStoreObject = dataStoreEntity.toObject();

						var keys = _(this[PRIVATE].attributes).keys().concat(_.keys(dataStoreObject)).uniq().difference(['idHash']).value();
						var values = _(keys).filter(function (key) {
							return _this23[PRIVATE].attributes[key] !== dataStoreObject[key];
						}).map(function (key) {
							return _this23[PRIVATE].attributes[key];
						}).value();
						var diff = _.zipObject(keys, values);
						return diff;
					}

					/**
      * Returns a copy of this entity attributes.
      *
      * @author gerkin
      * @returns {Object} Attributes of this entity.
      */

				}, {
					key: "toObject",
					value: function toObject() {
						return this[PRIVATE].attributes;
					}

					/**
      * Applied before persisting the entity, this function is in charge to convert entity convinient attributes to a raw entity.
      *
      * @author gerkin
      * @param   {Object} data - Data to convert to primitive types.
      * @returns {Object} Object with Primitives-only types.
      */

				}, {
					key: "serialize",
					value: function serialize(data) {
						return _.cloneDeep(data);
					}

					/**
      * Applied after retrieving the entity, this function is in charge to convert entity raw attributes to convinient types.
      *
      * @author gerkin
      * @param   {Object} data - Data to convert from primitive types.
      * @returns {Object} Object with Primitives & non primitives types.
      */

				}, {
					key: "deserialize",
					value: function deserialize(data) {
						return _.cloneDeep(data);
					}

					/**
      * Save this entity in specified data source.
      *
      * @fires EntityFactory.Entity#beforeUpdate
      * @fires EntityFactory.Entity#afterUpdate
      * @author gerkin
      * @param   {string}  sourceName                 - Name of the data source to persist entity in.
      * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
      * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeUpdate` and `afterUpdate`.
      * @returns {Promise} Promise resolved once entity is saved. Resolved with `this`.
      */

				}, {
					key: "persist",
					value: function persist(sourceName) {
						var _this24 = this;

						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

						_.defaults(options, DEFAULT_OPTIONS);
						// Change the state of the entity
						var beforeState = this[PRIVATE].state;
						this[PRIVATE].state = 'syncing';
						// Generate events args
						var dataSource = this.constructor.model.getDataSource(sourceName);
						var eventsArgs = [dataSource.name];
						var _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);

						// Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
						var suffix = 'orphan' === beforeState ? 'Create' : 'Update';
						return _maybeEmit(['beforePersist', 'beforeValidate']).then(function () {
							return _this24.validate();
						}).then(function () {
							return _maybeEmit(['afterValidate', "beforePersist" + suffix]);
						}).then(function () {
							_this24[PRIVATE].lastDataSource = dataSource.name;
							// Depending on state, we are going to perform a different operation
							if ('orphan' === beforeState) {
								return dataSource.insertOne(_this24.table(sourceName), _this24.toObject());
							} else {
								return dataSource.updateOne(_this24.table(sourceName), _this24.uidQuery(dataSource), _this24.getDiff(dataSource));
							}
						}).then(function (dataStoreEntity) {
							_this24[PRIVATE].state = 'sync';
							_this24[PRIVATE].attributes = dataStoreEntity.toObject();
							_this24[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;

							return _maybeEmit(["afterPersist" + suffix, 'afterPersist']);
						});
					}

					/**
      * Reload this entity from specified data source.
      *
      * @fires EntityFactory.Entity#beforeFind
      * @fires EntityFactory.Entity#afterFind
      * @author gerkin
      * @param   {string}  sourceName                 - Name of the data source to fetch entity from.
      * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
      * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeFind` and `afterFind`.
      * @returns {Promise} Promise resolved once entity is reloaded. Resolved with `this`.
      */

				}, {
					key: "fetch",
					value: function fetch(sourceName) {
						var _this25 = this;

						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

						_.defaults(options, DEFAULT_OPTIONS);
						// Change the state of the entity
						var beforeState = this[PRIVATE].state;
						this[PRIVATE].state = 'syncing';
						// Generate events args
						var dataSource = this.constructor.model.getDataSource(sourceName);
						var eventsArgs = [dataSource.name, this.serialize(this[PRIVATE].attributes)];
						var _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);
						return _maybeEmit('beforeFetch').then(maybeThrowInvalidEntityState(this, beforeState, dataSource, 'findOne')).then(function (dataStoreEntity) {
							_this25[PRIVATE].state = 'sync';
							_this25[PRIVATE].attributes = dataStoreEntity.toObject();
							_this25[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;

							return _maybeEmit('afterFetch');
						});
					}

					/**
      * Delete this entity from the specified data source.
      *
      * @fires EntityFactory.Entity#beforeDelete
      * @fires EntityFactory.Entity#afterDelete
      * @author gerkin
      * @param   {string}  sourceName                 - Name of the data source to delete entity from.
      * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
      * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeDelete` and `afterDelete`.
      * @returns {Promise} Promise resolved once entity is destroyed. Resolved with `this`.
      */

				}, {
					key: "destroy",
					value: function destroy(sourceName) {
						var _this26 = this;

						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

						_.defaults(options, DEFAULT_OPTIONS);
						// Change the state of the entity
						var beforeState = this[PRIVATE].state;
						this[PRIVATE].state = 'syncing';
						// Generate events args
						var dataSource = this.constructor.model.getDataSource(sourceName);
						var eventsArgs = [dataSource.name];
						var _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);
						return _maybeEmit('beforeDestroy').then(maybeThrowInvalidEntityState(this, beforeState, dataSource, 'deleteOne')).then(function () {
							// If this was our only data source, then go back to orphan state
							if (0 === _.without(_this26[PRIVATE].model.dataSources, dataSource.name).length) {
								_this26[PRIVATE].state = 'orphan';
							} else {
								_this26[PRIVATE].state = 'sync';
								delete _this26[PRIVATE].attributes.idHash[dataSource.name];
							}
							_this26[PRIVATE].dataSources[dataSource.name] = undefined;
							return _maybeEmit('afterDestroy');
						});
					}

					/**
      * Hash that links each data source with its name. This object is prepared with keys from model sources, and sealed.
      *
      * @type {Object}
      * @author gerkin
      */

				}, {
					key: "dataSources",
					get: function get() {
						return this[PRIVATE].dataSources;
					}

					/**
      * TODO.
      *
      * @type {TODO}
      * @author gerkin
      */

				}, {
					key: "attributes",
					get: function get() {
						return this[PRIVATE].attributes;
					}

					/**
      * Get entity's current state.
      *
      * @type {Entity.State}
      * @author gerkin
      */

				}, {
					key: "state",
					get: function get() {
						return this[PRIVATE].state;
					}

					/**
      * Get entity's last data source.
      *
      * @type {null|string}
      * @author gerkin
      */

				}, {
					key: "lastDataSource",
					get: function get() {
						return this[PRIVATE].lastDataSource;
					}
				}]);

				return Entity;
			}(SequentialEvent);

			/**
    * This factory function generate a new class constructor, prepared for a specific model.
    *
    * @method EntityFactory
    * @public
    * @static
    * @param   {string}           name       - Name of this model.
    * @param   {ModelDescription} modelDesc  - Model configuration that generated the associated `model`.
    * @param   {Model}            model      - Model that will spawn entities.
    * @returns {module:EntityFactory~Entity} Entity constructor to use with this model.
    * @property {module:EntityFactory~Entity} Entity Entity constructor
    */


			var EntityFactory = function EntityFactory(name, modelDesc, model) {
				/**
     * @ignore
     */
				var SubEntity = function (_Entity) {
					_inherits(SubEntity, _Entity);

					function SubEntity() {
						_classCallCheck(this, SubEntity);

						return _possibleConstructorReturn(this, (SubEntity.__proto__ || Object.getPrototypeOf(SubEntity)).apply(this, arguments));
					}

					_createClass(SubEntity, null, [{
						key: "name",

						/**
       * Name of the class.
       *
       * @type {string}
       * @author gerkin
       */
						get: function get() {
							return name + "Entity";
						}

						/**
       * Reference to this entity's model.
       *
       * @type {Model}
       * @author gerkin
       */

					}, {
						key: "model",
						get: function get() {
							return model;
						}
					}]);

					return SubEntity;
				}(Entity);
				// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
				// Extend prototype with methods in our model description


				_.forEach(modelDesc.methods, function (method, methodName) {
					SubEntity.prototype[methodName] = method;
				});
				// Add static methods
				_.forEach(modelDesc.staticMethods, function (staticMethodName, staticMethod) {
					SubEntity[staticMethodName] = staticMethod;
				});
				return SubEntity.bind(SubEntity, name, modelDesc, model);
			};
			EntityFactory.Entity = Entity;
			// =====
			// ## Lifecycle Events

			// -----
			// ### Persist

			/**
    * @event EntityFactory.Entity#beforePersist
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#beforeValidate
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#afterValidate
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#beforePersistCreate
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#beforePersistUpdate
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#afterPersistCreate
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#afterPersistUpdate
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#afterPersist
    * @type {String}
    */

			// -----
			// ### Find

			/**
    * @event EntityFactory.Entity#beforeFind
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#afterFind
    * @type {String}
    */

			// -----
			// ### Destroy

			/**
    * @event EntityFactory.Entity#beforeDestroy
    * @type {String}
    */

			/**
    * @event EntityFactory.Entity#afterDestroy
    * @type {String}
    */

			module.exports = EntityFactory;
		}, { "./dependencies": 10, "./diaspora": 11, "./errors/entityStateError": 13 }], 13: [function (require, module, exports) {
			'use strict';

			var ExtendableError = require('./extendableError');

			/**
    * @module Errors/EntityStateError
    */

			/**
    * This class represents an error related to validation.
    * @extends module:Errors/ExtendableError~ExtendableError
    */

			var EntityStateError = function (_ExtendableError) {
				_inherits(EntityStateError, _ExtendableError);

				/**
     * Construct a new error related to an invalide state of the entity.
     * 
     * @author gerkin
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
				function EntityStateError() {
					var _ref3;

					_classCallCheck(this, EntityStateError);

					for (var _len2 = arguments.length, errorArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
						errorArgs[_key2] = arguments[_key2];
					}

					return _possibleConstructorReturn(this, (_ref3 = EntityStateError.__proto__ || Object.getPrototypeOf(EntityStateError)).call.apply(_ref3, [this].concat(errorArgs)));
				}

				return EntityStateError;
			}(ExtendableError);

			module.exports = EntityStateError;
		}, { "./extendableError": 15 }], 14: [function (require, module, exports) {
			'use strict';

			var _require8 = require('../dependencies'),
			    _ = _require8._;

			var ExtendableError = require('./extendableError');

			var stringifyValidationObject = function stringifyValidationObject(validationErrors) {
				return _(validationErrors).mapValues(function (error, key) {
					return key + " => " + JSON.stringify(error.value) + "\n* " + _(error).omit(['value']).values().map(_.identity).value();
				}).values().join('\n* ');
			};

			/**
    * @module Errors/EntityValidationError
    */

			/**
    * This class represents an error related to validation.
    *
    * @extends module:Errors/ExtendableError~ExtendableError
    */

			var EntityValidationError = function (_ExtendableError2) {
				_inherits(EntityValidationError, _ExtendableError2);

				/**
     * Construct a new validation error.
     *
     * @author gerkin
     * @param {Object} validationErrors - Object describing validation errors, usually returned by {@link Diaspora.check}.
     * @param {string} message          - Message of this error.
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
				function EntityValidationError(validationErrors, message) {
					var _ref4;

					_classCallCheck(this, EntityValidationError);

					message += "\n" + stringifyValidationObject(validationErrors);

					for (var _len3 = arguments.length, errorArgs = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
						errorArgs[_key3 - 2] = arguments[_key3];
					}

					var _this29 = _possibleConstructorReturn(this, (_ref4 = EntityValidationError.__proto__ || Object.getPrototypeOf(EntityValidationError)).call.apply(_ref4, [this, message].concat(errorArgs)));

					_this29.validationErrors = validationErrors;
					return _this29;
				}

				return EntityValidationError;
			}(ExtendableError);

			module.exports = EntityValidationError;
		}, { "../dependencies": 10, "./extendableError": 15 }], 15: [function (require, module, exports) {
			'use strict';

			/**
    * @module Errors/ExtendableError
    */

			/**
    * This class is the base class for custom Diaspora errors
    *
    * @extends Error
    */

			var ExtendableError = function (_Error) {
				_inherits(ExtendableError, _Error);

				/**
     * Construct a new extendable error.
     *
     * @author gerkin
     * @param {string} message          - Message of this error.
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
				function ExtendableError(message) {
					var _ref5;

					_classCallCheck(this, ExtendableError);

					for (var _len4 = arguments.length, errorArgs = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
						errorArgs[_key4 - 1] = arguments[_key4];
					}

					//		this.constructor = super.target;
					//		this.__proto__ = super.target;
					var _this30 = _possibleConstructorReturn(this, (_ref5 = ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call.apply(_ref5, [this, message].concat(errorArgs)));

					if ('function' === typeof Error.captureStackTrace) {
						Error.captureStackTrace(_this30, _get(ExtendableError.prototype.__proto__ || Object.getPrototypeOf(ExtendableError.prototype), "target", _this30));
					} else {
						_this30.stack = new Error(message).stack;
					}
					return _this30;
				}

				return ExtendableError;
			}(Error);

			module.exports = ExtendableError;
		}, {}], 16: [function (require, module, exports) {
			'use strict';

			var _require9 = require('../dependencies'),
			    _ = _require9._;

			var ExtendableError = require('./extendableError');

			/**
    * @module Errors/SetValidationError
    */

			/**
    * This class represents an error related to validation on a set.
    *
    * @extends module:Errors/ExtendableError~ExtendableError
    */

			var SetValidationError = function (_ExtendableError3) {
				_inherits(SetValidationError, _ExtendableError3);

				/**
     * Construct a new validation error.
     *
     * @author gerkin
     * @see Diaspora.check
     * @param {string}                                                      message          - Message of this error.
     * @param {module:Errors/EntityValidationError~EntityValidationError[]} validationErrors - Array of validation errors.
     * @param {*}                                                           errorArgs        - Arguments to transfer to parent Error.
     */
				function SetValidationError(message, validationErrors) {
					var _ref6;

					_classCallCheck(this, SetValidationError);

					message += "[\n" + _(validationErrors).map(function (error, index) {
						if (_.isNil(error)) {
							return false;
						} else {
							return index + ": " + error.message.replace(/\n/g, '\n	');
						}
					}).filter(_.identity).join(',\n') + "\n]";

					for (var _len5 = arguments.length, errorArgs = Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
						errorArgs[_key5 - 2] = arguments[_key5];
					}

					var _this31 = _possibleConstructorReturn(this, (_ref6 = SetValidationError.__proto__ || Object.getPrototypeOf(SetValidationError)).call.apply(_ref6, [this, message].concat(errorArgs)));

					_this31.validationErrors = validationErrors;
					return _this31;
				}

				return SetValidationError;
			}(ExtendableError);

			module.exports = SetValidationError;
		}, { "../dependencies": 10, "./extendableError": 15 }], 17: [function (require, module, exports) {
			'use strict';

			var _require10 = require('./dependencies'),
			    _ = _require10._,
			    Promise = _require10.Promise;

			var EntityFactory = require('./entityFactory');
			var Diaspora = require('./diaspora');
			var Set = require('./set');
			var Validator = require('./validator');

			var entityPrototypeProperties = EntityFactory.entityPrototypeProperties;

			/**
    * @module Model
    */

			/**
    * Object describing a model.
    *
    * @typedef  {Object} ModelConfiguration.ModelDescription
    * @author gerkin
    * @property {ModelConfiguration.SourcesDescriptor}    sources         - List of sources to use with this model.
    * @property {ModelConfiguration.AttributesDescriptor} attributes      - Attributes of the model.
    * @property {Object<string, Function>}                methods         - Methods to add to entities prototype.
    * @property {Object<string, Function>}                staticMethods   - Static methods to add to entities.
    * @property {Object<string, Function|Function[]>}     lifecycleEvents - Events to bind on entities.
    */

			var findArgs = function findArgs(model) {
				var queryFind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
				var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
				var dataSourceName = arguments[3];

				var ret = void 0;
				if (_.isString(options) && !!_.isNil(dataSourceName)) {
					ret = {
						dataSourceName: options,
						options: {}
					};
				} else if (_.isString(queryFind) && !!_.isNil(options) && !!_.isNil(dataSourceName)) {
					ret = {
						dataSourceName: queryFind,
						queryFind: {},
						options: {}
					};
				} else {
					ret = {
						queryFind: queryFind,
						options: options,
						dataSourceName: dataSourceName
					};
				}
				ret.dataSource = model.getDataSource(ret.dataSourceName);
				return ret;
			};

			var makeSet = function makeSet(model) {
				return function (dataSourceEntities) {
					var newEntities = _.map(dataSourceEntities, function (dataSourceEntity) {
						return new model.entityFactory(dataSourceEntity);
					});
					var set = new Set(model, newEntities);
					return Promise.resolve(set);
				};
			};
			var makeEntity = function makeEntity(model) {
				return function (dataSourceEntity) {
					if (_.isNil(dataSourceEntity)) {
						return Promise.resolve();
					}
					var newEntity = new model.entityFactory(dataSourceEntity);
					return Promise.resolve(newEntity);
				};
			};

			var doDelete = function doDelete(methodName, model) {
				return function () {
					var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
					var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					var dataSourceName = arguments[2];

					var args = findArgs(model, queryFind, options, dataSourceName);
					return args.dataSource[methodName](model.name, args.queryFind, args.options);
				};
			};

			var doFindUpdate = function doFindUpdate(model, plural, queryFind, options, dataSourceName, update) {
				var _queryComponents$data;

				var queryComponents = findArgs(model, queryFind, options, dataSourceName);
				var args = _([model.name, queryComponents.queryFind]).push(update).push(queryComponents.options).compact().value();
				return (_queryComponents$data = queryComponents.dataSource)[(update ? 'update' : 'find') + (plural ? 'Many' : 'One')].apply(_queryComponents$data, _toConsumableArray(args)).then((plural ? makeSet : makeEntity)(model));
			};

			var normalizeRemaps = function normalizeRemaps(modelDesc) {
				var sources = modelDesc.sources;
				if (_.isString(sources)) {
					sources = _defineProperty({}, modelDesc.sources, true);
				} else if (_.isArrayLike(sources)) {
					sources = _.zipObject(sources, _.times(sources.length, _.constant({})));
				} else {
					sources = _.mapValues(sources, function (remap, dataSourceName) {
						if (true === remap) {
							return {};
						} else if (_.isObject(remap)) {
							return remap;
						} else {
							throw new TypeError("Datasource \"" + dataSourceName + "\" value is invalid: expect `true` or a remap hash, but have " + JSON.stringify(remap));
						}
					});
				}
				return sources;
			};

			/**
    * The model class is used to interact with the population of all data of the same type.
    */

			var Model = function () {
				/**
     * Create a new Model that is allowed to interact with all entities of data sources tables selected.
     *
     * @author gerkin
     * @param {string}                              name      - Name of the model.
     * @param {ModelConfiguration.ModelDescription} modelDesc - Hash representing the configuration of the model.
     */
				function Model(name, modelDesc) {
					_classCallCheck(this, Model);

					// Check model configuration
					var reservedPropIntersect = _.intersection(entityPrototypeProperties, _.keys(modelDesc.attributes));
					if (0 !== reservedPropIntersect.length) {
						throw new Error(JSON.stringify(reservedPropIntersect) + " is/are reserved property names. To match those column names in data source, please use the data source mapper property");
					} else if (!modelDesc.hasOwnProperty('sources') || !(_.isArrayLike(modelDesc.sources) || _.isObject(modelDesc.sources))) {
						throw new TypeError("Expect model sources to be either an array or an object, had " + JSON.stringify(modelDesc.sources) + ".");
					}
					// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
					var sourcesNormalized = normalizeRemaps(modelDesc);
					// List sources required by this model
					var _ref7 = [_.keys(sourcesNormalized), Diaspora.dataSources],
					    sourceNames = _ref7[0],
					    scopeAvailableSources = _ref7[1];

					var modelSources = _.pick(scopeAvailableSources, sourceNames);
					var missingSources = _.difference(sourceNames, _.keys(modelSources));
					if (0 !== missingSources.length) {
						throw new Error("Missing data sources " + missingSources.map(function (v) {
							return "\"" + v + "\"";
						}).join(', '));
					}

					// Now, we are sure that config is valid. We can configure our datasources with model options, and set `this` properties.
					_.forEach(sourcesNormalized, function (remap, sourceName) {
						var sourceConfiguring = modelSources[sourceName];
						sourceConfiguring.configureCollection(name, remap);
					});
					_.assign(this, {
						dataSources: modelSources,
						defaultDataSource: sourceNames[0],
						name: name,
						entityFactory: EntityFactory(name, modelDesc, this),
						validator: new Validator(modelDesc.attributes)
					});
				}

				/**
     * Create a new Model that is allowed to interact with all entities of data sources tables selected.
     *
     * @author gerkin
     * @throws  {Error} Thrown if requested source name does not exists.
     * @param   {string} [sourceName=Model.defaultDataSource] - Name of the source to get. It corresponds to one of the sources you set in {@link Model#modelDesc}.sources.
     * @returns {Adapters.DiasporaAdapter} Source adapter with requested name.
     */


				_createClass(Model, [{
					key: "getDataSource",
					value: function getDataSource(sourceName) {
						if (_.isNil(sourceName)) {
							sourceName = this.defaultDataSource;
						} else if (!this.dataSources.hasOwnProperty(sourceName)) {
							throw new Error("Unknown data source \"" + sourceName + "\" in model \"" + this.name + "\", available are " + _.keys(this.dataSources).map(function (v) {
								return "\"" + v + "\"";
							}).join(', '));
						}
						return this.dataSources[sourceName];
					}

					/**
      * Create a new *orphan* {@link Entity entity}.
      *
      * @author gerkin
      * @param   {Object} source - Object to copy attributes from.
      * @returns {Entity} New *orphan* entity.
      */

				}, {
					key: "spawn",
					value: function spawn(source) {
						var newEntity = new this.entityFactory(source);
						return newEntity;
					}

					/**
      * Create multiple new *orphan* {@link Entity entities}.
      *
      * @author gerkin
      * @param   {Object[]} sources - Array of objects to copy attributes from.
      * @returns {Set} Set with new *orphan* entities.
      */

				}, {
					key: "spawnMany",
					value: function spawnMany(sources) {
						var _this32 = this;

						return new Set(this, _.map(sources, function (source) {
							return _this32.spawn(source);
						}));
					}

					/**
      * Insert a raw source object in the data store.
      *
      * @author gerkin
      * @param   {Object} source                                   - Object to copy attributes from.
      * @param   {string} [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
      * @returns {Promise} Promise resolved with new *sync* {@link Entity entity}.
      */

				}, {
					key: "insert",
					value: function insert(source, dataSourceName) {
						var _this33 = this;

						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.insertOne(this.name, source).then(function (entity) {
							return Promise.resolve(new _this33.entityFactory(entity));
						});
					}

					/**
      * Insert multiple raw source objects in the data store.
      *
      * @author gerkin
      * @param   {Object[]} sources                                  - Array of object to copy attributes from.
      * @param   {string}   [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
      * @returns {Promise} Promise resolved with a {@link Set set} containing new *sync* entities.
      */

				}, {
					key: "insertMany",
					value: function insertMany(sources, dataSourceName) {
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.insertMany(this.name, sources).then(makeSet(this));
					}

					/**
      * Retrieve a single entity from specified data source that matches provided `queryFind` and `options`.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
      * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
      * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
      * @returns {Promise} Promise resolved with the found {@link Entity entity} in *sync* state.
      */

				}, {
					key: "find",
					value: function find(queryFind, options, dataSourceName) {
						return doFindUpdate(this, false, queryFind, options, dataSourceName);
					}

					/**
      * Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
      * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
      * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
      * @returns {Promise} Promise resolved with a {@link Set set} of found entities in *sync* state.
      */

				}, {
					key: "findMany",
					value: function findMany(queryFind, options, dataSourceName) {
						return doFindUpdate(this, true, queryFind, options, dataSourceName);
					}

					/**
      * Update a single entity from specified data source that matches provided `queryFind` and `options`.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
      * @param   {Object}                               update                                   - Attributes to update on matched set.
      * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
      * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
      * @returns {Promise} Promise resolved with the updated {@link Entity entity} in *sync* state.
      */

				}, {
					key: "update",
					value: function update(queryFind, _update) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
						var dataSourceName = arguments[3];

						return doFindUpdate(this, false, queryFind, options, dataSourceName, _update);
					}

					/**
      * Update multiple entities from specified data source that matches provided `queryFind` and `options`.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
      * @param   {Object}                               update                                   - Attributes to update on matched set.
      * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
      * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
      * @returns {Promise} Promise resolved with the {@link Set set} of found entities in *sync* state.
      */

				}, {
					key: "updateMany",
					value: function updateMany(queryFind, update) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
						var dataSourceName = arguments[3];

						return doFindUpdate(this, true, queryFind, options, dataSourceName, update);
					}

					/**
      * Delete a single entity from specified data source that matches provided `queryFind` and `options`.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind]                           - Query to get desired entity.
      * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
      * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
      * @returns {Promise} Promise resolved with `undefined`.
      */

				}, {
					key: "delete",
					value: function _delete(queryFind) {
						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
						var dataSourceName = arguments[2];

						return doDelete('deleteOne', this)(queryFind, options, dataSourceName);
					}

					/**
      * Delete multiple entities from specified data source that matches provided `queryFind` and `options`.
      *
      * @author gerkin
      * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
      * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
      * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
      * @returns {Promise} Promise resolved with `undefined`.
      */

				}, {
					key: "deleteMany",
					value: function deleteMany() {
						var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
						var dataSourceName = arguments[2];

						return doDelete('deleteMany', this)(queryFind, options, dataSourceName);
					}
				}]);

				return Model;
			}();

			module.exports = Model;
		}, { "./dependencies": 10, "./diaspora": 11, "./entityFactory": 12, "./set": 18, "./validator": 20 }], 18: [function (require, module, exports) {
			'use strict';

			var _require11 = require('./dependencies'),
			    _ = _require11._,
			    Promise = _require11.Promise;

			var Utils = require('./utils');
			var SetValidationError = require('./errors/setValidationError');

			/**
    * @module Set
    */

			/**
    * Get the verb of the action (either the `verb` param or the string at the `index` position in `verb` array).
    *
    * @author Gerkin
    * @inner
    * @param   {string|string[]} verb - Verbs to get item from.
    * @param   {integer} index        - Index of the verb to pick.
    * @returns {string} Verb for this index's item.
    */
			var getVerb = function getVerb(verb, index) {
				return _.isArray(verb) ? verb[index] : verb;
			};

			/**
    * Emit events on each entities.
    *
    * @author Gerkin
    * @inner
    * @param   {SequentialEvent[]} entities - Items to iterate over.
    * @param   {string|string[]}   verb     - Verb of the action to emit.
    * @param   {string}            prefix   - Prefix to prepend to the verb.
    * @returns {Promise} Promise resolved once all promises are done.
    */
			var allEmit = function allEmit(entities, verb, prefix) {
				return Promise.all(entities.map(function (entity, index) {
					return entity.emit("" + prefix + getVerb(verb, index));
				}));
			};

			/**
    * Emit `before` & `after` events around the entity action. `this` must be bound to the calling {@link Set}.
    *
    * @author Gerkin
    * @inner
    * @this Set
    * @param   {string} sourceName    - Name of the data source to interact with.
    * @param   {string} action        - Name of the entity function to apply.
    * @param   {string|string[]} verb - String or array of strings to map for events suffix.
    * @returns {Promise} Promise resolved once events are finished.
    */
			function wrapEventsAction(sourceName, action, verb) {
				var _this34 = this;

				var _allEmit = _.partial(allEmit, this.entities, verb);
				return _allEmit('before').then(function () {
					return Promise.all(_this34.entities.map(function (entity) {
						return entity[action](sourceName, {
							skipEvents: true
						});
					}));
				}).then(function () {
					return _allEmit('after');
				});
			}

			var setProxyProps = {
				get: function get(target, prop) {
					if (prop in target) {
						return target[prop];
					} else if (prop in target.entities) {
						return target.entities[prop];
					} else if ('string' === typeof prop && prop.match(/^-?\d+$/) && target.entities.nth(parseInt(prop))) {
						return target.entities.nth(parseInt(prop));
					}
				},
				set: function set(target, prop, val) {
					if ('model' === prop) {
						return new Error('Can\'t assign to read-only property "model".');
					} else if ('entities' === prop) {
						Set.checkEntitiesFromModel(val, target.model);
						target.entities = _(val);
					}
				}
			};

			/**
    * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
    */

			var Set = function () {
				/**
     * Create a new set, managing provided `entities` that must be generated from provided `model`.
     *
     * @param {Model}           model    - Model describing entities managed by this set.
     * @param {Entity|Entity[]} entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
     */
				function Set(model) {
					for (var _len6 = arguments.length, entities = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
						entities[_key6 - 1] = arguments[_key6];
					}

					_classCallCheck(this, Set);

					// Flatten arguments
					entities = _(entities).flatten();
					// Check if each entity is from the expected model
					Set.checkEntitiesFromModel(entities.value(), model);

					var defined = Utils.defineEnumerableProperties(this, {
						/**
       * List entities of this set.
       *
       * @name entities
       * @readonly
       * @memberof Set
       * @instance
       * @type {LodashWrapper<Entity>}
       * @author Gerkin
       */
						entities: entities,
						/**
       * Model that generated this set.
       *
       * @name model
       * @readonly
       * @memberof Set
       * @instance
       * @type {Model}
       * @author Gerkin
       */
						model: model,
						/**
       * Number of entities in this set.
       *
       * @name length
       * @readonly
       * @memberof Set
       * @instance
       * @type {Integer}
       * @author Gerkin
       */
						length: {
							get: function get() {
								return this.entities.size();
							}
						}
					});

					return new Proxy(defined, setProxyProps);
				}

				/**
     * Check if all entities in the first argument are from the expected model.
     *
     * @author gerkin
     * @throws {TypeError} Thrown if one of the entity is not from provided `model`.
     * @param {Entity[]} entities - Array of entities to check.
     * @param {Model}    model    - Model expected to be the source of all entities.
     * @returns {undefined} This function does not return anything.
     */


				_createClass(Set, [{
					key: "persist",


					/**
      * Persist all entities of this collection.
      *
      * @fires EntityFactory.Entity#beforeUpdate
      * @fires EntityFactory.Entity#afterUpdate
      * @author gerkin
      * @param {string} sourceName - Data source name to persist in.
      * @returns {Promise} Promise resolved once all items are persisted.
      * @see {@link EntityFactory.Entity#persist}
      */
					value: function persist(sourceName) {
						var _this35 = this;

						var suffixes = this.entities.map(function (entity) {
							return 'orphan' === entity.state ? 'Create' : 'Update';
						}).value();
						var _allEmit = _.partial(allEmit, this.entities);
						return _allEmit('Persist', 'before').then(function () {
							return _allEmit('Validate', 'before');
						}).then(function () {
							var errors = 0;
							var validationResults = _this35.entities.map(function (entity) {
								try {
									entity.validate();
									return undefined;
								} catch (e) {
									errors++;
									return e;
								}
							}).value();
							if (errors > 0) {
								return Promise.reject(new SetValidationError("Set validation failed for " + errors + " elements (on " + _this35.length + "): ", validationResults));
							} else {
								return Promise.resolve();
							}
						}).then(function () {
							return _allEmit('Validate', 'after');
						}).then(function () {
							return wrapEventsAction.call(_this35, sourceName, 'persist', _.map(suffixes, function (suffix) {
								return "Persist" + suffix;
							}));
						}).then(function () {
							return _allEmit('Persist', 'after');
						}).then(function () {
							return _this35;
						});
					}

					/**
      * Reload all entities of this collection.
      *
      * @fires EntityFactory.Entity#beforeFind
      * @fires EntityFactory.Entity#afterFind
      * @author gerkin
      * @param {string} sourceName - Data source name to reload entities from.
      * @returns {Promise} Promise resolved once all items are reloaded.
      * @see {@link EntityFactory.Entity#fetch}
      */

				}, {
					key: "fetch",
					value: function fetch(sourceName) {
						var _this36 = this;

						return wrapEventsAction.call(this, sourceName, 'fetch', 'Fetch').then(function () {
							return _this36;
						});
					}

					/**
      * Destroy all entities from this collection.
      *
      * @fires EntityFactory.Entity#beforeDelete
      * @fires EntityFactory.Entity#afterDelete
      * @author gerkin
      * @param {string} sourceName - Name of the data source to delete entities from.
      * @returns {Promise} Promise resolved once all items are destroyed.
      * @see {@link EntityFactory.Entity#destroy}
      */

				}, {
					key: "destroy",
					value: function destroy(sourceName) {
						var _this37 = this;

						return wrapEventsAction.call(this, sourceName, 'destroy', 'Destroy').then(function () {
							return _this37;
						});
					}

					/**
      * Update all entities in the set with given object.
      *
      * @author gerkin
      * @param   {Object} newData - Attributes to change in each entity of the collection.
      * @returns {Collection} `this`.
      */

				}, {
					key: "update",
					value: function update(newData) {
						this.entities.forEach(function (entity) {
							Utils.applyUpdateEntity(newData, entity);
						});
						return this;
					}

					/**
      * Returns a POJO representation of this set's data.
      *
      * @author gerkin
      * @returns {Object} POJO representation of set & children.
      */

				}, {
					key: "toObject",
					value: function toObject() {
						return this.entities.map(function (entity) {
							return entity.toObject();
						}).value();
					}
				}], [{
					key: "checkEntitiesFromModel",
					value: function checkEntitiesFromModel(entities, model) {
						entities.forEach(function (entity, index) {
							if (entity.constructor.model !== model) {
								throw new TypeError("Provided entity n\xB0" + index + " " + entity + " is not from model " + model + " (" + model.modelName + ")");
							}
						});
					}
				}]);

				return Set;
			}();

			module.exports = Set;
		}, { "./dependencies": 10, "./errors/setValidationError": 16, "./utils": 19 }], 19: [function (require, module, exports) {
			(function (global) {
				'use strict';

				var _require12 = require('./dependencies'),
				    _ = _require12._;

				/**
     * @module Utils
     */

				module.exports = {
					defineEnumerableProperties: function defineEnumerableProperties(subject, handlers) {
						var remappedHandlers = _.mapValues(handlers, function (handler) {
							if (_.isNil(handler) || 'object' !== (typeof handler === "undefined" ? "undefined" : _typeof(handler)) || Object.getPrototypeOf(handler) !== Object.prototype) {
								handler = {
									value: handler
								};
							}
							var defaults = {
								enumerable: true
							};
							if (!handler.hasOwnProperty('get')) {
								defaults.writable = false;
							}
							_.defaults(handler, defaults);
							return handler;
						});
						return Object.defineProperties(subject, remappedHandlers);
					},

					/**
      * Merge update query with the entity. This operation allows to delete fields.
      *
      * @author gerkin
      * @param   {Object} update - Hash representing modified values. A field with an `undefined` value deletes this field from the entity.
      * @param   {Object} entity - Entity to update.
      * @returns {Object} Entity modified.
      */
					applyUpdateEntity: function applyUpdateEntity(update, entity) {
						_.forEach(update, function (val, key) {
							if (_.isUndefined(val)) {
								delete entity[key];
							} else {
								entity[key] = val;
							}
						});
						return entity;
					},


					/**
      * Create a new unique id for this store's entity.
      * 
      * @author gerkin
      * @returns {string} Generated unique id.
      */
					generateUUID: function generateUUID() {
						var d = new Date().getTime();
						// Use high-precision timer if available
						if (global.performance && 'function' === typeof global.performance.now) {
							d += global.performance.now();
						}
						var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
							var r = (d + Math.random() * 16) % 16 | 0;
							d = Math.floor(d / 16);
							return ('x' === c ? r : r & 0x3 | 0x8).toString(16);
						});
						return uuid;
					},


					/**
      * Reduce, offset or sort provided set.
      * 
      * @author gerkin
      * @param   {Object[]} set     - Objects retrieved from memory store.
      * @param   {Object}   options - Options to apply to the set.
      * @returns {Object[]} Set with options applied.
      */
					applyOptionsToSet: function applyOptionsToSet(set, options) {
						_.defaults(options, {
							limit: Infinity,
							skip: 0
						});
						set = set.slice(options.skip);
						if (set.length > options.limit) {
							set = set.slice(0, options.limit);
						}
						return set;
					}
				};
			}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		}, { "./dependencies": 10 }], 20: [function (require, module, exports) {
			'use strict';

			var dependencies = require('./dependencies');
			var Diaspora = require('./diaspora');
			var EntityValidationError = Diaspora.components.Errors.EntityValidationError;
			var _ = dependencies._;

			/**
    * @module Validator
    */

			/**
    * Execute the simple tester and return an error component if it returns falsey.
    *
    * @param   {Function} tester - The test function to invoke.
    * @returns {module:Validator~Checker} Function to execute to validate the type.
    */

			var validateWrongType = function validateWrongType(tester) {
				return function (keys, fieldDesc, value) {
					if (!tester(value)) {
						return { type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\"" };
					}
				};
			};

			/**
    * Prepare the check of each items in the array.
    *
    * @param   {module:Validator~Validator} validator - Validator instance that do this call.
    * @param   {Object}                     fieldDesc - Description of the field to check.
    * @param   {module:Validator~PathStack} keys      - Keys so far.
    * @returns {Function} Function to execute to validate array items.
    */
			var validateArrayItems = function validateArrayItems(validator, fieldDesc, keys) {
				return function (propVal, index) {
					if (fieldDesc.hasOwnProperty('of')) {
						var ofArray = _.castArray(fieldDesc.of);
						var subErrors = _(ofArray).map(function (desc, subIndex) {
							return validator.check(propVal, keys.clone().pushValidationProp('of', _.isArray(fieldDesc.of) ? subIndex : undefined).pushEntityProp(index), { getProps: false });
						});
						if (!_.isArray(fieldDesc.of)) {
							return subErrors.get(0);
						} else if (subErrors.compact().value().length === ofArray.length) {
							return subErrors.toPlainObject().omitBy(_.isNil).value();
						}
					}
					return {};
				};
			};

			/**
    * A checker is a function that can return an error component with provided standard args.
    *
    * @callback Checker
    * @param   {module:Validator~PathStack} keys      - Pathstack so far.
    * @param   {Object}                     fieldDesc - Description of the field.
    * @param   {Any}                        value     - Value to check.
    * @returns {Object} Error component.
    */

			/**
    * Store for validation functions.
    *
    * @type {object}
    * @property {object<string, module:Validator~Checker>} TYPE - Type checkers.
    * @property {module:Validator~Checker} TYPE.string - String type checker.
    * @property {module:Validator~Checker} TYPE.integer - Integer type checker.
    * @property {module:Validator~Checker} TYPE.float - Float type checker.
    * @property {module:Validator~Checker} TYPE.date - Date type checker.
    * @property {module:Validator~Checker} TYPE.object - Object type checker.
    * @property {module:Validator~Checker} TYPE.array - Array type checker.
    * @property {module:Validator~Checker} TYPE.any - Type checker for type 'any'.
    * @property {module:Validator~Checker} TYPE._ - Default function for unhandled type.
    */
			var VALIDATIONS = {
				TYPE: {
					string: validateWrongType(_.isString),
					integer: validateWrongType(_.isInteger),
					float: validateWrongType(_.isNumber),
					date: validateWrongType(_.isDate),
					object: function object(keys, fieldDesc, value) {
						var _this38 = this;

						if (!_.isObject(value)) {
							return { type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\"" };
						} else {
							var deepTest = _.isObject(fieldDesc.attributes) ? _(_.assign({}, fieldDesc.attributes, value)).mapValues(function (pv, propName) {
								var propVal = value[propName];
								return _this38.check(propVal, keys.clone().pushValidationProp('attributes').pushProp(propName), { getProps: false });
							}).omitBy(_.isEmpty).value() : {};
							if (!_.isEmpty(deepTest)) {
								return { children: deepTest };
							}
						}
					},
					array: function array(keys, fieldDesc, value) {
						if (!_.isArray(value)) {
							return { type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\"" };
						} else {
							var deepTest = _.isObject(fieldDesc.of) ? _(value).map(validateArrayItems(this, fieldDesc, keys)).omitBy(_.isEmpty).value() : {};
							if (!_.isEmpty(deepTest)) {
								return { children: deepTest };
							}
						}
					},
					any: function any(keys, fieldDesc, value) {
						if (!_.stubTrue(value)) {
							return { type: keys.toValidatePath() + " expected to be assigned with any type" };
						}
					},
					_: function _(keys, fieldDesc) {
						return { type: keys.toValidatePath() + " requires to be unhandled type \"" + fieldDesc.type + "\"" };
					}
				}
			};

			/**
    * Standard function that can be used to add steps to the validation process..
    *
    * @callback ValidationStep
    * @param   {module:Validator~ValidationStepsArgs} validationArgs - Object of arguments.
    * @returns {undefined} This function returns nothing.
    */

			/**
    * This object can be passed through each validation steps.
    *
    * @typedef  {Object} ValidationStepsArgs
    * @property {Object}                     error     - Error object to extend.
    * @property {Object}                     fieldDesc - Description of the field.
    * @property {module:Validator~PathStack} keys      - Pathstack representing keys so far.
    * @property {*}                          value     - Value to check.
    */

			var VALIDATION_STEPS = [
			/**
    * Apply the custom `validate` function or function array, if it exists.
    *
    * @function module:Validator~checkCustoms
    * @type {module:Validator~ValidationStep}
    * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
    * @returns {undefined} This function returns nothing.
    */
			function checkCustoms(validationArgs) {
				var _this39 = this;

				var error = validationArgs.error,
				    fieldDesc = validationArgs.fieldDesc,
				    keys = validationArgs.keys,
				    value = validationArgs.value;
				// It the field has a `validate` property, try to use it

				var validateFcts = _(fieldDesc.validate).castArray().compact();
				validateFcts.forEach(function (validateFct) {
					if (!validateFct.call(_this39, value, fieldDesc)) {
						error.validate = keys.toValidatePath() + " custom validation failed";
					}
				});
			},
			/**
    * Check if the type & the existence matches the `type` & `required` specifications.
    *
    * @function module:Validator~checkTypeRequired
    * @type {module:Validator~ValidationStep}
    * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
    * @returns {undefined} This function returns nothing.
    */
			function checkTypeRequired(validationArgs) {
				var error = validationArgs.error,
				    fieldDesc = validationArgs.fieldDesc,
				    keys = validationArgs.keys,
				    value = validationArgs.value;
				// Check the type and the required status

				if (!_.isNil(fieldDesc.type) && !_.isNil(fieldDesc.model)) {
					error.spec = keys.toValidatePath() + " spec can't have both a type and a model";
					// Apply the `required` modifier
				} else if (true === fieldDesc.required && _.isNil(value)) {
					error.required = keys.toValidatePath() + " is a required property of type \"" + fieldDesc.type + "\"";
				} else if (!_.isNil(value)) {
					if (_.isString(fieldDesc.type)) {
						var tester = _.get(VALIDATIONS, ['TYPE', fieldDesc.type], fieldDesc.type._);
						_.assign(error, tester.call(this, keys, fieldDesc, value));
					} else {
						error.spec = keys.toValidatePath() + " spec \"type\" must be a string";
					}
				}
			},
			/**
    * Verify if the value correspond to a value in the `enum` property.
    *
    * @function module:Validator~checkEnum
    * @type {module:Validator~ValidationStep}
    * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
    * @returns {undefined} This function returns nothing.
    */
			function checkEnum(validationArgs) {
				var error = validationArgs.error,
				    fieldDesc = validationArgs.fieldDesc,
				    keys = validationArgs.keys,
				    value = validationArgs.value;
				// Check enum values

				if (!_.isNil(value) && !_.isNil(fieldDesc.enum)) {
					var result = _.some(fieldDesc.enum, function (enumVal) {
						if (enumVal instanceof RegExp) {
							return null !== value.match(enumVal);
						} else {
							return value === enumVal;
						}
					});
					if (false === result) {
						error.enum = keys.toValidatePath() + " expected to have one of enumerated values \"" + JSON.stringify(fieldDesc.enum) + "\"";
					}
				}
			}];
			/**
    * Those validation steps are called one after one during the validation of a single field.
    *
    * @const VALIDATION_STEPS
    * @type {module:Validator~ValidationStep[]}
    * @property {module:Validator~checkCustoms}      '0' - Check for `validate` field.
    * @property {module:Validator~checkTypeRequired} '1' - Check for `type` & `required` fields.
    * @property {module:Validator~checkEnum}         '2' - Check for `enum` field.
    */

			var PRIVATE = Symbol('PRIVATE');

			/**
    * The PathStack class allows model validation to follow different paths in model description & entity.
    */

			var PathStack = function () {
				/**
     * Constructs a pathstack.
     *
     * @author gerkin
     * @param {string[]} [segmentsEntity=[]]     - Keys to follow in entity.
     * @param {string[]} [segmentsValidation=[]] - Keys to follow in model description.
     */
				function PathStack() {
					var segmentsEntity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
					var segmentsValidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

					_classCallCheck(this, PathStack);

					_.assign(this, {
						segmentsEntity: segmentsEntity,
						segmentsValidation: segmentsValidation
					});
				}

				/**
     * Add a path segment for entity navigation.
     *
     * @param   {...string} prop - Properties to add.
     * @returns {module:Validator~PathStack} Returns `this`.
     */


				_createClass(PathStack, [{
					key: "pushEntityProp",
					value: function pushEntityProp() {
						for (var _len7 = arguments.length, prop = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
							prop[_key7] = arguments[_key7];
						}

						this.segmentsEntity = _(this.segmentsEntity).concat(prop).filter(_.isNil).value();
						return this;
					}

					/**
      * Add a path segment for model description navigation.
      *
      * @param   {...string} prop - Properties to add.
      * @returns {module:Validator~PathStack} Returns `this`.
      */

				}, {
					key: "pushValidationProp",
					value: function pushValidationProp() {
						for (var _len8 = arguments.length, prop = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
							prop[_key8] = arguments[_key8];
						}

						this.segmentsValidation = _(this.segmentsValidation).concat(prop).filter(function (val) {
							return !_.isNil(val);
						}).value();
						return this;
					}

					/**
      * Add a path segment for both entity & model description navigation.
      *
      * @param   {...string} prop - Properties to add.
      * @returns {module:Validator~PathStack} Returns `this`.
      */

				}, {
					key: "pushProp",
					value: function pushProp() {
						var _pushEntityProp;

						return (_pushEntityProp = this.pushEntityProp.apply(this, arguments)).pushValidationProp.apply(_pushEntityProp, arguments);
					}

					/**
      * Get a string version of entity segments.
      *
      * @returns {string} String representation of path in entity.
      */

				}, {
					key: "toValidatePath",
					value: function toValidatePath() {
						return this.segmentsEntity.join('.');
					}

					/**
      * Cast this PathStack to its representing arrays.
      *
      * @returns {Array<Array<string>>} Array of paths. The first path represents the entity segments, second represents model description segments.
      */

				}, {
					key: "toArray",
					value: function toArray() {
						return [this.segmentsEntity.slice(), this.segmentsValidation.slice()];
					}

					/**
      * Duplicate this PathStack, detaching its state from the new.
      *
      * @returns {module:Validator~PathStack} Clone of caller PathStack.
      */

				}, {
					key: "clone",
					value: function clone() {
						return new (Function.prototype.bind.apply(PathStack, [null].concat(_toConsumableArray(this.toArray()))))();
					}
				}]);

				return PathStack;
			}();

			/**
    * The Validator class is used to check an entity or its fields against a model description.
    */


			var Validator = function () {
				/**
     * Construct a Validator configured for the provided model.
     *
     * @param {ModelConfiguration.AttributesDescriptor} modelDesc - Model description to validate.
     */
				function Validator(modelDesc) {
					_classCallCheck(this, Validator);

					var _this = { modelDesc: modelDesc };
					this[PRIVATE] = _this;
				}

				/**
     * Check if the value matches the field description provided, thus verify if it is valid.
     *
     * @author gerkin
     * @param   {Object} entity - Entity to check.
     * @returns {Error[]} Array of errors.
     */


				_createClass(Validator, [{
					key: "validate",
					value: function validate(entity) {
						var _this40 = this;

						// Apply method `checkField` on each field described
						var checkResults = _(this[PRIVATE].modelDesc).mapValues(function (fieldDesc, field) {
							return _this40.check(entity[field], new PathStack().pushProp(field), { getProps: false });
						}).omitBy(_.isEmpty).value();
						if (!_.isNil(checkResults) && !_.isEmpty(checkResults)) {
							throw new EntityValidationError(checkResults, 'Validation failed');
						}
					}

					/**
      * Check if the value matches the field description provided, thus verify if it is valid.
      *
      * @author gerkin
      * @param   {Any}                        value                  - Value to check.
      * @param   {module:Validator~PathStack} keys                   - Pathstack representing path to this validation.
      * @param   {Object}                     [options=(})]          - Hash of options.
      * @param   {boolean}                    options.getProps=false - If `false`, it will use the value directly. If `true`, will try to get the property from value, as if it was an entity.
      * @returns {Object} Hash describing errors.
      */

				}, {
					key: "check",
					value: function check(value, keys) {
						var _this41 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						_.defaults(options, { getProps: true });
						if (!(keys instanceof PathStack)) {
							keys = new PathStack(keys);
						}

						var val = options.getProps ? _.get(value, keys.segmentsEntity) : value;
						var fieldDesc = _.get(this[PRIVATE].modelDesc, keys.segmentsValidation);
						if (!_.isObject(fieldDesc)) {
							return;
						}
						_.defaults(fieldDesc, { required: false });

						var error = {};

						var stepsArgs = {
							error: error,
							fieldDesc: fieldDesc,
							keys: keys,
							value: val
						};

						_.forEach(VALIDATION_STEPS, function (validationStep) {
							return validationStep.call(_this41, stepsArgs);
						});

						if (!_.isEmpty(error)) {
							error.value = value;
							return error;
						} else {
							return null;
						}
					}

					/**
      * Get the model description provided in constructor.
      *
      * @readonly
      * @type {ModelConfiguration.AttributesDescriptor}
      */

				}, {
					key: "modelDesc",
					get: function get() {
						return _.cloneDeep(this[PRIVATE].modelDesc);
					}

					/**
      * Get the PathStack constructor.
      *
      * @readonly
      * @type {module:Validator~PathStack}
      */

				}], [{
					key: "PathStack",
					get: function get() {
						return PathStack;
					}
				}]);

				return Validator;
			}();

			module.exports = Validator;
		}, { "./dependencies": 10, "./diaspora": 11 }], 21: [function (require, module, exports) {
			// shim for using process in browser
			var process = module.exports = {};

			// cached from whatever global is present so that test runners that stub it
			// don't break things.  But we need to wrap it in a try catch in case it is
			// wrapped in strict mode code which doesn't define any globals.  It's inside a
			// function because try/catches deoptimize in certain engines.

			var cachedSetTimeout;
			var cachedClearTimeout;

			function defaultSetTimout() {
				throw new Error('setTimeout has not been defined');
			}
			function defaultClearTimeout() {
				throw new Error('clearTimeout has not been defined');
			}
			(function () {
				try {
					if (typeof setTimeout === 'function') {
						cachedSetTimeout = setTimeout;
					} else {
						cachedSetTimeout = defaultSetTimout;
					}
				} catch (e) {
					cachedSetTimeout = defaultSetTimout;
				}
				try {
					if (typeof clearTimeout === 'function') {
						cachedClearTimeout = clearTimeout;
					} else {
						cachedClearTimeout = defaultClearTimeout;
					}
				} catch (e) {
					cachedClearTimeout = defaultClearTimeout;
				}
			})();
			function runTimeout(fun) {
				if (cachedSetTimeout === setTimeout) {
					//normal enviroments in sane situations
					return setTimeout(fun, 0);
				}
				// if setTimeout wasn't available but was latter defined
				if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
					cachedSetTimeout = setTimeout;
					return setTimeout(fun, 0);
				}
				try {
					// when when somebody has screwed with setTimeout but no I.E. maddness
					return cachedSetTimeout(fun, 0);
				} catch (e) {
					try {
						// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
						return cachedSetTimeout.call(null, fun, 0);
					} catch (e) {
						// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
						return cachedSetTimeout.call(this, fun, 0);
					}
				}
			}
			function runClearTimeout(marker) {
				if (cachedClearTimeout === clearTimeout) {
					//normal enviroments in sane situations
					return clearTimeout(marker);
				}
				// if clearTimeout wasn't available but was latter defined
				if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
					cachedClearTimeout = clearTimeout;
					return clearTimeout(marker);
				}
				try {
					// when when somebody has screwed with setTimeout but no I.E. maddness
					return cachedClearTimeout(marker);
				} catch (e) {
					try {
						// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
						return cachedClearTimeout.call(null, marker);
					} catch (e) {
						// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
						// Some versions of I.E. have different rules for clearTimeout vs setTimeout
						return cachedClearTimeout.call(this, marker);
					}
				}
			}
			var queue = [];
			var draining = false;
			var currentQueue;
			var queueIndex = -1;

			function cleanUpNextTick() {
				if (!draining || !currentQueue) {
					return;
				}
				draining = false;
				if (currentQueue.length) {
					queue = currentQueue.concat(queue);
				} else {
					queueIndex = -1;
				}
				if (queue.length) {
					drainQueue();
				}
			}

			function drainQueue() {
				if (draining) {
					return;
				}
				var timeout = runTimeout(cleanUpNextTick);
				draining = true;

				var len = queue.length;
				while (len) {
					currentQueue = queue;
					queue = [];
					while (++queueIndex < len) {
						if (currentQueue) {
							currentQueue[queueIndex].run();
						}
					}
					queueIndex = -1;
					len = queue.length;
				}
				currentQueue = null;
				draining = false;
				runClearTimeout(timeout);
			}

			process.nextTick = function (fun) {
				var args = new Array(arguments.length - 1);
				if (arguments.length > 1) {
					for (var i = 1; i < arguments.length; i++) {
						args[i - 1] = arguments[i];
					}
				}
				queue.push(new Item(fun, args));
				if (queue.length === 1 && !draining) {
					runTimeout(drainQueue);
				}
			};

			// v8 likes predictible objects
			function Item(fun, array) {
				this.fun = fun;
				this.array = array;
			}
			Item.prototype.run = function () {
				this.fun.apply(null, this.array);
			};
			process.title = 'browser';
			process.browser = true;
			process.env = {};
			process.argv = [];
			process.version = ''; // empty string to avoid regexp issues
			process.versions = {};

			function noop() {}

			process.on = noop;
			process.addListener = noop;
			process.once = noop;
			process.off = noop;
			process.removeListener = noop;
			process.removeAllListeners = noop;
			process.emit = noop;
			process.prependListener = noop;
			process.prependOnceListener = noop;

			process.listeners = function (name) {
				return [];
			};

			process.binding = function (name) {
				throw new Error('process.binding is not supported');
			};

			process.cwd = function () {
				return '/';
			};
			process.chdir = function (dir) {
				throw new Error('process.chdir is not supported');
			};
			process.umask = function () {
				return 0;
			};
		}, {}] }, {}, [2, 1])(2);
});
