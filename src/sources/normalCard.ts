import * as request from 'request'
import requestedImage from './requestedImage';
import { Card } from '../lovelive';
import * as _ from "lodash"
import * as crypto from 'crypto'
import * as path from 'path'

export default class normalCard extends requestedImage
{
    public card: Card
    public cardUrl: string

    protected validSchool: Array<string> = [
        "Uranohoshi Girls' High School",
        "Otonokizaka Academy"
    ];

    constructor(public readonly random:boolean, public idol?: string, public cardId?:string, public regular?:boolean)
    {
        super(null)
        // If regular is not defined, that means that it is not regular
        this.regular = !(regular === undefined)
    }

    //Override
    async setFileNames()
    {
        // let fileHash = crypto.createHash("sha256")
        // fileHash.update(this.imageData)
        this.fileName = `${this.card.id}`
        this.outputFilePath = path.join(
            this.outputFolder,
            `${this.fileName}-${!!this.regular}.jpg`
        )
        this.inputFilePath = path.join(
            this.inputFolder,
            `${this.fileName}-${!!this.regular}.${this.fileExt}`
        )
    }

    async setCard()
    {
        this.card = await this.getCard(this.idol, this.cardId)
        return 
    }

    async assembleUrl()
    {
        if(!!this.regular && this.card.clean_ur)
            this.cardUrl = `http:${this.card.clean_ur}`
        else
            this.cardUrl = `http:${this.card.clean_ur_idolized}`
        return
    }

    async assembleAndWrite() 
    {
        await this.assembleUrl()
        this.imageData = await new Promise((resolve, reject) => {
            request.get(this.cardUrl, {encoding:null}, (err, res, body) => resolve(body))
        })
        await this.writeData()
        return;
    }

    protected generateOptions(specifiedIdol: string = "", specifiedIds?: string): any 
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

    protected async getCard(specifiedIdol?:string, specifiedIds?:string): Promise<Card> {
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