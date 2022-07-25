if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'dev') {
    require('dotenv').config();
}
var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3500
const mercadopago = require('mercadopago');
const bodyParser = require('body-parser');

/* MP CONFIG */
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
    integrator_id: process.env.INTEGRATOR_ID,
});

var app = express();
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.post('/notifications', function (req, res, next) {
   
    console.log(req.body);

    let paymentId = req.body.data.id;
    if(paymentId){
        console.log("Id: "+ paymentId);
    }

    res.status(200).send({succes: 'ok'});
});

app.post('/payment_init', function(req, res){

    // Build preference

    let preference = {
        items: [{
            id: 1234,
            title: req.body.title,
            description: "Dispositivo móvil de Tienda e-commerce",
            picture_url: process.env.APP_URL.concat(req.body.img),
            quantity: 1,
            unit_price: Number(req.body.price),
            external_reference: process.env.INTEGRATOR_EMAIL,
        }],
        external_reference: process.env.INTEGRATOR_EMAIL,
        payer:{
            name: "Lalo",
            surname: "Landa",
            email: process.env.TEST_EMAIL,
            date_created: new Date().toISOString(),
            phone:{
                area_code: "11",
                number: 912312312,
            },
            address:{
                street_name: "Falsa",
                street_number: 123,
                zip_code: "1111",
            },
        },
        back_urls:{
            failure: `${process.env.APP_URL}/failure`,
            pending: `${process.env.APP_URL}/pending`,
            success: `${process.env.APP_URL}/aproved`
        },
        auto_return: "approved",
        notification_url: `${process.env.APP_URL}/notifications`,
        payment_methods: {
            excluded_payment_methods: [
                {
                id: "visa"
                }
            ],
            excluded_payment_types: [
               
            ],
            installments: 6,
        },
    };


    mercadopago.preferences.create(preference).then(function (response) {
       
            console.log(response);
            global.init_point = response.body.init_point;
            
            res.redirect(global.init_point);
        }).catch(function (error) {
            console.log(error);
        });
});

app.get('/failure', function (req, res) {
    res.render('feedback', req.query);
});
app.get('/pending', function (req, res) {
    res.render('feedback', req.query);
});
app.get('/aproved', function (req, res) {
    res.render('feedback', req.query);
});

app.listen(port, ()=>{console.log("Project started!")});