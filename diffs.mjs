import path from 'path';
import got from 'got';
import { parse } from 'what-the-diff';

const getTypeName = (file) => {
    const readableTypes = {
        '.md': 'markdown',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.js': 'javascript',
        '.php': 'php',
        '.html': 'html',
        '.css': 'css',
        '.vue': 'vue',
        '.yml': 'yaml',
        '.tf': 'terraform',
        '.sh': 'shell',
        '.scss': 'sass',
        '.vcl': 'vcl',
    };

    const extension = path.extname(file);

    return readableTypes[extension] ?? extension;
};

export default {
    asString: async (pullRequest) => {
        return await got(pullRequest.diff_url).text();
    },

    getFileTypes: async (diff) => {
        return parse(diff).map(file => getTypeName(file.newPath));
    }
}
