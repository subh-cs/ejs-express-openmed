const express = require('express');
const app = express();
const { createAudioFile, getAudioBuffer } = require('simple-tts-mp3')
// const {translate} = require('@vitalets/google-translate-api');
const translate = require('@iamtraction/google-translate');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/speak', (req, res) => {
    res.render('speak');
});

app.get('/qn-openai', async (req, res) => {
    console.log(2);
    const question = req.query.qn;
    const bnToEng = await translate(question, { from: 'bn', to: 'en', raw: false });
    const context = "Answer in simple language within 1-2 sentences. Act that you are a Doctor."
    // ask the question to openai
    const chatCompletion = await openai.chat.completions.create({
        // give the question and context to openai
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: `${context}` }, { role: 'user', content: `${bnToEng.text}` }],
    });
    console.log(3);
    const GPT3Answer = chatCompletion.choices[0].message.content;
    const engToBn = await translate(GPT3Answer, { from: 'en', to: 'bn' });
    res.redirect('/save-audio?openaians=' + engToBn.text)
})

app.get('/save-audio', async (req, res) => {
    console.log(4);
    const answer = req.query.openaians;
    console.log(answer)
    const audioBuffer = await getAudioBuffer(answer, 'bn');
    console.log(5);
    res.render('listen', { audioBuffer: audioBuffer });
});

app.listen(3000, () => console.log('Server running on port 3000'));