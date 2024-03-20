import { useEffect, useRef } from 'react'
import './ResizableCodeEditor.css'
import { Editor } from '@monaco-editor/react'

// this component has a editor encapsulated in a parent div
// the parent div takes whateever height is given to it, the editor resizes when the parent div resizes
export default function ResizableCodeEditor({ language = 'html', onChange, value = '', theme = 'vs-dark' }) {
    const editorRef = useRef(null)
    const containerRef = useRef(null)

    const handleResize = () => {
        if (editorRef.current) {
            // console.log('Resizing ' + language)
            // editorRef.current.layout(); // Notify the editor to re-layout itself
            editorRef.current.height = containerRef.current.height
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        const observer = new ResizeObserver(() => {
            handleResize();
        });
        observer.observe(container);
        return () => {
            observer.unobserve(container); // Remove the observer when the component unmounts
        };
    }, []);

    return (
        <div className='editor-container' ref={containerRef}>
            <Editor
                onMount={(editor) => {
                    editorRef.current = editor;
                }}
                key={language}
                height="100%"
                defaultLanguage={language}
                value={value}
                onChange={onChange}
                theme={theme}
            />
        </div>
    )
}
