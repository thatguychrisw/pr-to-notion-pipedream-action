export default {
    heading: (size, text) => {
        const headingType = `heading_${size}`;

        return {
            'type': headingType,
            [headingType]: {
                'text': [{
                    'type': 'text',
                    'text': {
                        'content': text
                    }
                }]
            }
        };
    },
    paragraph: (text) => ({
        'type': 'paragraph',
        'paragraph': {
            'text': [{
                'type': 'text',
                'text': {
                    'content': text,
                    'link': null
                }
            }]
        }
    }),
    codeBlock: (language, code) => ({
        'type': 'code',
        'code': {
            'text': [{
                'type': 'text',
                'text': {
                    'content': code
                }
            }],
            'language': language
        }
    }),
};
