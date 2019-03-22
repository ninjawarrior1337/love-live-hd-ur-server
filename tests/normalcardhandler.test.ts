import {getCard, generateOptions} from "../src/normalcardhandler"

test('Makes sure when you specify an idol, the object will return with that idol', async () => {
    const card = await getCard("Minami Kotori")
    expect(card.idol.name).toBe("Minami Kotori")
})

// test('Make sure when you dont specify an idol, it only returns specific options', () => {
//     let options = generateOptions("Minami Kotori")
//     expect(options.qs.name).toBe("Minami Kotori")
// })

test('Make sure when you dont specify an idol, it only returns specific options', () => {
    let options = generateOptions()
    expect(options.qs.name).toMatch(/(Minami Kotori,Kousaka Honoka)|^$/)
})

