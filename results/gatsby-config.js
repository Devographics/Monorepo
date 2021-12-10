require('dotenv').config()

module.exports = {
    siteMetadata: {
        title: `State Of JS 2020`,
    },
    plugins: [
        'gatsby-transformer-yaml',
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: `data`,
                path: `${__dirname}/src/data/`,
            },
        },
        {
            resolve: 'gatsby-source-graphql',
            options: {
                typeName: 'SurveyApi',
                fieldName: 'surveyApi',
                url: process.env.API_URL,
            },
        },
        'gatsby-plugin-react-helmet',
        'gatsby-plugin-sass',
        { resolve: 'gatsby-plugin-netlify', options: {} },
        'gatsby-plugin-styled-components',
        `gatsby-plugin-mdx`,
        // 'gatsby-plugin-webpack-bundle-analyzer',
    ],
}
