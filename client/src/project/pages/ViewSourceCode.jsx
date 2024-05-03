import Split from 'react-split'
import Editor from '@monaco-editor/react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

import useFetch from '../../shared/hooks/useFetch'
import ErrorMessage from '../../shared/components/ui-elements/ErrorMessage';
import Spinner from '../../shared/components/loading-icons/Spinner'
import '../../shared/stylesheets/Split.css'
import './ProjectEditor.css'
import { AuthContext } from '../../shared/contexts/AuthContext';

export default function ViewSourceCode() {
    const { projectId } = useParams();
    const [html, setHtml] = useState('')
    const [css, setCss] = useState('')
    const [js, setJs] = useState('')
    const [src, setSrc] = useState('')
    const [projectData, setProjectData] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchingError, setFetchingError] = useState(null)
    const makeRequest = useFetch()




    useEffect(() => {
        const fetchProject = async () => {
            try {
                setIsFetching(true);
                const responseData = await makeRequest(`http://localhost:5000/api/projects/${projectId}`);
                setProjectData({ title: responseData.title, author: responseData.author });
                setHtml(responseData.code.html)
                setCss(responseData.code.css)
                setJs(responseData.code.js)
            } catch (err) {
                setFetchingError('Failed to fetch project')
            } finally {
                setIsFetching(false);
            }
        }
        fetchProject();
    }, [projectId])




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

    const onHtmlChange = (value) => {
        setHtml(value);
    }
    const onCssChange = (value) => {
        setCss(value)
    }
    const onJsChange = (value) => {
        setJs(value)
    }


    return (
        <>
            {isFetching && <Spinner overlayType={"opaque"} text='Please wait while we prepare the editor for you.' />}
            {fetchingError && <ErrorMessage message={fetchingError} />}
            {projectData && (<>
                <div className="p-2 bg-primary-subtle d-flex align-items-center">
                    <div className='me-auto'><h5>{projectData.title}</h5></div>
                </div>
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
                                    <div className='bg-primary-subtle editor-name px-2 border'>HTML</div>
                                    <div className='editor-container'>
                                        <Editor
                                            key={'html'}
                                            defaultLanguage='html'
                                            value={html}
                                            onChange={onHtmlChange}
                                            theme='vs-dark'
                                            height={'100%'}

                                        />
                                    </div>
                                </div>
                                <div className='editor-section'>
                                    <div className='bg-primary-subtle editor-name px-2 border'>CSS</div>
                                    <div className='editor-container'>
                                        <Editor
                                            key={'css'}
                                            defaultLanguage='css'
                                            value={css}
                                            onChange={onCssChange}
                                            theme='vs-dark'
                                            height={'100%'}

                                        />
                                    </div>
                                </div>
                                <div className='editor-section'>
                                    <div className='bg-primary-subtle editor-name px-2 border'>JS</div>
                                    <div className='editor-container'>
                                        <Editor
                                            key={'javascript'}
                                            defaultLanguage='javascript'
                                            value={js}
                                            onChange={onJsChange}
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
                                // sandbox="allow-scripts"
                                sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-downloads allow-presentation"
                                allow="encrypted-media *; display-capture *; midi *; clipboard-read *; clipboard-write *;"

                                allowtransparency="true"
                                // allowpaymentrequest="true"
                                allowFullScreen={true}

                                loading="lazy"
                                width="100%"
                                height="100%"
                            />

                        </div>

                    </Split>
                </div >
            </>)}
        </>
    )
}
