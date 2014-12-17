exports.schema = {
    name: {
        first: String,
        last: String
    },
    age: Number,
    id: String
};

exports.virtuals = {
    'name.full': {
        get: function () {
            return this.name.first + ' ' + this.name.last;
        },
        set: function (fullName) {
            if (fullName.indexOf(' ') !== -1) {
                var segments = fullName.split(' '),
                    first = segments[0],
                    last = segments[1];
                this.name.first = first;
                this.name.last = last;
            } else {
                this.name.first = fullName;
                this.name.last = '';
            }
        }
    }
};

exports.methods = {
    speak: function () {
        console.log("My name is %s and I am %s years old.", this.name.full, this.age);
    }
};


