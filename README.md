With this project, you can cycle through sentences of a book/story and translate it sentence-by-sentence. ChatGPT will then give you advice and correct you. You can click on every word and get a translation from PONS.

![screenshot](https://raw.githubusercontent.com/Alex23582/language-learning-reader/main/images/screenshot.png)

### Try it yourself
1. You will need an OpenAI API key for ChatGPT and a PONS API key for the dictionary. Create a `.env` file inside of `backend` with the variables `OPENAI_API_KEY` and `PONS_API_KEY`. You can optionally include `TRANSLATIONMODE=TRUE` if you only want a translation without advice from ChatGPT.
2. Run `npm run install` in both the `backend` and `reader` folder.
3. Run `npm run build` inside `reader`
4. Run `node main` inside `backend` to start. The backend will open a webserver on port 3001

### Importing sentences
I don't have a pdf- or epub-reader implemented yet. For now you have to make changes in `reader/src/book.json` and rebuild the reader with `npm run build`
