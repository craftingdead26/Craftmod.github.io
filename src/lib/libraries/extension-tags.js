import messages from './tag-messages.js';
export default [
    { tag: 'dinosaurmod', intlLabel: messages.dinosaurmod },
    { tag: 'nonomod', intlLabel: messages.penguinmod },
    { tag: 'forbidden', intlLabel: messages.forbidden },
    { tag: 'turbowarp', intlLabel: messages.turbowarp },
    { tag: 'scratch', intlLabel: messages.scratch },
    { tag: 'divider3', intlLabel: messages.scratch, type: 'divider' },
    { tag: 'categoryexpansion', intlLabel: messages.categoryexpansion },
    { tag: 'programminglanguage', intlLabel: messages.programminglanguage },
    { tag: 'hardware', intlLabel: messages.hardware },
    { tag: 'divider2', intlLabel: messages.scratch, type: 'divider' },
    { tag: 'collections', intlLabel: messages.collections },
    { tag: 'divider1', intlLabel: messages.scratch, type: 'divider' },
    { tag: 'divider1', intlLabel: 'Actions', type: 'title' },
    { tag: 'custom', intlLabel: messages.customextension, type: 'custom', func: (library) => {
        library.select(''); // selects custom extension since it's id is ''
    } },
];
