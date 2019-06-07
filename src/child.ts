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

child_process
            .execFile(
              path.join(__dirname, "waifu2x-caffe", "waifu2x-caffe-cui.exe"),
              [
                "-s",
                "3.0",
                "-n",
                "3",
                "-i",
                'D:\\NodeJS Stuff\\random-ur-clear-card\\src\\input\\1384.png',
                "-o",
                'D:\\NodeJS Stuff\\random-ur-clear-card\\src\\output\\1384.png'
              ],
              {
                windowsHide: true
              }
            )
            .on("close", () => {
              
            })
            .on("message", msg => {
              console.log(msg);
            })
            .on("error", (e) => {
              
            })
            .stdout.pipe(process.stdout)