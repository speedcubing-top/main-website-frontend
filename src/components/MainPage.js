import React from 'react';
import { renderMarkdown } from '../utils/markdownUtils'
import './Markdown.css'
//import './MainPage.css';

const MainPage = () => {
  const md = `
dwa
dwadwa
`;
    return (
      <div className="mainpagediv">
        <br/>
        <h3>Community</h3>
        <p>
          <strong>
            <a href="https://speedcubing.top/discord" target="_blank" rel="noreferrer">Discord Server</a>
          </strong>
        </p>
        <p>
          <strong> 
             <t>QQ - 534347346</t>
          </strong>
        </p>

        <br/>
        <h3>Github</h3>
        <p>
          <strong>
            <a href="https://speedcubing.top/github" target="_blank" rel="noreferrer">Github</a>
          </strong>
        </p>
        <p>
          <strong>
            <a href="https://speedcubing.top/github_org" target="_blank" rel="noreferrer">Github Organization</a>
          </strong>
        </p>

        <br/>
        <h3>Utilities</h3>
        <p>
          <strong>
            <a href="https://api.speedcubing.top" target="_blank" rel="noreferrer">Restful API</a>
          </strong>
        </p>
        <p>
          <strong>
            <a href="https://speedcubing.top/discordbot" target="_blank" rel="noreferrer">Discord Bot</a>
          </strong>
        </p>
        <p>
          <strong>
            <a href="https://repo.speedcubing.top" target="_blank" rel="noreferrer">Maven Repository Server</a>
          </strong>
        </p>

        <br/>
        <h3>Social Media Pages</h3>
        <p>
          <strong>
            <a href="https://speedcubing.top/fb_fan" target="_blank" rel="noreferrer">Facebook</a>
          </strong>
        </p>
        <p>
          <strong>
            <a href="https://speedcubing.top/twitter" target="_blank" rel="noreferrer">Twitter</a>
          </strong>
        </p>
        
        <br/>
        <h3>Contact</h3>
        <p>
          <strong>
            <a href="mailto:speedcubing@speedcubing.top">Email - speedcubing@speedcubing.top</a>
          </strong>
        </p>

        <br/>
      </div>
    );
  }

export default MainPage;
