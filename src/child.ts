import * as child_process from "child_process";
import * as path from "path";
// child_process
//   .execFile(path.join(__dirname, "waifu2x-caffe", "waifu2x-caffe-cui.exe"), [
//     "-s",
//     "2.0",
//     "-n",
//     "3",
//     "-i",
//     `${path.join(__dirname, "input", "1208")}.png`,
//     "-o",
//     `${path.join(__dirname, "output", "1208")}.png`
//   ])
//   .on("close", () => {
//     resolve();
//   })
//   .on("message", msg => {
//     console.log(msg);
//   });

const waifu2x: child_process.ChildProcess = child_process
  .spawn("waifu2x-converter-cpp", [
    "--scale_ratio",
    "3.0",
    "--noise_level",
    "3",
    "-i",
    `${path.join(__dirname, "input", "65")}.png`,
    "-o",
    `${path.join(__dirname, "output", "1208")}.jpg`
  ])
  .on("close", () => {
    console.log("closed");
  })
  .on("message", msg => {
    console.log(msg);
  });

waifu2x.stdout.on("data", data => {
  console.log(`stdout: ${data}`);
});

waifu2x.on("close", code => {
  console.log(`child process exited with code ${code}`);
});
