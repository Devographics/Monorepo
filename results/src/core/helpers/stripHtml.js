export const stripHtml = s => s.replace(/<([^>]+?)([^>]*?)>(.*?)<\/\1>/gi, '$3')
