const webpush = require('../helpers/WebPush');
/*const webpush = require('web-push');

const vapidKeys = {
    "publicKey":process.env.PUBLICKEY,
    "privateKey":process.env.PRIVATEKEY
}

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey,
)
*/
class NotificationController{

    static sendNotification = async (req,res)=>{
        const data = req.body;
  
        const pushSubscription = {
            endpoint: data.endpoint,
            keys:{
                auth: data.keys.auth,
                p256dh: data.keys.p256dh
            }
        };

        const payload = {
            "notification": {
                "title": "😄😄 Seline Decoraciones",
                "body": "Seline Decoraciones",
                "vibrate": [100, 50, 100],
                "image": "https://scontent.fscl26-1.fna.fbcdn.net/v/t1.6435-9/123024487_208181027358951_1015551633780703521_n.jpg?_nc_cat=107&ccb=1-3&_nc_sid=e3f864&_nc_ohc=TxvJftad308AX9oJeWz&_nc_ht=scontent.fscl26-1.fna&oh=be47ea0666e305d7649af1292f64b0a5&oe=612E61C7",
                "actions": [{
                    "action": "explore",
                    "title": "Ir a orden"
                }]
            }
        }

        webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload))
            .then(res => {
                console.log('Enviado !!');
            }).catch(err => {
                console.log('Error', err);
            })

        res.send({ data: 'Se envio subscribete!!' })

    }

}

module.exports = NotificationController;