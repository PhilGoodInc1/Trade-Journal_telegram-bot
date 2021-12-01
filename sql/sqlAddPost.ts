import {tradeDataType} from "../Scenes/newTrade";
import {conn} from "./sqlConstants";

export function insertNewTrade(data : tradeDataType) {
    conn.connect(function (err: Error) {
        if (err) throw err;
        console.log("Connected!");

        let sql = 'INSERT INTO trades SET ?';
        conn.query(sql, data, function (err: Error) {
            if (err) throw err;
            console.log("1 record inserted");
        });

        conn.end(function (err: Error) {
            if (err) throw err;
            else{
                console.log('database closed')
            }
        })
    });
}




