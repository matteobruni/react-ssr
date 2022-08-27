import React, { useEffect, useState } from "react";
import DoubtTile from "./../doubt-tile";
import { DoubtLoader } from "../../../components";
import {
  DoubtContextProvider,
  PostsContextProvider,
  AskYourDoubtContextProvider,
} from "./../../../context";
import { getDoubtInfoByDoubtId } from "../../../database/doubts_forum/doubt-functions";

const DoubtSearchTile = ({ doubtId, grade }) => {
  const [, setHasMoreDoubts] = useState(true);
  const [doubtData, setDoubtData] = useState(null);

  useEffect(() => {
    getDoubtInfoByDoubtIdFn();
  }, []);

  const getDoubtInfoByDoubtIdFn = async () => {
    const results = await getDoubtInfoByDoubtId(doubtId, grade);
    setDoubtData(results);
  };

  return doubtData ? (
    <DoubtContextProvider searchTile={true}>
      <PostsContextProvider>
        <AskYourDoubtContextProvider>
          <DoubtTile
            doubtData={doubtData[0].post}
            doubtId={doubtData[0].id}
            shouldExpandDoubtTile={false}
            isDoubtPage={false}
            index={0}
            setHasMoreDoubts={setHasMoreDoubts}
          />
        </AskYourDoubtContextProvider>
      </PostsContextProvider>
    </DoubtContextProvider>
  ) : (
    <DoubtLoader />
  );
};

export default DoubtSearchTile;
