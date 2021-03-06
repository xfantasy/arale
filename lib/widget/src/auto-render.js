define(function(require, exports) {

    var $ = require('$');
    var DAParser = require('./daparser');


    // 自动渲染接口，子类可根据自己的初始化逻辑进行覆盖
    exports.autoRender = function(config) {
        new this(config).render();
    };


    // 根据 data-widget 属性，自动渲染所有 widget 组件
    exports.autoRenderAll = function(root) {
        root = $(root || document.body);
        var modules = [];
        var elements = [];

        root.find('[data-widget]').each(function(i, element) {
            modules.push(element.getAttribute('data-widget').toLowerCase());
            elements.push(element);
        });

        if (modules.length) {
            require.async(modules, function() {
                for (var i = 0; i < arguments.length; i++) {
                    var SubWidget = arguments[i];
                    var element = elements[i];

                    if (SubWidget.autoRender) {
                        var config = DAParser.parseElement(element);
                        var dataset = DAParser.parseBlock(element);

                        delete config.widget;
                        config.element = element;
                        config.dataset = dataset;

                        SubWidget.autoRender(config);
                    }
                }
            });
        }
    };

});
