"use strict";

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports", "jQuery"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("jQuery"));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.jQuery);
		global.jqueryAsBreadcrumbs = mod.exports;
	}
})(this, function (exports, _jQuery) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _jQuery2 = babelHelpers.interopRequireDefault(_jQuery);

	var NAME = "asBreadcrumbs";
	var DEFAULT = {
		namespace: NAME,
		overflow: "left",
		ellipsis: "&#8230;",
		dropicon: "caret",
		responsive: true,
		dropdown: function dropdown() {
			return '<div class=\"dropdown\">' + '<a href=\"javascript:void(0);\" class=\"' + this.namespace + '-toggle\" data-toggle=\"dropdown\"><i class=\"' + this.dropicon + '\"></i></a>' + '<ul class=\"' + this.namespace + '-menu dropdown-menu\"></ul>' + '</div>';
		},
		dropdownContent: function dropdownContent(value) {
			return '<li class=\"dropdown-item\">' + value + '</li>';
		},
		getItem: function getItem($parent) {
			return $parent.children();
		},
		onInit: null,
		onReady: null
	};

	var asBreadcrumbs = function () {
		function asBreadcrumbs(element, options) {
			babelHelpers.classCallCheck(this, asBreadcrumbs);
			this.element = element;
			this.$element = (0, _jQuery2.default)(element);
			this.options = _jQuery2.default.extend({}, DEFAULT, options, this.$element.data());
			this.namespace = this.options.namespace;
			this.$element.addClass(this.namespace);
			this.disabled = false;
			this.initialized = false;
			this.createDropList = false;
			this.$item = this.$element.children().eq(0);
			this.children = this.options.getItem(this.$element);
			this.WidthPlus = 6;
			this.childrenInfo = [];

			this._trigger('init');

			this.init();
		}

		babelHelpers.createClass(asBreadcrumbs, [{
			key: "init",
			value: function init() {
				var _this = this;

				var self = this;
				this.children.each(function () {
					self.childrenInfo.push({
						"_this": (0, _jQuery2.default)(this),
						"thisOuterWidth": (0, _jQuery2.default)(this).outerWidth(),
						"text": (0, _jQuery2.default)(self.options.dropdownContent((0, _jQuery2.default)(this).text()))
					});
				});
				this.length = this.childrenInfo.length;

				if (this.options.overflow === "left") {
					this.childrenInfo.reverse();
				}

				this.$element.addClass(this.namespace + '-' + this.options.overflow);
				this.createDropdown();
				this.dropdownWidth = this.$dropdownWrap.outerWidth() + (this.options.ellipsis ? this.$ellipsis.outerWidth() : 0);
				this.build();

				if (this.options.responsive) {
					(0, _jQuery2.default)(window).on('resize', this._throttle(function () {
						_this.resize.call(_this);
					}, 250));
				}

				this.initialized = true;

				this._trigger('ready');
			}
		}, {
			key: "_trigger",
			value: function _trigger(eventType) {
				for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					params[_key - 1] = arguments[_key];
				}

				var data = [this].concat(params);
				this.$element.trigger(NAME + '::' + eventType, data);
				eventType = eventType.replace(/\b\w+\b/g, function (word) {
					return word.substring(0, 1).toUpperCase() + word.substring(1);
				});
				var onFunction = 'on' + eventType;

				if (typeof this.options[onFunction] === 'function') {
					this.options[onFunction].apply(this, params);
				}
			}
		}, {
			key: "createDropdown",
			value: function createDropdown() {
				if (this.createDropList === true) {
					return;
				}

				var dropdown = this.options.dropdown();
				this.$dropdownWrap = this.$item.clone().removeClass().addClass(this.namespace + '-dropdown').addClass('dropdown').html(dropdown).hide();

				if (this.options.overflow === 'right') {
					this.$dropdownWrap.appendTo(this.$element);
				} else {
					this.$dropdownWrap.prependTo(this.$element);
				}

				this._createEllipsis();

				for (var i = 0, l = this.length; i < l; i++) {
					this.childrenInfo[i].text.appendTo(this.$element.find('.' + this.namespace + '-menu')).hide();
				}

				this.createDropList = true;
			}
		}, {
			key: "_createEllipsis",
			value: function _createEllipsis() {
				if (!this.options.ellipsis) {
					return;
				}

				this.$ellipsis = this.$item.clone().removeClass().addClass(this.namespace + '-ellipsis').html(this.options.ellipsis);

				if (this.options.overflow === 'right') {
					this.$ellipsis.insertBefore(this.$dropdownWrap).hide();
				} else {
					this.$ellipsis.insertAfter(this.$dropdownWrap).hide();
				}
			}
		}, {
			key: "_showDropdown",
			value: function _showDropdown(i) {
				(0, _jQuery2.default)(this.childrenInfo[i]._this).hide();
				this.$dropdownWrap.css("display", "inline-block");
				this.$ellipsis.css("display", "inline-block");
				this.childrenInfo[i].text.css("display", "inline-block");
			}
		}, {
			key: "_hideDropdown",
			value: function _hideDropdown(i) {
				(0, _jQuery2.default)(this.childrenInfo[i]._this).css("display", "inline-block");
				this.childrenInfo[i].text.hide();
				this.$dropdownWrap.hide();
				this.$ellipsis.hide();
			}
		}, {
			key: "_getWidth",
			value: function _getWidth() {
				var width = 0;
				this.$element.children().each(function () {
					if ((0, _jQuery2.default)(this).css('display') === 'inline-block' && (0, _jQuery2.default)(this).css('float') === 'none') {
						width += this.WidthPlus;
					}
				});
				return this.$element.width() - width;
			}
		}, {
			key: "build",
			value: function build() {
				var childrenWidthTotal = 0,
				    thisChildrenWidth = 0,
				    thisWidth = 0;

				for (var i = 0; i < this.length; i++) {
					thisWidth = this._getWidth();
					thisChildrenWidth = this.childrenInfo[i].thisOuterWidth;
					childrenWidthTotal += thisChildrenWidth;

					if (childrenWidthTotal + this.dropdownWidth > thisWidth) {
						this._showDropdown(i);
					} else {
						this._hideDropdown(i);
					}
				}
			}
		}, {
			key: "resize",
			value: function resize() {
				this._trigger('resize');

				this.build();
			}
		}, {
			key: "_throttle",
			value: function _throttle(func, wait) {
				var _now = Date.now || function () {
					return new Date().getTime();
				};

				var context = undefined,
				    args = undefined,
				    result = undefined;
				var timeout = null;
				var previous = 0;

				var later = function later() {
					previous = _now();
					timeout = null;
					result = func.apply(context, args);
					context = args = null;
				};

				return function () {
					var now = _now();

					var remaining = wait - (now - previous);
					context = this;
					args = arguments;

					if (remaining <= 0) {
						clearTimeout(timeout);
						timeout = null;
						previous = now;
						result = func.apply(context, args);
						context = args = null;
					} else if (!timeout) {
						timeout = setTimeout(later, remaining);
					}

					return result;
				};
			}
		}, {
			key: "destroy",
			value: function destroy() {
				this.$element.children().css("display", "");
				this.$dropdownWrap.remove();

				if (this.options.ellipsis) {
					this.$ellipsis.remove();
				}

				this.createDropList = false;
				this.$element.data(NAME, null);
				(0, _jQuery2.default)(window).off("resize");
				(0, _jQuery2.default)(window).off(".asBreadcrumbs");

				this._trigger('destroy');
			}
		}], [{
			key: "_jQueryInterface",
			value: function _jQueryInterface(options) {
				"use strict";

				var _this2 = this;

				for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
					params[_key2 - 1] = arguments[_key2];
				}

				if (typeof options === 'string') {
					var _ret = function () {
						var method = options;

						if (/^\_/.test(method)) {
							return {
								v: false
							};
						} else if (/^(get)/.test(method)) {
							var api = _this2.first().data(NAME);

							if (api && typeof api[method] === 'function') {
								return {
									v: api[method].apply(api, params)
								};
							}
						} else {
							return {
								v: _this2.each(function () {
									var api = _jQuery2.default.data(this, NAME);

									if (api && typeof api[method] === 'function') {
										api[method].apply(api, params);
									}
								})
							};
						}
					}();

					if ((typeof _ret === "undefined" ? "undefined" : babelHelpers.typeof(_ret)) === "object") return _ret.v;
				} else {
					return this.each(function () {
						if (!_jQuery2.default.data(this, NAME)) {
							_jQuery2.default.data(this, NAME, new asBreadcrumbs(this, options));
						}
					});
				}
			}
		}]);
		return asBreadcrumbs;
	}();

	_jQuery2.default.fn[NAME] = asBreadcrumbs._jQueryInterface;
	_jQuery2.default.fn[NAME].constructor = asBreadcrumbs;

	_jQuery2.default.fn[NAME].noConflict = function () {
		_jQuery2.default.fn[NAME] = JQUERY_NO_CONFLICT;
		return asBreadcrumbs._jQueryInterface;
	};

	exports.default = asBreadcrumbs;
});
