import { RenderFile } from '../utils/markdownUtils'

const Notes = () => {
      const path = window.location.pathname;

      const extractedFileName = path.substring(6);

      return RenderFile(extractedFileName)
};

export default Notes;
