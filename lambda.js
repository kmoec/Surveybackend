'use strict';

console.log('Loading function');

const doc = require('dynamodb-doc');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const dynamo = new doc.DynamoDB();


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {

    const getRequestDone = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message :  res.Body.toString('utf-8'), //JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Charset': 'utf-8',
            "Access-Control-Allow-Origin": "*", //For dev purpose
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        },
    });
    
    const postRequestDone = (err, res) => callback(null, {
        statusCode: err ? err : '200',
        body: err ? err :  "Success",
        headers: {
            'Content-Type': 'application/json',
            'Charset': 'utf-8',
            "Access-Control-Allow-Origin": "*", //For dev purpose
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        },
    });
    
    
    // Handle save to Dynamodb
    const save = (data) => {
        
        var surveyData = {
            "TableName": "food_culture_survey_data",
            "Item": {
                "uuid": data.uuid,
                "date": data.date,
                "questions": data.user_response
            }
        };
        

        
       dynamo.putItem(surveyData, postRequestDone);
       
        
    } 
   console.log("the save function is called :   " + JSON.stringify(event));    
    
    switch (event.httpMethod) {
        case 'DELETE':
            //dynamo.deleteItem(JSON.parse(event.body), done);
            break;
        case 'GET':
            //dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            var params = {Bucket: 'food-culture-survey', Key: 'surveyQuestion.json'};
            
            s3.getObject(params, getRequestDone);
            break;
        case 'POST':
            //dynamo.putItem(JSON.parse(event.body), done);
            save(JSON.parse(event.body));
            break;
        case 'PUT':
            //dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
