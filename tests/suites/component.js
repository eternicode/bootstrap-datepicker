module('Component', {
    setup: function(){
        this.component = $('<div class="input-append date" id="datepicker">'+
                                '<input size="16" type="text" value="12-02-2012" readonly>'+
                                '<span class="add-on"><i class="icon-th"></i></span>'+
                            '</div>')
                        .appendTo('#qunit-fixture')
                        .datepicker({format: "dd-mm-yyyy"});
        this.input = this.component.find('input');
        this.addon = this.component.find('.add-on');
        this.dp = this.component.data('datepicker');
        this.picker = this.dp.picker;
    },
    teardown: function(){
        this.picker.remove();
    }
});


test('Component gets date/viewDate from input value', function(){
    datesEqual(this.dp.getUTCDate(), UTCDate(2012, 1, 12));
    datesEqual(this.dp.viewDate, UTCDate(2012, 1, 12));
});

test('Activation by component', function(){
    ok(!this.picker.is(':visible'));
    this.addon.click();
    ok(this.picker.is(':visible'));
});

test('Dont activation (by disabled) by component', function(){
    ok(!this.picker.is(':visible'));
    this.input.prop('disabled', true);
    this.addon.click();
    ok(!this.picker.is(':visible'));
    this.input.prop('disabled', false);
});

test('simple keyboard nav test', function(){
    var target;

    // Keyboard nav only works with non-readonly inputs
    this.input.removeAttr('readonly');

    equal(this.dp.viewMode, 0);
    target = this.picker.find('.datepicker-days thead th.datepicker-switch');
    equal(target.text(), 'February 2012', 'Title is "February 2012"');
    datesEqual(this.dp.getUTCDate(), UTCDate(2012, 1, 12));
    datesEqual(this.dp.viewDate, UTCDate(2012, 1, 12));

    // Focus/open
    this.addon.click();

    // Navigation: -1 day, left arrow key
    this.input.trigger({
        type: 'keydown',
        keyCode: 37
    });
    datesEqual(this.dp.viewDate, UTCDate(2012, 1, 11));
    datesEqual(this.dp.getUTCDate(), UTCDate(2012, 1, 12));
    datesEqual(this.dp.focusDate, UTCDate(2012, 1, 11));
    // Month not changed
    target = this.picker.find('.datepicker-days thead th.datepicker-switch');
    equal(target.text(), 'February 2012', 'Title is "February 2012"');

    // Navigation: +1 month, shift + right arrow key
    this.input.trigger({
        type: 'keydown',
        keyCode: 39,
        shiftKey: true
    });
    datesEqual(this.dp.viewDate, UTCDate(2012, 2, 11));
    datesEqual(this.dp.getUTCDate(), UTCDate(2012, 1, 12));
    datesEqual(this.dp.focusDate, UTCDate(2012, 2, 11));
    target = this.picker.find('.datepicker-days thead th.datepicker-switch');
    equal(target.text(), 'March 2012', 'Title is "March 2012"');

    // Navigation: -1 year, ctrl + left arrow key
    this.input.trigger({
        type: 'keydown',
        keyCode: 37,
        ctrlKey: true
    });
    datesEqual(this.dp.viewDate, UTCDate(2011, 2, 11));
    datesEqual(this.dp.getUTCDate(), UTCDate(2012, 1, 12));
    datesEqual(this.dp.focusDate, UTCDate(2011, 2, 11));
    target = this.picker.find('.datepicker-days thead th.datepicker-switch');
    equal(target.text(), 'March 2011', 'Title is "March 2011"');
});

test('setValue', function(){
    this.dp.dates.replace(UTCDate(2012, 2, 13));
    this.dp.setValue();
    datesEqual(this.dp.dates[0], UTCDate(2012, 2, 13));
    equal(this.input.val(), '13-03-2012');
});

test('update', function(){
    this.input.val('13-03-2012');
    this.dp.update();
    equal(this.dp.dates.length, 1);
    datesEqual(this.dp.dates[0], UTCDate(2012, 2, 13));
});

test('Navigating to/from decade view', function(){
    var target;

    this.addon.click();
    this.input.val('31-03-2012');
    this.dp.update();

    equal(this.dp.viewMode, 0);
    target = this.picker.find('.datepicker-days thead th.datepicker-switch');
    ok(target.is(':visible'), 'View switcher is visible');

    target.click();
    ok(this.picker.find('.datepicker-months').is(':visible'), 'Month picker is visible');
    equal(this.dp.viewMode, 1);
    // Not modified when switching modes
    datesEqual(this.dp.viewDate, UTCDate(2012, 2, 31));
    datesEqual(this.dp.dates[0], UTCDate(2012, 2, 31));

    target = this.picker.find('.datepicker-months thead th.datepicker-switch');
    ok(target.is(':visible'), 'View switcher is visible');

    target.click();
    ok(this.picker.find('.datepicker-years').is(':visible'), 'Year picker is visible');
    equal(this.dp.viewMode, 2);
    // Not modified when switching modes
    datesEqual(this.dp.viewDate, UTCDate(2012, 2, 31));
    datesEqual(this.dp.dates[0], UTCDate(2012, 2, 31));

    // Change years to test internal state changes
    target = this.picker.find('.datepicker-years tbody span:contains(2011)');
    target.click();
    equal(this.dp.viewMode, 1);
    // Only viewDate modified
    datesEqual(this.dp.viewDate, UTCDate(2011, 2, 1));
    datesEqual(this.dp.dates[0], UTCDate(2012, 2, 31));

    target = this.picker.find('.datepicker-months tbody span:contains(Apr)');
    target.click();
    equal(this.dp.viewMode, 0);
    // Only viewDate modified
    datesEqual(this.dp.viewDate, UTCDate(2011, 3, 1));
    datesEqual(this.dp.dates[0], UTCDate(2012, 2, 31));
});

test('Selecting date resets viewDate and date', function(){
    var target;

    this.addon.click();
    this.input.val('31-03-2012');
    this.dp.update();

    // Rendered correctly
    equal(this.dp.viewMode, 0);
    target = this.picker.find('.datepicker-days tbody td:first');
    equal(target.text(), '26'); // Should be Feb 26

    // Updated internally on click
    target.click();
    datesEqual(this.dp.viewDate, UTCDate(2012, 1, 26));
    datesEqual(this.dp.dates[0], UTCDate(2012, 1, 26));

    // Re-rendered on click
    target = this.picker.find('.datepicker-days tbody td:first');
    equal(target.text(), '29'); // Should be Jan 29
});

test('"destroy" removes associated HTML', function(){
    var datepickerDivSelector = '.datepicker';

    $('#datepicker').datepicker('show');

    //there should be one datepicker initiated so that means one hidden .datepicker div
    equal($(datepickerDivSelector).length, 1);
    this.component.datepicker('destroy');
    equal($(datepickerDivSelector).length, 0);//hidden HTML should be gone
});

test('"remove" is an alias for "destroy"', function(){
    var called, originalDestroy = this.dp.destroy;
    this.dp.destroy = function () {
        called = true;
        return originalDestroy.apply(this, arguments);
    };
    this.dp.remove();
    ok(called);
});

test('Does not block events', function(){
    var clicks = 0;
    function handler(){
        clicks++;
    }
    $('#qunit-fixture').on('click', '.add-on', handler);
    this.addon.click();
    equal(clicks, 1);
    $('#qunit-fixture').off('click', '.add-on', handler);
});


test('date and viewDate must be between startDate and endDate when setStartDate called', function() {
    this.dp.setDate(new Date(2013, 1, 1));
    datesEqual(this.dp.dates[0], UTCDate(2013, 1, 1));
    datesEqual(this.dp.viewDate, UTCDate(2013, 1, 1));
    this.dp.setStartDate(new Date(2013, 5, 6));
    datesEqual(this.dp.viewDate, UTCDate(2013, 5, 6));
    equal(this.dp.dates.length, 0);
});

test('date and viewDate must be between startDate and endDate when setEndDate called', function() {
    this.dp.setDate(new Date(2013, 11, 1));
    datesEqual(this.dp.dates[0], UTCDate(2013, 11, 1));
    datesEqual(this.dp.viewDate, UTCDate(2013, 11, 1));
    this.dp.setEndDate(new Date(2013, 5, 6));
    datesEqual(this.dp.viewDate, UTCDate(2013, 5, 6));
    equal(this.dp.dates.length, 0);
});

test('picker should render fine when `$.fn.show` and `$.fn.hide` are overridden', patch_show_hide(function () {
    var viewModes = $.fn.datepicker.DPGlobal.viewModes,
        minViewMode = this.dp.o.minViewMode,
        maxViewMode = this.dp.o.maxViewMode,
        childDivs = this.picker.children('div');

    this.dp.setViewMode(minViewMode);

    // Overwritten `$.fn.hide` method adds the `foo` class to its matched elements
    var curDivShowing = childDivs.filter('.datepicker-' + viewModes[minViewMode].clsName);
    ok(!curDivShowing.hasClass('foo'), 'Shown div does not have overridden `$.fn.hide` side-effects');

    // Check that other classes do have `foo` class
    var divNotShown;
    for (var curViewMode = minViewMode + 1; curViewMode <= maxViewMode; curViewMode++) {
        divNotShown = childDivs.filter('.datepicker-' + viewModes[curViewMode].clsName);
        ok(divNotShown.hasClass('foo'), 'Other divs do have overridden `$.fn.hide` side-effects');
    }
}));

test('today class is set on each view mode', function () {
  var day = 23, month = 'Jul' /*assume "en"*/,  year = 2016, decade = 2010, century = 2000;
  this.input.val('23-07-2016');

  this.dp.o.todayHighlight = true;
  this.dp.update();

  // we start on a day view.. which has ".today"
  var $el = this.picker.find('.datepicker-days td.today');
  equal($el.length, 1);
  equal($el.text(), day);

  // now we try other views..
  var me = this;
  [
    // change from days to months
    ['.datepicker-days', '.datepicker-months', month],
    // change from months to years
    ['.datepicker-months', '.datepicker-years', year],
    // change from years to decades
    ['.datepicker-years', '.datepicker-decades', decade],
    // change from decades to centuries
    ['.datepicker-decades', '.datepicker-centuries', century]

  ].forEach(function (testCase) {
    me.picker.find(testCase[0] + ' .datepicker-switch').click();
    var $el = me.picker.find(testCase[1] + ' tbody span.today');
    equal($el.length, 1);
    equal($el.text(), testCase[2]);
  });
});
