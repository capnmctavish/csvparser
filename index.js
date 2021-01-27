//Installing all required dependencies
const express = require("express"); 
const bp = require("body-parser");
const path = require('path');
const app = express();
var jsonQuery = require('json-query');
app.use(bp.urlencoded({ extended: true }));
//default file system module to read CSV file
var fs = require('fs').promises;

//CSV-PARSE library to parse the CSV values in rows or columns/ JSON object 
var parse = require('csv-parse/lib/sync');

//Assign port value
var PORT =  3001;

//Using EJS as HTML templating engine to render "TRIGGER FORM"
app.set("views", path.join(__dirname)) 
app.set("view engine", "ejs") 

//Localhost:3000/ route to render default home page with form
app.get('/',(req,res) => {

    //reading csv file and awating till reading file is finished using promise func
    (async function () {
        //store alert.csv file in variable 
        const fileContent = await fs.readFile(__dirname+'/alerts.csv');
        //parsing filecontent variable and storing JSON object in records variable
        const records = parse(fileContent, {columns : true});
        //console.log(records);

        //mapping of every column unique values and filtering/removing null or blank values and storing in variable
        var dpValues = records.map( (value) => value.DP_Name).filter( (value, index, _arr) => _arr.indexOf(value) == index);
        var stateValues = records.map( (value) => value.State).filter( (value, index, _arr) => _arr.indexOf(value) == index);
        var cityValues = records.map( (value) => value.City).filter( (value, index, _arr) => _arr.indexOf(value) == index);
        var verticalValues = records.map( (value) => value.Vertical).filter( (value, index, _arr) => _arr.indexOf(value) == index);
        var reachValues = records.map( (value) => value.Reach).filter( (value, index, _arr) => _arr.indexOf(value) == index);
        var edgeValues = records.map( (value) => value.EdgeID).filter( (value, index, _arr) => _arr.indexOf(value) == index);
          //dpValues.join('\n');  
    
    //storing all values in accecible json object 
    var docs = {
        EdgeId : edgeValues,
        States : stateValues,
        Vertical : verticalValues,
        Reach : reachValues,
        DpName: dpValues,
        City : cityValues
    };
    //Converting JSON to string before sending form data
    JSON.stringify(docs);
    
            //sending response data & form when user hits "/" route 
            res.render("alertform", 
                { 
                docs : docs
                } 
            ); 
    
    })();
    });

    //recieve form data on ledata link
    app.post('/ledata', (req, res) => {
            const EdgeId = req.body.Edge;
            const DpName = req.body.DP;
            const City = req.body.city;
            const State = req.body.state;
            const Vertical = req.body.vertical;
            const alertName = req.body.alertname; 
            const reviewP = req.body.rP; 
            const number =req.body.number;
            const thresh = req.body.thresh; 
            const stm = req.body.stm; 
            const operator = req.body.operator;
            
            // const formdata = {
            //     TemplateName : 'template',
            //     Edge : EdgeId,
            //     DP : DpName,
            //     City : City,
            //     State : State,
            //     Vertical : Vertical
                
            // };
         if (!EdgeId || EdgeId === "") {
             var queryname = 'dpname';
             var query = DpName;
         } else {
             var queryname = 'edgeid';
             var query = EdgeId;
         }
           
    //var temp = 'alert' + alertName + 'template : Template\n' +  $metric : stm + '(q('+ '\"avg:cpuUsage{edgeid=' + EdgeId + '}\",'+ number + reviewP + ',\"\"))\n' + {crit : "$metric"} +' '+ operator  + thresh + '\n' + 'critNotification = email' +  '\n';
      var hemp = ` alert = ${alertName} { 
        $metric = ${stm}(q("avg:cpuUsage{${queryname}=${query}}", ${number}${reviewP} , "" ))
        crit = $metric ${operator}${thresh} 
        critNotification = email
    } `;  
           //const cdata = JSON.stringify(temp);
           //var pdata = cdata.replace(/['"]+/g);

      

           fs.writeFile('./bosun.conf', hemp, (err) => {
            if (err) return console.log(err);
            console.log('some error');
            
        })
        console.log(req.body);
    });

    //Starting server on default port
    app.listen(PORT, function(error){ 
        if(error) throw error 
        console.log("Server created Successfully on PORT", PORT) 
    });
