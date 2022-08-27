import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  getSubjectMeta,
  getSubjectMeta2,
  getPracticeMeta,
  getTipsMeta,
} from "../../database";

import "./style.scss";
import {getAvailableGrades} from "../../database/home/fetcher";

const Sitemap = () => {
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

  const [mathsPracticeMeta, setMathsPracticeMeta] = useState(null);
  const [englishPracticeMeta, setEnglishPracticeMeta] = useState(null);
  const [sciencePracticeMeta, setSciencePracticeMeta] = useState(null);
  const [socialSciPracticeMeta, setSocialSciPracticeMeta] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // const grades = ["class_9", "class_10"];
  const grades = getAvailableGrades(true, true);

  const getMathsMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getSubjectMeta2({
        grade: grade,
        subjectCode: grade === "class_9" ? "maths" : "mathematics",
      });

      data = { [grade]: result.categories[0].chapters, ...data };
      index === grades.length - 1 && setMathsMeta(data);
    });
  };

  const getScienceMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getSubjectMeta({
        grade: grade,
        subjectCode: "science",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setScienceMeta(data);
    });
  };

  const getSocialScienceMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getSubjectMeta({
        grade: grade,
        subjectCode: "socialscience",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setSocialScienceMeta(data);
    });
  };

  const getLiteratureMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getSubjectMeta2({
        grade: grade,
        subjectCode: grade === "class_9" ? "englishliterature" : "english",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setLiteratureMeta(data);
    });
  };

  const getEnglishBasicsMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getSubjectMeta({
        grade: grade,
        subjectCode: "englishbasics",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setEnglishBasicsMeta(data);

      setIsLoading(false);
    });
  };

  const getGrammarMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getSubjectMeta2({
        grade: grade,
        subjectCode: "englishgrammar",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setGrammarMeta(data);
    });
  };

  const getMathsTipsMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getTipsMeta({
        grade: grade,
        subjectCode: "mathematics",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setMathsTipsMeta(data);
    });
  };

  const getScienceTipsMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getTipsMeta({
        grade: grade,
        subjectCode: "science",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setScienceTipsMeta(data);
    });
  };

  const getSocialScienceTipsMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getTipsMeta({
        grade: grade,
        subjectCode: "socialscience",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setSocialScienceTipsMeta(data);
    });
  };

  const getEnglishTipsMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getTipsMeta({
        grade: grade,
        subjectCode: "english",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setEnglishTipsMeta(data);
    });
  };

  const getMathsPracticeMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getPracticeMeta({
        grade: grade,
        subjectCode: "mathematics",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setMathsPracticeMeta(data);
    });
  };

  const getSciencePracticeMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getPracticeMeta({
        grade: grade,
        subjectCode: "science",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setSciencePracticeMeta(data);
    });
  };

  const getSocialSciencePracticeMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getPracticeMeta({
        grade: grade,
        subjectCode: "socialscience",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setSocialSciPracticeMeta(data);
    });
  };

  const getEnglishPracticeMetaFn = () => {
    let data = {};

    grades.map(async (grade, index) => {
      let result = await getPracticeMeta({
        grade: grade,
        subjectCode: "english",
      });

      data = { [grade]: result, ...data };
      index === grades.length - 1 && setEnglishPracticeMeta(data);
    });
  };

  useMemo(() => {
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
  }, []);

  const englishCodes = ["englishliterature", "englishbasics", "englishgrammar"];

  const tipsPath = (code, grade, tip_id) => {
    if (englishCodes.includes(code)) {
      return `/tips?subject=${grade}_tips_english&tip=${tip_id}`;
    }
    return `/tips?subject=${grade}_tips_${code}&tip=${tip_id}`;
  };

  const practicePath = (code, grade, exam_id) => {
    if (englishCodes.includes(code)) {
      return `/practice?subject=${grade}_practice_english&practice=${exam_id}`;
    }

    return `/practice?subject=${grade}_practice_${code}&practice=${exam_id}`;
  };

  const ScienceSubjectsLearnChapters = ({ code, grade }) => (
    <div className="chapters_name">
      {scienceMeta?.[grade]
        ?.filter((sub) => sub.code === code)[0]
        ?.chapters?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`/classroom?subject=${code}&chapter=${item.chapter_id}`}
            key={item?.chapter_id}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item?.chapter_name}
          </a>
        ))}
    </div>
  );

  const SocialScienceSubjectsLearnChapters = ({ code, grade }) => (
    <div className="chapters_name">
      {socialScienceMeta?.[grade]
        ?.filter((sub) => sub.code === code)[0]
        ?.chapters?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`/classroom?subject=${code}&chapter=${item.chapter_id}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.chapter_id}
          >
            {item?.chapter_name}
          </a>
        ))}
    </div>
  );

  const MathsLearnChapters = ({ grade }) => (
    <div className="chapters_name">
      {mathsMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`/classroom?subject=maths&chapter=${item.chapter_id}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.chapter_id}
          >
            {item?.chapter_name}
          </a>
        ))}
    </div>
  );

  const EnglishLiteratureSubjectsLearnChapters = ({ chapters }) => (
    <div className="chapters_name">
      {chapters
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`/classroom?subject=englishliterature&chapter=${item.chapter_id}`}
            target="_blank"
            key={item?.chapter_id}
            rel="noopener noreferrer"
          >
            {item?.chapter_name}
          </a>
        ))}
    </div>
  );

  const EnglishGrammarSubjectsLearnChapters = ({ chapters }) => (
    <div className="chapters_name">
      {chapters
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`/classroom?subject=englishgrammar&chapter=${item.chapter_id}`}
            target="_blank"
            key={item?.chapter_id}
            rel="noopener noreferrer"
          >
            {item?.chapter_name}
          </a>
        ))}
    </div>
  );

  const EnglishBasicsSubjectsLearnChapters = ({ code, grade }) => (
    <div className="chapters_name">
      {englishBasicsMeta?.[grade]
        ?.filter((sub) => sub.code === code)[0]
        ?.chapters?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`/classroom?subject=${code}&chapter=${item.chapter_id}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.chapter_id}
          >
            {item?.chapter_name}
          </a>
        ))}
    </div>
  );

  const MathsTips = ({ grade }) => (
    <div className="chapters_name">
      {mathsTipsMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${tipsPath("mathematics", grade, item?.tip_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.tip_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  const ScienceTips = ({ grade }) => (
    <div className="chapters_name">
      {scienceTipsMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${tipsPath("science", grade, item?.tip_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.tip_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  const SocialScienceTips = ({ grade }) => (
    <div className="chapters_name">
      {socialScienceTipsMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${tipsPath("socialscience", grade, item?.tip_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.tip_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  const EnglishTips = ({ grade }) => (
    <div className="chapters_name">
      {englishTipsMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${tipsPath("english", grade, item?.tip_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.tip_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  const MathsPractice = ({ grade }) => (
    <div className="chapters_name">
      {mathsPracticeMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${practicePath("mathematics", grade, item?.exam_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.exam_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  const SciencePractice = ({ grade }) => (
    <div className="chapters_name">
      {sciencePracticeMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${practicePath("science", grade, item?.exam_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.exam_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  const SocialSciencePractice = ({ grade }) => (
    <div className="chapters_name">
      {socialSciPracticeMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${practicePath("socialscience", grade, item?.exam_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.exam_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  const EnglishPractice = ({ grade }) => (
    <div className="chapters_name">
      {englishPracticeMeta?.[grade]
        ?.sort((a, b) => a.serial_order - b.serial_order)
        ?.map((item) => (
          <a
            href={`${practicePath("english", grade, item?.exam_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            key={item?.exam_id}
          >
            {item?.name}
          </a>
        ))}
    </div>
  );

  return (
    <div className="sitemap">
      <Helmet>
        <meta charSet="utf-8" />
        <title>PuStack - Sitemap</title>
      </Helmet>

      <div className="sitemap__inner fadeIn">
        <h1>PuStack Sitemap</h1>
        <h2>CLASSES</h2>
        {!isLoading && (
          <div className="classes__wrapper fadeIn">
            <div className="classes__section">
              <h3>CBSE CLASS 9</h3>
              <h4>LEARN</h4>
              <div className="sitemap__subjects">
                <div className="subject_wrapper">
                  <h6>Mathematics</h6>
                  <MathsLearnChapters grade="class_9" />
                </div>

                <div className="subject_wrapper">
                  <h6>Physics</h6>
                  <ScienceSubjectsLearnChapters
                    code="physics"
                    grade="class_9"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Chemistry</h6>
                  <ScienceSubjectsLearnChapters
                    code="chemistry"
                    grade="class_9"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Biology</h6>
                  <ScienceSubjectsLearnChapters
                    code="biology"
                    grade="class_9"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>History</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="history"
                    grade="class_9"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Civics</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="civics"
                    grade="class_9"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Geography</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="geography"
                    grade="class_9"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Economics</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="economics"
                    grade="class_9"
                  />
                </div>

                {literatureMeta?.["class_9"].categories.map((category, i) => (
                  <div className="subject_wrapper" key={i}>
                    <h6>{category.name}</h6>

                    <EnglishLiteratureSubjectsLearnChapters
                      chapters={category.chapters}
                    />
                  </div>
                ))}

                <div className="subject_wrapper">
                  <h6>English Writing</h6>
                  <EnglishBasicsSubjectsLearnChapters
                    code="writing"
                    grade="class_9"
                  />
                </div>

                {grammarMeta?.["class_9"].categories.map((category, i) => (
                  <div className="subject_wrapper" key={i}>
                    <h6>{category.name}</h6>

                    <EnglishGrammarSubjectsLearnChapters
                      chapters={category.chapters}
                    />
                  </div>
                ))}

                <div className="subject_wrapper">
                  <h6>English Reading</h6>
                  <EnglishBasicsSubjectsLearnChapters
                    code="reading"
                    grade="class_9"
                  />
                </div>
              </div>

              <h4>TIPS</h4>
              <div className="sitemap__subjects">
                <div className="subject_wrapper">
                  <h6>Mathematics</h6>
                  <MathsTips grade="class_9" />
                </div>

                <div className="subject_wrapper">
                  <h6>Science</h6>
                  <ScienceTips grade="class_9" />
                </div>

                <div className="subject_wrapper">
                  <h6>Social Science</h6>
                  <SocialScienceTips grade="class_9" />
                </div>

                <div className="subject_wrapper">
                  <h6>English</h6>
                  <EnglishTips grade="class_9" />
                </div>
              </div>

              <h4>PRACTICE</h4>
              <div className="sitemap__subjects">
                <div className="subject_wrapper">
                  <h6>Mathematics</h6>
                  <MathsPractice grade="class_9" />
                </div>

                <div className="subject_wrapper">
                  <h6>Science</h6>
                  <SciencePractice grade="class_9" />
                </div>

                <div className="subject_wrapper">
                  <h6>Social Science</h6>
                  <SocialSciencePractice grade="class_9" />
                </div>

                <div className="subject_wrapper">
                  <h6>English</h6>
                  <EnglishPractice grade="class_9" />
                </div>
              </div>
            </div>

            <div className="classes__section">
              <h3>CBSE CLASS 10</h3>
              <h4>LEARN</h4>
              <div className="sitemap__subjects">
                <div className="subject_wrapper">
                  <h6>Mathematics</h6>
                  <MathsLearnChapters grade="class_10" />
                </div>

                <div className="subject_wrapper">
                  <h6>Physics</h6>
                  <ScienceSubjectsLearnChapters
                    code="physics"
                    grade="class_10"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Chemistry</h6>
                  <ScienceSubjectsLearnChapters
                    code="chemistry"
                    grade="class_10"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Biology</h6>
                  <ScienceSubjectsLearnChapters
                    code="biology"
                    grade="class_10"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>History</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="history"
                    grade="class_10"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Civics</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="civics"
                    grade="class_10"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Geography</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="geography"
                    grade="class_10"
                  />
                </div>

                <div className="subject_wrapper">
                  <h6>Economics</h6>
                  <SocialScienceSubjectsLearnChapters
                    code="economics"
                    grade="class_10"
                  />
                </div>

                {literatureMeta?.["class_10"].categories.map((category, i) => (
                  <div className="subject_wrapper" key={i}>
                    <h6>{category.name}</h6>
                    <EnglishLiteratureSubjectsLearnChapters
                      chapters={category.chapters}
                    />
                  </div>
                ))}

                <div className="subject_wrapper">
                  <h6>English Writing</h6>
                  <EnglishBasicsSubjectsLearnChapters
                    code="writing"
                    grade="class_10"
                  />
                </div>

                {grammarMeta?.["class_10"].categories.map((category, i) => (
                  <div className="subject_wrapper" key={i}>
                    <h6>{category.name}</h6>

                    <EnglishGrammarSubjectsLearnChapters
                      chapters={category.chapters}
                    />
                  </div>
                ))}

                <div className="subject_wrapper">
                  <h6>English Reading</h6>
                  <EnglishBasicsSubjectsLearnChapters
                    code="reading"
                    grade="class_10"
                  />
                </div>
              </div>
              <h4>TIPS</h4>
              <div className="sitemap__subjects">
                <div className="subject_wrapper">
                  <h6>Mathematics</h6>
                  <MathsTips grade="class_10" />
                </div>

                <div className="subject_wrapper">
                  <h6>Science</h6>
                  <ScienceTips grade="class_10" />
                </div>

                <div className="subject_wrapper">
                  <h6>Social Science</h6>
                  <SocialScienceTips grade="class_10" />
                </div>

                <div className="subject_wrapper">
                  <h6>English</h6>
                  <EnglishTips grade="class_10" />
                </div>
              </div>
              <h4>PRACTICE</h4>
              <div className="sitemap__subjects">
                <div className="subject_wrapper">
                  <h6>Mathematics</h6>
                  <MathsPractice grade="class_10" />
                </div>

                <div className="subject_wrapper">
                  <h6>Science</h6>
                  <SciencePractice grade="class_10" />
                </div>

                <div className="subject_wrapper">
                  <h6>Social Science</h6>
                  <SocialSciencePractice grade="class_10" />
                </div>

                <div className="subject_wrapper">
                  <h6>English</h6>
                  <EnglishPractice grade="class_10" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sitemap;
