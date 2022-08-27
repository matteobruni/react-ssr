import React from "react";
import Drawer from "@material-ui/core/Drawer";
import "./style.scss";

const NewsSearch = ({ isOpen, setIsOpen }) => {
  return (
    <Drawer
      isOpen={isOpen}
      anchor="bottom"
      variant="temporary"
      onClose={() => setIsOpen(false)}
      className="news-feed-search-drawer"
    >
      <div className="news-feed-search"></div>
    </Drawer>
  );
};

export default NewsSearch;
