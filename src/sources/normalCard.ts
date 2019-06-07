import request from 'request'
import requestedImage from './requestedImage';
import { Card } from '../lovelive';
import _ from "lodash"
import * as crypto from 'crypto'
import * as path from 'path'

export default class normalCard extends requestedImage
{
    public card: Card
    public cardId?:string
    public idol?:string
    public regular?:boolean
    public cardUrl: string
    public readonly random: boolean

    private validSchool: Array<string> = [
        "Uranohoshi Girls' High School",
        "Otonokizaka Academy"
    ];

    constructor(random:boolean, idol?: string, cardId?:string, regular?:boolean)
    {
        super(null)
        this.cardId = cardId
        this.regular = regular
        this.random = random
        this.cacheImage = true
    }

    //Override
    async setFileNames()
    {
        // let fileHash = crypto.createHash("sha256")
        // fileHash.update(this.imageData)
        this.fileName = `${this.card.id}`
        this.outputFilePath = path.join(
            this.outputFolder,
            `${this.fileName}.jpg`
        )
        this.inputFilePath = path.join(
            this.inputFolder,
            `${this.fileName}.${this.fileExt}`
        )
    }

    async setCard()
    {
        this.card = await this.getCard(this.idol, this.cardId)
    }

    async assembleUrl()
    {
        if(this.regular && this.card.clean_ur)
            this.cardUrl = `http:${this.card.clean_ur}`
        else
            this.cardUrl = `http:${this.card.clean_ur_idolized}`
    }

    async assembleAndWrite() 
    {
        await this.assembleUrl()
        await request.get(this.cardUrl, {}, (err, res, body) => {this.imageData = body})
        await this.writeData()
    }

    private generateOptions(specifiedIdol: string = "", specifiedIds?: string): any 
    {
        const school:string = _.random(100) < 80 ? this.validSchool[0] : this.validSchool[1];
        if(specifiedIds)
        {
            return {
                qs: {
                    ids: specifiedIds
                }
            };
        }
        else
        {
            return {
                qs: {
                    ordering: "random",
                    rarity: "SSR,UR",
                    name:
                    specifiedIdol ?
                        specifiedIdol :
                        school === "Otonokizaka Academy" ? "Minami Kotori,Kousaka Honoka" : "",
                    idol_school: specifiedIdol ? "" : school
                }
            };
        }
    }

    private async getCard(specifiedIdol?:string, specifiedIds?:string): Promise<Card> {
        var options: any = this.generateOptions(specifiedIdol, specifiedIds)
        return new Promise((resolve, reject) => {
            request.get("https://schoolido.lu/api/cards/", options, async (error, response, body) => {
            if(error) {reject(error); return}
            try 
            {
                var results: any = await JSON.parse(body).results;
                resolve(results[0]);
            } 
            catch (err) 
            {
                console.log(body)
                reject(err);
                return;
            }
            });
        });
      }
}