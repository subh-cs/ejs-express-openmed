const express = require('express');
const app = express();
const { createAudioFile } = require('simple-tts-mp3')
const fs = require('fs');
const path = require('path');
const fileupload = require("express-fileupload");
const { OpenAI } = require('openai');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))
app.use(fileupload());
app.use(express.json());

const openai = new OpenAI({
    apiKey: 'your-key', // defaults to process.env["OPENAI_API_KEY"]
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/speak', (req, res) => {
    res.render('speak');
});

// app.post('/save-audio', (req, res) => {
//     const audioData = req.files;
//     console.log(audioData)
//     // Assuming you send the audio data from the client
//     // const filePath = path.join(__dirname, 'public', 'recorded-audio.wav');

//     // fs.writeFile(filePath, audioData, (err) => {
//     //   if (err) {
//     //     console.error('Error saving audio:', err);
//     //     res.status(500).send('Error saving audio');
//     //   } else {
//     //     res.status(200).send('Audio saved successfully');
//     //   }
//     // });
//     res.json({ success: true })
// });

app.get('/qn-openai', async (req, res) => {
    const question = req.query.qn;
    // ask the question to openai
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: question + "Answer within 15 words" }],
        model: 'gpt-3.5-turbo',
    });
    const GPT3Answer = chatCompletion.choices[0].message.content;
    res.redirect('/save-audio?openaians=' + GPT3Answer)
})

app.get('/save-audio', async (req, res) => {
    const answer = req.query.openaians;
    console.log(answer)
    await createAudioFile(answer, 'public/hello-world', 'bn')
    // // wait for few seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    res.render('listen');
});

app.listen(3000, () => console.log('Server running on port 3000'));