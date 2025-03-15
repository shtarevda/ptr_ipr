import React from 'react'

function App({ settings }) {
    return <div><pre>{JSON.stringify(settings, "", 4)}</pre></div>
}

export default App
