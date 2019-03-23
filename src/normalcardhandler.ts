import { Card } from "./lovelive";

import * as _ from "lodash";
import * as request from "request";
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";

var validSchool: Array<string> = [
  "Uranohoshi Girls' High School",
  "Otonokizaka Academy"
];

var inputDir: string = path.join(__dirname, "input");
var outputDir: string = path.join(__dirname, "output");

export function generateOptions(specifiedIdol: string = ""): any 
{
  const school:string = _.random(100) < 80 ? validSchool[0] : validSchool[1];
  return {
    qs: {
      ordering: "random",
      rarity: "SSR,UR",
      name:
        specifiedIdol ?
          specifiedIdol :
          school === "Otonokizaka Academy" ? "Minami Kotori,Kousaka Honoka" : "",
      idol_school: specifiedIdol ? "" : school
    }
  };
}

export function getCard(specifiedIdol:string = ""): Promise<Card> {
  var options: any = generateOptions(specifiedIdol)
  return new Promise((resolve, reject) => {
    request.get("https://schoolido.lu/api/cards/", options, async (error, response, body) => {
      // if (error) throw new Error(error);
      if (error) {
        reject(error);
      }

      try {
        var results: any = await JSON.parse(body).results;
      } catch (err) {
        reject(err);
      }
      console.log(results)
      resolve(results[0]);
    });
  });
}

export function downloadCard(card: Card): Promise<null> {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(`input/${card.id}.png`)) {
      resolve();
      return;
    }
    request.get("http:" + card.clean_ur_idolized, error => {
      if (error) {
        reject(error);
      }
    }).pipe(
      fs
        .createWriteStream(path.join(inputDir, `${card.id}.png`), {
          autoClose: true
        })
        .on("close", () => resolve())
    );
  });
}

export function waifu2xCard(card: Card): Promise<null> {
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
        .spawn("waifu2x-converter-cpp", [
          "--scale_ratio",
          "3.0",
          "--noise_level",
          "3",
          "-i",
          `${path.join(__dirname, "input", card.id.toString())}.png`,
          "-o",
          `${path.join(__dirname, "output", card.id.toString())}.jpg`
        ])
        .on("close", () => {
          resolve();
        })
        .on("message", msg => {
          console.log(msg);
        });
    });
  }
}