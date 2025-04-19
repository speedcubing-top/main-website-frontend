import { renderFile } from '../utils/markdownUtils'

const Notes = () => {
      const path = window.location.pathname;

      const extractedFileName = path.substring(6);

      return renderFile(extractedFileName)
};

export default Notes;
