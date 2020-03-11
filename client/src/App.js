import React, {useState} from 'react';
import queryString from 'query-string'
import './App.scss';


const parsed = queryString.parse(window.location.search);

function App() {
  const [note, setNote] = useState(parsed.note)

  const handleSubmit = () => {
    // prepare the new urls
    let params = queryString.stringify(Object.assign(parsed, {
      note: note
    }))

    let newUrl = window.location.origin + window.location.pathname+"?" + params
    window.location = newUrl
  }

  return (
    <div className="App">
      <main>
        <div className="container">
          <img src="https://www.greenpeace.org/taiwan/wp-content/themes/planet4-child-theme-taiwan/static/images/logo_zh.png" alt="" className="succ-icon"/>

          <h1 className="title"> 我們已經收到您的回饋。<br/>非常感謝您。</h1>

          {!parsed.note &&<div className="more-feedback">
            <hr className="hr"/>

            <h3>如果您能告訴我們為什麼，我們能做得更好：</h3>
            <textarea className="textarea" value={note} onChange={(e) => {setNote(e.target.value)}}></textarea>
            <button className="button is-primary" onClick={handleSubmit}>送出</button>
          </div>}
        </div>
      </main>
    </div>
  );
}

export default App;
