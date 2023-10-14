import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [word, setWord] = useState("");
  const [definitions, setDefinitions] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef(null);

  const apiKey = process.env.REACT_APP_API_KEY;

  function getWordInfo(word) {
    const apiUrl = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}&sents`;

    fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw Error("Network response was not ok");
        }
        return response.text(); // Read the response as text
      })
      .then((text) => {
        try {
          const data = JSON.parse(text);
          if (data && data[0]) {
            const wordData = data[0];
            const definitions = wordData.shortdef || [];
            const audioUrl =
              wordData.hwi.prs &&
              wordData.hwi.prs[0].sound &&
              wordData.hwi.prs[0].sound.audio;

            setWord(word); // Set the word
            setDefinitions(definitions);
            setAudioUrl(audioUrl); // Set the audio URL

            // Play the audio when it's available
            if (audioUrl && audioRef.current) {
              audioRef.current.load();
              audioRef.current.play();
            }
          } else {
            console.error("No data available for the given word.");
          }
        } catch (error) {
          console.error("Error parsing JSON data:", error);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  const handleSearch = () => {
    getWordInfo(word);
  };

  // Function to handle the search when the user presses Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="App">
      <h1>Dictionary</h1>
      <div className="searchBox">
        <input
          type="text"
          placeholder="Search for a word..."
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="results">
        {word && <h1>{word}</h1>} {/* Display the word */}
        <h3>Definitions:</h3>
        <p>
          {definitions.map((definition, index) => (
            <p key={index}>
              <span className="definition-number">{index + 1}.</span>{" "}
              {definition.charAt(0).toUpperCase() + definition.slice(1)}
            </p>
          ))}
        </p>
        <h3>Pronunciation:</h3>
        <p>
          {audioUrl ? (
            <audio controls ref={audioRef}>
              <source
                src={`https://media.merriam-webster.com/soundc11/${audioUrl[0]}/${audioUrl}.wav`}
                type="audio/wav"
              />
              Your browser does not support the audio element.
            </audio>
          ) : (
            "No pronunciation available"
          )}
        </p>
      </div>
    </div>
  );
}

export default App;
