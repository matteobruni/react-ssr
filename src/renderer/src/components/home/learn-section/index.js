import React, { useContext, useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { useMediaQuery } from "react-responsive";
import {
  SubjectModalContext,
  UserContext,
  ThemeContext,
} from "../../../context";
import { logoDark2 } from "../../../assets";
import maths from "../../../assets/subjects/maths.svg";
import physics from "../../../assets/subjects/physics.svg";
import chemistry from "../../../assets/subjects/chemistry.svg";
import biology from "../../../assets/subjects/biology.svg";
import history from "../../../assets/subjects/history.svg";
import civics from "../../../assets/subjects/civics.svg";
import geography from "../../../assets/subjects/geography.svg";
import economics from "../../../assets/subjects/economics.svg";
import literature from "../../../assets/subjects/literature.svg";
import writing from "../../../assets/subjects/writing.svg";
import grammar from "../../../assets/subjects/grammar.svg";
import reading from "../../../assets/subjects/reading.svg";
import mathsBg from "../../../assets/subjects/mathsBg.svg";
import physicsBg from "../../../assets/subjects/physicsBg.svg";
import chemistryBg from "../../../assets/subjects/chemistryBg.svg";
import biologyBg from "../../../assets/subjects/biologyBg.svg";
import historyBg from "../../../assets/subjects/historyBg.svg";
import civicsBg from "../../../assets/subjects/civicsBg.svg";
import geographyBg from "../../../assets/subjects/geographyBg.svg";
import economicsBg from "../../../assets/subjects/economicsBg.svg";
import literatureBg from "../../../assets/subjects/literatureBg.svg";
import writingBg from "../../../assets/subjects/writingBg.svg";
import grammarBg from "../../../assets/subjects/grammarBg.svg";
import readingBg from "../../../assets/subjects/readingBg.svg";
import {
  getPracticeMeta,
  getSubjectMeta,
  getSubjectMeta2,
  getTipsMeta,
} from "../../../database";
import "./style.scss";

export const subjectImageData = {
  maths,
  physics,
  chemistry,
  biology,
  history,
  civics,
  geography,
  economics,
  literature,
  writing,
  grammar,
  reading,
  mathsBg,
  physicsBg,
  chemistryBg,
  biologyBg,
  historyBg,
  civicsBg,
  geographyBg,
  economicsBg,
  literatureBg,
  writingBg,
  grammarBg,
  readingBg
}

const LearnSection = ({ title }) => {
  const [isSubjectModalOpen] = useContext(SubjectModalContext).isOpen;
  const [, setSubjectCode] = useContext(SubjectModalContext).subjectCode;
  const [, setSubjectName] = useContext(SubjectModalContext).subjectName;
  const [, setChaptersData] = useContext(SubjectModalContext).data;
  const [, setTabData] = useContext(SubjectModalContext).tabData;
  const [isDark] = useContext(ThemeContext).theme;
  const [user] = useContext(UserContext).user;

  const [mathsMeta, setMathsMeta] = useState(null);
  const [scienceMeta, setScienceMeta] = useState(null);
  const [grammarMeta, setGrammarMeta] = useState(null);
  const [literatureMeta, setLiteratureMeta] = useState(null);
  const [socialScienceMeta, setSocialScienceMeta] = useState(null);
  const [englishBasicsMeta, setEnglishBasicsMeta] = useState(null);

  const [mathsTipsMeta, setMathsTipsMeta] = useState(null);
  const [scienceTipsMeta, setScienceTipsMeta] = useState(null);
  const [englishTipsMeta, setEnglishTipsMeta] = useState(null);
  const [socialScienceTipsMeta, setSocialScienceTipsMeta] = useState(null);

  const [socialSciencePracticeMeta, setSocialSciencePracticeMeta] =
    useState(null);
  const [mathsPracticeMeta, setMathsPracticeMeta] = useState(null);
  const [englishPracticeMeta, setEnglishPracticeMeta] = useState(null);
  const [sciencePracticeMeta, setSciencePracticeMeta] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    getMathsMetaFn();
    getScienceMetaFn();
    getSocialScienceMetaFn();
    getLiteratureMetaFn();
    getGrammarMetaFn();
    getMathsTipsMetaFn();
    getScienceTipsMetaFn();
    getSocialScienceTipsMetaFn();
    getEnglishTipsMetaFn();
    getMathsPracticeMetaFn();
    getSciencePracticeMetaFn();
    getSocialSciencePracticeMetaFn();
    getEnglishPracticeMetaFn();
    getEnglishBasicsMetaFn();

    setIsLoading(false);
  }, [user?.grade]);

  const getMathsMetaFn = async () => {
    const result = await getSubjectMeta2({
      grade: user?.grade,
      subjectCode: user?.grade === "class_9" ? "maths" : "mathematics",
    });

    setMathsMeta(result);
  };

  const getScienceMetaFn = async () => {
    const result = await getSubjectMeta({
      grade: user?.grade,
      subjectCode: "science",
    });

    setScienceMeta(result);
  };

  const getSocialScienceMetaFn = async () => {
    const result = await getSubjectMeta({
      grade: user?.grade,
      subjectCode: "socialscience",
    });
    setSocialScienceMeta(result);
  };

  const getLiteratureMetaFn = async () => {
    const result = await getSubjectMeta2({
      grade: user?.grade,
      subjectCode: user?.grade === "class_9" ? "englishliterature" : "english",
    });
    setLiteratureMeta(result);
  };

  const getEnglishBasicsMetaFn = async () => {
    const result = await getSubjectMeta({
      grade: user?.grade,
      subjectCode: "englishbasics",
    });
    setEnglishBasicsMeta(result);
  };

  const getGrammarMetaFn = async () => {
    const result = await getSubjectMeta2({
      grade: user?.grade,
      subjectCode: "englishgrammar",
    });
    setGrammarMeta(result);
  };

  const getMathsTipsMetaFn = async () => {
    const result = await getTipsMeta({
      grade: user?.grade,
      subjectCode: "mathematics",
    });

    setMathsTipsMeta(result);
  };

  const getScienceTipsMetaFn = async () => {
    const result = await getTipsMeta({
      grade: user?.grade,
      subjectCode: "science",
    });

    setScienceTipsMeta(result);
  };

  const getSocialScienceTipsMetaFn = async () => {
    const result = await getTipsMeta({
      grade: user?.grade,
      subjectCode: "socialscience",
    });
    setSocialScienceTipsMeta(result);
  };

  const getEnglishTipsMetaFn = async () => {
    const result = await getTipsMeta({
      grade: user?.grade,
      subjectCode: "english",
    });

    setEnglishTipsMeta(result);
  };

  const getMathsPracticeMetaFn = async () => {
    const result = await getPracticeMeta({
      grade: user?.grade,
      subjectCode: "mathematics",
    });

    setMathsPracticeMeta(result);
  };

  const getSciencePracticeMetaFn = async () => {
    const result = await getPracticeMeta({
      grade: user?.grade,
      subjectCode: "science",
    });

    setSciencePracticeMeta(result);
  };

  const getSocialSciencePracticeMetaFn = async () => {
    const result = await getPracticeMeta({
      grade: user?.grade,
      subjectCode: "socialscience",
    });
    setSocialSciencePracticeMeta(result);
  };

  const getEnglishPracticeMetaFn = async () => {
    const result = await getPracticeMeta({
      grade: user?.grade,
      subjectCode: "english",
    });

    setEnglishPracticeMeta(result);
  };

  const subjectsArray = [
    {
      imageUrl: maths,
      bg: mathsBg,
      name: "maths",
      subjectCode: "maths",
    },
    {
      imageUrl: physics,
      bg: physicsBg,
      name: "physics",
      subjectCode: "science",
    },
    {
      imageUrl: chemistry,
      bg: chemistryBg,
      name: "chemistry",
      subjectCode: "science",
    },
    {
      imageUrl: biology,
      bg: biologyBg,
      name: "biology",
      subjectCode: "science",
    },
    {
      imageUrl: history,
      bg: historyBg,
      name: "history",
      subjectCode: "socialscience",
    },
    {
      imageUrl: civics,
      bg: civicsBg,
      name: "civics",
      subjectCode: "socialscience",
    },
    {
      imageUrl: geography,
      bg: geographyBg,
      name: "geography",
      subjectCode: "socialscience",
    },
    {
      imageUrl: economics,
      bg: economicsBg,
      name: "economics",
      subjectCode: "socialscience",
    },
    {
      imageUrl: literature,
      bg: literatureBg,
      name: "literature",
      subjectCode: "englishliterature",
    },
    {
      imageUrl: writing,
      bg: writingBg,
      name: "writing",
      subjectCode: "englishbasics",
    },
    {
      imageUrl: grammar,
      bg: grammarBg,
      name: "grammar",
      subjectCode: "englishgrammar",
    },
    {
      imageUrl: reading,
      bg: readingBg,
      name: "reading",
      subjectCode: "englishbasics",
    },
  ];

  const onSubjectClick = (subjectCode, code, imageUrl) => {
    setSubjectCode(subjectCode);
    setSubjectName(code);

    if (subjectCode === "maths") {
      if (mathsMeta === null) return;
      const _data = {
        ...mathsMeta.categories[0],
        tips: mathsTipsMeta,
        practice: mathsPracticeMeta,
        code: "maths",
        description: mathsMeta.description,
        hex_color: "#fdf7e5",
        illustration_art: imageUrl,
        mainThumb: imageUrl,
        miniThumb: imageUrl,
        subjectCode: "mathematics",
      };

      setChaptersData(_data);
    }
    if (subjectCode === "science") {
      if (scienceMeta === null) return;

      const reqData = scienceMeta.filter((item) => item.code === code)[0];
      const _data = {
        ...reqData,
        tips: scienceTipsMeta,
        practice: sciencePracticeMeta,
        illustration_art: imageUrl,
        mainThumb: imageUrl,
        miniThumb: imageUrl,
        subjectCode,
      };

      setChaptersData(_data);
    }
    if (subjectCode === "socialscience") {
      if (socialScienceMeta === null) return;

      const reqData = socialScienceMeta.filter((item) => item.code === code)[0];

      const _data = {
        ...reqData,
        tips: socialScienceTipsMeta,
        practice: socialSciencePracticeMeta,
        illustration_art: imageUrl,
        mainThumb: imageUrl,
        miniThumb: imageUrl,
        subjectCode,
      };

      setChaptersData(_data);
    }

    if (subjectCode === "englishliterature") {
      if (literatureMeta === null) return;

      const reqData = literatureMeta.categories.sort(
        (a, b) => a?.serial_order - b?.serial_order
      );

      const _tabData = [];
      reqData.map((item) => _tabData.push(item.name));

      const _data = {
        subjects: reqData,
        tips: englishTipsMeta,
        practice: englishPracticeMeta,
        illustration_art: imageUrl,
        mainThumb: imageUrl,
        miniThumb: imageUrl,
        name: "Literature",
        description: literatureMeta.description,
        code: subjectCode,
        subjectCode,
      };

      setTabData([..._tabData, "Tips", "Practice"]);

      setChaptersData(_data);
    }
    if (subjectCode === "englishgrammar") {
      if (grammarMeta === null) return;

      const reqData = grammarMeta.categories.sort(
        (a, b) => a?.serial_order - b?.serial_order
      );

      const _tabData = [];
      reqData.map((item) => _tabData.push(item.name));

      const _data = {
        subjects: reqData,
        tips: englishTipsMeta,
        practice: englishPracticeMeta,
        illustration_art: imageUrl,
        mainThumb: imageUrl,
        miniThumb: imageUrl,
        name: "Grammar",
        description: grammarMeta.description,
        code: subjectCode,
        subjectCode,
      };

      setTabData([..._tabData, "Tips", "Practice"]);

      setChaptersData(_data);
    }

    if (subjectCode === "englishbasics") {
      if (grammarMeta === null) return;

      const reqData = englishBasicsMeta.filter((item) => item.code === code)[0];

      const _data = {
        ...reqData,
        tips: englishTipsMeta,
        practice: englishPracticeMeta,
        illustration_art: imageUrl,
        mainThumb: imageUrl,
        miniThumb: imageUrl,
        subjectCode,
      };

      setChaptersData(_data);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  }, [title]);

  return (
    <div className="learn-section-wrapper">
      <h1
        className="section-title"
        style={{
          animationPlayState: isSubjectModalOpen ? "paused" : "running",
        }}
      >
        {title}
      </h1>

      <div className="subject-row">
        {subjectsArray
          .slice(0, 4)
          .map(({ name, imageUrl, bg, subjectCode }) => (
            <SubTile
              subjectCode={subjectCode}
              name={name}
              imageUrl={imageUrl}
              onSubjectClick={onSubjectClick}
              bg={bg}
              isLoading={isLoading}
              isDark={isDark}
              key={name}
            />
          ))}
      </div>
      <div className="subject-row">
        {subjectsArray
          .slice(4, 8)
          .map(({ name, imageUrl, bg, subjectCode }) => (
            <SubTile
              subjectCode={subjectCode}
              name={name}
              imageUrl={imageUrl}
              onSubjectClick={onSubjectClick}
              bg={bg}
              isLoading={isLoading}
              isDark={isDark}
              key={name}
            />
          ))}
      </div>
      <div className="subject-row">
        {subjectsArray
          .slice(8, 12)
          .map(({ name, imageUrl, bg, subjectCode }) => (
            <SubTile
              subjectCode={subjectCode}
              name={name}
              imageUrl={imageUrl}
              onSubjectClick={onSubjectClick}
              bg={bg}
              isLoading={isLoading}
              isDark={isDark}
              key={name}
            />
          ))}
      </div>
    </div>
  );
};

export default LearnSection;

const SubTile = ({
  subjectCode,
  name,
  imageUrl,
  onSubjectClick,
  bg,
  isLoading,
  isDark,
}) => {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 500px)" });

  return (
    <div
      className="sub-tile-wrapper"
      onClick={() => onSubjectClick(subjectCode, name, imageUrl)}
    >
      <div className={`sub-tile ${name}`}>
        <img className="sub-bg" src={bg} alt="svg" draggable={false} />
        {isLoading ? (
          <img
            className="sub-icon loading"
            src={logoDark2}
            alt={"logo"}
            draggable={false}
            key={name}
          />
        ) : (
          <img
            className="sub-icon"
            src={imageUrl}
            alt={`${name}`}
            draggable={false}
            key={subjectCode}
          />
        )}
      </div>
      <h6>
        {isLoading ? (
          <ContentLoader
            speed={2}
            width={isSmallScreen ? 50 : 100}
            height={30}
            viewBox="0 0 270 30"
            backgroundColor={isDark ? "#282828" : "#ecebeb"}
            foregroundColor={isDark ? "#343434" : "#ddd"}
          >
            <rect x="0" y="0" rx="10" ry="10" width="100%" height="30" />
          </ContentLoader>
        ) : (
          name
        )}
      </h6>
    </div>
  );
};
