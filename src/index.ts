import * as express from "express";
import * as bodyParser from "body-parser";
import * as fs from "fs";
import * as path from "path";
import * as util from 'util';
import * as _ from "lodash";
import { getCard, downloadCard } from "./normalcardutils";
import waifu2x from './waifu2xHandler'
import requestedImage from './sources/requestedImage'

import {
  getUrPair,
  downloadAndMergePair,
  waifu2xPairCard
} from "./urcardhandler";

let app: express.Application = express();

let urlencodedParser = bodyParser.urlencoded({extended: true})
let rawParser = bodyParser.raw({type: '*/*', limit: "3mb"})

import * as lifx from "node-lifx";
import { Card } from "./lovelive";
import normalCard from "./sources/normalCard";
import urpair from "./sources/urpair";
let lclient: any = new lifx.Client();
lclient.init({ lights: ["192.168.1.86"] });

// var PngQuant = require("pngquant");
// var pngquanter = new PngQuant([192, "--quality", "60-90", "-"]);

let inputDir: string = path.join(__dirname, "input");
let outputDir: string = path.join(__dirname, "output");

if (!fs.existsSync(inputDir) || !fs.existsSync(outputDir)) {
  fs.mkdirSync(inputDir);
  fs.mkdirSync(outputDir);
}

for (let file of fs.readdirSync(outputDir)) 
{
  fs.unlinkSync(path.join(outputDir, file));
}

if(process.env.NODE_ENV === 'dev')
{
  for(let file of fs.readdirSync(inputDir))
  {
    fs.unlinkSync(path.join(inputDir, file))
  }
}

//Handles random card and specific card generation

app.get("/", urlencodedParser, async (req: express.Request, res: express.Response) => {
  try {
    let image = new normalCard(Object.keys(req.query).length === 0, req.query.idol, req.query.id, req.query.regular)
    await image.setCard()
    await image.assembleAndWrite()
    await image.waifu2xify()
    await res.sendFile(image.outputFilePath)
  } 
  catch(e) {
    res.set("Content-Type", "text/plain").status(500)
    res.send(`${e}`);
  }
});

app.get("/submit", rawParser, async(req: express.Request, res: express.Response) => 
{
  try {
    let image = new requestedImage(req.body)
    await image.writeData()
    await image.waifu2xify()
    await res.sendFile(image.outputFilePath)
  }
  catch(e) {
    res.set("Content-Type", "text/plain").status(500)
    res.send(`${e}`);
  }
})

app.get("/urpair", async (req: express.Request, res: express.Response) => {
  // res.set("Content-Type", "image/jpeg");
  try 
  {
    let pair = new urpair(Object.keys(req.query).length === 0, req.query.idol, req.query.id, req.query.regular)

    await pair.setCard()
    pair.checkUrPair()
    await pair.assembleAndWrite()
    await pair.waifu2xify()
    await res.sendFile(pair.outputFilePath)
    // var card: Card = await getUrPair();
    // await downloadAndMergePair(card);
    // await waifu2xPairCard(card);

    // res.sendFile(
    //   path.join(outputDir, `${card.id}x${card.ur_pair.card.id}.jpg`)
    // );
    // console.log(`${card.id}: ${card.ur_pair.reverse_display_idolized}`);
  } 
  catch(e)
  {
    res.set("Content-Type", "text/plain").status(500)
    res.send(`${e}`);
  }
});

function changeLightColor(hex?: string, idol?: string): Promise<any> {
  let colors: Object = {
    "Takami Chika": "#F0A20B",
    "Sakurauchi Riko": "#E9A9E8",
    "Matsuura Kanan": "#13E8AE",
    "Kurosawa Dia": "#F23B4C",
    "Watanabe You": "#49B9F9",
    "Tsushima Yoshiko": "#898989",
    "Kunikida Hanamaru": "#E6D617",
    "Ohara Mari": "#AE58EB",
    "Kurosawa Ruby": "#FB75E4",
    "Minami Kotori": "#07c585"
  };
  for (let light of lclient.lights()) {
    // light.getPower((err, data) => {
    //   if (data === 1) {
    //     light.off();
    //   } else {
    //     light.on();
    //   }
    //   if (data !== null) {
    //     res.send(data.toString());
    //   }
    // });
    let selectedColor: string = `${_.sample(colors)}`;
    if (hex !== undefined) {
      return new Promise((resolve, reject) => {
        light.colorRgbHex("#" + hex, 0, () => {
          resolve("#" + hex);
        });
      });
    } else if (idol) {
      return new Promise((resolve, reject) => {
        light.colorRgbHex(colors[idol], 0, () => {
          resolve(idol);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        light.colorRgbHex(selectedColor, 0, () => {
          resolve(_.invert(colors)[selectedColor]);
        });
      });
    }
  }
}

app.get("/light", async (req: express.Request, res: express.Response) => {
  var ip: any = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  console.log(ip);

  res.send(await changeLightColor(req.query.hex, req.query.idol));
});

app.listen("3000", () => console.log("App listening on port 3000"));
