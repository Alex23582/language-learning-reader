import styles from './App.module.css';
import book from './book.json'
import LoadingSpinner from './components/LoadingSpinner'
import React, { useEffect, useRef, useState } from 'react'

function App() {
  const sentencesRef = useRef([]);
  const [currentSentence, setcurrentSentence] = useState(0)
  const [translationInput, settranslationInput] = useState("")
  const [chatresponsestate, setchatresponsestate] = useState(false)
  const [chatreponsetext, setchatreponsetext] = useState("")
  const [worddata, setworddata] = useState()
  const [worddataloading, setworddataloading] = useState(false)
  const [currentChapter, setcurrentChapter] = useState(0)
  useEffect(() => {
    sentencesRef.current[currentSentence].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
    setchatresponsestate(false)
    settranslationInput("")
  }, [currentSentence])

  async function checkSentence() {
    setchatresponsestate(true)
    setchatreponsetext("")
    const response = await fetch('/getFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sentence: book[currentChapter].sentences[0][currentSentence],
        translation: translationInput
      })
    })
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    let text = ""
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      text += value
      setchatreponsetext(text)
    }
  }

  async function getWordInfo(word) {
    setworddataloading(true)
    const response = await fetch('/getWordTranslation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word
      })
    })
    try {
      const body = await response.json()
      for (const item of body) {
        if (item.lang === "en") {
          setworddata(item.hits)
          if (!item.hits.some((element) => {
            return element.type === "entry"
          })) {
            setworddata([{ type: "entry", roms: [{ headword_full: "Keine Übersetzung", arabs: [] }] }])
          }
        }
      }
    } catch {
      setworddata([{ type: "entry", roms: [{ headword_full: "Keine Übersetzung", arabs: [] }] }])
      setworddataloading(false)
    }
    setworddataloading(false)
  }

  useEffect(() => {
    setcurrentSentence(0)
  }, [currentChapter])
  

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      checkSentence()
    }
  }

  return (
    <div className={styles.main}>
      {/*<button onClick={() => { setcurrentSentence(currentSentence + 1) }}>test</button>*/}
      <div className={styles.leftside}>
        <div className={styles.chapterselector}>
          <button onClick={() => { setcurrentChapter(currentChapter - 1) }} className={styles.chapterbutton} />
          <p>Kapitel {currentChapter + 1}</p>
          <button onClick={() => { setcurrentChapter(currentChapter + 1) }} className={styles.chapterbutton} />
        </div>
        <div className={styles.textcontainer}>{book[currentChapter].sentences[0].map((sentence, i) => {
          return <div ref={el => sentencesRef.current[i] = el} className={`${styles.sentencecontainer} ${currentSentence === i ? styles.currentsentencecontainer : ""} ${currentSentence < i ? styles.futuresentencecontainer : ""}`} key={i}>
            <p className={styles.sentencenum}>{i + 1}</p>
            <div className={styles.sentence}>{sentence.split(" ").map((word, wordindex) => {
              return <p onClick={() => { getWordInfo(word) }} className={styles.word} key={wordindex}>{word}</p>
            })}</div>
          </div>
        })}</div>
      </div>
      <div className={styles.controlcontainer}>
        <div className={styles.controlbox}>
          {chatresponsestate && <>
            <p>Feedback von ChatGPT</p>
            {!chatreponsetext && <LoadingSpinner />}
            {chatreponsetext && <p className={styles.chatresponse}>{chatreponsetext}</p>}
            <button onClick={() => { setcurrentSentence(currentSentence + 1) }} className={styles.button}>Nächster Satz</button>
            <button onClick={() => { setchatresponsestate(false) }} className={styles.button}>Korrigieren</button>
          </>}
          {!chatresponsestate && <>
            <p>Was bedeutet dieser Satz?</p>
            <textarea onKeyDown={handleKeyDown} value={translationInput} onChange={(e) => { settranslationInput(e.target.value) }} className={styles.inputtextarea} />
            <button onClick={checkSentence} className={styles.button}>Überprüfen</button>
            <button onClick={() => { setcurrentSentence(currentSentence + 1) }} className={styles.button}>Überspringen</button>
          </>}
        </div>
        {(worddata || worddataloading) &&
          <div className={styles.wordinfobox}>
            {worddataloading &&
              <div className={styles.loadingspinnercontainer}>
                <LoadingSpinner />
              </div>
            }
            {worddata && !worddataloading && worddata.map((hit, i0) => {
              if (hit.type !== "entry") {
                return null
              }
              return <React.Fragment key={i0}>
                {hit.roms.map((rom, i1) => {
                  return <React.Fragment key={i1}>
                    {<p dangerouslySetInnerHTML={{ __html: rom.headword_full }} />}

                    {rom.arabs.map((arab, i2) => {
                      return <React.Fragment key={i2}>
                        <p className={styles.wordinfoheader} dangerouslySetInnerHTML={{ __html: arab.header }} />
                        {arab.translations.map((translation, i3) => {
                          return <React.Fragment key={i3}>
                            <div className={styles.wordinfosourcetargetpaircontainer}>
                              <p className={styles.wordinfotranslation} dangerouslySetInnerHTML={{ __html: translation.source }}></p>
                              <p dangerouslySetInnerHTML={{ __html: translation.target }}></p>
                            </div>
                          </React.Fragment>
                        })}
                      </React.Fragment>
                    })}
                  </React.Fragment>
                })}
              </React.Fragment>
            })}
          </div>
        }
      </div>
    </div>
  );
}

export default App;
