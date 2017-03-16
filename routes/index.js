var express = require('express');
var MongoClient=require('mongodb').MongoClient;
var dbStr='mongodb://localhost:27017/notebook';
var router = express.Router();
var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/getNoteBookList',function(req,res){
  MongoClient.connect(dbStr,function(err,db){
    db.collections(function(err,collections){
      collections=collections.map((collection)=>{
        var nco={};
        nco.name=collection.collectionName;
        return nco;
      })
      res.send(collections);
    });
  });
});
router.post('/getNoteList',function(req,res){
  MongoClient.connect(dbStr,function(err,db){
      if(req.body.notebookname=="")
      {
         res.send("{}");
         return;
      }
     var collection=db.collection(req.body.notebookname);
      collection.find().toArray(function(err,docs){
      docs.map((doc)=>{doc.context=null;return doc})
      res.send(docs);});
  });
});
router.post('/getNote',function(req,res){
  MongoClient.connect(dbStr,function(err,db){
    console.log("get:::::"+JSON.stringify(req.body));
    var collection=db.collection(req.body.notebookname);
      collection.findOne({id:req.body.id}, function(err, doc) {
        if(err!=null)
        {
          res.send("err");
        }
        else
        {
          console.log("给你:"+JSON.stringify(doc))
          res.send(JSON.stringify(doc));
        }
      db.close();
    });
  });
});
router.post('/addNoteBook',function(req,res){
  MongoClient.connect(dbStr,function(err,db){

    if(req.body.notebookname!=null)
      db.createCollection(req.body.notebookname.toString());
      res.send('ok');
    })
  });
router.post('/DeleteNoteBook',function(req,res){
  MongoClient.connect(dbStr,function(err,db){
    console.log(req.body.notebookname)
    if(req.body.notebookname!=null)
      var collection = db.collection(req.body.notebookname.toString());
      collection.drop(()=>{
        res.send('ok');
      })
    })
  });
router.post('/addNote',function(req,res){
  MongoClient.connect(dbStr,function(err,db){
    console.log("add:::::"+JSON.stringify(req.body));
     if(req.body.notebookname==null) return res.send("err");
    var collection=db.collection(req.body.notebookname);
    var note={};

    note.id=req.body.id.toString();
    collection.insertOne(note)
    .then(()=>{
      res.send("ok")
    })
  })
});
router.post('/deleteNote',function(req,res){
  MongoClient.connect(dbStr,function(err,db){
    console.log("delete:::::"+JSON.stringify(req.body));
    var collection=db.collection(req.body.notebookname);
      collection.deleteOne({id:req.body.id}, function(err, doc) {
        if(err!=null)
        {
          res.send("err");
        }
        else
        {
          res.send("ok");
        }
      db.close();
    });
  });
});
router.post('/updateNote',function(req,res){
  MongoClient.connect(dbStr,function(err,db){
    console.log("update::::"+req.body.note)
    note=JSON.parse(req.body.note);
    MongoClient.connect(dbStr,function(err,db){
    var collection=db.collection(req.body.notebookname);
    collection.updateOne({id:note.id}, {$set:note})
    .then(()=>{
      res.send("ok");
    })
  });
  })
});

module.exports = router;
