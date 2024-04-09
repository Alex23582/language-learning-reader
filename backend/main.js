const express = require('express')
const OpenAI = require('openai')
const https = require('https')
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = 3001

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const PONS_API_KEY = process.env.PONS_API_KEY
const translationmode = process.env.translationmode


const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

app.use(express.json());

app.use(express.static("../reader/build"))


app.post('/getFeedback', async (req, res) => {
    let englishsentence = req.body.sentence
    let usertranslation = req.body.translation
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    console.log("REQUESAT")
    const stream = await openai.chat.completions.create({
        messages: translationmode ? [
            { role: 'system', content: 'Du bist übersetzer für Englischlernende. Du übersetzt Eingaben ins Deutscge ohne kommentare.' },
            {
                role: 'user', content: `"${englishsentence}"`
            }
        ] : [
            { role: 'system', content: 'Du hilfest beim Lernen und Verstehen von Sprachen. Deine Antworten sind kurz, prägnant und kommen schnell auf den punkt. Du antwortest stets auf deutsch und achtest auf Rechtschreibung' },
            {
                role: 'user', content: `Ich lerne Englisch. Habe ich diesen Satz richtig übersetzt?
Ursprungssatz: "${englishsentence}"
Meine Übersetzung: "${usertranslation}"`
            }
        ],
        model: 'gpt-4-1106-preview',
        stream: true
    });

    for await (const part of stream) {
        console.log(part)
        chunk = part.choices[0]?.delta?.content
        if (chunk)
            res.write(chunk);
    }


    res.end()
})

app.post('/getWordTranslation', async (req, res) => {
    let json = await new Promise((resolve) => {
        https.request({
            host: "api.pons.com",
            method: "GET",
            path: "/v1/dictionary?q=" + encodeURIComponent(req.body.word) + "&l=deen&in=en&ref=true",
            headers: {
                "X-Secret": PONS_API_KEY
            }
        }, (res) => {
            let text = ""
            res.on("data", (chunk) => {
                text += chunk
            })
            res.on('end', () => {
                resolve(text)
            })
        }).end()
    })
    res.send(json)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})