const {
    logToFile,
    getPageContext,
    getPageQuery,
    wrapWithQuery,
    cleanIdString,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages,
    runPageQuery,
    getTwitterUser
} = require('./helpers.js')
const fetch = require('node-fetch')
const _ = require('lodash')
const FormData = require('form-data')

// `https://opensheet.elk.sh/${process.env.GDOCS_SPREADSHEET}/Public%20Data`

// const sendOwlAPIUrl = `https://${process.env.SENDOWL_API_KEY}:${process.env.SENDOWL_SECRET}@www.sendowl.com/api`
const sendOwlAPIUrl = `https://www.sendowl.com/api`

const getSendOwlOptions = () => ({
    method: 'get',
    headers: {
        Accept: 'application/json',
        Authorization:
            'Basic ' +
            Buffer.from(
                `${process.env.SENDOWL_API_KEY}:${process.env.SENDOWL_SECRET}`,
                'binary'
            ).toString('base64')
    }
})

exports.getSendOwlData = async ({ flat, config }) => {
  
    if (!process.env.SENDOWL_API_KEY || !process.env.SENDOWL_SECRET) {
        return {}
    }

    // get products
    const productsResponse = await fetch(`${sendOwlAPIUrl}/v1/products/`, getSendOwlOptions())
    const productsData = await productsResponse.json()
    const productsDataClean = productsData.map(({ product }) => ({
        chartId: product.name,
        instant_buy_url: product.instant_buy_url,
        add_to_cart_url: product.add_to_cart_url,
        sales_page_url: product.sales_page_url
    }))

    // get orders
    const ordersResponse = await fetch(`${sendOwlAPIUrl}/v1_3/orders/`, getSendOwlOptions())
    const ordersData = await ordersResponse.json()
    const ordersDataClean = ordersData.map(({ order }) => ({
        chartId: _.get(order, 'download_items.0.name'),
        amount: order.price_at_checkout,
        twitterName: _.get(
            order,
            'order_custom_checkout_fields.0.order_custom_checkout_field.value'
        )
    }))

    // add twitter data
    for (const order of ordersDataClean) {
        if (order.twitterName) {
            const twitterData = await getTwitterUser(order.twitterName)
            order.twitterData = twitterData
        }
    }

    const logOptions = { mode: 'overwrite', subDir: 'chart_sponsors' }
    logToFile('products.json', productsData, logOptions)
    logToFile('orders.json', ordersData, logOptions)
    logToFile('product_clean.json', productsDataClean, logOptions)
    logToFile('orders_clean.json', ordersDataClean, logOptions)

    let i = 0
    // create any missing products
    for (const page of flat) {
        for (const block of page.blocks) {
            for (const variant of block.variants) {
                if (variant.hasSponsor) {
                    const chartId = `${config.surveySlug}___${variant.id}`
                    const existingProduct = productsDataClean.find(
                        order => order.chartId === chartId
                    )
                    if (!existingProduct && i < 0) {
                        console.log(`// No product found for ${chartId}, creating…`)
                        const formData = new FormData()
                        formData.append('product[name]', chartId)
                        formData.append('product[product_type]', 'digital')
                        formData.append(
                            'product[self_hosted_url]',
                            `${config.siteUrl}/sponsor-chart-finish?chartId=${chartId}`
                        )
                        formData.append('product[price]', '10.00')
                        formData.append('product[sales_limit]', 1)
                        formData.append('product[price_is_minimum]', 1)
                        formData.append('product[limit_to_single_qty_in_cart]', 1)
                        const createProductResponse = await fetch(
                            `${sendOwlAPIUrl}/v1/products.json`,
                            {
                                ...sendOwlOptions,
                                method: 'post',
                                body: formData
                            }
                        )
                        const createProductData = await createProductResponse.json()

                        logToFile('created_products.json', createProductData, {
                            mode: 'append',
                            subDir: 'chart_sponsors'
                        })

                        // add newly created product to list of all products
                        const { product } = createProductData
                        productsDataClean.push({
                            chartId,
                            instant_buy_url: product.instant_buy_url,
                            add_to_cart_url: product.add_to_cart_url,
                            sales_page_url: product.sales_page_url
                        })
                        i++
                    }
                }
            }
        }
    }

    return { products: productsDataClean, orders: ordersDataClean }
}
