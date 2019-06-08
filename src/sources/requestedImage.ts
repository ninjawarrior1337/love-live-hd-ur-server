import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import fileType from 'file-type'
import waifu2xHandler from '../waifu2xHandler'

const writeFileFs = util.promisify(fs.writeFile)

export default class requestedImage {
    public imageData: Buffer
    public inputFolder: string
    public outputFolder: string
    outputFilePath: string
    fileName: string
    inputFilePath: string
    protected cacheImage: boolean

    constructor(imageData: Buffer) {
        this.imageData = imageData
        this.inputFolder = path.join(__dirname,"..", "input")
        this.outputFolder = path.join(__dirname, "..", "output")
        this.fileName = ""
        this.cacheImage = false
    }

    get fileExt()
    {
        return fileType(this.imageData).ext
    }

    async setFileNames()
    {
        let fileHash = crypto.createHash("sha256")
        fileHash.update(this.imageData)
        this.fileName = fileHash.digest("hex")
        this.outputFilePath = path.join(
            this.outputFolder,
            `${this.fileName}.jpg`
        )
        this.inputFilePath = path.join(
            this.inputFolder,
            `${this.fileName}.${this.fileExt}`
        )
        return
    }

    async writeData()
    {
        this.setFileNames()
        console.log(this.inputFilePath, this.outputFilePath)
        if(!fs.existsSync(this.inputFilePath))
            await writeFileFs(this.inputFilePath, this.imageData)
        return;
    }

    async waifu2xify()
    {
        await waifu2xHandler(undefined, this)
        if(!this.cacheImage)
        {
            await util.promisify(fs.unlink)(this.inputFilePath)
        }
        return;
    }
}