import React from 'react';
import { GlobalStyles } from '@mui/material';

const MyGlobalStyles = () => (
  <GlobalStyles
    styles={(theme) => ({
body: {
  
        margin: 0,
        padding: 0,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        // backgroundImage: 'url("/images/background.png")',
      },
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        '@import': 'url("https://fonts.googleapis.com/css2?family=Sour+Gummy:wght@400;500;600;700&display=swap")',
      },
      a: {
        textDecoration: 'none',
      },
    })}
  />
);

export default MyGlobalStyles;
