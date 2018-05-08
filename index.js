const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
var exec = require('child_process').exec;
const fs = require("fs");
var formidable = require('formidable');

var app = express()
  .use("/libs", express.static(path.join(__dirname, 'libs')))

  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  /*********** API  **********/
  .get('/api/topics/list', getTopicsList)
  .get('/api/topics/:topic/questions', (req, res) => {
    var topic = req.params.topic;
    var isRandom = req.query.isRandom;
    var questionsCount = req.query.count;
    console.log("Safaaaaa", topic)
    let jsonTopicQuestions = fs.readFileSync(__dirname + `/questions/${topic}.json`, "utf-8");
    res.json(jsonTopicQuestions);
    //.slice(0, 20));

  })
.use(express.static("."))

  /*************** PAGES ************/
  .get('/', (req, res) => res.render('pages/index'))
  .get('/questions', (req, res) => res.render('pages/questions'))
  .get('/questions/:topic', (req, res) => res.render('pages/questions'))
  .post('/createNewOntology', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var ontologyPath = __dirname + "/ontologies/" + files.filetoupload.name;
      fs.rename(oldpath, ontologyPath, function (err) {
        if (err) throw err;
        let questionsPath = __dirname + "/questions/";
        let jarPath = __dirname + "/ont.jar";
        exec(`java -jar  ${jarPath} ${ontologyPath} ${questionsPath} ${fields.topic}.json`, (err, out, stdErr) => {
          if (stdErr) {
            // res.json(JSON.stringify(stdErr));
            res.redirect('back');

          } else {
            res.send("done");
          }
        }
        );

        // res
        //    res.render('pages/questions');
      });
    });
    let ontologyFile = req.body;
    var newFilePath = "/Users/mohammadomar/Downloads/oo.owl";// __dirname + "/temp";
    // fs.writeFileSync(newFilePath, ontologyFile);
    //res.render('pages/questions');
    //get('/questions', (req, res) => res.render('pages/questions'));

  })
  /****** LISTEN *******/
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


//////////// Implementations 


function getTopicsList(req, res) {
  let topicsFileNames = fs.readdirSync(__dirname + "/questions");
  let response = topicsFileNames.map(fileName => fileName.replace('.json', ""));
  res.json(response);
}




