const functions = require('firebase-functions');
var admin = require('firebase-admin');
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
    // ...
};

// Initialize Firebase
admin.initializeApp(firebaseConfig);
var firestore = admin.firestore();

exports.webhook = functions.https.onRequest((request, response) => {
    console.log("request.body.queryResult.parameters: ", request.body.queryResult.parameters);
    let params = request.body.queryResult.parameters;

    switch (request.body.queryResult.intent.displayName) {

        case 'Book hotel':

            firestore.collection('orders')
                .add(params)
                .then(() => {
                    return response.send({
                        fulfillmentText:
                            `${params.name} your hotel booking request for ${params.rtype} room is forwarded for ${params.persons} persons, we will contact you on ${params.email} soon`
                    });
                })
                .catch(e => {
                    console.log("database error", e);
                    response.send({
                        fulfillmentText:
                            "problem writing to DB"
                    })
                })


            break;

            case 'Show all bookings - yes':

                    firestore.collection('orders').get()
                        .then((querySnapshot) => {
                            var orders = [];
                            querySnapshot.forEach((doc) => { orders.push(doc.data()) });
        
                            var speech = `you have ${orders.length} orders \n`;
        
                            orders.forEach((eachOrder, index) => {
                                speech += `number ${index + 1} is ${eachOrder.persons} persons, ordered by ${eachOrder.name}\n`
                            })
                            return response.send({
                                fulfillmentText: speech
                            });
        
                        })
                        .catch((err) => {
                            console.log('Error reading data', err);
                            response.send({
                                fulfillmentText: "something went wrong reading data from DB"
                            })
        
                        })
                        break;
            case 'Show all bookings':

                    firestore.collection('orders').get()
                        .then((querySnapshot) => {
                        var orders = [];
                        querySnapshot.forEach((doc) => { orders.push(doc.data()) });
                
                        var speech = `you have ${orders.length} orders. Would you like to see details? \n`;
                
                        return response.send({
                            fulfillmentText: speech
                            });
                
                        })
                        .catch((err) => {
                            console.log('Error reading data', err);
                            response.send({
                                    fulfillmentText: "something went wrong reading data from DB"
                            })
                
                        })
            break;
        default:
            response.send({
                fulfillmentText: "no action matched in webhook"
            });
            break;
    }

})

