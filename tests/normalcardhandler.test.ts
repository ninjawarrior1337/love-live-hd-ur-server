import * as nock from 'nock'
import {getCard, generateOptions, getCardCallback} from "../src/normalcardhandler"
import * as _ from 'lodash'
import { RequestCallback } from 'request';
// jest.mock('request')
// jest.mock('lodash')

let schooIdolApi = nock('https://schoolido.lu')

test('Checks to make sure request.get is called with right params', async () => {

    const request = require('request')

    const spy = jest.spyOn(request, "get")

    spy.mockReturnValueOnce(() => "Idol info here")

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
    
    expect(getCardCallback(new Error("error"), undefined, undefined)).rejects.toEqual(expect.any(Error))
  })

  test('Error if incomplete json', () => {
    expect(getCardCallback(undefined, undefined, "{succ: }")).rejects.toEqual(expect.any(Error))
  })

  test('Returns correct object of json', () => {
    expect(getCardCallback(undefined, undefined, '{"results": [{"name": "Minami Kotori"}]}')).resolves.toEqual({name: "Minami Kotori"})
  })

  test('If callback returns an error, it errors', async () => {
    const request = require('request')
    
    const spy = jest.spyOn(request, 'get')

    spy.mockImplementationOnce((url, options, callback: RequestCallback) => {callback("e", undefined, undefined)})
    let errorNock = schooIdolApi.get('/api/cards/').query(() => true).reply(200)
    await expect(getCard()).rejects.toEqual("e")
    nock.cleanAll()
  })

  test('If callback returns make sure it returns a card', async () => {
    schooIdolApi.get('/api/cards/').query(() => true).reply(200, '{"results": [{"name": "Minami Kotori"}]}')
    await expect(getCard()).resolves.toEqual({'name': 'Minami Kotori'})
    nock.cleanAll()
  })

  test("If we can't return a card, we reject the promise", async () => {
    schooIdolApi.get('/api/cards/').query(() => true).reply(200, '{"results": [{"name" "Minami Kotori"}]}')
    await expect(getCard()).rejects.toThrowError(expect.any(Error))
    nock.cleanAll()
  })
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
    const spy = jest.spyOn(_, 'random')
    spy.mockReturnValueOnce(81)
    let options = generateOptions()
    expect(options.qs.name).toMatch(/(Minami Kotori,Kousaka Honoka)|/)
    // jest.unmock('lodash')
  })

  test('when school = Uranohoshi It only returns infinite possible idols', () => {
    const spy = jest.spyOn(_, 'random')
    spy.mockReturnValueOnce(1)
    let options = generateOptions()
    expect(options.qs.name).toMatch(/^$/)
    jest.unmock('lodash')
  })
})