import { Client } from '@notionhq/client';

export default (accessToken) => {
    const notion = new Client({
        auth: accessToken,
    })

    return {
        findPage: async (databaseId, title) => {
            return (await notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: 'Name',
                    text: {
                        contains: title
                    }
                }
            }))['results'][0]
        },

        findFirstBlock: async (blockId, type) => {
            const blocks = (await notion.blocks.children.list({
                block_id: blockId
            }))['results']

            for (const i in blocks) {
                const block = blocks[i]

                if (block.type === type) {
                    return block
                }
            }

            return null
        },

        updateBlock: async (blockId, block) => {
            return await notion.blocks.update({
                block_id: blockId,
                ...block
            })
        },

        createPage: async (databaseId, iconUrl, properties, children) => {
            return await notion.pages.create({
                parent: {
                    database_id: databaseId
                },
                icon: {
                    external: {
                        url: iconUrl
                    }
                },
                properties,
                children,
            })
        },

        updatePage: async (pageId, properties) => {
            return await notion.pages.update({
                page_id: pageId,
                properties
            })
        }
    }
}

