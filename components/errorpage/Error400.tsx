import React from "react";
import styles from './Error.module.css';

const Error400: React.FC = () => {
  return (
    <div className={styles.errorpagediv}>
      <h1>400 Bad Request</h1>
    </div>
  );
};

export default Error400;