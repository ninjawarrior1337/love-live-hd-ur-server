import * as fs from 'fs'
import * as path from 'path'
import child_process from 'child_process'

let inputDir: string = path.join(__dirname, "input")
let outputDir: string = path.join(__dirname, "output")

export default function waifu2xIfy(card?, customImage?)
{
    let fileName:string;
    let fileExt:string;
    let infilePath:string;
    let outfilePath:string;

    if(arguments.length == 0)
    {
      throw new Error("You tried to call a function that requires an input file without one...what did u do?")
    }

    if(card)
    {
      fileName = card.card.id.toString()
      fileExt = "png"

      infilePath = path.join(inputDir, fileName + card.regular + "." + fileExt)
      outfilePath = path.join(outputDir, fileName + card.regular + ".jpg")
    }
    else
    {
      fileName = customImage.fileName
      fileExt = customImage.fileExt

      infilePath = path.join(inputDir, fileName + "." + fileExt)
      outfilePath = path.join(outputDir, fileName + ".jpg")
    }

    console.log(fs.existsSync(outfilePath));

    if(fs.existsSync(outfilePath)) 
    {
        return new Promise((resolve, reject) => resolve());
    }
    else 
    {
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
                infilePath,
                "-o",
                outfilePath
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
              infilePath,
              "-o",
              outfilePath
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
}