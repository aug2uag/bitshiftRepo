//
//  ArtAndLogicPart2.js
//
//  Created by R Fatahi on 9/20/13.
//  Copyright (c) 2013 aug2uag. All rights reserved.
//

// [sf01] loDash library 
// [nr01] loDash library, docs available at http://lodash.com/docs
var _ = require('lodash');
// [nr02] aggregator for doc.x position of MV
var xAgg = 0;
// [nr03] aggregator for doc.y position of MV
var yAgg = 0;
// [nr04] aggregator of position coordinates as arrays for output parsing logic
var dArr = [];
// [nr05] output mutable string
var fVal = '';
// [nr06] reference to self during function scope
var self = this;
// [nr07] input value; value to be evaluated for output
var input = process.argv[2];
// [cg01] check if input is valid
if (input.length%2 !== 0) return console.log('invalid input');
// [nr08] input organized of array of 2 characters, used to parse in switch statement below
var splitInput = input.match(/.{2}/g);
// [nr09] decrypt function, parameter is 4 characters as 2 hexadecimal values input as string
function decrypt(input) {
    // [nr10] first 2 characters as hiVal, 2 characters converted to hexadecimal integer
    // [nr11] last 2 characters are loVal, 2 characters converted to hexadecimal integer
    var hiVal = parseInt(input.slice(0,2), /* radix set to 16 to convert string to hex integer */ 16),
        loVal = parseInt(input.slice(2,4), /* radix set to 16 to convert string to hex integer */ 16);
    // [nr12] decryption logic variables, hiVal as 7 bit masked value that is de-masked, values combined, & offset (8192) removed
    var shiftedHi = hiVal << 7,
        shiftedLo = loVal,
        intermVal = (shiftedHi | shiftedLo),
        finaleVal = intermVal - 8192;
    // [fmt01] function returns decrypted value
    return finaleVal;
}
// [nr13] function (1/3) for MV logic, called from switch in case of 'MV', input is unformatted
function movePosition(input) {
    // [fmt02] MV logic assigns state machine "is currently out of bounds?"
    this.outOfBounds = false;
    // [nr14] accumulator to deformat organized array of 2 chars, and later organize as array of 4 chars with 'MV' command removed
    var acc = '';
    // [cg02] iterate values, if not 'MV' command add to accumulator as string of unseparated chars
    _.forEach(x, function(elem, idx) {
        if (idx !== 0) acc += elem;
    });
    // [fmt03] [cg03] organize coordinate values as array of 4 char objects
    acc = acc.match(/.{4}/g);
    // [fmt04] [cg04] adjust data source of MV coordinates relative to movements using xAgg ([nr02]) and yAgg ([nr03])
    acc = _.map(acc, function(elem, idx) {
        var decrypted = decrypt(elem);
        if (idx%2 == 0) {
            xAgg += decrypted;
            return xAgg;
        } else {
            yAgg += decrypted;
            return yAgg;
        }
    });
    // [nr15] two-dimensional array of d.x and d.y values per array object within array
    var multiArr = [], tempArr;
    for (var i = 0; i < acc.length; i++) {
        // [cg05] if %2 == 0, it is first item, and array should be empty
        if (i%2 === 0) {
            tempArr = [];
        };
        // [cg06] add object to inner array (i.e. eventually to be added to outer array)
        tempArr.push(acc[i]);
        if (i%2 !== 0) {
            // [cg07] if %2 != 0, we are at index 1 of inner array, therefore, d.x and d.y are both present, and add to outer array
            multiArr.push(tempArr);
        };
    };
    // [cg08] [fmt05] format of parsing logic business end, iterate outer array
    for (var i = 0; i < multiArr.length; i++) {
        // [nr16] truthy value 'is value beyond bounds?' used below
        var truthy = true;
        // [cg09] iterate inner array, contains d.x and d.y values of one movement action/direction
        for (var j = 0; j < multiArr[i].length; j++) {
            // [cg10] if value of inner array is 'out of bounds', not truthy
            if (multiArr[i][j] > 8191 || multiArr[i][j] < -8192) {
                truthy = false;
            } 
        };
        // [cg11] if previously 'out of bounds', handle with continueOutOfBounds function
        if (this.outOfBounds) {
            continueOutOfBounds(multiArr, i);
        };
        // [cg12] if not truthy ([cg10]), handle with next sequence of MV logic given we are not out of sequence via current state (!this.outOfBounds)
        if (!truthy && !this.outOfBounds) {
            triangleWithin(multiArr[i])
        };
        // [cg13] if d.x and d.y are both within bounds, add them to accumulator array as-is
        if (truthy) {
            dArr.push(multiArr[i]);
        };
    };
    // [fmt05] depending on state of PEN, handle MV logic
    if (self.penState === 'down') {
        // [cg14] if PEN state == 'down', start parsing with temporary string accumulator 'temp'
        // [nr16] temp is temporary string accumulator for MV logic of 'PEN DOWN;' state
        var temp = 'MV ';
        // [nr17] tempVar is mini state machine within if clause PEN state ([fmt05] && [cg14])
        var tempVar;
        // [cg15] iterate accumulator array of movement locations
        for (var i = 0; i < dArr.length; i++) {
            // [fmt06] presence of '*' indicates item was 'out of bounds', and requires PEN state = !PEN state with string manipulation
            if (dArr[i].indexOf('*') > -1) {
                if (!tempVar || tempVar == 'down') {
                    temp += '(' + dArr[i][0] + ', ' + dArr[i][1] + ');\nPEN UP;\nMV ';
                    tempVar = 'up';
                } else {
                    temp += '(' + dArr[i][0] + ', ' + dArr[i][1] + ');\nPEN DOWN;\nMV ';
                    tempVar = 'down';
                }
            } else {
                temp += '(' + dArr[i][0] + ', ' + dArr[i][1] + ') '
            }
        };
        // [fmt07] remove last whitespace, replace with ';' in string accumulator
        temp = temp.substring(0, temp.length - 1);
        temp += ';\n';
        // [cg16] [fmt08] add string accumulator to output mutable string ([nr05])
        fVal += temp;
        // [cg17] reset accumulator array of movements, prepare for next iteration of MV
        dArr = [];
    } else {
        // [fmt08] if 'PEN UP;' we should add final movement of acculumated movements array
        var finalArr = dArr[dArr.length - 1];
        // [cg18] add value from above ([fmt08]) to output mutable string
        fVal += 'MV (' + finalArr[0] + ', ' + finalArr[1] + ');\n';
        // [cg17] reset accumulator array of movements, prepare for next iteration of MV
        dArr = [];
    }
    
}
// [nr18] function (2/3) for MV logic, calculates triangle within triangle to find values of clipping at edge of size (-8192, 8191)
function triangleWithin(input) {
    // [cg19] temporary accumulator to add new calculated movement values to array accumulator of movements ([nr04])
    var newArr = [];
    // [fmt09] case for x, case for y: analogous so only x will be commented
    if ((input[0] > 8191 || input[0] < -8192) && input[1] <= 8191 && input[1] >= -8192) {
        // [nr19] keep track if limit is 8191 or -8192
        // [fmt10] newArr push to index 0 is for d.x
        var valDelta;
        if (input[0] > 8191 ) {
            newArr.push(8191);
            valDelta = 8191;
        } else {
            newArr.push(-8192);
            valDelta = -8192;
        }
        // [nr20] variables used to calculate line interesect and/or triangle in triangle
        var xCoord = input[0];
        var yCoord = input[1];
        var xLngth = xCoord - xAgg;
        var yLngth = yCoord - yAgg;
        var xDelta = xCoord - valDelta;
        // [cg20] change in y must be > 0 AND xLngth cannot be 0 to calculate value, else add original value
        // [fmt11] newArr push to index 1 is for d.y
        if (yAgg !== 0 && xLngth !== 0) {
            newArr.push(Math.round(((xDelta * yLngth)/xLngth) + yCoord)); 
        } else {
            newArr.push(yCoord);
        }
        // [fmt12] '*' indicates value went out of bounds, alternative is to use hash {val:Array, outOfBounds:Boolean}
        newArr.push('*');
    } else if ((input[1] > 8191 || input[1] < -8192) && input[0] <= 8191 && input[0] >= -8192) {
        var valDelta;
        if (input[1] > 8191 ) {
            valDelta = 8191;
        } else {
            valDelta = -8192;
        }
        var xCoord = input[0];
        var yCoord = input[1];
        var xLngth = xCoord - xAgg;
        var yLngth = yCoord - yAgg;
        var yDelta = yCoord - valDelta;
        if (xAgg !== 0) {
            newArr.push(Math.round(((yDelta * xLngth)/yLngth) + xCoord));
        } else {
            newArr.push(xCoord);
        }
        if (valDelta > 8191 ) {
            newArr.push(8191);
        } else {
            newArr.push(-8192);
        }
        newArr.push('*');
    } else {
        // [cg21] case where both d.x and d.y are out of bounds, assigns special state 'bothOutOfBounds' ** untested **
        if (this.bothOutOfBounds) return;
        if (input[0] > 8191 ) {
            newArr.push(8191);
        } 
        if (input[0] < -8192) {
            newArr.push(-8192);
        }
        if (input[1] > 8191 ) {
            newArr.push(8191);
        } 
        if (input[1] < -8192) {
            newArr.push(-8192);
        }
        newArr.push('*');
        return this.bothOutOfBounds = true;
    }
    // [fmt13] add temporary accumulator to array accumulator (two-dimensional array)
    dArr.push(newArr);
    return this.outOfBounds = true;
}
// [nr21] function (3/3) for MV logic, calculates re-entry in to bounds of previous out of bounds movement
// [fmt14] dependent on state machine ([fmt02]), must be 'outOfBounds == true' ([cg11])
function continueOutOfBounds(input, index) {
    // [cg22] temporary accumulator, function similar to 'triangleWithin' ([nr18]), however returns null if no offset in y for d.x or x for d.y
    var newArr = [];
    var lastVal = dArr[dArr.length - 1];
    if (!this.bothOutOfBounds && index > 0 && (lastVal[0] === 8191 || lastVal[0] === -8192)) {
        var lastCoord = input[index - 1];
        var currCoord = input[index];
        var lastXCoord = lastCoord[0];
        var currXCoord = currCoord[0];
        var lastYCoord = lastCoord[1];
        var currYCoord = currCoord[1];
        var diffXCoord = Math.abs(lastXCoord - currXCoord);
        var diffYCoord = Math.abs(lastYCoord - currYCoord);
        var diffLastX = Math.abs(lastVal[0] - diffXCoord);
        if (diffXCoord === 0) return;
        newArr.push(lastVal[0]);
        newArr.push(Math.round(((diffYCoord * diffLastX)/diffXCoord) + currYCoord));
        dArr.push(newArr);
        newArr.push('*');
        return this.outOfBounds = false;
    };
    if (!this.bothOutOfBounds && index > 0 && (lastVal[1] === 8191 || lastVal[1] === -8192)) {
        var lastCoord = input[index - 1];
        var currCoord = input[index];
        var lastXCoord = lastCoord[0];
        var currXCoord = currCoord[0];
        var lastYCoord = lastCoord[1];
        var currYCoord = currCoord[1];
        var diffXCoord = Math.abs(lastXCoord - currXCoord);
        var diffYCoord = Math.abs(lastYCoord - currYCoord);
        var diffLastY = Math.abs(lastVal[1] - diffYCoord);
        if (diffYCoord === 0) return;
        newArr.push(Math.round(((diffXCoord * diffLastY)/diffYCoord) + currXCoord));
        newArr.push(lastVal[1]);
        dArr.push(newArr);
        newArr.push('*');
        return this.outOfBounds = false;
    };
    if (this.bothOutOfBounds) {
        // [cg23] if both d.x and d.y are out of bounds, ** currently no action **
        return this.bothOutOfBounds = false;
    };
}
// [fmt14] start of parsing, 'splitInput' is shortened via 'splice' method, returns comment if invalid value
while (splitInput.length > 0) {
    // [fmt15] always look at first item in array, first item is always 2 chars
    switch (splitInput[0]) {
        // [cg24] handle CLR
        case 'F0':
            splitInput.splice(0, 1);
            xAgg = 0;
            yAgg = 0;
            fVal += 'CLR;\n';
            break;
        // [cg25] handle CO
        case 'A0':
            var x = splitInput.splice(0, 9);
            x.splice(0,1);
            // [fmt16] RGBA handled as 16 chars split as 4 char objects to be decrypted
            x = x.join('').match(/.{4}/g);
            var temp = '';
            for (var i = 0; i < x.length; i++) {
                temp += decrypt(x[i]) + ' ';
            };
            temp = temp.substring(0, temp.length - 1);
            if (temp.split(' ').length === 4) {
                fVal += 'CO ' + temp + ';\n';
            };
            break;
        // [cg26] handle PEN
        case '80':
            var x = splitInput.splice(0, 3);
            x.splice(0,1);
            // [cg27] assign state of PEN
            if (decrypt(x.join('')) !== 0) {
                fVal += 'PEN DOWN;\n'
                this.penState = 'down';
            } else {
                fVal += 'PEN UP;\n';
                this.penState = 'up';
            }
            break;
        // [cg28] handle MV
        case 'C0':
            // [cg29] initial splitce
            var x = splitInput.splice(0, 5);
            // [cg30] continue splice until reach next accepted command (F0, A0, 80, C0)
            if (splitInput[0] && (splitInput[0] !== 'F0' && splitInput[0] !== 'A0' && splitInput[0] !== '80' && splitInput[0] !== 'C0')) {
                var truthy = true;
                while (truthy) {
                    x += splitInput.splice(0, 4);
                    if (!splitInput[0] || splitInput[0] === 'F0' || splitInput[0] === 'A0' || splitInput[0] === '80' || splitInput[0] === 'C0') {
                        x = x.split(',');
                        truthy = false;
                    }
                }
            };
            // [cg31] initiate MV logic
            movePosition(x);
            break;
        // [cg32] if not valid console log and exit program
        default:
            return console.log('invalid input, program stopping');
            break;
    }
};
// [fmt15] announce function completed successfully
console.log('\n*********************************************************\n* program completed, results will appear in 1.5 seconds *\n*********************************************************\n');
// [fmt16] display results on screen
setTimeout(function() {
    console.log(fVal);
}, 1500);