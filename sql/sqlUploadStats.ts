import {conn} from "./sqlConstants";
import {periodStatsDataType} from "../Scenes/uploadStats";
import {resultsData} from "../Scenes/newTrade";

export function uploadStatsForPeriod(period: periodStatsDataType, returnResult: { (results: any): void; }) {
    conn.connect(function (err: Error) {
            if (err) throw err;
            console.log("Connected!");

            let sql = 'SELECT * FROM `trades` WHERE `date` >= ? AND `date` < ?';
            let periodArr = [period.startPeriodDate, period.endPeriodDate];
            conn.query(sql, periodArr, function (err: Error, results: Array<resultsData>) {
                if (err) throw err;
                returnResult(results);
            });

            conn.end(function (err: Error) {
                if (err) throw err;
                else {
                    console.log('database closed')
                }
            })
        }
    )
}

