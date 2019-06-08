import normalCard from "./normalCard";
import * as jimp from "jimp";
import * as path from 'path'
import * as _ from 'lodash'
import * as request from 'request'
import { Card } from "../lovelive";

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
            throw new Error(`Card does not have a UR Pair: ${JSON.stringify(this.card)}`)
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
            `${this.fileName}.png`
        )
        return
    }

    //Override Options Generation
    protected generateOptions(specifiedIdol: string = "", specifiedIds?: string): any 
    {
        const school:string = _.random(100) < 80 ? this.validSchool[0] : this.validSchool[1];
        if(specifiedIds)
        {
            return {
                qs: {
                    ids: specifiedIds,
                    expand_ur_pair: ""
                }
            };
        }
        else
        {
            return {
                qs: {
                    ordering: "random",
                    rarity: "SSR,UR",
                    expand_ur_pair: "",
                    name:
                    specifiedIdol ?
                        specifiedIdol :
                        school === "Otonokizaka Academy" ? "Minami Kotori,Kousaka Honoka" : "",
                    idol_school: specifiedIdol ? "" : school
                }
            };
        }
    }

    protected async getCard(specifiedIdol?:string, specifiedIds?:string): Promise<Card> {
        var options: any = this.generateOptions(specifiedIdol, specifiedIds)
        return new Promise((resolve, reject) => {
            request.get("https://schoolido.lu/api/cards/", options, async (error, response, body) => {
            if(error) {reject(error); return}
            try 
            {
                var results: any = await JSON.parse(body).results;
                _.forEach(results, (val: Card, index, col) => {
                    if (val.ur_pair != null) {
                      resolve(val);
                    }
                    else if(index === col.length)
                    {
                        reject("No UR Pairs Found!")
                    }
                });
            } 
            catch (err) 
            {
                // console.log(body)
                reject(err);
                return;
            }
            });
        });
    }

    async assembleJimpCards() {
        console.log(this.card.ur_pair.card.clean_ur, this.card.clean_ur)
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
        await this.assembleJimpCards()
        await this.writeData()
        return
    }
}