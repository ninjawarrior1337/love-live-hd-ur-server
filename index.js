var compression = require("compression");
var app = require("express")();
var request = require("request");
var fs = require("fs");
var child_process = require("child_process");
var path = require("path");
var _ = require("lodash");

var lifx = require("node-lifx");
var lclient = new lifx.Client();
lclient.init({ lights: ["192.168.1.86"] });

// var PngQuant = require("pngquant");
// var pngquanter = new PngQuant([192, "--quality", "60-90", "-"]);

var validSchool = ["Uranohoshi Girls' High School", "Otonokizaka Academy"];

var inputDir = path.join(__dirname, "input");
var outputDir = path.join(__dirname, "output");

app.use(compression());

if (!fs.existsSync(inputDir) || !fs.existsSync(outputDir)) {
  fs.mkdirSync(inputDir);
  fs.mkdirSync(outputDir);
}

for (file of fs.readdirSync(path.join(__dirname, "output"))) {
  fs.unlinkSync(path.join(__dirname, "output", file));
}

let getCard = () => {
  const school = _.random(100) < 80 ? validSchool[0] : validSchool[1];
  var options = {
    method: "GET",
    url: "http://schoolido.lu/api/cards/",
    qs: {
      ordering: "random",
      rarity: "SSR,UR",
      name:
        school == "Otonokizaka Academy" ? "Minami Kotori,Kousaka Honoka" : "",
      idol_school: school
    }
  };
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) throw new Error(error);
      if (error) reject(error);

      resolve(JSON.parse(body).results[0]);
    });
  });
};

function downloadCard(card) {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(`input/${card.id}.png`)) {
      resolve();
      return;
    }
    request("http:" + card.clean_ur_idolized).pipe(
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

app.get("/", async (req, res) => {
  //   console.log(await getCard());
  res.set("Content-Type", "image/jpeg");
  var card = await getCard();
  //   if(card.idol.name == "Yazawa Nico")
  console.log("Downloading Card");
  await downloadCard(card);
  console.log("Enhancing Card");
  await waifu2xCard(card);

  // var cardStream = fs.createReadStream(
  //   `${path.join(outputDir, card.id.toString())}.png`
  // );

  // cardStream.pipe(pngquanter).pipe(res);

  await res.sendFile(
    `${path.join(__dirname, "output", card.id.toString())}.jpg`
  );
  console.log(card.id + ": Done Encoding");

  if (req.query.changeLight == "true") {
    changeLightColor(undefined, card.idol.name);
  }

  //   res.send(`<img src=${"http:" + card.clean_ur_idolized}></img>`);
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
  res.send(
    await changeLightColor((hex = req.query.hex), (idol = req.query.idol))
  );
});

app.listen("3000", () => console.log("App listening on port 3000"));
