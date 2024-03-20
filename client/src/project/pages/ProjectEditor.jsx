import Split from 'react-split'
import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';

import '../../shared/stylesheets/Split.css'
import './ProjectEditor.css'

export default function ProjectEditor() {
    const [html, setHtml] = useState('')
    const [css, setCss] = useState('')
    const [js, setJs] = useState('')
    const [src, setSrc] = useState('')

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrc(`
            <html>
              <style>${css}</style>
              <body>${html}</body>
              <script>${js}</script>
            </html>
          `)
        }, 450)

        return () => clearTimeout(timeout)
    }, [html, css, js])

    return (
        <>
            <div className="p-2 bg-primary-subtle">Toolbar</div>
            <div className="project-window" style={{ flex: "1" }}>
                <Split
                    className="split-vertical"
                    direction="vertical"
                    gutterSize={5}
                >
                    <div>
                        <Split
                            className="split"
                            gutterSize={6}
                        >
                            <div className='editor-section'>
                                <div className='bg-primary-subtle editor-name px-2'>HTML</div>
                                <div className='editor-container'>
                                    <Editor
                                        key={'html'}
                                        defaultLanguage='html'
                                        value={html}
                                        onChange={setHtml}
                                        theme='vs-dark'
                                        height={'100%'}

                                    />
                                </div>
                            </div>
                            <div className='editor-section'>
                                <div className='bg-primary-subtle editor-name px-2'>CSS</div>
                                <div className='editor-container'>
                                    <Editor
                                        key={'css'}
                                        defaultLanguage='css'
                                        value={css}
                                        onChange={setCss}
                                        theme='vs-dark'
                                        height={'100%'}

                                    />
                                </div>
                            </div>
                            <div className='editor-section'>
                                <div className='bg-primary-subtle editor-name px-2'>JS</div>
                                <div className='editor-container'>
                                    <Editor
                                        key={'javascript'}
                                        defaultLanguage='javascript'
                                        value={js}
                                        onChange={setJs}
                                        theme='vs-dark'
                                        height={'100%'}

                                    />

                                </div>
                            </div>
                        </Split>
                    </div>
                    <div className='output-window'>
                        <iframe
                            srcDoc={src}
                            title="output"
                            sandbox="allow-scripts"
                            width="100%"
                            height="100%"
                        />

                    </div>

                </Split>
            </div >
        </>
    )
}
