"use client";

import React from "react";

export const PrintButton = () => {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: '#D4A017',
        border: 'none',
        padding: '10px 14px',
        borderRadius: 8,
        color: '#07203b',
        fontWeight: 800,
        cursor: 'pointer'
      }}
    >
      Print / Save
    </button>
  );
};
