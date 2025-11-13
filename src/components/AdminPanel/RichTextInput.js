import React, { useState, useEffect } from 'react';
import { useInput } from 'react-admin';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Typography } from '@mui/material';

const RichTextInput = ({ source, label, required = false }) => {
    const { field } = useInput({ source });
    const [editorHtml, setEditorHtml] = useState('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Set initial value from field
        if (field.value) {
            setEditorHtml(field.value);
        }
        setIsReady(true);
    }, [field.value]);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'align',
        'blockquote', 'code-block',
        'link', 'image', 'video'
    ];

    const handleChange = (content) => {
        setEditorHtml(content);
        field.onChange(content);
    };

    if (!isReady) {
        return null;
    }

    return (
        <Box sx={{ mb: 3 }}>
            {label && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: 'block', fontWeight: 600 }}
                >
                    {label} {required && <span style={{ color: 'red' }}>*</span>}
                </Typography>
            )}
            <Box
                sx={{
                    '& .quill': {
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        '&:hover': {
                            borderColor: 'rgba(0, 0, 0, 0.87)',
                        },
                        '&:focus-within': {
                            borderColor: '#1976d2',
                            borderWidth: '2px',
                        }
                    },
                    '& .ql-toolbar': {
                        backgroundColor: '#f5f5f5',
                        borderTopLeftRadius: '4px',
                        borderTopRightRadius: '4px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    },
                    '& .ql-container': {
                        borderBottomLeftRadius: '4px',
                        borderBottomRightRadius: '4px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        minHeight: '200px',
                    },
                    '& .ql-editor': {
                        minHeight: '200px',
                        maxHeight: '500px',
                        overflowY: 'auto',
                    }
                }}
            >
                <ReactQuill
                    theme="snow"
                    value={editorHtml}
                    onChange={handleChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Enter content here..."
                />
            </Box>
        </Box>
    );
};

export default RichTextInput;
