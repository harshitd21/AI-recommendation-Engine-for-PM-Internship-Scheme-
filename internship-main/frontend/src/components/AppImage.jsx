import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = "C:\Users\Ankit Ydv\Desktop\WhatsApp Image 2025-09-21 at 11.42.56_e93eb14c.jpg"
      }}
      {...props}
    />
  );
}

export default Image;
