import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import * as fileType from 'file-type'
import waifu2xHandler from './waifu2xHandler'

const writeFileFs = util.promisify(fs.writeFile)

export default class requestedImage {
    imageData: Buffer
    inputFolder: string
    outputFolder: string
    outputFilePath: string
    fileName: string

    constructor(imageData: Buffer) {
        this.imageData = imageData
        this.inputFolder = path.join(__dirname, "input")
        this.outputFolder = path.join(__dirname, "output")
        this.fileName = ""
    }

    get inFolder()
    {
        return this.inputFolder
    }

    get outFolder()
    {
        return this.outputFolder
    }

    get filename()
    {
        return this.fileName
    }

    get fileExt()
    {
        return this.fileExt
    }

    async writeData()
    {
        let fileHash = crypto.createHash("sha256")
        fileHash.update(this.imageData)
        this.fileName = fileHash.digest("hex")
        await writeFileFs(
            path.join(
                this.inputFolder, 
                `${this.fileName}.${fileType(this.imageData).ext}`
            ), 
            this.imageData
        )
        this.outputFilePath = path.join(
            this.outputFolder, 
            `${this.fileName}.${fileType(this.imageData).ext}`
        )
        return;
    }

    async waifu2xify()
    {
        await waifu2xHandler(undefined, this)
        return;
    }
}