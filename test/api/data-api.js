var exec = require('child_process').exec,
    assert = require('assert');

describe('Data API', function() {

    var aData, bData;

    before(function (done) {
        exec('curl 0.0.0.0:3001/api/a_unadorned_mongoose',
            function (error, stdout) {
                if (error) {throw new Error('curl a failed')}
                aData = JSON.parse(stdout);
                exec('curl 0.0.0.0:3001/api/b_using_options',
                    function (error, stdout) {
                        if (error) {throw new Error('curl b failed')}
                        bData = JSON.parse(stdout);
                        done();
                    });
            });
    });

    it('should send the right number of records', function() {
        assert.equal(aData.length,2);
    });

    it('should send the all the fields of mongoose schema', function() {
        assert(aData[0].surname,'must send surname');
        assert(aData[0].forename,'must send forename');
        assert(aData[0].weight,'must send weight');
        assert(aData[0].eyeColour,'must send eyeColour');
        assert(aData[0].dateOfBirth,'must send dob');
        assert.equal(aData[0].accepted,false,'must send accepted');
    });

    it('should filter out records that do not match the find func', function() {
        assert.equal(bData.length,1);
    });

    it('should not send secure fields of a modified schema', function() {
        assert(bData[0].surname,"Must send surname");
        assert(bData[0].forename, "Must send forename");
        assert.equal(Object.keys(bData[0]).indexOf('login'),-1,'Must not send secure login field');
        assert.equal(Object.keys(bData[0]).indexOf('passwordHash'), -1, 'Must not send secure password hash field');
        assert(bData[0].email, "Must send email");
        assert(bData[0].weight, "Must send weight");
        assert(bData[0].accepted, "Must send accepted");
        assert(bData[0].interviewScore, 'Must send interview score');
        assert(bData[0].freeText, 'Must send freetext');
    });

    it('should not send secure fields of a modified subschema', function() {
        assert(bData[0].address.line1, "Must send line1");
        assert(bData[0].address.town, "Must send town");
        assert(bData[0].address.postcode, "Must send postcode");
        assert.equal(Object.keys(bData[0]).indexOf('address.surveillance'), -1, 'Must not send secure surveillance field');
    })
});

