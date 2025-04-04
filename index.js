// Index2.js and index2.ejs are related to AI Interview
import { GoogleGenAI } from "@google/genai";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const app = express();
const port = 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var selectedTopic = "machine Learning";

let chat = ai.chats.create({
  model: "gemini-2.0-flash",
  history: [
    {
      role: "user",
      parts: [
        {
          text: `You are the ${selectedTopic} Interviewer named Chatbot, You have to take interview same as how real interviewer takes, and ask questions in short not too long and dont use any bold or italic or emojis, just give in plain text`,

          // text: `You are the interviewer named Chatbot. Your role is to conduct a technical interview on the topic: ${selectedTopic}. Ask realistic, short, and challenging questions like a real human interviewer. Begin with basic questions and gradually increase the difficulty. Do not provide answers unless the user asks for them. and give response text shortly.`,
        },
      ],
    },
    {
      role: "model",
      parts: [{ text: "ok" }],
    },
  ],
});

// async function main(input) {
//   var stream1 = await chat.sendMessageStream({
//     message: input,
//   });
//   var ans = "";
//   for await (const chunk of stream1) {
//     ans += chunk.text;
//   }
//   return ans;

// }

var i = 2;

var chthist = [];

async function send(input) {
  i++;
  if (i < 100) {
    var stream = await chat.sendMessageStream({
      message: input,
    });
    var ans = "";
    for await (const chunk of stream) {
      ans += chunk.text;
    }
    return ans;
  } else {
    console.log("Limit Exceeds");
  }
}

app.get("/", (req, res) => {
  res.render("getname.ejs");
});

app.get("/start", async (req, res) => {
  res.render("index.ejs", { chatHistory: chthist });
});

app.post("/chat", async (req, res) => {
  var input = req.body.inp;
  var output = await send(input);
  console.log(output);
  chthist.push({ input: input, output: output });
  // res.render("index.ejs", { chatHistory: chthist });
  res.redirect("/start");
});

app.post("/set-topic", async (req, res) => {
  selectedTopic = req.body.topic;

  chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      {
        role: "user",
        parts: [
          {
            text: `You are the ${selectedTopic} Interviewer named Chatbot, You have to take interview same as how real interviewer takes, and ask questions in short not too long and dont use any bold or italic or emojis, just give in plain text`,
            // text: `You are the interviewer named Chatbot. Your role is to conduct a technical interview on the topic: ${selectedTopic}. Ask realistic, short, and challenging questions like a real human interviewer. Begin with basic questions and gradually increase the difficulty. and give response text shortly.`,
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Okay, let's begin." }],
      },
    ],
  });

  res.redirect("/start");
});

app.listen(5000, () => {
  console.log("Listening");
});
