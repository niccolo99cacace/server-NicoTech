const mongoose = require("mongoose");

const reviewItemSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  },
});

const itemSchema = mongoose.Schema({
  name: {
    type: String,
    //trim:true --> rimozione degli spazi vuoti iniziali e finali quando viene salvato nel database 
    trim: true,
    required: true,
  },
   brand: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  largeDescription:{
    type: String,
    trim: true,
    required: false,
  },
  category: {
    type: String,
    trim: true,
    required: true,
  },
  price: {
    type: Number,
    trim: true,
    required: true
},
availability:{
    type: Number,
    integer: true,
    trim: true,
    required: true
  },
  imageUrl: {
    type: [String],
    trim: true,
    required: true
  },
  reviews: {
    type:[reviewItemSchema],
    default:[],
  },


});


module.exports = mongoose.model("Item", itemSchema);
