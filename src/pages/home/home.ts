import { Component} from '@angular/core';
import { Posts } from '../../providers/posts';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  posts: any;

  constructor(public navCtrl: NavController, public postsService: Posts) {
    this.postsService.getPosts().then((posts) => {
      this.posts=posts;
      console.log(posts);
    });
  }

  ionViewDidLoad(){



  }

}
