import Post from '../Models/Post'
import { observable, action } from 'mobx'

class PostController {
    @observable 
    submitted = false;

    @action
    setValue(data){
        if(data != null){
            this.submitted = data;
        }
    }
}
export default new PostController();