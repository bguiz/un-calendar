"use strict";
var moment = require("moment")["default"] || require("moment");
var Component = require("ember").Component;
var computed = require("ember").computed;

function cpFormatMoment(key, format) {
  return computed(function() {
    var date = this.get(key);
    return date ? date.format(format) : null;
  }).property(key);
}

exports["default"] = Component.extend({
  classNames: 'ui-calendar',

  prevLabel: '&larr;',
  nextLabel: '&rarr;',
  todayLabel: 'Today',
  showNextMonth: true,
  showPrevMonth: true,
  disableHeader: false,
  disableControls: false,
  disableTodayButton: false,

  multiple:      false,
  disablePast:   null,
  disableFuture: null,
  maxPastDate:   null,
  maxFutureDate: null,
  month:         null,
  disabledDates: null,
  selectedDates: null,
  selectedDate:  null,

  init: function() {
    this._super();

    if (!this.get('selectedDates')) {
      this.set('multiple', false);
      this.set('selectedDates', []);
    }

    if (this.get('selectedDate')) {
      this.get('selectedDates').addObject(this.get('selectedDate'));
    }

    var firstSelectedDate = this.get('selectedDates.firstObject');

    if (!this.get('month') && firstSelectedDate) {
      this.set('month', firstSelectedDate.clone().startOf('month'));
    }

    if (!this.get('month')) {
      this.set('month', moment().startOf('month'));
    }
  },

  actions: {
    dateSelected: function(date) {
      if (this.get('multiple')) {
        this.get('selectedDates').removeObject(date);
        this.get('selectedDates').addObject(date);
      } else {
        this.set('selectedDate', date);
      }

      this.sendAction('select', date);
    },

    prev: function() {
      var month = this.get('month');

      if (!month || this.get('isPrevDisabled')) {
        return;
      }

      this.set('month', month.clone().subtract('months', 1));
    },

    next: function() {
      var month = this.get('month');

      if (!month || this.get('isNextDisabled')) {
        return;
      }

      this.set('month', month.clone().add('months', 1));
    },

    today: function() {
      this.set('month', moment());
    }
  },

  selectedDateWillChange: function() {
    this.get('selectedDates').removeObject(this.get('selectedDate'));
  }.observesBefore('selectedDate'),

  selectedDateDidChange: function() {
    this.get('selectedDates').addObject(this.get('selectedDate'));
  }.observes('selectedDate'),

  // TODO: Add timer to invalidate this
  now: function() {
    return moment();
  }.property(),

  prevMonth: function() {
    var month = this.get('month');
    return month ? month.clone().subtract('months', 1) : null;
  }.property('month'),

  nextMonth: function() {
    var month = this.get('month');
    return month ? month.clone().add('months', 1) : null;
  }.property('month'),

  isNextMonthInFuture: function() {
    var nextMonth = this.get('nextMonth'),
        now       = this.get('now');

    return nextMonth ? nextMonth.isAfter(now, 'month') : false;
  }.property('nextMonth', 'now'),

  isPrevMonthInPast: function() {
    var prevMonth = this.get('prevMonth'),
        now       = this.get('now');

    return prevMonth ? prevMonth.isBefore(now, 'month') : false;
  }.property('prevMonth', 'now'),

  isPrevMonthBeyondMax: function() {
    var prevMonth   = this.get('prevMonth'),
        maxPastDate = this.get('maxPastDate');

    if (!prevMonth || !maxPastDate) {
      return false;
    }

    return prevMonth.isBefore(maxPastDate, 'month');
  }.property('prevMonth', 'maxPastDate'),

  isNextMonthBeyondMax: function() {
    var nextMonth     = this.get('nextMonth'),
        maxFutureDate = this.get('maxFutureDate');

    if (!nextMonth || !maxFutureDate) {
      return false;
    }

    return nextMonth.isAfter(maxFutureDate, 'month');
  }.property('nextMonth', 'maxFutureDate'),

  isPrevDisabled: function() {
    if (this.get('isPrevMonthBeyondMax')) {
      return true;
    }

    if (this.get('disablePast') && this.get('isPrevMonthInPast')) {
      return true;
    }

    return false;
  }.property('isPrevMonthBeyondMax', 'isPrevMonthInPast', 'disablePast'),

  isNextDisabled: function() {
    if (this.get('isNextMonthBeyondMax')) {
      return true;
    }

    if (this.get('disableFuture') && this.get('isNextMonthInFuture')) {
      return true;
    }

    return false;
  }.property('isNextMonthBeyondMax', 'isNextMonthInFuture', 'disableFuture'),

  prevMonthLabel: cpFormatMoment('prevMonth', 'MMMM YYYY'),
  nextMonthLabel: cpFormatMoment('nextMonth', 'MMMM YYYY'),
  monthLabel:     cpFormatMoment('month', 'MMMM YYYY')
});