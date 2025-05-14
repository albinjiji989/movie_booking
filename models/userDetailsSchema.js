const userDetailsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  phone: { 
    type: String, 
    required: true, 
    match: /^[6-9]\d{9}$/, 
    index: true 
  },
  gender: { 
    type: String, 
    required: true, 
    enum: ['male', 'female', 'other'] 
  },
  dob: {
    type: Date,
    required: function() {
      // Only require dob for non-admins
      return this.role !== 'admin';
    },
    validate: {
      validator: function (value) {
        if (!value) return true; // If no DOB provided for admin, skip validation
        const today = new Date();
        const age = today.getFullYear() - new Date(value).getFullYear();
        return age >= 13 && age <= 100;
      },
      message: 'User must be between 13 and 100 years old.'
    }
  },

  securityQuestion: {
    type: String,
    validate: {
      validator: function(value) {
        // If the user is an admin, security question is not required
        return this.role !== 'admin' || (value && value.length >= 10);
      },
      message: 'Security question must be at least 10 characters if provided'
    }
  },
  securityQuestionAnswer: {
    type: String,
    validate: {
      validator: function(value) {
        // If the user is an admin, security question answer is not required
        return this.role !== 'admin' || (value && value.length >= 3);
      },
      message: 'Security question answer must be at least 3 characters if provided'
    }
  },
  lastLogin: { 
    type: Date 
  },
  loginHistory: [{
    loginAt: { 
      type: Date 
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('UserDetails', userDetailsSchema);
