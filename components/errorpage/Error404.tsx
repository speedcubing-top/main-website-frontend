import React from "react";
import styles from './Error.module.css';

const Error404: React.FC = () => {
  return (
    <div className={styles.errorpagediv}>
      <h1>404 Not Found</h1>
    </div>
  );
};

export default Error404;