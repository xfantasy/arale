define(function(require, exports, module) {

    var $ = require('jquery');
    var Base = require('base');
    var moment = require('moment');

    // Create a model data on calendar. For example, now is May, 2012.
    // And the week begin at Sunday.
    // This model should be:
    //
    //     {current: current, dates: [...], weeks: [..]}
    //
    var CalendarModel = Base.extend({

        attrs: {
            year: null,
            month: null,
            week: null,
            date: null,
            time: null,

            today: ''
        },

        initialize: function(cal) {
            this._lang = cal.lang;
            this._current = cal.focus.clone();
            this._startDay = cal.startDay;
            this._available = cal.available;
            this._focus = cal.focus;

            var today = translate(cal.lang, 'Today');
            this.set('today', today);

            this.renderData();
        },

        renderData: function() {
            this.set('year', yearModel(this._current.year()));
            this.set('month', monthModel(this._lang, this._current.month()));
            this.set('week', weekModel(this._lang, this._startDay));

            var date = dateModel(
                this._current.clone(), this._available,
                this._focus, this._startDay
            );
            this.set('date', date);
            this.set('time', timeModel());
        },

        changeTime: function(arg, number) {
            if (!arg) {
                this.set('time', timeModel());
                return this;
            }
            this._current.add(arg, number);
            this.renderData();
            return this;
        },

        changeStartDay: function(day) {
            this._startDay = day;
            this.renderData();
            return this;
        },

        getDate: function(date, month) {
            if (date) this._current.date(date);
            if (month) this._current.month(month);
            return this._current.clone();
        },

        toJSON: function() {
            return {
                year: this.get('year'),
                month: this.get('month'),
                week: this.get('week'),
                date: this.get('date'),
                time: this.get('time'),
                today: this.get('today')
            }
        },

        _available: null,
        _startDay: 0,
        _current: null,
        _focus: null,
        _lang: null
    });

    var showMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    var showDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    var fullDays = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    var shortDays = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4,
        'Fri': 5, 'Sat': 6
    };
    var minDays = {
        'Su': 0, 'Mo': 1, 'Tu': 2, 'We': 3, 'Th': 4, 'Fr': 5, 'Sa': 6
    };

    function parseStartDay(startDay) {
        if (!startDay) {
            startDay = 0;
        } else if (!$.isNumeric(startDay)) {
            if (startDay in fullDays) startDay = days[startDay];
            if (startDay in shortDays) startDay = shortDays[startDay];
            if (startDay in minDays) startDay = minDays[startDay];
        } else {
            startDay = parseInt(startDay);
        }
        return startDay;
    }

    function monthModel(lang, month) {
        var items = [];
        for (i = 0; i < showMonths.length; i++) {
            var selected = false;
            if (i == month) selected = true;
            items.push({
                value: i,
                label: translate(lang, showMonths[i]),
                selected: selected
            });
        }
        var current = {
            value: month,
            label: translate(lang, showMonths[month])
        }
        return {current: current, items: items};
    }

    function yearModel(year, range) {
        //TODO
        return {current: year};
    }

    function weekModel(lang, startDay) {
        // Translate startDay to number. 0 is Sunday, 6 is Saturday.
        var startDay = parseStartDay(startDay);
        var weeks = [];
        for (i = startDay; i < 7; i++) {
            weeks.push({label: translate(lang, showDays[i]), value: i});
        }
        for (i = 0; i < startDay; i++) {
            weeks.push({label: translate(lang, showDays[i]), value: i});
        }
        return {startDay: startDay, items: weeks};
    }

    function dateModel(current, available, focus, startDay) {
        var items = [];
        var startDay = parseStartDay(startDay);
        var pushData = function(d, status) {
            items.push({
                month: d.month(),
                date: d.date(),
                day: d.day(),
                status: status,
                available: isAvailable(d, available)
            });
        }

        // reset to the first date of the month
        current.date(1);

        // Calculate days of previous month
        // that should be on current month's sheet
        var delta = current.day() - startDay;
        if (delta != 0) {
            var previous = current.clone().add('months', -1);
            var days = previous.daysInMonth();
            // delta in a week
            if (delta < 0) delta += 7;
            // *delta - 1**: we need decrease it first
            for (i = delta - 1; i >= 0; i--) {
                var d = previous.date(days - i);
                pushData(d, 'previous');
            }
        }

        var formatedFocus = focus.format('YYYY-MM-DD');
        for (i = 1; i <= current.daysInMonth(); i++) {
            var d = current.date(i);
            if (d.format('YYYY-MM-DD') === formatedFocus) {
                var status = 'current focus';
            } else {
                var status = 'current';
            }
            pushData(d, status);
        }

        // Calculate days of next month
        // that should be on current month's sheet
        var delta = 35 - items.length;
        if (delta != 0) {
            var next = current.clone().add('months', 1);
            if (delta < 0) delta += 7;
            for (i = 1; i <= delta; i++) {
                var d = next.date(i);
                pushData(d, 'next');
            }
        }
        var list = [];
        for (var i = 0; i < items.length / 7; i++) {
            list.push(items.slice(i * 7, i * 7 + 7));
        }

        var focus = {
            date: focus.date(),
            day: focus.day()
        }

        return {focus: focus, items: list};
    }

    function timeModel() {
        var now = moment();
        return {hour: now.hours(), minute: now.minutes()};
    }

    function isAvailable(time, available) {
        if (available == null) return true;
        if ($.isArray(available)) {
            var start = available[0];
            var end = available[1];
            var result = true;
            if (start) {
                result = result && time >= moment(start);
            }
            if (end) {
                result = result && time <= moment(end);
            }
            return result;
        }
        if ($.isFunction(available)) {
            return available(time);
        }
        return true;
    }

    function translate(lang, key) {
        if (!lang) return key;
        if (key in lang) return lang[key];
        return key;
    }

    module.exports = CalendarModel;
});
