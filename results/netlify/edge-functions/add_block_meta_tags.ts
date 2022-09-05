const insertInto = (source, startIndex, endIndex, snippet) => source.slice(0,startIndex) + snippet + source.slice(endIndex, source.length)

export default async (request, context) => {
  
    const url = new URL(request.url)
    console.log('// add block meta tags')
  console.log(url)
    const description = url.searchParams.get('description')
    const shareUrl = url.searchParams.get('shareUrl')
    const title = url.searchParams.get('title')
    const image = url.searchParams.get('image')

    if (description || shareUrl || title || image) {
      
      console.log(description)
      console.log(shareUrl)
      console.log(title)
      console.log(image)

        const response = await context.next()
        const page = await response.text()

        const startKeyword = '<meta name="custom-meta-start" data-react-helmet="true">'
        const endKeyword = '<meta name="custom-meta-end" data-react-helmet="true">'
        const startIndex = page.indexOf(startKeyword)
        const endIndex = page.indexOf(endKeyword)

        const newMetaTags = `
<meta name="description" content="${description}" />        
<meta property="og:type" content="article" />
<meta property="og:url" content="${shareUrl}" />
<meta property="og:image" content="${image}" />
<meta property="og:title" content="${title}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image:src" content="${image}" />
<meta name="twitter:title" content="${title}" />
        `

        const updatedPage = insertInto(page, startIndex, endIndex + endKeyword.length, newMetaTags)

        return new Response(updatedPage, response)
    } else {
        return
    }
}
