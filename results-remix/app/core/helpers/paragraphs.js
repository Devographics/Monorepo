const addParagraphs = s => `<p>${s.replaceAll('\n\n', '</p><p>')}</p>`

export default addParagraphs
