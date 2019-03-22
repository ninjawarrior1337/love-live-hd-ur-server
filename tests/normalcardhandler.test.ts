import {getCard, generateOptions} from "../src/normalcardhandler"
jest.mock('request')


test('Checks to make sure request.get is called with right params', async () => {

    const request = require('request')

    request.get.mockReturnValue(() => "Idol info here")

    const spy = jest.spyOn(request, "get")
    const card = getCard("Minami Kotori")

    expect(request.get).toHaveBeenCalledTimes(1)
    expect(request.get).toHaveBeenCalledWith("https://schoolido.lu/api/cards/", {
        qs: {
          ordering: "random",
          rarity: "SSR,UR",
          name: "Minami Kotori",
          idol_school: ""
        }
      }, expect.any(Function))
      jest.resetAllMocks()
    }
)
    // expect(getCard._isMockFunction).toBeTruthy()
    // expect(request).toHaveBeenCalledWith(generateOptions("Minami Kotori"))
    // expect(card.idol.name).toBe("Minami Kotori")

// test('Make sure when you dont specify an idol, it only returns specific options', () => {
//     let options = generateOptions("Minami Kotori")
//     expect(options.qs.name).toBe("Minami Kotori")
// })

test('Make sure when you dont specify an idol, it only returns specific options', () => {
    let options = generateOptions()
    expect(options.qs.name).toMatch(/(Minami Kotori,Kousaka Honoka)|^$/)
})

test('Makes sure when school = Otonokizaka It only returns 2 possible idols', () => {
  let options = generateOptions(undefined, "Otonokizaka Academy")
  expect(options.qs.name).toMatch(/(Minami Kotori,Kousaka Honoka)|/)
})

