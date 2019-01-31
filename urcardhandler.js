var _ = require('lodash')
var request = require("request");
var child_process = require("child_process");
var fs = require('fs')
var path = require('path')
var jimp = require('jimp')
// var {waifu2xCard} = require('./normalcardhandler')

var validSchool = ["Uranohoshi Girls' High School", "Otonokizaka Academy"];

var inputDir = path.join(__dirname, "input");
var outputDir = path.join(__dirname, "output");

let getUrPair = () => {
    const school = _.random(100) < 80 ? validSchool[0] : validSchool[1];
    var options = {
        method: 'GET',
        url: 'https://schoolido.lu/api/cards/',
        qs:
        {
            rarity: 'UR, SSR',
            idol_school: school,
            expand_ur_pair: '',
            ordering: 'random',
            name:
                school == "Otonokizaka Academy" ? "Minami Kotori,Kousaka Honoka" : "",
        }
    };
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            // if (error) throw new Error(error);
            if (error) reject(error);

            // console.log(body)

            try {
                var results = JSON.parse(body).results
            }
            catch (err) {
                reject(err)
            }

            _.forEach(results, (val, index, col) => {
                if (val.ur_pair != null) {
                    resolve(val);
                }
            })
        });
    });
};

function downloadAndMergePair(card) {
    return new Promise(async (resolve, reject) => {
        var idolized = _.sample([true, false])
        let card1;
        let card2;
        if (idolized) {
            if (card.ur_pair.reverse_display_idolized) {
                card1 = await jimp.read("https:" + card.ur_pair.card.clean_ur_idolized)
                card2 = await jimp.read("https:" + card.clean_ur_idolized)
            }
            else {
                card1 = await jimp.read("https:" + card.clean_ur_idolized)
                card2 = await jimp.read("https:" + card.ur_pair.card.clean_ur_idolized)
            }
        }
        else {
            if (card.ur_pair.reverse_display) {
                card1 = await jimp.read("https:" + card.ur_pair.card.clean_ur)
                card2 = await jimp.read("https:" + card.clean_ur)
            }
            else {
                card1 = await jimp.read("https:" + card.clean_ur)
                card2 = await jimp.read("https:" + card.ur_pair.card.clean_ur)
            }
        }

        let combinedCard = new jimp(card1.getWidth() + card2.getWidth(), card1.getHeight())

        combinedCard.composite(card1, 0, 0)
        combinedCard.composite(card2, card1.getWidth(), 0)

        combinedCard.write(path.join(inputDir, `${card.id}x${card.ur_pair.card.id}.jpg`), () => resolve())
    })
}

function waifu2xPairCard(card) {
    if (process.platform === "win32") {
        return new Promise((resolve, reject) => {
            child_process
                .execFile(
                    path.join(__dirname, "waifu2x-caffe", "waifu2x-caffe-cui.exe"),
                    [
                        "-s",
                        "2.0",
                        "-n",
                        "3",
                        "-i",
                        path.join(inputDir, `${card.id}x${card.ur_pair.card.id}.jpg`),
                        "-o",
                        path.join(outputDir, `${card.id}x${card.ur_pair.card.id}.jpg`)
                    ],
                    {
                        windowsHide: true
                    }
                )
                .on("close", () => {
                    resolve();
                })
                .on("message", msg => {
                    console.log(msg);
                });
        });
    } else {
        return new Promise((resolve, reject) => {
            child_process
                .spawn(
                    "waifu2x-converter-cpp",
                    [
                        "--scale_ratio",
                        "2.0",
                        "--noise_level",
                        "3",
                        "-i",
                        path.join(inputDir, `${card.id}x${card.ur_pair.card.id}.jpg`),
                        "-o",
                        path.join(outputDir, `${card.id}x${card.ur_pair.card.id}.jpg`)
                    ]
                )
                .on("close", () => {
                    resolve();
                })
                .on("message", msg => {
                    console.log(msg);
                });
        });
    }
}

module.exports = { getUrPair, downloadAndMergePair, waifu2xPairCard }