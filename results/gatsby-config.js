require('dotenv').config()

module.exports = {
    siteMetadata: {
        title: `State Of CSS 2021`,
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
        // `gatsby-plugin-perf-budgets`,
        // `gatsby-plugin-webpack-bundle-analyser-v2`
    ],
}
