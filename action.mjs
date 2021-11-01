import moment from 'moment-timezone';
import moment_duration_format from 'moment-duration-format';
import notionApi from './notion.mjs';
import pullRequests from './pull-requests.mjs';
import diffs from './diffs.mjs';
import notionBlocks from './notion-blocks.mjs';
import notionPageProps from './notion-page-properties.mjs';

const toISOString = (date) => {
    if (!date) return null

    return moment(date).tz("America/New_York").format();
}

export default {
    name: 'Create Notion Page from Github Pull Request',
    description: 'This action creates a notion page (requires specific template) based on a Github pull request',
    key: 'pr_to_notion_page',
    version: '1.0.28',
    type: 'action',
    props: {
        notion: {
            type: 'app',
            app: 'notion',
        },
        githubPullRequestEvent: {
            type: 'any',
            label: 'A Pull Request Event from Github',
            description: 'Must be a valid json object'
        }
    },

    async run() {
        const notion = notionApi(this.notion.$auth.oauth_access_token);
        const pullRequest = this.githubPullRequestEvent.pull_request;
        const diff = await diffs.asString(pullRequest);

        if (['opened', 'reopened'].includes(this.githubPullRequestEvent.action)) {
            // create a new page for new PRs
            return await notion.createPage('7ae0203d139c422f908b4acd3c75e51b', pullRequest.user.avatar_url,
              {
                  'Name': notionPageProps.title(pullRequest.title),
                  'Timeframe': notionPageProps.dateRange(toISOString(pullRequest.created_at)),
                  'Link': notionPageProps.url(pullRequest.html_url),
                  'Status': notionPageProps.select(pullRequest.state),
                  'Additions': notionPageProps.number(pullRequest.additions),
                  'Deletions': notionPageProps.number(pullRequest.deletions),
                  'Files Changed': notionPageProps.number(pullRequest.changed_files),
                  'Comments': notionPageProps.number(pullRequest.comments),
                  'Size': notionPageProps.select(pullRequests.getSize(pullRequest)),
                  'Creator': notionPageProps.select(pullRequest.user.login),
                  'Lead Time (m)': notionPageProps.number(0),
                  'Lead Time': notionPageProps.richText('Fresh'),
                  'Tags': notionPageProps.tags(await diffs.getFileTypes(diff)),
              }, [
                  notionBlocks.heading(2, 'Description'),
                  notionBlocks.paragraph(pullRequest.body ?? 'No description provided.'),
                  notionBlocks.paragraph('---'),
                  notionBlocks.codeBlock('diff', diff),
              ]);
        } else {
            // get the notion page by pull request title
            try {
                const page = await notion.findPage('7ae0203d139c422f908b4acd3c75e51b', pullRequest.title);

                const leadTimeInMinutes = pullRequests.getLeadTime(pullRequest.created_at, pullRequest.merged_at ?? moment.now());

                // update the diff
                const codeBlock = await notion.findFirstBlock(page.id, 'code');
                await notion.updateBlock(codeBlock.id, notionBlocks.codeBlock('diff', diff));

                // update the description
                const descriptionBlock = await notion.findFirstBlock(page.id, 'paragraph');
                await notion.updateBlock(descriptionBlock.id, notionBlocks.paragraph(pullRequest.body ?? 'No description provided.'));

                const closedAt = pullRequest.merged_at ?? pullRequest.closed_at

                // update the page
                return await notion.updatePage(page.id, {
                    'Timeframe': notionPageProps.dateRange(toISOString(pullRequest.created_at), toISOString(closedAt)),
                    'Status': notionPageProps.select(pullRequests.isStale(leadTimeInMinutes) ? 'stale' : pullRequest.state),
                    'Tags': notionPageProps.tags(await diffs.getFileTypes(diff)),
                    'Additions': notionPageProps.number(pullRequest.additions),
                    'Deletions': notionPageProps.number(pullRequest.deletions),
                    'Files Changed': notionPageProps.number(pullRequest.changed_files),
                    'Comments': notionPageProps.number(pullRequest.comments),
                    'Size': notionPageProps.select(pullRequests.getSize(pullRequest)),
                    'Lead Time (m)': notionPageProps.number(leadTimeInMinutes),
                    'Lead Time': notionPageProps.richText(moment.duration(leadTimeInMinutes, 'minutes').format('hh[h] mm[m]'))
                });
            } catch {
                return null;
            }
        }
    }
};
