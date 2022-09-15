const { sleep, getTwitterUser, getConfigLocations, getExistingData } = require('./helpers.js')
const fetch = require('node-fetch')
const _ = require('lodash')
const FormData = require('form-data')
const { logToFile } = require('./log_to_file.js')

// `https://opensheet.elk.sh/${process.env.GDOCS_SPREADSHEET}/Public%20Data`

// const sendOwlAPIUrl = `https://${process.env.SENDOWL_API_KEY}:${process.env.SENDOWL_SECRET}@www.sendowl.com/api`
const sendOwlAPIUrl = `https://www.sendowl.com/api`

const logOptions = { mode: 'overwrite', subDir: 'chart_sponsors' }

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

const fetchUntilNoMore = async (url, options) => {
    let page = 1,
        hasMore = true,
        allData = [],
        data
    while (hasMore) {
        const fetchUrl = `${url}?per_page=50&page=${page}`
        console.log(`// Fetching url ${fetchUrl}…`)
        const response = await fetch(fetchUrl, options)
        const text = await response.text()
        try {
            data = JSON.parse(text)
        } catch (error) {
            throw Error(text)
        }
        // const data = await response.json()
        if (data.length === 0) {
            hasMore = false
        } else {
            allData = [...allData, ...data]
        }
        page++
        await sleep(1000)
    }
    return allData
}

const getProducts = async ({ config }) => {
    const { surveyId } = config
    // get products
    const productsData = await fetchUntilNoMore(
        `${sendOwlAPIUrl}/v1/products/`,
        getSendOwlOptions()
    )
    let productsDataClean = productsData.map(({ product }) => ({
        surveyId: product.name.split('___')[0],
        chartId: product.name,
        productId: product.id,
        instant_buy_url: product.instant_buy_url,
        add_to_cart_url: product.add_to_cart_url,
        sales_page_url: product.sales_page_url
    }))
    productsDataClean = productsDataClean.filter(p => p.surveyId === surveyId)
    logToFile('products.json', productsData, { ...logOptions, surveyId })
    logToFile('product_clean.json', productsDataClean, { ...logOptions, surveyId })

    return productsDataClean
}

const getOrders = async ({ products, config }) => {
    const { surveyId } = config
    // get orders
    const orders = []
    let ordersData = await fetchUntilNoMore(`${sendOwlAPIUrl}/v1_3/orders/`, getSendOwlOptions())

    ordersData.forEach(({ order }) => {
        let twitterName = _.get(
            order,
            'order_custom_checkout_fields.0.order_custom_checkout_field.value'
        )
        // get rid of any @ in the twitter name
        twitterName = twitterName.replace('@', '')
        order.cart.cart_items.forEach(({ cart_item }) => {
            // cart items only have productId, not product name, so look up product name
            const product = products.find(p => p.productId === cart_item.product_id)
            // if order does not correspond to a real product just ignore it
            if (product && cart_item.quantity > 0) {
                // only add products that belongs to current survey
                if (product.chartId.split('___')[0] === surveyId) {
                    orders.push({
                        orderId: order.id,
                        chartId: product.chartId,
                        amount: cart_item.price_at_checkout,
                        twitterName
                    })
                }
            }
        })
    })

    // add twitter data
    for (const order of orders) {
        if (order.twitterName) {
            const twitterData = await getTwitterUser(order.twitterName)
            if (twitterData) {
                const { username, profile_image_url, name } = twitterData
                order.twitterData = { username, profile_image_url, name }
            }
        }
    }
    logToFile('orders.json', ordersData, { ...logOptions, surveyId })
    logToFile('orders_clean.json', orders, { ...logOptions, surveyId })

    return orders
}

const maxProductsToCreateInOneGo = 100
const createMissingProducts = async ({ products, chartVariants, config }) => {
    console.log(`// Found ${chartVariants.length} chart variants, checking for missing products…`)
    const newProducts = []
    const { surveyId } = config
    let i = 0
    // create any missing products
    for (const variant of chartVariants) {
        const chartId = `${config.surveySlug}___${variant.id}`
        const existingProduct = products.find(order => order.chartId === chartId)
        if (!existingProduct && i < maxProductsToCreateInOneGo) {
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
            const createProductResponse = await fetch(`${sendOwlAPIUrl}/v1/products.json`, {
                ...getSendOwlOptions(),
                method: 'post',
                body: formData
            })
            const createProductData = await createProductResponse.json()

            logToFile('created_products.json', createProductData, {
                mode: 'append',
                subDir: 'chart_sponsors',
                surveyId
            })

            // add newly created product to list of all products
            const { product } = createProductData
            newProducts.push({
                chartId,
                instant_buy_url: product.instant_buy_url,
                add_to_cart_url: product.add_to_cart_url,
                sales_page_url: product.sales_page_url
            })
            i++
            await sleep(1000)
        }
    }
    return newProducts
}
exports.getSendOwlData = async ({ flat, config }) => {
    if (!process.env.SENDOWL_API_KEY || !process.env.SENDOWL_SECRET) {
        return {}
    }

    const { localPath, url } = getConfigLocations(config)
    const dataFileName = 'sendowl.json'
    const dataDirName = 'results/chart_sponsorships'
    const dataDirPath = localPath + '/' + dataDirName
    const existingData = await getExistingData({
        dataFileName,
        dataFilePath: dataDirPath + '/' + dataFileName,
        baseUrl: url + '/' + dataDirName
    })

    if (existingData) {
        return existingData
    } else {
        // get list of all chart variants that should have corresponding products
        const chartVariants = []
        for (const page of flat) {
            for (const block of page.blocks) {
                for (const variant of block.variants) {
                    if (variant.hasSponsor) {
                        chartVariants.push(variant)
                    }
                }
            }
        }

        const products = await getProducts({ config })
        const orders = await getOrders({ products, config })
        const newProducts = await createMissingProducts({ products, chartVariants, config })
        const allProducts = [...products, ...newProducts]

        const data = { products: allProducts, orders }

        logToFile(dataFileName, data, {
            mode: 'overwrite',
            dirPath: dataDirPath
        })
        return data
    }
}
