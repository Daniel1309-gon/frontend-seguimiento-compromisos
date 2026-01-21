'use client';

import { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  minLength?: number;
  className?: string;
  expandText?: string;
  collapseText?: string;
  buttonClassName?: string;
}

export default function ExpandableText({
  text,
  maxLines = 3,
  minLength = 200,
  className = '',
  expandText = 'Ver más',
  collapseText = 'Ver menos',
  buttonClassName = '',
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mostrar botón solo si el texto probablemente es largo
  const showButton = text.length > minLength;

  return (
    <div>
      <p
        className={`text-gray-800 dark:text-gray-200 ${className}`}
        style={{
          whiteSpace: 'pre-wrap',
          ...(!isExpanded && {
            display: '-webkit-box',
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          })
        }}
      >
        {text}
      </p>

      {showButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            mt-2 text-sm font-medium 
            text-blue-600 dark:text-blue-400 
            hover:text-blue-800 dark:hover:text-blue-300
            hover:underline transition-colors
            cursor-pointer
            ${buttonClassName}
          `}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? collapseText : expandText}
        >
          {isExpanded ? `← ${collapseText}` : `${expandText} →`}
        </button>
      )}
    </div>
  );
}
