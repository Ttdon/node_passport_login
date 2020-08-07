var mongoose=require('mongoose');

var socialSchema=mongoose.Schema({

    facebook   :{
        id      :String,
        token    :String,
        name     :String,
        email    :String
    },
    google      :{
        id      :String,
        token    :String,
        name     :String,
        email    :String
    }

});

module.export=mongoose.model('SocialUser',socialSchema);