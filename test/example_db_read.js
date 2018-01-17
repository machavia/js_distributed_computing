DataSource = require(__dirname + '/../models/DataSource')

DataSource = require('./../models/DataSource')

ds = new DataSource.DataSource()

async function twoEpochs(){
    while(ds.epoch < 2){
        row = ds.next()
        let lest = await row
            .then((x) => {
                if(x == null){
                    console.log("_______________________________");
                    return(0);
                }
                let [X, y, ids] = x;
                // console.log(X, y, ids);
                m = new Map();
                for(let curr_y of y){
                    let val = 1;
                    if(m.has(curr_y)){
                        val += m.get(curr_y)   
                    }
                    m.set(curr_y, val)
                }
                a = new Array();
                for(let i=0; i < X.length; i++){
                    a.push(X[i].length);
                }
                // console.log("a:", a);
                console.log("targets count:", m);
                console.log("X length:", X.length);
                console.log("ids length:", ids.length);
                console.log("epoch:", ds.epoch);
            })
            .then(() => {console.log(ds.target2Ids.get(0).slice(0, 5))})
            .then(() => {console.log('OOK')})

        console.log("===>", ds.epoch)

        await lest;
    }
}

twoEpochs();

function noPromisesProto(){
    
    /*
    let targetsAvailable = {};
    let ds.target2Ids = new Map();
    */

    function pipeline_shift(pipeline){
        func = pipeline.shift()
        if(func != undefined){
            func(pipeline)
        }
    }

    function pipeTargetsAvailable(pipeline){
        ds.dataBase
            .select(
                'SELECT DISTINCT target FROM ids',
                (x) => {
                    targetsAvailable = x;
                    console.log(targetsAvailable);
                    pipeline_shift(pipeline)
                }
            );
        return(0)
    }

    function pipeTarget2Ids(pipeline){
        ds.dataBase
            .select(
                'SELECT DISTINCT target, ex_id FROM ids',
                (x) => {
                    ds.target2Ids = x;
                    console.log(ds.target2Ids);
                    pipeline_shift(pipeline)
                }
            );
        return(0)
    }

    pipeTargetsAvailable([
        pipeTarget2Ids
    ]);

}
