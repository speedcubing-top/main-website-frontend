import React from 'react';
import { RenderFile } from '../utils/markdownUtils';

const Notes: React.FC = () => {
  const path = window.location.pathname;

  const extractedFileName: string = path.substring(6);

  return <RenderFile file={extractedFileName} />;
};

export default Notes;