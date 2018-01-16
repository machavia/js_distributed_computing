const Database = require(__dirname + "/Database");

const cout = console.log

exports.DataSource = class {

	constructor(path, batch_size=64) {
        this.buff = undefined;

        this.targetsAvailable = {};
        this.target2Ids = new Map(); 
        this.target2IdTaken = new Map();
        this.epoch = 0;
        this.batch_size = batch_size;
		this.dataBase = new Database.Database('example.db');
		this.dbp = new Database.DatabasePromise('example.db');

        this.prepare_list = this.dbp
            .select('SELECT DISTINCT target FROM ids')
            .then((x) => {this.targetsAvailable = x;})
            .then(() => {console.log("->", this.targetsAvailable)})
            .then(() => {
                return(this.dbp.select('SELECT target, ex_id FROM ids'))
            })
            .then(
                (x) => {
                    for(let row of x){
                        let target = row.target;
                        let ex_id = row.ex_id;
                        if(! this.target2Ids.has(target)){
                            this.target2Ids.set(target, new Array());
                        }
                        this.target2Ids.get(target).push(ex_id);
                    }
                }
            )
            .then(() => {console.log("->", ds.target2Ids)})
	}

    getArrays(dbReturn){
        let X = new Array();
        let y = new Array();
        let ids = new Array();
        let last_id = undefined;

        for(let row of dbReturn){
            let curr_id = row.ex_id;
            let curr_y = row.target;
            if(curr_id != last_id){
                // add a sequence
                X.push([]);
                y.push(curr_y);
                ids.push(curr_id);
                last_id = curr_id;
            }
            let last_seq = X.length - 1;
            let seq = X[last_seq];
            // add a step (equiv to row in db) 
            seq.push([]);
            let last_step = seq.length - 1;
            last_step = seq[last_step]
            for(let k of Object.keys(row)){
                if(! (['target', 'ex_id'].includes(k))){
                    last_step.push(row[k])
                }
            }
        }

        return([X, y, ids])
    }

    async next(){
        let X, y, ids;

        await this.prepare_list;  // need to have infos completed

        let query = '(';
        for(let [i, j] of this.target2Ids.get(0).entries()){
            query += '"' + j + '"' 
            if(i == 63){break;}
            query += ","
        }
        query += ")"
        cout(query)

        let retArrays = await this.dbp
            .select('SELECT * FROM dataset WHERE ex_id IN ' + query)
            .then((x) => {[X, y, ids] = this.getArrays(x)})

        await retArrays;

        return([X, y, ids]);
    }
}
