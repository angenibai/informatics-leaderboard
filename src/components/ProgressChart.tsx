import {
  Box,
  ButtonGroup,
  Heading,
  Spinner,
  Text,
  useRadioGroup,
} from "@chakra-ui/react";
import {
  Firestore,
  query,
  where,
  limit,
  collection,
  Timestamp,
  DocumentData,
} from "@firebase/firestore";
import { ResponsiveLine } from "@nivo/line";
import {
  useFirestoreQuery,
  useFirestoreQueryData,
} from "@react-query-firebase/firestore";
import RadioButton from "./RadioButton";
import { has, last } from "lodash";
import {
  compareAsc,
  sub,
  isAfter,
  format,
  parse,
  isSameDay,
  subDays,
} from "date-fns";

interface ProgressChartProps {
  studentId: string;
  db: Firestore;
}

interface studentSolve extends DocumentData {
  id: string;
  submittedTime: Timestamp;
}

interface problem extends DocumentData {
  id: string;
  problem: string;
  type: string;
  value: number;
}

interface tRangeToDays {
  [key: string]: number;
}

interface tScoreByDay {
  [key: string]: dailyData;
}

interface dailyData {
  score: number;
  cumulativeScore: number;
  solvedProblems: Array<string>;
}

interface dailyDataWithDate extends dailyData {
  date: string;
}

// returns the date the specified interval before current date
const getEarliestDate = (range: string) => {
  if (!range || range === "all") {
    return null;
  }
  const rangeToDays: tRangeToDays = {
    "1w": 7,
    "1m": 30,
    "6m": 180,
    "1y": 365,
  };
  return sub(new Date(), {
    days: rangeToDays[range] || 30,
  });
};

// returns score history within the specified range in format { date, score, solves }
const getScoreHistoryInRange = (
  range: string,
  scoreHistory: Array<dailyDataWithDate>
) => {
  // return just 0 if there are no scores at all
  if (!scoreHistory || scoreHistory.length === 0) {
    return [
      {
        date: dateToString(new Date()),
        score: 0,
        cumulativeScore: 0,
        solvedProblems: [],
      },
    ];
  }

  // filter for all dates that come after the earliest date in this range
  const earliestDateInRange =
    getEarliestDate(range) ||
    parse(scoreHistory[0].date, "yyyy-MM-dd", new Date());

  const scoresInRange = scoreHistory.filter((data) =>
    isAfter(parse(data.date, "yyyy-MM-dd", new Date()), earliestDateInRange)
  );

  // add score for first date in range
  const firstScoreDate = parse(scoreHistory[0].date, "yyyy-MM-dd", new Date());

  const firstScoreDateInRange = parse(
    scoresInRange[0]?.date,
    "yyyy-MM-dd",
    new Date()
  );

  let cumulativeScore: number = 0;
  if (isAfter(firstScoreDate, earliestDateInRange)) {
    // score is zero at earliest date in the range
    cumulativeScore = 0;
  } else if (scoresInRange.length === 0) {
    // all scores have occurred before the current range
    cumulativeScore = last(scoreHistory)?.cumulativeScore || 0;
  } else if (!isSameDay(firstScoreDateInRange, earliestDateInRange)) {
    // add score from before the first date with scores in this range
    cumulativeScore = scoresInRange[0].cumulativeScore - scoresInRange[0].score;
  }
  scoresInRange.unshift({
    date: dateToString(earliestDateInRange),
    score: 0,
    cumulativeScore: cumulativeScore,
    solvedProblems: [],
  });

  // for all option, have the day before the first score be 0
  if (range === "all") {
    const zeroDate = subDays(firstScoreDate, 1);
    scoresInRange.unshift({
      date: dateToString(zeroDate),
      score: 0,
      cumulativeScore: 0,
      solvedProblems: [],
    });
  }

  // add score for today
  const today = dateToString(new Date());
  if (!scoresInRange || last(scoresInRange)?.date !== today) {
    const currentTotal = scoreHistory ? last(scoreHistory)?.cumulativeScore : 0;
    scoresInRange.push({
      date: today,
      score: 0,
      cumulativeScore: currentTotal || 0,
      solvedProblems: [],
    });
  }

  return scoresInRange;
};

const dateToString = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

// creates full score history
const createScoreHistory = (
  studentSolves: Array<studentSolve>,
  problems: Array<problem>
) => {
  studentSolves.sort(
    (a, b) => a.submittedTime.seconds - b.submittedTime.seconds
  );
  const scoreByDay: tScoreByDay = {};
  let cumulativeScore = 0;
  studentSolves.forEach((solveData) => {
    const dateString = dateToString(solveData.submittedTime.toDate());
    // find the problem that was solved
    const solvedProblem = problems.find((obj) => obj.id === solveData.id);
    if (!solvedProblem) {
      return;
    }
    const value = solvedProblem.value;
    const problem =
      solvedProblem.type === "attendance"
        ? "attendance"
        : solvedProblem.problem;
    cumulativeScore += value;
    // add its point value to the day's score
    if (has(scoreByDay, dateString)) {
      scoreByDay[dateString].score += value;
      scoreByDay[dateString].solvedProblems.push(problem);
      scoreByDay[dateString].cumulativeScore = cumulativeScore;
    } else {
      scoreByDay[dateString] = {
        score: value,
        solvedProblems: [problem],
        cumulativeScore,
      };
    }
  });
  const allDays = Object.keys(scoreByDay);
  allDays.sort((a, b) => {
    return compareAsc(
      parse(a, "yyyy-MM-dd", new Date()),
      parse(b, "yyyy-MM-dd", new Date())
    );
  });
  return allDays.map((dateString) => {
    return {
      date: dateString,
      ...scoreByDay[dateString],
    };
  });
};

// create x and y axis data for the graph
const createXYData = (scores: Array<dailyDataWithDate>) => {
  const XYData = scores.map((dailyData) => ({
    x: dailyData.date,
    y: dailyData.cumulativeScore,
  }));

  return XYData;
};

const ProgressChart = (props: ProgressChartProps) => {
  const { studentId, db } = props;

  const rangeOptions = ["1w", "1m", "6m", "1y", "all"];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "rangeSelect",
    defaultValue: "1m",
  });
  const rangeGroup = getRootProps();

  // gets the range value selected by the radio buttons
  const getSelectedRange = (rangeOptions: Array<string>) => {
    return (
      rangeOptions.find((value) => getRadioProps({ value }).isChecked) || "1m"
    );
  };

  const studentRef = query(
    collection(db, "students"),
    where("id", "==", studentId),
    limit(1)
  );

  const studentQuery = useFirestoreQuery(
    ["students", studentId],
    studentRef,
    { subscribe: true },
    {
      select(snapshot) {
        if (snapshot.empty) {
          return null;
        }
        return snapshot.docs[0].data();
      },
    }
  );

  const problemsRef = query(collection(db, "problems"));
  const problemsQuery = useFirestoreQueryData(["allProblems"], problemsRef, {
    subscribe: true,
  });

  if (studentQuery.isError || problemsQuery.isError) {
    return (
      <Box>
        <Text>Error while loading profile</Text>
      </Box>
    );
  }

  if (
    studentQuery.isLoading ||
    problemsQuery.isLoading ||
    !studentQuery.data ||
    !problemsQuery.data
  ) {
    return <Spinner mt={4} color="teal" />;
  }

  const studentData = studentQuery.data;
  const problemsData = problemsQuery.data;

  const fullScoreHistory = createScoreHistory(
    studentData.solves,
    problemsData as problem[]
  );

  let data = [
    {
      id: "score",
      color: "hsl(178, 51%, 39%)",
      data: createXYData(fullScoreHistory),
    },
  ];

  const selectedRange = getSelectedRange(rangeOptions);

  const scoreHistoryInRange = getScoreHistoryInRange(
    selectedRange,
    fullScoreHistory
  );
  data = [
    {
      id: "score",
      color: "hsl(178, 51%, 39%)",
      data: createXYData(scoreHistoryInRange),
    },
  ];

  return (
    <Box className="ProgressChart" mb={12}>
      <Heading textAlign="left" as="h3" size="lg">
        Progress
      </Heading>
      <ButtonGroup
        size="xs"
        variant="outline"
        {...rangeGroup}
        isAttached
        mt={2}
      >
        {rangeOptions.map((value) => {
          const radio = getRadioProps({ value });
          return (
            <RadioButton key={value} {...radio}>
              {value}
            </RadioButton>
          );
        })}
      </ButtonGroup>
      <Box className="lineChart" height={500}>
        <ResponsiveLine
          data={data}
          margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
          colors={{ scheme: "set2" }}
          xScale={{
            type: "time",
            format: "%Y-%m-%d",
            useUTC: false,
            precision: "day",
          }}
          xFormat="time:%Y-%m-%d"
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
          }}
          axisLeft={{
            legend: "points",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          axisBottom={{
            legend: "day",
            legendOffset: 40,
            legendPosition: "middle",
            format: "%b %d",
          }}
          enableGridX={false}
          curve={"monotoneX"}
          pointSize={10}
          pointColor={{ from: "color" }}
          enablePointLabel={true}
          useMesh={true}
          enableSlices={false}
        />
      </Box>
    </Box>
  );
};

export default ProgressChart;
