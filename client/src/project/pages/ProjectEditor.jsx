import Split from 'react-split'
import Editor from '@monaco-editor/react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useFetch from '../../shared/hooks/useFetch'
import ErrorMessage from '../../shared/components/ui-elements/ErrorMessage';
import Spinner from '../../shared/components/loading-icons/Spinner'
import '../../shared/stylesheets/Split.css'
import './ProjectEditor.css'
import { AuthContext } from '../../shared/contexts/AuthContext';
import { socket } from '../../socket.js';
import Modal from '../../shared/components/ui-elements/Modal.jsx';

export default function ProjectEditor() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [html, setHtml] = useState('')
    const [css, setCss] = useState('')
    const [js, setJs] = useState('')
    const [src, setSrc] = useState('')
    const [projectData, setProjectData] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState({
        html: true,
        css: true,
        js: true
    })
    const [fetchingError, setFetchingError] = useState(null)
    const makeRequest = useFetch()
    const auth = useContext(AuthContext)
    const [activeUsers,setActiveUsers] = useState([]);

    useEffect(() => {
        // socket.connect();
        const connectionHandler = () => {
            toast.success('Connection successful')
            console.log('Connection')
        }

        const disconnectHandler = () => {
            toast.info('Disconnected')
            console.log('Disconnect')
        }

        socket.emit('room-join-req', {projectId , token : auth.token})
        setIsFetching(true);
        

        socket.on('connect', connectionHandler);
        socket.on('disconnect', disconnectHandler);

        socket.on('room-join-res', (data)=>{
            setIsFetching(false);
            console.log(data);
            if(data.success){
                toast.success('room joined successfully');
                setProjectData({title : data.roomData.project.title , author : data.roomData.project.author});
                setHtml(data.roomData.project.code.html)
                setCss(data.roomData.project.code.css)
                setJs(data.roomData.project.code.js)
                setActiveUsers(data.roomData.activeUsers);
            }else{
                toast.error('Room joining failed')
                navigate(-1)
                
            }
        })

        socket.on('user-join', (data)=>{
            toast.info(`${data.username} has joined the room`);    
            setActiveUsers(prev => [...prev , data])
        })

        socket.on('user-leave', (data)=>{
            toast.info(`${data.username} has left the room`);
            setActiveUsers(prev => prev.filter(user => user.userId !== data.userId))
        })

        socket.on('successful-save', (data)=>{
            toast.success(data.message);
        })

        socket.on('code-sync', (data)=>{
            const {language , code} = data;
            if(language == 'html'){
                setHtml(code);
            }

            if(language == 'css'){
                setCss(code);
            }

            if(language == 'js'){
                setJs(code);
            }
        })

        

        return () => {
            // socket.disconnect();
            socket.emit('room-leave-req', {projectId})
            socket.off('connect', connectionHandler);
            socket.off('disconnect', disconnectHandler);
            socket.off('user-join')
            socket.off('user-leave')
            socket.off('room-join-res');
        }
    },[])


    // const saveCode = async () => {
    //     try {
    //         setSaveStatus((prevState) => {
    //             return Object.fromEntries(Object.keys(prevState).map(key => [key, true]));
    //         })
    //         setIsSaving(true);
    //         let requestBody = {};
    //         if (!saveStatus.html) requestBody.html = html;
    //         if (!saveStatus.css) requestBody.css = css;
    //         if (!saveStatus.js) requestBody.js = js;

    //         if (Object.keys(requestBody).length === 0) {
    //             // nothing to send, so don't
    //             return;
    //         }

    //         await makeRequest(`http://localhost:5000/api/projects/${projectId}/updateCode`, 'PATCH', requestBody, {
    //             'Content-Type': 'application/json',
    //             'Authorization': auth.token
    //         })
    //         toast.success('Saved successfully')
    //     } catch (err) {
    //         setSaveStatus((prevState) => {
    //             return Object.fromEntries(Object.keys(prevState).map(key => [key, false]));
    //         })
    //         toast.error(err.message)
    //     } finally {
    //         setIsSaving(false);
    //     }
    // }



    // useEffect(() => {
    //     const fetchProject = async () => {
    //         try {
    //             setIsFetching(true);
    //             const responseData = await makeRequest(`http://localhost:5000/api/projects/${projectId}`);
    //             setProjectData({ title: responseData.title, author: responseData.author });
    //             setHtml(responseData.code.html)
    //             setCss(responseData.code.css)
    //             setJs(responseData.code.js)
    //             socket.emit('room-join-req', {projectId , token : auth.token})
    //         } catch (err) {
    //             setFetchingError('Failed to fetch project')
    //         } finally {
    //             setIsFetching(false);
    //         }
    //     }
    //     fetchProject();
    // }, [projectId])




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
        // saveStatus.html = false;
        setHtml(value);
        socket.emit('code-change', {language : 'html' , code : value , projectId});
    }
    const onCssChange = (value) => {
        // saveStatus.css = false;
        setCss(value)
        socket.emit('code-change', {language : 'css' , code : value , projectId});
    }
    const onJsChange = (value) => {
        // saveStatus.js = false;
        setJs(value)
        socket.emit('code-change', {language : 'js' , code : value , projectId});
    }

    const openUserModal = ()=>{
        setIsUserModalOpen(true);
    }

    const closeUserModal = ()=>{
        setIsUserModalOpen(false);
    }

    return (
        <>
            <Modal
            visible={isUserModalOpen}
            onClose={closeUserModal}
            title={'Active users'}
            >
                {activeUsers.map((user)=>{
                    return <p className='border mb-3 p-2'>{user.username}</p>
                })}
            </Modal>
            {isFetching && <Spinner overlayType={"opaque"} text='Please wait while we prepare the editor for you.' />}
            {fetchingError && <ErrorMessage message={fetchingError} />}
            {projectData && (<>
                <div className="p-2 bg-primary-subtle d-flex align-items-center">
                    <div className='me-auto'><h5>{projectData.title}</h5></div>
                    <div className='ms-auto'>
                        {activeUsers.length > 0 && (<button className='btn btn-light' onClick={openUserModal}>See Active users</button>)}
                        {/* <button className='btn btn-success' disabled={isSaving} onClick={saveCode}>{isSaving ? 'Saving...' : 'Save'}</button> */}
                    </div>
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
                                    <div className='bg-primary-subtle editor-name px-2 border'>HTML {!saveStatus.html && '*'}</div>
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
                                    <div className='bg-primary-subtle editor-name px-2 border'>CSS {!saveStatus.css && '*'}</div>
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
                                    <div className='bg-primary-subtle editor-name px-2 border'>JS {!saveStatus.js && '*'}</div>
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
