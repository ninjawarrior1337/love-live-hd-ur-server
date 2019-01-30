var _ = require('lodash')
var request = require("request");
var child_process = require("child_process");
var fs = require('fs')
var path = require('path')

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

module.exports = { getUrPair }