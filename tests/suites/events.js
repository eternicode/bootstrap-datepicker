module('Events', {
    setup: function(){
        this.input = $('<input type="text" value="31-03-2011">')
                        .appendTo('#qunit-fixture')
                        .datepicker({format: "dd-mm-yyyy"})
                        .focus(); // Activate for visibility checks
        this.dp = this.input.data('datepicker')
        this.picker = this.dp.picker;
    },
    teardown: function(){
        this.picker.remove();
    }
});

test('Selecting a year from decade view triggers pickYear', function(){
    var target,
        triggered = 0;

    this.input.on('changeYear', function(){
        triggered++;
    });

    equal(this.dp.viewMode, 0);
    target = this.picker.find('.datepicker-days thead th.datepicker-switch');
    ok(target.is(':visible'), 'View switcher is visible');

    target.click();
    ok(this.picker.find('.datepicker-months').is(':visible'), 'Month picker is visible');
    equal(this.dp.viewMode, 1);
    // Not modified when switching modes
    datesEqual(this.dp.viewDate, UTCDate(2011, 2, 31));
    datesEqual(this.dp.date, UTCDate(2011, 2, 31));

    target = this.picker.find('.datepicker-months thead th.datepicker-switch');
    ok(target.is(':visible'), 'View switcher is visible');

    target.click();
    ok(this.picker.find('.datepicker-years').is(':visible'), 'Year picker is visible');
    equal(this.dp.viewMode, 2);
    // Not modified when switching modes
    datesEqual(this.dp.viewDate, UTCDate(2011, 2, 31));
    datesEqual(this.dp.date, UTCDate(2011, 2, 31));

    // Change years to test internal state changes
    target = this.picker.find('.datepicker-years tbody span:contains(2010)');
    target.click();
    equal(this.dp.viewMode, 1);
    // Only viewDate modified
    datesEqual(this.dp.viewDate, UTCDate(2010, 2, 1));
    datesEqual(this.dp.date, UTCDate(2011, 2, 31));
    equal(triggered, 1);
});

test('Selecting a month from year view triggers pickMonth', function(){
    var target,
        triggered = 0;

    this.input.on('changeMonth', function(){
        triggered++;
    });

    equal(this.dp.viewMode, 0);
    target = this.picker.find('.datepicker-days thead th.datepicker-switch');
    ok(target.is(':visible'), 'View switcher is visible');

    target.click();
    ok(this.picker.find('.datepicker-months').is(':visible'), 'Month picker is visible');
    equal(this.dp.viewMode, 1);
    // Not modified when switching modes
    datesEqual(this.dp.viewDate, UTCDate(2011, 2, 31));
    datesEqual(this.dp.date, UTCDate(2011, 2, 31));

    target = this.picker.find('.datepicker-months tbody span:contains(Apr)');
    target.click();
    equal(this.dp.viewMode, 0);
    // Only viewDate modified
    datesEqual(this.dp.viewDate, UTCDate(2011, 3, 1));
    datesEqual(this.dp.date, UTCDate(2011, 2, 31));
    equal(triggered, 1);
});

test('format() returns a formatted date string', function(){
    var target,
        error, out;

    this.input.on('changeDate', function(e){
        try{
            out = e.format();
        }
        catch(e){
            error = e;
        }
    });

    equal(this.dp.viewMode, 0);
    target = this.picker.find('.datepicker-days tbody td:nth(15)');
    target.click();

    datesEqual(this.dp.viewDate, UTCDate(2011, 2, 14));
    datesEqual(this.dp.date, UTCDate(2011, 2, 14));
    equal(error, undefined)
    equal(out, '14-03-2011');
});

test('format(altformat) returns a formatted date string', function(){
    var target,
        error, out;

    this.input.on('changeDate', function(e){
        try{
            out = e.format('m/d/yy');
        }
        catch(e){
            error = e;
        }
    });

    equal(this.dp.viewMode, 0);
    target = this.picker.find('.datepicker-days tbody td:nth(15)');
    target.click();

    datesEqual(this.dp.viewDate, UTCDate(2011, 2, 14));
    datesEqual(this.dp.date, UTCDate(2011, 2, 14));
    equal(error, undefined)
    equal(out, '3/14/11');
});

test('Clear button: triggers change and changeDate events', function(){
    this.input = $('<input type="text" value="31-03-2011">')
                    .appendTo('#qunit-fixture')
                    .datepicker({
                        format: "dd-mm-yyyy",
                        clearBtn: true
                    })
                    .focus(); // Activate for visibility checks
    this.dp = this.input.data('datepicker');
    this.picker = this.dp.picker;

    var target,
        triggered_change = 0,
        triggered_changeDate = 0;

    this.input.on({
        changeDate: function(){
            triggered_changeDate++;
        },
        change: function(){
            triggered_change++;
        }
    });

    this.input.focus();
    ok(this.picker.find('.datepicker-days').is(':visible'), 'Days view visible');
    ok(this.picker.find('.datepicker-days tfoot .clear').is(':visible'), 'Clear button visible');

    target = this.picker.find('.datepicker-days tfoot .clear');
    target.click();

    equal(triggered_change, 1);
    equal(triggered_changeDate, 1);
});

test('Fill method: Triggers fill event', function () {
    this.input = $('<input type="text" value="31-03-2011">')
                    .appendTo('#qunit-fixture')
                    .datepicker({
                        format: "dd-mm-yyyy",
                        clearBtn: true
                    })
                    .focus(); // Activate for visibility checks

    this.dp = this.input.data('datepicker');
    this.picker = this.dp.picker;

    var triggered = false;

    this.input.on('fill', function (event) {
        triggered = true;
    });

    this.dp.fill();

    equal(triggered, true);
});
