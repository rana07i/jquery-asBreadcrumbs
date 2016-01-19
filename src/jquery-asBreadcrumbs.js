import $ from 'jQuery';

const NAME = "asBreadcrumbs";

const DEFAULT = {
	namespace: NAME,
	overflow: "left",
	ellipsis: "&#8230;",
	dropicon: "caret",
	responsive: true,

	dropdown() {
		return '<div class=\"dropdown\">' +
			'<a href=\"javascript:void(0);\" class=\"' + this.namespace + '-toggle\" data-toggle=\"dropdown\"><i class=\"' + this.dropicon + '\"></i></a>' +
			'<ul class=\"' + this.namespace + '-menu dropdown-menu\"></ul>' +
			'</div>';
	},
	dropdownContent(value) {
		return '<li class=\"dropdown-item\">' + value + '</li>';
	},
	getItem($parent) {
		return $parent.children();
	},

	// callback
	onInit: null,
	onReady: null
}

class asBreadcrumbs {
	constructor(element, options) {
		this.element = element;
		this.$element = $(element);

		this.options = $.extend({}, DEFAULT, options, this.$element.data());

		// this._plugin = NAME;
		this.namespace = this.options.namespace;

		this.$element.addClass(this.namespace);
		// flag
		this.disabled = false;
		this.initialized = false;

		this.createDropList = false;
		this.childrenWithWidths = [];
		this.current = 0;
		this.dropdownWidth = 0;

		this.isReverse = false;
		this.$item = this.$element.children().eq(0);

		this._trigger('init');
		this.init();
	}

	init() {
		let self = this;

		let children = this.options.getItem(this.$element);
		let $item;
		children.each(function () {
			$item = $(self.options.dropdownContent($(this).text()));

			self.childrenWithWidths.push({
						"item": $item,
						"_this": $(this),
						"thisOuterWidth": $(this).outerWidth()
					});
		});
		this.length = this.childrenWithWidths.length;

		this.$element.addClass(this.namespace + '-' + this.options.overflow);

		// In order to get the dropdownWidth
		this.createDropdown();
		this.deleteDropdown();

		this.building();

		if (this.options.responsive) {
			$(window).on('resize', this._throttle(() => {
				this.resize.call(this);
			}, 250));
		}

		this.initialized = true;
		this._trigger('ready');
	}

	_trigger(eventType, ...params) {
		let data = [this].concat(params);

		// event
		this.$element.trigger(NAME + '::' + eventType, data);

		// callback
		eventType = eventType.replace(/\b\w+\b/g, (word) => {
			return word.substring(0, 1).toUpperCase() + word.substring(1);
		});
		let onFunction = 'on' + eventType;
		if (typeof this.options[onFunction] === 'function') {
			this.options[onFunction].apply(this, params);
		}
	}

	createDropdown() {
		if (this.createDropList === true) {
			return;
		}

		let dropdown = this.options.dropdown();
		this.$dropdownWrap = this.$item.clone().removeClass().addClass(this.namespace + '-dropdown').addClass('dropdown').html(dropdown);

		if (this.options.ellipsis) {
			this.$ellipsis = this.$item.clone().removeClass().addClass(this.namespace + '-ellipsis').html(this.options.ellipsis);
		}

		if (this.options.overflow === 'right') {
			this.$dropdownWrap.appendTo(this.$element);

			if (this.options.ellipsis) {
				this.$ellipsis.insertBefore(this.$dropdownWrap);
			}
		} else {
			this.$dropdownWrap.prependTo(this.$element);

			if (this.options.ellipsis) {
				this.$ellipsis.insertAfter(this.$dropdownWrap);
			}
		}

		this.dropdownWidth = this.$dropdownWrap.outerWidth() + (this.options.ellipsis ? this.$ellipsis.outerWidth() : 0);
		this.createDropList = true;
	}

	deleteDropdown() {

		this.$dropdownWrap.remove();
		if (this.options.ellipsis) {
			this.$ellipsis.remove();
		}
		this.createDropList = false;
	}

	_getParameters() {
		let width = 0;
		this.$element.children().each(function () {
			if ($(this).css('display') === 'inline-block' && $(this).css('float') === 'none') {
				width += 6;
			}
		});
		this.width = this.$element.width() - width;
		if (this.createDropList) {
			this.childrenWidthTotal = this.$dropdownWrap.outerWidth() + (this.options.ellipsis ? 0 : this.$ellipsis.outerWidth());
		} else {
			this.childrenWidthTotal = 0;
		}
	}

	calculate(i) {
		if (!$.isNumeric(i) || i < 0) {
			return;
		}

		this._getParameters();

		this.current = this.$element.find('.' + this.namespace + '-menu').children().length;

		if (this.options.overflow === "left") {
			if (!this.isReverse) {
				this.childrenWithWidths.reverse();
				this.isReverse = true;
			}
		}

		return this.childrenWithWidths[i].thisOuterWidth;
	}

	building() {
		let childrenWidthTotal = 0;

		for (var i = 0; i < this.length; i++) {

			childrenWidthTotal += this.calculate(i);

			if (childrenWidthTotal + this.dropdownWidth > this.width) {
				this.createDropdown();
				$(this.childrenWithWidths[i]._this).hide();
				$(this.childrenWithWidths[i].item).appendTo(this.$element.find('.' + this.namespace + '-menu'));
			} else if (childrenWidthTotal + this.dropdownWidth < this.width) {
				$(this.childrenWithWidths[i]._this).css("display", "inline-block");
				$(this.childrenWithWidths[i].item).remove();
				if (this.current < 1) {
					this.deleteDropdown();
				}
			}
		}
	}

	resize() {
		this._trigger('resize');

		this.building();
	}

	_throttle(func, wait) {
		let _now = Date.now || function () {
			return new Date().getTime();
		};
		let context, args, result;
		let timeout = null;
		let previous = 0;
		let later = function () {
			previous = _now();
			timeout = null;
			result = func.apply(context, args);
			context = args = null;
		};
		return function () {
			let now = _now();
			let remaining = wait - (now - previous);
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

	destroy() {
		// detached events first
		// then remove all js generated html
		this.$element.children().css("display", "");
		this.deleteDropdown();
		this.$element.data(NAME, null);
		$(window).off("resize");
		$(window).off(".asBreadcrumbs");
		this._trigger('destroy');
	}

	static _jQueryInterface(options, ...params) {
		"use strict";
		if (typeof options === 'string') {
			let method = options;

			if (/^\_/.test(method)) {
				return false;
			} else if ((/^(get)/.test(method))) {
				let api = this.first().data(NAME);
				if (api && typeof api[method] === 'function') {
					return api[method].apply(api, params);
				}
			} else {
				return this.each(function () {
					let api = $.data(this, NAME);
					if (api && typeof api[method] === 'function') {
						api[method].apply(api, params);
					}
				});
			}
		} else {
			return this.each(function () {
				if (!$.data(this, NAME)) {
					$.data(this, NAME, new asBreadcrumbs(this, options));
				}
			});
		}
	}
}



$.fn[NAME] = asBreadcrumbs._jQueryInterface;
$.fn[NAME].constructor = asBreadcrumbs;
$.fn[NAME].noConflict = () => {
	$.fn[NAME] = JQUERY_NO_CONFLICT
	return asBreadcrumbs._jQueryInterface
};

export default asBreadcrumbs;
