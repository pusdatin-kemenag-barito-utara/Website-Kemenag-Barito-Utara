import React from 'react';

const NextLink = ({ href, children, replace, scroll, prefetch, shallow, passHref, ...props }) => {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

export default NextLink;
