define("#base/0.9.5/attribute",[],function(a,b){function e(a){return c.call(a)==="[object String]"}function f(a){return a&&c.call(a)==="[object Object]"&&"isPrototypeOf"in a}function g(a,b){var c,e;for(c in b)e=b[c],d(e)?e=e.slice():f(e)&&(e=g(a[c]||{},e)),a[c]=e;return a}function i(a){a=g({},a);for(var b in a){var c=a[b];if(f(c)&&j(c,h))continue;a[b]={value:c}}return a}function j(a,b){for(var c=0,d=b.length;c<d;c++)if(a.hasOwnProperty(b[c]))return!0;return!1}function k(a){return"_onChange"+a.charAt(0).toUpperCase()+a.substring(1)}function l(a,b){var c=[],d=a.constructor.prototype;while(d)d[b]&&c.unshift(d[b]),d=d.constructor.superclass;var e={};for(var f=0,h=c.length;f<h;f++)e=g(e,i(c[f]));return e}b.initAttrs=function(a){this.hasOwnProperty("attrs")||(this.attrs={});var b=this.attrs;g(b,l(this,"attrs"));var c={silent:!0};if(a)for(var d in a)this.set(d,a[d],c);for(d in b){var e=k(d);this[e]&&this.on("change:"+d,this[e])}},b.get=function(a){var b=this.attrs[a]||{},c=b.value;return b.getter?b.getter.call(this,c,a):c},b.set=function(a,b,c){var d={};e(a)?d[a]=b:(d=a,c=b),c||(c={});var h=this.attrs,i=c.silent;for(a in d){var j=h[a]||(h[a]={});b=d[a];if(j.readOnly)throw"This attribute is readOnly: "+a;if(j.validator){var k=j.validator.call(this,b,a);if(k!==!0){c.error&&c.error.call(this,k);continue}}j.setter&&(b=j.setter.call(this,b,a));var l=this.get(a);f(l)&&f(b)&&(b=g(g({},l),b)),h[a].value=b,!i&&this.trigger&&this.trigger("change:"+a,b,l,a)}};var c=Object.prototype.toString,d=Array.isArray||function(a){return c.call(a)==="[object Array]"},h=["value","getter","setter","validator","readOnly"]});