define(
  ["handlebars","moment","ember","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Handlebars = __dependency1__["default"] || __dependency1__;
    var moment = __dependency2__["default"] || __dependency2__;
    var Component = __dependency3__.Component;
    var $ = __dependency3__.$;
    var run = __dependency3__.run;
    var get = __dependency3__.get;

    var DATE_SLOT_HBS = Handlebars.compile(
      '<li class="{{classNames}}" data-date="{{jsonDate}}">' +
        '{{date}}' +
      '</li>'
    );

    function containsDate(dates, date) {
      if (!dates || !get(dates, 'length')) {
        return false;
      }

      return dates.any(function(d) {
        return date.isSame(d, 'day');
      });
    }

    function forEachSlot(month, iter) {
      var totalDays  = month.daysInMonth(),
          firstDay   = month.clone().startOf('month').weekday(),
          currentDay = 1;

      function popCurrentDay() {
        if (currentDay > totalDays) {
          return null;
        } else {
          return moment([month.year(), month.month(), currentDay++]);
        }
      }

      for (var week = 0; week <= 6; week++) {
        for (var day = 0; day <= 6; day++) {
          if (week === 0) {
            iter(day < firstDay ? null : popCurrentDay());
          } else {
            iter(currentDay <= totalDays ? popCurrentDay() : null);
          }
        }

        if (currentDay > totalDays) {
          break;
        }
      }
    }

    __exports__["default"] = Component.extend({
      tagName:      'ol',
      classNames:   'ui-calendar-month',
      month:         null,
      selectedDates: null,
      disabledDates: null,

      init: function() {
        this._super();

        if (!this.get('selectedDates')) {
          throw 'you must provide selectedDates to ui-calendar-month';
        }
      },

      click: function(event) {
        var $target = $(event.target);

        if ($target.is('.is-disabled')) {
          return;
        }

        if ($target.is('[data-date]')) {
          this.sendAction('select', moment($target.data('date'), 'YYYY-MM-DD'));
        }
      },

      monthDidChange: function() {
        run.scheduleOnce('afterRender', this, 'rerender');
      }.observes('month'),

      selectedDatesDidChange: function() {
        run.scheduleOnce('afterRender', this, 'setSelectedDates');
      }.observes('selectedDates.@each'),

      setSelectedDates: function() {
        var dates = this.get('selectedDates'),
            view  = this,
            json;

        if (this.state !== 'inDOM') {
          return;
        }

        this.$('li').removeClass('is-selected');

        dates.forEach(function(date) {
          json = date.format('YYYY-MM-DD');
          view.$('[data-date="' + json + '"]').addClass('is-selected');
        });
      },

      didInsertElement: function() {
        this.setSelectedDates();
      },

      render: function(buff) {
        var month = this.get('month'),
            view  = this;

        if (!month) {
          return;
        }

        function renderSlot(slot) {
          var attrs;

          if (slot) {
            attrs = {
              date:       slot.format('D'),
              jsonDate:   slot.format('YYYY-MM-DD'),
              classNames: ['ui-calendar-slot', 'ui-calendar-day']
            };

            view.applyOptionsForDate(attrs, slot);
            attrs.classNames = attrs.classNames.join(' ');
            buff.push(DATE_SLOT_HBS(attrs));
          } else {
            buff.push('<li class="ui-calendar-slot ui-calendar-empty"></li>');
          }
        }

        forEachSlot(month, function(slot) {
          renderSlot(slot);
        });
      },

      applyOptionsForDate: function(options, date) {
        var disabledDates = this.get('disabledDates'),
            selectedDates = this.get('selectedDates');

        if (moment().isSame(date, 'day')) {
          options.classNames.push('is-today');
        }

        if (disabledDates && containsDate(disabledDates, date)) {
          options.classNames.push('is-disabled');
        }

        if (selectedDates && containsDate(selectedDates, date)) {
          options.classNames.push('is-selected');
        }
      },
    });
  });