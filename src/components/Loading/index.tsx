import React from "react";
import styles from "./loading.module.css";

const _Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loader} />
    </div>
  );
};

const Loading = React.memo(_Loading);
export default Loading;
