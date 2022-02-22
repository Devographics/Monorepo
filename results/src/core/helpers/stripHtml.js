export const stripHtml = s => s && s.replace(/<([^>]+?)([^>]*?)>(.*?)<\/\1>/gi, '$3')
