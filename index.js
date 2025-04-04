import { GoogleGenAI } from "@google/genai";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var selectedTopic = "machine Learning";

async function createNewChat() {
  return await ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      {
        role: "user",
        parts: [
          {
            text: `You are the ${selectedTopic} Interviewer named Chatbot, You have to take interview same as how real interviewer takes, and ask questions in short not too long and dont use any bold or italic or emojis, just give in plain text`,
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Okay, let's begin." }],
      },
    ],
  });
}

let chat = null;

(async () => {
  chat = await createNewChat();
})();

var chthist = [];

async function send(input) {
  if (!chat) {
    chat = await createNewChat();
  }
  var stream = await chat.sendMessageStream({
    message: input,
  });
  var ans = "";
  for await (const chunk of stream) {
    ans += chunk.text;
  }
  return ans;
}

app.get("/", (req, res) => {
  res.render("getname.ejs");
});

app.get("/start", async (req, res) => {
  chat = await createNewChat();
  chthist = [];
  res.render("index.ejs", { chatHistory: chthist });
});

app.post("/chat", async (req, res) => {
  var input = req.body.inp;
  var output = await send(input);
  console.log(output);
  chthist.push({ input: input, output: output });
  res.render("index.ejs", { chatHistory: chthist });
  // res.redirect("/start");
});

app.post("/set-topic", async (req, res) => {
  selectedTopic = req.body.topic;
  chat = await createNewChat();
  chthist = [];
  res.redirect("/start");
});

app.get("/restart", async (req, res) => {
  chat = await createNewChat();
  chthist = [];
  res.redirect("/start");
});

app.listen(port, () => {
  console.log("Listening");
});
