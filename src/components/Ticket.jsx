// components/Ticket.js
import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import Image from 'next/image';

/**
 * Ticket component
 * @param {{
 *   name: string,
 *   date: string,
 *   price: number | string,
 *   tags: string[],
 *   image: string,
 *   description: string,
 * }} ticket
 */
const Ticket = ({ ticket }) => {
  const { name, date, price, tags, image, description } = ticket;
  const theme = useTheme();

  const height = 250;             // card & image height
  const stickerSize = height * 0.4; // make the price sticker a bit smaller (40% of card height)

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '50rem',
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        borderRadius: '20px',
        border: `3px solid ${theme.palette.text.secondary}`,
        overflow: 'hidden',
      }}
    >
      {/* IMAGE */}
      <Box
        sx={{
          width: `${height}px`,
          height: '100%',
          position: 'relative',
        }}
      >
        <Image src={image} alt={name} fill style={{ objectFit: 'cover' }} />

        {/* PRICE STICKER – quarter‑circle bottom‑left of the image */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: `${stickerSize}px`,
            height: `${stickerSize}px`,
            backgroundColor: theme.palette.background.paper,
            borderTopRightRadius: `${stickerSize}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            // shift content ~25% right to optically center in quarter‑circle
            pl: '25%',
            alignItems: 'flex-start',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            From
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ${price}
          </Typography>
        </Box>
      </Box>

      {/* DETAILS */}
      <Box
        sx={{
          flex: 1,
          height: '100%',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to bottom right, #d6f4f2, #e1cce9)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {date}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                borderRadius: '0.5rem',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.paper,
              }}
            />
          ))}
        </Box>

        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export default Ticket;
