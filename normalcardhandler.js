var _ = require('lodash')
var request = require("request");
var child_process = require("child_process");
var fs = require('fs')
var path = require('path')

var validSchool = ["Uranohoshi Girls' High School", "Otonokizaka Academy"];

var inputDir = path.join(__dirname, "input");
var outputDir = path.join(__dirname, "output");

let getCard = () => {
    const school = _.random(100) < 80 ? validSchool[0] : validSchool[1];
    var options = {
        method: "GET",
        url: "https://schoolido.lu/api/cards/",
        qs: {
            ordering: "random",
            rarity: "SSR,UR",
            name:
                school == "Otonokizaka Academy" ? "Minami Kotori,Kousaka Honoka" : "",
            idol_school: school
        }
    };
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {

            // if (error) throw new Error(error);
            if (error) reject(error);

            try {
                var results = JSON.parse(body).results
            }
            catch (err) {
                reject(err)
            }

            resolve(results[0]);
        });
    });
};

function downloadCard(card) {
    return new Promise(async (resolve, reject) => {
        if (fs.existsSync(`input/${card.id}.png`)) {
            resolve();
            return;
        }
        request("http:" + card.clean_ur_idolized, (error) => {
            if (error) reject(error);
        }).pipe(
            fs
                .createWriteStream(path.join(inputDir, `${card.id}.png`), {
                    autoClose: true
                })
                .on("close", () => resolve())
        );
    });
}

function waifu2xCard(card) {
    if (process.platform === "win32") {
        return new Promise((resolve, reject) => {
            child_process
                .execFile(
                    path.join(__dirname, "waifu2x-caffe", "waifu2x-caffe-cui.exe"),
                    [
                        "-s",
                        "3.0",
                        "-n",
                        "3",
                        "-i",
                        `${path.join(inputDir, card.id.toString())}.png`,
                        "-o",
                        `${path.join(outputDir, card.id.toString())}.jpg`
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
                        "3.0",
                        "--noise_level",
                        "3",
                        "-i",
                        `${path.join(__dirname, "input", card.id.toString())}.png`,
                        "-o",
                        `${path.join(__dirname, "output", card.id.toString())}.jpg`
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

module.exports = { downloadCard, waifu2xCard, getCard }