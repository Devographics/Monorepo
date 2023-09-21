export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// https://stackoverflow.com/questions/840781/get-all-non-unique-values-i-e-duplicate-more-than-one-occurrence-in-an-array
export const findDuplicates = (arr: string[]) => {
    let sorted_arr = arr.slice().sort() // You can define the comparing function here.
    // JS by default uses a crappy string compare.
    // (we use slice to clone the array so the
    // original array won't be modified)
    let results = []
    for (let i = 0; i < sorted_arr.length - 1; i++) {
        if (sorted_arr[i + 1] === sorted_arr[i]) {
            results.push(sorted_arr[i])
        }
    }
    return results
}

export const findDuplicates2 = (arr: string[]) => arr.filter((e, i, a) => a.indexOf(e) !== i)
