import normalCard from "./normalCard";
import jimp from "jimp";
import * as path from 'path'

export default class urpair extends normalCard {
    private jimpCardLeft: jimp
    private jimpCardRight: jimp
    private combinedCard: jimp

    constructor(random: boolean, idol?: string, cardId?: string, regular?: boolean) {
        super(random, idol, cardId, regular)
        this.cacheImage = true
    }

    checkUrPair()
    {
        if(!this.card.ur_pair)
        {
            throw new Error("Card does not have a UR Pair")
        }
    }

    async setFileNames()
    {
        this.fileName = `${this.card.id}x${this.card.ur_pair.card.id}`
        this.outputFilePath = path.join(
            this.outputFolder,
            `${this.fileName}.jpg`
        )
        this.inputFilePath = path.join(
            this.inputFolder,
            `${this.fileName}.${this.fileExt}`
        )
    }

    async assembleJimpCards() {
        if (this.regular) {
            if (this.card.ur_pair.reverse_display) {
                this.jimpCardLeft = await jimp.read("https:" + this.card.ur_pair.card.clean_ur);
                this.jimpCardRight = await jimp.read("https:" + this.card.clean_ur);
            } else {
                this.jimpCardLeft = await jimp.read("https:" + this.card.clean_ur);
                this.jimpCardRight = await jimp.read("https:" + this.card.ur_pair.card.clean_ur);
            }
        } else {
            if (this.card.ur_pair.reverse_display_idolized) {
                this.jimpCardLeft = await jimp.read("https:" + this.card.ur_pair.card.clean_ur_idolized);
                this.jimpCardRight = await jimp.read("https:" + this.card.clean_ur_idolized);
            } else {
                this.jimpCardLeft = await jimp.read("https:" + this.card.clean_ur_idolized);
                this.jimpCardRight = await jimp.read("https:" + this.card.ur_pair.card.clean_ur_idolized);
            }
        }

        this.combinedCard = new jimp(
            this.jimpCardLeft.getWidth() + this.jimpCardRight.getWidth(),
            this.jimpCardLeft.getHeight()
        );

        this.combinedCard.composite(this.jimpCardLeft, 0, 0);
        this.combinedCard.composite(this.jimpCardRight, this.jimpCardLeft.getWidth(), 0);
        
        this.imageData = await this.combinedCard.getBufferAsync("image/png")

        return;
        
        //   combinedCard.write(
        //     path.join(inputDir, `${card.id}x${card.ur_pair.card.id}.jpg`),
        //     () => resolve()
        //   );
    }

    async assembleAndWrite() {
        this.assembleJimpCards()
        this.writeData()
    }
}