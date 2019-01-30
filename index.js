var compression = require("compression");
var app = require("express")();
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var { getCard, downloadCard, waifu2xCard } = require('./normalcardhandler')
var { getUrPair } = require('./urcardhandler')

var lifx = require("node-lifx");
var lclient = new lifx.Client();
lclient.init({ lights: ["192.168.1.86"] });

// var PngQuant = require("pngquant");
// var pngquanter = new PngQuant([192, "--quality", "60-90", "-"]);

var inputDir = path.join(__dirname, "input");
var outputDir = path.join(__dirname, "output");

if (!fs.existsSync(inputDir) || !fs.existsSync(outputDir)) {
  fs.mkdirSync(inputDir);
  fs.mkdirSync(outputDir);
}

for (file of fs.readdirSync(path.join(__dirname, "output"))) {
  fs.unlinkSync(path.join(__dirname, "output", file));
}

app.get("/", async (req, res) => {
  try {
    res.set("Content-Type", "image/jpeg");
    console.log("Selecting Card: Normal");
    var card = await getCard();
    console.log("Downloading Card: Normal");
    await downloadCard(card);
    console.log("Enhancing Card: Normal");
    await waifu2xCard(card);

    await res.sendFile(
      `${path.join(__dirname, "output", card.id.toString())}.jpg`
    );
  }
  catch
  {
    res.send("download failed, try again in a few seconds")
  }

  console.log(card.id + ": Done Encoding");

  if (req.query.changeLight == "true") {
    changeLightColor(undefined, card.idol.name);
  }
});

app.get("/urpair", async (req, res) => {
  // res.set("Content-Type", "image/jpeg");
  try {
    var card = await getUrPair()
    var idolized = _.sample([true, false])
    if (idolized) {
      if (card.ur_pair.reverse_display_idolized) {
        res.send(`<img data=${card.ur_pair.reverse_display_idolized} src=${card.ur_pair.card.clean_ur_idolized}\>` + `<img src=${card.clean_ur_idolized}\>`)
      }
      else {
        res.send(`<img src=${card.clean_ur_idolized}\>` + `<img src=${card.ur_pair.card.clean_ur_idolized}\>`)
      }
    }
    else {
      if (card.ur_pair.reverse_display) {
        res.send(`<img data=${card.ur_pair.reverse_display} src=${card.ur_pair.card.clean_ur}\>` + `<img src=${card.clean_ur}\>`)
      }
      else {
        res.send(`<img src=${card.clean_ur}\>` + `<img src=${card.ur_pair.card.clean_ur}\>`)
      }
    }
    console.log(`${card.id}: ${card.ur_pair.reverse_display_idolized}`)
  }
  catch
  {
    res.send("failed, try again in a few seconds")
  }

  // console.log("Downloading Card: Normal");
  // await downloadCard(card);
  // console.log("Enhancing Card: Normal");
  // await waifu2xCard(card);

  // await res.sendFile(
  //   `${path.join(__dirname, "output", card.id.toString())}.jpg`
  // );

  // console.log(card.id + ": Done Encoding");

  // if (req.query.changeLight == "true") {
  //   changeLightColor(undefined, card.idol.name);
  // }
});

function changeLightColor(hex, idol) {
  let colors = {
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
  for (light of lclient.lights()) {
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
    let selectedColor = _.sample(colors);
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

app.get("/light", async (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  console.log(ip)

  res.send(
    await changeLightColor((hex = req.query.hex), (idol = req.query.idol))
  );
});

app.listen("3000", () => console.log("App listening on port 3000"));