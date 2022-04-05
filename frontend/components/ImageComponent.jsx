import React from "react";
import styles from "../styles/Home.module.css";

export default function ImageComponent() {
  return (
    <div>
      <img className={styles.image} src="./CF.png" />
    </div>
  );
}
