import diffs from './diffs.mjs';

export default {
    dateRange: (start, end) => ({
        'date': {
            start,
            end,
        }
    }),

    title: (text) => ({
        'title': [
            {
                'type': 'text',
                'text': {
                    'content': text
                }
            }
        ]
    }),

    url: (url) => ({
        url
    }),

    select: (option) => ({
        'select': {
            'name': option
        }
    }),

    number: (number) => ({
        number
    }),

    richText: (text) => ({
        'rich_text': [
            {
                'type': 'text',
                'text': {
                    'content': text
                }
            }
        ]
    }),

    tags: (tags) => ({
        'multi_select': tags.map(type => ({name: type}))
    })
};
