import {getCard, generateOptions, getCardCallback} from "../src/normalcardhandler"
jest.mock('request')
jest.mock('lodash')

test('Checks to make sure request.get is called with right params', async () => {

    const request = require('request')

    request.get.mockReturnValueOnce(() => "Idol info here")

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
    }
)

describe("get card tests", () => {
  test("If the request returns an error, it errors", async () => {
    
    expect(getCardCallback(new Error("error"), undefined, undefined)).rejects.toMatch('error')
  })

  // test('If callback returns an error, it errors', () => {

  // })

})

describe("test generate options", () => {
  test('Make sure when you dont specify an idol, it only returns specific options', () => {
      let options = generateOptions()
      expect(options.qs.name).toMatch(/(Minami Kotori,Kousaka Honoka)|^$/)
  })

  test('Make sure when you specify an id, it only returns specific options', () => {
    let options = generateOptions(undefined, "67")
    expect(options.qs).toEqual({
      ids: "67"
    })
  })

  test('when school = Otonokizaka It only returns 2 possible idols', () => {
    const _ = require('lodash')
    _.random.mockReturnValueOnce(81)
    let options = generateOptions()
    expect(options.qs.name).toMatch(/(Minami Kotori,Kousaka Honoka)|/)
  })

  test('when school = Uranohoshi It only returns infinite possible idols', () => {
    const _ = require('lodash')
    _.random.mockReturnValueOnce(1)
    let options = generateOptions()
    expect(options.qs.name).toMatch(/^$/)
  })
})