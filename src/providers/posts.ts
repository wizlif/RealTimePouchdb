import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import PouchDB from 'pouchdb';
import 'rxjs';

@Injectable()
export class Posts {

  db: any;
  remote: string = 'http://127.0.0.1:5984/ezyextension';
  data = [];

  constructor() {
    window["PouchDB"] = PouchDB;//Debugging clear before production release build

    this.db = new PouchDB('couchblog');

    // this.db.put({
    //
    //   _id:'_design/app',
    //   views:
    // {
    //   "inputs"
    // :
    //   {
    //     "map"
    //   :
    //     "function(doc) {\n    if(doc.type==='input' || doc.type==='our_crops'){\n  emit(doc._id, doc);\n    }\n}"
    //   }
    // }})

    let options = {
      live: true,
      retry: true,
      continuous: true
    };

    this.db.replicate.from(this.remote, options);

  }

  getPosts() {

    return new Promise(resolve => {
      this.db.query('app/inputs').then(res => {
        this.data = [];

        res.rows.map(row => {
          this.data.push(row.value);
        });

        resolve(this.data) ;

        this.db.changes({live: true, since: 'now', include_docs: true,filter:'_view',view:'app/inputs'}).on('change', (change) => {
          this.handleChange(change);
        });

      }).catch(err => {
        // console.log(err);
      });
    }).catch((error) => {

      console.log(error);

    });
  }

  // getPosts(): Observable<any> {
  //
  //   return Observable.fromPromise(this.db.query('app/inputs').then(res=>{
  //
  //   let data=[];
  //     res.rows.map(row => {
  //      data.push(row.value);
  //     });
  //
  //     this.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
  //       data=this.handleChange(change,data);
  //     });
  //
  //     return data;
  //   }).catch(err=>{
  //     // console.log(err);
  //   }));
  // }

  handleChange(change) {

    let changedDoc = null;
    let changedIndex = null;

    this.data.forEach((doc, index) => {

      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }

    });

    //A document was deleted
    if (change.deleted) {
      this.data.splice(changedIndex, 1);
    }
    else {

      //A document was updated
      if (changedDoc) {
        this.data[changedIndex] = change.doc;
      }

      //A document was added
      else {
        this.data.push(change.doc);
      }

    }
    console.log('change' + change.doc.crop);
    // return data;

  }

}
