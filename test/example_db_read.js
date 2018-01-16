DataSource = require(__dirname + '/../models/DataSource')

DataSource = require('./../models/DataSource')

ds = new DataSource.DataSource()
row = ds.next()

row
    .then((x) => console.log(x))
    .then(() => console.log('OOK'))

// in here we re-create feeder except we take a 1:1 ratio of positives
// negatives (we assume a 0-1 target)
{
    
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

    /*
    pipeTargetsAvailable([
        pipeTarget2Ids
    ]);
    */

}
