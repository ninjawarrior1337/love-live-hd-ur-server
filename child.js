var child_process = require("child_process");
var path = require("path");

child_process
  .execFile(path.join(__dirname, "waifu2x-caffe", "waifu2x-caffe-cui.exe"), [
    "-s",
    "2.0",
    "-n",
    "3",
    "-i",
    `${path.join(__dirname, "input", "1208")}.png`,
    "-o",
    `${path.join(__dirname, "output", "1208")}.png`
  ])
  .on("close", () => {
    resolve();
  })
  .on("message", msg => {
    console.log(msg);
  });
