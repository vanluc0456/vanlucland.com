(function ($) {
    'use strict';

    wp.customize.bind('ready', function () {
        $('.customize-control input[type="range"]').each(function () {
            var $range = $(this);
            var $value = $('<output class="vld-range-value" aria-live="polite"></output>');

            $range.after($value);

            function updateValue() {
                $value.text($range.val());
            }

            updateValue();
            $range.on('input change', updateValue);
        });

        $('.vld-sortable-list').each(function () {
            var $list = $(this);
            var $control = $list.closest('.customize-control');
            var $input = $control.find('.vld-sortable-value');

            $list.sortable({
                axis: 'y',
                handle: '.vld-sortable-handle',
                placeholder: 'vld-sortable-placeholder',
                update: function () {
                    var order = $list.children('.vld-sortable-item').map(function () {
                        return $(this).data('value');
                    }).get();

                    $input.val(order.join(',')).trigger('change');
                }
            });
        });
    });
}(jQuery));
