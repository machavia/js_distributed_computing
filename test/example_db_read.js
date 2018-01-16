const DataSource = require(__dirname + '/../models/DataSource')

dataSource = new DataSource.DataSource()


// in here we re-create feeder except we take a 1:1 ratio of positives
// negatives (we assume a 0-1 target)
{
    /*
    let targetsAvailable = {};
    let targetsAvailablePromise;
    let target2Ids;
    
    function pipeline_shift(pipeline){
        func = pipeline.shift()
        if(func != undefined){
            func(pipeline)
        }
    }

    function pipeTargetsAvailable(pipeline){
        dataSource
            .dataBase
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
        dataSource
            .dataBase
            .select(
                'SELECT DISTINCT target, ex_id FROM ids',
                (x) => {
                    target2Ids = x;
                    console.log(target2Ids);
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

    console.log(dataSource.dataBasePromise)

    let targets = dataSource
        .dataBasePromise
        .select('SELECT DISTINCT target FROM ids')
        .then((x) => {console.log(x)});

    // targets.then((x) => {system.log(x)})
}
