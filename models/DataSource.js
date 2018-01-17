const Database = require(__dirname + "/Database");

const cout = console.log

exports.DataSource = class {

    /*
     * Disclaimer: Assumes that all ids contained in db do fit in memory
     */

	constructor(path, batchSize=64) {
        this.buff = undefined;

        this.targetsAvailable = {};
        this.target2Ids = new Map(); 
        this.target2IdTaken = new Map();
        this.epoch = 0;
        this.batchSize = batchSize;
		this.dataBase = new Database.Database('example.db');
		this.dbp = new Database.DatabasePromise('example.db');

        this.prepare_list = this.dbp
            .select('SELECT DISTINCT target FROM ids')
            .then((x) => {this.targetsAvailable = x;})
            .then(() => {
                return(this.dbp.select('SELECT target, ex_id FROM ids'))
            })
            .then(
                (x) => {
                    for(let row of x){
                        let target = row.target;
                        let ex_id = row.ex_id;
                        if(! this.target2Ids.has(target)){
                            this.target2IdTaken.set(target, 0);
                            this.target2Ids.set(target, new Array());
                        }
                        this.target2Ids.get(target).push(ex_id);
                    }
                }
            )
            .then(() => {this.shuffleIds();});

	}

    resetCounters() {
        // reset where we are at in each target's array of indices
        for(let target of this.target2IdTaken.keys()){
            this.target2IdTaken.set(target, 0);
        }
    }

    shuffleIds(){
        // shuffle arrays of indices for each target so that we do not take
        // examples in the same order accross epochs
        for(let target of this.target2Ids.keys()){
            let array = this.target2Ids.get(target);
            let counter = array.length;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                let index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                let temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }
        }
    }

    getArrays(dbReturn){
        /* from the return of a database (i.e. array of row objects)
         * extract three items:
         *  - an array of arrays X (three layers: batch, sequence, steps)
         *  - an array of scalars y
         *  - an array of strings ids
         */
        let X = new Array();
        let y = new Array();
        let ids = new Array();
        let last_id = undefined;

        for(let row of dbReturn){
            let curr_id = row.ex_id;
            let curr_y = row.target;
            if(curr_id != last_id){
                // add a sequence
                X.push(new Array());
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
        /* Get next minibatch and epoch
        * returns: a tupe (X, y, ids) or null if end of epoch
        *   (next call will return (X, y, ids)).
        *
        * Disclaimers:
        * To avoid unexpected behaviors you should ensure that previous call
        * ended before doing another one.
        * For now, just your basic equilibrated batch, roughly same qtty for
        * each label.
        * Won't work if you have more labels than items in your batch.
        * */
        let X, y, ids;

        await this.prepare_list;  // need to have infos completed

        let remainingInBatch = this.batchSize;
        let targetsTodo = this.target2Ids.size;

        // now loop over eack key take a certain number (what remains / todo)
        let epochEnd = false;
        let query = '(';
        for(let target of this.target2Ids.keys()){
            let currTargetIds = this.target2Ids.get(target);
            let toTake = Math.round(remainingInBatch / targetsTodo);
            // check if we still have what it takes to provide a batch
            let alreadyTaken = this.target2IdTaken.get(target);
            let availableForTarget = currTargetIds.length - alreadyTaken;
            if(availableForTarget < this.batchSize){
                epochEnd = true;
                this.epoch += 1;
                this.resetCounters();
                this.shuffleIds();
                break;
            }
            this.target2IdTaken
                .set(target, this.target2IdTaken.get(target) + toTake);
            remainingInBatch -= toTake;
            targetsTodo -= 1;
            let currIds = currTargetIds
                .slice(alreadyTaken, alreadyTaken + toTake);
            for(let [i, j] of currIds.entries()){
                query += '"' + j + '",' ;
            }
        }

        if(epochEnd){return(null);}

        query = query.slice(0, -1);
        query += ')';
        // cout(query);

        let retArrays = await this.dbp
            .select('SELECT * FROM dataset WHERE ex_id IN ' + query)
            .then((x) => {[X, y, ids] = this.getArrays(x)});

        await retArrays;

        return([X, y, ids]);
    }
}
