import React, { useEffect, useState } from 'react';

const Leaderboard = props => {
  const { data } = props;
  const [sortedData, setSortedData] = useState([]);

  const createSortedData = data => {
    // data comes in as dictionary in format name: score
    const sortedData = [];
    for (const [name, score] of Object.entries(data)) {
      sortedData.push({name, score})
    }
    sortedData.sort((a,b) => b.score - a.score);
    console.log(sortedData);
    return sortedData;
  }

  useEffect(() => {
    setSortedData(createSortedData(data));
  }, []);

  return (
    <div className="Leaderboard">

    </div>
  );
}

export default Leaderboard;