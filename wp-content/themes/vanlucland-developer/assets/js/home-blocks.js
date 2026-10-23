(function (blocks, blockEditor, element, i18n) {
    'use strict';

    if (!blocks || !blockEditor || !element || !window.vldHomeBlocks) {
        return;
    }

    const createElement = element.createElement;
    const useBlockProps = blockEditor.useBlockProps;
    const __ = i18n.__;

    Object.keys(window.vldHomeBlocks.blocks).forEach((name) => {
        const settings = window.vldHomeBlocks.blocks[name];

        blocks.registerBlockType(name, {
            apiVersion: 2,
            title: settings.title,
            description: settings.description,
            icon: settings.icon,
            category: 'van-luc-land',
            keywords: ['Văn Lực Land', 'trang chủ', 'responsive'],
            supports: {
                align: false,
                html: false,
                multiple: false,
                reusable: false
            },
            edit: function () {
                const props = useBlockProps({
                    className: 'vld-section-placeholder'
                });

                return createElement(
                    'section',
                    props,
                    createElement('span', { className: 'vld-section-placeholder__icon dashicons dashicons-' + settings.icon, 'aria-hidden': 'true' }),
                    createElement(
                        'div',
                        { className: 'vld-section-placeholder__content' },
                        createElement('strong', null, settings.title),
                        createElement('p', null, settings.description),
                        createElement(
                            'a',
                            {
                                href: settings.customizerUrl || window.vldHomeBlocks.customizerUrl,
                                target: '_blank',
                                rel: 'noopener noreferrer'
                            },
                            __('Sửa nội dung và hình ảnh', 'vanlucland-developer')
                        )
                    )
                );
            },
            save: function () {
                return null;
            }
        });
    });
}(window.wp.blocks, window.wp.blockEditor, window.wp.element, window.wp.i18n));
