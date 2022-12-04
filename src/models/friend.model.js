const mongoose = require('mongoose');

const friendSchema = mongoose.Schema(
  {
    personRequest: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
    },
    personReceive: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
    },
    message: [
      {
        from: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Users',
        },
        content: String,
        timeSend:{
            type:mongoose.SchemaTypes.Date,
            default:new Date()
        }
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Friends', friendSchema);
