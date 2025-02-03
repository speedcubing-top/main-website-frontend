import React from 'react';
import { useSearchParams } from "react-router-dom";
import Error400 from '../errorpage/Error400';

const Redirect = () => {
    const [searchParams] = useSearchParams();
    const link = searchParams.get("url");  
    
     if (!link) {
        return <Error400 />;
    }
    
    return (
      <h1>
        Click to redirect to <a href={link}>{link}</a> 
      </h1>  
    );
}

export default Redirect;
