import React from 'react';

const rows = scores => {
    let jsxArray = [];
    for (let i = 0; i < scores.length; i++) {
        jsxArray.push(
            <tr>
                <th>{i+1}</th>
                <th>{scores[i].name}</th>
                <th>{Math.floor(scores[i].score)}</th>
                <th>{scores[i].wins}</th>
                <th>{scores[i].losses}</th>
            </tr>
        )
    }
    return jsxArray;
};

const HighScores = props =>
    <table>
        <tr>
            <th>rank</th>
            <th>username</th>
            <th>rating</th>
            <th>wins</th>
            <th>losses</th>
        </tr>
            {rows(props.scores)}
    </table>;
    
export default HighScores;